import type { BillingProvider } from "@/lib/billing/models";

export type WebhookIntakeValidation =
  | { valid: true; input: WebhookIntakeInput }
  | { valid: false; issues: string[] };

export type WebhookIntakeInput = {
  provider: BillingProvider;
  gatewayId: string;
  rawBody: string;
  signatureHeader: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isBillingProvider(value: string): value is BillingProvider {
  return value === "stripe" || value === "paypal" || value === "authorize_net";
}

export function webhookEventDocumentId(provider: BillingProvider, providerEventId: string) {
  return `${provider}_${providerEventId}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function validateWebhookIntakeRequest(input: {
  provider?: unknown;
  gatewayId?: unknown;
  rawBody?: unknown;
  signatureHeader?: unknown;
}): WebhookIntakeValidation {
  const issues: string[] = [];
  const provider = text(input.provider);
  const gatewayId = text(input.gatewayId);
  const rawBody = text(input.rawBody);
  const signatureHeader = text(input.signatureHeader);

  if (!provider || !isBillingProvider(provider)) issues.push("Webhook provider is not supported.");
  if (!gatewayId) issues.push("Gateway ID is required.");
  if (!rawBody) issues.push("Webhook body is required.");
  if (!signatureHeader) issues.push("Webhook signature is required.");

  if (issues.length > 0 || !isBillingProvider(provider)) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    input: {
      provider,
      gatewayId,
      rawBody,
      signatureHeader,
    },
  };
}
