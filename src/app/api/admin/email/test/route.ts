import { NextRequest, NextResponse } from "next/server";
import { createEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { isEmailTemplateId } from "@/lib/email/template-registry";
import { assertValidEmailAddress } from "@/lib/email/validation";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import { checkFirestoreRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    await checkFirestoreRateLimit({
      scope: "admin_test_email",
      key: adminUser.uid,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    const body = await request.json();
    const templateId = body?.templateId;
    const to = typeof body?.to === "string" ? body.to.trim().toLowerCase() : "";
    const data = body?.data && typeof body.data === "object" ? body.data : {};

    if (!isEmailTemplateId(templateId)) {
      return NextResponse.json({ error: "Unsupported template" }, { status: 400 });
    }
    assertValidEmailAddress(to);

    const job = await createEmailJob({
      templateId,
      to,
      data: {
        ...data,
        __testEmail: true,
      },
      idempotencyKey: `test_email:${adminUser.uid}:${templateId}:${Date.now()}`,
      maxAttempts: 1,
    });

    await processDueEmailJobs({ limit: 3 });

    return NextResponse.json({ success: true, jobCreated: job.created });
  } catch (error) {
    console.error("Admin test email failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not create test email" }, { status: 400 });
  }
}
