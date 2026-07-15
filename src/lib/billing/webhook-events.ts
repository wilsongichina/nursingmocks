export const BILLING_WEBHOOK_EVENT_TYPES = [
  "checkout_completed",
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "invoice_paid",
  "invoice_payment_failed",
  "charge_refunded",
  "dispute_created",
] as const;

export type BillingWebhookEventType = (typeof BILLING_WEBHOOK_EVENT_TYPES)[number];

export type BillingWebhookEventClassification = {
  supported: boolean;
  normalizedEventType: BillingWebhookEventType | null;
  providerEventType: string | null;
  message: string;
};

const STRIPE_EVENT_TYPE_MAP: Record<string, BillingWebhookEventType> = {
  "checkout.session.completed": "checkout_completed",
  "customer.subscription.created": "subscription_created",
  "customer.subscription.updated": "subscription_updated",
  "customer.subscription.deleted": "subscription_cancelled",
  "invoice.paid": "invoice_paid",
  "invoice.payment_failed": "invoice_payment_failed",
  "charge.refunded": "charge_refunded",
  "charge.dispute.created": "dispute_created",
};

export function classifyBillingWebhookEvent(
  provider: "stripe" | "paypal" | "authorize_net",
  providerEventType: string | null | undefined
): BillingWebhookEventClassification {
  const eventType = providerEventType?.trim() || null;

  if (!eventType) {
    return {
      supported: false,
      normalizedEventType: null,
      providerEventType: null,
      message: "Provider event type was not available.",
    };
  }

  if (provider !== "stripe") {
    return {
      supported: false,
      normalizedEventType: null,
      providerEventType: eventType,
      message: `${provider} webhook event normalization is not implemented yet.`,
    };
  }

  const normalizedEventType = STRIPE_EVENT_TYPE_MAP[eventType] ?? null;

  if (!normalizedEventType) {
    return {
      supported: false,
      normalizedEventType: null,
      providerEventType: eventType,
      message: `Stripe event type ${eventType} is recorded but not processed.`,
    };
  }

  return {
    supported: true,
    normalizedEventType,
    providerEventType: eventType,
    message: `Stripe event type ${eventType} was classified as ${normalizedEventType}.`,
  };
}
