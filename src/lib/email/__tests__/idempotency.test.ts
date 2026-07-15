import { describe, expect, it } from "vitest";
import { createEmailJobId } from "@/lib/email/idempotency";

describe("createEmailJobId", () => {
  it("creates deterministic SHA-256 ids without exposing recipient emails", () => {
    const key = "welcome:user-123";
    const first = createEmailJobId(key);
    const second = createEmailJobId(key);

    expect(first).toBe(second);
    expect(first).toHaveLength(64);
    expect(first).not.toContain("user-123");
  });
});
