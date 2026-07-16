"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import { useAuth } from "@/contexts/AuthContext";
import type { BillingPlan, PaymentGatewayConfig, ProviderPriceMapping } from "@/lib/billing/models";

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type BillingCatalogResponse = {
  plans: Serialized<BillingPlan>[];
  gateways: Serialized<PaymentGatewayConfig>[];
  providerPriceMappings: Serialized<ProviderPriceMapping>[];
  checkoutEnabled: boolean;
};

type PlanReadiness = {
  ready: boolean;
  gatewayId: string | null;
  label: string;
};

const PACKAGE_DETAILS: Record<string, { label: string; summary: string; features: string[] }> = {
  ati_teas_7: {
    label: "ATI TEAS 7",
    summary: "Reading, Mathematics, Science, English and Language Usage practice for TEAS candidates.",
    features: ["Subject practice sets", "Full-length exam practice", "Study, practice, and exam modes"],
  },
  hesi_a2: {
    label: "HESI A2",
    summary: "Core HESI A2 entrance exam practice with focused review for required subjects.",
    features: ["Core HESI subjects", "Exam-style questions", "Review-friendly explanations"],
  },
  nursing_test_bank: {
    label: "Nursing Test Bank",
    summary: "RN and LPN nursing practice across core school subjects and question banks.",
    features: ["RN and LPN coverage", "Topic-based question banks", "Reusable practice sessions"],
  },
  nursing_exit_exams: {
    label: "Nursing Exit Exams",
    summary: "Exit exam preparation for RN and LPN students preparing for final readiness checks.",
    features: ["RN Exit Exams", "LPN Exit Exams", "Timed exam practice"],
  },
  all_access: {
    label: "All Access",
    summary: "Broad NursingMocks access when your admin catalog includes a complete bundle.",
    features: ["Multiple exam families", "One access grant", "Best for broad preparation"],
  },
};

const VALUE_POINTS = [
  {
    title: "Admin-Controlled Pricing",
    text: "Plans, prices, package access, and payment gateways come from the billing configuration.",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Exam Access First",
    text: "Purchases grant exam entitlements. Your dashboard uses those entitlements to unlock content.",
    icon: <BookOpenCheck className="h-5 w-5" />,
  },
  {
    title: "Provider Confirmation",
    text: "Access updates after the payment provider sends a verified webhook confirmation.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

function packageLabel(packageId: string) {
  return PACKAGE_DETAILS[packageId]?.label ?? titleCase(packageId.replace(/_/g, " "));
}

function titleCase(value: string) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function formatMoney(amount: unknown, currency: unknown) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  const currencyCode = typeof currency === "string" && currency.trim() ? currency.toUpperCase() : "USD";

  if (!Number.isFinite(numericAmount)) return "Price not set";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: Number.isInteger(numericAmount) ? 0 : 2,
  }).format(numericAmount);
}

function intervalLabel(plan: Serialized<BillingPlan>) {
  if (plan.purchaseType === "one_time") {
    return plan.billingInterval === "lifetime" ? "One-time lifetime access" : "One-time access";
  }

  if (plan.purchaseType === "manual_access") {
    return "Manual access plan";
  }

  return plan.billingInterval ? `${titleCase(plan.billingInterval)} billing` : "Recurring access";
}

function planReadiness(
  plan: Serialized<BillingPlan>,
  gateways: Serialized<PaymentGatewayConfig>[],
  mappings: Serialized<ProviderPriceMapping>[]
): PlanReadiness {
  const assignedGateways = gateways
    .filter((gateway) => plan.gatewayIds.includes(gateway.gatewayId))
    .sort((a, b) => a.priority - b.priority || a.gatewayId.localeCompare(b.gatewayId));

  const readyGateway = assignedGateways.find((gateway) => {
    const gatewayReady =
      gateway.enabled &&
      gateway.configurationStatus === "ready" &&
      (gateway.connectionStatus === "connected" || gateway.lastConnectionTestStatus === "passed");

    const hasMapping = mappings.some(
      (mapping) =>
        mapping.active &&
        mapping.planId === plan.planId &&
        mapping.gatewayId === gateway.gatewayId &&
        mapping.provider === gateway.provider &&
        mapping.environment === gateway.environment &&
        mapping.amount === plan.price &&
        mapping.currency.toUpperCase() === plan.currency.toUpperCase() &&
        mapping.purchaseType === plan.purchaseType &&
        mapping.billingInterval === plan.billingInterval
    );

    return gatewayReady && hasMapping;
  });

  if (readyGateway) {
    return { ready: true, gatewayId: readyGateway.gatewayId, label: `${readyGateway.displayName} ready` };
  }

  return { ready: false, gatewayId: null, label: "Checkout setup pending" };
}

