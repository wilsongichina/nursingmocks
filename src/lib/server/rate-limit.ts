import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";

export class RateLimitError extends Error {
  constructor(message = "Too many requests. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function rateLimitId(scope: string, key: string) {
  return createHash("sha256").update(`${scope}:${key}`).digest("hex");
}

export async function checkFirestoreRateLimit(input: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const ref = getAdminDb()
    .collection("emailRateLimits")
    .doc(rateLimitId(input.scope, input.key));

  await getAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists
      ? snapshot.data() as { count?: number; windowStartMs?: number }
      : {};
    const windowStartMs = typeof existing.windowStartMs === "number" ? existing.windowStartMs : 0;
    const count = typeof existing.count === "number" ? existing.count : 0;
    const expired = !snapshot.exists || now - windowStartMs >= input.windowMs;

    if (!expired && count >= input.limit) {
      throw new RateLimitError();
    }

    transaction.set(ref, {
      scope: input.scope,
      count: expired ? 1 : count + 1,
      windowStartMs: expired ? now : windowStartMs,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
}
