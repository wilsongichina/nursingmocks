import type {
  BillingEnvironment,
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";
import { canGatewayServePlan, type BillingValidationIssue } from "@/lib/billing/validation";

export type CheckoutReadinessInput = {
  planId: string;
  gatewayId?: string | null;
  country?: string | null;
  currency?: string | null;
  environment?: BillingEnvironment | null;
};

export type PublicBillingCatalog = {
  plans: BillingPlan[];
  gateways: PaymentGatewayConfig[];
  providerPriceMappings: ProviderPriceMapping[];
};

export type CheckoutReadinessGatewayCandidate = {
  gatewayId: string;
  provider: PaymentGatewayConfig["provider"];
  displayName: string;
  priority: number;
  mappingId: string | null;
  ready: boolean;
  issues: BillingValidationIssue[];
};

export type CheckoutReadinessResult = {
  ready: boolean;
  checkoutEnabled: false;
  plan: BillingPlan | null;
  selectedGateway: PaymentGatewayConfig | null;
  selectedProviderPriceMapping: ProviderPriceMapping | null;
  candidates: CheckoutReadinessGatewayCandidate[];
  issues: BillingValidationIssue[];
};

function issue(field: string, message: string): BillingValidationIssue {
  return { field, message };
}

function mappingMatchesPlan(mapping: ProviderPriceMapping, plan: BillingPlan) {
  return (
    mapping.active &&
    mapping.planId === plan.planId &&
    mapping.amount === plan.price &&
    mapping.currency.toUpperCase() === plan.currency.toUpperCase() &&
    mapping.purchaseType === plan.purchaseType &&
    mapping.billingInterval === plan.billingInterval
  );
}

function mappingMatchesGateway(mapping: ProviderPriceMapping, gateway: PaymentGatewayConfig) {
  return (
    mapping.gatewayId === gateway.gatewayId &&
    mapping.provider === gateway.provider &&
    mapping.environment === gateway.environment
  );
}

export function getPublicBillingCatalog(catalog: PublicBillingCatalog): PublicBillingCatalog {
  const plans = catalog.plans
    .filter((plan) => plan.status === "active" && plan.isPublic)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  const planIds = new Set(plans.map((plan) => plan.planId));
  const gateways = catalog.gateways
    .filter((gateway) => gateway.enabled)
    .sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId));
  const gatewayIds = new Set(gateways.map((gateway) => gateway.gatewayId));
  const providerPriceMappings = catalog.providerPriceMappings.filter(
    (mapping) => mapping.active && planIds.has(mapping.planId) && gatewayIds.has(mapping.gatewayId)
  );

  return { plans, gateways, providerPriceMappings };
}

export function resolveCheckoutReadiness(
  catalog: PublicBillingCatalog,
  input: CheckoutReadinessInput
): CheckoutReadinessResult {
  const publicCatalog = getPublicBillingCatalog(catalog);
  const plan = publicCatalog.plans.find((item) => item.planId === input.planId) ?? null;
  const issues: BillingValidationIssue[] = [];

  if (!plan) {
    return {
      ready: false,
      checkoutEnabled: false,
      plan: null,
      selectedGateway: null,
      selectedProviderPriceMapping: null,
      candidates: [],
      issues: [issue("planId", "Plan is not active, public, or available for checkout.")],
    };
  }

  const gateways = publicCatalog.gateways.filter(
    (gateway) => plan.gatewayIds.includes(gateway.gatewayId) && (!input.gatewayId || gateway.gatewayId === input.gatewayId)
  );

  if (input.gatewayId && gateways.length === 0) {
    issues.push(issue("gatewayId", "Selected gateway is not enabled or assigned to this plan."));
  }

  const candidates = gateways.map((gateway) => {
    const gatewayValidation = canGatewayServePlan(gateway, plan, {
      country: input.country,
      currency: input.currency,
      environment: input.environment,
    });
    const mapping =
      publicCatalog.providerPriceMappings.find(
        (item) => mappingMatchesPlan(item, plan) && mappingMatchesGateway(item, gateway)
      ) ?? null;
    const candidateIssues = [...gatewayValidation.issues];

    if (!mapping) {
      candidateIssues.push(issue("providerPriceMapping", "No active provider price mapping matches this plan and gateway."));
    }

    return {
      gatewayId: gateway.gatewayId,
      provider: gateway.provider,
      displayName: gateway.displayName,
      priority: gateway.priority,
      mappingId: mapping?.mappingId ?? null,
      ready: candidateIssues.length === 0,
      issues: candidateIssues,
    };
  });

  const readyCandidate = candidates.find((candidate) => candidate.ready) ?? null;
  const selectedGateway = readyCandidate
    ? publicCatalog.gateways.find((gateway) => gateway.gatewayId === readyCandidate.gatewayId) ?? null
    : null;
  const selectedProviderPriceMapping =
    readyCandidate?.mappingId
      ? publicCatalog.providerPriceMappings.find((mapping) => mapping.mappingId === readyCandidate.mappingId) ?? null
      : null;

  if (candidates.length === 0 && issues.length === 0) {
    issues.push(issue("gatewayId", "No enabled gateway is assigned to this plan."));
  }

  if (!readyCandidate) {
    issues.push(issue("checkout", "Checkout is not ready for this plan and gateway configuration."));
  }

  return {
    ready: Boolean(readyCandidate),
    checkoutEnabled: false,
    plan,
    selectedGateway,
    selectedProviderPriceMapping,
    candidates,
    issues,
  };
}
