import { FieldValue } from "firebase-admin/firestore";
import { createBillingGatewayRegistry } from "@/lib/billing/gateway-registry";
import type { CheckoutSessionResult } from "@/lib/billing/gateway-adapter";
import type { CheckoutSessionDraftInput } from "@/lib/billing/checkout-session";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { isBillingLiveCapabilityApproved } from "@/lib/server/billing-live-controls";
import { getBillingCatalog } from "@/lib/server/billing-readiness";
import { resolveCheckoutReadiness } from "@/lib/billing/checkout-readiness";

const BILLING_CHECKOUT_ATTEMPTS_COLLECTION = "billing_checkout_attempts";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const USERS_COLLECTION = "users";

export type CreateCheckoutSessionDraftResult = {
  status: "created" | "blocked" | "unavailable";
  checkoutEnabled: boolean;
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

function dateFromFirestoreValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
  }
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return null;
}

function isUnexpiredAccessEnd(value: unknown, now: Date) {
  const accessEnd = dateFromFirestoreValue(value);
  return accessEnd === null || accessEnd.getTime() > now.getTime();
}

async function findActiveSamePlanAccess(uid: string, planId: string) {
  const db = getAdminDb();
  const now = new Date();
  const entitlementSnapshot = await db
    .collection(BILLING_ENTITLEMENTS_COLLECTION)
    .where("uid", "==", uid)
    .where("sourcePlanId", "==", planId)
    .where("status", "==", "active")
    .limit(10)
    .get();

  const activeEntitlement = entitlementSnapshot.docs.find((doc) => {
    const data = doc.data();
    return isUnexpiredAccessEnd(data.accessEndsAt, now);
  });

  if (activeEntitlement) {
    return {
      active: true,
      reason: "entitlement",
      accessEndsAt: activeEntitlement.data().accessEndsAt ?? null,
    };
  }

  const userSnapshot = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!userSnapshot.exists) return { active: false, reason: null, accessEndsAt: null };

  const user = userSnapshot.data() ?? {};
  const billing = user.billing && typeof user.billing === "object" ? (user.billing as Record<string, unknown>) : {};
  if (billing.plan_id !== planId || !isUnexpiredAccessEnd(billing.current_period_end, now)) {
    return { active: false, reason: null, accessEndsAt: null };
  }

  const entitlements = user.entitlements && typeof user.entitlements === "object" ? (user.entitlements as Record<string, unknown>) : {};
  const hasAnyActiveEntitlement = Object.values(entitlements).some((enabled) => enabled === true);
  return {
    active: hasAnyActiveEntitlement,
    reason: hasAnyActiveEntitlement ? "user_billing_summary" : null,
    accessEndsAt: billing.current_period_end ?? null,
  };
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

  const existingAccess = await findActiveSamePlanAccess(uid, readiness.plan.planId);
  if (existingAccess.active) {
    const message =
      "Checkout is blocked because this plan is already active on your account. You can buy it again after the current access period ends.";
    const attemptId = await logCheckoutAttempt({
      uid,
      planId: readiness.plan.planId,
      gatewayId: readiness.selectedGateway.gatewayId,
      provider: readiness.selectedGateway.provider,
      status: "blocked",
      message,
      readinessIssues: [
        {
          field: "planId",
          message: "The selected plan already has active, unexpired access for this user.",
          reason: existingAccess.reason,
        },
      ],
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
  const liveModeApproved =
    readiness.selectedGateway.environment === "live"
      ? await isBillingLiveCapabilityApproved("checkout")
      : false;

  if (readiness.selectedGateway.environment === "live" && !liveModeApproved) {
    const message = "Live checkout is blocked because live checkout approval has not been recorded.";
    const attemptId = await logCheckoutAttempt({
      uid,
      planId: input.planId,
      gatewayId: readiness.selectedGateway.gatewayId,
      provider: readiness.selectedGateway.provider,
      status: "blocked",
      message,
    });

    return {
      status: "blocked",
      checkoutEnabled: false,
      message,
      attemptId,
    };
  }

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
    liveModeApproved,
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
  const created = providerResult.status === "ready" && Boolean(providerResult.checkoutUrl);

  return {
    status: created ? "created" : providerResult.status === "unavailable" ? "unavailable" : "blocked",
    checkoutEnabled: created,
    message: providerResult.message,
    attemptId,
    checkoutUrl: created ? providerResult.checkoutUrl : undefined,
    providerSessionId: providerResult.providerSessionId,
  };
}
