import { describe, expect, it } from "vitest";
import {
  normalizeGatewayId,
  validateCreatePaymentGatewayInput,
} from "@/lib/billing/admin-config";

describe("admin billing gateway configuration input", () => {
  it("normalizes gateway IDs for Firestore document IDs", () => {
    expect(normalizeGatewayId(" Stripe US Live ")).toBe("stripe_us_live");
  });

  it("accepts a valid admin-created gateway config without secrets", () => {
    const result = validateCreatePaymentGatewayInput(
      {
        gatewayId: "stripe_us_test",
        provider: "stripe",
        displayName: "Stripe US Test",
        environment: "test",
        supportedCurrencies: "usd, cad",
        supportedCountries: "us, ca",
        supportedPaymentTypes: ["subscription", "one_time"],
        enabled: true,
      },
      { adminUid: "admin_1" }
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.gateway.gatewayId).toBe("stripe_us_test");
      expect(result.gateway.supportedCurrencies).toEqual(["USD", "CAD"]);
      expect(result.gateway.supportedCountries).toEqual(["US", "CA"]);
      expect(result.gateway.configurationStatus).toBe("incomplete");
      expect(result.gateway.createdBy).toBe("admin_1");
    }
  });

  it("rejects duplicate gateway IDs and unsupported providers", () => {
    const result = validateCreatePaymentGatewayInput(
      {
        gatewayId: "stripe_us_test",
        provider: "unknown",
        displayName: "Unknown",
        environment: "test",
        supportedCurrencies: "usd",
        supportedPaymentTypes: "subscription",
      },
      { existingGatewayIds: ["stripe_us_test"] }
    );

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(
        expect.arrayContaining(["Gateway ID already exists.", "Provider is not supported."])
      );
    }
  });
});
