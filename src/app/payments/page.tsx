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

function StatusPill({ children, tone = "gray" }: { children: string; tone?: "green" | "amber" | "gray" | "purple" | "blue" }) {
  const tones = {
    green: "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]",
    amber: "border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#b45309]",
    gray: "border-[#e0e3f0] bg-white text-[#7a819c]",
    purple: "border-[rgba(106,92,255,.38)] bg-[rgba(106,92,255,.08)] text-[#4f46e5]",
    blue: "border-[rgba(59,130,246,.35)] bg-[rgba(59,130,246,.08)] text-[#2563eb]",
  };
  return (
    <span className={`inline-flex min-h-7 shrink-0 items-center rounded-full border border-dashed px-3 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(23,35,79,.08)] ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#202437]">{title}</h2>
        {subtitle && <p className="mt-1 max-w-3xl text-sm leading-6 text-[#7a819c]">{subtitle}</p>}
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
    <div className="flex min-h-[112px] items-start gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a0a5bf]">{label}</p>
        <p className="mt-1 break-words text-lg font-semibold tracking-[-0.02em] text-[#202437]">{value}</p>
        {helper && <p className="mt-1 text-xs leading-5 text-[#7a819c]">{helper}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-5 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#202437]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#7a819c]">{text}</p>
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
        <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#e0e3f0] border-b-[#6a5cff]" />
            <p className="mt-4 text-sm font-medium text-[#7a819c]">Loading payments...</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (!currentUser) return null;

  return (
    <Layout>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(106,92,255,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.05),transparent_55%),#f5f6fb]">
        <div className="mx-auto max-w-[1220px] px-4 pb-14 pt-[18px] text-[#202437] max-[560px]:px-[14px] max-[560px]:pb-[46px] max-[560px]:pt-[14px]">
          <header className="pb-[14px] pt-[18px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={activeEntitlements.length > 0 ? "green" : "amber"}>
                    {activeEntitlements.length > 0 ? "Access active" : "No paid access"}
                  </StatusPill>
                  <StatusPill tone={testCheckoutAvailable ? "purple" : "gray"}>
                    {testCheckoutAvailable ? "Checkout ready" : "Checkout unavailable"}
                  </StatusPill>
                </div>
                <h1 className="mt-3 text-[30px] font-extrabold tracking-[-0.03em] text-[#202437] max-[560px]:text-2xl">
                  Payments & Access
                </h1>
                <p className="mt-2 max-w-[96ch] text-sm font-medium leading-6 text-[#7a819c]">
                  Manage your NursingMocks access, review payment transactions, and choose a one-time access plan when checkout is available.
                </p>
              </div>

              <div className="w-full rounded-2xl bg-white p-4 shadow-[0_18px_45px_rgba(23,35,79,.08)] sm:w-[360px]">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a0a5bf]">Current Plan</p>
                    <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#202437]">{activePlan?.name ?? billing?.plan_id ?? "No paid plan"}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[#7a819c]">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] px-3 py-2">
                    <span>Provider</span>
                    <span className="font-semibold text-[#202437]">{billing?.active_provider ?? "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] px-3 py-2">
                    <span>Access ends</span>
                    <span className="font-semibold text-[#202437]">{formatDate(billing?.current_period_end)}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {checkoutNotice === "success" && (
            <div className="mb-4 rounded-2xl border border-[rgba(43,170,96,.35)] bg-[rgba(43,170,96,.10)] p-4 text-sm text-[#166534]">
              <p className="font-semibold">Checkout returned successfully.</p>
              <p className="mt-1">
                Access updates after the payment provider sends a verified webhook. Refresh this page after a moment if access is not visible yet.
              </p>
            </div>
          )}

          {checkoutNotice === "cancelled" && (
            <div className="mb-4 rounded-2xl border border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.10)] p-4 text-sm text-[#92400e]">
              <p className="font-semibold">Checkout was cancelled.</p>
              <p className="mt-1">No access changed. You can choose a plan below whenever you are ready.</p>
            </div>
          )}

          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              label="Access Status"
              value={activeEntitlements.length > 0 ? "Active" : "Not active"}
              helper={`${activeEntitlements.length} active access grant(s)`}
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
                    subtitle="Choose a one-time access plan. Checkout is enabled only when the plan has a ready payment gateway and provider price mapping."
                  />
                </div>

                {catalogLoading ? (
                  <p className="p-5 text-sm text-[#7a819c]">Loading plans...</p>
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
                          className={`flex min-h-[300px] flex-col rounded-2xl border p-4 ${
                            ready
                              ? "border-[rgba(106,92,255,.26)] bg-[rgba(106,92,255,.045)]"
                              : "border-[#e0e3f0] bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#a0a5bf]">One-time access</p>
                              <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#202437]">{plan.name}</h3>
                              <p className="mt-2 text-sm leading-6 text-[#7a819c]">
                                {plan.shortDescription || plan.description || "NursingMocks access plan"}
                              </p>
                            </div>
                            <StatusPill tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Incomplete"}</StatusPill>
                          </div>

                          <div className="mt-5">
                            <p className="text-4xl font-bold tracking-[-0.04em] text-[#202437]">
                              {plan.currency} {plan.price}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#7a819c]">
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
                              className={`inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                                canCheckout && !checkingOut
                                  ? "bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] hover:-translate-y-px hover:shadow-[0_18px_42px_rgba(79,70,229,.33)]"
                                  : "cursor-not-allowed border border-[#e0e3f0] bg-[#f5f6fb] text-[#a0a5bf]"
                              }`}
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
                              <p className="mt-2 text-center text-xs font-medium text-[#7a819c]">
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
                        <p className="text-base font-semibold text-[#202437]">{formatMoney(record.amount, record.currency)}</p>
                        <p className="mt-1 break-words text-xs text-[#7a819c]">{String(record.planId ?? "No plan")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <StatusPill tone="blue">{statusText(record.status)}</StatusPill>
                        <span className="text-xs font-medium text-[#7a819c]">Paid {formatDate(record.paidAt ?? record.createdAt)}</span>
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
                        <div key={entitlement} className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(43,170,96,.35)] bg-[rgba(43,170,96,.08)] p-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2baa60]">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="min-w-0 text-sm font-semibold text-[#202437]">{entitlementLabel(entitlement)}</p>
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
                        <p className="font-semibold text-[#202437]">{packageLabel(String(record.packageId ?? "unknown"))}</p>
                        <StatusPill tone="purple">{statusText(record.status)}</StatusPill>
                      </div>
                      <p className="mt-2 text-xs text-[#7a819c]">{String(record.source ?? "No source")}</p>
                      <p className="mt-2 text-xs font-medium text-[#7a819c]">Granted {formatDate(record.grantedAt ?? record.createdAt)}</p>
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
    return <p className="p-5 text-sm text-[#7a819c]">Loading records...</p>;
  }

  if (unavailable) {
    return <p className="p-5 text-sm text-[#7a819c]">Billing history is not available right now.</p>;
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
            className="rounded-xl border border-[#e0e3f0] bg-white p-4 text-sm transition hover:border-[rgba(106,92,255,.35)] hover:bg-[rgba(106,92,255,.035)]"
          >
            {renderRecord(record)}
          </article>
        ))}
      </div>
    </div>
  );
}
