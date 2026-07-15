import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createContactEmailJobs } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { getEmailConfig } from "@/lib/email/config";
import { assertValidEmailAddress, sanitizeLongText, sanitizeText } from "@/lib/email/validation";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { checkFirestoreRateLimit, RateLimitError } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

function clientIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get("content-type") || "";
    let formData: any;

    if (contentType.includes("multipart/form-data")) {
      const formDataObj = await request.formData();
      formData = {
        name: formDataObj.get("name") as string,
        email: formDataObj.get("email") as string,
        phone: formDataObj.get("phone") as string || "",
        budget: formDataObj.get("budget") as string || "",
        services: formDataObj.get("services") as string || formDataObj.get("topic") as string || "",
        topic: formDataObj.get("topic") as string || "",
        urgency: formDataObj.get("urgency") as string || "",
        message: formDataObj.get("message") as string,
        attachment: formDataObj.get("attachment") as File | null,
      };
    } else {
      const body = await request.json();
      formData = body;
    }

    const name = sanitizeText(formData.name, 120);
    const email = sanitizeText(formData.email, 254).toLowerCase();
    const phone = sanitizeText(formData.phone, 40);
    const budget = sanitizeText(formData.budget, 80);
    const services = sanitizeText(formData.services, 120);
    const topic = sanitizeText(formData.topic, 120);
    const urgency = sanitizeText(formData.urgency, 120);
    const message = sanitizeLongText(formData.message, 4000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    assertValidEmailAddress(email);
    await checkFirestoreRateLimit({
      scope: "contact_form",
      key: `${email}:${clientIp(request)}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    const config = getEmailConfig();
    if (!config.supportEmail) {
      throw new Error("SUPPORT_EMAIL is not configured");
    }

    const submissionRef = await getAdminDb().collection("contactSubmissions").add({
      name,
      email,
      phone: phone || undefined,
      budget: budget || undefined,
      services: services || topic || "General Inquiry",
      topic: topic || undefined,
      urgency: urgency || undefined,
      message,
      createdAt: FieldValue.serverTimestamp(),
      source: "contact_form",
    });

    await createContactEmailJobs({
      submissionId: submissionRef.id,
      name,
      email,
      topic,
      urgency,
      message,
      internalRecipient: config.supportEmail,
    });

    await processDueEmailJobs({ limit: 5 });

    return NextResponse.json({ success: true, message: "Message received" }, { status: 200 });
  } catch (error: any) {
    console.error("Error handling contact form:", {
      message: error?.message || "Unknown error",
    });

    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error?.message?.includes("email") || error?.message?.includes("required")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not process contact request" }, { status: 500 });
  }
}
