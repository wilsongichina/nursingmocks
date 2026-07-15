import { describe, expect, it } from "vitest";
import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import { canGatewayServePlan, validateBillingPlan } from "@/lib/billing/validation";

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
    packageIds: ["ati_teas_7", "hesi_a2", "nursing_test_bank", "nursing_exit_exams"],
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

function gateway(overrides: Partial<PaymentGatewayConfig> = {}): PaymentGatewayConfig {
  return {
    gatewayId: "stripe_default",
    provider: "stripe",
    displayName: "Stripe",
    enabled: true,
    environment: "test",
    connectionStatus: "connected",
    supportedCurrencies: ["USD"],
    supportedCountries: ["US", "GB", "KE"],
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

function providerMapping(overrides: Partial<ProviderPriceMapping> = {}): ProviderPriceMapping {
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

describe("billing plan validation", () => {
  it("accepts a valid active plan with a ready gateway and provider mapping", () => {
    const result = validateBillingPlan(plan(), {
      gateways: [gateway()],
      providerPriceMappings: [providerMapping()],
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects active public plans without packages", () => {
    const result = validateBillingPlan(plan({ packageIds: [] }), {
      gateways: [gateway()],
      providerPriceMappings: [providerMapping()],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "packageIds",
      message: "Active public plans must include at least one package.",
    });
  });

  it("rejects active plans without ready assigned gateways", () => {
    const result = validateBillingPlan(plan(), {
      gateways: [gateway({ enabled: false })],
      providerPriceMappings: [providerMapping()],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "gatewayIds",
      message: "Active plans require at least one enabled, ready gateway.",
    });
  });

  it("rejects active plans without a matching provider price mapping", () => {
    const result = validateBillingPlan(plan(), {
      gateways: [gateway()],
      providerPriceMappings: [providerMapping({ amount: 99 })],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "providerPriceMappings",
      message: "Active plans require a valid provider price mapping.",
    });
  });

  it("rejects duplicate plan slugs", () => {
    const result = validateBillingPlan(plan({ planId: "new_plan" }), {
      existingPlans: [plan()],
      gateways: [gateway()],
      providerPriceMappings: [providerMapping({ planId: "new_plan" })],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "slug",
      message: "Plan slug must be unique.",
    });
  });

  it("requires lifetime plans to use one-time purchase", () => {
    const result = validateBillingPlan(plan({ billingInterval: "lifetime" }), {
      gateways: [gateway()],
      providerPriceMappings: [providerMapping({ billingInterval: "lifetime" })],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "purchaseType",
      message: "Lifetime plans must use one-time purchase.",
    });
  });
});

describe("payment gateway eligibility", () => {
  it("accepts a configured gateway assigned to the plan", () => {
    const result = canGatewayServePlan(gateway(), plan(), {
      country: "US",
      environment: "test",
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects disabled gateways and unsupported currency", () => {
    const result = canGatewayServePlan(
      gateway({ enabled: false, supportedCurrencies: ["EUR"] }),
      plan(),
      { country: "US", environment: "test" }
    );

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        { field: "enabled", message: "Gateway is disabled." },
        { field: "currency", message: "Gateway does not support this currency." },
      ])
    );
  });
});
