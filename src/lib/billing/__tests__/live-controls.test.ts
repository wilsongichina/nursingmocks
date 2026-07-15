import { describe, expect, it } from "vitest";
import { createDefaultBillingLiveControls, isBillingLiveCapability } from "@/lib/billing/live-controls";

describe("billing live controls", () => {
  it("defaults every live capability to blocked", () => {
    expect(createDefaultBillingLiveControls()).toEqual({
      checkout: { approved: false, approvedBy: null, approvedAt: null, reason: null },
      webhookEffects: { approved: false, approvedBy: null, approvedAt: null, reason: null },
      portal: { approved: false, approvedBy: null, approvedAt: null, reason: null },
    });
  });

  it("accepts only known live capabilities", () => {
    expect(isBillingLiveCapability("checkout")).toBe(true);
    expect(isBillingLiveCapability("webhookEffects")).toBe(true);
    expect(isBillingLiveCapability("portal")).toBe(true);
    expect(isBillingLiveCapability("refunds")).toBe(false);
  });
});
