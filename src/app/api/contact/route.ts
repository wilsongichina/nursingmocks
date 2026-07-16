import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createContactEmailJobs } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { getEmailConfig } from "@/lib/email/config";
import { assertValidEmailAddress, sanitizeLongText, sanitizeText } from "@/lib/email/validation";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { checkFirestoreRateLimit, RateLimitError } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type ContactEmailDeliveryState = "sent" | "queued" | "needs_attention";

interface ContactRequestData {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  budget?: unknown;
  services?: unknown;
  topic?: unknown;
  urgency?: unknown;
  message?: unknown;
}

function clientIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

function fieldToString(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function processContactEmailJobs() {
  try {
    const result = await processDueEmailJobs({ limit: 10 });
    if (result.sent >= 2) {
      return {
        delivery: "sent" as ContactEmailDeliveryState,
        message: "Message sent. We emailed you a confirmation and notified support.",
      };
    }
    if (result.failed > 0 || result.deliveryUncertain > 0) {
      return {
        delivery: "needs_attention" as ContactEmailDeliveryState,
        message: "Message saved. Email delivery needs support review, but your request was recorded.",
      };
    }

    return {
      delivery: "queued" as ContactEmailDeliveryState,
      message: "Message saved. Email delivery has been queued for processing.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email processing error";
    console.error("Contact email processing did not complete:", { message });

    return {
      delivery: "queued" as ContactEmailDeliveryState,
      message: "Message saved. Email delivery has been queued for processing.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let formData: ContactRequestData;

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
      };
    } else {
      formData = (await request.json()) as ContactRequestData;
    }

    const name = sanitizeText(fieldToString(formData.name), 120);
    const email = sanitizeText(fieldToString(formData.email), 254).toLowerCase();
    const phone = sanitizeText(fieldToString(formData.phone), 40);
    const budget = sanitizeText(fieldToString(formData.budget), 80);
    const services = sanitizeText(fieldToString(formData.services), 120);
    const topic = sanitizeText(fieldToString(formData.topic), 120);
    const urgency = sanitizeText(fieldToString(formData.urgency), 120);
    const message = sanitizeLongText(fieldToString(formData.message), 4000);

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

    const submission: Record<string, unknown> = {
      name,
      email,
      services: services || topic || "General Inquiry",
      message,
      createdAt: FieldValue.serverTimestamp(),
      source: "contact_form",
    };

    // Firestore rejects undefined values, so optional contact fields are added
    // only when the user actually supplied them.
    if (phone) submission.phone = phone;
    if (budget) submission.budget = budget;
    if (topic) submission.topic = topic;
    if (urgency) submission.urgency = urgency;

    const submissionRef = await getAdminDb().collection("contactSubmissions").add(submission);

    await createContactEmailJobs({
      submissionId: submissionRef.id,
      name,
      email,
      topic,
      urgency,
      message,
      internalRecipient: config.supportEmail,
    });

    const emailResult = await processContactEmailJobs();

    return NextResponse.json({
      success: true,
      submissionId: submissionRef.id,
      emailDelivery: emailResult.delivery,
      message: emailResult.message,
    }, { status: emailResult.delivery === "sent" ? 200 : 202 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Error handling contact form:", {
      message,
    });

    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (message.includes("email") || message.includes("required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not process contact request" }, { status: 500 });
  }
}
