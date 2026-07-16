import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { getAdminUserDetail } from "@/lib/admin/users";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const requestId = createAdminAuditRequestId("user_detail");

  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { uid } = await context.params;

    if (!uid || uid.length > 128) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await getAdminUserDetail(uid);
    await writeAdminAuditLog({
      action: "user.detail.view",
      actor: decoded,
      targetUid: user.uid,
      targetEmail: user.email,
      requestId,
      after: {
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        adminClaim: user.adminClaim,
        accountStatus: user.firestoreProfile?.accountStatus ?? null,
        subscriptionStatus: user.firestoreProfile?.subscriptionStatus ?? null,
      },
      reason: "Viewed admin user detail",
      ...readRequestMetadata(request.headers),
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin user detail failed", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load user", requestId }, { status: 403 });
  }
}
