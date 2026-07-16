import { beforeEach, describe, expect, it, vi } from "vitest";

const submissions: Record<string, unknown>[] = [];
const emailJobs: Record<string, unknown>[] = [];
let processResult = {
  scanned: 2,
  claimed: 2,
  sent: 2,
  retrying: 0,
  failed: 0,
  deliveryUncertain: 0,
};
let shouldThrowProcessing = false;

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: (name: string) => ({
      add: async (data: Record<string, unknown>) => {
        if (name === "contactSubmissions") {
          submissions.push(data);
        }
        return { id: "submission-123" };
      },
    }),
  }),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  RateLimitError: class RateLimitError extends Error {},
  checkFirestoreRateLimit: vi.fn(async () => undefined),
}));

vi.mock("@/lib/email/config", () => ({
  getEmailConfig: () => ({
    provider: "resend",
    from: "NursingMocks <notifications@nursingmocks.com>",
    replyTo: "support@nursingmocks.com",
    supportEmail: "support@nursingmocks.com",
    siteUrl: "https://nursingmocks.com",
    loginUrl: "https://nursingmocks.com/login",
  }),
}));

vi.mock("@/lib/email/jobs", () => ({
  createContactEmailJobs: vi.fn(async (input) => {
    emailJobs.push(input);
    return {
      acknowledgement: { jobId: "ack-123", created: true },
      notification: { jobId: "notice-123", created: true },
    };
  }),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => {
    if (shouldThrowProcessing) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    return processResult;
  }),
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: () => "server-timestamp",
  },
}));

import { POST } from "@/app/api/contact/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("contact route", () => {
  beforeEach(() => {
    submissions.length = 0;
    emailJobs.length = 0;
    shouldThrowProcessing = false;
    processResult = {
      scanned: 2,
      claimed: 2,
      sent: 2,
      retrying: 0,
      failed: 0,
      deliveryUncertain: 0,
    };
  });

  it("saves the support request and reports sent email delivery", async () => {
    const response = await POST(
      request({
        name: "Ada Lovelace",
        email: "ADA@Example.com",
        topic: "Exam Access",
        urgency: "I Have An Exam This Week",
        message: "My ATI TEAS exam is still locked after payment.",
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      submissionId: "submission-123",
      emailDelivery: "sent",
    });
    expect(submissions[0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      topic: "Exam Access",
      urgency: "I Have An Exam This Week",
      services: "Exam Access",
      message: "My ATI TEAS exam is still locked after payment.",
      source: "contact_form",
    });
    expect(emailJobs[0]).toMatchObject({
      submissionId: "submission-123",
      email: "ada@example.com",
      internalRecipient: "support@nursingmocks.com",
    });
  });

  it("does not write undefined optional fields to Firestore", async () => {
    const response = await POST(
      request({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Please help me understand which exam package I should use.",
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(Object.values(submissions[0])).not.toContain(undefined);
    expect(submissions[0]).not.toHaveProperty("phone");
    expect(submissions[0]).not.toHaveProperty("budget");
    expect(submissions[0]).not.toHaveProperty("topic");
    expect(submissions[0]).not.toHaveProperty("urgency");
  });

  it("still accepts the request when immediate email processing is not configured", async () => {
    shouldThrowProcessing = true;

    const response = await POST(
      request({
        name: "Ada Lovelace",
        email: "ada@example.com",
        topic: "Payment Or Billing",
        message: "My receipt did not arrive after I paid for access.",
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toMatchObject({
      success: true,
      emailDelivery: "queued",
    });
    expect(submissions).toHaveLength(1);
    expect(emailJobs).toHaveLength(1);
  });
});
