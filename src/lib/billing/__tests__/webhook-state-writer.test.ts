import { describe, expect, it } from "vitest";
import type { BillingPlan, PaymentGatewayConfig, ProviderPriceMapping } from "@/lib/billing/models";
import { writeBillingWebhookState } from "@/lib/server/billing-webhook-state-writer";

function ref(collectionName: string, id: string) {
  return { collectionName, id, path: `${collectionName}/${id}` };
}

function fakeDb() {
  let autoId = 0;
  function query(collectionName: string, filters: Array<{ field: string; operator: string; value: unknown }>) {
    return {
      collectionName,
      filters,
      where(nextField: string, nextOperator: string, nextValue: unknown) {
        return query(collectionName, [...filters, { field: nextField, operator: nextOperator, value: nextValue }]);
      },
      limit(limitValue: number) {
        return { collectionName, filters, limitValue, query: true };
      },
    };
  }

  return {
    collection: (collectionName: string) => ({
      doc: (id?: string) => ref(collectionName, id ?? `auto_${++autoId}`),
      where: (field: string, operator: string, value: unknown) =>
        query(collectionName, [{ field, operator, value }]),
    }),
  };
}

function fakeSnapshot(data: Record<string, unknown> | null) {
  return {
    exists: Boolean(data),
    data: () => data,
  };
}

function plan(overrides: Partial<BillingPlan> = {}): BillingPlan {
  return {
    planId: "all_access_monthly",
    name: "All Access Monthly",
    slug: "all-access-monthly",
    description: "All access",
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
    createdBy: "admin",
    updatedAt: null,
    updatedBy: "admin",
    ...overrides,
  };
}

