import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { getAdminAuth, getAdminDb, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

function displayNameFromBody(value: unknown) {
  const displayName = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (displayName.length < 2) {
    throw new Error("Display name must be at least 2 characters.");
  }
  if (displayName.length > 80) {
    throw new Error("Display name must be 80 characters or fewer.");
  }
  if (!/^[a-zA-Z0-9\s'.-]+$/.test(displayName)) {
    throw new Error("Display name can only include letters, numbers, spaces, apostrophes, periods, and hyphens.");
  }
  return displayName;
}

export async function PATCH(request: NextRequest) {
  const requestId = createAdminAuditRequestId("admin_profile");
  const metadata = readRequestMetadata(request.headers);
  let decoded: Awaited<ReturnType<typeof requireAdminFromAuthorizationHeader>> | null = null;

  try {
    decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json().catch(() => ({}));
    const displayName = displayNameFromBody(body?.displayName);
    const auth = getAdminAuth();
    const db = getAdminDb();
    const beforeUser = await auth.getUser(decoded.uid);

    if ((beforeUser.displayName || "") === displayName) {
      return NextResponse.json({
        success: true,
        requestId,
        user: {
          uid: beforeUser.uid,
          email: beforeUser.email ?? null,
          displayName: beforeUser.displayName ?? null,
        },
      });
    }

    const afterUser = await auth.updateUser(decoded.uid, { displayName });
    await db.collection("users").doc(decoded.uid).set(
      {
        full_name: displayName,
        profile: {
          display_name: displayName,
        },
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await writeAdminAuditLog({
      action: "user.profile.update",
      actor: decoded,
      targetUid: decoded.uid,
      targetEmail: beforeUser.email ?? decoded.email ?? null,
      requestId,
      before: {
        displayName: beforeUser.displayName ?? null,
      },
      after: {
        displayName: afterUser.displayName ?? null,
      },
      reason: "Admin updated own display name",
      ...metadata,
    });

    return NextResponse.json({
      success: true,
      requestId,
      user: {
        uid: afterUser.uid,
        email: afterUser.email ?? null,
        displayName: afterUser.displayName ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update admin profile";
    if (decoded) {
      await writeAdminAuditLog({
        action: "user.profile.update",
        actor: decoded,
        targetUid: decoded.uid,
        targetEmail: decoded.email ?? null,
        requestId,
        status: "failure",
        errorMessage: message,
        reason: "Admin profile update failed",
        ...metadata,
      }).catch(() => undefined);
    }

    console.error("Admin profile update failed", { requestId, message });
    return NextResponse.json({ error: message, requestId }, { status: 400 });
  }
}
