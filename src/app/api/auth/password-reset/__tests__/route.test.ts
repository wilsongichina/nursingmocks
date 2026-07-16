import { describe, expect, it, vi, beforeEach } from "vitest";

const createdJobs: unknown[] = [];
let generatedLink =
  "https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=reset-code-123&apiKey=test";
let shouldThrowUserNotFound = false;

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminAuth: () => ({
    generatePasswordResetLink: vi.fn(async () => {
      if (shouldThrowUserNotFound) {
        const error = new Error("No user") as Error & { code?: string };
        error.code = "auth/user-not-found";
        throw error;
      }
      return generatedLink;
    }),
  }),
  getAdminDb: () => ({}),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  RateLimitError: class RateLimitError extends Error {},
  checkFirestoreRateLimit: vi.fn(async () => undefined),
}));

vi.mock("@/lib/email/jobs", () => ({
  createPasswordResetEmailJob: vi.fn(async (input) => {
    createdJobs.push(input);
    return { jobId: "job-123", created: true };
  }),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => ({ sent: 1 })),
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

import { POST } from "@/app/api/auth/password-reset/route";

describe("password reset email route", () => {
  beforeEach(() => {
    createdJobs.length = 0;
    shouldThrowUserNotFound = false;
    generatedLink =
      "https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=reset-code-123&apiKey=test";
  });

  it("queues a NursingMocks password reset email using the Firebase action code", async () => {
    const request = new Request("http://localhost/api/auth/password-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "Ada@Example.com" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(createdJobs[0]).toMatchObject({
      email: "ada@example.com",
      resetUrl: "https://nursingmocks.com/reset-password?mode=resetPassword&oobCode=reset-code-123",
    });
  });

  it("returns generic success without queueing email when the account does not exist", async () => {
    shouldThrowUserNotFound = true;
    const request = new Request("http://localhost/api/auth/password-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "missing@example.com" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(createdJobs).toHaveLength(0);
  });
});
