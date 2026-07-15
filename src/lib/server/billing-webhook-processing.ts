import { FieldValue } from "firebase-admin/firestore";
import {
  executePlannedBillingWebhookEffects,
} from "@/lib/billing/webhook-effect-execution";
import { isBillingWebhookEffect, type BillingWebhookEffect } from "@/lib/billing/webhook-effect-plan";
import {
  decideWebhookProcessing,
  type BillingWebhookProcessingDecision,
  type BillingWebhookProcessingRecord,
} from "@/lib/billing/webhook-processing";
import { getAdminDb } from "@/lib/server/firebase-admin";

const BILLING_WEBHOOK_EVENTS_COLLECTION = "billing_webhook_events";

export type ProcessBillingWebhookEventResult = BillingWebhookProcessingDecision & {
  eventRecordId: string;
};

export async function processBillingWebhookEvent(
  eventRecordId: string
): Promise<ProcessBillingWebhookEventResult> {
  const db = getAdminDb();
  const eventRef = db.collection(BILLING_WEBHOOK_EVENTS_COLLECTION).doc(eventRecordId);
  let result: ProcessBillingWebhookEventResult | null = null;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(eventRef);
    if (!snapshot.exists) {
      result = {
        eventRecordId,
        shouldProcess: false,
        status: "failed",
        message: "Webhook event record was not found.",
      };
      return;
    }

    const data = snapshot.data() as BillingWebhookProcessingRecord & {
      processingLockedAt?: unknown;
      normalizedEventType?: unknown;
      providerEventId?: unknown;
    };

    if (data.processingLockedAt && !data.processed) {
      result = {
        eventRecordId,
        shouldProcess: false,
        status: "ignored",
        message: "Webhook event is already locked for processing.",
      };
      return;
    }

    const decision = decideWebhookProcessing({
      webhookEventRecordId: eventRecordId,
      processed: Boolean(data.processed),
      eventSupported: Boolean(data.eventSupported),
      plannedEffects: Array.isArray(data.plannedEffects) ? data.plannedEffects : [],
      effectsEnabled: Boolean(data.effectsEnabled),
      processingStatus: data.processingStatus,
    });
    const plannedEffects = Array.isArray(data.plannedEffects)
      ? data.plannedEffects.filter(
          (effect): effect is BillingWebhookEffect => typeof effect === "string" && isBillingWebhookEffect(effect)
        )
      : [];
    const execution = executePlannedBillingWebhookEffects({
      effectsEnabled: Boolean(data.effectsEnabled),
      plannedEffects,
      normalizedEventType: typeof data.normalizedEventType === "string" ? data.normalizedEventType : null,
      providerEventId: typeof data.providerEventId === "string" ? data.providerEventId : null,
    });

    transaction.update(eventRef, {
      processingStatus: decision.status,
      processingMessage: decision.message,
      effectExecutionStatus: execution.status,
      effectExecutionMessage: execution.message,
      blockedWriteTargets: execution.writeTargets,
      processingAttemptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(decision.shouldProcess
        ? { processingLockedAt: FieldValue.serverTimestamp() }
        : {}),
    });

    result = {
      eventRecordId,
      ...decision,
    };
  });

  if (!result) {
    return {
      eventRecordId,
      shouldProcess: false,
      status: "failed",
      message: "Webhook event processing did not complete.",
    };
  }

  return result;
}
