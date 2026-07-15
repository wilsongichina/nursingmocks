import { FieldValue } from "firebase-admin/firestore";
import type { BillingPackageId, BillingProvider } from "@/lib/billing/models";
import { BILLING_PACKAGE_IDS } from "@/lib/billing/models";
import { processBillingWebhookEvent } from "@/lib/server/billing-webhook-processing";
import { getAdminDb } from "@/lib/server/firebase-admin";

const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const BILLING_AUDIT_LOG_COLLECTION = "billing_audit_logs";
const BILLING_OPERATION_REVIEWS_COLLECTION = "billing_operation_reviews";
const USERS_COLLECTION = "users";

type AdminOperationType =
  | "manualEntitlementGrant"
  | "manualEntitlementRevoke"
  | "webhookReprocess"
  | "refundReview"
  | "subscriptionNote"
  | "transactionNote";

type AdminBillingOperationInput = {
  operation: AdminOperationType;
  uid?: unknown;
  packageId?: unknown;
  planId?: unknown;
  entitlementId?: unknown;
  webhookEventRecordId?: unknown;
  transactionId?: unknown;
  subscriptionId?: unknown;
  provider?: unknown;
  reason?: unknown;
  note?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(value: unknown, field: string) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function requiredReason(value: unknown) {
  const reason = requiredText(value, "Reason");
  if (reason.length < 10) throw new Error("Reason must be at least 10 characters.");
  return reason;
}

function entitlementDocId(uid: string, packageId: string, planId: string) {
  return `${uid}_${packageId}_${planId || "manual"}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function assertPackageId(packageId: string): BillingPackageId {
  if (!(BILLING_PACKAGE_IDS as readonly string[]).includes(packageId)) {
    throw new Error(`Package ${packageId} is not supported.`);
  }
  return packageId;
}

async function writeAudit(input: {
  action: string;
  entityType: string;
  entityId: string;
  uid: string | null;
  adminUid: string;
  gatewayId?: string | null;
  planId?: string | null;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  reason: string;
}) {
  const auditRef = getAdminDb().collection(BILLING_AUDIT_LOG_COLLECTION).doc();
  await auditRef.set({
    auditLogId: auditRef.id,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    gatewayId: input.gatewayId ?? null,
    planId: input.planId ?? null,
    uid: input.uid,
    adminUid: input.adminUid,
    timestamp: FieldValue.serverTimestamp(),
    beforeSummary: input.beforeSummary ?? null,
    afterSummary: input.afterSummary ?? null,
    reason: input.reason,
    requestMetadata: null,
  });
  return auditRef.id;
}

export async function runAdminBillingOperation(input: AdminBillingOperationInput, adminUid: string) {
  if (input.operation === "manualEntitlementGrant") {
    return grantManualEntitlement(input, adminUid);
  }
  if (input.operation === "manualEntitlementRevoke") {
    return revokeManualEntitlement(input, adminUid);
  }
  if (input.operation === "webhookReprocess") {
    return reprocessWebhook(input, adminUid);
  }
  if (input.operation === "refundReview") {
    return createOperationReview(input, adminUid, "refund_review", requiredText(input.transactionId, "Transaction ID"));
  }
  if (input.operation === "subscriptionNote") {
    return createOperationReview(input, adminUid, "subscription_note", requiredText(input.subscriptionId, "Subscription ID"));
  }
  if (input.operation === "transactionNote") {
    return createOperationReview(input, adminUid, "transaction_note", requiredText(input.transactionId, "Transaction ID"));
  }

  throw new Error("Unsupported billing operation.");
}

async function grantManualEntitlement(input: AdminBillingOperationInput, adminUid: string) {
  const db = getAdminDb();
  const uid = requiredText(input.uid, "User ID");
  const packageId = assertPackageId(requiredText(input.packageId, "Package ID"));
  const planId = text(input.planId) || "manual_admin_grant";
  const reason = requiredReason(input.reason);
  const entitlementId = entitlementDocId(uid, packageId, planId);
  const entitlementRef = db.collection(BILLING_ENTITLEMENTS_COLLECTION).doc(entitlementId);
  const userRef = db.collection(USERS_COLLECTION).doc(uid);
  let beforeSummary: Record<string, unknown> | null = null;

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(entitlementRef);
    beforeSummary = existing.exists ? existing.data() ?? null : null;
    transaction.set(
      entitlementRef,
      {
        entitlementId,
        uid,
        packageId,
        status: "active",
        source: "manual_grant",
        sourcePlanId: planId,
        sourceTransactionId: null,
        sourceSubscriptionId: null,
        gatewayId: null,
        provider: null,
        grantedAt: FieldValue.serverTimestamp(),
        accessStartsAt: FieldValue.serverTimestamp(),
        accessEndsAt: null,
        revokedAt: null,
        revokedBy: null,
        manualGrantReason: reason,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    transaction.set(
      userRef,
      {
        entitlements: { [packageId]: true },
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  const auditLogId = await writeAudit({
    action: "billing.entitlement.manual_grant",
    entityType: "billing_entitlement",
    entityId: entitlementId,
    uid,
    adminUid,
    planId,
    beforeSummary,
    afterSummary: { packageId, status: "active", source: "manual_grant" },
    reason,
  });

  return { operation: input.operation, status: "completed", entitlementId, auditLogId };
}

async function revokeManualEntitlement(input: AdminBillingOperationInput, adminUid: string) {
  const db = getAdminDb();
  const uid = requiredText(input.uid, "User ID");
  const packageId = assertPackageId(requiredText(input.packageId, "Package ID"));
  const entitlementId = text(input.entitlementId) || entitlementDocId(uid, packageId, text(input.planId) || "manual_admin_grant");
  const reason = requiredReason(input.reason);
  const entitlementRef = db.collection(BILLING_ENTITLEMENTS_COLLECTION).doc(entitlementId);
  const userRef = db.collection(USERS_COLLECTION).doc(uid);
  let beforeSummary: Record<string, unknown> | null = null;

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(entitlementRef);
    beforeSummary = existing.exists ? existing.data() ?? null : null;
    transaction.set(
      entitlementRef,
      {
        entitlementId,
        uid,
        packageId,
        status: "revoked",
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: adminUid,
        manualGrantReason: reason,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    transaction.set(
      userRef,
      {
        entitlements: { [packageId]: false },
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  const auditLogId = await writeAudit({
    action: "billing.entitlement.manual_revoke",
    entityType: "billing_entitlement",
    entityId: entitlementId,
    uid,
    adminUid,
    beforeSummary,
    afterSummary: { packageId, status: "revoked" },
    reason,
  });

  return { operation: input.operation, status: "completed", entitlementId, auditLogId };
}

async function reprocessWebhook(input: AdminBillingOperationInput, adminUid: string) {
  const webhookEventRecordId = requiredText(input.webhookEventRecordId, "Webhook event record ID");
  const reason = requiredReason(input.reason);
  const processing = await processBillingWebhookEvent(webhookEventRecordId);
  const auditLogId = await writeAudit({
    action: "billing.webhook.reprocess",
    entityType: "billing_webhook_event",
    entityId: webhookEventRecordId,
    uid: null,
    adminUid,
    beforeSummary: null,
    afterSummary: processing,
    reason,
  });

  return { operation: input.operation, status: "completed", processing, auditLogId };
}

async function createOperationReview(
  input: AdminBillingOperationInput,
  adminUid: string,
  reviewType: "refund_review" | "subscription_note" | "transaction_note",
  entityId: string
) {
  const db = getAdminDb();
  const reason = requiredReason(input.reason);
  const note = text(input.note);
  const reviewRef = db.collection(BILLING_OPERATION_REVIEWS_COLLECTION).doc();
  await reviewRef.set({
    reviewId: reviewRef.id,
    reviewType,
    entityId,
    uid: text(input.uid) || null,
    provider: text(input.provider) as BillingProvider | "",
    status: "open",
    reason,
    note: note || null,
    createdBy: adminUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const auditLogId = await writeAudit({
    action: `billing.${reviewType}.create`,
    entityType: "billing_operation_review",
    entityId: reviewRef.id,
    uid: text(input.uid) || null,
    adminUid,
    beforeSummary: null,
    afterSummary: { reviewType, entityId, status: "open", note: note || null },
    reason,
  });

  return { operation: input.operation, status: "review_recorded", reviewId: reviewRef.id, auditLogId };
}
