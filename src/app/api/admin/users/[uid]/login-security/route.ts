import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { getAdminLoginSecurity } from "@/lib/admin/login-security";
import { getAdminAuth, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const requestId = createAdminAuditRequestId("user_login_security");

  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { uid } = await context.params;

    if (!uid || uid.length > 128) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const targetUser = await getAdminAuth().getUser(uid);
    const loginSecurity = await getAdminLoginSecurity(uid);

    await writeAdminAuditLog({
      action: "user.login_security.view",
      actor: decoded,
      targetUid: uid,
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
      reason: "Viewed admin user login security activity",
      ...readRequestMetadata(request.headers),
    });

    return NextResponse.json({ loginSecurity });
  } catch (error) {
    console.error("Admin user login security failed", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load login activity", requestId }, { status: 403 });
  }
}
