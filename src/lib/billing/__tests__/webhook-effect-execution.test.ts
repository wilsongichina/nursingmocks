import { describe, expect, it } from "vitest";
import {
  executePlannedBillingWebhookEffects,
  getBillingWebhookWriteTargets,
} from "@/lib/billing/webhook-effect-execution";

describe("billing webhook effect execution gate", () => {
  it("maps planned effects to billing write targets", () => {
    expect(getBillingWebhookWriteTargets(["record_transaction", "grant_entitlements"])).toEqual([
      "billing_transactions",
      "billing_audit_logs",
      "billing_entitlements",
      "user_billing_summary",
    ]);
  });

  it("blocks all writes while effects are disabled", () => {
    expect(
      executePlannedBillingWebhookEffects({
        effectsEnabled: false,
        plannedEffects: ["record_transaction", "grant_entitlements"],
        normalizedEventType: "checkout_completed",
        providerEventId: "evt_test",
      })
    ).toEqual({
      executed: false,
      status: "disabled",
      writeTargets: [
        "billing_transactions",
        "billing_audit_logs",
        "billing_entitlements",
        "user_billing_summary",
      ],
      message: "Billing webhook effects are disabled. No billing state was written.",
    });
  });

  it("keeps enabled execution unavailable until controlled processing approval", () => {
    expect(
      executePlannedBillingWebhookEffects({
        effectsEnabled: true,
        plannedEffects: ["record_transaction"],
        normalizedEventType: "checkout_completed",
        providerEventId: "evt_test",
      })
    ).toEqual({
      executed: false,
      status: "not_implemented",
      writeTargets: ["billing_transactions", "billing_audit_logs"],
      message:
        "Billing webhook effect writers are defined but not enabled for execution until controlled processing approval.",
    });
  });
});
