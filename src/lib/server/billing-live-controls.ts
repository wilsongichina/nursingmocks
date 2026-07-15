import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  createDefaultBillingLiveControls,
  isBillingLiveCapability,
  type BillingLiveCapability,
  type BillingLiveCapabilityStatus,
  type BillingLiveControls,
} from "@/lib/billing/live-controls";
import { getAdminDb } from "@/lib/server/firebase-admin";

const BILLING_LIVE_CONTROLS_COLLECTION = "billing_live_controls";
const BILLING_LIVE_CONTROLS_DOC = "live";
const BILLING_AUDIT_LOG_COLLECTION = "billing_audit_logs";

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function normalizeCapabilityStatus(value: unknown): BillingLiveCapabilityStatus {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    approved: record.approved === true,
    approvedBy: typeof record.approvedBy === "string" ? record.approvedBy : null,
    approvedAt: toDateOrNull(record.approvedAt),
    reason: typeof record.reason === "string" ? record.reason : null,
  };
}

export async function getBillingLiveControls(): Promise<BillingLiveControls> {
  const snapshot = await getAdminDb()
    .collection(BILLING_LIVE_CONTROLS_COLLECTION)
    .doc(BILLING_LIVE_CONTROLS_DOC)
    .get();
  const data = snapshot.exists ? snapshot.data() ?? {} : {};
  const defaults = createDefaultBillingLiveControls();

  return {
    checkout: { ...defaults.checkout, ...normalizeCapabilityStatus(data.checkout) },
    webhookEffects: { ...defaults.webhookEffects, ...normalizeCapabilityStatus(data.webhookEffects) },
    portal: { ...defaults.portal, ...normalizeCapabilityStatus(data.portal) },
  };
}

export async function isBillingLiveCapabilityApproved(capability: BillingLiveCapability) {
  const controls = await getBillingLiveControls();
  return controls[capability].approved;
}

export async function approveBillingLiveCapability(input: {
  capability: string;
  adminUid: string;
  reason: string;
}) {
  const capability = input.capability.trim();
  const reason = input.reason.trim();

  if (!isBillingLiveCapability(capability)) {
    throw new Error("Unsupported live billing capability.");
  }
  if (reason.length < 15) {
    throw new Error("Approval reason must be at least 15 characters.");
  }

  const db = getAdminDb();
  const controlsRef = db.collection(BILLING_LIVE_CONTROLS_COLLECTION).doc(BILLING_LIVE_CONTROLS_DOC);
  const auditRef = db.collection(BILLING_AUDIT_LOG_COLLECTION).doc();
  const update = {
    approved: true,
    approvedBy: input.adminUid,
    approvedAt: FieldValue.serverTimestamp(),
    reason,
  };

  await db.runTransaction(async (transaction) => {
    const before = await transaction.get(controlsRef);
    transaction.set(
      controlsRef,
      {
        [capability]: update,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: input.adminUid,
      },
      { merge: true }
    );
    transaction.set(auditRef, {
      auditLogId: auditRef.id,
      action: "billing.live_capability.approve",
      entityType: "billing_live_controls",
      entityId: capability,
      gatewayId: null,
      planId: null,
      uid: null,
      adminUid: input.adminUid,
      timestamp: FieldValue.serverTimestamp(),
      beforeSummary: before.exists ? normalizeCapabilityStatus(before.data()?.[capability]) : null,
      afterSummary: { capability, approved: true },
      reason,
      requestMetadata: null,
    });
  });

  return {
    capability,
    status: {
      ...update,
      approvedAt: new Date(),
    },
  };
}
