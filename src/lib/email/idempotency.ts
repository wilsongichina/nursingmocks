import { createHash } from "crypto";

export function createEmailJobId(idempotencyKey: string) {
  return createHash("sha256").update(idempotencyKey).digest("hex");
}
