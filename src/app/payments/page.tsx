"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
  entitlements: Record<string, unknown>[];
};

function formatDate(value: unknown) {
  if (!value) return "Not set";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return new Date(timestamp).toLocaleDateString();
  }
  return "Not set";
}

function dateFromValue(value: unknown): Date | null {
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

function isCurrentAccessPeriod(value: unknown) {
  const accessEnd = dateFromValue(value);
  return accessEnd === null || accessEnd.getTime() > Date.now();
}

function formatMoney(amount: unknown, currency: unknown) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  const currencyCode = typeof currency === "string" && currency ? currency.toUpperCase() : "USD";
  if (!Number.isFinite(numericAmount)) return "Not set";
  return `${currencyCode} ${numericAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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

function statusText(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw ? raw.replace(/_/g, " ") : "No status";
}

function textValue(value: unknown, fallback = "Not set") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function StatusPill({ children, tone = "gray" }: { children: string; tone?: "green" | "amber" | "gray" | "purple" | "blue" }) {
  const tones = {
    green: "user-pill-green",
    amber: "user-pill-amber",
    gray: "",
    purple: "user-pill-purple",
    blue: "user-pill-purple",
  };
  return <span className={`user-pill ${tones[tone]}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`user-card overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="user-section-title">{title}</h2>
        {subtitle && <p className="user-body-sm mt-1 max-w-3xl">{subtitle}</p>}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
}) {
  return (
    <div className="user-stat-tile flex min-h-[112px] items-start gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="user-label">{label}</p>
        <p className="user-stat-value mt-1 break-words text-lg">{value}</p>
        {helper && <p className="user-helper mt-1">{helper}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="user-detail-surface p-5 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
        {icon}
      </div>
      <h3 className="user-card-title mt-3">{title}</h3>
      <p className="user-helper mt-1">{text}</p>
    </div>
  );
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
  const activePlan = useMemo(
    () => catalog?.plans.find((plan) => plan.planId === billing?.plan_id) ?? null,
    [billing?.plan_id, catalog?.plans]
  );
  const planNameById = useMemo(() => {
    const names = new Map<string, string>();
    catalog?.plans.forEach((plan) => names.set(plan.planId, plan.name));
    return names;
  }, [catalog?.plans]);
  const latestTransaction = history?.transactions[0] ?? null;
  const hasActiveBillingPlan = Boolean(
    billing?.plan_id &&
      activeEntitlements.length > 0 &&
      isCurrentAccessPeriod(billing.current_period_end)
  );
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
  const activeAccessCountLabel = `${activeEntitlements.length} active access grant${activeEntitlements.length === 1 ? "" : "s"}`;

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

  if (loading || (currentUser && docLoading)) {
    return (
      <Layout>
        <main className="user-page">
          <div className="user-page-container">
            <div className="user-card mx-auto mt-12 max-w-xl p-5">
              <p className="user-card-title">Loading payments</p>
              <div className="mt-4 grid gap-3">
                <div className="user-skeleton h-5 w-2/3" />
                <div className="user-skeleton h-4 w-full" />
                <div className="user-skeleton h-4 w-3/4" />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!currentUser) return null;

  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <header className="user-page-header">
            <div className="user-page-header-row">
              <div className="user-page-header-copy">
                <p className="user-eyebrow inline-flex items-center gap-2">
                  <span className="user-accent-dot" />
                  Billing Center
                </p>
                <h1 className="user-page-title mt-2">Payments & Access</h1>
                <p className="user-body-sm mt-3">
                  Manage your NursingMocks access, review payment transactions, and choose a one-time access plan when checkout is available.
                </p>
                <div className="user-page-header-meta mt-4">
                  <StatusPill tone={activeEntitlements.length > 0 ? "green" : "amber"}>
                    {activeEntitlements.length > 0 ? "Access active" : "No paid access"}
                  </StatusPill>
                  <StatusPill tone={testCheckoutAvailable ? "purple" : "amber"}>
                    {testCheckoutAvailable ? "Checkout ready" : "Checkout not ready"}
                  </StatusPill>
                </div>
              </div>

              <div className="user-card w-full p-4 sm:w-[360px]">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="user-label">Current Plan</p>
                    <p className="user-card-title mt-1">{activePlan?.name ?? billing?.plan_id ?? "No paid plan"}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="user-detail-surface flex items-center justify-between gap-3 px-3 py-2">
                    <span>Payment provider</span>
                    <span className="font-semibold text-[#0f172a]">{billing?.active_provider ?? "Not set"}</span>
                  </div>
                  <div className="user-detail-surface flex items-center justify-between gap-3 px-3 py-2">
                    <span>Access ends</span>
                    <span className="font-semibold text-[#0f172a]">{formatDate(billing?.current_period_end)}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {error && (
            <div className="user-alert user-alert-error mb-5" role="alert">
              <span className="user-alert-icon" aria-hidden="true">x</span>
              <div>
                <p className="user-card-title">Billing error</p>
                <p className="user-helper mt-1">{error}</p>
              </div>
            </div>
          )}

          {checkoutNotice === "success" && (
            <div className="user-alert user-alert-success mb-5" role="status">
              <span className="user-alert-icon" aria-hidden="true">ok</span>
              <div>
                <p className="user-card-title">Checkout returned successfully</p>
                <p className="user-helper mt-1">
                  Access updates after the payment provider sends a verified webhook. Refresh this page after a moment if access is not visible yet.
                </p>
              </div>
            </div>
          )}

          {checkoutNotice === "cancelled" && (
            <div className="user-alert user-alert-warning mb-5" role="status">
              <span className="user-alert-icon" aria-hidden="true">!</span>
              <div>
                <p className="user-card-title">Checkout was cancelled</p>
                <p className="user-helper mt-1">No access changed. You can choose a plan below whenever you are ready.</p>
              </div>
            </div>
          )}

          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              label="Access Status"
              value={activeEntitlements.length > 0 ? "Active" : "Not active"}
              helper={activeAccessCountLabel}
              icon={<PackageCheck className="h-5 w-5" />}
            />
            <SummaryTile
              label="Plan"
              value={activePlan?.name ?? billing?.plan_id ?? "No paid plan"}
              helper="Based on your account billing snapshot"
              icon={<Sparkles className="h-5 w-5" />}
            />
            <SummaryTile
              label="Last Payment"
              value={latestTransaction ? formatMoney(latestTransaction.amount, latestTransaction.currency) : "No payment yet"}
              helper={latestTransaction ? `Status: ${statusText(latestTransaction.status)}` : "Transactions appear after provider confirmation"}
              icon={<ReceiptText className="h-5 w-5" />}
            />
            <SummaryTile
              label="Access End"
              value={formatDate(billing?.current_period_end)}
              helper="One-time access may show lifetime or no end date"
              icon={<Clock3 className="h-5 w-5" />}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)]">
            <div className="grid content-start gap-6">
              <Card>
                <div className="border-b border-[#edf0f7] p-5">
                  <SectionHeader
                    title="Available Plans"
                    subtitle="Choose a one-time access plan. Checkout stays disabled when payment setup is incomplete or the same plan is already active on your account."
                  />
                </div>

                {catalogLoading ? (
                  <div className="p-5">
                    <div className="grid gap-3">
                      <div className="user-skeleton h-5 w-2/3" />
                      <div className="user-skeleton h-4 w-full" />
                      <div className="user-skeleton h-4 w-3/4" />
                    </div>
                  </div>
                ) : !catalog || catalog.plans.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={<LockKeyhole className="h-5 w-5" />}
                      title="No plans available"
                      text="Public billing plans will appear here after they are configured by the admin team."
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 p-5 lg:grid-cols-2">
                    {catalog.plans.map((plan) => {
                      const mappings = catalog.providerPriceMappings.filter((mapping) => mapping.planId === plan.planId);
                      const assignedGateways = catalog.gateways.filter((gateway) => plan.gatewayIds.includes(gateway.gatewayId));
                      const testGateway = assignedGateways.find((gateway) =>
                        gateway.environment === "test" &&
                        mappings.some((mapping) => mapping.gatewayId === gateway.gatewayId)
                      );
                      const ready = Boolean(testGateway);
                      const checkingOut = checkoutPlanId === plan.planId;
                      const alreadyActive = hasActiveBillingPlan && billing?.plan_id === plan.planId;
                      const canCheckout = ready && !alreadyActive;

                      return (
                        <article
                          key={plan.planId}
                          className={`flex min-h-[300px] flex-col p-4 ${ready ? "user-feature-surface" : "user-detail-surface"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="user-label">One-time access</p>
                              <h3 className="user-card-title mt-1 text-lg">{plan.name}</h3>
                              <p className="user-helper mt-2">
                                {plan.shortDescription || plan.description || "NursingMocks access plan"}
                              </p>
                            </div>
                            <StatusPill tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Incomplete"}</StatusPill>
                          </div>

                          <div className="mt-5">
                            <p className="user-stat-value">
                              {plan.currency} {plan.price}
                            </p>
                            <p className="user-helper mt-1">
                              {plan.purchaseType === "one_time" ? "One payment for access" : statusText(plan.purchaseType)}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {plan.packageIds.map((packageId) => (
                              <StatusPill key={packageId} tone="purple">{packageLabel(packageId)}</StatusPill>
                            ))}
                          </div>

                          <div className="mt-auto pt-5">
                            <button
                              type="button"
                              disabled={!canCheckout || checkingOut}
                              onClick={() => void startCheckout(plan, testGateway?.gatewayId ?? null)}
                              className={`${canCheckout && !checkingOut ? "user-button-primary" : "user-button-secondary"} w-full gap-2`}
                            >
                              {checkingOut
                                ? "Starting checkout..."
                                : alreadyActive
                                  ? "Already active"
                                  : ready
                                    ? "Continue to checkout"
                                    : "Configuration incomplete"}
                              {canCheckout && !checkingOut && <ArrowRight className="h-4 w-4" />}
                            </button>
                            {alreadyActive && (
                              <p className="user-helper mt-2 text-center">
                                This plan can be purchased again after your current access period ends.
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card>
                <div className="border-b border-[#edf0f7] p-5">
                  <SectionHeader
                    title="Payment Transactions"
                    subtitle="Completed payment records appear here after provider confirmation."
                  />
                </div>
                <HistoryPanel
                  loading={historyLoading}
                  unavailable={!history}
                  emptyIcon={<CreditCard className="h-5 w-5" />}
                  emptyTitle="No transactions yet"
                  emptyMessage="Your payment transactions will appear here after checkout is confirmed."
                  records={history?.transactions ?? []}
                  renderRecord={(record) => (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="user-card-title">{formatMoney(record.amount, record.currency)}</p>
                        <p className="user-helper mt-1 break-words">
                          {textValue(record.planNameSnapshot, planNameById.get(textValue(record.planId, "")) ?? "No plan")}
                        </p>
                        <p className="user-helper mt-1 break-words">
                          {textValue(record.paymentMethodSummary, textValue(record.provider, "Provider not recorded"))}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <StatusPill tone="blue">{statusText(record.status)}</StatusPill>
                        <span className="user-helper">Paid {formatDate(record.paidAt ?? record.createdAt)}</span>
                      </div>
                    </div>
                  )}
                />
              </Card>
            </div>

            <aside className="grid content-start gap-6">
              <Card>
                <div className="border-b border-[#edf0f7] p-5">
                  <SectionHeader
                    title="Active Access"
                    subtitle="Access grants currently enabled on your account."
                  />
                </div>
                <div className="p-5">
                  {activeEntitlements.length === 0 ? (
                    <EmptyState
                      icon={<LockKeyhole className="h-5 w-5" />}
                      title="No active paid access"
                      text="Choose a plan to unlock exam packages and study materials."
                    />
                  ) : (
                    <div className="grid gap-3">
                      {activeEntitlements.map((entitlement) => (
                        <div key={entitlement} className="user-detail-surface flex items-center gap-3 p-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(43,170,96,.10)] text-[#15803d]">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="user-card-title min-w-0">{entitlementLabel(entitlement)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="border-b border-[#edf0f7] p-5">
                  <SectionHeader
                    title="Access Grants"
                    subtitle="Read-only access changes from payments or admin updates."
                  />
                </div>
                <HistoryPanel
                  loading={historyLoading}
                  unavailable={!history}
                  emptyIcon={<PackageCheck className="h-5 w-5" />}
                  emptyTitle="No access grant records"
                  emptyMessage="Access grant records will appear after checkout or admin updates."
                  records={history?.entitlements ?? []}
                  renderRecord={(record) => (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="user-card-title">{packageLabel(String(record.packageId ?? "unknown"))}</p>
                        <StatusPill tone="purple">{statusText(record.status)}</StatusPill>
                      </div>
                      <p className="user-helper mt-2">Source: {statusText(record.source)}</p>
                      <p className="user-helper mt-2">Granted {formatDate(record.grantedAt ?? record.createdAt)}</p>
                    </div>
                  )}
                />
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function HistoryPanel({
  loading,
  unavailable,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  records,
  renderRecord,
}: {
  loading: boolean;
  unavailable: boolean;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyMessage: string;
  records: Record<string, unknown>[];
  renderRecord: (record: Record<string, unknown>) => ReactNode;
}) {
  if (loading) {
    return (
      <div className="p-5">
        <div className="grid gap-3">
          <div className="user-skeleton h-5 w-2/3" />
          <div className="user-skeleton h-4 w-full" />
          <div className="user-skeleton h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (unavailable) {
    return <p className="user-helper p-5">Billing history is not available right now.</p>;
  }

  if (records.length === 0) {
    return (
      <div className="p-5">
        <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-y-auto p-5">
      <div className="grid gap-3">
        {records.map((record, index) => (
          <article
            key={String(record.id ?? record.transactionId ?? record.subscriptionId ?? record.entitlementId ?? index)}
            className="user-detail-surface p-4 transition hover:border-[rgba(79,70,229,0.32)] hover:bg-white"
          >
            {renderRecord(record)}
          </article>
        ))}
      </div>
    </div>
  );
}
