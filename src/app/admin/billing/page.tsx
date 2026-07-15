"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type {
  BillingPlan,
  PaymentGatewayConfig,
  ProviderPriceMapping,
} from "@/lib/billing/models";

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type BillingConfigResponse = {
  plans: Serialized<BillingPlan>[];
  gateways: Serialized<PaymentGatewayConfig>[];
  providerPriceMappings: Serialized<ProviderPriceMapping>[];
};

type GatewayForm = {
  gatewayId: string;
  provider: PaymentGatewayConfig["provider"];
  displayName: string;
  environment: PaymentGatewayConfig["environment"];
  enabled: boolean;
  supportedCurrencies: string;
  supportedCountries: string;
  supportedPaymentTypes: string[];
  supportsSubscriptions: boolean;
  supportsOneTimePayments: boolean;
  minimumAmount: string;
  maximumAmount: string;
  priority: string;
  isDefault: boolean;
};

const initialGatewayForm: GatewayForm = {
  gatewayId: "",
  provider: "stripe",
  displayName: "",
  environment: "test",
  enabled: false,
  supportedCurrencies: "USD",
  supportedCountries: "US",
  supportedPaymentTypes: ["subscription", "one_time"],
  supportsSubscriptions: true,
  supportsOneTimePayments: true,
  minimumAmount: "",
  maximumAmount: "",
  priority: "100",
  isDefault: false,
};

function Pill({ children, tone = "gray" }: { children: string; tone?: "green" | "gray" | "blue" | "amber" }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
        <p className="text-xs text-gray-500">{count} configured</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function AdminBillingContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<BillingConfigResponse>({
    plans: [],
    gateways: [],
    providerPriceMappings: [],
  });
  const [form, setForm] = useState<GatewayForm>(initialGatewayForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/billing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not load billing configuration");
      setConfig((await response.json()) as BillingConfigResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load billing configuration");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const togglePaymentType = (paymentType: string) => {
    setForm((current) => {
      const exists = current.supportedPaymentTypes.includes(paymentType);
      return {
        ...current,
        supportedPaymentTypes: exists
          ? current.supportedPaymentTypes.filter((item) => item !== paymentType)
          : [...current.supportedPaymentTypes, paymentType],
      };
    });
  };

  const submitGateway = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/billing", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "gateway", gateway: form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create gateway");
      setMessage("Gateway configuration created.");
      setForm(initialGatewayForm);
      await loadConfig();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create gateway");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">Admin</Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Billing</span>
            </div>
            {currentUser && <UserProfileBadge />}
          </div>
        </div>

        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <p className="text-sm font-semibold text-purple-700">Admin</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-950">Billing Configuration</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Manage server-side billing plans, gateways, and provider price mappings. Gateway secrets and live checkout remain disabled until later billing stages.
              </p>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">{message}</div>}

            <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.42fr)_minmax(0,0.58fr)]">
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="text-sm font-semibold text-gray-950">Add Gateway</h2>
                  <p className="text-xs text-gray-500">Creates an admin-managed gateway record without storing secrets.</p>
                </div>
                <form onSubmit={submitGateway} className="grid gap-4 p-4">
                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    Gateway ID
                    <input value={form.gatewayId} onChange={(event) => setForm({ ...form, gatewayId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="stripe_us_test" />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Provider
                      <select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value as GatewayForm["provider"] })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="authorize_net">Authorize.Net</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Environment
                      <select value={form.environment} onChange={(event) => setForm({ ...form, environment: event.target.value as GatewayForm["environment"] })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                        <option value="test">Test</option>
                        <option value="live">Live</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    Display Name
                    <input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Stripe US Test" />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Currencies
                      <input value={form.supportedCurrencies} onChange={(event) => setForm({ ...form, supportedCurrencies: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="USD, CAD" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Countries
                      <input value={form.supportedCountries} onChange={(event) => setForm({ ...form, supportedCountries: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="US, CA or blank for global" />
                    </label>
                  </div>

                  <div className="grid gap-2 text-sm font-medium text-gray-700">
                    Payment Types
                    <div className="flex flex-wrap gap-3">
                      {["subscription", "one_time"].map((paymentType) => (
                        <label key={paymentType} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <input type="checkbox" checked={form.supportedPaymentTypes.includes(paymentType)} onChange={() => togglePaymentType(paymentType)} />
                          {paymentType === "one_time" ? "One-time" : "Subscription"}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Min Amount
                      <input value={form.minimumAmount} onChange={(event) => setForm({ ...form, minimumAmount: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Max Amount
                      <input value={form.maximumAmount} onChange={(event) => setForm({ ...form, maximumAmount: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Priority
                      <input value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                  </div>

                  <div className="grid gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />
                      Enabled
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />
                      Default gateway
                    </label>
                  </div>

                  <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving..." : "Create Gateway"}
                  </button>
                </form>
              </section>

              <div className="grid gap-6">
                <Section title="Gateways" count={config.gateways.length}>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : config.gateways.length === 0 ? (
                    <p className="text-sm text-gray-500">No gateways configured yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {config.gateways.map((gateway) => (
                        <div key={gateway.gatewayId} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-950">{gateway.displayName}</h3>
                              <p className="mt-1 text-xs text-gray-500">{gateway.gatewayId}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Pill tone="blue">{gateway.provider}</Pill>
                              <Pill tone={gateway.enabled ? "green" : "gray"}>{gateway.enabled ? "Enabled" : "Disabled"}</Pill>
                              <Pill tone="amber">{gateway.configurationStatus}</Pill>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-600">
                            {gateway.environment} · {gateway.supportedCurrencies.join(", ")} · {gateway.supportedCountries.length ? gateway.supportedCountries.join(", ") : "Global"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Plans" count={config.plans.length}>
                  {config.plans.length === 0 ? <p className="text-sm text-gray-500">No billing plans configured yet.</p> : <pre className="max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">{JSON.stringify(config.plans, null, 2)}</pre>}
                </Section>

                <Section title="Provider Price Mappings" count={config.providerPriceMappings.length}>
                  {config.providerPriceMappings.length === 0 ? <p className="text-sm text-gray-500">No provider price mappings configured yet.</p> : <pre className="max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">{JSON.stringify(config.providerPriceMappings, null, 2)}</pre>}
                </Section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminBillingPage() {
  return (
    <SidebarProvider>
      <AdminBillingContent />
    </SidebarProvider>
  );
}
