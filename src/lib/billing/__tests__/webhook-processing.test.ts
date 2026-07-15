import { describe, expect, it } from "vitest";
import { decideWebhookProcessing } from "@/lib/billing/webhook-processing";

describe("billing webhook processing guardrails", () => {
  it("ignores already processed events", () => {
    expect(
      decideWebhookProcessing({
        webhookEventRecordId: "evt_1",
        processed: true,
        eventSupported: true,
        plannedEffects: ["record_transaction"],
        effectsEnabled: false,
      })
    ).toEqual({
      shouldProcess: false,
      status: "ignored",
      message: "Webhook event has already been processed.",
    });
  });

  it("ignores unsupported event types", () => {
    expect(
      decideWebhookProcessing({
        webhookEventRecordId: "evt_1",
        processed: false,
        eventSupported: false,
        plannedEffects: [],
        effectsEnabled: false,
      })
    ).toEqual({
      shouldProcess: false,
      status: "ignored",
      message: "Webhook event type is not supported for processing.",
    });
  });

  it("blocks planned effects while the effect gate is disabled", () => {
    expect(
      decideWebhookProcessing({
        webhookEventRecordId: "evt_1",
        processed: false,
        eventSupported: true,
        plannedEffects: ["record_transaction", "grant_entitlements"],
        effectsEnabled: false,
      })
    ).toEqual({
      shouldProcess: false,
      status: "processing_disabled",
      message: "Webhook billing effects are planned but disabled.",
    });
  });

  it("allows processing only when effects are explicitly enabled", () => {
    expect(
      decideWebhookProcessing({
        webhookEventRecordId: "evt_1",
        processed: false,
        eventSupported: true,
        plannedEffects: ["record_transaction"],
        effectsEnabled: true,
      })
    ).toEqual({
      shouldProcess: true,
      status: "planned",
      message: "Webhook event is ready for billing effect execution.",
    });
  });
});
