import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { createEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { getAdminAuth, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

type AccountStatusAction = "disable_account" | "enable_account";

function actionFromBody(value: unknown): AccountStatusAction {
  if (value === "disable_account" || value === "enable_account") return value;
  throw new Error("Unsupported account status action");
}

function reasonFromBody(value: unknown) {
  const reason = typeof value === "string" ? value.trim() : "";
  if (reason.length < 10) {
    throw new Error("Reason must be at least 10 characters.");
  }
  if (reason.length > 500) {
    throw new Error("Reason must be 500 characters or fewer.");
  }
  return reason;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const requestId = createAdminAuditRequestId("user_account_status");
  const metadata = readRequestMetadata(request.headers);
  let decoded: Awaited<ReturnType<typeof requireAdminFromAuthorizationHeader>> | null = null;
  let targetUid: string | null = null;
  let targetEmail: string | null = null;
  let auditAction = "user.account_status.unknown";

  try {
    decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { uid } = await context.params;
    targetUid = uid;

    if (!uid || uid.length > 128) {
      throw new Error("Invalid user ID");
    }

    const body = await request.json().catch(() => ({}));
    const accountAction = actionFromBody(body?.action);
    const reason = reasonFromBody(body?.reason);

    if (accountAction === "disable_account" && uid === decoded.uid) {
      throw new Error("Admins cannot disable their own account.");
    }

    const auth = getAdminAuth();
    const beforeUser = await auth.getUser(uid);
    targetEmail = beforeUser.email ?? null;
    const nextDisabled = accountAction === "disable_account";
    auditAction = nextDisabled ? "user.account.disable" : "user.account.enable";

    if (beforeUser.disabled === nextDisabled) {
      throw new Error(nextDisabled ? "Target account is already disabled." : "Target account is already enabled.");
    }

    const afterUser = await auth.updateUser(uid, { disabled: nextDisabled });
    let emailQueued = false;
    let emailError: string | null = null;

    if (targetEmail) {
      const templateId = nextDisabled ? "account_disabled" : "account_enabled";
      try {
        await createEmailJob({
          templateId,
          to: targetEmail,
          data: { message: reason },
          idempotencyKey: `${templateId}:${requestId}`,
          maxAttempts: 3,
        });
        await processDueEmailJobs({ limit: 3 });
        emailQueued = true;
      } catch (queueError) {
        emailError = queueError instanceof Error ? queueError.message : "Could not queue account status email";
      }
    }

    await writeAdminAuditLog({
      action: auditAction,
      actor: decoded,
      targetUid: uid,
      targetEmail,
      requestId,
      before: {
        disabled: beforeUser.disabled,
        emailVerified: beforeUser.emailVerified,
        adminClaim: beforeUser.customClaims?.admin === true,
      },
      after: {
        disabled: afterUser.disabled,
        emailVerified: afterUser.emailVerified,
        adminClaim: afterUser.customClaims?.admin === true,
        emailQueued,
        emailError,
      },
      reason,
      ...metadata,
    });

    return NextResponse.json({ success: true, disabled: afterUser.disabled, emailQueued, emailError, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update account status";
    if (decoded) {
      await writeAdminAuditLog({
        action: auditAction,
        actor: decoded,
        targetUid,
        targetEmail,
        requestId,
        status: "failure",
        errorMessage: message,
        reason: "Admin account status action failed",
        ...metadata,
      }).catch(() => undefined);
    }

    console.error("Admin user account status action failed", { requestId, message });
    return NextResponse.json({ error: message, requestId }, { status: 400 });
  }
}
