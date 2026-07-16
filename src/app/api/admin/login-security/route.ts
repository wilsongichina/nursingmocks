import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { getAdminLoginSecurity, listLoginSecurityOverview } from "@/lib/admin/login-security";
import { getAdminAuth, getAdminDb, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

function searchValue(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  return {
    query,
    uid: searchParams.get("uid")?.trim() || query,
    email: searchParams.get("email")?.trim() || "",
    suggest: searchParams.get("suggest") === "1",
    overview: searchParams.get("overview") === "1",
  };
}

type UserMatch = {
  uid: string;
  email: string | null;
  displayName: string | null;
  fullName: string | null;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function lower(value: string | null) {
  return value?.toLowerCase() ?? "";
}

async function findUserMatches(query: string): Promise<UserMatch[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const auth = getAdminAuth();
  const db = getAdminDb();
  const matches = new Map<string, UserMatch>();

  const addMatch = (match: UserMatch) => {
    matches.set(match.uid, match);
  };

  const authPage = await auth.listUsers(1000);
  authPage.users.forEach((user) => {
    const values = [user.displayName ?? null, user.email ?? null, user.uid];
    if (values.some((value) => lower(value).includes(needle))) {
      addMatch({
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        fullName: null,
      });
    }
  });

  // Name search is intentionally limited until a normalized name-search field is added.
  const userDocs = await db.collection("users").limit(300).get();
  userDocs.docs.forEach((doc) => {
    const data = doc.data();
    const profile = data.profile && typeof data.profile === "object" && !Array.isArray(data.profile)
      ? data.profile as Record<string, unknown>
      : {};
    const fullName = text(data.full_name);
    const displayName = text(profile.display_name);
    const email = text(data.email);
    const values = [fullName, displayName, email, doc.id];

    if (values.some((value) => lower(value).includes(needle))) {
      const existing = matches.get(doc.id);
      addMatch({
        uid: doc.id,
        email: existing?.email ?? email,
        displayName: existing?.displayName ?? displayName,
        fullName,
      });
    }
  });

  return Array.from(matches.values())
    .sort((first, second) => (first.displayName || first.fullName || first.email || first.uid).localeCompare(second.displayName || second.fullName || second.email || second.uid))
    .slice(0, 10);
}

export async function GET(request: NextRequest) {
  const requestId = createAdminAuditRequestId("login_security");

  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { query, uid, email, suggest, overview } = searchValue(request);

    if (overview) {
      const users = await listLoginSecurityOverview();
      await writeAdminAuditLog({
        action: "user.login_security.overview",
        actor: decoded,
        requestId,
        after: {
          flaggedUsers: users.length,
        },
        reason: "Viewed admin login security overview",
        ...readRequestMetadata(request.headers),
      });
      return NextResponse.json({ requestId, users });
    }

    if (!uid && !email && !query) {
      return NextResponse.json({ error: "Enter a user name, UID, or exact email address.", requestId }, { status: 400 });
    }

    if (suggest) {
      const matches = await findUserMatches(query || email || uid);
      return NextResponse.json({ requestId, matches });
    }

    const auth = getAdminAuth();
    let targetUser;

    if (email || uid.includes("@")) {
      targetUser = await auth.getUserByEmail(email || uid);
    } else {
      try {
        targetUser = await auth.getUser(uid);
      } catch {
        const matches = await findUserMatches(query || uid);
        if (matches.length === 0) {
          return NextResponse.json({ error: "No users matched that name, UID, or email.", requestId }, { status: 404 });
        }
        if (matches.length > 1) {
          return NextResponse.json({ requestId, matches });
        }
        targetUser = await auth.getUser(matches[0].uid);
      }
    }

    const loginSecurity = await getAdminLoginSecurity(targetUser.uid);

    await writeAdminAuditLog({
      action: "user.login_security.view",
      actor: decoded,
      targetUid: targetUser.uid,
      targetEmail: targetUser.email ?? null,
      requestId,
      after: {
        eventsReviewed: loginSecurity.summary.totalEventsReviewed,
        uniqueIpHashes: loginSecurity.summary.uniqueIpHashes,
        uniqueDevices: loginSecurity.summary.uniqueDevices,
        uniqueLocations: loginSecurity.summary.uniqueLocations,
        sharingSignalStatus: loginSecurity.sharingSignals.status,
        uniqueIpHashes30d: loginSecurity.sharingSignals.uniqueIpHashes30d,
        uniqueDevices30d: loginSecurity.sharingSignals.uniqueDevices30d,
        uniqueCountries30d: loginSecurity.sharingSignals.uniqueCountries30d,
      },
      reason: "Viewed admin login security activity",
      ...readRequestMetadata(request.headers),
    });

    return NextResponse.json({
      requestId,
      targetUser: {
        uid: targetUser.uid,
        email: targetUser.email ?? null,
        displayName: targetUser.displayName ?? null,
        disabled: targetUser.disabled,
        emailVerified: targetUser.emailVerified,
      },
      loginSecurity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load login security activity";
    console.error("Admin login security failed", { requestId, message });
    return NextResponse.json({ error: message, requestId }, { status: 400 });
  }
}
