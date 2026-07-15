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

function unavailable(operation: string): GatewayOperationResult {
  return {
    status: "unavailable",
    message: `${operation} is not enabled until checkout, provider price sync, and webhook stages are implemented.`,
  };
}

export const stripeGatewayAdapter: PaymentGatewayAdapter = {
  provider: "stripe",

  async createCheckoutSession(_request: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    return unavailable("Stripe checkout session creation");
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
