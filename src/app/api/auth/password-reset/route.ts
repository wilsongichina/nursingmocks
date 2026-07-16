import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEmailConfig } from "@/lib/email/config";
import { createPasswordResetEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { assertValidEmailAddress, sanitizeText } from "@/lib/email/validation";
import { getAdminAuth } from "@/lib/server/firebase-admin";
import { checkFirestoreRateLimit, RateLimitError } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

function clientIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

function genericSuccess() {
  return NextResponse.json({
    success: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  });
}

function extractActionCode(actionLink: string) {
  const queue = [actionLink];

  while (queue.length) {
    const candidate = queue.shift();
    if (!candidate) continue;

    try {
      const url = new URL(candidate);
      const code = url.searchParams.get("oobCode");
      if (code) return code;

      const nestedLink = url.searchParams.get("link");
      const continueUrl = url.searchParams.get("continueUrl");
      if (nestedLink) queue.push(nestedLink);
      if (continueUrl) queue.push(continueUrl);
    } catch {
      // Ignore malformed nested parameters and continue looking for a valid code.
    }
  }

  throw new Error("Password reset action link did not contain an action code");
}

function appResetLink(actionLink: string, siteUrl: string) {
  const code = extractActionCode(actionLink);
  const resetUrl = new URL("/reset-password", siteUrl);
  resetUrl.searchParams.set("mode", "resetPassword");
  resetUrl.searchParams.set("oobCode", code);
  return resetUrl.toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = sanitizeText(body?.email, 254).toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    assertValidEmailAddress(email);

    await checkFirestoreRateLimit({
      scope: "password_reset",
      key: `${email}:${clientIp(request)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const config = getEmailConfig();
    const continueUrl = new URL("/reset-password", config.siteUrl).toString();

    try {
      const actionLink = await getAdminAuth().generatePasswordResetLink(email, {
        url: continueUrl,
        handleCodeInApp: false,
      });
      const resetUrl = appResetLink(actionLink, config.siteUrl);

      await createPasswordResetEmailJob({
        email,
        resetUrl,
        requestId: randomUUID(),
      });

      await processDueEmailJobs({ limit: 3 });
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };
      if (authError.code !== "auth/user-not-found") {
        throw error;
      }
      // Do not reveal whether an account exists for the submitted email address.
    }

    return genericSuccess();
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Password reset email request failed", { message });

    if (message.includes("email")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not process password reset request" }, { status: 500 });
  }
}
