export const CHECKOUT_SESSION_FORBIDDEN_CLIENT_FIELDS = [
  "amount",
  "currency",
  "packageIds",
  "providerPriceId",
  "providerPriceMappingId",
  "externalPriceId",
  "externalPlanId",
  "providerCustomerId",
  "entitlements",
  "metadata",
] as const;

export type CheckoutSessionDraftInput = {
  planId: string;
  gatewayId: string | null;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string | null;
};

export type CheckoutSessionDraftValidation =
  | { valid: true; input: CheckoutSessionDraftInput }
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

export function validateCheckoutSessionDraftRequest(body: Record<string, unknown>): CheckoutSessionDraftValidation {
  const issues: string[] = [];
  const forbiddenField = CHECKOUT_SESSION_FORBIDDEN_CLIENT_FIELDS.find((field) => field in body);
  const planId = text(body.planId);
  const gatewayId = text(body.gatewayId) || null;
  const successUrl = text(body.successUrl);
  const cancelUrl = text(body.cancelUrl);
  const customerEmail = text(body.customerEmail) || null;

  if (forbiddenField) {
    issues.push(`${forbiddenField} cannot be supplied by the client for checkout.`);
  }
  if (!planId) issues.push("Plan ID is required.");
  if (!successUrl || !isSafeHttpUrl(successUrl)) issues.push("A valid success URL is required.");
  if (!cancelUrl || !isSafeHttpUrl(cancelUrl)) issues.push("A valid cancel URL is required.");

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    input: {
      planId,
      gatewayId,
      successUrl,
      cancelUrl,
      customerEmail,
    },
  };
}
