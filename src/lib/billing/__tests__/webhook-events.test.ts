import { describe, expect, it } from "vitest";
import { classifyBillingWebhookEvent } from "@/lib/billing/webhook-events";

describe("billing webhook event classification", () => {
  it("normalizes Stripe checkout completion events", () => {
    expect(classifyBillingWebhookEvent("stripe", "checkout.session.completed")).toEqual({
      supported: true,
      normalizedEventType: "checkout_completed",
      providerEventType: "checkout.session.completed",
      message: "Stripe event type checkout.session.completed was classified as checkout_completed.",
    });
  });

  it("records unsupported Stripe events without processing them", () => {
    expect(classifyBillingWebhookEvent("stripe", "customer.created")).toEqual({
      supported: false,
      normalizedEventType: null,
      providerEventType: "customer.created",
      message: "Stripe event type customer.created is recorded but not processed.",
    });
  });

  it("keeps non-Stripe providers unimplemented for now", () => {
    expect(classifyBillingWebhookEvent("paypal", "PAYMENT.CAPTURE.COMPLETED")).toEqual({
      supported: false,
      normalizedEventType: null,
      providerEventType: "PAYMENT.CAPTURE.COMPLETED",
      message: "paypal webhook event normalization is not implemented yet.",
    });
  });

  it("handles missing provider event types", () => {
    expect(classifyBillingWebhookEvent("stripe", null)).toEqual({
      supported: false,
      normalizedEventType: null,
      providerEventType: null,
      message: "Provider event type was not available.",
    });
  });
});
