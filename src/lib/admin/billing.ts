import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import type {
  BillingPlan,
  BillingAuditLogEntry,
  BillingEntitlement,
  BillingSubscription,
  BillingTransaction,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import {
  BILLING_INTERVALS,
  BILLING_PACKAGE_IDS,
  PLAN_STATUSES,
  PURCHASE_TYPES,
} from "@/lib/billing/models";
import type { BillingLiveControls } from "@/lib/billing/live-controls";
import {
  type CreateBillingPlanInput,
  type CreatePaymentGatewayInput,
  type CreateProviderPriceMappingInput,
  normalizePlanName,
  validateCreateBillingPlanInput,
  validateCreatePaymentGatewayInput,
  validateCreateProviderPriceMappingInput,
} from "@/lib/billing/admin-config";
import { getBillingLiveControls } from "@/lib/server/billing-live-controls";

const BILLING_PLANS_COLLECTION = "billing_plans";
const BILLING_GATEWAYS_COLLECTION = "billing_gateways";
const BILLING_PROVIDER_MAPPINGS_COLLECTION = "billing_provider_price_mappings";
const BILLING_AUDIT_LOG_COLLECTION = "billing_audit_logs";
const BILLING_TRANSACTIONS_COLLECTION = "billing_transactions";
const BILLING_SUBSCRIPTIONS_COLLECTION = "billing_subscriptions";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const BILLING_WEBHOOK_EVENTS_COLLECTION = "billing_webhook_events";
const BILLING_CHECKOUT_ATTEMPTS_COLLECTION = "billing_checkout_attempts";
const BILLING_OPERATION_REVIEWS_COLLECTION = "billing_operation_reviews";

type Serializable<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type AdminBillingConfigType = "plan" | "gateway" | "providerPriceMapping";
type AdminBillingPatch = Record<string, unknown>;

const PLAN_RELATIONSHIP_LOCKED_FIELDS = [
  "purchaseType",
  "billingInterval",
  "price",
  "currency",
  "trialDays",
  "packageIds",
  "gatewayIds",
];
const GATEWAY_RELATIONSHIP_LOCKED_FIELDS = [
  "supportedCurrencies",
  "supportedCountries",
  "supportedPaymentTypes",
  "supportsSubscriptions",
  "supportsOneTimePayments",
  "minimumAmount",
  "maximumAmount",
];
const PROVIDER_MAPPING_RELATIONSHIP_LOCKED_FIELDS = [
  "amount",
  "currency",
  "billingInterval",
  "purchaseType",
];

export type AdminBillingConfigSnapshot = {
  plans: Serializable<BillingPlan>[];
  gateways: Serializable<PaymentGatewayConfig>[];
  providerPriceMappings: Serializable<ProviderPriceMapping>[];
  transactions: Serializable<BillingTransaction>[];
  subscriptions: Serializable<BillingSubscription>[];
  entitlements: Serializable<BillingEntitlement>[];
  webhookEvents: Record<string, unknown>[];
  checkoutAttempts: Record<string, unknown>[];
  operationReviews: Record<string, unknown>[];
  auditLogs: Serializable<BillingAuditLogEntry>[];
  liveControls: BillingLiveControls;
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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }

  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function optionalNumberUpdate(value: unknown, field: string) {
  const parsed = numberOrNull(value);
  if (Number.isNaN(parsed)) throw new Error(`${field} must be a valid number.`);
  return parsed;
}

function booleanUpdate(value: unknown, field: string) {
  if (typeof value !== "boolean") throw new Error(`${field} must be true or false.`);
  return value;
}

function nonEmptyStringUpdate(value: unknown, field: string) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function rejectLockedPatchFields(patch: AdminBillingPatch, fields: string[], label: string) {
  const lockedField = fields.find((field) => field in patch);
  if (lockedField) {
    throw new Error(
      `${lockedField} cannot be edited after creation because it can affect related billing records. Create a new ${label} instead.`
    );
  }
}

function requiredNumberUpdate(value: unknown, field: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a valid number.`);
  return parsed;
}

function validateBillingContract(input: {
  purchaseType: string;
  billingInterval: string | null;
  price: number;
  currency: string;
  trialDays?: number;
}) {
  const issues: string[] = [];
  if (!(PURCHASE_TYPES as readonly string[]).includes(input.purchaseType)) {
    issues.push("Purchase type is not supported.");
  }
  if (input.billingInterval !== null && !(BILLING_INTERVALS as readonly string[]).includes(input.billingInterval)) {
    issues.push("Billing interval is not supported.");
  }
  if (input.purchaseType === "subscription" && input.billingInterval === null) {
    issues.push("Subscription plans require a billing interval.");
  }
  if (input.billingInterval === "lifetime" && input.purchaseType !== "one_time") {
    issues.push("Lifetime plans must use one-time purchase.");
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    issues.push("Price must be a non-negative number.");
  }
  if (!input.currency) issues.push("Currency is required.");
  if (input.trialDays !== undefined && (!Number.isFinite(input.trialDays) || input.trialDays < 0)) {
    issues.push("Trial days must be a non-negative number.");
  }

  if (issues.length > 0) throw new Error(issues.join(" "));
}

function createBillingAuditEntry(input: {
  action: string;
  entityType: string;
  entityId: string;
  gatewayId: string | null;
  planId: string | null;
  adminUid: string;
  beforeSummary: Record<string, unknown> | null;
  afterSummary: Record<string, unknown> | null;
  reason: string;
  timestamp: FieldValue;
}) {
  const auditRef = getAdminDb().collection(BILLING_AUDIT_LOG_COLLECTION).doc();
  return {
    ref: auditRef,
    data: {
      auditLogId: auditRef.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      gatewayId: input.gatewayId,
      planId: input.planId,
      uid: null,
      adminUid: input.adminUid,
      timestamp: input.timestamp,
      beforeSummary: input.beforeSummary,
      afterSummary: input.afterSummary,
      reason: input.reason,
      requestMetadata: null,
    },
  };
}

export async function getAdminBillingConfig(): Promise<AdminBillingConfigSnapshot> {
  const [
    plans,
    gateways,
    providerPriceMappings,
    transactions,
    subscriptions,
    entitlements,
    webhookEvents,
    checkoutAttempts,
    operationReviews,
    auditLogs,
    liveControls,
  ] = await Promise.all([
    listCollection<BillingPlan>(BILLING_PLANS_COLLECTION),
    listCollection<PaymentGatewayConfig>(BILLING_GATEWAYS_COLLECTION),
    listCollection<ProviderPriceMapping>(BILLING_PROVIDER_MAPPINGS_COLLECTION),
    listCollection<BillingTransaction>(BILLING_TRANSACTIONS_COLLECTION),
    listCollection<BillingSubscription>(BILLING_SUBSCRIPTIONS_COLLECTION),
    listCollection<BillingEntitlement>(BILLING_ENTITLEMENTS_COLLECTION),
    listCollection<Record<string, unknown>>(BILLING_WEBHOOK_EVENTS_COLLECTION),
    listCollection<Record<string, unknown>>(BILLING_CHECKOUT_ATTEMPTS_COLLECTION),
    listCollection<Record<string, unknown>>(BILLING_OPERATION_REVIEWS_COLLECTION),
    listCollection<BillingAuditLogEntry>(BILLING_AUDIT_LOG_COLLECTION),
    getBillingLiveControls(),
  ]);

  return {
    plans,
    gateways: gateways.sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId)),
    providerPriceMappings,
    transactions,
    subscriptions,
    entitlements,
    webhookEvents,
    checkoutAttempts,
    operationReviews,
    auditLogs,
    liveControls,
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

export async function createAdminBillingPlan(
  input: CreateBillingPlanInput,
  adminUid: string
): Promise<{ plan: Serializable<BillingPlan> }> {
  const db = getAdminDb();
  const [existingPlansSnapshot, gatewaysSnapshot] = await Promise.all([
    db.collection(BILLING_PLANS_COLLECTION).get(),
    db.collection(BILLING_GATEWAYS_COLLECTION).select().get(),
  ]);
  const existingPlanIds = existingPlansSnapshot.docs.map((doc) => doc.id);
  const existingSlugs = existingPlansSnapshot.docs
    .map((doc) => String(doc.data().slug ?? ""))
    .filter(Boolean);
  const gatewayIds = gatewaysSnapshot.docs.map((doc) => doc.id);
  const validation = validateCreateBillingPlanInput(input, {
    existingPlanIds,
    existingSlugs,
    gatewayIds,
    adminUid,
  });

  if (!validation.valid) {
    throw new Error(validation.issues.join(" "));
  }

  const now = FieldValue.serverTimestamp();
  const plan = {
    ...validation.plan,
    createdAt: now,
    updatedAt: now,
    createdBy: adminUid,
    updatedBy: adminUid,
  };

  const planRef = db.collection(BILLING_PLANS_COLLECTION).doc(validation.plan.planId);
  const auditRef = db.collection(BILLING_AUDIT_LOG_COLLECTION).doc();

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(planRef);
    if (existing.exists) {
      throw new Error("Plan ID already exists.");
    }

    transaction.set(planRef, plan);
    transaction.set(auditRef, {
      auditLogId: auditRef.id,
      action: "billing.plan.create",
      entityType: "billing_plan",
      entityId: validation.plan.planId,
      gatewayId: null,
      planId: validation.plan.planId,
      uid: null,
      adminUid,
      timestamp: now,
      beforeSummary: null,
      afterSummary: {
        status: validation.plan.status,
        purchaseType: validation.plan.purchaseType,
        price: validation.plan.price,
        currency: validation.plan.currency,
        gatewayIds: validation.plan.gatewayIds,
        packageIds: validation.plan.packageIds,
      },
      reason: "Admin billing plan created.",
      requestMetadata: null,
    });
  });

  return {
    plan: serializeDates({
      ...validation.plan,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminUid,
      updatedBy: adminUid,
    }) as Serializable<BillingPlan>,
  };
}

export async function createAdminProviderPriceMapping(
  input: CreateProviderPriceMappingInput,
  adminUid: string
): Promise<{ providerPriceMapping: Serializable<ProviderPriceMapping> }> {
  const db = getAdminDb();
  const [plansSnapshot, gatewaysSnapshot, mappingsSnapshot] = await Promise.all([
    db.collection(BILLING_PLANS_COLLECTION).get(),
    db.collection(BILLING_GATEWAYS_COLLECTION).get(),
    db.collection(BILLING_PROVIDER_MAPPINGS_COLLECTION).select().get(),
  ]);
  const plans = plansSnapshot.docs.map((doc) => doc.data() as BillingPlan);
  const gateways = gatewaysSnapshot.docs.map((doc) => doc.data() as PaymentGatewayConfig);
  const existingMappingIds = mappingsSnapshot.docs.map((doc) => doc.id);
  const validation = validateCreateProviderPriceMappingInput(input, {
    plans,
    gateways,
    existingMappingIds,
  });

  if (!validation.valid) {
    throw new Error(validation.issues.join(" "));
  }

  const now = FieldValue.serverTimestamp();
  const mapping = {
    ...validation.providerPriceMapping,
    createdAt: now,
    updatedAt: now,
  };
  const mappingRef = db
    .collection(BILLING_PROVIDER_MAPPINGS_COLLECTION)
    .doc(validation.providerPriceMapping.mappingId);
  const auditRef = db.collection(BILLING_AUDIT_LOG_COLLECTION).doc();

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(mappingRef);
    if (existing.exists) {
      throw new Error("Mapping ID already exists.");
    }

    transaction.set(mappingRef, mapping);
    transaction.set(auditRef, {
      auditLogId: auditRef.id,
      action: "billing.provider_price_mapping.create",
      entityType: "provider_price_mapping",
      entityId: validation.providerPriceMapping.mappingId,
      gatewayId: validation.providerPriceMapping.gatewayId,
      planId: validation.providerPriceMapping.planId,
      uid: null,
      adminUid,
      timestamp: now,
      beforeSummary: null,
      afterSummary: {
        provider: validation.providerPriceMapping.provider,
        environment: validation.providerPriceMapping.environment,
        amount: validation.providerPriceMapping.amount,
        currency: validation.providerPriceMapping.currency,
        externalPriceId: validation.providerPriceMapping.externalPriceId,
        externalPlanId: validation.providerPriceMapping.externalPlanId,
      },
      reason: "Admin provider price mapping created.",
      requestMetadata: null,
    });
  });

  return {
    providerPriceMapping: serializeDates({
      ...validation.providerPriceMapping,
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as Serializable<ProviderPriceMapping>,
  };
}

export async function updateAdminBillingConfig(
  type: AdminBillingConfigType,
  id: string,
  patch: AdminBillingPatch,
  adminUid: string
) {
  if (type === "plan") {
    return updateAdminBillingPlan(id, patch, adminUid);
  }

  if (type === "gateway") {
    return updateAdminPaymentGateway(id, patch, adminUid);
  }

  if (type === "providerPriceMapping") {
    return updateAdminProviderPriceMapping(id, patch, adminUid);
  }

  throw new Error("Unsupported billing configuration type.");
}

async function updateAdminBillingPlan(
  planId: string,
  patch: AdminBillingPatch,
  adminUid: string
): Promise<{ plan: Serializable<BillingPlan> }> {
  const db = getAdminDb();
  const planRef = db.collection(BILLING_PLANS_COLLECTION).doc(text(planId));
  const [gatewaysSnapshot, mappingsSnapshot] = await Promise.all([
    db.collection(BILLING_GATEWAYS_COLLECTION).select().get(),
    db.collection(BILLING_PROVIDER_MAPPINGS_COLLECTION).where("planId", "==", text(planId)).get(),
  ]);
  const gatewayIds = new Set(gatewaysSnapshot.docs.map((doc) => doc.id));
  const planMappings = mappingsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    mappingId: doc.id,
  })) as ProviderPriceMapping[];
  const now = FieldValue.serverTimestamp();
  let updatedPlan: BillingPlan | undefined;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(planRef);
    if (!snapshot.exists) throw new Error("Billing plan not found.");

    const before = { ...snapshot.data(), planId: snapshot.id } as BillingPlan;
    const update: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: adminUid,
    };
    rejectLockedPatchFields(patch, PLAN_RELATIONSHIP_LOCKED_FIELDS, "billing plan");

    if ("name" in patch) update.name = normalizePlanName(nonEmptyStringUpdate(patch.name, "Plan name"));
    if ("description" in patch) update.description = text(patch.description);
    if ("shortDescription" in patch) update.shortDescription = text(patch.shortDescription);
    if ("status" in patch) {
      const status = text(patch.status);
      if (!(PLAN_STATUSES as readonly string[]).includes(status)) throw new Error("Plan status is not supported.");
      update.status = status as BillingPlan["status"];
    }
    if ("purchaseType" in patch) {
      const purchaseType = text(patch.purchaseType);
      if (!(PURCHASE_TYPES as readonly string[]).includes(purchaseType)) throw new Error("Purchase type is not supported.");
      update.purchaseType = purchaseType;
    }
    if ("billingInterval" in patch) {
      const billingInterval = text(patch.billingInterval) || null;
      if (billingInterval !== null && !(BILLING_INTERVALS as readonly string[]).includes(billingInterval)) {
        throw new Error("Billing interval is not supported.");
      }
      update.billingInterval = billingInterval;
    }
    if ("price" in patch) {
      const price = requiredNumberUpdate(patch.price, "Price");
      if (price < 0) throw new Error("Price must be a non-negative number.");
      update.price = price;
    }
    if ("currency" in patch) update.currency = nonEmptyStringUpdate(patch.currency, "Currency").toUpperCase();
    if ("trialDays" in patch) {
      const trialDays = requiredNumberUpdate(patch.trialDays, "Trial days");
      if (trialDays < 0) throw new Error("Trial days must be a non-negative number.");
      update.trialDays = trialDays;
    }
    if ("packageIds" in patch) {
      const packageIds = stringList(patch.packageIds);
      const invalidPackageId = packageIds.find((packageId) => !(BILLING_PACKAGE_IDS as readonly string[]).includes(packageId));
      if (invalidPackageId) throw new Error(`Package ${invalidPackageId} is not supported.`);
      update.packageIds = packageIds;
    }
    if ("gatewayIds" in patch) {
      const nextGatewayIds = stringList(patch.gatewayIds);
      const invalidGatewayId = nextGatewayIds.find((gatewayId) => !gatewayIds.has(gatewayId));
      if (invalidGatewayId) throw new Error(`Gateway ${invalidGatewayId} does not exist.`);
      update.gatewayIds = nextGatewayIds;
    }
    if ("isPublic" in patch) update.isPublic = booleanUpdate(patch.isPublic, "Public");
    if ("isFeatured" in patch) update.isFeatured = booleanUpdate(patch.isFeatured, "Featured");
    if ("displayOrder" in patch) {
      const displayOrder = optionalNumberUpdate(patch.displayOrder, "Display order");
      if (displayOrder === null) throw new Error("Display order is required.");
      update.displayOrder = displayOrder;
    }

    const nextPlan = { ...before, ...update } as BillingPlan;
    validateBillingContract({
      purchaseType: nextPlan.purchaseType,
      billingInterval: nextPlan.billingInterval,
      price: nextPlan.price,
      currency: nextPlan.currency,
      trialDays: nextPlan.trialDays,
    });
    if (nextPlan.status === "active" && nextPlan.packageIds.length === 0) {
      throw new Error("Active plans must include at least one package.");
    }
    if (nextPlan.status === "active" && nextPlan.gatewayIds.length === 0) {
      throw new Error("Active plans must include at least one gateway.");
    }
    const conflictingMapping = planMappings.find(
      (mapping) =>
        mapping.active &&
        (!nextPlan.gatewayIds.includes(mapping.gatewayId) ||
          mapping.amount !== nextPlan.price ||
          mapping.currency.toUpperCase() !== nextPlan.currency.toUpperCase() ||
          mapping.purchaseType !== nextPlan.purchaseType ||
          mapping.billingInterval !== nextPlan.billingInterval)
    );
    if (conflictingMapping) {
      throw new Error(
        `Active provider mapping ${conflictingMapping.mappingId} must match the plan price, currency, interval, purchase type, and assigned gateways.`
      );
    }
    if (Object.keys(update).length <= 2) throw new Error("No editable plan fields were provided.");

    updatedPlan = {
      ...nextPlan,
      updatedAt: new Date(),
      updatedBy: adminUid,
    } as BillingPlan;

    const audit = createBillingAuditEntry({
      action: "billing.plan.update",
      entityType: "billing_plan",
      entityId: before.planId,
      gatewayId: null,
      planId: before.planId,
      adminUid,
      timestamp: now,
      beforeSummary: {
        name: before.name,
        description: before.description,
        shortDescription: before.shortDescription,
        status: before.status,
        purchaseType: before.purchaseType,
        billingInterval: before.billingInterval,
        price: before.price,
        currency: before.currency,
        packageIds: before.packageIds,
        gatewayIds: before.gatewayIds,
        trialDays: before.trialDays,
        isPublic: before.isPublic,
        isFeatured: before.isFeatured,
        displayOrder: before.displayOrder,
      },
      afterSummary: {
        name: updatedPlan.name,
        description: updatedPlan.description,
        shortDescription: updatedPlan.shortDescription,
        status: updatedPlan.status,
        purchaseType: updatedPlan.purchaseType,
        billingInterval: updatedPlan.billingInterval,
        price: updatedPlan.price,
        currency: updatedPlan.currency,
        packageIds: updatedPlan.packageIds,
        gatewayIds: updatedPlan.gatewayIds,
        trialDays: updatedPlan.trialDays,
        isPublic: updatedPlan.isPublic,
        isFeatured: updatedPlan.isFeatured,
        displayOrder: updatedPlan.displayOrder,
      },
      reason: "Admin billing plan updated.",
    });

    transaction.update(planRef, update as FirebaseFirestore.UpdateData<BillingPlan>);
    transaction.set(audit.ref, audit.data);
  });

  if (!updatedPlan) throw new Error("Billing plan could not be updated.");
  return { plan: serializeDates(updatedPlan) as Serializable<BillingPlan> };
}

async function updateAdminPaymentGateway(
  gatewayId: string,
  patch: AdminBillingPatch,
  adminUid: string
): Promise<{ gateway: Serializable<PaymentGatewayConfig> }> {
  const db = getAdminDb();
  const gatewayRef = db.collection(BILLING_GATEWAYS_COLLECTION).doc(text(gatewayId));
  const now = FieldValue.serverTimestamp();
  let updatedGateway: PaymentGatewayConfig | undefined;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(gatewayRef);
    if (!snapshot.exists) throw new Error("Payment gateway not found.");

    const before = { ...snapshot.data(), gatewayId: snapshot.id } as PaymentGatewayConfig;
    const update: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: adminUid,
    };
    rejectLockedPatchFields(patch, GATEWAY_RELATIONSHIP_LOCKED_FIELDS, "payment gateway");

    if ("displayName" in patch) update.displayName = nonEmptyStringUpdate(patch.displayName, "Display name");
    if ("enabled" in patch) update.enabled = booleanUpdate(patch.enabled, "Enabled");
    if ("isDefault" in patch) update.isDefault = booleanUpdate(patch.isDefault, "Default gateway");
    if ("publishableKeyRef" in patch) update.publishableKeyRef = text(patch.publishableKeyRef) || null;
    if ("secretKeyRef" in patch) update.secretKeyRef = text(patch.secretKeyRef) || null;
    if ("webhookSecretRef" in patch) update.webhookSecretRef = text(patch.webhookSecretRef) || null;
    if ("supportedCurrencies" in patch) {
      const supportedCurrencies = stringList(patch.supportedCurrencies).map((currency) => currency.toUpperCase());
      if (supportedCurrencies.length === 0) throw new Error("At least one supported currency is required.");
      update.supportedCurrencies = supportedCurrencies;
    }
    if ("supportedCountries" in patch) {
      update.supportedCountries = stringList(patch.supportedCountries).map((country) => country.toUpperCase());
    }
    if ("supportedPaymentTypes" in patch) {
      const supportedPaymentTypes = stringList(patch.supportedPaymentTypes);
      if (supportedPaymentTypes.length === 0) throw new Error("At least one payment type is required.");
      const invalidPaymentType = supportedPaymentTypes.find((paymentType) => !(PURCHASE_TYPES as readonly string[]).includes(paymentType));
      if (invalidPaymentType) throw new Error(`Payment type ${invalidPaymentType} is not supported.`);
      update.supportedPaymentTypes = supportedPaymentTypes;
    }
    if ("supportsSubscriptions" in patch) {
      update.supportsSubscriptions = booleanUpdate(patch.supportsSubscriptions, "Supports subscriptions");
    }
    if ("supportsOneTimePayments" in patch) {
      update.supportsOneTimePayments = booleanUpdate(patch.supportsOneTimePayments, "Supports one-time payments");
    }
    if ("minimumAmount" in patch) update.minimumAmount = optionalNumberUpdate(patch.minimumAmount, "Minimum amount");
    if ("maximumAmount" in patch) update.maximumAmount = optionalNumberUpdate(patch.maximumAmount, "Maximum amount");
    if ("priority" in patch) {
      const priority = optionalNumberUpdate(patch.priority, "Priority");
      if (priority === null) throw new Error("Priority is required.");
      update.priority = priority;
    }

    const nextMinimum = update.minimumAmount ?? before.minimumAmount;
    const nextMaximum = update.maximumAmount ?? before.maximumAmount;
    if (nextMinimum !== null && nextMaximum !== null && nextMinimum > nextMaximum) {
      throw new Error("Minimum amount cannot be greater than maximum amount.");
    }
    if (Object.keys(update).length <= 2) throw new Error("No editable gateway fields were provided.");

    updatedGateway = {
      ...before,
      ...update,
      updatedAt: new Date(),
      updatedBy: adminUid,
    } as PaymentGatewayConfig;

    const audit = createBillingAuditEntry({
      action: "billing.gateway.update",
      entityType: "payment_gateway",
      entityId: before.gatewayId,
      gatewayId: before.gatewayId,
      planId: null,
      adminUid,
      timestamp: now,
      beforeSummary: {
        displayName: before.displayName,
        enabled: before.enabled,
        isDefault: before.isDefault,
        publishableKeyRef: before.publishableKeyRef,
        secretKeyRef: before.secretKeyRef,
        webhookSecretRef: before.webhookSecretRef,
        supportedCurrencies: before.supportedCurrencies,
        supportedCountries: before.supportedCountries,
        supportedPaymentTypes: before.supportedPaymentTypes,
        supportsSubscriptions: before.supportsSubscriptions,
        supportsOneTimePayments: before.supportsOneTimePayments,
        minimumAmount: before.minimumAmount,
        maximumAmount: before.maximumAmount,
        priority: before.priority,
      },
      afterSummary: {
        displayName: updatedGateway.displayName,
        enabled: updatedGateway.enabled,
        isDefault: updatedGateway.isDefault,
        publishableKeyRef: updatedGateway.publishableKeyRef,
        secretKeyRef: updatedGateway.secretKeyRef,
        webhookSecretRef: updatedGateway.webhookSecretRef,
        supportedCurrencies: updatedGateway.supportedCurrencies,
        supportedCountries: updatedGateway.supportedCountries,
        supportedPaymentTypes: updatedGateway.supportedPaymentTypes,
        supportsSubscriptions: updatedGateway.supportsSubscriptions,
        supportsOneTimePayments: updatedGateway.supportsOneTimePayments,
        minimumAmount: updatedGateway.minimumAmount,
        maximumAmount: updatedGateway.maximumAmount,
        priority: updatedGateway.priority,
      },
      reason: "Admin payment gateway updated.",
    });

    transaction.update(gatewayRef, update as FirebaseFirestore.UpdateData<PaymentGatewayConfig>);
    transaction.set(audit.ref, audit.data);
  });

  if (!updatedGateway) throw new Error("Payment gateway could not be updated.");
  return { gateway: serializeDates(updatedGateway) as Serializable<PaymentGatewayConfig> };
}

async function updateAdminProviderPriceMapping(
  mappingId: string,
  patch: AdminBillingPatch,
  adminUid: string
): Promise<{ providerPriceMapping: Serializable<ProviderPriceMapping> }> {
  const db = getAdminDb();
  const mappingRef = db.collection(BILLING_PROVIDER_MAPPINGS_COLLECTION).doc(text(mappingId));
  const now = FieldValue.serverTimestamp();
  let updatedMapping: ProviderPriceMapping | undefined;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(mappingRef);
    if (!snapshot.exists) throw new Error("Provider price mapping not found.");

    const before = { ...snapshot.data(), mappingId: snapshot.id } as ProviderPriceMapping;
    const planSnapshot = await transaction.get(db.collection(BILLING_PLANS_COLLECTION).doc(before.planId));
    const gatewaySnapshot = await transaction.get(db.collection(BILLING_GATEWAYS_COLLECTION).doc(before.gatewayId));
    if (!planSnapshot.exists) throw new Error("Selected plan does not exist.");
    if (!gatewaySnapshot.exists) throw new Error("Selected gateway does not exist.");

    const plan = { ...planSnapshot.data(), planId: planSnapshot.id } as BillingPlan;
    const gateway = { ...gatewaySnapshot.data(), gatewayId: gatewaySnapshot.id } as PaymentGatewayConfig;
    const update: Record<string, unknown> = { updatedAt: now };
    rejectLockedPatchFields(patch, PROVIDER_MAPPING_RELATIONSHIP_LOCKED_FIELDS, "provider price mapping");

    if ("externalProductId" in patch) update.externalProductId = text(patch.externalProductId) || null;
    if ("externalPriceId" in patch) update.externalPriceId = text(patch.externalPriceId) || null;
    if ("externalPlanId" in patch) update.externalPlanId = text(patch.externalPlanId) || null;
    if ("amount" in patch) {
      const amount = requiredNumberUpdate(patch.amount, "Amount");
      if (amount < 0) throw new Error("Amount must be a non-negative number.");
      update.amount = amount;
    }
    if ("currency" in patch) update.currency = nonEmptyStringUpdate(patch.currency, "Currency").toUpperCase();
    if ("billingInterval" in patch) {
      const billingInterval = text(patch.billingInterval) || null;
      if (billingInterval !== null && !(BILLING_INTERVALS as readonly string[]).includes(billingInterval)) {
        throw new Error("Billing interval is not supported.");
      }
      update.billingInterval = billingInterval;
    }
    if ("purchaseType" in patch) {
      const purchaseType = text(patch.purchaseType);
      if (!(PURCHASE_TYPES as readonly string[]).includes(purchaseType)) throw new Error("Purchase type is not supported.");
      update.purchaseType = purchaseType;
    }
    if ("active" in patch) update.active = booleanUpdate(patch.active, "Active");

    const nextMapping = { ...before, ...update } as ProviderPriceMapping;
    const nextExternalPriceId = nextMapping.externalPriceId;
    const nextExternalPlanId = nextMapping.externalPlanId;
    if (!nextExternalPriceId && !nextExternalPlanId) {
      throw new Error("External price ID or external plan ID is required.");
    }
    validateBillingContract({
      purchaseType: nextMapping.purchaseType,
      billingInterval: nextMapping.billingInterval,
      price: nextMapping.amount,
      currency: nextMapping.currency,
    });
    if (!plan.gatewayIds.includes(gateway.gatewayId)) {
      throw new Error("Selected gateway is not assigned to this plan.");
    }
    if (gateway.provider !== nextMapping.provider) throw new Error("Provider must match the selected gateway.");
    if (gateway.environment !== nextMapping.environment) throw new Error("Environment must match the selected gateway.");
    if (plan.price !== nextMapping.amount) throw new Error("Mapping amount must match the plan price.");
    if (plan.currency.toUpperCase() !== nextMapping.currency.toUpperCase()) {
      throw new Error("Mapping currency must match the plan currency.");
    }
    if (plan.purchaseType !== nextMapping.purchaseType) {
      throw new Error("Mapping purchase type must match the plan purchase type.");
    }
    if (plan.billingInterval !== nextMapping.billingInterval) {
      throw new Error("Mapping billing interval must match the plan billing interval.");
    }
    if (Object.keys(update).length <= 1) throw new Error("No editable provider mapping fields were provided.");

    updatedMapping = {
      ...nextMapping,
      updatedAt: new Date(),
    } as ProviderPriceMapping;

    const audit = createBillingAuditEntry({
      action: "billing.provider_price_mapping.update",
      entityType: "provider_price_mapping",
      entityId: before.mappingId,
      gatewayId: before.gatewayId,
      planId: before.planId,
      adminUid,
      timestamp: now,
      beforeSummary: {
        active: before.active,
        externalProductId: before.externalProductId,
        externalPriceId: before.externalPriceId,
        externalPlanId: before.externalPlanId,
        amount: before.amount,
        currency: before.currency,
        billingInterval: before.billingInterval,
        purchaseType: before.purchaseType,
      },
      afterSummary: {
        active: updatedMapping.active,
        externalProductId: updatedMapping.externalProductId,
        externalPriceId: updatedMapping.externalPriceId,
        externalPlanId: updatedMapping.externalPlanId,
        amount: updatedMapping.amount,
        currency: updatedMapping.currency,
        billingInterval: updatedMapping.billingInterval,
        purchaseType: updatedMapping.purchaseType,
      },
      reason: "Admin provider price mapping updated.",
    });

    transaction.update(mappingRef, update as FirebaseFirestore.UpdateData<ProviderPriceMapping>);
    transaction.set(audit.ref, audit.data);
  });

  if (!updatedMapping) throw new Error("Provider price mapping could not be updated.");
  return {
    providerPriceMapping: serializeDates(updatedMapping) as Serializable<ProviderPriceMapping>,
  };
}
