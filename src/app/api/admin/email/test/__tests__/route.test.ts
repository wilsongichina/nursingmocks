import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/firebase-admin", () => ({
  requireAdminFromAuthorizationHeader: vi.fn(async () => {
    throw new Error("Admin claim required");
  }),
}));

vi.mock("@/lib/email/jobs", () => ({
  createEmailJob: vi.fn(),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkFirestoreRateLimit: vi.fn(),
}));

import { POST } from "@/app/api/admin/email/test/route";

describe("admin test email route", () => {
  it("rejects non-admin callers", async () => {
    const request = new Request("http://localhost/api/admin/email/test", {
      method: "POST",
      headers: { authorization: "Bearer user-token" },
      body: JSON.stringify({ templateId: "welcome", to: "ada@example.com", data: { name: "Ada" } }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });
});
