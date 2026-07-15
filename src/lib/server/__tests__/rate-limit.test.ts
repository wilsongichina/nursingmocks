import { describe, expect, it, vi } from "vitest";

let stored: Record<string, unknown> | null = null;
let saved: Record<string, unknown> | null = null;

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: (id: string) => ({ id }),
    }),
    runTransaction: async (callback: any) =>
      callback({
        get: async () => ({
          exists: stored !== null,
          data: () => stored,
        }),
        set: (_ref: unknown, data: Record<string, unknown>) => {
          saved = data;
          stored = data;
        },
      }),
  }),
}));

import { checkFirestoreRateLimit, RateLimitError } from "@/lib/server/rate-limit";

describe("Firestore-backed rate limit", () => {
  it("creates a shared rate-limit document without storing the raw key", async () => {
    stored = null;
    saved = null;

    await checkFirestoreRateLimit({
      scope: "contact_form",
      key: "ada@example.com:127.0.0.1",
      limit: 5,
      windowMs: 600_000,
    });

    expect(saved).toMatchObject({ scope: "contact_form", count: 1 });
    expect(JSON.stringify(saved)).not.toContain("ada@example.com");
  });

  it("rejects requests over the configured limit", async () => {
    stored = {
      scope: "contact_form",
      count: 5,
      windowStartMs: Date.now(),
    };

    await expect(checkFirestoreRateLimit({
      scope: "contact_form",
      key: "ada@example.com:127.0.0.1",
      limit: 5,
      windowMs: 600_000,
    })).rejects.toBeInstanceOf(RateLimitError);
  });
});