function PlanSkeleton() {
  return (
    <article className="rounded-[22px] border border-[#e5e7eb] bg-white p-[18px] shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      <div className="h-4 w-24 rounded-full bg-[#e9ecf5]" />
      <div className="mt-5 h-7 w-2/3 rounded bg-[#e9ecf5]" />
      <div className="mt-3 h-4 w-full rounded bg-[#eef1f7]" />
      <div className="mt-2 h-4 w-4/5 rounded bg-[#eef1f7]" />
      <div className="mt-8 h-10 w-36 rounded bg-[#e9ecf5]" />
      <div className="mt-8 grid gap-3">
        <div className="h-4 rounded bg-[#eef1f7]" />
        <div className="h-4 rounded bg-[#eef1f7]" />
        <div className="h-4 w-3/4 rounded bg-[#eef1f7]" />
      </div>
    </article>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [catalog, setCatalog] = useState<BillingCatalogResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/billing/catalog");
        if (!response.ok) throw new Error("Could not load current pricing.");
        const data = (await response.json()) as BillingCatalogResponse;
        if (!cancelled) setCatalog(data);
      } catch {
        if (!cancelled) setError("Could not load current pricing. Please refresh and try again.");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo(
    () => [...(catalog?.plans ?? [])].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)),
    [catalog?.plans]
  );

  const packageSummaries = useMemo(() => {
    const ids = new Set(plans.flatMap((plan) => plan.packageIds));
    return Array.from(ids)
      .map((id) => ({ id, detail: PACKAGE_DETAILS[id] }))
      .filter((item): item is { id: string; detail: NonNullable<(typeof PACKAGE_DETAILS)[string]> } => Boolean(item.detail));
  }, [plans]);

  async function startCheckout(plan: Serialized<BillingPlan>, gatewayId: string | null) {
    const returnTo = `/pricing?plan=${encodeURIComponent(plan.planId)}`;

    if (!currentUser) {
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setCheckoutPlanId(plan.planId);
    setError(null);

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
          cancelUrl: `${origin}/pricing?checkout=cancelled`,
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif] text-[#111827]">
      <NewHeader />

      <main>
        <div className="border-b border-[#e5e7eb] bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff]">
          <section className="public-page-container grid grid-cols-1 items-start gap-6 py-8 pb-8 sm:py-[52px] sm:pb-[40px] lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            <div>
              <div className="mb-[10px] flex flex-wrap items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#6d28d9] sm:gap-[10px] sm:text-[13px] sm:tracking-[0.16em]">
                <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-[10px] py-1 text-[#4338ca]">
                  NursingMocks Pricing
                </span>
                <span>Choose Exam Access</span>
              </div>
              <h1 className="mb-3 max-w-[760px] text-[clamp(31px,8vw,44px)] font-bold leading-[1.08] text-[#111827] sm:text-[clamp(34px,4.2vw,44px)]">
                Choose the NursingMocks access that fits your next exam.
              </h1>
              <p className="mb-[22px] max-w-[580px] text-[14px] leading-[1.7] text-[#6b7280] sm:text-[15px]">
                Pick the exam package you need now. Plans, prices, and checkout readiness come from the live billing setup so the page stays aligned with what users can actually buy.
              </p>
              <div className="mb-4 grid gap-[10px] sm:flex sm:flex-wrap">
                <a
                  href="#plans"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#6366f1] bg-[#6366f1] px-4 py-[10px] text-[14px] text-white transition-all hover:border-[#4f46e5] hover:bg-[#4f46e5] sm:w-auto sm:py-[9px]"
                >
                  View Plans
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#d1d5db] bg-transparent px-4 py-[10px] text-[14px] text-[#374151] transition-all hover:border-[#111827] hover:bg-[#111827] hover:text-[#f9fafb] sm:w-auto sm:py-[9px]"
                >
                Ask a question
                </Link>
              </div>
              <div className="max-w-[620px] text-[13px] leading-[1.6] text-[#6b7280]">
                <strong className="text-[#111827]">Available access:</strong> ATI TEAS 7, HESI A2, Nursing Test Bank, and Nursing Exit Exams
              </div>
            </div>

            <aside className="flex justify-center lg:justify-end">
              <div className="flex w-full max-w-[430px] flex-col gap-[10px] rounded-[22px] border border-[#e5e7eb] bg-white p-4 pb-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:p-[18px]">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#ecfdf3] px-2 py-[3px] text-[11px] uppercase tracking-[0.16em] text-[#166534]">
                  Access Flow
                </div>
                <h2 className="mt-0.5 text-[16px] font-semibold text-[#111827]">How exam access works</h2>
                <p className="-mt-1 text-[13px] leading-[1.6] text-[#6b7280]">
                  Choose a plan, complete checkout, and access updates after the payment provider confirms the transaction.
                </p>
                <div className="mt-1 grid gap-2">
                  {VALUE_POINTS.map((item) => (
                    <div key={item.title} className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-[10px] py-[9px]">
                      <div className="flex items-start gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]">
                          {item.icon}
                        </span>
                        <div className="min-w-0 break-words">
                          <h3 className="text-[13px] font-semibold text-[#111827]">{item.title}</h3>
                          <p className="mt-0.5 text-[12px] leading-[1.45] text-[#6b7280]">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>

        <section id="plans" className="public-page-container py-7 pb-9 sm:py-8">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">Available Plans</p>
              <h2 className="mt-1 text-[22px] font-semibold text-[#111827]">
                Current NursingMocks exam access
              </h2>
              <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">
                These plans are loaded from the live billing catalog so pricing and access stay accurate.
              </p>
            </div>
            <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4b5563]">
              <Clock3 className="h-4 w-4 text-[#4338ca]" />
              One-time access focused
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800" role="alert">
              {error}
            </div>
          )}

          {catalogLoading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <PlanSkeleton />
              <PlanSkeleton />
              <PlanSkeleton />
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-[22px] text-center shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-[18px] font-semibold text-[#111827]">No public plans are available</h2>
              <p className="mx-auto mt-2 max-w-xl text-[13px] leading-[1.6] text-[#6b7280]">
                Active public billing plans will appear here after they are configured in admin.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => {
                const readiness = planReadiness(plan, catalog?.gateways ?? [], catalog?.providerPriceMappings ?? []);
                const checkingOut = checkoutPlanId === plan.planId;
                const primaryLabel = checkingOut
                  ? "Starting checkout..."
                  : readiness.ready
                    ? currentUser
                      ? "Continue to checkout"
                      : "Sign in to continue"
                    : "Checkout pending";

                return (
                  <article
                    key={plan.planId}
                    className={`flex flex-col overflow-hidden rounded-[22px] border bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:p-[18px] lg:min-h-[430px] ${
                      plan.isFeatured ? "border-[#c7d2fe] bg-gradient-to-br from-white to-[#eef2ff]" : "border-[#e5e7eb]"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
                          {intervalLabel(plan)}
                        </p>
                        <h3 className="mt-2 break-words text-[18px] font-semibold text-[#111827]">{plan.name}</h3>
                      </div>
                      {plan.isFeatured && (
                        <span className="w-fit shrink-0 rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#4338ca]">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[13px] leading-[1.6] text-[#6b7280] lg:min-h-[44px]">
                      {plan.shortDescription || plan.description || "NursingMocks exam access plan."}
                    </p>

                    <div className="mt-5">
                      <p className="break-words text-[28px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[30px]">
                        {formatMoney(plan.price, plan.currency)}
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.45] text-[#6b7280]">{plan.purchaseType === "one_time" ? "One payment. Access follows the configured plan period." : intervalLabel(plan)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.packageIds.map((packageId) => (
                        <span
                          key={packageId}
                          className="max-w-full break-words rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1 text-[11px] font-semibold leading-[1.35] text-[#4b5563]"
                        >
                          {packageLabel(packageId)}
                        </span>
                      ))}
                    </div>

                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-[rgba(148,163,184,0.4)] to-transparent" />

                    <ul className="grid gap-2 text-[13px] text-[#4b5563]">
                      {(plan.packageIds.length > 0 ? plan.packageIds : ["all_access"]).slice(0, 2).flatMap((packageId) => {
                        const detail = PACKAGE_DETAILS[packageId];
                        return detail?.features ?? ["Exam practice access", "Progress-friendly study flow", "Dashboard access"];
                      }).slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#15803d]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        disabled={!readiness.ready || checkingOut}
                        onClick={() => void startCheckout(plan, readiness.gatewayId)}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border px-4 py-[10px] text-center text-[14px] transition-all sm:py-[9px] ${
                          readiness.ready && !checkingOut
                            ? "border-[#6366f1] bg-[#6366f1] text-white hover:border-[#4f46e5] hover:bg-[#4f46e5]"
                            : "cursor-not-allowed border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280]"
                        }`}
                      >
                        {primaryLabel}
                        {readiness.ready && !checkingOut && <ArrowRight className="h-4 w-4" />}
                      </button>
                      <p className="mt-2 text-center text-[11px] text-[#6b7280]">{readiness.label}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {packageSummaries.length > 0 && (
          <div className="border-y border-[#e5e7eb] bg-gradient-to-br from-[#e5e7ff] via-[#f9fafb] to-[#f9fafb]">
          <section className="public-page-container py-7 pb-9 sm:py-8">
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:p-[18px]">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">What is included</p>
                  <h2 className="mt-1 text-[20px] font-semibold text-[#111827] sm:text-[22px]">Exam packages in current plans</h2>
                </div>
                <FileText className="hidden h-8 w-8 text-[#4338ca] sm:block" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {packageSummaries.map(({ id, detail }) => (
                  <article key={id} className="rounded-[18px] border border-[#d9e0ff] bg-gradient-to-br from-white to-[#eef2ff] p-3.5 shadow-[0_14px_30px_rgba(129,140,248,0.16)]">
                    <h3 className="text-[16px] font-semibold text-[#111827]">{detail.label}</h3>
                    <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">{detail.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          </div>
        )}

        <section className="public-page-container py-7 pb-14 sm:py-8 sm:pb-16">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="rounded-[22px] border border-[#e5e7eb] bg-white p-[18px] shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
              <h2 className="text-[18px] font-semibold text-[#111827]">Pricing FAQ</h2>
              <div className="mt-4 grid gap-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111827]">Are these prices current?</h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">Yes. Public pricing is loaded from active billing plans, assigned gateways, and provider price mappings.</p>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111827]">Do plans renew automatically?</h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">Only plans configured as recurring should renew. Current checkout copy is focused on one-time exam access.</p>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111827]">When does exam access update?</h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7280]">Access updates after the payment provider confirms the transaction through a verified webhook.</p>
                </div>
              </div>
            </article>

            <article className="rounded-[22px] border border-[#e5e7eb] bg-white p-[18px] shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
              <h2 className="text-[18px] font-semibold text-[#111827]">Need help choosing?</h2>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#6b7280]">
                Start with the exam you are preparing for now. You can add more exam access from your account when additional plans are available.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-[#d1d5db] bg-transparent px-4 py-[9px] text-[14px] text-[#374151] transition-all hover:border-[#111827] hover:bg-[#111827] hover:text-[#f9fafb]"
              >
                Contact Support
              </Link>
            </article>
          </div>
        </section>
      </main>

      <NewFooter />
      <FloatingWhatsAppButton />
    </div>
  );
}
