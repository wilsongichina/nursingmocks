import { FieldValue } from "firebase-admin/firestore";
import {
  executePlannedBillingWebhookEffects,
} from "@/lib/billing/webhook-effect-execution";
import type { BillingProvider, PaymentGatewayConfig } from "@/lib/billing/models";
import type { BillingWebhookEventType } from "@/lib/billing/webhook-events";
import { isBillingWebhookEffect, type BillingWebhookEffect } from "@/lib/billing/webhook-effect-plan";
import {
  decideWebhookProcessing,
  type BillingWebhookProcessingDecision,
  type BillingWebhookProcessingRecord,
} from "@/lib/billing/webhook-processing";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { writeBillingWebhookState } from "@/lib/server/billing-webhook-state-writer";

const BILLING_WEBHOOK_EVENTS_COLLECTION = "billing_webhook_events";
const BILLING_GATEWAYS_COLLECTION = "billing_gateways";

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
      provider?: unknown;
      gatewayId?: unknown;
      providerPayload?: unknown;
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
    let execution = executePlannedBillingWebhookEffects({
      effectsEnabled: Boolean(data.effectsEnabled),
      plannedEffects,
      normalizedEventType: typeof data.normalizedEventType === "string" ? data.normalizedEventType : null,
      providerEventId: typeof data.providerEventId === "string" ? data.providerEventId : null,
    });

    if (decision.shouldProcess) {
      const provider = typeof data.provider === "string" ? data.provider : null;
      const gatewayId = typeof data.gatewayId === "string" ? data.gatewayId : null;
      const providerEventId = typeof data.providerEventId === "string" ? data.providerEventId : null;
      const normalizedEventType = typeof data.normalizedEventType === "string" ? data.normalizedEventType : null;
      const providerPayload =
        data.providerPayload && typeof data.providerPayload === "object" && !Array.isArray(data.providerPayload)
          ? (data.providerPayload as Record<string, unknown>)
          : null;

      if (!provider || !gatewayId || !providerEventId || !normalizedEventType || !providerPayload) {
        execution = {
          executed: false,
          status: "failed",
          writeTargets: execution.writeTargets,
          message: "Webhook event is missing provider, gateway, event type, event ID, or verified payload.",
        };
      } else {
        const gatewayRef = db.collection(BILLING_GATEWAYS_COLLECTION).doc(gatewayId);
        const gatewaySnapshot = await transaction.get(gatewayRef);
        const gateway = gatewaySnapshot.exists
          ? ({ ...gatewaySnapshot.data(), gatewayId } as PaymentGatewayConfig)
          : null;

        if (!gateway) {
          execution = {
            executed: false,
            status: "failed",
            writeTargets: execution.writeTargets,
            message: "Webhook gateway was not found during state writing.",
          };
        } else {
          execution = await writeBillingWebhookState({
            transaction,
            db,
            eventRecordId,
            provider: provider as BillingProvider,
            gateway,
            providerEventId,
            normalizedEventType: normalizedEventType as BillingWebhookEventType,
            plannedEffects,
            providerPayload,
          });
        }
      }
    }

    transaction.update(eventRef, {
      processingStatus: execution.executed ? "processed" : execution.status === "failed" ? "failed" : decision.status,
      processingMessage: decision.message,
      effectExecutionStatus: execution.status,
      effectExecutionMessage: execution.message,
      blockedWriteTargets: execution.writeTargets,
      processed: execution.executed,
      processedAt: execution.executed ? FieldValue.serverTimestamp() : null,
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
