import { describe, expect, it } from "vitest";
import {
  validateWebhookIntakeRequest,
  webhookEventDocumentId,
} from "@/lib/billing/webhook-intake";

describe("webhook intake validation", () => {
  it("accepts a supported provider with raw body and signature", () => {
    const result = validateWebhookIntakeRequest({
      provider: "stripe",
      gatewayId: "stripe_default",
      rawBody: "{\"id\":\"evt_test\"}",
      signatureHeader: "t=123,v1=test",
    });

    expect(result.valid).toBe(true);
  });

  it("rejects missing signatures", () => {
    const result = validateWebhookIntakeRequest({
      provider: "stripe",
      gatewayId: "stripe_default",
      rawBody: "{\"id\":\"evt_test\"}",
      signatureHeader: "",
    });

    expect(result).toEqual({
      valid: false,
      issues: ["Webhook signature is required."],
    });
  });

  it("rejects unsupported providers and missing gateway IDs", () => {
    const result = validateWebhookIntakeRequest({
      provider: "unknown",
      gatewayId: "",
      rawBody: "{}",
      signatureHeader: "sig",
    });

    expect(result).toEqual({
      valid: false,
      issues: ["Webhook provider is not supported.", "Gateway ID is required."],
    });
  });

  it("creates stable event document IDs for idempotency", () => {
    expect(webhookEventDocumentId("stripe", "evt_ABC.123")).toBe("stripe_evt_abc_123");
  });
});
