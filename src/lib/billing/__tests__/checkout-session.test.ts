import { describe, expect, it } from "vitest";
import { validateCheckoutSessionDraftRequest } from "@/lib/billing/checkout-session";

describe("checkout session draft request validation", () => {
  it("accepts the minimal server-resolved checkout request shape", () => {
    const result = validateCheckoutSessionDraftRequest({
      planId: "all_access_monthly",
      gatewayId: "stripe_default",
      successUrl: "https://nursingmocks.com/billing/success",
      cancelUrl: "https://nursingmocks.com/billing/cancel",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.input).toEqual({
        planId: "all_access_monthly",
        gatewayId: "stripe_default",
        successUrl: "https://nursingmocks.com/billing/success",
        cancelUrl: "https://nursingmocks.com/billing/cancel",
        customerEmail: null,
      });
    }
  });

  it("rejects client-controlled payment and entitlement fields", () => {
    const result = validateCheckoutSessionDraftRequest({
      planId: "all_access_monthly",
      successUrl: "https://nursingmocks.com/billing/success",
      cancelUrl: "https://nursingmocks.com/billing/cancel",
      amount: 1,
    });

    expect(result).toEqual({
      valid: false,
      issues: ["amount cannot be supplied by the client for checkout."],
    });
  });

  it("rejects unsafe URLs", () => {
    const result = validateCheckoutSessionDraftRequest({
      planId: "all_access_monthly",
      successUrl: "javascript:alert(1)",
      cancelUrl: "/billing/cancel",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual([
        "A valid success URL is required.",
        "A valid cancel URL is required.",
      ]);
    }
  });
});
