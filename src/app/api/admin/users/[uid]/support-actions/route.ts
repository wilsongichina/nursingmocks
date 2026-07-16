import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { getEmailConfig } from "@/lib/email/config";
import { createEmailVerificationJob, createPasswordResetEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { getAdminAuth, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

type SupportAction = "send_password_reset" | "send_email_verification";

function actionFromBody(value: unknown): SupportAction {
  if (value === "send_password_reset" || value === "send_email_verification") return value;
  throw new Error("Unsupported support action");
}

function extractActionCode(actionLink: string, mode: "resetPassword" | "verifyEmail") {
  const queue = [actionLink];

  while (queue.length) {
    const candidate = queue.shift();
    if (!candidate) continue;

    try {
      const url = new URL(candidate);
      const code = url.searchParams.get("oobCode");
      const linkMode = url.searchParams.get("mode");
      if (code && (!linkMode || linkMode === mode)) return code;

      const nestedLink = url.searchParams.get("link");
      const continueUrl = url.searchParams.get("continueUrl");
      if (nestedLink) queue.push(nestedLink);
      if (continueUrl) queue.push(continueUrl);
    } catch {
      // Ignore malformed nested URLs while looking for the Firebase action code.
    }
  }

  throw new Error("Firebase action link did not contain an action code");
}

function appResetLink(actionLink: string, siteUrl: string) {
  const resetUrl = new URL("/reset-password", siteUrl);
  resetUrl.searchParams.set("mode", "resetPassword");
  resetUrl.searchParams.set("oobCode", extractActionCode(actionLink, "resetPassword"));
  return resetUrl.toString();
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  const requestId = createAdminAuditRequestId("user_support");
  const metadata = readRequestMetadata(request.headers);
  let decoded: Awaited<ReturnType<typeof requireAdminFromAuthorizationHeader>> | null = null;
  let targetUid: string | null = null;
  let targetEmail: string | null = null;
  let auditAction = "user.support_action.unknown";

  try {
    decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { uid } = await context.params;
    targetUid = uid;

    if (!uid || uid.length > 128) {
      throw new Error("Invalid user ID");
    }

    const body = await request.json().catch(() => ({}));
    const supportAction = actionFromBody(body?.action);
    const auth = getAdminAuth();
    const targetUser = await auth.getUser(uid);
    targetEmail = targetUser.email ?? null;

    if (!targetEmail) {
      throw new Error("Target user does not have an email address");
    }

    const config = getEmailConfig();

    if (supportAction === "send_password_reset") {
      auditAction = "user.password_reset.send";
      const continueUrl = new URL("/reset-password", config.siteUrl).toString();
      const actionLink = await auth.generatePasswordResetLink(targetEmail, {
        url: continueUrl,
        handleCodeInApp: false,
      });
      await createPasswordResetEmailJob({
        email: targetEmail,
        resetUrl: appResetLink(actionLink, config.siteUrl),
        requestId,
      });
    }

    if (supportAction === "send_email_verification") {
      auditAction = "user.email_verification.send";
      if (targetUser.emailVerified) {
        throw new Error("Target user email is already verified");
      }
      const actionLink = await auth.generateEmailVerificationLink(targetEmail, {
        url: new URL("/login", config.siteUrl).toString(),
        handleCodeInApp: false,
      });
      await createEmailVerificationJob({
        email: targetEmail,
        verificationUrl: actionLink,
        requestId,
      });
    }

    await processDueEmailJobs({ limit: 3 });

    await writeAdminAuditLog({
      action: auditAction,
      actor: decoded,
      targetUid,
      targetEmail,
      requestId,
      after: {
        emailVerified: targetUser.emailVerified,
        disabled: targetUser.disabled,
        emailQueued: true,
      },
      reason: "Admin support email action",
      ...metadata,
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not run support action";
    if (decoded) {
      await writeAdminAuditLog({
        action: auditAction,
        actor: decoded,
        targetUid,
        targetEmail,
        requestId,
        status: "failure",
        errorMessage: message,
        reason: "Admin support email action failed",
        ...metadata,
      }).catch(() => undefined);
    }

    console.error("Admin user support action failed", { requestId, message });
    return NextResponse.json({ error: message, requestId }, { status: 400 });
  }
}
