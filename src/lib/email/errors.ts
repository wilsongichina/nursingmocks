export type EmailErrorCategory =
  | "validation"
  | "configuration"
  | "provider_auth"
  | "rate_limit"
  | "temporary"
  | "permanent"
  | "delivery_uncertain"
  | "rendering";

export class EmailJobError extends Error {
  constructor(
    message: string,
    readonly category: EmailErrorCategory,
    readonly retryable: boolean
  ) {
    super(message);
  }
}

export function classifyEmailError(error: unknown): EmailJobError {
  const message = error instanceof Error ? error.message : "Unknown email error";
  const lower = message.toLowerCase();

  if (lower.includes("missing email configuration") || lower.includes("api_key")) {
    return new EmailJobError("Email provider is not configured", "configuration", false);
  }
  if (lower.includes("unauthorized") || lower.includes("forbidden") || lower.includes("authentication")) {
    return new EmailJobError("Email provider authentication failed", "provider_auth", false);
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return new EmailJobError("Email provider rate limit", "rate_limit", true);
  }
  if (lower.includes("network") || lower.includes("timeout") || lower.includes("socket")) {
    return new EmailJobError("Email delivery status is uncertain", "delivery_uncertain", false);
  }
  if (lower.includes("invalid")) {
    return new EmailJobError(message, "validation", false);
  }

  return new EmailJobError(message, "temporary", true);
}
