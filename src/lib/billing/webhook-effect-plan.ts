import type { BillingWebhookEventType } from "@/lib/billing/webhook-events";

export const BILLING_WEBHOOK_EFFECTS = [
  "record_transaction",
  "create_or_update_subscription",
  "mark_invoice_paid",
  "mark_invoice_failed",
  "grant_entitlements",
  "revoke_or_expire_entitlements",
  "record_refund",
  "record_dispute",
] as const;

export type BillingWebhookEffect = (typeof BILLING_WEBHOOK_EFFECTS)[number];

export function isBillingWebhookEffect(value: string): value is BillingWebhookEffect {
  return (BILLING_WEBHOOK_EFFECTS as readonly string[]).includes(value);
}

export type BillingWebhookEffectPlan = {
  effectsEnabled: false;
  effects: BillingWebhookEffect[];
  message: string;
};

const EFFECTS_BY_EVENT_TYPE: Record<BillingWebhookEventType, BillingWebhookEffect[]> = {
  checkout_completed: ["record_transaction", "grant_entitlements"],
  subscription_created: ["create_or_update_subscription", "grant_entitlements"],
  subscription_updated: ["create_or_update_subscription"],
  subscription_cancelled: ["create_or_update_subscription", "revoke_or_expire_entitlements"],
  invoice_paid: ["mark_invoice_paid", "grant_entitlements"],
  invoice_payment_failed: ["mark_invoice_failed"],
  charge_refunded: ["record_refund"],
  dispute_created: ["record_dispute"],
};

export function planBillingWebhookEffects(eventType: BillingWebhookEventType | null): BillingWebhookEffectPlan {
  if (!eventType) {
    return {
      effectsEnabled: false,
      effects: [],
      message: "No billing effects are planned because the webhook event type is unsupported or unavailable.",
    };
  }

  return {
    effectsEnabled: false,
    effects: EFFECTS_BY_EVENT_TYPE[eventType],
    message: `Billing effects for ${eventType} are planned but disabled until webhook processing is explicitly enabled.`,
  };
}
