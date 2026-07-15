import { FieldValue } from "firebase-admin/firestore";
import type { BillingPortalSessionResult } from "@/lib/billing/gateway-adapter";
import type { BillingProvider } from "@/lib/billing/models";
import type { BillingPortalSessionInput } from "@/lib/billing/billing-portal";
import { createBillingGatewayRegistry } from "@/lib/billing/gateway-registry";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getBillingCatalog } from "@/lib/server/billing-readiness";

const USERS_COLLECTION = "users";
const BILLING_AUDIT_LOGS_COLLECTION = "billing_audit_logs";

export type CreateBillingPortalSessionResult = {
  status: "created" | "blocked" | "unavailable";
  portalEnabled: boolean;
  message: string;
  auditLogId: string;
  portalUrl?: string;
  providerSessionId?: string;
};

function providerCustomerPath(provider: BillingProvider) {
  if (provider === "authorize_net") return "customer_profile_id";
  if (provider === "paypal") return "payer_id";
  return "customer_id";
}

function getNestedString(value: unknown, path: string[]) {
  let current = value;
  for (const part of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" && current.trim() ? current.trim() : null;
}

async function auditPortalRequest(input: {
  uid: string;
  gatewayId: string | null;
  provider: BillingProvider | null;
  status: string;
  message: string;
  providerResult?: BillingPortalSessionResult | null;
}) {
  const ref = getAdminDb().collection(BILLING_AUDIT_LOGS_COLLECTION).doc();
  await ref.set({
    auditLogId: ref.id,
    action: "billing_portal_session_requested",
    entityType: "billing_portal",
    entityId: ref.id,
    gatewayId: input.gatewayId,
    planId: null,
    uid: input.uid,
    adminUid: null,
    timestamp: FieldValue.serverTimestamp(),
    beforeSummary: null,
    afterSummary: {
      provider: input.provider,
      status: input.status,
      providerSessionId: input.providerResult?.providerSessionId ?? null,
      portalUrlReturned: Boolean(input.providerResult?.portalUrl),
    },
    reason: input.message,
    requestMetadata: null,
  });
  return ref.id;
}

export async function createBillingPortalSession(
  uid: string,
  input: BillingPortalSessionInput
): Promise<CreateBillingPortalSessionResult> {
  const db = getAdminDb();
  const [catalog, userSnapshot] = await Promise.all([
    getBillingCatalog(),
    db.collection(USERS_COLLECTION).doc(uid).get(),
  ]);
  const userData = userSnapshot.exists ? userSnapshot.data() : null;
  const activeProvider = getNestedString(userData, ["billing", "active_provider"]) as BillingProvider | null;
  const provider = activeProvider ?? "stripe";
  const customerId = getNestedString(userData, ["billing_providers", provider, providerCustomerPath(provider)]);

  if (!customerId) {
    const message = "Billing portal is unavailable because no provider customer ID exists for this account.";
    const auditLogId = await auditPortalRequest({
      uid,
      gatewayId: input.gatewayId,
      provider,
      status: "blocked",
      message,
    });
    return {
      status: "blocked",
      portalEnabled: false,
      message,
      auditLogId,
    };
  }

  const candidateGateways = catalog.gateways
    .filter(
      (gateway) =>
        gateway.provider === provider &&
        gateway.enabled &&
        gateway.configurationStatus === "ready" &&
        (!input.gatewayId || gateway.gatewayId === input.gatewayId)
    )
    .sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId));
  const gateway = candidateGateways.find((item) => item.environment === "test") ?? null;

  if (!gateway) {
    const message = "Billing portal is unavailable because no ready test gateway exists for the active provider.";
    const auditLogId = await auditPortalRequest({
      uid,
      gatewayId: input.gatewayId,
      provider,
      status: "blocked",
      message,
    });
    return {
      status: "blocked",
      portalEnabled: false,
      message,
      auditLogId,
    };
  }

  const { registry, issues } = createBillingGatewayRegistry(catalog.gateways);
  const entry = registry.get(gateway.gatewayId);

  if (!entry) {
    const message = issues[0] ?? "No registered payment adapter is available for the selected billing portal gateway.";
    const auditLogId = await auditPortalRequest({
      uid,
      gatewayId: gateway.gatewayId,
      provider,
      status: "blocked",
      message,
    });
    return {
      status: "blocked",
      portalEnabled: false,
      message,
      auditLogId,
    };
  }

  const providerResult = await entry.adapter.createBillingPortalSession({
    uid,
    gateway,
    providerCustomerId: customerId,
    returnUrl: input.returnUrl,
  });
  const created = providerResult.status === "ready" && Boolean(providerResult.portalUrl);
  const auditLogId = await auditPortalRequest({
    uid,
    gatewayId: gateway.gatewayId,
    provider,
    status: providerResult.status,
    message: providerResult.message,
    providerResult,
  });

  return {
    status: created ? "created" : providerResult.status === "unavailable" ? "unavailable" : "blocked",
    portalEnabled: created,
    message: providerResult.message,
    auditLogId,
    portalUrl: created ? providerResult.portalUrl : undefined,
    providerSessionId: providerResult.providerSessionId,
  };
}
