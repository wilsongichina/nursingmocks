"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type {
  BillingPlan,
  BillingAuditLogEntry,
  BillingEntitlement,
  BillingSubscription,
  BillingTransaction,
  PaymentGatewayConfig,
  ProviderPriceMapping,
  ExamAccessProduct,
} from "@/lib/billing/models";
import type { BillingLiveCapability, BillingLiveControls } from "@/lib/billing/live-controls";
import { normalizePlanName } from "@/lib/billing/admin-config";

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type BillingConfigResponse = {
  plans: Serialized<BillingPlan>[];
  gateways: Serialized<PaymentGatewayConfig>[];
  providerPriceMappings: Serialized<ProviderPriceMapping>[];
  transactions: Serialized<BillingTransaction>[];
  subscriptions: Serialized<BillingSubscription>[];
  entitlements: Serialized<BillingEntitlement>[];
  webhookEvents: Record<string, unknown>[];
  checkoutAttempts: Record<string, unknown>[];
  operationReviews: Record<string, unknown>[];
  auditLogs: Serialized<BillingAuditLogEntry>[];
  liveControls: Serialized<BillingLiveControls>;
};

type ExamAccessResponse = {
  products: Serialized<ExamAccessProduct>[];
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
  publishableKeyRef: string;
  secretKeyRef: string;
  webhookSecretRef: string;
};

type PlanForm = {
  planId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: BillingPlan["status"];
  purchaseType: BillingPlan["purchaseType"];
  billingInterval: string;
  examId: string;
  durationDays: string;
  renewsAutomatically: boolean;
  price: string;
  currency: string;
  packageIds: string[];
  gatewayIds: string[];
  trialDays: string;
  isFeatured: boolean;
  isPublic: boolean;
  displayOrder: string;
};

type ProviderPriceMappingForm = {
  mappingId: string;
  planId: string;
  gatewayId: string;
  provider: ProviderPriceMapping["provider"];
  environment: ProviderPriceMapping["environment"];
  externalProductId: string;
  externalPriceId: string;
  externalPlanId: string;
  amount: string;
  currency: string;
  billingInterval: string;
  purchaseType: ProviderPriceMapping["purchaseType"];
  active: boolean;
};

type BillingManagementTab =
  | "readiness"
  | "plans"
  | "gateways"
  | "mappings"
  | "transactions"
  | "entitlements"
  | "webhooks"
  | "attempts"
  | "reviews"
  | "audit";
type EditTarget =
  | { type: "plan"; id: string }
  | { type: "gateway"; id: string }
  | { type: "providerPriceMapping"; id: string }
  | null;

type PlanEditForm = {
  name: string;
  description: string;
  shortDescription: string;
  status: BillingPlan["status"];
  purchaseType: BillingPlan["purchaseType"];
  billingInterval: string;
  price: string;
  currency: string;
  packageIds: string[];
  gatewayIds: string[];
  trialDays: string;
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: string;
};

type GatewayEditForm = {
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
  supportedCurrencies: string;
  supportedCountries: string;
  supportedPaymentTypes: string[];
  supportsSubscriptions: boolean;
  supportsOneTimePayments: boolean;
  minimumAmount: string;
  maximumAmount: string;
  priority: string;
  publishableKeyRef: string;
  secretKeyRef: string;
  webhookSecretRef: string;
};

type ProviderPriceMappingEditForm = {
  externalProductId: string;
  externalPriceId: string;
  externalPlanId: string;
  amount: string;
  currency: string;
  billingInterval: string;
  purchaseType: ProviderPriceMapping["purchaseType"];
  active: boolean;
};

type OperationForm = {
  operation: string;
  uid: string;
  packageId: string;
  planId: string;
  entitlementId: string;
  webhookEventRecordId: string;
  transactionId: string;
  subscriptionId: string;
  reason: string;
  note: string;
};

type LiveApprovalForm = {
  capability: BillingLiveCapability;
  reason: string;
};

const initialGatewayForm: GatewayForm = {
  gatewayId: "",
  provider: "stripe",
  displayName: "",
  environment: "test",
  enabled: false,
  supportedCurrencies: "USD",
  supportedCountries: "US",
  supportedPaymentTypes: ["one_time"],
  supportsSubscriptions: false,
  supportsOneTimePayments: true,
  minimumAmount: "",
  maximumAmount: "",
  priority: "100",
  isDefault: false,
  publishableKeyRef: "",
  secretKeyRef: "",
  webhookSecretRef: "",
};

const packageOptions = [
  { id: "ati_teas_7", label: "ATI TEAS 7" },
  { id: "hesi_a2", label: "HESI A2" },
  { id: "nursing_test_bank", label: "Nursing Test Bank" },
  { id: "nursing_exit_exams", label: "Nursing Exit Exams" },
];

const initialPlanForm: PlanForm = {
  planId: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  status: "draft",
  purchaseType: "one_time",
  billingInterval: "lifetime",
  examId: "",
  durationDays: "30",
  renewsAutomatically: false,
  price: "",
  currency: "USD",
  packageIds: [],
  gatewayIds: [],
  trialDays: "0",
  isFeatured: false,
  isPublic: true,
  displayOrder: "100",
};

const fixedAccessDurations = [
  { label: "1 Month Access", durationDays: "30", slug: "1-month" },
  { label: "3 Months Access", durationDays: "90", slug: "3-months" },
];

function slugFromText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function planNameFor(examName: string, durationDays: string) {
  const duration = fixedAccessDurations.find((item) => item.durationDays === durationDays);
  return `${examName} ${duration?.label ?? "Access"}`.trim();
}

function planIdFor(examId: string, durationDays: string) {
  const suffix = durationDays === "90" ? "3_months" : "1_month";
  return `${examId}_${suffix}`;
}

const initialProviderPriceMappingForm: ProviderPriceMappingForm = {
  mappingId: "",
  planId: "",
  gatewayId: "",
  provider: "stripe",
  environment: "test",
  externalProductId: "",
  externalPriceId: "",
  externalPlanId: "",
  amount: "",
  currency: "USD",
  billingInterval: "",
  purchaseType: "one_time",
  active: true,
};

const initialPlanEditForm: PlanEditForm = {
  name: "",
  description: "",
  shortDescription: "",
  status: "draft",
  purchaseType: "one_time",
  billingInterval: "lifetime",
  price: "",
  currency: "USD",
  packageIds: [],
  gatewayIds: [],
  trialDays: "0",
  isPublic: true,
  isFeatured: false,
  displayOrder: "100",
};

const initialGatewayEditForm: GatewayEditForm = {
  displayName: "",
  enabled: false,
  isDefault: false,
  supportedCurrencies: "USD",
  supportedCountries: "US",
  supportedPaymentTypes: ["one_time"],
  supportsSubscriptions: false,
  supportsOneTimePayments: true,
  minimumAmount: "",
  maximumAmount: "",
  priority: "100",
  publishableKeyRef: "",
  secretKeyRef: "",
  webhookSecretRef: "",
};

const initialProviderPriceMappingEditForm: ProviderPriceMappingEditForm = {
  externalProductId: "",
  externalPriceId: "",
  externalPlanId: "",
  amount: "",
  currency: "USD",
  billingInterval: "",
  purchaseType: "one_time",
  active: true,
};

const initialOperationForm: OperationForm = {
  operation: "manualEntitlementGrant",
  uid: "",
  packageId: "ati_teas_7",
  planId: "",
  entitlementId: "",
  webhookEventRecordId: "",
  transactionId: "",
  subscriptionId: "",
  reason: "",
  note: "",
};

