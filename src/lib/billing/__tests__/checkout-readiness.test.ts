import { describe, expect, it } from "vitest";
import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import { getPublicBillingCatalog, resolveCheckoutReadiness } from "@/lib/billing/checkout-readiness";

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
    packageIds: ["ati_teas_7", "hesi_a2"],
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
    supportedCountries: ["US", "KE"],
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

function catalog(overrides: {
  plans?: BillingPlan[];
  gateways?: PaymentGatewayConfig[];
  providerPriceMappings?: ProviderPriceMapping[];
} = {}) {
  return {
    plans: overrides.plans ?? [plan()],
    gateways: overrides.gateways ?? [gateway()],
    providerPriceMappings: overrides.providerPriceMappings ?? [mapping()],
  };
}

describe("public billing catalog", () => {
  it("exposes only active public plans, enabled gateways, and active mappings", () => {
    const result = getPublicBillingCatalog(
      catalog({
        plans: [plan(), plan({ planId: "draft", status: "draft" }), plan({ planId: "private", isPublic: false })],
        gateways: [gateway(), gateway({ gatewayId: "disabled", enabled: false })],
        providerPriceMappings: [mapping(), mapping({ mappingId: "inactive", active: false })],
      })
    );

    expect(result.plans.map((item) => item.planId)).toEqual(["all_access_monthly"]);
    expect(result.gateways.map((item) => item.gatewayId)).toEqual(["stripe_default"]);
    expect(result.providerPriceMappings.map((item) => item.mappingId)).toEqual(["stripe_all_access_monthly"]);
  });
});

describe("checkout readiness", () => {
  it("marks a matching plan, gateway, and provider mapping as ready while keeping checkout disabled", () => {
    const result = resolveCheckoutReadiness(catalog(), {
      planId: "all_access_monthly",
      country: "US",
      environment: "test",
    });

    expect(result.ready).toBe(true);
    expect(result.checkoutEnabled).toBe(false);
    expect(result.selectedGateway?.gatewayId).toBe("stripe_default");
    expect(result.selectedProviderPriceMapping?.mappingId).toBe("stripe_all_access_monthly");
  });

  it("rejects unavailable plans", () => {
    const result = resolveCheckoutReadiness(catalog({ plans: [plan({ status: "draft" })] }), {
      planId: "all_access_monthly",
    });

    expect(result.ready).toBe(false);
    expect(result.issues).toContainEqual({
      field: "planId",
      message: "Plan is not active, public, or available for checkout.",
    });
  });

  it("rejects missing provider mappings", () => {
    const result = resolveCheckoutReadiness(catalog({ providerPriceMappings: [] }), {
      planId: "all_access_monthly",
      environment: "test",
    });

    expect(result.ready).toBe(false);
    expect(result.candidates[0].issues).toContainEqual({
      field: "providerPriceMapping",
      message: "No active provider price mapping matches this plan and gateway.",
    });
  });

  it("rejects disabled or unready gateways", () => {
    const result = resolveCheckoutReadiness(
      catalog({ gateways: [gateway({ configurationStatus: "incomplete" })] }),
      { planId: "all_access_monthly" }
    );

    expect(result.ready).toBe(false);
    expect(result.candidates[0].issues).toContainEqual({
      field: "configurationStatus",
      message: "Gateway configuration is not ready.",
    });
  });

  it("rejects unsupported payment types", () => {
    const result = resolveCheckoutReadiness(
      catalog({ gateways: [gateway({ supportedPaymentTypes: ["one_time"] })] }),
      { planId: "all_access_monthly" }
    );

    expect(result.ready).toBe(false);
    expect(result.candidates[0].issues).toContainEqual({
      field: "purchaseType",
      message: "Gateway does not support this purchase type.",
    });
  });
});
