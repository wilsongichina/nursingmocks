import {
  BILLING_ENVIRONMENTS,
  BILLING_PROVIDERS,
  PURCHASE_TYPES,
  type BillingEnvironment,
  type BillingProvider,
  type PaymentGatewayConfig,
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
};

export type GatewayInputValidationResult =
  | { valid: true; gateway: PaymentGatewayConfig }
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

export function normalizeGatewayId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
