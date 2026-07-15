import { describe, expect, it } from "vitest";
import { planBillingWebhookEffects } from "@/lib/billing/webhook-effect-plan";

describe("billing webhook effect planning", () => {
  it("plans checkout completion effects without enabling them", () => {
    expect(planBillingWebhookEffects("checkout_completed")).toEqual({
      effectsEnabled: false,
      effects: ["record_transaction", "grant_entitlements"],
      message:
        "Billing effects for checkout_completed are planned but disabled until webhook processing is explicitly enabled.",
    });
  });

  it("can enable planned effects for controlled test webhook processing", () => {
    expect(planBillingWebhookEffects("checkout_completed", { effectsEnabled: true })).toEqual({
      effectsEnabled: true,
      effects: ["record_transaction", "grant_entitlements"],
      message: "Billing effects for checkout_completed are enabled for verified test webhook processing.",
    });
  });

  it("plans subscription cancellation effects without enabling them", () => {
    expect(planBillingWebhookEffects("subscription_cancelled")).toEqual({
      effectsEnabled: false,
      effects: ["create_or_update_subscription", "revoke_or_expire_entitlements"],
      message:
        "Billing effects for subscription_cancelled are planned but disabled until webhook processing is explicitly enabled.",
    });
  });

  it("does not plan effects for unsupported events", () => {
    expect(planBillingWebhookEffects(null)).toEqual({
      effectsEnabled: false,
      effects: [],
      message:
        "No billing effects are planned because the webhook event type is unsupported or unavailable.",
    });
  });
});
