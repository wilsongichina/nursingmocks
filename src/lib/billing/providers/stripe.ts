import type {
  CheckoutSessionRequest,
  CheckoutSessionResult,
  GatewayConnectionTestRequest,
  GatewayOperationResult,
  PaymentGatewayAdapter,
  ProviderPriceSyncRequest,
  ProviderPriceSyncResult,
  WebhookVerificationRequest,
  WebhookVerificationResult,
} from "@/lib/billing/gateway-adapter";
import { createHmac, timingSafeEqual } from "crypto";

const STRIPE_CHECKOUT_SESSIONS_URL = "https://api.stripe.com/v1/checkout/sessions";

function unavailable(operation: string): GatewayOperationResult {
  return {
    status: "unavailable",
    message: `${operation} is not enabled until checkout, provider price sync, and webhook stages are implemented.`,
  };
}

export const stripeGatewayAdapter: PaymentGatewayAdapter = {
  provider: "stripe",

  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    if (request.gateway.provider !== "stripe") {
      return {
        status: "failed",
        message: "Stripe adapter can only create checkout sessions for Stripe gateways.",
      };
    }

    if (request.gateway.environment !== "test") {
      return {
        status: "unavailable",
        message: "Live Stripe checkout is disabled. Stage 11 only allows test gateway checkout sessions.",
      };
    }

    if (request.plan.purchaseType === "manual_access") {
      return {
        status: "failed",
        message: "Manual access plans cannot create provider checkout sessions.",
      };
    }

    if (!request.providerPriceMapping.externalPriceId) {
      return {
        status: "failed",
        message: "Stripe checkout requires an external price ID on the provider price mapping.",
      };
    }

    const secretKey = resolveStripeSecretKey(request.gateway);
    if (!secretKey) {
      return unavailable("Stripe checkout session creation");
    }

    const params = new URLSearchParams({
      mode: request.plan.purchaseType === "subscription" ? "subscription" : "payment",
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      client_reference_id: request.uid,
      "line_items[0][price]": request.providerPriceMapping.externalPriceId,
      "line_items[0][quantity]": "1",
    });

    if (request.customerEmail) {
      params.set("customer_email", request.customerEmail);
    }

    for (const [key, value] of Object.entries(request.metadata ?? {})) {
      params.set(`metadata[${key}]`, value);
      if (request.plan.purchaseType === "subscription") {
        params.set(`subscription_data[metadata][${key}]`, value);
      } else {
        params.set(`payment_intent_data[metadata][${key}]`, value);
      }
    }

    if (request.plan.purchaseType === "subscription" && request.plan.trialDays > 0) {
      params.set("subscription_data[trial_period_days]", String(request.plan.trialDays));
    }

    try {
      const response = await fetch(STRIPE_CHECKOUT_SESSIONS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        id?: unknown;
        url?: unknown;
        error?: { message?: unknown };
      };

      if (!response.ok) {
        return {
          status: "failed",
          message:
            typeof payload.error?.message === "string"
              ? payload.error.message
              : "Stripe checkout session creation failed.",
        };
      }

      if (typeof payload.id !== "string" || typeof payload.url !== "string") {
        return {
          status: "failed",
          message: "Stripe checkout session response did not include a session ID and checkout URL.",
        };
      }

      return {
        status: "ready",
        message: "Stripe test checkout session created.",
        providerSessionId: payload.id,
        checkoutUrl: payload.url,
      };
    } catch {
      return {
        status: "failed",
        message: "Stripe checkout session request failed.",
      };
    }
  },

  async syncProviderPrice(_request: ProviderPriceSyncRequest): Promise<ProviderPriceSyncResult> {
    return unavailable("Stripe provider price sync");
  },

  async verifyWebhook(request: WebhookVerificationRequest): Promise<WebhookVerificationResult> {
    if (request.gateway.provider !== "stripe") {
      return {
        status: "failed",
        message: "Stripe adapter can only verify Stripe gateway webhooks.",
      };
    }

    const webhookSecret = resolveStripeWebhookSecret(request.gateway);
    if (!webhookSecret) {
      return unavailable("Stripe webhook verification");
    }

    const signature = parseStripeSignatureHeader(request.signatureHeader);
    if (!signature.timestamp || signature.signatures.length === 0) {
      return {
        status: "failed",
        message: "Stripe webhook signature header is missing a timestamp or v1 signature.",
      };
    }

    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(`${signature.timestamp}.${request.rawBody}`)
      .digest("hex");
    const validSignature = signature.signatures.some((candidate) =>
      secureCompareHex(candidate, expectedSignature)
    );

    if (!validSignature) {
      return {
        status: "failed",
        message: "Stripe webhook signature verification failed.",
      };
    }

    try {
      const payload = JSON.parse(request.rawBody) as { id?: unknown; type?: unknown };
      const providerEventId = typeof payload.id === "string" ? payload.id : undefined;
      const eventType = typeof payload.type === "string" ? payload.type : undefined;

      if (!providerEventId || !eventType) {
        return {
          status: "failed",
          message: "Stripe webhook payload is missing event ID or event type.",
        };
      }

      return {
        status: "ready",
        message: "Stripe webhook signature verified.",
        providerEventId,
        eventType,
        payload: {
          id: providerEventId,
          type: eventType,
        },
      };
    } catch {
      return {
        status: "failed",
        message: "Stripe webhook payload is not valid JSON.",
      };
    }
  },

  async testConnection(request: GatewayConnectionTestRequest): Promise<GatewayOperationResult> {
    if (request.gateway.provider !== "stripe") {
      return {
        status: "failed",
        message: "Stripe adapter can only test Stripe gateway configurations.",
      };
    }

    return unavailable("Stripe gateway connection testing");
  },
};

function resolveStripeWebhookSecret(gateway: { gatewayId: string; webhookSecretRef?: string | null }) {
  if (gateway.webhookSecretRef && process.env[gateway.webhookSecretRef]) {
    return process.env[gateway.webhookSecretRef] ?? "";
  }

  const gatewayEnvKey = `STRIPE_WEBHOOK_SECRET_${gateway.gatewayId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  return process.env[gatewayEnvKey] || process.env.STRIPE_WEBHOOK_SECRET || "";
}

function resolveStripeSecretKey(gateway: { gatewayId: string; secretKeyRef?: string | null }) {
  if (gateway.secretKeyRef && process.env[gateway.secretKeyRef]) {
    return process.env[gateway.secretKeyRef] ?? "";
  }

  const gatewayEnvKey = `STRIPE_SECRET_KEY_${gateway.gatewayId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  return process.env[gatewayEnvKey] || process.env.STRIPE_SECRET_KEY || "";
}

function parseStripeSignatureHeader(header: string | null) {
  const parts = (header ?? "").split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2) ?? "";
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  return { timestamp, signatures };
}

function secureCompareHex(a: string, b: string) {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
