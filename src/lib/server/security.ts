import { createHash, timingSafeEqual } from "crypto";

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

export function constantTimeEqual(a: string, b: string) {
  const aHash = hash(a);
  const bHash = hash(b);
  return timingSafeEqual(aHash, bHash);
}

export function bearerToken(authorization: string | null) {
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
}
