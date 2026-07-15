const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function isValidEmailAddress(value: string) {
  return EMAIL_PATTERN.test(value) && !/[\r\n]/.test(value);
}

export function assertValidEmailAddress(value: string, label = "email") {
  if (!isValidEmailAddress(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

export function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\r|\n/g, " ").trim().slice(0, maxLength);
}

export function sanitizeLongText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

export function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  if (!local || !domain) return "invalid-email";
  return `${local.slice(0, 2)}***@${domain}`;
}
