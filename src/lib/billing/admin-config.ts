import {
  BILLING_ENVIRONMENTS,
  BILLING_INTERVALS,
  BILLING_PACKAGE_IDS,
  BILLING_PROVIDERS,
  PLAN_STATUSES,
  PURCHASE_TYPES,
  type BillingInterval,
  type BillingPackageId,
  type BillingPlan,
  type BillingEnvironment,
  type BillingProvider,
  type PaymentGatewayConfig,
  type PlanStatus,
  type ProviderPriceMapping,
  type PurchaseType,
} from "@/lib/billing/models";

export type CreatePaymentGatewayInput = {
  gatewayId?: unknown;
  provider?: unknown;
  displayName?: unknown;
  enabled?: unknown;
  environment?: unknown;
  supportedCurrencies?: unknown;
  supportedCountries?: unknown;
  supportedPaymentTypes?: unknown;
  supportsSubscriptions?: unknown;
  supportsOneTimePayments?: unknown;
  minimumAmount?: unknown;
  maximumAmount?: unknown;
  priority?: unknown;
  isDefault?: unknown;
  publishableKeyRef?: unknown;
  secretKeyRef?: unknown;
  webhookSecretRef?: unknown;
};

export type GatewayInputValidationResult =
  | { valid: true; gateway: PaymentGatewayConfig }
  | { valid: false; issues: string[] };

export type CreateBillingPlanInput = {
  planId?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  shortDescription?: unknown;
  status?: unknown;
  purchaseType?: unknown;
  billingInterval?: unknown;
  price?: unknown;
  currency?: unknown;
  packageIds?: unknown;
  gatewayIds?: unknown;
  trialDays?: unknown;
  isFeatured?: unknown;
  isPublic?: unknown;
  displayOrder?: unknown;
};

export type PlanInputValidationResult =
  | { valid: true; plan: BillingPlan }
  | { valid: false; issues: string[] };

export type CreateProviderPriceMappingInput = {
  mappingId?: unknown;
  planId?: unknown;
  gatewayId?: unknown;
  provider?: unknown;
  environment?: unknown;
  externalProductId?: unknown;
  externalPriceId?: unknown;
  externalPlanId?: unknown;
  amount?: unknown;
  currency?: unknown;
  billingInterval?: unknown;
  purchaseType?: unknown;
  active?: unknown;
};

