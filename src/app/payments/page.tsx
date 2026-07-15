"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeUserDocument } from "@/lib/user-document-firestore";
import type { BillingPlan, PaymentGatewayConfig, ProviderPriceMapping } from "@/lib/billing/models";
import type { UserDocument } from "@/types/user-document";

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type BillingCatalogResponse = {
  plans: Serialized<BillingPlan>[];
  gateways: Serialized<PaymentGatewayConfig>[];
  providerPriceMappings: Serialized<ProviderPriceMapping>[];
  checkoutEnabled: boolean;
};

type BillingHistoryResponse = {
  transactions: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  entitlements: Record<string, unknown>[];
};

function formatDate(value: unknown) {
  if (!value) return "Not set";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (typeof value === "string") return new Date(value).toLocaleDateString();
  return "Not set";
}

function formatMoney(amount: unknown, currency: unknown) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  const currencyCode = typeof currency === "string" && currency ? currency : "USD";
  if (!Number.isFinite(numericAmount)) return "Not set";
  return `${currencyCode} ${numericAmount}`;
}

function packageLabel(packageId: string) {
  const labels: Record<string, string> = {
    ati_teas_7: "ATI TEAS 7",
    hesi_a2: "HESI A2",
    nursing_test_bank: "Nursing Test Bank",
    nursing_exit_exams: "Nursing Exit Exams",
    all_access: "All Access",
  };
  return labels[packageId] ?? packageId;
}

