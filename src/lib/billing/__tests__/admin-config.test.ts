import { describe, expect, it } from "vitest";
import {
  normalizeGatewayId,
  normalizeBillingSlug,
  normalizePlanName,
  validateCreateBillingPlanInput,
  validateCreatePaymentGatewayInput,
  validateCreateProviderPriceMappingInput,
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

  it("stores payment key references without storing raw key values", () => {
    const result = validateCreatePaymentGatewayInput({
      gatewayId: "stripe_us_test",
      provider: "stripe",
      displayName: "Stripe US Test",
      environment: "test",
      supportedCurrencies: "usd",
      supportedPaymentTypes: "subscription",
      publishableKeyRef: "STRIPE_PUBLISHABLE_KEY_STRIPE_US_TEST",
      secretKeyRef: "STRIPE_SECRET_KEY_STRIPE_US_TEST",
      webhookSecretRef: "STRIPE_WEBHOOK_SECRET_STRIPE_US_TEST",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.gateway.publishableKeyRef).toBe("STRIPE_PUBLISHABLE_KEY_STRIPE_US_TEST");
      expect(result.gateway.secretKeyRef).toBe("STRIPE_SECRET_KEY_STRIPE_US_TEST");
      expect(result.gateway.webhookSecretRef).toBe("STRIPE_WEBHOOK_SECRET_STRIPE_US_TEST");
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

describe("admin billing plan configuration input", () => {
  it("normalizes plan slugs", () => {
    expect(normalizeBillingSlug(" ATI TEAS 7 1 Month Access ")).toBe("ati-teas-7-1-month-access");
  });

  it("normalizes plan names to title case without separators or punctuation", () => {
    expect(normalizePlanName("ati-teas.monthly_plan!!")).toBe("Ati Teas Monthly Plan");
  });

  it("accepts a valid draft plan assigned to packages and gateways", () => {
    const result = validateCreateBillingPlanInput(
      {
        planId: "ati_teas_7_1_month",
        name: "ati-teas.7_1_month_access!",
        slug: "ati-teas-7-1-month-access",
        status: "draft",
        purchaseType: "one_time",
        billingInterval: "lifetime",
        price: "49",
        currency: "usd",
        packageIds: ["ati_teas_7"],
        gatewayIds: ["stripe_us_test"],
      },
      { gatewayIds: ["stripe_us_test"], adminUid: "admin_1" }
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.plan.name).toBe("Ati Teas 7 1 Month Access");
      expect(result.plan.currency).toBe("USD");
      expect(result.plan.price).toBe(49);
      expect(result.plan.createdBy).toBe("admin_1");
    }
  });

  it("treats ATI TEAS and HESI as separate entrance exam packages", () => {
    const teasResult = validateCreateBillingPlanInput({
      planId: "ati_teas_monthly",
      name: "ATI TEAS Monthly",
      slug: "ati-teas-monthly",
      status: "draft",
      purchaseType: "subscription",
      billingInterval: "monthly",
      price: "29",
      currency: "USD",
      packageIds: ["ati_teas_7"],
    });
    const hesiResult = validateCreateBillingPlanInput({
      planId: "hesi_a2_monthly",
      name: "HESI A2 Monthly",
      slug: "hesi-a2-monthly",
      status: "draft",
      purchaseType: "subscription",
      billingInterval: "monthly",
      price: "29",
      currency: "USD",
      packageIds: ["hesi_a2"],
    });

    expect(teasResult.valid).toBe(true);
    expect(hesiResult.valid).toBe(true);
  });

  it("accepts fixed-term exam access plans", () => {
    const result = validateCreateBillingPlanInput({
      planId: "ati_teas_7_1_month",
      name: "ATI TEAS 7 1 Month Access",
      slug: "ati-teas-7-1-month-access",
      status: "draft",
      purchaseType: "one_time",
      billingInterval: "",
      examId: "ati_teas_7",
      durationDays: 30,
      renewsAutomatically: false,
      price: "49",
      currency: "USD",
      packageIds: ["ati_teas_7"],
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.plan.examId).toBe("ati_teas_7");
      expect(result.plan.durationDays).toBe(30);
      expect(result.plan.renewsAutomatically).toBe(false);
    }
  });

  it("rejects recurring fixed-term exam access plans", () => {
    const result = validateCreateBillingPlanInput({
      planId: "future_exam_1_month",
      name: "Future Exam 1 Month Access",
      slug: "future-exam-1-month-access",
      status: "draft",
      purchaseType: "subscription",
      billingInterval: "monthly",
      examId: "future_exam",
      durationDays: 30,
      renewsAutomatically: true,
      price: "49",
      currency: "USD",
      packageIds: [],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          "Fixed-term access plans must use one-time purchase.",
          "Fixed-term access plans cannot renew automatically.",
        ])
      );
    }
  });

  it("rejects active plans without packages or gateways", () => {
    const result = validateCreateBillingPlanInput({
      name: "Empty Active Plan",
      status: "active",
      purchaseType: "subscription",
      billingInterval: "monthly",
      price: "10",
      currency: "USD",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          "Active plans must include at least one package.",
          "Active plans must include at least one gateway.",
        ])
      );
    }
  });
});

