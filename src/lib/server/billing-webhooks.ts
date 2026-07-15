import { FieldValue } from "firebase-admin/firestore";
import { createBillingGatewayRegistry } from "@/lib/billing/gateway-registry";
import type { BillingProvider } from "@/lib/billing/models";
import { planBillingWebhookEffects } from "@/lib/billing/webhook-effect-plan";
import { classifyBillingWebhookEvent } from "@/lib/billing/webhook-events";
import {
  validateWebhookIntakeRequest,
  webhookEventDocumentId,
} from "@/lib/billing/webhook-intake";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getBillingCatalog } from "@/lib/server/billing-readiness";

const BILLING_WEBHOOK_EVENTS_COLLECTION = "billing_webhook_events";

export type BillingWebhookIntakeResult = {
  status: "recorded" | "duplicate" | "rejected" | "unavailable";
  message: string;
  eventRecordId: string | null;
  providerEventId: string | null;
  eventType: string | null;
  processed: false;
};

async function recordWebhookEvent(input: {
  provider: BillingProvider;
  gatewayId: string;
  providerEventId: string | null;
  eventType: string | null;
  normalizedEventType: string | null;
  eventSupported: boolean;
  plannedEffects: string[];
  effectsEnabled: false;
  status: BillingWebhookIntakeResult["status"];
  message: string;
  signaturePresent: boolean;
}) {
  const db = getAdminDb();
  const eventRef = input.providerEventId
    ? db.collection(BILLING_WEBHOOK_EVENTS_COLLECTION).doc(webhookEventDocumentId(input.provider, input.providerEventId))
    : db.collection(BILLING_WEBHOOK_EVENTS_COLLECTION).doc();

  if (!input.providerEventId) {
    await eventRef.set({
      webhookEventRecordId: eventRef.id,
      provider: input.provider,
      gatewayId: input.gatewayId,
      providerEventId: null,
      eventType: input.eventType,
      normalizedEventType: input.normalizedEventType,
      eventSupported: input.eventSupported,
      plannedEffects: input.plannedEffects,
      effectsEnabled: input.effectsEnabled,
      status: input.status,
      message: input.message,
      signaturePresent: input.signaturePresent,
      processed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { eventRecordId: eventRef.id, duplicate: false };
  }

  let duplicate = false;
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(eventRef);
    if (existing.exists) {
      duplicate = true;
      transaction.update(eventRef, {
        duplicateCount: FieldValue.increment(1),
        lastDuplicateAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    transaction.set(eventRef, {
      webhookEventRecordId: eventRef.id,
      provider: input.provider,
      gatewayId: input.gatewayId,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      normalizedEventType: input.normalizedEventType,
      eventSupported: input.eventSupported,
      plannedEffects: input.plannedEffects,
      effectsEnabled: input.effectsEnabled,
      status: input.status,
      message: input.message,
      signaturePresent: input.signaturePresent,
      processed: false,
      duplicateCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { eventRecordId: eventRef.id, duplicate };
}

export async function intakeBillingWebhook(input: {
  provider: BillingProvider;
  gatewayId: string;
  rawBody: string;
  signatureHeader: string | null;
}): Promise<BillingWebhookIntakeResult> {
  const validation = validateWebhookIntakeRequest({
    provider: input.provider,
    gatewayId: input.gatewayId,
    rawBody: input.rawBody,
    signatureHeader: input.signatureHeader,
  });

  if (!validation.valid) {
    return {
      status: "rejected",
      message: validation.issues.join(" "),
      eventRecordId: null,
      providerEventId: null,
      eventType: null,
      processed: false,
    };
  }

  const catalog = await getBillingCatalog();
  const gateway = catalog.gateways.find((item) => item.gatewayId === validation.input.gatewayId);

  if (!gateway || gateway.provider !== validation.input.provider) {
    const record = await recordWebhookEvent({
      provider: validation.input.provider,
      gatewayId: validation.input.gatewayId,
      providerEventId: null,
      eventType: null,
      normalizedEventType: null,
      eventSupported: false,
      plannedEffects: [],
      effectsEnabled: false,
      status: "rejected",
      message: "Webhook gateway was not found or provider did not match.",
      signaturePresent: true,
    });

    return {
      status: "rejected",
      message: "Webhook gateway was not found or provider did not match.",
      eventRecordId: record.eventRecordId,
      providerEventId: null,
      eventType: null,
      processed: false,
    };
  }

  const { registry, issues } = createBillingGatewayRegistry([gateway]);
  const entry = registry.get(gateway.gatewayId);

  if (!entry) {
    const message = issues[0] ?? "No registered webhook adapter is available for this gateway.";
    const record = await recordWebhookEvent({
      provider: validation.input.provider,
      gatewayId: validation.input.gatewayId,
      providerEventId: null,
      eventType: null,
      normalizedEventType: null,
      eventSupported: false,
      plannedEffects: [],
      effectsEnabled: false,
      status: "rejected",
      message,
      signaturePresent: true,
    });

    return {
      status: "rejected",
      message,
      eventRecordId: record.eventRecordId,
      providerEventId: null,
      eventType: null,
      processed: false,
    };
  }

  const verification = await entry.adapter.verifyWebhook({
    gateway,
    rawBody: validation.input.rawBody,
    signatureHeader: validation.input.signatureHeader,
  });
  const providerEventId = verification.providerEventId ?? null;
  const eventType = verification.eventType ?? null;
  const classification = classifyBillingWebhookEvent(validation.input.provider, eventType);
  const effectPlan = planBillingWebhookEffects(classification.normalizedEventType);
  const status =
    verification.status === "ready"
      ? "recorded"
      : verification.status === "unavailable"
        ? "unavailable"
        : "rejected";
  const record = await recordWebhookEvent({
    provider: validation.input.provider,
    gatewayId: validation.input.gatewayId,
    providerEventId,
    eventType,
    normalizedEventType: classification.normalizedEventType,
    eventSupported: classification.supported,
    plannedEffects: effectPlan.effects,
    effectsEnabled: effectPlan.effectsEnabled,
    status,
    message: `${verification.message} ${classification.message} ${effectPlan.message}`,
    signaturePresent: true,
  });

  if (record.duplicate) {
    return {
      status: "duplicate",
      message: "Webhook event was already recorded.",
      eventRecordId: record.eventRecordId,
      providerEventId,
      eventType,
      processed: false,
    };
  }

  return {
    status,
    message: `${verification.message} ${classification.message} ${effectPlan.message}`,
    eventRecordId: record.eventRecordId,
    providerEventId,
    eventType,
    processed: false,
  };
}
