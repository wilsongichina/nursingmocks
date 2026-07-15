import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import {
  type CreatePaymentGatewayInput,
  validateCreatePaymentGatewayInput,
} from "@/lib/billing/admin-config";

const BILLING_PLANS_COLLECTION = "billing_plans";
const BILLING_GATEWAYS_COLLECTION = "billing_gateways";
const BILLING_PROVIDER_MAPPINGS_COLLECTION = "billing_provider_price_mappings";
const BILLING_AUDIT_LOG_COLLECTION = "billing_audit_logs";

type Serializable<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

export type AdminBillingConfigSnapshot = {
  plans: Serializable<BillingPlan>[];
  gateways: Serializable<PaymentGatewayConfig>[];
  providerPriceMappings: Serializable<ProviderPriceMapping>[];
};

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function toIsoOrNull(value: unknown): string | null {
  return toDateOrNull(value)?.toISOString() ?? null;
}

function serializeDates<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      toDateOrNull(entry) ? toIsoOrNull(entry) : entry,
    ])
  );
}

async function listCollection<T extends object>(collectionName: string) {
  const snapshot = await getAdminDb().collection(collectionName).get();
  return snapshot.docs.map((doc) => serializeDates({ ...doc.data(), id: doc.id }) as Serializable<T>);
}

export async function getAdminBillingConfig(): Promise<AdminBillingConfigSnapshot> {
  const [plans, gateways, providerPriceMappings] = await Promise.all([
    listCollection<BillingPlan>(BILLING_PLANS_COLLECTION),
    listCollection<PaymentGatewayConfig>(BILLING_GATEWAYS_COLLECTION),
    listCollection<ProviderPriceMapping>(BILLING_PROVIDER_MAPPINGS_COLLECTION),
  ]);

  return {
    plans,
    gateways: gateways.sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId)),
    providerPriceMappings,
  };
}

export async function createAdminPaymentGateway(
  input: CreatePaymentGatewayInput,
  adminUid: string
): Promise<{ gateway: Serializable<PaymentGatewayConfig> }> {
  const db = getAdminDb();
  const existingSnapshot = await db.collection(BILLING_GATEWAYS_COLLECTION).select().get();
  const existingGatewayIds = existingSnapshot.docs.map((doc) => doc.id);
  const validation = validateCreatePaymentGatewayInput(input, { existingGatewayIds, adminUid });

  if (!validation.valid) {
    throw new Error(validation.issues.join(" "));
  }

  const now = FieldValue.serverTimestamp();
  const gateway = {
    ...validation.gateway,
    createdAt: now,
    updatedAt: now,
    createdBy: adminUid,
    updatedBy: adminUid,
  };

  const gatewayRef = db.collection(BILLING_GATEWAYS_COLLECTION).doc(validation.gateway.gatewayId);
  const auditRef = db.collection(BILLING_AUDIT_LOG_COLLECTION).doc();

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(gatewayRef);
    if (existing.exists) {
      throw new Error("Gateway ID already exists.");
    }

    transaction.set(gatewayRef, gateway);
    transaction.set(auditRef, {
      auditLogId: auditRef.id,
      action: "billing.gateway.create",
      entityType: "payment_gateway",
      entityId: validation.gateway.gatewayId,
      gatewayId: validation.gateway.gatewayId,
      planId: null,
      uid: null,
      adminUid,
      timestamp: now,
      beforeSummary: null,
      afterSummary: {
        provider: validation.gateway.provider,
        environment: validation.gateway.environment,
        enabled: validation.gateway.enabled,
      },
      reason: "Admin billing gateway configuration created.",
      requestMetadata: null,
    });
  });

  return {
    gateway: serializeDates({
      ...validation.gateway,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminUid,
      updatedBy: adminUid,
    }) as Serializable<PaymentGatewayConfig>,
  };
}
