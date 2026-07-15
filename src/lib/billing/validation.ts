import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";

export type BillingValidationIssue = {
  field: string;
  message: string;
};

export type BillingValidationResult = {
  valid: boolean;
  issues: BillingValidationIssue[];
};

function issue(field: string, message: string): BillingValidationIssue {
  return { field, message };
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function validateBillingPlan(
  plan: BillingPlan,
  context: {
    existingPlans?: BillingPlan[];
    gateways?: PaymentGatewayConfig[];
    providerPriceMappings?: ProviderPriceMapping[];
  } = {}
): BillingValidationResult {
  const issues: BillingValidationIssue[] = [];
  const existingPlans = context.existingPlans ?? [];
  const gateways = context.gateways ?? [];
  const providerPriceMappings = context.providerPriceMappings ?? [];

  if (!hasText(plan.name)) {
    issues.push(issue("name", "Plan name is required."));
  }

  if (!hasText(plan.slug)) {
    issues.push(issue("slug", "Plan slug is required."));
  }

  if (!hasText(plan.currency)) {
    issues.push(issue("currency", "Currency is required."));
  }

  if (plan.price < 0) {
    issues.push(issue("price", "Price cannot be negative."));
  }

  if (plan.trialDays < 0) {
    issues.push(issue("trialDays", "Trial days cannot be negative."));
  }

  if (plan.purchaseType === "subscription" && !plan.billingInterval) {
    issues.push(issue("billingInterval", "Subscription plans require a billing interval."));
  }

  if (plan.billingInterval === "lifetime" && plan.purchaseType !== "one_time") {
    issues.push(issue("purchaseType", "Lifetime plans must use one-time purchase."));
  }

  const duplicateName = existingPlans.some(
    (existing) =>
      existing.planId !== plan.planId &&
      normalized(existing.name) === normalized(plan.name)
  );
  if (duplicateName) {
    issues.push(issue("name", "Plan name must be unique."));
  }

  const duplicateSlug = existingPlans.some(
    (existing) =>
      existing.planId !== plan.planId &&
      normalized(existing.slug) === normalized(plan.slug)
  );
  if (duplicateSlug) {
    issues.push(issue("slug", "Plan slug must be unique."));
  }

  const isActive = plan.status === "active";
  if (isActive && plan.isPublic && plan.packageIds.length === 0) {
    issues.push(issue("packageIds", "Active public plans must include at least one package."));
  }

  if (isActive && plan.gatewayIds.length === 0) {
    issues.push(issue("gatewayIds", "Active plans must include at least one payment gateway."));
  }

  if (isActive && plan.gatewayIds.length > 0) {
    const validAssignedGateway = gateways.some(
      (gateway) =>
        plan.gatewayIds.includes(gateway.gatewayId) &&
        gateway.enabled &&
        gateway.configurationStatus === "ready"
    );
    if (!validAssignedGateway) {
      issues.push(issue("gatewayIds", "Active plans require at least one enabled, ready gateway."));
    }
  }

  if (isActive) {
    const validProviderMapping = providerPriceMappings.some(
      (mapping) =>
        mapping.planId === plan.planId &&
        plan.gatewayIds.includes(mapping.gatewayId) &&
        mapping.active &&
        mapping.amount === plan.price &&
        mapping.currency.toUpperCase() === plan.currency.toUpperCase() &&
        mapping.purchaseType === plan.purchaseType &&
        mapping.billingInterval === plan.billingInterval
    );
    if (!validProviderMapping) {
      issues.push(issue("providerPriceMappings", "Active plans require a valid provider price mapping."));
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function canGatewayServePlan(
  gateway: PaymentGatewayConfig,
  plan: BillingPlan,
  options: {
    country?: string | null;
    currency?: string | null;
    environment?: string | null;
  } = {}
): BillingValidationResult {
  const issues: BillingValidationIssue[] = [];
  const currency = (options.currency || plan.currency).toUpperCase();
  const country = options.country?.toUpperCase();

  if (!gateway.enabled) {
    issues.push(issue("enabled", "Gateway is disabled."));
  }

  if (gateway.configurationStatus !== "ready") {
    issues.push(issue("configurationStatus", "Gateway configuration is not ready."));
  }

  if (!plan.gatewayIds.includes(gateway.gatewayId)) {
    issues.push(issue("gatewayIds", "Gateway is not assigned to this plan."));
  }

  if (options.environment && gateway.environment !== options.environment) {
    issues.push(issue("environment", "Gateway environment does not match checkout environment."));
  }

  if (!gateway.supportedCurrencies.map((value) => value.toUpperCase()).includes(currency)) {
    issues.push(issue("currency", "Gateway does not support this currency."));
  }

  if (country && gateway.supportedCountries.length > 0) {
    const supportedCountries = gateway.supportedCountries.map((value) => value.toUpperCase());
    if (!supportedCountries.includes(country)) {
      issues.push(issue("country", "Gateway does not support this country."));
    }
  }

  if (!gateway.supportedPaymentTypes.includes(plan.purchaseType)) {
    issues.push(issue("purchaseType", "Gateway does not support this purchase type."));
  }

  if (plan.purchaseType === "subscription" && !gateway.supportsSubscriptions) {
    issues.push(issue("supportsSubscriptions", "Gateway does not support subscriptions."));
  }

  if (plan.purchaseType === "one_time" && !gateway.supportsOneTimePayments) {
    issues.push(issue("supportsOneTimePayments", "Gateway does not support one-time payments."));
  }

  if (gateway.minimumAmount !== null && plan.price < gateway.minimumAmount) {
    issues.push(issue("minimumAmount", "Plan price is below the gateway minimum."));
  }

  if (gateway.maximumAmount !== null && plan.price > gateway.maximumAmount) {
    issues.push(issue("maximumAmount", "Plan price is above the gateway maximum."));
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
