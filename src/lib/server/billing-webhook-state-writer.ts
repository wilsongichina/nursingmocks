import { FieldValue, type Transaction } from "firebase-admin/firestore";
import type { BillingWebhookEffect } from "@/lib/billing/webhook-effect-plan";
import type { BillingWebhookEventType } from "@/lib/billing/webhook-events";
import type { BillingPlan, BillingProvider, PaymentGatewayConfig, ProviderPriceMapping } from "@/lib/billing/models";
import type { BillingWebhookWriteTarget } from "@/lib/billing/webhook-effect-execution";
import { entitlementPatchForPackageIds } from "@/lib/user-entitlements";

const BILLING_PLANS_COLLECTION = "billing_plans";
const BILLING_PROVIDER_MAPPINGS_COLLECTION = "billing_provider_price_mappings";
const BILLING_TRANSACTIONS_COLLECTION = "billing_transactions";
const BILLING_SUBSCRIPTIONS_COLLECTION = "billing_subscriptions";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const BILLING_AUDIT_LOGS_COLLECTION = "billing_audit_logs";
const USERS_COLLECTION = "users";

export type BillingWebhookStateWriteInput = {
  transaction: Transaction;
  db: FirebaseFirestore.Firestore;
  eventRecordId: string;
  provider: BillingProvider;
  gateway: PaymentGatewayConfig;
  providerEventId: string;
  normalizedEventType: BillingWebhookEventType;
  plannedEffects: BillingWebhookEffect[];
  providerPayload: Record<string, unknown>;
};

export type BillingWebhookStateWriteResult = {
  executed: boolean;
  status: "ready" | "failed";
  writeTargets: BillingWebhookWriteTarget[];
  message: string;
};

type StripeObject = Record<string, unknown> & {
  id?: unknown;
  object?: unknown;
  amount_total?: unknown;
  amount_paid?: unknown;
  amount_due?: unknown;
  currency?: unknown;
  customer?: unknown;
  customer_email?: unknown;
  subscription?: unknown;
  payment_intent?: unknown;
  invoice?: unknown;
  mode?: unknown;
  status?: unknown;
  metadata?: unknown;
  subscription_details?: unknown;
  lines?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function metadataValue(value: unknown) {
  const metadata = objectValue(value);
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, entry]) => typeof entry === "string")
      .map(([key, entry]) => [key, (entry as string).trim()])
  );
}

function stripeObject(payload: Record<string, unknown>): StripeObject {
  const data = objectValue(payload.data);
  return objectValue(data.object) as StripeObject;
}

function stripeMetadata(object: StripeObject) {
  const subscriptionDetails = objectValue(object.subscription_details);
  return {
    ...metadataValue(subscriptionDetails.metadata),
    ...metadataValue(object.metadata),
  };
}

function providerCustomerId(object: StripeObject) {
  return stringValue(object.customer);
}

function providerSubscriptionId(object: StripeObject) {
  return stringValue(object.subscription) || stringValue(object.id);
}

function providerPaymentId(object: StripeObject) {
  return stringValue(object.payment_intent) || stringValue(object.id);
}

function amountFromStripeObject(object: StripeObject) {
  const cents = numberValue(object.amount_total) ?? numberValue(object.amount_paid) ?? numberValue(object.amount_due) ?? 0;
  return cents / 100;
}

function currencyFromStripeObject(object: StripeObject, fallback: string) {
  return stringValue(object.currency)?.toUpperCase() ?? fallback.toUpperCase();
}

async function loadPlan(input: BillingWebhookStateWriteInput, planId: string) {
  const planRef = input.db.collection(BILLING_PLANS_COLLECTION).doc(planId);
  const planSnapshot = await input.transaction.get(planRef);
  return planSnapshot.exists ? ({ ...planSnapshot.data(), planId } as BillingPlan) : null;
}

async function loadMapping(input: BillingWebhookStateWriteInput, mappingId: string | null) {
  if (!mappingId) return null;
  const mappingRef = input.db.collection(BILLING_PROVIDER_MAPPINGS_COLLECTION).doc(mappingId);
  const mappingSnapshot = await input.transaction.get(mappingRef);
  return mappingSnapshot.exists ? ({ ...mappingSnapshot.data(), mappingId } as ProviderPriceMapping) : null;
}

