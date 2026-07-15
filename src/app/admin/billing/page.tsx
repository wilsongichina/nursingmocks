"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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
  | "subscriptions"
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
  supportedPaymentTypes: ["subscription", "one_time"],
  supportsSubscriptions: true,
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
  { id: "all_access", label: "All Access" },
];

const initialPlanForm: PlanForm = {
  planId: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  status: "draft",
  purchaseType: "subscription",
  billingInterval: "monthly",
  price: "",
  currency: "USD",
  packageIds: [],
  gatewayIds: [],
  trialDays: "0",
  isFeatured: false,
  isPublic: true,
  displayOrder: "100",
};

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
  purchaseType: "subscription",
  active: true,
};

const initialPlanEditForm: PlanEditForm = {
  name: "",
  description: "",
  shortDescription: "",
  status: "draft",
  purchaseType: "subscription",
  billingInterval: "monthly",
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
  supportedPaymentTypes: ["subscription", "one_time"],
  supportsSubscriptions: true,
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
  purchaseType: "subscription",
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

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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
  if (records.length === 0) {
    return <p className="p-4 text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.map((record, index) => (
            <tr key={String(record.id ?? record.transactionId ?? record.subscriptionId ?? record.entitlementId ?? record.auditLogId ?? record.webhookEventRecordId ?? record.attemptId ?? index)}>
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

  const togglePlanPackage = (packageId: string) => {
    setPlanForm((current) => {
      const exists = current.packageIds.includes(packageId);
      return {
        ...current,
        packageIds: exists
          ? current.packageIds.filter((item) => item !== packageId)
          : [...current.packageIds, packageId],
      };
    });
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
                        <option value="refundReview">Refund Review Record</option>
                        <option value="subscriptionNote">Subscription Review Note</option>
                        <option value="transactionNote">Transaction Note</option>
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

                    {(operationForm.operation === "refundReview" || operationForm.operation === "transactionNote") && (
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Transaction ID
                        <input value={operationForm.transactionId} onChange={(event) => setOperationForm({ ...operationForm, transactionId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Transaction ID" />
                      </label>
                    )}

                    {operationForm.operation === "subscriptionNote" && (
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Subscription ID
                        <input value={operationForm.subscriptionId} onChange={(event) => setOperationForm({ ...operationForm, subscriptionId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Subscription ID" />
                      </label>
                    )}

                    {(operationForm.operation === "refundReview" || operationForm.operation === "subscriptionNote" || operationForm.operation === "transactionNote") && (
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Note
                        <textarea value={operationForm.note} onChange={(event) => setOperationForm({ ...operationForm, note: event.target.value })} className="min-h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Operational note for review" />
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
                    <div className="grid gap-4">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Plan ID
                        <input value={planForm.planId} onChange={(event) => setPlanForm({ ...planForm, planId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="all_access_monthly" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Slug
                        <input value={planForm.slug} onChange={(event) => setPlanForm({ ...planForm, slug: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="all-access-monthly" />
                      </label>
                    </div>

                    <label className="grid gap-1 text-sm font-medium text-gray-700">
                      Name
                      <input value={planForm.name} onBlur={() => setPlanForm((current) => ({ ...current, name: normalizePlanName(current.name) }))} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="All Access Monthly" />
                    </label>

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

                    <div className="grid gap-4 sm:grid-cols-3">
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
                        Purchase Type
                        <select value={planForm.purchaseType} onChange={(event) => setPlanForm({ ...planForm, purchaseType: event.target.value as PlanForm["purchaseType"] })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          <option value="subscription">Subscription</option>
                          <option value="one_time">One-time</option>
                          <option value="manual_access">Manual</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Interval
                        <select value={planForm.billingInterval} onChange={(event) => setPlanForm({ ...planForm, billingInterval: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                          <option value="">None</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4">
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Price
                        <input value={planForm.price} onChange={(event) => setPlanForm({ ...planForm, price: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="49" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Currency
                        <input value={planForm.currency} onChange={(event) => setPlanForm({ ...planForm, currency: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Trial Days
                        <input value={planForm.trialDays} onChange={(event) => setPlanForm({ ...planForm, trialDays: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-gray-700">
                        Display Order
                        <input value={planForm.displayOrder} onChange={(event) => setPlanForm({ ...planForm, displayOrder: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                      </label>
                    </div>

                    <div className="grid gap-2 text-sm font-medium text-gray-700">
                      Packages
                      <div className="grid gap-2 sm:grid-cols-2">
                        {packageOptions.map((option) => (
                          <label key={option.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                            <input type="checkbox" checked={planForm.packageIds.includes(option.id)} onChange={() => togglePlanPackage(option.id)} />
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
                      {["subscription", "one_time"].map((paymentType) => (
                        <label key={paymentType} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <input type="checkbox" checked={form.supportedPaymentTypes.includes(paymentType)} onChange={() => togglePaymentType(paymentType)} />
                          {paymentType === "one_time" ? "One-time" : "Subscription"}
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

                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    External Plan ID
                    <input value={mappingForm.externalPlanId} onChange={(event) => setMappingForm({ ...mappingForm, externalPlanId: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Optional provider subscription plan ID" />
                  </label>

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
                      <input value={mappingForm.billingInterval} onChange={(event) => setMappingForm({ ...mappingForm, billingInterval: event.target.value })} className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="monthly" />
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
                          Pricing, interval, purchase type, trial days, packages, and assigned gateways are locked after creation because changing them can invalidate provider mappings, checkout rules, subscriptions, or entitlements. Create a new plan for those changes.
                        </LockedNotice>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-1 text-sm font-medium text-gray-700">
                            Purchase Type
                            <select value={planEditForm.purchaseType} disabled className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                              <option value="subscription">Subscription</option>
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
                            {["subscription", "one_time"].map((paymentType) => (
                              <label key={paymentType} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                <input type="checkbox" checked={gatewayEditForm.supportedPaymentTypes.includes(paymentType)} disabled onChange={() => toggleGatewayEditPaymentType(paymentType)} />
                                {paymentType === "one_time" ? "One-time" : "Subscription"}
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
                            <input type="checkbox" checked={gatewayEditForm.supportsSubscriptions} disabled onChange={(event) => setGatewayEditForm({ ...gatewayEditForm, supportsSubscriptions: event.target.checked })} />
                            Supports subscriptions
                          </label>
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
                              <option value="subscription">Subscription</option>
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
                    { id: "subscriptions" as const, label: "Subscriptions", count: config.subscriptions.length },
                    { id: "entitlements" as const, label: "Entitlements", count: config.entitlements.length },
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
                      { key: "status", label: "Status" },
                      { key: "amount", label: "Amount" },
                      { key: "currency", label: "Currency" },
                      { key: "createdAt", label: "Created" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "subscriptions" && (
                <Section title="Subscriptions" count={config.subscriptions.length}>
                  <OperationsTable
                    records={config.subscriptions as unknown as Record<string, unknown>[]}
                    emptyMessage="No billing subscriptions recorded yet."
                    columns={[
                      { key: "subscriptionId", label: "Subscription" },
                      { key: "uid", label: "User" },
                      { key: "planId", label: "Plan" },
                      { key: "provider", label: "Provider" },
                      { key: "status", label: "Status" },
                      { key: "currentPeriodEnd", label: "Period End" },
                      { key: "updatedAt", label: "Updated" },
                    ]}
                  />
                </Section>
                )}

                {activeTab === "entitlements" && (
                <Section title="Entitlements" count={config.entitlements.length}>
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
                <h3 className="font-semibold text-gray-950">Billing Configuration Flow</h3>
                <p className="mt-1">Billing is configured in three layers. Create a plan first, create one or more gateways, then create provider price mappings that connect the internal plan to the provider price or subscription object.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Plans</span> define what access is sold and the internal billing contract.</p>
                  <p><span className="font-semibold text-gray-800">Gateways</span> define which payment provider can process the payment.</p>
                  <p><span className="font-semibold text-gray-800">Provider mappings</span> connect internal records to provider IDs such as Stripe price IDs.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Plans Section</h3>
                <p className="mt-1">Use plans to define the products students can buy or receive access to.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Plan ID</span> is the stable internal identifier. It is created once and should not change.</p>
                  <p><span className="font-semibold text-gray-800">Slug</span> is the URL/admin-safe identifier derived from the plan name or entered manually.</p>
                  <p><span className="font-semibold text-gray-800">Name</span> is automatically cleaned into title case and removes separators or unusual punctuation.</p>
                  <p><span className="font-semibold text-gray-800">Description and Short Description</span> describe the plan for admin review and future display surfaces.</p>
                  <p><span className="font-semibold text-gray-800">Status</span> controls lifecycle: draft, active, inactive, or archived.</p>
                  <p><span className="font-semibold text-gray-800">Purchase Type</span> defines whether the plan is subscription, one-time, or manual access.</p>
                  <p><span className="font-semibold text-gray-800">Interval</span> defines subscription timing or lifetime one-time access.</p>
                  <p><span className="font-semibold text-gray-800">Price and Currency</span> define the internal billing amount that provider mappings must match.</p>
                  <p><span className="font-semibold text-gray-800">Trial Days</span> controls the planned trial window for subscription plans.</p>
                  <p><span className="font-semibold text-gray-800">Packages</span> define which exam/product access the plan grants.</p>
                  <p><span className="font-semibold text-gray-800">Assigned Gateways</span> define which payment gateways are allowed to process the plan.</p>
                  <p><span className="font-semibold text-gray-800">Public, Featured, and Display Order</span> control future visibility and ordering.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Gateways Section</h3>
                <p className="mt-1">Use gateways to manage payment providers without storing provider secrets in this admin screen.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Gateway ID</span> is the stable internal gateway identifier.</p>
                  <p><span className="font-semibold text-gray-800">Provider</span> identifies the payment provider, such as Stripe, PayPal, or Authorize.Net.</p>
                  <p><span className="font-semibold text-gray-800">Environment</span> separates test and live gateway records.</p>
                  <p><span className="font-semibold text-gray-800">Display Name</span> is the admin-friendly gateway label.</p>
                  <p><span className="font-semibold text-gray-800">Publishable Key Ref</span> stores the environment variable or secret reference name for a public provider key.</p>
                  <p><span className="font-semibold text-gray-800">Secret Key Ref</span> stores the environment variable or secret reference name for the server-side provider secret key.</p>
                  <p><span className="font-semibold text-gray-800">Webhook Secret Ref</span> stores the environment variable or secret reference name used to verify webhook signatures.</p>
                  <p><span className="font-semibold text-gray-800">Currencies and Countries</span> define where and how this gateway can be used.</p>
                  <p><span className="font-semibold text-gray-800">Payment Types</span> define whether the gateway can process subscriptions, one-time purchases, or both.</p>
                  <p><span className="font-semibold text-gray-800">Min Amount and Max Amount</span> define planned checkout eligibility limits.</p>
                  <p><span className="font-semibold text-gray-800">Priority</span> controls preferred gateway order when multiple gateways can process a plan.</p>
                  <p><span className="font-semibold text-gray-800">Enabled</span> allows the gateway to be considered by later checkout stages.</p>
                  <p><span className="font-semibold text-gray-800">Default Gateway</span> marks the preferred gateway when more than one option is available.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Provider Price Mappings Section</h3>
                <p className="mt-1">Use mappings to connect an internal plan to a provider product, price, or subscription plan.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Mapping ID</span> is the stable internal mapping identifier.</p>
                  <p><span className="font-semibold text-gray-800">Plan</span> selects the internal billing plan.</p>
                  <p><span className="font-semibold text-gray-800">Gateway</span> selects the provider gateway assigned to that plan.</p>
                  <p><span className="font-semibold text-gray-800">External Product ID</span> stores the provider product reference when available.</p>
                  <p><span className="font-semibold text-gray-800">External Price ID</span> stores the provider price reference, such as a Stripe price ID.</p>
                  <p><span className="font-semibold text-gray-800">External Plan ID</span> stores provider subscription-plan references for providers that use that model.</p>
                  <p><span className="font-semibold text-gray-800">Amount, Currency, Interval, and Purchase Type</span> are copied from the plan and must match it.</p>
                  <p><span className="font-semibold text-gray-800">Provider and Environment</span> are copied from the selected gateway.</p>
                  <p><span className="font-semibold text-gray-800">Active Mapping</span> controls whether this mapping can be used by later checkout stages.</p>
                </div>
              </section>

              <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">Editable And Locked Fields</h3>
                <p className="mt-1 text-amber-800">Some fields can be edited safely. Fields that affect checkout contracts or linked records are locked after creation.</p>
                <div className="mt-3 grid gap-2 text-xs text-amber-800">
                  <p><span className="font-semibold">Safe plan edits:</span> name, descriptions, status, public, featured, and display order.</p>
                  <p><span className="font-semibold">Locked plan fields:</span> price, currency, interval, purchase type, trial days, packages, and assigned gateways.</p>
                  <p><span className="font-semibold">Safe gateway edits:</span> display name, enabled, default, and priority.</p>
                  <p><span className="font-semibold">Locked gateway fields:</span> provider, environment, coverage, payment types, support flags, and amount limits.</p>
                  <p><span className="font-semibold">Safe mapping edits:</span> external provider IDs and active status.</p>
                  <p><span className="font-semibold">Locked mapping fields:</span> linked plan, linked gateway, provider, environment, amount, currency, interval, and purchase type.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Validation Rules</h3>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p>Active plans must have at least one package and one assigned gateway.</p>
                  <p>Provider mappings must use a gateway assigned to the selected plan.</p>
                  <p>Mapping amount, currency, interval, and purchase type must match the selected plan.</p>
                  <p>Mapping provider and environment must match the selected gateway.</p>
                  <p>Gateway minimum amount cannot be greater than maximum amount.</p>
                  <p>Direct API attempts to update locked relationship fields are rejected.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Operations Views</h3>
                <p className="mt-1">The admin tables also include read-only operational records for future billing activity.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p><span className="font-semibold text-gray-800">Transactions</span> will show payment records after webhook processing is enabled.</p>
                  <p><span className="font-semibold text-gray-800">Subscriptions</span> will show provider subscription state after subscription writers are enabled.</p>
                  <p><span className="font-semibold text-gray-800">Entitlements</span> will show package access grants and revocations.</p>
                  <p><span className="font-semibold text-gray-800">Webhook Events</span> shows recorded provider webhook intake records.</p>
                  <p><span className="font-semibold text-gray-800">Checkout Attempts</span> shows blocked or unavailable checkout draft attempts.</p>
                  <p><span className="font-semibold text-gray-800">Audit Logs</span> shows admin billing configuration changes.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Live Readiness View</h3>
                <p className="mt-1">The readiness tab summarizes why billing is still not live and which configuration items need attention.</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <p>Checkout and webhook effects must remain disabled until explicit approval.</p>
                  <p>Gateways should have secret and webhook references before real provider operations are tested.</p>
                  <p>Active plans need active provider mappings before checkout can be considered ready.</p>
                  <p>Gateway readiness must be reviewed before any provider checkout or webhook processing is enabled.</p>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-950">Current Billing Stage</h3>
                <p className="mt-1">This stage manages configuration only. Gateway secrets, live checkout, webhook processing, transactions, subscriptions, and entitlement grants remain disabled until later billing stages.</p>
              </section>
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