function entitlementLabel(entitlementId: string) {
  return entitlementId
    .replace(/^exam:/, "")
    .replace(/^bundle:/, "")
    .replace(/^feature:/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusPill({ children, tone = "gray" }: { children: string; tone?: "green" | "amber" | "gray" | "purple" }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [catalog, setCatalog] = useState<BillingCatalogResponse | null>(null);
  const [history, setHistory] = useState<BillingHistoryResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const checkoutStatus = new URLSearchParams(window.location.search).get("checkout");
    if (checkoutStatus === "success" || checkoutStatus === "cancelled") {
      setCheckoutNotice(checkoutStatus);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const user = currentUser;
    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/billing/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Could not load billing history");
        const data = (await response.json()) as BillingHistoryResponse;
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) setError("Could not load your billing history.");
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setDocLoading(true);
    return subscribeUserDocument(
      currentUser.uid,
      (doc) => {
        setUserDoc(doc);
        setDocLoading(false);
      },
      () => {
        setError("Could not load your billing profile.");
        setDocLoading(false);
      }
    );
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      setCatalogLoading(true);
      try {
        const response = await fetch("/api/billing/catalog");
        if (!response.ok) throw new Error("Could not load billing plans");
        const data = (await response.json()) as BillingCatalogResponse;
        if (!cancelled) setCatalog(data);
      } catch {
        if (!cancelled) setError("Could not load available plans.");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeEntitlements = useMemo(
    () =>
      Object.entries(userDoc?.entitlements ?? {})
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
    [userDoc]
  );
  const billing = userDoc?.billing;
  const activeProvider = billing?.active_provider ?? "stripe";
  const providerCustomerId =
    activeProvider === "stripe"
      ? userDoc?.billing_providers?.stripe?.customer_id
      : activeProvider === "paypal"
        ? userDoc?.billing_providers?.paypal?.payer_id
        : userDoc?.billing_providers?.authorize_net?.customer_profile_id;
  const portalGateway = catalog?.gateways
    .filter(
      (gateway) =>
        gateway.provider === activeProvider &&
        gateway.environment === "test" &&
        gateway.enabled &&
        gateway.configurationStatus === "ready"
    )
    .sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId))[0];
  const portalReady = Boolean(providerCustomerId && portalGateway);
  const testCheckoutAvailable = Boolean(
    catalog?.plans.some((plan) => {
      const assignedGateways = catalog.gateways.filter(
        (gateway) => plan.gatewayIds.includes(gateway.gatewayId) && gateway.environment === "test"
      );
      const mappings = catalog.providerPriceMappings.filter((mapping) =>
        assignedGateways.some((gateway) => mapping.planId === plan.planId && mapping.gatewayId === gateway.gatewayId)
      );
      return assignedGateways.length > 0 && mappings.length > 0;
    })
  );

  async function startCheckout(plan: Serialized<BillingPlan>, gatewayId: string | null) {
    if (!currentUser) return;

    setError(null);
    setCheckoutPlanId(plan.planId);

    try {
      const token = await currentUser.getIdToken();
      const origin = window.location.origin;
      const response = await fetch("/api/billing/checkout/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.planId,
          gatewayId,
          successUrl: `${origin}/payments?checkout=success`,
          cancelUrl: `${origin}/payments?checkout=cancelled`,
          customerEmail: currentUser.email,
        }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; message?: string; error?: string };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || result.message || "Checkout is not available for this plan yet.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
      setCheckoutPlanId(null);
    }
  }

  async function openBillingPortal() {
    if (!currentUser) return;

    setError(null);
    setPortalLoading(true);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/billing/portal/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatewayId: portalGateway?.gatewayId ?? null,
          returnUrl: `${window.location.origin}/payments`,
        }),
      });
      const result = (await response.json()) as { portalUrl?: string; message?: string; error?: string };

      if (!response.ok || !result.portalUrl) {
        throw new Error(result.error || result.message || "Billing portal is not available yet.");
      }

      window.location.assign(result.portalUrl);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  if (loading || (currentUser && docLoading)) {
    return (
      <Layout>
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-b-purple-600" />
            <p className="mt-4 text-sm font-medium text-gray-600">Loading billing...</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (!currentUser) return null;

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">Billing</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-950">Payments & Subscription</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Review your current access and start test checkout for ready NursingMocks plans.
              </p>
            </div>
            <StatusPill tone={testCheckoutAvailable ? "green" : "amber"}>
              {testCheckoutAvailable ? "Test checkout available" : "Checkout unavailable"}
            </StatusPill>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

          {checkoutNotice === "success" && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Checkout returned successfully.</p>
              <p className="mt-1">
                Access is updated after the payment provider sends a verified webhook. If your access does not appear yet,
                refresh this page after a moment.
              </p>
            </div>
          )}

          {checkoutNotice === "cancelled" && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Checkout was cancelled.</p>
              <p className="mt-1">No billing access changed. You can choose a plan below whenever you are ready.</p>
            </div>
          )}

          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Current Billing Summary</h2>
                  <p className="mt-1 text-sm text-gray-600">Based on your account billing snapshot.</p>
                </div>
                <StatusPill tone={billing?.subscription_status === "active" ? "green" : "gray"}>
                  {billing?.subscription_status ?? "No active subscription"}
                </StatusPill>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Current Plan" value={billing?.plan_id ?? "No paid plan"} />
                <InfoCard label="Billing Interval" value={billing?.interval ?? "Not set"} />
                <InfoCard label="Provider" value={billing?.active_provider ?? "Not set"} />
                <InfoCard label="Renewal / Access End" value={formatDate(billing?.current_period_end)} />
              </div>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">Billing Management</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage payment method and subscription details through the provider test portal.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!portalReady || portalLoading}
                    onClick={() => void openBillingPortal()}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      portalReady && !portalLoading
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {portalLoading ? "Opening portal..." : portalReady ? "Manage billing" : "Portal unavailable"}
                  </button>
                </div>
                {!portalReady && (
                  <p className="mt-3 text-xs text-gray-500">
                    The portal appears after a verified test webhook saves your provider customer record.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-950">Active Access</h2>
              <p className="mt-1 text-sm text-gray-600">Enabled entitlements on your account.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeEntitlements.length === 0 ? (
                  <StatusPill>No active paid access</StatusPill>
                ) : (
                  activeEntitlements.map((entitlement) => (
                    <StatusPill key={entitlement} tone="purple">{entitlementLabel(entitlement)}</StatusPill>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-950">Payment History</h2>
              <p className="mt-1 text-sm text-gray-600">
                Read-only records created after verified webhook processing or controlled admin billing operations.
              </p>
            </div>
            {historyLoading ? (
              <p className="p-5 text-sm text-gray-500">Loading billing history...</p>
            ) : !history ? (
              <p className="p-5 text-sm text-gray-500">Billing history is not available right now.</p>
            ) : (
              <div className="grid gap-4 p-5 xl:grid-cols-3">
                <HistoryPanel
                  title="Transactions"
                  emptyMessage="No payment transactions recorded yet."
                  records={history.transactions}
                  renderRecord={(record) => (
                    <>
                      <p className="font-semibold text-gray-950">{formatMoney(record.amount, record.currency)}</p>
                      <p className="mt-1 text-xs text-gray-500">{String(record.planId ?? "No plan")} · {String(record.status ?? "No status")}</p>
                      <p className="mt-2 text-xs text-gray-500">Paid: {formatDate(record.paidAt ?? record.createdAt)}</p>
                    </>
                  )}
                />
                <HistoryPanel
                  title="Subscriptions"
                  emptyMessage="No subscriptions recorded yet."
                  records={history.subscriptions}
                  renderRecord={(record) => (
                    <>
                      <p className="font-semibold text-gray-950">{String(record.planId ?? "No plan")}</p>
                      <p className="mt-1 text-xs text-gray-500">{String(record.provider ?? "No provider")} · {String(record.status ?? "No status")}</p>
                      <p className="mt-2 text-xs text-gray-500">Period ends: {formatDate(record.currentPeriodEnd)}</p>
                    </>
                  )}
                />
                <HistoryPanel
                  title="Entitlements"
                  emptyMessage="No entitlement records yet."
                  records={history.entitlements}
                  renderRecord={(record) => (
                    <>
                      <p className="font-semibold text-gray-950">{packageLabel(String(record.packageId ?? "unknown"))}</p>
                      <p className="mt-1 text-xs text-gray-500">{String(record.source ?? "No source")} · {String(record.status ?? "No status")}</p>
                      <p className="mt-2 text-xs text-gray-500">Granted: {formatDate(record.grantedAt ?? record.createdAt)}</p>
                    </>
                  )}
                />
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-950">Available Plans</h2>
              <p className="mt-1 text-sm text-gray-600">These plans come from the admin billing catalog. Only ready test-gateway checkout is enabled in this stage.</p>
            </div>

            {catalogLoading ? (
              <p className="p-5 text-sm text-gray-500">Loading plans...</p>
            ) : !catalog || catalog.plans.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">No public billing plans are available yet.</p>
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {catalog.plans.map((plan) => {
                  const mappings = catalog.providerPriceMappings.filter((mapping) => mapping.planId === plan.planId);
                  const assignedGateways = catalog.gateways.filter((gateway) => plan.gatewayIds.includes(gateway.gatewayId));
                  const testGateway = assignedGateways.find((gateway) =>
                    gateway.environment === "test" &&
                    mappings.some((mapping) => mapping.gatewayId === gateway.gatewayId)
                  );
                  const ready = Boolean(testGateway);
                  const checkingOut = checkoutPlanId === plan.planId;

                  return (
                    <article key={plan.planId} className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-950">{plan.name}</h3>
                          <p className="mt-1 text-sm text-gray-600">{plan.shortDescription || plan.description || "Billing plan"}</p>
                        </div>
                        <StatusPill tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Incomplete"}</StatusPill>
                      </div>

                      <div className="mt-4">
                        <p className="text-3xl font-bold text-gray-950">
                          {plan.currency} {plan.price}
                        </p>
                        <p className="text-sm text-gray-500">{plan.billingInterval ?? "No interval"} / {plan.purchaseType}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {plan.packageIds.map((packageId) => (
                          <StatusPill key={packageId}>{packageLabel(packageId)}</StatusPill>
                        ))}
                      </div>

                      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                        {ready
                          ? "This plan can start a test checkout session. Access is granted only after verified webhook processing."
                          : "This plan is missing an enabled test gateway or active provider price mapping."}
                      </div>

                      <button
                        type="button"
                        disabled={!ready || checkingOut}
                        onClick={() => void startCheckout(plan, testGateway?.gatewayId ?? null)}
                        className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold ${
                          ready && !checkingOut
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {checkingOut ? "Starting checkout..." : ready ? "Start test checkout" : "Configuration incomplete"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}

function HistoryPanel({
  title,
  emptyMessage,
  records,
  renderRecord,
}: {
  title: string;
  emptyMessage: string;
  records: Record<string, unknown>[];
  renderRecord: (record: Record<string, unknown>) => ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
          <StatusPill>{String(records.length)}</StatusPill>
        </div>
      </div>
      {records.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="max-h-72 overflow-y-auto p-3">
          <div className="space-y-3">
            {records.map((record, index) => (
              <article
                key={String(record.id ?? record.transactionId ?? record.subscriptionId ?? record.entitlementId ?? index)}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                {renderRecord(record)}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-950">{value}</p>
    </div>
  );
}