const initialLiveApprovalForm: LiveApprovalForm = {
  capability: "checkout",
  reason: "",
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
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
        <p className="text-xs text-gray-500">{count} configured</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
    </div>
  );
}

function LockedNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
      {children}
    </div>
  );
}

function recordValue(record: Record<string, unknown>, key: string) {
  return record[key] ?? "";
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null && "message" in item) {
          return String((item as { message?: unknown }).message ?? JSON.stringify(item));
        }
        return displayValue(item);
      })
      .join("; ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function displayDetailValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return displayValue(value);
}

function recordTimestamp(record: Record<string, unknown>) {
  const candidates = ["createdAt", "updatedAt", "currentPeriodEnd", "accessEndsAt"];
  for (const key of candidates) {
    const value = record[key];
    if (typeof value !== "string") continue;
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

function recordIdentity(record: Record<string, unknown>) {
  return displayValue(
    record.transactionId ??
      record.subscriptionId ??
      record.entitlementId ??
      record.webhookEventRecordId ??
      record.attemptId ??
      record.reviewId ??
      record.auditLogId ??
      record.id
  );
}

function OperationsTable({
  records,
  columns,
  emptyMessage,
}: {
  records: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  emptyMessage: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => recordTimestamp(right) - recordTimestamp(left)),
    [records]
  );
  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((record) => displayValue(record.status ?? record.processingStatus))
            .filter((value) => value !== "Not set")
        )
      ).sort(),
    [records]
  );
  const providerOptions = useMemo(
    () =>
      Array.from(
        new Set(records.map((record) => displayValue(record.provider)).filter((value) => value !== "Not set"))
      ).sort(),
    [records]
  );
  const visibleRecords = useMemo(() => {
    const fromTime = dateFrom ? Date.parse(`${dateFrom}T00:00:00`) : null;
    const toTime = dateTo ? Date.parse(`${dateTo}T23:59:59`) : null;

    return sortedRecords.filter((record) =>
      (statusFilter === "all" || displayValue(record.status ?? record.processingStatus) === statusFilter) &&
      (providerFilter === "all" || displayValue(record.provider) === providerFilter) &&
      (fromTime === null || recordTimestamp(record) >= fromTime) &&
      (toTime === null || recordTimestamp(record) <= toTime) &&
      (!normalizedSearch ||
        columns.some((column) => displayValue(recordValue(record, column.key)).toLowerCase().includes(normalizedSearch)))
    );
  }, [columns, dateFrom, dateTo, normalizedSearch, providerFilter, sortedRecords, statusFilter]);

  if (records.length === 0) {
    return <p className="p-4 text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="grid gap-3 border-b border-gray-100 bg-gray-50/60 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-gray-950">Records</p>
          <p className="mt-1 text-xs text-gray-500">
            Showing {visibleRecords.length} of {records.length}. Newest records appear first.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[220px_150px_150px_140px_140px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records"
            aria-label="Search billing records"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter billing records by status"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
            aria-label="Filter billing records by provider"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          >
            <option value="all">All providers</option>
            {providerOptions.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Filter billing records from date"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Filter billing records to date"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>
      {visibleRecords.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No records match this search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 shadow-[1px_0_0_#e5e7eb]">Actions</th>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {visibleRecords.map((record, index) => (
                <tr
                  key={String(record.id ?? record.transactionId ?? record.subscriptionId ?? record.entitlementId ?? record.auditLogId ?? record.webhookEventRecordId ?? record.attemptId ?? index)}
                  className="group hover:bg-purple-50/40"
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-4 align-top shadow-[1px_0_0_#f3f4f6] group-hover:bg-purple-50">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:border-purple-300 hover:bg-purple-100"
                    >
                      View
                    </button>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="max-w-xs px-4 py-4 align-top text-gray-700">
                      <span className="break-words text-xs">{displayValue(recordValue(record, column.key))}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Read-only billing record</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-950">Record Details</h3>
                <p className="mt-1 max-w-2xl break-words text-sm text-gray-600">{recordIdentity(selectedRecord)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="max-h-[72vh] overflow-y-auto bg-white p-5">
              <dl className="grid gap-3">
                {Object.entries(selectedRecord).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <dt className="text-xs font-semibold uppercase text-gray-500">{key}</dt>
                    <dd className="mt-2 min-w-0 whitespace-pre-wrap break-words rounded-md bg-white px-3 py-2 font-mono text-xs leading-5 text-gray-800 ring-1 ring-gray-100">
                      {displayDetailValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessCheckRow({ label, passed, detail }: { label: string; passed: boolean; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-gray-950">{label}</p>
        <p className="mt-1 text-xs text-gray-500">{detail}</p>
      </div>
      <Pill tone={passed ? "green" : "amber"}>{passed ? "OK" : "Needs attention"}</Pill>
    </div>
  );
}

function AdminBillingContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<BillingConfigResponse>({
    plans: [],
    gateways: [],
    providerPriceMappings: [],
    transactions: [],
    subscriptions: [],
    entitlements: [],
    webhookEvents: [],
    checkoutAttempts: [],
    operationReviews: [],
    auditLogs: [],
    liveControls: {
      checkout: { approved: false, approvedBy: null, approvedAt: null, reason: null },
      webhookEffects: { approved: false, approvedBy: null, approvedAt: null, reason: null },
      portal: { approved: false, approvedBy: null, approvedAt: null, reason: null },
    },
  });
  const [examProducts, setExamProducts] = useState<Serialized<ExamAccessProduct>[]>([]);
  const [form, setForm] = useState<GatewayForm>(initialGatewayForm);
  const [planForm, setPlanForm] = useState<PlanForm>(initialPlanForm);
  const [mappingForm, setMappingForm] = useState<ProviderPriceMappingForm>(
    initialProviderPriceMappingForm
  );
  const [activeTab, setActiveTab] = useState<BillingManagementTab>("readiness");
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [planEditForm, setPlanEditForm] = useState<PlanEditForm>(initialPlanEditForm);
  const [gatewayEditForm, setGatewayEditForm] = useState<GatewayEditForm>(initialGatewayEditForm);
  const [mappingEditForm, setMappingEditForm] = useState<ProviderPriceMappingEditForm>(
    initialProviderPriceMappingEditForm
  );
  const [operationForm, setOperationForm] = useState<OperationForm>(initialOperationForm);
  const [liveApprovalForm, setLiveApprovalForm] = useState<LiveApprovalForm>(initialLiveApprovalForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const [billingResponse, examResponse] = await Promise.all([
        fetch("/api/admin/billing", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/exam-access", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!billingResponse.ok) throw new Error("Could not load billing configuration");
      if (!examResponse.ok) throw new Error("Could not load exam access catalog");
      setConfig((await billingResponse.json()) as BillingConfigResponse);
      const examData = (await examResponse.json()) as ExamAccessResponse;
      setExamProducts(examData.products ?? []);
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

  const applyPlanCatalogSelection = (examId: string, durationDays: string) => {
    const product = examProducts.find((item) => item.examId === examId);
    const nextName = product ? planNameFor(product.name, durationDays) : "";
    const nextPlanId = examId ? planIdFor(examId, durationDays) : "";

    setPlanForm((current) => ({
      ...current,
      examId,
      durationDays,
      renewsAutomatically: false,
      purchaseType: "one_time",
      billingInterval: "lifetime",
      trialDays: "0",
      packageIds: examId ? [examId] : [],
      planId: nextPlanId,
      slug: nextName ? slugFromText(nextName) : "",
      name: nextName,
      shortDescription: product?.shortDescription ?? current.shortDescription,
      description: product?.description ?? current.description,
    }));
  };

  const togglePlanGateway = (gatewayId: string) => {
    setPlanForm((current) => {
      const exists = current.gatewayIds.includes(gatewayId);
      return {
        ...current,
        gatewayIds: exists
          ? current.gatewayIds.filter((item) => item !== gatewayId)
          : [...current.gatewayIds, gatewayId],
      };
    });
  };

  const togglePlanEditPackage = (packageId: string) => {
    setPlanEditForm((current) => {
      const exists = current.packageIds.includes(packageId);
      return {
        ...current,
        packageIds: exists
          ? current.packageIds.filter((item) => item !== packageId)
          : [...current.packageIds, packageId],
      };
    });
  };

  const togglePlanEditGateway = (gatewayId: string) => {
    setPlanEditForm((current) => {
      const exists = current.gatewayIds.includes(gatewayId);
      return {
        ...current,
        gatewayIds: exists
          ? current.gatewayIds.filter((item) => item !== gatewayId)
          : [...current.gatewayIds, gatewayId],
      };
    });
  };

  const toggleGatewayEditPaymentType = (paymentType: string) => {
    setGatewayEditForm((current) => {
      const exists = current.supportedPaymentTypes.includes(paymentType);
      return {
        ...current,
        supportedPaymentTypes: exists
          ? current.supportedPaymentTypes.filter((item) => item !== paymentType)
          : [...current.supportedPaymentTypes, paymentType],
      };
    });
  };

  const submitPlan = async (event: FormEvent<HTMLFormElement>) => {
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
        body: JSON.stringify({ type: "plan", plan: planForm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create plan");
      setMessage("Billing plan created.");
      setPlanForm(initialPlanForm);
      await loadConfig();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create plan");
    } finally {
      setSaving(false);
    }
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

  const selectMappingPlan = (planId: string) => {
    const plan = config.plans.find((item) => item.planId === planId);
    setMappingForm((current) => ({
      ...current,
      planId,
      amount: plan ? String(plan.price) : current.amount,
      currency: plan?.currency ?? current.currency,
      billingInterval: plan?.billingInterval ?? "",
      purchaseType: plan?.purchaseType ?? current.purchaseType,
    }));
  };

  const selectMappingGateway = (gatewayId: string) => {
    const gateway = config.gateways.find((item) => item.gatewayId === gatewayId);
    setMappingForm((current) => ({
      ...current,
      gatewayId,
      provider: gateway?.provider ?? current.provider,
      environment: gateway?.environment ?? current.environment,
    }));
  };

  const submitProviderPriceMapping = async (event: FormEvent<HTMLFormElement>) => {
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
        body: JSON.stringify({
          type: "providerPriceMapping",
          providerPriceMapping: mappingForm,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create provider price mapping");
      setMessage("Provider price mapping created.");
      setMappingForm(initialProviderPriceMappingForm);
      await loadConfig();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not create provider price mapping"
      );
    } finally {
      setSaving(false);
    }
  };

  const patchBillingConfig = async (
    type: NonNullable<EditTarget>["type"],
    id: string,
    patch: Record<string, unknown>,
    successMessage: string
  ) => {
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, id, patch }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update billing configuration");
      setMessage(successMessage);
      setEditTarget(null);
      await loadConfig();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update billing configuration");
    } finally {
      setSaving(false);
    }
  };

  const submitAdminOperation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/billing/operations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operationForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not run billing operation");
      setMessage("Billing operation recorded.");
      setOperationForm(initialOperationForm);
      await loadConfig();
    } catch (operationError) {
      setError(operationError instanceof Error ? operationError.message : "Could not run billing operation");
    } finally {
      setSaving(false);
    }
  };

  const submitLiveApproval = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/billing/live-controls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(liveApprovalForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not approve live billing capability");
      setMessage("Live billing capability approval recorded.");
      setLiveApprovalForm(initialLiveApprovalForm);
      await loadConfig();
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Could not approve live billing capability");
    } finally {
      setSaving(false);
    }
  };

  const editPlan = (plan: Serialized<BillingPlan>) => {
    setActiveTab("plans");
    setEditTarget({ type: "plan", id: plan.planId });
    setPlanEditForm({
      name: plan.name,
      description: plan.description,
      shortDescription: plan.shortDescription,
      status: plan.status,
      purchaseType: plan.purchaseType,
      billingInterval: plan.billingInterval ?? "",
      price: String(plan.price),
      currency: plan.currency,
      packageIds: [...plan.packageIds],
      gatewayIds: [...plan.gatewayIds],
      trialDays: String(plan.trialDays),
      isPublic: plan.isPublic,
      isFeatured: plan.isFeatured,
      displayOrder: String(plan.displayOrder),
    });
  };

  const editGateway = (gateway: Serialized<PaymentGatewayConfig>) => {
    setActiveTab("gateways");
    setEditTarget({ type: "gateway", id: gateway.gatewayId });
    setGatewayEditForm({
      displayName: gateway.displayName,
      enabled: gateway.enabled,
      isDefault: gateway.isDefault,
      supportedCurrencies: gateway.supportedCurrencies.join(", "),
      supportedCountries: gateway.supportedCountries.join(", "),
      supportedPaymentTypes: [...gateway.supportedPaymentTypes],
      supportsSubscriptions: gateway.supportsSubscriptions,
      supportsOneTimePayments: gateway.supportsOneTimePayments,
      minimumAmount: gateway.minimumAmount === null ? "" : String(gateway.minimumAmount),
      maximumAmount: gateway.maximumAmount === null ? "" : String(gateway.maximumAmount),
      priority: String(gateway.priority),
      publishableKeyRef: gateway.publishableKeyRef ?? "",
      secretKeyRef: gateway.secretKeyRef ?? "",
      webhookSecretRef: gateway.webhookSecretRef ?? "",
    });
  };

  const editMapping = (mapping: Serialized<ProviderPriceMapping>) => {
    setActiveTab("mappings");
    setEditTarget({ type: "providerPriceMapping", id: mapping.mappingId });
    setMappingEditForm({
      externalProductId: mapping.externalProductId ?? "",
      externalPriceId: mapping.externalPriceId ?? "",
      externalPlanId: mapping.externalPlanId ?? "",
      amount: String(mapping.amount),
      currency: mapping.currency,
      billingInterval: mapping.billingInterval ?? "",
      purchaseType: mapping.purchaseType,
      active: mapping.active,
    });
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget) return;

    if (editTarget.type === "plan") {
      await patchBillingConfig(
        "plan",
        editTarget.id,
        {
          name: normalizePlanName(planEditForm.name),
          description: planEditForm.description,
          shortDescription: planEditForm.shortDescription,
          status: planEditForm.status,
          isPublic: planEditForm.isPublic,
          isFeatured: planEditForm.isFeatured,
          displayOrder: planEditForm.displayOrder,
        },
        "Billing plan updated."
      );
      return;
    }

    if (editTarget.type === "gateway") {
      await patchBillingConfig(
        "gateway",
        editTarget.id,
        {
          displayName: gatewayEditForm.displayName,
          enabled: gatewayEditForm.enabled,
          isDefault: gatewayEditForm.isDefault,
          priority: gatewayEditForm.priority,
          publishableKeyRef: gatewayEditForm.publishableKeyRef,
          secretKeyRef: gatewayEditForm.secretKeyRef,
          webhookSecretRef: gatewayEditForm.webhookSecretRef,
        },
        "Gateway updated."
      );
      return;
    }

    await patchBillingConfig(
      "providerPriceMapping",
      editTarget.id,
      {
        externalProductId: mappingEditForm.externalProductId,
        externalPriceId: mappingEditForm.externalPriceId,
        externalPlanId: mappingEditForm.externalPlanId,
        active: mappingEditForm.active,
      },
      "Provider price mapping updated."
    );
  };

  const activePlanCount = config.plans.filter((plan) => plan.status === "active").length;
  const enabledGatewayCount = config.gateways.filter((gateway) => gateway.enabled).length;
  const mappedPlanIds = new Set(config.providerPriceMappings.map((mapping) => mapping.planId));
  const unmappedPlanCount = config.plans.filter((plan) => !mappedPlanIds.has(plan.planId)).length;
  const activeMappings = config.providerPriceMappings.filter((mapping) => mapping.active);
  const gatewaysMissingRefs = config.gateways.filter(
    (gateway) => !gateway.secretKeyRef || !gateway.webhookSecretRef
  );
  const activePlansWithoutMappings = config.plans.filter(
    (plan) => plan.status === "active" && !activeMappings.some((mapping) => mapping.planId === plan.planId)
  );
  const incompleteGateways = config.gateways.filter((gateway) => gateway.configurationStatus !== "ready");
  const liveApprovalSummaries = [
    { id: "checkout" as const, label: "Live checkout", status: config.liveControls.checkout },
    { id: "webhookEffects" as const, label: "Live webhook effects", status: config.liveControls.webhookEffects },
    { id: "portal" as const, label: "Live billing portal", status: config.liveControls.portal },
  ];
  const preflightBlockers = [
    ...gatewaysMissingRefs.map((gateway) => ({
      label: `Gateway ${gateway.gatewayId} is missing secret references`,
      detail: "Secret key and webhook secret references are required before live provider traffic can be trusted.",
    })),
    ...activePlansWithoutMappings.map((plan) => ({
      label: `Plan ${plan.planId} has no active provider mapping`,
      detail: "Active plans need an active provider price mapping before checkout can be considered ready.",
    })),
    ...incompleteGateways.map((gateway) => ({
      label: `Gateway ${gateway.gatewayId} is not ready`,
      detail: `Current configuration status: ${gateway.configurationStatus}.`,
    })),
    ...liveApprovalSummaries
      .filter((control) => !control.status.approved)
      .map((control) => ({
        label: `${control.label} is not approved`,
        detail: "Live behavior remains blocked by server-side approval controls.",
      })),
  ];
  const preflightWarnings = [
    ...(config.webhookEvents.length === 0
      ? [{ label: "No webhook events recorded", detail: "Run and verify test webhooks before live launch." }]
      : []),
    ...(config.checkoutAttempts.length === 0
      ? [{ label: "No checkout attempts recorded", detail: "Run test checkout from /payments before live launch." }]
      : []),
    ...(config.transactions.length === 0
      ? [{ label: "No transaction records found", detail: "Confirm verified webhook processing writes payment transaction records." }]
      : []),
  ];
  const preflightReadyItems = [
    `${activePlanCount} active plan(s)`,
    `${enabledGatewayCount} enabled gateway(s)`,
    `${activeMappings.length} active provider mapping(s)`,
    `${config.webhookEvents.length} webhook event record(s)`,
    `${config.checkoutAttempts.length} checkout attempt record(s)`,
  ];
  const readinessChecks = [
    {
      label: "Live checkout remains disabled",
      passed: true,
      detail: "Stage 11 allows Stripe test checkout sessions only; live gateway checkout remains blocked.",
    },
    {
      label: "Live webhook effects remain disabled",
      passed: true,
      detail: "Stage 12 allows verified test webhook state writers only; live webhook effects remain blocked.",
    },
    {
      label: "Gateway secret references configured",
      passed: gatewaysMissingRefs.length === 0 && config.gateways.length > 0,
      detail:
        gatewaysMissingRefs.length === 0
          ? "All gateways have required secret/webhook reference fields."
          : `${gatewaysMissingRefs.length} gateway(s) are missing secret or webhook references.`,
    },
    {
      label: "Active plans have provider mappings",
      passed: activePlansWithoutMappings.length === 0,
      detail:
        activePlansWithoutMappings.length === 0
          ? "Every active plan has at least one active provider mapping."
          : `${activePlansWithoutMappings.length} active plan(s) need provider mappings.`,
    },
    {
      label: "Gateways are ready",
      passed: incompleteGateways.length === 0 && config.gateways.length > 0,
      detail:
        incompleteGateways.length === 0
          ? "All gateways are marked ready."
          : `${incompleteGateways.length} gateway(s) are not marked ready.`,
    },
  ];

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
          <div className="w-full max-w-none">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">Admin</p>
                <h1 className="mt-1 text-2xl font-bold text-gray-950">Billing Configuration</h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Manage server-side billing plans, gateways, and provider price mappings. Gateway secrets and live checkout remain disabled until later billing stages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(true)}
                className="inline-flex w-fit items-center justify-center rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-purple-50"
              >
                How it works
              </button>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">{message}</div>}

            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryTile label="Plans" value={config.plans.length} />
              <SummaryTile label="Active Plans" value={activePlanCount} />
              <SummaryTile label="Enabled Gateways" value={enabledGatewayCount} />
              <SummaryTile label="Unmapped Plans" value={unmappedPlanCount} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
              <div className="grid gap-6 xl:order-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Operations And Create Records</h2>
                  <p className="mt-1 text-sm text-gray-600">Run audited operations or create internal billing configuration records.</p>
                </div>

                <details className="rounded-xl border border-amber-200 bg-white">
                  <summary className="cursor-pointer border-b border-amber-200 px-4 py-3 marker:text-amber-500">
                    <span className="block text-sm font-semibold text-gray-950">Operations Actions</span>
                    <span className="mt-1 block text-xs text-gray-500">Manual entitlement changes and review records are audited. Provider refunds remain disabled.</span>
                  </summary>
                  <form onSubmit={submitAdminOperation} className="grid gap-4 p-4">
                    <LockedNotice>
                      These actions affect access or operational records. Provide a clear reason. Live provider actions are not executed from this panel.
                    </LockedNotice>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Operation
                      <select
                        value={operationForm.operation}
                        onChange={(event) => setOperationForm({ ...initialOperationForm, operation: event.target.value })}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="manualEntitlementGrant">Manual Entitlement Grant</option>
                        <option value="manualEntitlementRevoke">Manual Entitlement Revoke</option>
                        <option value="webhookReprocess">Webhook Reprocess</option>
                      </select>
                    </label>

                    {(operationForm.operation === "manualEntitlementGrant" || operationForm.operation === "manualEntitlementRevoke") && (
                      <div className="grid gap-4">
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          User ID
                          <input value={operationForm.uid} onChange={(event) => setOperationForm({ ...operationForm, uid: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Firebase UID" />
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          Package
                          <select value={operationForm.packageId} onChange={(event) => setOperationForm({ ...operationForm, packageId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                            {packageOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          Plan ID
                          <input value={operationForm.planId} onChange={(event) => setOperationForm({ ...operationForm, planId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Optional plan ID" />
                        </label>
                        {operationForm.operation === "manualEntitlementRevoke" && (
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Entitlement ID
                            <input value={operationForm.entitlementId} onChange={(event) => setOperationForm({ ...operationForm, entitlementId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Optional existing entitlement ID" />
                          </label>
                        )}
                      </div>
                    )}

                    {operationForm.operation === "webhookReprocess" && (
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Webhook Event Record ID
                        <input value={operationForm.webhookEventRecordId} onChange={(event) => setOperationForm({ ...operationForm, webhookEventRecordId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="stripe_evt_..." />
                      </label>
                    )}

                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Reason
                      <textarea value={operationForm.reason} onChange={(event) => setOperationForm({ ...operationForm, reason: event.target.value })} className="min-h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Required reason, minimum 10 characters" />
                    </label>

                    <button disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                      Run Audited Operation
                    </button>
                  </form>
                </details>

                <details className="rounded-xl border border-gray-200 bg-white">
                  <summary className="cursor-pointer border-b border-gray-200 px-4 py-3 marker:text-gray-400">
                    <span className="block text-sm font-semibold text-gray-950">Add Plan</span>
                    <span className="mt-1 block text-xs text-gray-500">Creates an internal billing plan without enabling checkout.</span>
                  </summary>
                  <form onSubmit={submitPlan} className="grid gap-4 p-4">
                    <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-900">
                      Plans are created from one exam product and one fixed access duration. Purchase type is always one-time and renewal is not automatic.
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Exam Product
                        <select value={planForm.examId} onChange={(event) => applyPlanCatalogSelection(event.target.value, planForm.durationDays)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          <option value="">Select exam product</option>
                          {examProducts.filter((product) => product.active).map((product) => (
                            <option key={product.examId} value={product.examId}>{product.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Duration
                        <select value={planForm.durationDays} onChange={(event) => applyPlanCatalogSelection(planForm.examId, event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          {fixedAccessDurations.map((duration) => (
                            <option key={duration.durationDays} value={duration.durationDays}>{duration.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Plan ID
                        <input value={planForm.planId} readOnly className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none" placeholder="Generated after selecting exam" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Plan Name
                        <input value={planForm.name} readOnly className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none" placeholder="Generated after selecting exam" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Status
                        <select value={planForm.status} onChange={(event) => setPlanForm({ ...planForm, status: event.target.value as PlanForm["status"] })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Renewal
                        <input value="No automatic renewal" readOnly className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Price
                        <input value={planForm.price} onChange={(event) => setPlanForm({ ...planForm, price: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="49" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Currency
                        <input value={planForm.currency} onChange={(event) => setPlanForm({ ...planForm, currency: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Short Description
                        <input value={planForm.shortDescription} onChange={(event) => setPlanForm({ ...planForm, shortDescription: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Description
                        <input value={planForm.description} onChange={(event) => setPlanForm({ ...planForm, description: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                    </div>

                    <div className="grid gap-2 text-sm font-medium text-gray-700">
                      Assigned Gateways
                      {config.gateways.length === 0 ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Create a gateway before assigning one to an active plan.</p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {config.gateways.map((gateway) => (
                            <label key={gateway.gatewayId} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                              <input type="checkbox" checked={planForm.gatewayIds.includes(gateway.gatewayId)} onChange={() => togglePlanGateway(gateway.gatewayId)} />
                              {gateway.displayName}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={planForm.isPublic} onChange={(event) => setPlanForm({ ...planForm, isPublic: event.target.checked })} />
                        Public
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={planForm.isFeatured} onChange={(event) => setPlanForm({ ...planForm, isFeatured: event.target.checked })} />
                        Featured
                      </label>
                    </div>

                    <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {saving ? "Saving..." : "Create Plan"}
                    </button>
                  </form>
                </details>

                <details className="rounded-xl border border-gray-200 bg-white">
                  <summary className="cursor-pointer border-b border-gray-200 px-4 py-3 marker:text-gray-400">
                    <span className="block text-sm font-semibold text-gray-950">Add Gateway</span>
                    <span className="mt-1 block text-xs text-gray-500">Creates an admin-managed gateway record without storing secrets.</span>
                  </summary>
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

                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    Enter environment variable or secret-manager reference names only. Do not paste raw payment secret values into this form.
                  </div>

                  <div className="grid gap-4">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Publishable Key Ref
                      <input value={form.publishableKeyRef} onChange={(event) => setForm({ ...form, publishableKeyRef: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="STRIPE_PUBLISHABLE_KEY_STRIPE_DEFAULT" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Secret Key Ref
                      <input value={form.secretKeyRef} onChange={(event) => setForm({ ...form, secretKeyRef: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="STRIPE_SECRET_KEY_STRIPE_DEFAULT" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Webhook Secret Ref
                      <input value={form.webhookSecretRef} onChange={(event) => setForm({ ...form, webhookSecretRef: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="STRIPE_WEBHOOK_SECRET_STRIPE_DEFAULT" />
                    </label>
                  </div>

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
                      {["one_time"].map((paymentType) => (
                        <label key={paymentType} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <input type="checkbox" checked={form.supportedPaymentTypes.includes(paymentType)} onChange={() => togglePaymentType(paymentType)} />
                          One-time
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Min Amount
                      <input value={form.minimumAmount} onChange={(event) => setForm({ ...form, minimumAmount: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Max Amount
                      <input value={form.maximumAmount} onChange={(event) => setForm({ ...form, maximumAmount: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Priority
                      <input value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
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
                </details>

                <details className="rounded-xl border border-gray-200 bg-white">
                  <summary className="cursor-pointer border-b border-gray-200 px-4 py-3 marker:text-gray-400">
                    <span className="block text-sm font-semibold text-gray-950">Add Provider Price Mapping</span>
                    <span className="mt-1 block text-xs text-gray-500">Connects an internal plan to a trusted provider price ID.</span>
                  </summary>
                  <form onSubmit={submitProviderPriceMapping} className="grid gap-4 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Plan
                      <select value={mappingForm.planId} onChange={(event) => selectMappingPlan(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                        <option value="">Select plan</option>
                        {config.plans.map((plan) => (
                          <option key={plan.planId} value={plan.planId}>{plan.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Gateway
                      <select value={mappingForm.gatewayId} onChange={(event) => selectMappingGateway(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                        <option value="">Select gateway</option>
                        {config.gateways.map((gateway) => (
                          <option key={gateway.gatewayId} value={gateway.gatewayId}>{gateway.displayName}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    Mapping ID
                    <input value={mappingForm.mappingId} onChange={(event) => setMappingForm({ ...mappingForm, mappingId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="stripe_ati_teas_monthly" />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      External Product ID
                      <input value={mappingForm.externalProductId} onChange={(event) => setMappingForm({ ...mappingForm, externalProductId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="prod_..." />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      External Price ID
                      <input value={mappingForm.externalPriceId} onChange={(event) => setMappingForm({ ...mappingForm, externalPriceId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="price_..." />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Amount
                      <input value={mappingForm.amount} onChange={(event) => setMappingForm({ ...mappingForm, amount: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Currency
                      <input value={mappingForm.currency} onChange={(event) => setMappingForm({ ...mappingForm, currency: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Interval
                      <input value={mappingForm.billingInterval} onChange={(event) => setMappingForm({ ...mappingForm, billingInterval: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="lifetime" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Provider
                      <input value={mappingForm.provider} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Environment
                      <input value={mappingForm.environment} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Purchase Type
                      <input value={mappingForm.purchaseType} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={mappingForm.active} onChange={(event) => setMappingForm({ ...mappingForm, active: event.target.checked })} />
                    Active mapping
                  </label>

                  <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving..." : "Create Provider Mapping"}
                  </button>
                  </form>
                </details>

              {editTarget && (
                <section className="rounded-xl border border-purple-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-950">Edit Selected Record</h2>
                      <p className="mt-1 font-mono text-xs text-gray-500">{editTarget.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditTarget(null)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={submitEdit} className="grid gap-4 p-4">
                    {editTarget.type === "plan" && (
                      <>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          Plan Name
                          <input value={planEditForm.name} onBlur={() => setPlanEditForm((current) => ({ ...current, name: normalizePlanName(current.name) }))} onChange={(event) => setPlanEditForm({ ...planEditForm, name: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Short Description
                            <input value={planEditForm.shortDescription} onChange={(event) => setPlanEditForm({ ...planEditForm, shortDescription: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Description
                            <input value={planEditForm.description} onChange={(event) => setPlanEditForm({ ...planEditForm, description: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Status
                            <select value={planEditForm.status} onChange={(event) => setPlanEditForm({ ...planEditForm, status: event.target.value as PlanEditForm["status"] })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="archived">Archived</option>
                            </select>
                          </label>
                        </div>
                        <LockedNotice>
                          Pricing, interval, purchase type, trial days, packages, and assigned gateways are locked after creation because changing them can invalidate provider mappings, checkout rules, or entitlements. Create a new plan for those changes.
                        </LockedNotice>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Purchase Type
                            <select value={planEditForm.purchaseType} disabled className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                              <option value="one_time">One-time</option>
                              <option value="manual_access">Manual</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Interval
                            <select value={planEditForm.billingInterval} disabled className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                              <option value="">None</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="yearly">Yearly</option>
                              <option value="lifetime">Lifetime</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Price
                            <input value={planEditForm.price} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Currency
                            <input value={planEditForm.currency} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm uppercase text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Trial Days
                            <input value={planEditForm.trialDays} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Display Order
                            <input value={planEditForm.displayOrder} onChange={(event) => setPlanEditForm({ ...planEditForm, displayOrder: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                        </div>
                        <div className="grid gap-2 text-sm font-medium text-gray-700">
                          Packages
                          <div className="grid gap-2 sm:grid-cols-2">
                            {packageOptions.map((option) => (
                              <label key={option.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                <input type="checkbox" checked={planEditForm.packageIds.includes(option.id)} disabled onChange={() => togglePlanEditPackage(option.id)} />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2 text-sm font-medium text-gray-700">
                          Assigned Gateways
                          {config.gateways.length === 0 ? (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Create a gateway before assigning one to an active plan.</p>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {config.gateways.map((gateway) => (
                                <label key={gateway.gatewayId} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                  <input type="checkbox" checked={planEditForm.gatewayIds.includes(gateway.gatewayId)} disabled onChange={() => togglePlanEditGateway(gateway.gatewayId)} />
                                  {gateway.displayName}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={planEditForm.isPublic} onChange={(event) => setPlanEditForm({ ...planEditForm, isPublic: event.target.checked })} />
                            Public
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={planEditForm.isFeatured} onChange={(event) => setPlanEditForm({ ...planEditForm, isFeatured: event.target.checked })} />
                            Featured
                          </label>
                        </div>
                      </>
                    )}

                    {editTarget.type === "gateway" && (
                      <>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          Display Name
                          <input value={gatewayEditForm.displayName} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, displayName: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                        </label>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                          These fields store references only, such as environment variable names. Raw provider keys must stay in server-side secret storage.
                        </div>
                        <div className="grid gap-4">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Publishable Key Ref
                            <input value={gatewayEditForm.publishableKeyRef} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, publishableKeyRef: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Secret Key Ref
                            <input value={gatewayEditForm.secretKeyRef} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, secretKeyRef: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Webhook Secret Ref
                            <input value={gatewayEditForm.webhookSecretRef} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, webhookSecretRef: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                        </div>
                        <LockedNotice>
                          Coverage, payment support, and amount limits are locked after creation because changing them can alter checkout eligibility for plans that use this gateway. Create a new gateway for those changes.
                        </LockedNotice>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Currencies
                            <input value={gatewayEditForm.supportedCurrencies} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm uppercase text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Countries
                            <input value={gatewayEditForm.supportedCountries} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm uppercase text-gray-600" />
                          </label>
                        </div>
                        <div className="grid gap-2 text-sm font-medium text-gray-700">
                          Payment Types
                          <div className="flex flex-wrap gap-3">
                            {["one_time"].map((paymentType) => (
                              <label key={paymentType} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                <input type="checkbox" checked={gatewayEditForm.supportedPaymentTypes.includes(paymentType)} disabled onChange={() => toggleGatewayEditPaymentType(paymentType)} />
                                One-time
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Min Amount
                            <input value={gatewayEditForm.minimumAmount} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Max Amount
                            <input value={gatewayEditForm.maximumAmount} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Priority
                            <input value={gatewayEditForm.priority} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, priority: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                          </label>
                        </div>
                        <div className="grid gap-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={gatewayEditForm.supportsOneTimePayments} disabled onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, supportsOneTimePayments: event.target.checked })} />
                            Supports one-time payments
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={gatewayEditForm.enabled} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, enabled: event.target.checked })} />
                            Enabled
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={gatewayEditForm.isDefault} onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, isDefault: event.target.checked })} />
                            Default gateway
                          </label>
                        </div>
                      </>
                    )}

                    {editTarget.type === "providerPriceMapping" && (
                      <>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          External Product ID
                          <input value={mappingEditForm.externalProductId} onChange={(event) => setMappingEditForm({ ...mappingEditForm, externalProductId: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          External Price ID
                          <input value={mappingEditForm.externalPriceId} onChange={(event) => setMappingEditForm({ ...mappingEditForm, externalPriceId: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-gray-700">
                          External Plan ID
                          <input value={mappingEditForm.externalPlanId} onChange={(event) => setMappingEditForm({ ...mappingEditForm, externalPlanId: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                        </label>
                        <LockedNotice>
                          Mapping amount, currency, interval, and purchase type are locked because they must mirror the linked internal plan and provider price. Create a new mapping if the provider contract changes.
                        </LockedNotice>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Amount
                            <input value={mappingEditForm.amount} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Currency
                            <input value={mappingEditForm.currency} readOnly className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm uppercase text-gray-600" />
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Interval
                            <select value={mappingEditForm.billingInterval} disabled className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                              <option value="">None</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="yearly">Yearly</option>
                              <option value="lifetime">Lifetime</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Purchase Type
                            <select value={mappingEditForm.purchaseType} disabled className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                              <option value="one_time">One-time</option>
                              <option value="manual_access">Manual</option>
                            </select>
                          </label>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input type="checkbox" checked={mappingEditForm.active} onChange={(event) => setMappingEditForm({ ...mappingEditForm, active: event.target.checked })} />
                          Active mapping
                        </label>
                      </>
                    )}

                    <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </section>
              )}
              </div>

              <div className="grid content-start gap-6 xl:order-1">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Manage Records</h2>
                  <p className="mt-1 text-sm text-gray-600">Review the current billing catalog before wiring provider mappings and checkout.</p>
                </div>

                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2">
                  {[
                    { id: "readiness" as const, label: "Readiness", count: readinessChecks.filter((check) => !check.passed).length },
                    { id: "plans" as const, label: "Plans", count: config.plans.length },
                    { id: "gateways" as const, label: "Gateways", count: config.gateways.length },
                    { id: "mappings" as const, label: "Provider Mappings", count: config.providerPriceMappings.length },
                    { id: "transactions" as const, label: "Transactions", count: config.transactions.length },
                    { id: "entitlements" as const, label: "Access Grants", count: config.entitlements.length },
                    { id: "webhooks" as const, label: "Webhooks", count: config.webhookEvents.length },
                    { id: "attempts" as const, label: "Checkout Attempts", count: config.checkoutAttempts.length },
                    { id: "reviews" as const, label: "Operation Reviews", count: config.operationReviews.length },
                    { id: "audit" as const, label: "Audit Logs", count: config.auditLogs.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {activeTab === "readiness" && (
                <Section title="Live Readiness" count={readinessChecks.length}>
                  <div className="mb-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-950">Live Launch Preflight</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            A read-only summary of what still blocks live billing.
                          </p>
                        </div>
                        <Pill tone={preflightBlockers.length === 0 ? "green" : "amber"}>
                          {preflightBlockers.length === 0 ? "No blockers" : `${preflightBlockers.length} blocker(s)`}
                        </Pill>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {preflightBlockers.length === 0 ? (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                            No launch blockers were found in the current admin billing snapshot. Final owner approval and deployment checks are still required.
                          </div>
                        ) : (
                          preflightBlockers.map((item) => (
                            <div key={item.label} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                              <p className="font-semibold">{item.label}</p>
                              <p className="mt-1 text-xs">{item.detail}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-base font-semibold text-gray-950">Needs Review</h3>
                        <div className="mt-3 grid gap-2">
                          {preflightWarnings.length === 0 ? (
                            <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                              Test checkout, webhook, and transaction records are present.
                            </p>
                          ) : (
                            preflightWarnings.map((item) => (
                              <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                <p className="font-semibold text-gray-950">{item.label}</p>
                                <p className="mt-1 text-xs text-gray-600">{item.detail}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-base font-semibold text-gray-950">Current Snapshot</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {preflightReadyItems.map((item) => (
                            <span key={item} className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {readinessChecks.map((check) => (
                      <ReadinessCheckRow key={check.label} {...check} />
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Live billing is not enabled. Passing these checks only means the configuration is closer to readiness; explicit approval is still required before any checkout or webhook effect can mutate billing state.
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {[
                      { id: "checkout" as const, label: "Live Checkout" },
                      { id: "webhookEffects" as const, label: "Live Webhook Effects" },
                      { id: "portal" as const, label: "Live Billing Portal" },
                    ].map((control) => {
                      const status = config.liveControls[control.id];
                      return (
                        <div key={control.id} className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-950">{control.label}</h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {status.approved ? `Approved by ${status.approvedBy ?? "admin"}` : "Blocked until approved"}
                              </p>
                            </div>
                            <Pill tone={status.approved ? "green" : "amber"}>{status.approved ? "Approved" : "Blocked"}</Pill>
                          </div>
                          {status.reason && <p className="mt-3 text-xs text-gray-600">{status.reason}</p>}
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={submitLiveApproval} className="mt-4 grid gap-4 rounded-lg border border-gray-200 bg-white p-4">
                    <LockedNotice>
                      Live approvals are server-side controls. Only approve a capability after sandbox testing, secret storage, rollback, and owner approval are complete.
                    </LockedNotice>
                    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Capability
                        <select
                          value={liveApprovalForm.capability}
                          onChange={(event) => setLiveApprovalForm({ ...liveApprovalForm, capability: event.target.value as BillingLiveCapability })}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="checkout">Live Checkout</option>
                          <option value="webhookEffects">Live Webhook Effects</option>
                          <option value="portal">Live Billing Portal</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Approval Reason
                        <input
                          value={liveApprovalForm.reason}
                          onChange={(event) => setLiveApprovalForm({ ...liveApprovalForm, reason: event.target.value })}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                          placeholder="Required approval reason, minimum 15 characters"
                        />
                      </label>
                    </div>
                    <button disabled={saving} className="w-fit rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
                      Record Live Approval
                    </button>
                  </form>
                </Section>
                )}

                {activeTab === "plans" && (
                <Section title="Plans" count={config.plans.length}>
                  {config.plans.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No billing plans configured yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pricing</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Packages</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {config.plans.map((plan) => (
                            <tr key={plan.planId}>
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold text-gray-950">{plan.name}</p>
                                <p className="mt-1 font-mono text-xs text-gray-500">{plan.planId}</p>
                                <p className="mt-1 text-xs text-gray-500">{plan.slug}</p>
                              </td>
                              <td className="px-4 py-4 align-top text-gray-700">
                                <p className="font-medium">{plan.currency} {plan.price}</p>
                                <p className="text-xs text-gray-500">{plan.billingInterval ?? "No interval"}</p>
                              </td>
                              <td className="px-4 py-4 align-top text-gray-700">
                                <p className="max-w-sm break-words text-xs">{plan.packageIds.join(", ") || "No packages"}</p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <Pill tone={plan.status === "active" ? "green" : "gray"}>{plan.status}</Pill>
                                  <Pill tone="blue">{plan.purchaseType}</Pill>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => editPlan(plan)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                                  <button type="button" onClick={() => patchBillingConfig("plan", plan.planId, { status: "archived" }, "Billing plan archived.")} disabled={saving || plan.status === "archived"} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Archive</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                )}

                {activeTab === "gateways" && (
                <Section title="Gateways" count={config.gateways.length}>
                  {loading ? (
                    <p className="p-4 text-sm text-gray-500">Loading...</p>
                  ) : config.gateways.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No gateways configured yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gateway</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Provider</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Coverage</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {config.gateways.map((gateway) => (
                            <tr key={gateway.gatewayId}>
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold text-gray-950">{gateway.displayName}</p>
                                <p className="mt-1 font-mono text-xs text-gray-500">{gateway.gatewayId}</p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <Pill tone="blue">{gateway.provider}</Pill>
                                  <Pill tone="gray">{gateway.environment}</Pill>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top text-gray-700">
                                <p className="text-xs">{gateway.supportedCurrencies.join(", ")}</p>
                                <p className="mt-1 text-xs text-gray-500">{gateway.supportedCountries.length ? gateway.supportedCountries.join(", ") : "Global"}</p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <Pill tone={gateway.enabled ? "green" : "gray"}>{gateway.enabled ? "Enabled" : "Disabled"}</Pill>
                                  <Pill tone="amber">{gateway.configurationStatus}</Pill>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => editGateway(gateway)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                                  <button type="button" onClick={() => patchBillingConfig("gateway", gateway.gatewayId, { enabled: false }, "Gateway disabled.")} disabled={saving || !gateway.enabled} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Disable</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                )}

                {activeTab === "mappings" && (
                <Section title="Provider Price Mappings" count={config.providerPriceMappings.length}>
                  {config.providerPriceMappings.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No provider price mappings configured yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Mapping</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Plan / Gateway</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pricing</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {config.providerPriceMappings.map((mapping) => (
                            <tr key={mapping.mappingId}>
                              <td className="px-4 py-4 align-top">
                                <p className="font-mono text-xs font-semibold text-gray-950">{mapping.mappingId}</p>
                                <p className="mt-1 text-xs text-gray-500">{mapping.provider} / {mapping.environment}</p>
                              </td>
                              <td className="px-4 py-4 align-top text-gray-700">
                                <p className="font-mono text-xs">{mapping.planId}</p>
                                <p className="mt-1 font-mono text-xs text-gray-500">{mapping.gatewayId}</p>
                              </td>
                              <td className="px-4 py-4 align-top text-gray-700">
                                <p className="font-medium">{mapping.currency} {mapping.amount}</p>
                                <p className="text-xs text-gray-500">{mapping.billingInterval ?? "No interval"} / {mapping.purchaseType}</p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <Pill tone={mapping.active ? "green" : "gray"}>{mapping.active ? "Active" : "Inactive"}</Pill>
                                  <Pill tone="amber">{mapping.syncStatus}</Pill>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => editMapping(mapping)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                                  <button type="button" onClick={() => patchBillingConfig("providerPriceMapping", mapping.mappingId, { active: false }, "Provider price mapping deactivated.")} disabled={saving || !mapping.active} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Deactivate</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                )}

                {activeTab === "transactions" && (
                <Section title="Transactions" count={config.transactions.length}>
                  <OperationsTable
                    records={config.transactions as unknown as Record<string, unknown>[]}
                    emptyMessage="No billing transactions recorded yet."
                    columns={[
                      { key: "transactionId", label: "Transaction" },
                      { key: "uid", label: "User" },
                      { key: "planId", label: "Plan" },
                      { key: "gatewayId", label: "Gateway" },
                      { key: "provider", label: "Provider" },
                      { key: "amount", label: "Amount" },
                      { key: "currency", label: "Currency" },
                      { key: "status", label: "Status" },
                      { key: "paidAt", label: "Paid" },
                      { key: "createdAt", label: "Created" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "entitlements" && (
                <Section title="Access Grants" count={config.entitlements.length}>
                  <OperationsTable
                    records={config.entitlements as unknown as Record<string, unknown>[]}
                    emptyMessage="No billing entitlements recorded yet."
                    columns={[
                      { key: "entitlementId", label: "Entitlement" },
                      { key: "uid", label: "User" },
                      { key: "packageId", label: "Package" },
                      { key: "status", label: "Status" },
                      { key: "source", label: "Source" },
                      { key: "accessEndsAt", label: "Ends" },
                      { key: "updatedAt", label: "Updated" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "webhooks" && (
                <Section title="Webhook Events" count={config.webhookEvents.length}>
                  <OperationsTable
                    records={config.webhookEvents}
                    emptyMessage="No webhook events recorded yet."
                    columns={[
                      { key: "webhookEventRecordId", label: "Record" },
                      { key: "provider", label: "Provider" },
                      { key: "gatewayId", label: "Gateway" },
                      { key: "providerEventId", label: "Provider Event" },
                      { key: "normalizedEventType", label: "Event Type" },
                      { key: "status", label: "Status" },
                      { key: "processingStatus", label: "Processing" },
                      { key: "createdAt", label: "Created" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "attempts" && (
                <Section title="Checkout Attempts" count={config.checkoutAttempts.length}>
                  <OperationsTable
                    records={config.checkoutAttempts}
                    emptyMessage="No checkout attempts recorded yet."
                    columns={[
                      { key: "attemptId", label: "Attempt" },
                      { key: "uid", label: "User" },
                      { key: "planId", label: "Plan" },
                      { key: "gatewayId", label: "Gateway" },
                      { key: "provider", label: "Provider" },
                      { key: "status", label: "Status" },
                      { key: "message", label: "Message" },
                      { key: "readinessIssues", label: "Issue Details" },
                      { key: "createdAt", label: "Created" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "reviews" && (
                <Section title="Operation Reviews" count={config.operationReviews.length}>
                  <OperationsTable
                    records={config.operationReviews}
                    emptyMessage="No billing operation reviews recorded yet."
                    columns={[
                      { key: "reviewId", label: "Review" },
                      { key: "reviewType", label: "Type" },
                      { key: "entityId", label: "Entity" },
                      { key: "uid", label: "User" },
                      { key: "status", label: "Status" },
                      { key: "reason", label: "Reason" },
                      { key: "createdAt", label: "Created" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "audit" && (
                <Section title="Audit Logs" count={config.auditLogs.length}>
                  <OperationsTable
                    records={config.auditLogs as unknown as Record<string, unknown>[]}
                    emptyMessage="No billing audit logs recorded yet."
                    columns={[
                      { key: "auditLogId", label: "Audit" },
                      { key: "action", label: "Action" },
                      { key: "entityType", label: "Entity Type" },
                      { key: "entityId", label: "Entity ID" },
                      { key: "adminUid", label: "Admin" },
                      { key: "reason", label: "Reason" },
                      { key: "timestamp", label: "Time" },
                    ]}
                  />
                </Section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">How Billing Configuration Works</h2>
                <p className="mt-1 text-sm text-gray-600">This admin page prepares billing records before checkout and webhooks are enabled.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5 text-sm text-gray-700">
              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Start With Billing Setup</h3>
                <p className="mt-1">Use this order when setting up billing for the first time. Each step prepares the next one, so avoid jumping straight to checkout until the provider, gateway, plan, mapping, and webhook pieces agree.</p>
                <div className="mt-3 grid gap-3 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Step 1. Create the payment provider objects first.</span> In Stripe, create the product and price in the same mode you want to test. Use test mode for localhost and sandbox testing. Copy the provider price ID, such as a Stripe `price_...` ID, because checkout uses that value.</p>
                  <p><span className="font-semibold text-gray-800">Step 2. Add or verify the gateway.</span> Create a gateway for the provider and environment, for example `stripe_us_test`. Enter secret reference names such as `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; do not paste raw secret values into admin fields.</p>
                  <p><span className="font-semibold text-gray-800">Step 3. Create the internal plan.</span> The plan defines what the student buys, the price, currency, purchase type, duration, and which exam access is granted. Create one plan per exam and duration, such as ATI TEAS 7 1 Month Access or HESI A2 3 Months Access.</p>
                  <p><span className="font-semibold text-gray-800">Step 4. Assign the gateway to the plan.</span> The plan must include at least one enabled gateway before checkout can use it.</p>
                  <p><span className="font-semibold text-gray-800">Step 5. Create the provider price mapping.</span> Link the internal plan to the gateway and provider price ID. The amount, currency, interval, and purchase type must match the internal plan and the provider price.</p>
                  <p><span className="font-semibold text-gray-800">Step 6. Check readiness.</span> Open the Readiness tab and fix blockers before testing checkout. Checkout will be blocked when the plan, gateway, mapping, or secrets are incomplete.</p>
                  <p><span className="font-semibold text-gray-800">Step 7. Test checkout and webhook processing.</span> For localhost, run Stripe CLI forwarding to `/api/webhooks/stripe?gatewayId=...`. A successful purchase should create a transaction, an access grant, and updated user entitlements after `checkout.session.completed` is verified.</p>
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-100 bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-900">
                  Need field definitions, validation rules, and operations details?
                </p>
                <Link
                  href="/admin/billing/documentation"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  onClick={() => setShowHowItWorks(false)}
                >
                  Open Full Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
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
