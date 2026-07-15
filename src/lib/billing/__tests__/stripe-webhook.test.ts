import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BillingPlan, PaymentGatewayConfig, ProviderPriceMapping } from "@/lib/billing/models";
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

function plan(overrides: Partial<BillingPlan> = {}): BillingPlan {
  return {
    planId: "all_access_monthly",
    name: "All Access Monthly",
    slug: "all-access-monthly",
    description: "All NursingMocks packages.",
    shortDescription: "All access",
    status: "active",
    purchaseType: "subscription",
    billingInterval: "monthly",
    price: 49,
    currency: "USD",
    packageIds: ["all_access"],
    gatewayIds: ["stripe_default"],
    trialDays: 0,
    isFeatured: true,
    isPublic: true,
    displayOrder: 1,
    createdAt: null,
    createdBy: "admin_1",
    updatedAt: null,
    updatedBy: "admin_1",
    ...overrides,
  };
}

function mapping(overrides: Partial<ProviderPriceMapping> = {}): ProviderPriceMapping {
  return {
    mappingId: "stripe_all_access_monthly",
    planId: "all_access_monthly",
    provider: "stripe",
    gatewayId: "stripe_default",
    environment: "test",
    externalProductId: "prod_test",
    externalPriceId: "price_test",
    externalPlanId: null,
    amount: 49,
    currency: "USD",
    billingInterval: "monthly",
    purchaseType: "subscription",
    active: true,
    syncStatus: "synced",
    syncedAt: null,
    createdAt: null,
    updatedAt: null,
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
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY_STRIPE_DEFAULT;
    delete process.env.CUSTOM_STRIPE_SECRET_KEY;
    vi.unstubAllGlobals();
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
      payload: expect.objectContaining({
        id: "evt_test",
        type: "checkout.session.completed",
      }),
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

describe("Stripe sandbox checkout sessions", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY_STRIPE_DEFAULT;
    delete process.env.CUSTOM_STRIPE_SECRET_KEY;
    vi.unstubAllGlobals();
  });

  it("creates a Stripe test checkout session from the provider price mapping", async () => {
    process.env.CUSTOM_STRIPE_SECRET_KEY = "sk_test_custom";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "cs_test_123", url: "https://checkout.stripe.com/c/test" }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await stripeGatewayAdapter.createCheckoutSession({
      uid: "user_1",
      plan: plan(),
      gateway: gateway({ secretKeyRef: "CUSTOM_STRIPE_SECRET_KEY" }),
      providerPriceMapping: mapping(),
      successUrl: "https://nursingmocks.com/payments?checkout=success",
      cancelUrl: "https://nursingmocks.com/payments?checkout=cancelled",
      customerEmail: "student@example.com",
      metadata: {
        uid: "user_1",
        planId: "all_access_monthly",
        gatewayId: "stripe_default",
        mappingId: "stripe_all_access_monthly",
      },
    });

    expect(result).toEqual({
      status: "ready",
      message: "Stripe test checkout session created.",
      providerSessionId: "cs_test_123",
      checkoutUrl: "https://checkout.stripe.com/c/test",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/checkout/sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_custom",
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
    );
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("mode")).toBe("subscription");
    expect(body.get("line_items[0][price]")).toBe("price_test");
    expect(body.get("customer_email")).toBe("student@example.com");
    expect(body.get("metadata[uid]")).toBe("user_1");
    expect(body.get("subscription_data[metadata][planId]")).toBe("all_access_monthly");
  });

  it("keeps checkout unavailable when no Stripe secret key is configured", async () => {
    const result = await stripeGatewayAdapter.createCheckoutSession({
      uid: "user_1",
      plan: plan(),
      gateway: gateway(),
      providerPriceMapping: mapping(),
      successUrl: "https://nursingmocks.com/payments?checkout=success",
      cancelUrl: "https://nursingmocks.com/payments?checkout=cancelled",
    });

    expect(result.status).toBe("unavailable");
    expect(result.checkoutUrl).toBeUndefined();
  });

  it("blocks live checkout sessions during sandbox activation", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";

    const result = await stripeGatewayAdapter.createCheckoutSession({
      uid: "user_1",
      plan: plan(),
      gateway: gateway({ environment: "live" }),
      providerPriceMapping: mapping({ environment: "live" }),
      successUrl: "https://nursingmocks.com/payments?checkout=success",
      cancelUrl: "https://nursingmocks.com/payments?checkout=cancelled",
    });

    expect(result).toEqual({
      status: "unavailable",
      message: "Live Stripe checkout is disabled until live checkout approval is recorded.",
    });
  });
});

describe("Stripe sandbox billing portal sessions", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY_STRIPE_DEFAULT;
    delete process.env.CUSTOM_STRIPE_SECRET_KEY;
    vi.unstubAllGlobals();
  });

  it("creates a Stripe test billing portal session for the provider customer", async () => {
    process.env.CUSTOM_STRIPE_SECRET_KEY = "sk_test_custom";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "bps_test_123", url: "https://billing.stripe.com/p/session" }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await stripeGatewayAdapter.createBillingPortalSession({
      uid: "user_1",
      gateway: gateway({ secretKeyRef: "CUSTOM_STRIPE_SECRET_KEY" }),
      providerCustomerId: "cus_test",
      returnUrl: "https://nursingmocks.com/payments",
    });

    expect(result).toEqual({
      status: "ready",
      message: "Stripe test billing portal session created.",
      providerSessionId: "bps_test_123",
      portalUrl: "https://billing.stripe.com/p/session",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/billing_portal/sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_custom",
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
    );
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("customer")).toBe("cus_test");
    expect(body.get("return_url")).toBe("https://nursingmocks.com/payments");
  });

  it("blocks live Stripe billing portal sessions during test portal activation", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";

    const result = await stripeGatewayAdapter.createBillingPortalSession({
      uid: "user_1",
      gateway: gateway({ environment: "live" }),
      providerCustomerId: "cus_live",
      returnUrl: "https://nursingmocks.com/payments",
    });

    expect(result).toEqual({
      status: "unavailable",
      message: "Live Stripe billing portal is disabled until live portal approval is recorded.",
    });
  });
});