export type ProviderPriceMappingInputValidationResult =
  | { valid: true; providerPriceMapping: ProviderPriceMapping }
  | { valid: false; issues: string[] };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }

  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function booleanValue(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function isBillingProvider(value: string): value is BillingProvider {
  return (BILLING_PROVIDERS as readonly string[]).includes(value);
}

function isBillingEnvironment(value: string): value is BillingEnvironment {
  return (BILLING_ENVIRONMENTS as readonly string[]).includes(value);
}

function isPurchaseType(value: string): value is PurchaseType {
  return (PURCHASE_TYPES as readonly string[]).includes(value);
}

function isPlanStatus(value: string): value is PlanStatus {
  return (PLAN_STATUSES as readonly string[]).includes(value);
}

function isBillingInterval(value: string): value is BillingInterval {
  return (BILLING_INTERVALS as readonly string[]).includes(value);
}

function isBillingPackageId(value: string): value is BillingPackageId {
  return (BILLING_PACKAGE_IDS as readonly string[]).includes(value);
}

export function normalizeGatewayId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeBillingSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizePlanName(value: string) {
  return value
    .trim()
    .replace(/[-_.]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function validateCreatePaymentGatewayInput(
  input: CreatePaymentGatewayInput,
  context: { existingGatewayIds?: string[]; adminUid?: string | null } = {}
): GatewayInputValidationResult {
  const issues: string[] = [];
  const gatewayId = normalizeGatewayId(text(input.gatewayId));
  const provider = text(input.provider);
  const displayName = text(input.displayName);
  const environment = text(input.environment);
  const supportedCurrencies = stringList(input.supportedCurrencies).map((value) => value.toUpperCase());
  const supportedCountries = stringList(input.supportedCountries).map((value) => value.toUpperCase());
  const supportedPaymentTypes = stringList(input.supportedPaymentTypes);
  const minimumAmount = optionalNumber(input.minimumAmount);
  const maximumAmount = optionalNumber(input.maximumAmount);
  const priorityValue = Number(input.priority ?? 100);
  const priority = Number.isFinite(priorityValue) ? priorityValue : 100;
  const publishableKeyRef = text(input.publishableKeyRef) || null;
  const secretKeyRef = text(input.secretKeyRef) || null;
  const webhookSecretRef = text(input.webhookSecretRef) || null;

  if (!gatewayId) issues.push("Gateway ID is required.");
  if (gatewayId.length > 80) issues.push("Gateway ID must be 80 characters or fewer.");
  if (context.existingGatewayIds?.includes(gatewayId)) issues.push("Gateway ID already exists.");
  if (!displayName) issues.push("Display name is required.");
  if (!isBillingProvider(provider)) issues.push("Provider is not supported.");
  if (!isBillingEnvironment(environment)) issues.push("Environment is not supported.");
  if (supportedCurrencies.length === 0) issues.push("At least one supported currency is required.");
  if (supportedPaymentTypes.length === 0) issues.push("At least one payment type is required.");

  const invalidPaymentType = supportedPaymentTypes.find((item) => !isPurchaseType(item));
  if (invalidPaymentType) issues.push(`Payment type ${invalidPaymentType} is not supported.`);
  if (Number.isNaN(minimumAmount)) issues.push("Minimum amount must be a number.");
  if (Number.isNaN(maximumAmount)) issues.push("Maximum amount must be a number.");
  if (minimumAmount !== null && maximumAmount !== null && minimumAmount > maximumAmount) {
    issues.push("Minimum amount cannot be greater than maximum amount.");
  }

  if (issues.length > 0 || !isBillingProvider(provider) || !isBillingEnvironment(environment)) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    gateway: {
      gatewayId,
      provider,
      displayName,
      enabled: booleanValue(input.enabled, false),
      environment,
      connectionStatus: "not_configured",
      supportedCurrencies,
      supportedCountries,
      supportedPaymentTypes: supportedPaymentTypes as PurchaseType[],
      supportsSubscriptions: booleanValue(input.supportsSubscriptions, true),
      supportsOneTimePayments: booleanValue(input.supportsOneTimePayments, true),
      minimumAmount,
      maximumAmount,
      priority,
      isDefault: booleanValue(input.isDefault, false),
      publishableKeyRef,
      secretKeyRef,
      webhookSecretRef,
      planIds: [],
      configurationStatus: "incomplete",
      lastConnectionTestAt: null,
      lastConnectionTestStatus: "not_tested",
      lastSuccessfulWebhookAt: null,
      lastWebhookFailureAt: null,
      createdAt: null,
      createdBy: context.adminUid ?? null,
      updatedAt: null,
      updatedBy: context.adminUid ?? null,
    },
  };
}

export function validateCreateBillingPlanInput(
  input: CreateBillingPlanInput,
  context: {
    existingPlanIds?: string[];
    existingSlugs?: string[];
    gatewayIds?: string[];
    adminUid?: string | null;
  } = {}
): PlanInputValidationResult {
  const issues: string[] = [];
  const name = normalizePlanName(text(input.name));
  const slug = normalizeBillingSlug(text(input.slug) || name);
  const planId = normalizeGatewayId(text(input.planId) || slug.replace(/-/g, "_"));
  const description = text(input.description);
  const shortDescription = text(input.shortDescription);
  const status = text(input.status) || "draft";
  const purchaseType = text(input.purchaseType) || "subscription";
  const rawBillingInterval = text(input.billingInterval);
  const billingInterval = rawBillingInterval || null;
  const price = Number(input.price ?? 0);
  const currency = text(input.currency).toUpperCase() || "USD";
  const packageIds = stringList(input.packageIds);
  const gatewayIds = stringList(input.gatewayIds);
  const trialDaysValue = Number(input.trialDays ?? 0);
  const trialDays = Number.isFinite(trialDaysValue) ? trialDaysValue : Number.NaN;
  const displayOrderValue = Number(input.displayOrder ?? 100);
  const displayOrder = Number.isFinite(displayOrderValue) ? displayOrderValue : 100;

  if (!planId) issues.push("Plan ID is required.");
  if (planId.length > 80) issues.push("Plan ID must be 80 characters or fewer.");
  if (context.existingPlanIds?.includes(planId)) issues.push("Plan ID already exists.");
  if (!name) issues.push("Plan name is required.");
  if (!slug) issues.push("Plan slug is required.");
  if (context.existingSlugs?.includes(slug)) issues.push("Plan slug already exists.");
  if (!isPlanStatus(status)) issues.push("Plan status is not supported.");
  if (!isPurchaseType(purchaseType)) issues.push("Purchase type is not supported.");
  if (billingInterval !== null && !isBillingInterval(billingInterval)) {
    issues.push("Billing interval is not supported.");
  }
  if (purchaseType === "subscription" && billingInterval === null) {
    issues.push("Subscription plans require a billing interval.");
  }
  if (billingInterval === "lifetime" && purchaseType !== "one_time") {
    issues.push("Lifetime plans must use one-time purchase.");
  }
  if (!Number.isFinite(price) || price < 0) issues.push("Price must be a non-negative number.");
  if (!currency) issues.push("Currency is required.");
  if (!Number.isFinite(trialDays) || trialDays < 0) issues.push("Trial days must be a non-negative number.");
  if (!Number.isFinite(displayOrder)) issues.push("Display order must be a number.");

  const invalidPackageId = packageIds.find((packageId) => !isBillingPackageId(packageId));
  if (invalidPackageId) issues.push(`Package ${invalidPackageId} is not supported.`);

  const invalidGatewayId = gatewayIds.find((gatewayId) => !context.gatewayIds?.includes(gatewayId));
  if (invalidGatewayId) issues.push(`Gateway ${invalidGatewayId} does not exist.`);

  if (status === "active" && packageIds.length === 0) {
    issues.push("Active plans must include at least one package.");
  }
  if (status === "active" && gatewayIds.length === 0) {
    issues.push("Active plans must include at least one gateway.");
  }

  if (
    issues.length > 0 ||
    !isPlanStatus(status) ||
    !isPurchaseType(purchaseType) ||
    (billingInterval !== null && !isBillingInterval(billingInterval))
  ) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    plan: {
      planId,
      name,
      slug,
      description,
      shortDescription,
      status,
      purchaseType,
      billingInterval,
      price,
      currency,
      packageIds,
      gatewayIds,
      trialDays,
      isFeatured: booleanValue(input.isFeatured, false),
      isPublic: booleanValue(input.isPublic, true),
      displayOrder,
      createdAt: null,
      createdBy: context.adminUid ?? null,
      updatedAt: null,
      updatedBy: context.adminUid ?? null,
    },
  };
}

export function validateCreateProviderPriceMappingInput(
  input: CreateProviderPriceMappingInput,
  context: {
    plans?: BillingPlan[];
    gateways?: PaymentGatewayConfig[];
    existingMappingIds?: string[];
  } = {}
): ProviderPriceMappingInputValidationResult {
  const issues: string[] = [];
  const planId = normalizeGatewayId(text(input.planId));
  const gatewayId = normalizeGatewayId(text(input.gatewayId));
  const mappingId = normalizeGatewayId(text(input.mappingId) || `${gatewayId}_${planId}`);
  const provider = text(input.provider);
  const environment = text(input.environment);
  const externalProductId = text(input.externalProductId) || null;
  const externalPriceId = text(input.externalPriceId) || null;
  const externalPlanId = text(input.externalPlanId) || null;
  const amount = Number(input.amount ?? 0);
  const currency = text(input.currency).toUpperCase();
  const rawBillingInterval = text(input.billingInterval);
  const billingInterval = rawBillingInterval || null;
  const purchaseType = text(input.purchaseType);

  const plan = context.plans?.find((item) => item.planId === planId);
  const gateway = context.gateways?.find((item) => item.gatewayId === gatewayId);

  if (!mappingId) issues.push("Mapping ID is required.");
  if (mappingId.length > 100) issues.push("Mapping ID must be 100 characters or fewer.");
  if (context.existingMappingIds?.includes(mappingId)) issues.push("Mapping ID already exists.");
  if (!planId) issues.push("Plan is required.");
  if (!gatewayId) issues.push("Gateway is required.");
  if (!plan) issues.push("Selected plan does not exist.");
  if (!gateway) issues.push("Selected gateway does not exist.");
  if (!isBillingProvider(provider)) issues.push("Provider is not supported.");
  if (!isBillingEnvironment(environment)) issues.push("Environment is not supported.");
  if (!Number.isFinite(amount) || amount < 0) issues.push("Amount must be a non-negative number.");
  if (!currency) issues.push("Currency is required.");
  if (!isPurchaseType(purchaseType)) issues.push("Purchase type is not supported.");
  if (billingInterval !== null && !isBillingInterval(billingInterval)) {
    issues.push("Billing interval is not supported.");
  }
  if (!externalPriceId && !externalPlanId) {
    issues.push("External price ID or external plan ID is required.");
  }

  if (plan && gateway) {
    if (!plan.gatewayIds.includes(gateway.gatewayId)) {
      issues.push("Selected gateway is not assigned to this plan.");
    }
    if (gateway.provider !== provider) {
      issues.push("Provider must match the selected gateway.");
    }
    if (gateway.environment !== environment) {
      issues.push("Environment must match the selected gateway.");
    }
  }

  if (plan) {
    if (plan.price !== amount) issues.push("Mapping amount must match the plan price.");
    if (plan.currency.toUpperCase() !== currency) issues.push("Mapping currency must match the plan currency.");
    if (plan.purchaseType !== purchaseType) issues.push("Mapping purchase type must match the plan purchase type.");
    if (plan.billingInterval !== billingInterval) {
      issues.push("Mapping billing interval must match the plan billing interval.");
    }
  }

  if (
    issues.length > 0 ||
    !isBillingProvider(provider) ||
    !isBillingEnvironment(environment) ||
    !isPurchaseType(purchaseType) ||
    (billingInterval !== null && !isBillingInterval(billingInterval))
  ) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    providerPriceMapping: {
      mappingId,
      planId,
      provider,
      gatewayId,
      environment,
      externalProductId,
      externalPriceId,
      externalPlanId,
      amount,
      currency,
      billingInterval,
      purchaseType,
      active: booleanValue(input.active, true),
      syncStatus: "not_synced",
      syncedAt: null,
      createdAt: null,
      updatedAt: null,
    },
  };
}
