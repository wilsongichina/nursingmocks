import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => ({
    scanned: 1,
    claimed: 1,
    sent: 1,
    retrying: 0,
    failed: 0,
    deliveryUncertain: 0,
  })),
}));

import { POST } from "@/app/api/internal/email/process-jobs/route";

describe("email worker route", () => {
  it("rejects missing worker secret", async () => {
    process.env.EMAIL_WORKER_SECRET = "secret";
    const request = new Request("http://localhost/api/internal/email/process-jobs", {
      method: "POST",
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  it("returns safe aggregate counts", async () => {
    process.env.EMAIL_WORKER_SECRET = "secret";
    const request = new Request("http://localhost/api/internal/email/process-jobs", {
      method: "POST",
      headers: { authorization: "Bearer secret" },
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      scanned: 1,
      claimed: 1,
      sent: 1,
      retrying: 0,
      failed: 0,
      deliveryUncertain: 0,
    });
  });
});