describe("admin provider price mapping configuration input", () => {
  const plan = {
    planId: "ati_teas_monthly",
    name: "Ati Teas Monthly",
    slug: "ati-teas-monthly",
    description: "",
    shortDescription: "",
    status: "draft" as const,
    purchaseType: "subscription" as const,
    billingInterval: "monthly" as const,
    price: 29,
    currency: "USD",
    packageIds: ["ati_teas_7"],
    gatewayIds: ["stripe_us_test"],
    trialDays: 0,
    isFeatured: false,
    isPublic: true,
    displayOrder: 100,
    createdAt: null,
    createdBy: "admin_1",
    updatedAt: null,
    updatedBy: "admin_1",
  };
  const gateway = {
    gatewayId: "stripe_us_test",
    provider: "stripe" as const,
    displayName: "Stripe US Test",
    enabled: true,
    environment: "test" as const,
    connectionStatus: "not_configured" as const,
    supportedCurrencies: ["USD"],
    supportedCountries: ["US"],
    supportedPaymentTypes: ["subscription" as const],
    supportsSubscriptions: true,
    supportsOneTimePayments: false,
    minimumAmount: null,
    maximumAmount: null,
    priority: 1,
    isDefault: true,
    publishableKeyRef: null,
    secretKeyRef: null,
    webhookSecretRef: null,
    planIds: ["ati_teas_monthly"],
    configurationStatus: "incomplete" as const,
    lastConnectionTestAt: null,
    lastConnectionTestStatus: "not_tested" as const,
    lastSuccessfulWebhookAt: null,
    lastWebhookFailureAt: null,
    createdAt: null,
    createdBy: "admin_1",
    updatedAt: null,
    updatedBy: "admin_1",
  };

  it("accepts a mapping that matches the selected plan and gateway", () => {
    const result = validateCreateProviderPriceMappingInput(
      {
        planId: "ati_teas_monthly",
        gatewayId: "stripe_us_test",
        provider: "stripe",
        environment: "test",
        externalPriceId: "price_test",
        amount: "29",
        currency: "usd",
        billingInterval: "monthly",
        purchaseType: "subscription",
      },
      { plans: [plan], gateways: [gateway] }
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.providerPriceMapping.mappingId).toBe("stripe_us_test_ati_teas_monthly");
      expect(result.providerPriceMapping.currency).toBe("USD");
      expect(result.providerPriceMapping.syncStatus).toBe("not_synced");
    }
  });

  it("rejects mappings that do not match plan and gateway constraints", () => {
    const result = validateCreateProviderPriceMappingInput(
      {
        planId: "ati_teas_monthly",
        gatewayId: "stripe_us_test",
        provider: "paypal",
        environment: "test",
        externalPriceId: "price_test",
        amount: "39",
        currency: "USD",
        billingInterval: "monthly",
        purchaseType: "subscription",
      },
      { plans: [plan], gateways: [gateway] }
    );

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          "Provider must match the selected gateway.",
          "Mapping amount must match the plan price.",
        ])
      );
    }
  });
});
