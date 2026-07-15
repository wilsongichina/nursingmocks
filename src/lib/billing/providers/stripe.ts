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

  async verifyWebhook(_request: WebhookVerificationRequest): Promise<WebhookVerificationResult> {
    return unavailable("Stripe webhook verification");
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
