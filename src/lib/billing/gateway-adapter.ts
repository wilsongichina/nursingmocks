import type {
  BillingEnvironment,
  BillingPlan,
  BillingPlanPriceVersion,
  BillingProvider,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";

export type GatewayOperationStatus = "ready" | "unavailable" | "failed";

export type GatewayOperationResult = {
  status: GatewayOperationStatus;
  message: string;
};

export type BillingGatewaySecrets = {
  secretKeyRef?: string;
  webhookSecretRef?: string;
  publishableKeyRef?: string;
};

export type BillingGatewayRuntimeConfig = {
  gateway: PaymentGatewayConfig;
  secrets?: BillingGatewaySecrets;
};

export type CheckoutSessionRequest = {
  uid: string;
  plan: BillingPlan;
  gateway: PaymentGatewayConfig;
  providerPriceMapping: ProviderPriceMapping;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
  metadata?: Record<string, string>;
  liveModeApproved?: boolean;
};

export type CheckoutSessionResult = GatewayOperationResult & {
  checkoutUrl?: string;
  providerSessionId?: string;
};

export type BillingPortalSessionRequest = {
  uid: string;
  gateway: PaymentGatewayConfig;
  providerCustomerId: string;
  returnUrl: string;
  liveModeApproved?: boolean;
};

export type BillingPortalSessionResult = GatewayOperationResult & {
  portalUrl?: string;
  providerSessionId?: string;
};

export type ProviderPriceSyncRequest = {
  plan: BillingPlan;
  priceVersion: BillingPlanPriceVersion;
  gateway: PaymentGatewayConfig;
};

export type ProviderPriceSyncResult = GatewayOperationResult & {
  providerPriceMapping?: ProviderPriceMapping;
};

export type WebhookVerificationRequest = {
  gateway: PaymentGatewayConfig;
  rawBody: string;
  signatureHeader: string | null;
};

export type WebhookVerificationResult = GatewayOperationResult & {
  providerEventId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
};

export type GatewayConnectionTestRequest = {
  gateway: PaymentGatewayConfig;
  environment?: BillingEnvironment;
};

export interface PaymentGatewayAdapter {
  provider: BillingProvider;
  createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResult>;
  createBillingPortalSession(request: BillingPortalSessionRequest): Promise<BillingPortalSessionResult>;
  syncProviderPrice(request: ProviderPriceSyncRequest): Promise<ProviderPriceSyncResult>;
  verifyWebhook(request: WebhookVerificationRequest): Promise<WebhookVerificationResult>;
  testConnection(request: GatewayConnectionTestRequest): Promise<GatewayOperationResult>;
}
