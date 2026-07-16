"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

function statusClass(status: string) {
  if (status === "sent") return "user-pill-green";
  if (status === "failed") return "user-pill-red";
  if (status === "delivery_uncertain" || status === "retrying") return "user-pill-amber";
  if (status === "processing") return "user-pill-purple";
  return "border-gray-200 bg-gray-50 text-gray-700";
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
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">Admin</Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Email Jobs</span>
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
                  <h1 className="user-page-title mt-1">Email Jobs</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Monitor transactional email queue status, delivery attempts, and provider responses without exposing sensitive template data.
                  </p>
                </div>
              </div>
            </header>

            <section className="mb-6 grid gap-3 lg:grid-cols-4">
              <div className="user-card p-4">
                <p className="user-label">Visible jobs</p>
                <p className="user-stat-value mt-2">{loading ? "..." : jobs.length}</p>
                <p className="user-helper mt-1">Latest records from emailJobs.</p>
              </div>
              <div className="user-card p-4">
                <p className="user-label">Pending work</p>
                <p className="user-stat-value mt-2">{loading ? "..." : visiblePending}</p>
                <p className="user-helper mt-1">Pending, processing, or retrying.</p>
              </div>
              <div className="user-card p-4">
                <p className="user-label">Needs review</p>
                <p className="user-stat-value mt-2">{loading ? "..." : visibleFailures}</p>
                <p className="user-helper mt-1">Failed or delivery uncertain.</p>
              </div>
              <div className="user-alert user-alert-warning p-4">
                <span className="user-alert-icon" aria-hidden="true">!</span>
                <div>
                  <p className="user-card-title">Read-only monitor</p>
                  <p className="user-helper mt-1">Retry and delete controls remain disabled for this phase.</p>
                </div>
              </div>
            </section>

            <form onSubmit={submitFilters} className="user-search-panel mb-6">
              <div className="grid gap-3 md:grid-cols-4">
                <label>
                  <span className="user-label">Template</span>
                  <input value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="user-field mt-2" placeholder="Password Reset" />
                </label>
                <label>
                  <span className="user-label">Status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="user-field mt-2">
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
                  <span className="user-label">Recipient</span>
                  <input value={recipient} onChange={(event) => setRecipient(event.target.value)} className="user-field mt-2" placeholder="student@example.com" />
                </label>
                <div className="flex items-end gap-2">
                  <button type="submit" className="user-button-primary flex-1">Filter</button>
                  <button type="button" onClick={resetFilters} className="user-button-secondary flex-1">Reset</button>
                </div>
              </div>
              <p className="user-helper">Filters apply to the latest 50 records. Sensitive template values are intentionally hidden.</p>
            </form>

            {error && (
              <div className="user-alert user-alert-error mb-4" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Could not load email jobs</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <section className="user-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                <div>
                  <h2 className="user-section-title">Recent Email Jobs</h2>
                  <p className="user-helper">Queue state, attempts, delivery metadata, and safe template data keys.</p>
                </div>
                <button type="button" onClick={() => void loadJobs({ templateId, status, recipient })} className="user-button-secondary px-3 py-1.5 text-xs">
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="user-label px-4 py-3 text-left">Template</th>
                      <th className="user-label px-4 py-3 text-left">Recipient</th>
                      <th className="user-label px-4 py-3 text-left">Status</th>
                      <th className="user-label px-4 py-3 text-left">Attempts</th>
                      <th className="user-label px-4 py-3 text-left">Provider</th>
                      <th className="user-label px-4 py-3 text-left">Timeline</th>
                      <th className="user-label px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="user-helper px-4 py-8 text-center">Loading email jobs...</td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="user-helper px-4 py-8 text-center">No email jobs found.</td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.jobId}>
                          <td className="px-4 py-4 align-top">
                            <p className="user-card-title">{displayName(job.templateId)}</p>
                            <p className="mt-1 max-w-52 truncate font-mono text-xs text-gray-400">{job.jobId}</p>
                          </td>
                          <td className="user-body-sm px-4 py-4 align-top">{job.to}</td>
                          <td className="px-4 py-4 align-top">
                            <span className={`user-pill ${statusClass(job.status)}`}>{displayName(job.status)}</span>
                            {job.lastErrorMessage && <p className="user-helper mt-2 max-w-60">{job.lastErrorMessage}</p>}
                          </td>
                          <td className="user-body-sm px-4 py-4 align-top">{job.attempts} / {job.maxAttempts}</td>
                          <td className="px-4 py-4 align-top">
                            <p className="user-body-sm">{job.provider || "Not set"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{job.providerMessageId || "No provider ID"}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="user-body-sm">Created: {formatDate(job.createdAt)}</p>
                            <p className="user-helper">Updated: {formatDate(job.updatedAt)}</p>
                            <p className="user-helper">Sent: {formatDate(job.sentAt)}</p>
                            <p className="user-helper">Next: {formatDate(job.nextAttemptAt)}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="user-helper">Data Keys: {job.dataKeys.length ? job.dataKeys.map(displayName).join(", ") : "None"}</p>
                            <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{job.idempotencyKey || "No idempotency key"}</p>
                            {job.lastErrorCategory && <p className="user-helper mt-1">Error Type: {displayName(job.lastErrorCategory)}</p>}
                          </td>
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
