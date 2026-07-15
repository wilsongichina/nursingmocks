import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import type { PaymentGatewayConfig } from "@/lib/billing/models";
import { stripeGatewayAdapter } from "@/lib/billing/providers/stripe";

function gateway(overrides: Partial<PaymentGatewayConfig> = {}): PaymentGatewayConfig {
  return {
    gatewayId: "stripe_default",
    provider: "stripe",
    displayName: "Stripe",
    enabled: true,
    environment: "test",
    connectionStatus: "connected",
    supportedCurrencies: ["USD"],
    supportedCountries: ["US"],
    supportedPaymentTypes: ["subscription", "one_time"],
    supportsSubscriptions: true,
    supportsOneTimePayments: true,
    minimumAmount: 1,
    maximumAmount: 1000,
    priority: 1,
    isDefault: true,
    publishableKeyRef: null,
    secretKeyRef: null,
    webhookSecretRef: null,
    planIds: ["all_access_monthly"],
    configurationStatus: "ready",
    lastConnectionTestAt: null,
    lastConnectionTestStatus: "passed",
    lastSuccessfulWebhookAt: null,
    lastWebhookFailureAt: null,
    createdAt: null,
    createdBy: "admin_1",
    updatedAt: null,
    updatedBy: "admin_1",
    ...overrides,
  };
}

function signatureHeader(rawBody: string, secret: string, timestamp = "1700000000") {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

describe("Stripe webhook verification", () => {
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET_STRIPE_DEFAULT;
    delete process.env.CUSTOM_STRIPE_WEBHOOK_SECRET;
  });

  it("returns unavailable when no webhook secret is configured", async () => {
    const result = await stripeGatewayAdapter.verifyWebhook({
      gateway: gateway(),
      rawBody: "{}",
      signatureHeader: "t=1700000000,v1=test",
    });

    expect(result.status).toBe("unavailable");
  });

  it("rejects invalid signatures", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    const result = await stripeGatewayAdapter.verifyWebhook({
      gateway: gateway(),
      rawBody: "{\"id\":\"evt_test\",\"type\":\"checkout.session.completed\"}",
      signatureHeader: "t=1700000000,v1=bad",
    });

    expect(result).toEqual({
      status: "failed",
      message: "Stripe webhook signature verification failed.",
    });
  });

  it("extracts event ID and type from valid signed events", async () => {
    process.env.STRIPE_WEBHOOK_SECRET_STRIPE_DEFAULT = "whsec_gateway";
    const rawBody = "{\"id\":\"evt_test\",\"type\":\"checkout.session.completed\"}";

    const result = await stripeGatewayAdapter.verifyWebhook({
      gateway: gateway(),
      rawBody,
      signatureHeader: signatureHeader(rawBody, "whsec_gateway"),
    });

    expect(result).toEqual({
      status: "ready",
      message: "Stripe webhook signature verified.",
      providerEventId: "evt_test",
      eventType: "checkout.session.completed",
      payload: {
        id: "evt_test",
        type: "checkout.session.completed",
      },
    });
  });

  it("prefers the gateway webhook secret reference when configured", async () => {
    process.env.CUSTOM_STRIPE_WEBHOOK_SECRET = "whsec_custom";
    const rawBody = "{\"id\":\"evt_custom\",\"type\":\"invoice.paid\"}";

    const result = await stripeGatewayAdapter.verifyWebhook({
      gateway: gateway({ webhookSecretRef: "CUSTOM_STRIPE_WEBHOOK_SECRET" }),
      rawBody,
      signatureHeader: signatureHeader(rawBody, "whsec_custom"),
    });

    expect(result.status).toBe("ready");
    expect(result.providerEventId).toBe("evt_custom");
    expect(result.eventType).toBe("invoice.paid");
  });
});
