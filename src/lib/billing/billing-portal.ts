export const BILLING_PORTAL_FORBIDDEN_CLIENT_FIELDS = [
  "uid",
  "providerCustomerId",
  "customerId",
  "subscriptionId",
  "provider",
  "environment",
  "gatewaySecret",
] as const;

export type BillingPortalSessionInput = {
  gatewayId: string | null;
  returnUrl: string;
};

export type BillingPortalSessionValidation =
  | { valid: true; input: BillingPortalSessionInput }
  | { valid: false; issues: string[] };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateBillingPortalSessionRequest(body: Record<string, unknown>): BillingPortalSessionValidation {
  const issues: string[] = [];
  const forbiddenField = BILLING_PORTAL_FORBIDDEN_CLIENT_FIELDS.find((field) => field in body);
  const gatewayId = text(body.gatewayId) || null;
  const returnUrl = text(body.returnUrl);

  if (forbiddenField) {
    issues.push(`${forbiddenField} cannot be supplied by the client for billing portal access.`);
  }
  if (!returnUrl || !isSafeHttpUrl(returnUrl)) {
    issues.push("A valid return URL is required.");
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true, input: { gatewayId, returnUrl } };
}
