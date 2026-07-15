export const BILLING_WEBHOOK_PROCESSING_STATUSES = [
  "received",
  "classified",
  "planned",
  "processing_disabled",
  "processed",
  "failed",
  "ignored",
] as const;

export type BillingWebhookProcessingStatus = (typeof BILLING_WEBHOOK_PROCESSING_STATUSES)[number];

export type BillingWebhookProcessingRecord = {
  webhookEventRecordId: string;
  processed: boolean;
  eventSupported?: boolean;
  plannedEffects?: string[];
  effectsEnabled?: boolean;
  processingStatus?: BillingWebhookProcessingStatus;
};

export type BillingWebhookProcessingDecision = {
  shouldProcess: boolean;
  status: BillingWebhookProcessingStatus;
  message: string;
};

export function decideWebhookProcessing(record: BillingWebhookProcessingRecord): BillingWebhookProcessingDecision {
  if (record.processed || record.processingStatus === "processed") {
    return {
      shouldProcess: false,
      status: "ignored",
      message: "Webhook event has already been processed.",
    };
  }

  if (!record.eventSupported) {
    return {
      shouldProcess: false,
      status: "ignored",
      message: "Webhook event type is not supported for processing.",
    };
  }

  if (!record.plannedEffects || record.plannedEffects.length === 0) {
    return {
      shouldProcess: false,
      status: "ignored",
      message: "Webhook event has no planned billing effects.",
    };
  }

  if (!record.effectsEnabled) {
    return {
      shouldProcess: false,
      status: "processing_disabled",
      message: "Webhook billing effects are planned but disabled.",
    };
  }

  return {
    shouldProcess: true,
    status: "planned",
    message: "Webhook event is ready for billing effect execution.",
  };
}
