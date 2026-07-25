"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  AdminAlert,
  AdminStatCard,
  AdminStatusBadge,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminDashboardSummary } from "@/lib/admin/dashboard";

type DashboardResponse = {
  summary: AdminDashboardSummary;
};

type ManagementLink = {
  title: string;
  description: string;
  href: string;
  action: string;
};

const managementGroups: Array<{ title: string; description: string; links: ManagementLink[] }> = [
  {
    title: "Users & Security",
    description: "Account review, admin identity, security signals, and audit visibility.",
    links: [
      { title: "User Management", href: "/admin/users", action: "View Users", description: "Review Firebase Auth users, Firestore profile snapshots, access, and account state." },
      { title: "Admin Profile", href: "/admin/profile", action: "View Profile", description: "Review and safely update the signed-in admin display name." },
      { title: "Login Security", href: "/admin/login-security", action: "Review Signals", description: "Inspect account-sharing signals, IP hash changes, devices, and locations." },
      { title: "Audit Logs", href: "/admin/audit-logs", action: "View Logs", description: "Review server-created admin audit records and failed admin actions." },
    ],
  },
  {
    title: "Billing",
    description: "Plans, gateways, provider mappings, transactions, access grants, and checkout readiness.",
    links: [
      { title: "Exam Access Catalog", href: "/admin/exam-access", action: "Manage Exams", description: "Manage exam products that billing plans can sell independently." },
      { title: "Billing Configuration", href: "/admin/billing", action: "Manage Billing", description: "Manage billing plans, gateways, provider mappings, and billing records." },
    ],
  },
  {
    title: "Content Management",
    description: "Exam page content, question operations, and blog management.",
    links: [
      { title: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam", action: "Edit Page", description: "Manage ATI TEAS and HESI entrance exam page content." },
      { title: "Nursing Test Bank", href: "/admin/nursing-test-bank", action: "Manage Pages", description: "Manage RN and LPN test bank page content." },
      { title: "Nursing Exit Exam", href: "/admin/nursing-exit-exam", action: "Manage Pages", description: "Manage RN and LPN exit exam page content." },
      { title: "Questions Management", href: "/admin/question", action: "Manage Questions", description: "Create, edit, and manage exam questions." },
      { title: "Blog Management", href: "/admin/blog", action: "Manage Blogs", description: "Create and manage blog content." },
    ],
  },
  {
    title: "System",
    description: "Operational queue and platform health tools.",
    links: [
      { title: "Email Jobs", href: "/admin/email-jobs", action: "View Jobs", description: "Monitor transactional email queue status, attempts, and provider metadata." },
    ],
  },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return <AdminStatCard label={label} value={value} helper={helper} />;
}

function AttentionItem({ title, value, href, tone }: { title: string; value: number; href: string; tone: "red" | "amber" | "purple" }) {
  const toneClass =
    tone === "red"
      ? "admin-attention-red"
      : tone === "amber"
      ? "admin-attention-amber"
      : "admin-attention-purple";
  return (
    <Link href={href} className={`admin-attention-card ${toneClass}`}>
      <span className="admin-attention-icon" aria-hidden="true">!</span>
      <div>
        <p className="admin-card-title">{value} {title}</p>
        <p className="admin-helper mt-1">Open the related admin section to review.</p>
      </div>
    </Link>
  );
}

function ManagementCard({ link }: { link: ManagementLink }) {
  return (
    <Link href={link.href} className="admin-management-card group">
      <div className="flex min-h-full flex-col">
        <AdminStatusBadge label="Admin" tone="purple" />
        <h3 className="admin-card-title mt-4 transition-colors group-hover:text-indigo-700">{link.title}</h3>
        <p className="admin-helper mt-2 flex-1">{link.description}</p>
        <span className="admin-button-secondary mt-4 w-fit px-3 py-1.5 text-xs">{link.action}</span>
      </div>
    </Link>
  );
}

function AdminPageContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as Partial<DashboardResponse> & { error?: string };
      if (!response.ok || !data.summary) throw new Error(data.error || "Could not load admin dashboard");
      setSummary(data.summary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load admin dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const attentionItems = useMemo(() => {
    if (!summary) return [];
    return [
      { title: "high attention login accounts", value: summary.security.highAttentionAccounts, href: "/admin/login-security", tone: "red" as const },
      { title: "review login accounts", value: summary.security.reviewAccounts, href: "/admin/login-security", tone: "amber" as const },
      { title: "failed email jobs", value: summary.email.failedJobs, href: "/admin/email-jobs", tone: "red" as const },
      { title: "recent audit failures", value: summary.audit.recentFailures, href: "/admin/audit-logs", tone: "amber" as const },
    ].filter((item) => item.value > 0);
  }, [summary]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <header className="admin-header mb-6">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <p className="admin-eyebrow">Admin</p>
                  <h1 className="admin-page-title mt-1">Admin Dashboard</h1>
                  <p className="admin-body mt-2 max-w-4xl">
                    Monitor users, billing, content, security, and system activity from one workspace.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="admin-helper">{summary ? `Last refreshed ${formatDate(summary.generatedAt)}` : "Not refreshed yet"}</span>
                  <button type="button" onClick={() => void loadSummary()} className="admin-button-secondary px-3 py-2 text-xs">
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </header>

            {error && (
              <div className="mb-6">
                <AdminAlert tone="error" title="Could Not Load Dashboard Stats">
                  {error}
                </AdminAlert>
              </div>
            )}

            <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Users" value={loading && !summary ? "..." : summary?.users.total ?? 0} helper="Firebase Auth users." />
              <StatCard label="Active Users" value={loading && !summary ? "..." : summary?.users.activeLast30Days ?? 0} helper="Firestore activity in the last 30 days." />
              <StatCard label="Disabled Users" value={loading && !summary ? "..." : summary?.users.disabled ?? 0} helper="Firebase Auth disabled accounts." />
              <StatCard label="Verified Emails" value={loading && !summary ? "..." : summary?.users.emailVerified ?? 0} helper="Firebase Auth email-verified users." />
              <StatCard label="Transactions" value={loading && !summary ? "..." : summary?.billing.transactions ?? 0} helper={`${summary?.billing.paidTransactions ?? 0} paid transactions.`} />
              <StatCard label="Revenue Collected" value={loading && !summary ? "..." : formatMoney(summary?.billing.revenue ?? 0, summary?.billing.currency ?? "USD")} helper="From paid billing transactions." />
              <StatCard label="Active Access Grants" value={loading && !summary ? "..." : summary?.billing.activeAccessGrants ?? 0} helper="Active billing entitlement records." />
              <StatCard label="Pending Email Jobs" value={loading && !summary ? "..." : summary?.email.pendingJobs ?? 0} helper={`${summary?.email.failedJobs ?? 0} failed or uncertain.`} />
            </section>

            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="admin-section-title">Needs Attention</h2>
                  <p className="admin-helper mt-1">Operational items pulled from security, email, and audit signals.</p>
                </div>
              </div>
              {attentionItems.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-4">
                  {attentionItems.map((item) => (
                    <AttentionItem key={item.title} {...item} />
                  ))}
                </div>
              ) : (
                <AdminAlert tone="success">
                  No high-priority operational alerts in the current dashboard snapshot.
                </AdminAlert>
              )}
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-2">
              <div className="admin-table-card overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="admin-section-title">Recent Payments</h2>
                  <p className="admin-helper">Latest visible billing transactions.</p>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Plan</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(summary?.recent.payments ?? []).length === 0 ? (
                        <tr><td colSpan={4} className="admin-helper px-4 py-8 text-center">No recent payment records found.</td></tr>
                      ) : (
                        summary?.recent.payments.map((payment) => (
                          <tr key={payment.id}>
                            <AdminTableCell>
                              <p className="admin-card-title">{payment.planName || "Unknown plan"}</p>
                              <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{payment.userId || "No user"}</p>
                            </AdminTableCell>
                            <AdminTableCell>{payment.amount === null ? "Not available" : formatMoney(payment.amount, payment.currency || "USD")}</AdminTableCell>
                            <AdminTableCell>{payment.status || "Not available"}</AdminTableCell>
                            <AdminTableCell>{formatDate(payment.createdAt)}</AdminTableCell>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-table-card overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="admin-section-title">Recent Admin Failures</h2>
                  <p className="admin-helper">Failed audit records from the latest admin audit sample.</p>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Action</th>
                        <th className="px-4 py-3 text-left">Actor</th>
                        <th className="px-4 py-3 text-left">Error</th>
                        <th className="px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(summary?.recent.auditFailures ?? []).length === 0 ? (
                        <tr><td colSpan={4} className="admin-helper px-4 py-8 text-center">No recent failed admin actions found.</td></tr>
                      ) : (
                        summary?.recent.auditFailures.map((failure) => (
                          <tr key={failure.id}>
                            <AdminTableCell>{failure.action}</AdminTableCell>
                            <AdminTableCell>{failure.actorEmail || "Unknown actor"}</AdminTableCell>
                            <AdminTableCell>{failure.errorMessage || "No error message"}</AdminTableCell>
                            <AdminTableCell>{formatDate(failure.createdAt)}</AdminTableCell>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              {managementGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-3">
                    <h2 className="admin-section-title">{group.title}</h2>
                    <p className="admin-helper mt-1">{group.description}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {group.links.map((link) => (
                      <ManagementCard key={link.href} link={link} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <SidebarProvider>
      <AdminPageContent />
    </SidebarProvider>
  );
}
