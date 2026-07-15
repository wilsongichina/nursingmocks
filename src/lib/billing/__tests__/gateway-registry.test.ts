import { describe, expect, it } from "vitest";
import type { BillingPlan, PaymentGatewayConfig } from "@/lib/billing/models";
import { createBillingGatewayRegistry } from "@/lib/billing/gateway-registry";
import { stripeGatewayAdapter } from "@/lib/billing/providers/stripe";

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
    gatewayIds: ["stripe_us", "stripe_global"],
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

function gateway(overrides: Partial<PaymentGatewayConfig> = {}): PaymentGatewayConfig {
  return {
    gatewayId: "stripe_us",
    provider: "stripe",
    displayName: "Stripe US",
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

describe("billing gateway registry", () => {
  it("registers multiple admin-managed gateway configs for one provider", () => {
    const { registry, issues } = createBillingGatewayRegistry([
      gateway(),
      gateway({
        gatewayId: "stripe_global",
        displayName: "Stripe Global",
        supportedCountries: [],
        priority: 2,
      }),
    ]);

    expect(issues).toEqual([]);
    expect(registry.list().map(({ config }) => config.gatewayId)).toEqual(["stripe_us", "stripe_global"]);
  });

  it("selects only gateways eligible for the plan and checkout context", () => {
    const { registry } = createBillingGatewayRegistry([
      gateway(),
      gateway({
        gatewayId: "stripe_global",
        displayName: "Stripe Global",
        supportedCountries: [],
        priority: 2,
      }),
      gateway({
        gatewayId: "stripe_disabled",
        displayName: "Stripe Disabled",
        enabled: false,
        priority: 3,
      }),
    ]);

    const eligible = registry.listEligibleForPlan(plan(), {
      country: "US",
      environment: "test",
    });

    expect(eligible.map(({ config }) => config.gatewayId)).toEqual(["stripe_us", "stripe_global"]);
  });

  it("reports gateway records without a registered provider adapter", () => {
    const { registry, issues } = createBillingGatewayRegistry([
      gateway({ gatewayId: "paypal_default", provider: "paypal" }),
    ]);

    expect(registry.list()).toEqual([]);
    expect(issues).toEqual([
      "Gateway paypal_default uses provider paypal, but no adapter is registered.",
    ]);
  });

  it("keeps the Stripe adapter unavailable for live gateways", async () => {
    const result = await stripeGatewayAdapter.createCheckoutSession({
      uid: "user_1",
      plan: plan(),
      gateway: gateway({ environment: "live" }),
      providerPriceMapping: {
        mappingId: "stripe_all_access_monthly",
        planId: "all_access_monthly",
        provider: "stripe",
        gatewayId: "stripe_us",
        environment: "live",
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
      },
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(result.status).toBe("unavailable");
    expect(result.checkoutUrl).toBeUndefined();
    expect(result.message).toBe("Live Stripe checkout is disabled until live checkout approval is recorded.");
  });
});
