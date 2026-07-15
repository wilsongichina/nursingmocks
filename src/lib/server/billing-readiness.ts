import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import {
  getPublicBillingCatalog,
  resolveCheckoutReadiness,
  type CheckoutReadinessInput,
  type CheckoutReadinessResult,
  type PublicBillingCatalog,
} from "@/lib/billing/checkout-readiness";

const BILLING_PLANS_COLLECTION = "billing_plans";
const BILLING_GATEWAYS_COLLECTION = "billing_gateways";
const BILLING_PROVIDER_MAPPINGS_COLLECTION = "billing_provider_price_mappings";

type Serializable<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function serializeDates<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      toDateOrNull(entry) ? toDateOrNull(entry)?.toISOString() ?? null : entry,
    ])
  );
}

async function listCollection<T extends object>(collectionName: string) {
  const snapshot = await getAdminDb().collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T & { id: string });
}

export async function getBillingCatalog(): Promise<PublicBillingCatalog> {
  const [plans, gateways, providerPriceMappings] = await Promise.all([
    listCollection<BillingPlan>(BILLING_PLANS_COLLECTION),
    listCollection<PaymentGatewayConfig>(BILLING_GATEWAYS_COLLECTION),
    listCollection<ProviderPriceMapping>(BILLING_PROVIDER_MAPPINGS_COLLECTION),
  ]);

  return {
    plans: plans.map((plan) => ({ ...plan, planId: plan.planId ?? plan.id })),
    gateways: gateways.map((gateway) => ({ ...gateway, gatewayId: gateway.gatewayId ?? gateway.id })),
    providerPriceMappings: providerPriceMappings.map((mapping) => ({
      ...mapping,
      mappingId: mapping.mappingId ?? mapping.id,
    })),
  };
}

export async function getPublicSerializableBillingCatalog(): Promise<{
  plans: Serializable<BillingPlan>[];
  gateways: Serializable<PaymentGatewayConfig>[];
  providerPriceMappings: Serializable<ProviderPriceMapping>[];
  checkoutEnabled: false;
}> {
  const catalog = getPublicBillingCatalog(await getBillingCatalog());

  return {
    plans: catalog.plans.map((plan) => serializeDates(plan) as Serializable<BillingPlan>),
    gateways: catalog.gateways.map((gateway) => serializeDates(gateway) as Serializable<PaymentGatewayConfig>),
    providerPriceMappings: catalog.providerPriceMappings.map(
      (mapping) => serializeDates(mapping) as Serializable<ProviderPriceMapping>
    ),
    checkoutEnabled: false,
  };
}

export async function resolveSerializableCheckoutReadiness(
  input: CheckoutReadinessInput
): Promise<
  Omit<CheckoutReadinessResult, "plan" | "selectedGateway" | "selectedProviderPriceMapping"> & {
    plan: Serializable<BillingPlan> | null;
    selectedGateway: Serializable<PaymentGatewayConfig> | null;
    selectedProviderPriceMapping: Serializable<ProviderPriceMapping> | null;
  }
> {
  const result = resolveCheckoutReadiness(await getBillingCatalog(), input);

  return {
    ...result,
    plan: result.plan ? (serializeDates(result.plan) as Serializable<BillingPlan>) : null,
    selectedGateway: result.selectedGateway
      ? (serializeDates(result.selectedGateway) as Serializable<PaymentGatewayConfig>)
      : null,
    selectedProviderPriceMapping: result.selectedProviderPriceMapping
      ? (serializeDates(result.selectedProviderPriceMapping) as Serializable<ProviderPriceMapping>)
      : null,
  };
}
