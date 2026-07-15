import { beforeEach, describe, expect, it, vi } from "vitest";

const updates: Record<string, unknown>[] = [];

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        update: async (patch: Record<string, unknown>) => {
          updates.push(patch);
        },
      }),
    }),
  }),
}));

import { processClaimedEmailJob } from "@/lib/email/worker";
import type { EmailJob } from "@/lib/email/jobs";
import type { EmailProvider } from "@/lib/email/provider";

function job(overrides: Partial<EmailJob> = {}): EmailJob {
  return {
    templateId: "welcome",
    to: "ada@example.com",
    data: { name: "Ada" },
    status: "processing",
    attempts: 1,
    maxAttempts: 5,
    idempotencyKey: "welcome:user-123",
    jobId: "job-123",
    createdAt: {} as EmailJob["createdAt"],
    updatedAt: {} as EmailJob["updatedAt"],
    ...overrides,
  };
}

describe("email worker", () => {
  beforeEach(() => {
    updates.length = 0;
    process.env.RESEND_API_KEY = "test";
    process.env.EMAIL_FROM = "NursingMocks <notifications@nursingmocks.com>";
    process.env.EMAIL_REPLY_TO = "support@nursingmocks.com";
    process.env.SUPPORT_EMAIL = "support@nursingmocks.com";
  });

  it("marks successful provider response as sent", async () => {
    const provider: EmailProvider = {
      send: vi.fn(async () => ({ provider: "mock", messageId: "msg_123" })),
    };

    const status = await processClaimedEmailJob(job(), provider);

    expect(status).toBe("sent");
    expect(updates[0]).toMatchObject({
      status: "sent",
      provider: "mock",
      providerMessageId: "msg_123",
    });
  });

  it("retries temporary failures", async () => {
    const provider: EmailProvider = {
      send: vi.fn(async () => {
        throw new Error("temporary provider outage");
      }),
    };

    const status = await processClaimedEmailJob(job(), provider);

    expect(status).toBe("retrying");
    expect(updates[0]).toMatchObject({
      status: "retrying",
      lastErrorCategory: "temporary",
    });
  });

  it("marks maximum attempts as failed", async () => {
    const provider: EmailProvider = {
      send: vi.fn(async () => {
        throw new Error("temporary provider outage");
      }),
    };

    const status = await processClaimedEmailJob(job({ attempts: 5, maxAttempts: 5 }), provider);

    expect(status).toBe("failed");
    expect(updates[0]).toMatchObject({
      status: "failed",
    });
  });

  it("does not retry permanent validation failures", async () => {
    const provider: EmailProvider = {
      send: vi.fn(async () => ({ provider: "mock", messageId: "msg_123" })),
    };

    const status = await processClaimedEmailJob(
      job({ templateId: "contact_notification", data: { name: "Ada", email: "bad", message: "Hi" } }),
      provider
    );

    expect(status).toBe("failed");
    expect(updates[0]).toMatchObject({
      status: "failed",
      lastErrorCategory: "validation",
    });
  });

  it("marks ambiguous network outcomes as delivery_uncertain", async () => {
    const provider: EmailProvider = {
      send: vi.fn(async () => {
        throw new Error("network socket closed");
      }),
    };

    const status = await processClaimedEmailJob(job(), provider);

    expect(status).toBe("delivery_uncertain");
    expect(updates[0]).toMatchObject({
      status: "delivery_uncertain",
      lastErrorCategory: "delivery_uncertain",
    });
  });
});
