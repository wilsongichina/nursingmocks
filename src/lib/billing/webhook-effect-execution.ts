import type { BillingWebhookEffect } from "@/lib/billing/webhook-effect-plan";

export type BillingWebhookWriteTarget =
  | "billing_transactions"
  | "billing_subscriptions"
  | "billing_entitlements"
  | "user_billing_summary"
  | "billing_audit_logs";

export type BillingWebhookEffectExecutionInput = {
  effectsEnabled: boolean;
  plannedEffects: BillingWebhookEffect[];
  normalizedEventType: string | null;
  providerEventId: string | null;
};

export type BillingWebhookEffectExecutionResult = {
  executed: boolean;
  status: "disabled" | "not_implemented" | "ready";
  writeTargets: BillingWebhookWriteTarget[];
  message: string;
};

const WRITE_TARGETS_BY_EFFECT: Record<BillingWebhookEffect, BillingWebhookWriteTarget[]> = {
  record_transaction: ["billing_transactions", "billing_audit_logs"],
  create_or_update_subscription: ["billing_subscriptions", "user_billing_summary", "billing_audit_logs"],
  mark_invoice_paid: ["billing_transactions", "billing_audit_logs"],
  mark_invoice_failed: ["billing_transactions", "user_billing_summary", "billing_audit_logs"],
  grant_entitlements: ["billing_entitlements", "user_billing_summary", "billing_audit_logs"],
  revoke_or_expire_entitlements: ["billing_entitlements", "user_billing_summary", "billing_audit_logs"],
  record_refund: ["billing_transactions", "billing_audit_logs"],
  record_dispute: ["billing_transactions", "billing_audit_logs"],
};

export function getBillingWebhookWriteTargets(effects: BillingWebhookEffect[]) {
  return Array.from(new Set(effects.flatMap((effect) => WRITE_TARGETS_BY_EFFECT[effect] ?? [])));
}

export function executePlannedBillingWebhookEffects(
  input: BillingWebhookEffectExecutionInput
): BillingWebhookEffectExecutionResult {
  const writeTargets = getBillingWebhookWriteTargets(input.plannedEffects);

  if (!input.effectsEnabled) {
    return {
      executed: false,
      status: "disabled",
      writeTargets,
      message: "Billing webhook effects are disabled. No billing state was written.",
    };
  }

  return {
    executed: false,
    status: "not_implemented",
    writeTargets,
    message:
      "Billing webhook effect writers are defined but not enabled for execution until controlled processing approval.",
  };
}
