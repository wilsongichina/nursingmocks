"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
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
  return (
    <div className="user-stat-tile">
      <p className="user-label">{label}</p>
      <p className="user-stat-value mt-2">{value}</p>
      <p className="user-helper mt-2">{helper}</p>
    </div>
  );
}

function AttentionItem({ title, value, href, tone }: { title: string; value: number; href: string; tone: "red" | "amber" | "purple" }) {
  const toneClass = tone === "red" ? "user-alert-error" : tone === "amber" ? "user-alert-warning" : "user-alert-info";
  return (
    <Link href={href} className={`user-alert ${toneClass} transition-transform hover:-translate-y-0.5`}>
      <span className="user-alert-icon" aria-hidden="true">!</span>
      <div>
        <p className="user-card-title">{value} {title}</p>
        <p className="user-helper mt-1">Open the related admin section to review.</p>
      </div>
    </Link>
  );
}

function ManagementCard({ link }: { link: ManagementLink }) {
  return (
    <Link href={link.href} className="user-card group block p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex min-h-full flex-col">
        <span className="user-pill w-fit">Admin</span>
        <h3 className="user-card-title mt-4 transition-colors group-hover:text-indigo-700">{link.title}</h3>
        <p className="user-helper mt-2 flex-1">{link.description}</p>
        <span className="user-button-secondary mt-4 w-fit px-3 py-1.5 text-xs">{link.action}</span>
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
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Admin Dashboard</span>
            </div>
            {currentUser && <UserProfileBadge />}
          </div>
        </div>

        <main className="user-page min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full">
            <header className="user-page-header mb-6">
              <div className="user-page-header-row">
                <div className="user-page-header-copy">
                  <p className="user-eyebrow">Admin</p>
                  <h1 className="user-page-title mt-1">Admin Dashboard</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Monitor users, billing, content, security, and system activity from one workspace.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="user-helper">{summary ? `Last refreshed ${formatDate(summary.generatedAt)}` : "Not refreshed yet"}</span>
                  <button type="button" onClick={() => void loadSummary()} className="user-button-secondary px-3 py-2 text-xs">
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </header>

            {error && (
              <div className="user-alert user-alert-error mb-6" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Could not load dashboard stats</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
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
                  <h2 className="user-section-title">Needs Attention</h2>
                  <p className="user-helper mt-1">Operational items pulled from security, email, and audit signals.</p>
                </div>
              </div>
              {attentionItems.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-4">
                  {attentionItems.map((item) => (
                    <AttentionItem key={item.title} {...item} />
                  ))}
                </div>
              ) : (
                <div className="user-alert user-alert-success">
                  <span className="user-alert-icon" aria-hidden="true">!</span>
                  <p className="user-helper">No high-priority operational alerts in the current dashboard snapshot.</p>
                </div>
              )}
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-2">
              <div className="user-card overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="user-section-title">Recent Payments</h2>
                  <p className="user-helper">Latest visible billing transactions.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="user-label px-4 py-3 text-left">Plan</th>
                        <th className="user-label px-4 py-3 text-left">Amount</th>
                        <th className="user-label px-4 py-3 text-left">Status</th>
                        <th className="user-label px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(summary?.recent.payments ?? []).length === 0 ? (
                        <tr><td colSpan={4} className="user-helper px-4 py-8 text-center">No recent payment records found.</td></tr>
                      ) : (
                        summary?.recent.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-4 align-top">
                              <p className="user-card-title">{payment.planName || "Unknown plan"}</p>
                              <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{payment.userId || "No user"}</p>
                            </td>
                            <td className="user-body-sm px-4 py-4 align-top">{payment.amount === null ? "Not available" : formatMoney(payment.amount, payment.currency || "USD")}</td>
                            <td className="user-body-sm px-4 py-4 align-top">{payment.status || "Not available"}</td>
                            <td className="user-body-sm px-4 py-4 align-top">{formatDate(payment.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="user-card overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="user-section-title">Recent Admin Failures</h2>
                  <p className="user-helper">Failed audit records from the latest admin audit sample.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="user-label px-4 py-3 text-left">Action</th>
                        <th className="user-label px-4 py-3 text-left">Actor</th>
                        <th className="user-label px-4 py-3 text-left">Error</th>
                        <th className="user-label px-4 py-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(summary?.recent.auditFailures ?? []).length === 0 ? (
                        <tr><td colSpan={4} className="user-helper px-4 py-8 text-center">No recent failed admin actions found.</td></tr>
                      ) : (
                        summary?.recent.auditFailures.map((failure) => (
                          <tr key={failure.id}>
                            <td className="user-body-sm px-4 py-4 align-top">{failure.action}</td>
                            <td className="user-body-sm px-4 py-4 align-top">{failure.actorEmail || "Unknown actor"}</td>
                            <td className="user-body-sm px-4 py-4 align-top">{failure.errorMessage || "No error message"}</td>
                            <td className="user-body-sm px-4 py-4 align-top">{formatDate(failure.createdAt)}</td>
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
                    <h2 className="user-section-title">{group.title}</h2>
                    <p className="user-helper mt-1">{group.description}</p>
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
