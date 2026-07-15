import { describe, expect, it, vi } from "vitest";

const store = new Map<string, Record<string, unknown>>();
const transactionCreates: string[] = [];
const transactionUpdates: Array<{ id: string; patch: Record<string, unknown> }> = [];

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: (id: string) => ({ id }),
    }),
    runTransaction: async (callback: any) =>
      callback({
        get: async (ref: { id: string }) => ({
          exists: store.has(ref.id),
          data: () => store.get(ref.id),
        }),
        create: (ref: { id: string }, data: Record<string, unknown>) => {
          transactionCreates.push(ref.id);
          store.set(ref.id, data);
        },
        update: (ref: { id: string }, patch: Record<string, unknown>) => {
          transactionUpdates.push({ id: ref.id, patch });
          store.set(ref.id, { ...(store.get(ref.id) || {}), ...patch });
        },
      }),
  }),
}));

import { Timestamp } from "firebase-admin/firestore";
import { createEmailJob } from "@/lib/email/jobs";
import { createEmailJobId } from "@/lib/email/idempotency";
import { claimEmailJob } from "@/lib/email/worker";

describe("email jobs", () => {
  it("prevents duplicate jobs with deterministic document ids", async () => {
    store.clear();
    transactionCreates.length = 0;
    const input = {
      templateId: "welcome" as const,
      to: "ada@example.com",
      data: { name: "Ada" },
      idempotencyKey: "welcome:user-123",
    };

    const first = await createEmailJob(input);
    const second = await createEmailJob(input);

    expect(first).toEqual({ jobId: createEmailJobId("welcome:user-123"), created: true });
    expect(second).toEqual({ jobId: createEmailJobId("welcome:user-123"), created: false });
    expect(transactionCreates).toHaveLength(1);
  });

  it("claims a job whose processing lease has expired", async () => {
    store.clear();
    transactionUpdates.length = 0;
    const id = "expired-processing-job";
    store.set(id, {
      templateId: "welcome",
      to: "ada@example.com",
      data: { name: "Ada" },
      status: "processing",
      attempts: 1,
      maxAttempts: 5,
      idempotencyKey: "welcome:user-123",
      jobId: id,
      processingLeaseExpiresAt: Timestamp.fromMillis(Date.now() - 1000),
    });

    const claimed = await claimEmailJob(id);

    expect(claimed?.attempts).toBe(2);
    expect(transactionUpdates[0].patch).toMatchObject({
      status: "processing",
    });
  });
});
