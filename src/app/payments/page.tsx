"use client";

import { useEffect, useMemo, useState } from "react";
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
  checkoutEnabled: false;
};

function formatDate(value: unknown) {
  if (!value) return "Not set";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  if (typeof value === "string") return new Date(value).toLocaleDateString();
  return "Not set";
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
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

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
                Review your current access and preview available NursingMocks plans. Checkout is not enabled yet.
              </p>
            </div>
            <StatusPill tone="amber">Checkout disabled</StatusPill>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

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

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-950">Available Plans</h2>
              <p className="mt-1 text-sm text-gray-600">These plans come from the admin billing catalog. Checkout actions are disabled in this stage.</p>
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
                  const ready = mappings.length > 0 && assignedGateways.length > 0;

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
                          ? "Configuration is ready, but checkout is disabled for this billing stage."
                          : "This plan is missing an enabled gateway or active provider price mapping."}
                      </div>

                      <button disabled className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500">
                        {ready ? "Checkout not enabled" : "Configuration incomplete"}
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-950">{value}</p>
    </div>
  );
}
