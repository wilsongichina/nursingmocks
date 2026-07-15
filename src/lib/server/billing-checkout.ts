import { FieldValue } from "firebase-admin/firestore";
import { createBillingGatewayRegistry } from "@/lib/billing/gateway-registry";
import type { CheckoutSessionResult } from "@/lib/billing/gateway-adapter";
import type { CheckoutSessionDraftInput } from "@/lib/billing/checkout-session";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getBillingCatalog } from "@/lib/server/billing-readiness";
import { resolveCheckoutReadiness } from "@/lib/billing/checkout-readiness";

const BILLING_CHECKOUT_ATTEMPTS_COLLECTION = "billing_checkout_attempts";

export type CreateCheckoutSessionDraftResult = {
  status: "blocked" | "unavailable";
  checkoutEnabled: false;
  message: string;
  attemptId: string;
  checkoutUrl?: string;
  providerSessionId?: string;
};

async function logCheckoutAttempt(input: {
  uid: string;
  planId: string;
  gatewayId: string | null;
  status: string;
  message: string;
  readinessIssues?: unknown;
  provider?: string | null;
  providerResult?: CheckoutSessionResult | null;
}) {
  const attemptRef = getAdminDb().collection(BILLING_CHECKOUT_ATTEMPTS_COLLECTION).doc();
  await attemptRef.set({
    attemptId: attemptRef.id,
    uid: input.uid,
    planId: input.planId,
    gatewayId: input.gatewayId,
    provider: input.provider ?? null,
    status: input.status,
    message: input.message,
    readinessIssues: input.readinessIssues ?? null,
    providerResult: input.providerResult
      ? {
          status: input.providerResult.status,
          message: input.providerResult.message,
          providerSessionId: input.providerResult.providerSessionId ?? null,
          checkoutUrlReturned: Boolean(input.providerResult.checkoutUrl),
        }
      : null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return attemptRef.id;
}

export async function createCheckoutSessionDraft(
  uid: string,
  input: CheckoutSessionDraftInput
): Promise<CreateCheckoutSessionDraftResult> {
  const catalog = await getBillingCatalog();
  const readiness = resolveCheckoutReadiness(catalog, {
    planId: input.planId,
    gatewayId: input.gatewayId,
  });

  if (!readiness.ready || !readiness.plan || !readiness.selectedGateway || !readiness.selectedProviderPriceMapping) {
    const message = "Checkout session was blocked because billing configuration is not ready.";
    const attemptId = await logCheckoutAttempt({
      uid,
      planId: input.planId,
      gatewayId: input.gatewayId,
      status: "blocked",
      message,
      readinessIssues: readiness.issues,
    });

    return {
      status: "blocked",
      checkoutEnabled: false,
      message,
      attemptId,
    };
  }

  const { registry, issues } = createBillingGatewayRegistry(catalog.gateways);
  const entry = registry.get(readiness.selectedGateway.gatewayId);

  if (!entry) {
    const message = issues[0] ?? "No registered payment adapter is available for the selected gateway.";
    const attemptId = await logCheckoutAttempt({
      uid,
      planId: input.planId,
      gatewayId: readiness.selectedGateway.gatewayId,
      provider: readiness.selectedGateway.provider,
      status: "blocked",
      message,
      readinessIssues: issues,
    });

    return {
      status: "blocked",
      checkoutEnabled: false,
      message,
      attemptId,
    };
  }

  const providerResult = await entry.adapter.createCheckoutSession({
    uid,
    plan: readiness.plan,
    gateway: readiness.selectedGateway,
    providerPriceMapping: readiness.selectedProviderPriceMapping,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    customerEmail: input.customerEmail,
    metadata: {
      uid,
      planId: readiness.plan.planId,
      gatewayId: readiness.selectedGateway.gatewayId,
      mappingId: readiness.selectedProviderPriceMapping.mappingId,
    },
  });
  const attemptId = await logCheckoutAttempt({
    uid,
    planId: input.planId,
    gatewayId: readiness.selectedGateway.gatewayId,
    provider: readiness.selectedGateway.provider,
    status: providerResult.status,
    message: providerResult.message,
    providerResult,
  });

  return {
    status: providerResult.status === "unavailable" ? "unavailable" : "blocked",
    checkoutEnabled: false,
    message: providerResult.message,
    attemptId,
    checkoutUrl: undefined,
    providerSessionId: providerResult.providerSessionId,
  };
}