function entitlementDocId(uid: string, packageId: string, planId: string) {
  return `${uid}_${packageId}_${planId}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export async function writeBillingWebhookState(
  input: BillingWebhookStateWriteInput
): Promise<BillingWebhookStateWriteResult> {
  const object = stripeObject(input.providerPayload);
  const metadata = stripeMetadata(object);
  const uid = metadata.uid || metadata.userId || null;
  const planId = metadata.planId || metadata.plan_id || null;
  const mappingId = metadata.mappingId || metadata.providerPriceMappingId || null;

  if (!uid || !planId) {
    return {
      executed: false,
      status: "failed",
      writeTargets: [],
      message: "Verified webhook payload is missing trusted uid or planId metadata.",
    };
  }

  const plan = await loadPlan(input, planId);
  if (!plan) {
    return {
      executed: false,
      status: "failed",
      writeTargets: [],
      message: "Verified webhook payload references a plan that was not found.",
    };
  }

  const mapping = await loadMapping(input, mappingId);
  const writeTargets = new Set<BillingWebhookWriteTarget>();
  const userRef = input.db.collection(USERS_COLLECTION).doc(uid);
  const auditRef = input.db.collection(BILLING_AUDIT_LOGS_COLLECTION).doc();
  const providerSubscription = providerSubscriptionId(object);
  const subscriptionId = providerSubscription
    ? `${input.provider}_${providerSubscription}`.toLowerCase().replace(/[^a-z0-9]+/g, "_")
    : null;
  const providerPriceId = mapping?.externalPriceId ?? null;

  if (input.plannedEffects.some((effect) => ["record_transaction", "mark_invoice_paid", "mark_invoice_failed"].includes(effect))) {
    const transactionRef = input.db
      .collection(BILLING_TRANSACTIONS_COLLECTION)
      .doc(`${input.provider}_${input.providerEventId}`.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
    const failed = input.normalizedEventType === "invoice_payment_failed";

    input.transaction.set(
      transactionRef,
      {
        transactionId: transactionRef.id,
        uid,
        planId,
        planNameSnapshot: plan.name,
        purchaseType: plan.purchaseType,
        amount: amountFromStripeObject(object) || plan.price,
        currency: currencyFromStripeObject(object, plan.currency),
        billingIntervalSnapshot: plan.billingInterval,
        packageIdsSnapshot: plan.packageIds,
        gatewayId: input.gateway.gatewayId,
        provider: input.provider,
        providerCustomerId: providerCustomerId(object),
        providerPaymentId: providerPaymentId(object),
        providerInvoiceId: stringValue(object.invoice) || (input.normalizedEventType.startsWith("invoice") ? stringValue(object.id) : null),
        providerSubscriptionId: providerSubscription,
        providerPriceId,
        status: failed ? "failed" : "paid",
        paymentMethodSummary: null,
        createdAt: FieldValue.serverTimestamp(),
        paidAt: failed ? null : FieldValue.serverTimestamp(),
        refundedAt: null,
        metadata: {
          webhookEventRecordId: input.eventRecordId,
          providerEventId: input.providerEventId,
          normalizedEventType: input.normalizedEventType,
          mappingId,
        },
      },
      { merge: true }
    );
    writeTargets.add("billing_transactions");
  }

  if (input.plannedEffects.includes("create_or_update_subscription") && subscriptionId && plan.billingInterval) {
    const cancelled = input.normalizedEventType === "subscription_cancelled";
    const subscriptionRef = input.db.collection(BILLING_SUBSCRIPTIONS_COLLECTION).doc(subscriptionId);

    input.transaction.set(
      subscriptionRef,
      {
        subscriptionId,
        uid,
        planId,
        gatewayId: input.gateway.gatewayId,
        provider: input.provider,
        providerSubscriptionId: providerSubscription,
        providerCustomerId: providerCustomerId(object),
        providerPriceId,
        status: cancelled ? "cancelled" : "active",
        providerStatus: stringValue(object.status) ?? (cancelled ? "cancelled" : "active"),
        billingInterval: plan.billingInterval,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        cancelledAt: cancelled ? FieldValue.serverTimestamp() : null,
        endedAt: cancelled ? FieldValue.serverTimestamp() : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastSyncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    writeTargets.add("billing_subscriptions");
  }

  if (input.plannedEffects.includes("grant_entitlements")) {
    for (const packageId of plan.packageIds) {
      const entitlementRef = input.db.collection(BILLING_ENTITLEMENTS_COLLECTION).doc(entitlementDocId(uid, packageId, planId));
      input.transaction.set(
        entitlementRef,
        {
          entitlementId: entitlementRef.id,
          uid,
          packageId,
          status: "active",
          source: plan.purchaseType === "subscription" ? "subscription" : "one_time_purchase",
          sourcePlanId: planId,
          sourceTransactionId: `${input.provider}_${input.providerEventId}`.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          sourceSubscriptionId: subscriptionId,
          gatewayId: input.gateway.gatewayId,
          provider: input.provider,
          grantedAt: FieldValue.serverTimestamp(),
          accessStartsAt: FieldValue.serverTimestamp(),
          accessEndsAt: null,
          revokedAt: null,
          revokedBy: null,
          manualGrantReason: null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    input.transaction.set(
      userRef,
      {
        entitlements: entitlementPatchForPackageIds(plan.packageIds, true),
        billing: {
          subscription_status: plan.purchaseType === "subscription" ? "active" : null,
          plan_id: planId,
          interval: plan.billingInterval === "monthly" || plan.billingInterval === "yearly" ? plan.billingInterval : null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          active_provider: input.provider,
          active_subscription_ref: subscriptionId,
        },
        [`billing_providers.${input.provider}.customer_id`]: providerCustomerId(object),
        [`billing_providers.${input.provider}.subscription_id`]: providerSubscription,
        [`billing_providers.${input.provider}.last_event_at`]: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    writeTargets.add("billing_entitlements");
    writeTargets.add("user_billing_summary");
  }

  if (input.plannedEffects.includes("revoke_or_expire_entitlements")) {
    for (const packageId of plan.packageIds) {
      const entitlementRef = input.db.collection(BILLING_ENTITLEMENTS_COLLECTION).doc(entitlementDocId(uid, packageId, planId));
      input.transaction.set(
        entitlementRef,
        {
          entitlementId: entitlementRef.id,
          uid,
          packageId,
          status: "expired",
          sourcePlanId: planId,
          gatewayId: input.gateway.gatewayId,
          provider: input.provider,
          revokedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    input.transaction.set(
      userRef,
      {
        entitlements: entitlementPatchForPackageIds(plan.packageIds, false),
        billing: {
          subscription_status: "canceled",
          plan_id: planId,
          interval: plan.billingInterval === "monthly" || plan.billingInterval === "yearly" ? plan.billingInterval : null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          active_provider: input.provider,
          active_subscription_ref: subscriptionId,
        },
        [`billing_providers.${input.provider}.last_event_at`]: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    writeTargets.add("billing_entitlements");
    writeTargets.add("user_billing_summary");
  }

  input.transaction.set(auditRef, {
    auditLogId: auditRef.id,
    action: "webhook_effects_executed",
    entityType: "billing_webhook_event",
    entityId: input.eventRecordId,
    gatewayId: input.gateway.gatewayId,
    planId,
    uid,
    adminUid: null,
    timestamp: FieldValue.serverTimestamp(),
    beforeSummary: null,
    afterSummary: {
      provider: input.provider,
      providerEventId: input.providerEventId,
      normalizedEventType: input.normalizedEventType,
      plannedEffects: input.plannedEffects,
      writeTargets: Array.from(writeTargets),
    },
    reason: "Verified billing webhook effects executed.",
    requestMetadata: null,
  });
  writeTargets.add("billing_audit_logs");

  return {
    executed: true,
    status: "ready",
    writeTargets: Array.from(writeTargets),
    message: "Verified webhook billing state was written.",
  };
}
