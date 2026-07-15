import { describe, expect, it } from "vitest";
import { validateBillingPortalSessionRequest } from "@/lib/billing/billing-portal";

describe("billing portal session request validation", () => {
  it("accepts a server-resolved portal session request", () => {
    const result = validateBillingPortalSessionRequest({
      gatewayId: "stripe_default",
      returnUrl: "https://nursingmocks.com/payments",
    });

    expect(result).toEqual({
      valid: true,
      input: {
        gatewayId: "stripe_default",
        returnUrl: "https://nursingmocks.com/payments",
      },
    });
  });

  it("rejects client-controlled provider customer identifiers", () => {
    const result = validateBillingPortalSessionRequest({
      providerCustomerId: "cus_attacker",
      returnUrl: "https://nursingmocks.com/payments",
    });

    expect(result).toEqual({
      valid: false,
      issues: ["providerCustomerId cannot be supplied by the client for billing portal access."],
    });
  });

  it("rejects unsafe return URLs", () => {
    const result = validateBillingPortalSessionRequest({
      returnUrl: "javascript:alert(1)",
    });

    expect(result).toEqual({
      valid: false,
      issues: ["A valid return URL is required."],
    });
  });
});
