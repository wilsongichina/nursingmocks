export const BILLING_PACKAGE_IDS = [
  "nursing_entrance_exams",
  "nursing_test_bank",
  "nursing_exit_exams",
  "all_access",
] as const;

export const BILLING_PROVIDERS = ["stripe", "paypal", "authorize_net"] as const;

export const BILLING_ENVIRONMENTS = ["test", "live"] as const;

export const PLAN_STATUSES = ["draft", "active", "inactive", "archived"] as const;

export const PURCHASE_TYPES = ["subscription", "one_time", "manual_access"] as const;

export const BILLING_INTERVALS = ["monthly", "quarterly", "yearly", "lifetime"] as const;

export const TRANSACTION_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
  "disputed",
] as const;

export const SUBSCRIPTION_STATUSES = [
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "cancelling",
  "cancelled",
  "expired",
] as const;

export const ENTITLEMENT_STATUSES = ["active", "expired", "revoked"] as const;

export const ENTITLEMENT_SOURCES = [
  "subscription",
  "one_time_purchase",
  "manual_grant",
  "promotion",
  "admin_override",
] as const;

export type BillingPackageId = (typeof BILLING_PACKAGE_IDS)[number] | string;
export type BillingProvider = (typeof BILLING_PROVIDERS)[number];
export type BillingEnvironment = (typeof BILLING_ENVIRONMENTS)[number];
export type PlanStatus = (typeof PLAN_STATUSES)[number];
export type PurchaseType = (typeof PURCHASE_TYPES)[number];
export type BillingInterval = (typeof BILLING_INTERVALS)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

export interface BillingPlan {
  planId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: PlanStatus;
  purchaseType: PurchaseType;
  billingInterval: BillingInterval | null;
  price: number;
  currency: string;
  packageIds: BillingPackageId[];
  gatewayIds: string[];
  trialDays: number;
  isFeatured: boolean;
  isPublic: boolean;
  displayOrder: number;
  createdAt: Date | null;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface BillingPlanPriceVersion {
  priceVersionId: string;
  planId: string;
  price: number;
  currency: string;
  billingInterval: BillingInterval | null;
  purchaseType: PurchaseType;
  packageIdsSnapshot: BillingPackageId[];
  active: boolean;
  createdAt: Date | null;
  createdBy: string | null;
}

export interface ProviderPriceMapping {
  mappingId: string;
  planId: string;
  provider: BillingProvider;
  gatewayId: string;
  environment: BillingEnvironment;
  externalProductId: string | null;
  externalPriceId: string | null;
  externalPlanId: string | null;
  amount: number;
  currency: string;
  billingInterval: BillingInterval | null;
  purchaseType: PurchaseType;
  active: boolean;
  syncStatus: "not_synced" | "synced" | "failed";
  syncedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PaymentGatewayConfig {
  gatewayId: string;
  provider: BillingProvider;
  displayName: string;
  enabled: boolean;
  environment: BillingEnvironment;
  connectionStatus: "not_configured" | "connected" | "failed";
  supportedCurrencies: string[];
  supportedCountries: string[];
  supportedPaymentTypes: PurchaseType[];
  supportsSubscriptions: boolean;
  supportsOneTimePayments: boolean;
  minimumAmount: number | null;
  maximumAmount: number | null;
  priority: number;
  isDefault: boolean;
  planIds: string[];
  configurationStatus: "incomplete" | "ready" | "invalid";
  lastConnectionTestAt: Date | null;
  lastConnectionTestStatus: "not_tested" | "passed" | "failed";
  lastSuccessfulWebhookAt: Date | null;
  lastWebhookFailureAt: Date | null;
  createdAt: Date | null;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface BillingTransaction {
  transactionId: string;
  uid: string;
  planId: string;
  planNameSnapshot: string;
  purchaseType: PurchaseType;
  amount: number;
  currency: string;
  billingIntervalSnapshot: BillingInterval | null;
  packageIdsSnapshot: BillingPackageId[];
  gatewayId: string;
  provider: BillingProvider;
  providerCustomerId: string | null;
  providerPaymentId: string | null;
  providerInvoiceId: string | null;
  providerSubscriptionId: string | null;
  providerPriceId: string | null;
  status: TransactionStatus;
  paymentMethodSummary: string | null;
  createdAt: Date | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  metadata: Record<string, unknown>;
}

export interface BillingSubscription {
  subscriptionId: string;
  uid: string;
  planId: string;
  gatewayId: string;
  provider: BillingProvider;
  providerSubscriptionId: string;
  providerCustomerId: string | null;
  providerPriceId: string | null;
  status: SubscriptionStatus;
  providerStatus: string;
  billingInterval: BillingInterval;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  endedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastSyncedAt: Date | null;
}

export interface BillingEntitlement {
  entitlementId: string;
  uid: string;
  packageId: BillingPackageId;
  status: EntitlementStatus;
  source: EntitlementSource;
  sourcePlanId: string | null;
  sourceTransactionId: string | null;
  sourceSubscriptionId: string | null;
  gatewayId: string | null;
  provider: BillingProvider | null;
  grantedAt: Date | null;
  accessStartsAt: Date | null;
  accessEndsAt: Date | null;
  revokedAt: Date | null;
  revokedBy: string | null;
  manualGrantReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface BillingAuditLogEntry {
  auditLogId: string;
  action: string;
  entityType: string;
  entityId: string;
  gatewayId: string | null;
  planId: string | null;
  uid: string | null;
  adminUid: string | null;
  timestamp: Date | null;
  beforeSummary: Record<string, unknown> | null;
  afterSummary: Record<string, unknown> | null;
  reason: string | null;
  requestMetadata: Record<string, unknown> | null;
}
