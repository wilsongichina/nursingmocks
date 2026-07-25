"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AdminAlert,
  AdminInlineLoading,
  AdminStatCard,
  AdminStatusBadge,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminEmailJobRecord } from "@/lib/admin/email-jobs";

type EmailJobsResponse = {
  jobs: AdminEmailJobRecord[];
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(status: string): "green" | "red" | "amber" | "purple" | "gray" {
  if (status === "sent") return "green";
  if (status === "failed") return "red";
  if (status === "delivery_uncertain" || status === "retrying") return "amber";
  if (status === "processing") return "purple";
  return "gray";
}

function displayName(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return "Not Available";
  return normalized
    .replace(/[_\-.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (["ID", "UID", "URL", "API"].includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function AdminEmailJobsContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<AdminEmailJobRecord[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [status, setStatus] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(
    async (filters: { templateId?: string; status?: string; recipient?: string } = {}) => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);

      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ limit: "50" });
        if (filters.templateId) params.set("templateId", filters.templateId);
        if (filters.status) params.set("status", filters.status);
        if (filters.recipient) params.set("recipient", filters.recipient);

        const response = await fetch(`/api/admin/email-jobs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Could not load email jobs");
        const data = (await response.json()) as EmailJobsResponse;
        setJobs(data.jobs);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load email jobs");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadJobs({
      templateId: templateId.trim(),
      status: status.trim(),
      recipient: recipient.trim(),
    });
  };

  const resetFilters = () => {
    setTemplateId("");
    setStatus("");
    setRecipient("");
    void loadJobs();
  };

  const visibleFailures = jobs.filter((job) => job.status === "failed" || job.status === "delivery_uncertain").length;
  const visiblePending = jobs.filter((job) => job.status === "pending" || job.status === "retrying" || job.status === "processing").length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Email Jobs" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <header className="admin-header mb-6">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <p className="admin-eyebrow">Admin</p>
                  <h1 className="admin-page-title mt-1">Email Jobs</h1>
                  <p className="admin-body mt-2 max-w-4xl">
                    Monitor transactional email queue status, delivery attempts, and provider responses without exposing sensitive template data.
                  </p>
                </div>
              </div>
            </header>

            <section className="mb-6 grid gap-3 lg:grid-cols-4">
              <AdminStatCard label="Visible Jobs" value={loading ? "..." : jobs.length} helper="Latest records from emailJobs." />
              <AdminStatCard label="Pending Work" value={loading ? "..." : visiblePending} helper="Pending, processing, or retrying." />
              <AdminStatCard label="Needs Review" value={loading ? "..." : visibleFailures} helper="Failed or delivery uncertain." />
              <AdminAlert tone="warning" title="Read-Only Monitor">
                Retry and delete controls remain disabled for this phase.
              </AdminAlert>
            </section>

            <form onSubmit={submitFilters} className="admin-card mb-6 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <label>
                  <span className="admin-field-label">Template</span>
                  <input value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="admin-field mt-2" placeholder="Password Reset" />
                </label>
                <label>
                  <span className="admin-field-label">Status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-field mt-2">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="sent">Sent</option>
                    <option value="retrying">Retrying</option>
                    <option value="failed">Failed</option>
                    <option value="delivery_uncertain">Delivery Uncertain</option>
                  </select>
                </label>
                <label>
                  <span className="admin-field-label">Recipient</span>
                  <input value={recipient} onChange={(event) => setRecipient(event.target.value)} className="admin-field mt-2" placeholder="student@example.com" />
                </label>
                <div className="flex items-end gap-2">
                  <button type="submit" className="admin-button-primary flex-1">Filter</button>
                  <button type="button" onClick={resetFilters} className="admin-button-secondary flex-1">Reset</button>
                </div>
              </div>
              <p className="admin-helper mt-3">Filters apply to the latest 50 records. Sensitive template values are intentionally hidden.</p>
            </form>

            {error && (
              <div className="mb-4" role="alert">
                <AdminAlert tone="error" title="Could Not Load Email Jobs">
                  {error}
                </AdminAlert>
              </div>
            )}

            <section className="admin-table-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                <div>
                  <h2 className="admin-section-title">Recent Email Jobs</h2>
                  <p className="admin-helper">Queue state, attempts, delivery metadata, and safe template data keys.</p>
                </div>
                <button type="button" onClick={() => void loadJobs({ templateId, status, recipient })} className="admin-button-secondary px-3 py-1.5 text-xs">
                  Refresh
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="admin-table-heading px-4 py-3 text-left">Template</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Recipient</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Status</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Attempts</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Provider</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Timeline</th>
                      <th className="admin-table-heading px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <AdminInlineLoading label="Loading Email Jobs" />
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-helper px-4 py-8 text-center">No email jobs found.</td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.jobId}>
                          <AdminTableCell>
                            <p className="admin-card-title">{displayName(job.templateId)}</p>
                            <p className="mt-1 max-w-52 truncate font-mono text-xs text-gray-400">{job.jobId}</p>
                          </AdminTableCell>
                          <AdminTableCell>{job.to}</AdminTableCell>
                          <AdminTableCell>
                            <AdminStatusBadge label={displayName(job.status)} tone={statusClass(job.status)} />
                            {job.lastErrorMessage && <p className="admin-helper mt-2 max-w-60">{job.lastErrorMessage}</p>}
                          </AdminTableCell>
                          <AdminTableCell>{job.attempts} / {job.maxAttempts}</AdminTableCell>
                          <AdminTableCell>
                            <p className="admin-body-sm">{job.provider || "Not set"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{job.providerMessageId || "No provider ID"}</p>
                          </AdminTableCell>
                          <AdminTableCell>
                            <p className="admin-body-sm">Created: {formatDate(job.createdAt)}</p>
                            <p className="admin-helper">Updated: {formatDate(job.updatedAt)}</p>
                            <p className="admin-helper">Sent: {formatDate(job.sentAt)}</p>
                            <p className="admin-helper">Next: {formatDate(job.nextAttemptAt)}</p>
                          </AdminTableCell>
                          <AdminTableCell>
                            <p className="admin-helper">Data Keys: {job.dataKeys.length ? job.dataKeys.map(displayName).join(", ") : "None"}</p>
                            <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{job.idempotencyKey || "No idempotency key"}</p>
                            {job.lastErrorCategory && <p className="admin-helper mt-1">Error Type: {displayName(job.lastErrorCategory)}</p>}
                          </AdminTableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminEmailJobsPage() {
  return (
    <SidebarProvider>
      <AdminEmailJobsContent />
    </SidebarProvider>
  );
}