function gateway(overrides: Partial<PaymentGatewayConfig> = {}): PaymentGatewayConfig {
  return {
    gatewayId: "stripe_default",
    provider: "stripe",
    displayName: "Stripe Test",
    enabled: true,
    environment: "test",
    connectionStatus: "connected",
    supportedCurrencies: ["USD"],
    supportedCountries: ["US"],
    supportedPaymentTypes: ["subscription"],
    supportsSubscriptions: true,
    supportsOneTimePayments: false,
    minimumAmount: 1,
    maximumAmount: 1000,
    priority: 1,
    isDefault: true,
    publishableKeyRef: null,
    secretKeyRef: "STRIPE_SECRET_KEY",
    webhookSecretRef: "STRIPE_WEBHOOK_SECRET",
    planIds: ["all_access_monthly"],
    configurationStatus: "ready",
    lastConnectionTestAt: null,
    lastConnectionTestStatus: "passed",
    lastSuccessfulWebhookAt: null,
    lastWebhookFailureAt: null,
    createdAt: null,
    createdBy: "admin",
    updatedAt: null,
    updatedBy: "admin",
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

describe("billing webhook state writer", () => {
  it("writes transaction, entitlement, user summary, and audit records for checkout completion", async () => {
    const writes: Array<{ collectionName: string; id: string; data: Record<string, unknown> }> = [];
    const records = new Map<string, Record<string, unknown>>([
      ["billing_plans/all_access_monthly", plan() as unknown as Record<string, unknown>],
      ["billing_provider_price_mappings/stripe_all_access_monthly", mapping() as unknown as Record<string, unknown>],
    ]);
    const transaction = {
      get: async (docRef: { path: string }) => fakeSnapshot(records.get(docRef.path) ?? null),
      set: (docRef: { collectionName: string; id: string }, data: Record<string, unknown>) => {
        writes.push({ collectionName: docRef.collectionName, id: docRef.id, data });
      },
    };

    const result = await writeBillingWebhookState({
      transaction: transaction as never,
      db: fakeDb() as never,
      eventRecordId: "stripe_evt_checkout",
      provider: "stripe",
      gateway: gateway(),
      providerEventId: "evt_checkout",
      normalizedEventType: "checkout_completed",
      plannedEffects: ["record_transaction", "grant_entitlements"],
      providerPayload: {
        id: "evt_checkout",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            amount_total: 4900,
            currency: "usd",
            customer: "cus_test",
            subscription: "sub_test",
            payment_intent: "pi_test",
            metadata: {
              uid: "user_1",
              planId: "all_access_monthly",
              gatewayId: "stripe_default",
              mappingId: "stripe_all_access_monthly",
            },
          },
        },
      },
    });

    expect(result.executed).toBe(true);
    expect(result.writeTargets).toEqual([
      "billing_transactions",
      "billing_entitlements",
      "user_billing_summary",
      "billing_audit_logs",
    ]);
    expect(writes.some((write) => write.collectionName === "billing_transactions")).toBe(true);
    expect(writes.filter((write) => write.collectionName === "billing_entitlements")).toHaveLength(2);
    expect(writes.some((write) => write.collectionName === "users" && write.id === "user_1")).toBe(true);
    expect(writes.some((write) => write.collectionName === "billing_audit_logs")).toBe(true);
  });

  it("writes fixed-term access end dates and extends from active access", async () => {
    const writes: Array<{ collectionName: string; id: string; data: Record<string, unknown> }> = [];
    const existingEnd = new Date("2026-08-01T00:00:00.000Z");
    const records = new Map<string, Record<string, unknown>>([
      [
        "billing_plans/ati_teas_7_1_month",
        plan({
          planId: "ati_teas_7_1_month",
          name: "ATI TEAS 7 1 Month Access",
          slug: "ati-teas-7-1-month-access",
          purchaseType: "one_time",
          billingInterval: "lifetime",
          examId: "ati_teas_7",
          durationDays: 30,
          renewsAutomatically: false,
          packageIds: ["ati_teas_7"],
        }) as unknown as Record<string, unknown>,
      ],
      [
        "billing_provider_price_mappings/stripe_ati_teas_7_1_month",
        mapping({
          mappingId: "stripe_ati_teas_7_1_month",
          planId: "ati_teas_7_1_month",
          billingInterval: "lifetime",
          purchaseType: "one_time",
        }) as unknown as Record<string, unknown>,
      ],
    ]);
    const transaction = {
      get: async (docRef: { path?: string; query?: boolean }) => {
        if (docRef.query) {
          return {
            docs: [
              {
                data: () => ({
                  uid: "user_1",
                  packageId: "ati_teas_7",
                  status: "active",
                  accessEndsAt: existingEnd,
                }),
              },
            ],
          };
        }
        return fakeSnapshot(records.get(docRef.path ?? "") ?? null);
      },
      set: (docRef: { collectionName: string; id: string }, data: Record<string, unknown>) => {
        writes.push({ collectionName: docRef.collectionName, id: docRef.id, data });
      },
    };

    const result = await writeBillingWebhookState({
      transaction: transaction as never,
      db: fakeDb() as never,
      eventRecordId: "stripe_evt_checkout",
      provider: "stripe",
      gateway: gateway({ supportsSubscriptions: false, supportsOneTimePayments: true, supportedPaymentTypes: ["one_time"] }),
      providerEventId: "evt_checkout",
      normalizedEventType: "checkout_completed",
      plannedEffects: ["record_transaction", "grant_entitlements"],
      providerPayload: {
        id: "evt_checkout",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            amount_total: 4900,
            currency: "usd",
            customer: "cus_test",
            payment_intent: "pi_test",
            metadata: {
              uid: "user_1",
              planId: "ati_teas_7_1_month",
              gatewayId: "stripe_default",
              mappingId: "stripe_ati_teas_7_1_month",
              accessType: "fixed_term",
              examId: "ati_teas_7",
              durationDays: "30",
            },
          },
        },
      },
    });

    expect(result.executed).toBe(true);
    const entitlementWrite = writes.find((write) => write.collectionName === "billing_entitlements");
    expect(entitlementWrite?.data.examId).toBe("ati_teas_7");
    expect(entitlementWrite?.data.durationDaysSnapshot).toBe(30);
    expect(entitlementWrite?.data.extendedFromAccessEndsAt).toEqual(existingEnd);
    expect(entitlementWrite?.data.accessEndsAt).toEqual(new Date("2026-08-31T00:00:00.000Z"));
    const userWrite = writes.find((write) => write.collectionName === "users");
    expect((userWrite?.data.billing as { current_period_end?: unknown }).current_period_end).toEqual(
      new Date("2026-08-31T00:00:00.000Z")
    );
  });

  it("fails without trusted uid and plan metadata", async () => {
    const result = await writeBillingWebhookState({
      transaction: { get: async () => fakeSnapshot(null), set: () => undefined } as never,
      db: fakeDb() as never,
      eventRecordId: "stripe_evt_checkout",
      provider: "stripe",
      gateway: gateway(),
      providerEventId: "evt_checkout",
      normalizedEventType: "checkout_completed",
      plannedEffects: ["record_transaction", "grant_entitlements"],
      providerPayload: {
        id: "evt_checkout",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123", metadata: {} } },
      },
    });

    expect(result).toEqual({
      executed: false,
      status: "failed",
      writeTargets: [],
      message: "Verified webhook payload is missing trusted uid or planId metadata.",
    });
  });
});
