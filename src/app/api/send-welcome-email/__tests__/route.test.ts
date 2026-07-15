import { describe, expect, it, vi } from "vitest";

const createdJobs: unknown[] = [];

vi.mock("@/lib/server/firebase-admin", () => ({
  verifyFirebaseIdToken: vi.fn(async () => ({
    uid: "user-123",
    email: "real@example.com",
    email_verified: true,
    name: "Real User",
  })),
}));

vi.mock("@/lib/email/jobs", () => ({
  createWelcomeEmailJob: vi.fn(async (input) => {
    createdJobs.push(input);
    return { jobId: "job-123", created: true };
  }),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => ({ sent: 1 })),
}));

import { POST } from "@/app/api/send-welcome-email/route";

describe("welcome email route", () => {
  it("derives recipient from verified Firebase token and ignores browser body", async () => {
    const request = new Request("http://localhost/api/send-welcome-email", {
      method: "POST",
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "attacker@example.com",
        name: "Attacker",
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(createdJobs[0]).toMatchObject({
      uid: "user-123",
      email: "real@example.com",
      name: "Real User",
    });
  });
});
