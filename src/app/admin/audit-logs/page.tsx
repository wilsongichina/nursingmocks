"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminAuditLogRecord } from "@/lib/admin/audit";

type AuditLogsResponse = {
  logs: AdminAuditLogRecord[];
  requestId: string;
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

function StatusPill({ status }: { status: AdminAuditLogRecord["status"] }) {
  return (
    <span className={`user-pill ${status === "failure" ? "user-pill-red" : "user-pill-green"}`}>
      {status}
    </span>
  );
}

function JsonSummary({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  return (
    <details className="user-detail-surface p-3">
      <summary className="cursor-pointer list-none">
        <span className="user-label">{title}</span>
      </summary>
      {data ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="user-helper mt-2">No data captured.</p>
      )}
    </details>
  );
}

function AdminAuditLogsContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [targetUid, setTargetUid] = useState("");
  const [actorUid, setActorUid] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const loadAuditLogs = useCallback(
    async (filters: { targetUid?: string; actorUid?: string; action?: string } = {}) => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);

      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ limit: "50" });
        if (filters.targetUid) params.set("targetUid", filters.targetUid);
        if (filters.actorUid) params.set("actorUid", filters.actorUid);
        if (filters.action) params.set("action", filters.action);

        const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Could not load audit logs");
        const data = (await response.json()) as AuditLogsResponse;
        setLogs(data.logs);
        setRequestId(data.requestId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load audit logs");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadAuditLogs({
      targetUid: targetUid.trim(),
      actorUid: actorUid.trim(),
      action: action.trim(),
    });
  };

  const resetFilters = () => {
    setTargetUid("");
    setActorUid("");
    setAction("");
    void loadAuditLogs();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">
                Admin
              </Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Audit Logs</span>
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
                  <h1 className="user-page-title mt-1">Audit Logs</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Review server-created admin audit records before enabling account-changing user-management actions.
                  </p>
                </div>
              </div>
            </header>

            <section className="mb-6 grid gap-3 lg:grid-cols-3">
              <div className="user-card p-4">
                <p className="user-label">Visible logs</p>
                <p className="user-stat-value mt-2">{loading ? "..." : logs.length}</p>
                <p className="user-helper mt-1">Most recent records from `adminAuditLogs`.</p>
              </div>
              <div className="user-card p-4">
                <p className="user-label">Collection</p>
                <p className="user-card-title mt-2">adminAuditLogs</p>
                <p className="user-helper mt-1">Append-only server-created audit trail.</p>
              </div>
              <div className="user-alert user-alert-warning p-4">
                <span className="user-alert-icon" aria-hidden="true">!</span>
                <div>
                  <p className="user-card-title">Read-only viewer</p>
                  <p className="user-helper mt-1">Audit records are not editable from the admin UI.</p>
                </div>
              </div>
            </section>

            <form onSubmit={submitFilters} className="user-search-panel mb-6">
              <div className="grid gap-3 md:grid-cols-4">
                <label>
                  <span className="user-label">Action</span>
                  <input value={action} onChange={(event) => setAction(event.target.value)} className="user-field mt-2" placeholder="admin.audit.view" />
                </label>
                <label>
                  <span className="user-label">Actor UID</span>
                  <input value={actorUid} onChange={(event) => setActorUid(event.target.value)} className="user-field mt-2" placeholder="Admin UID" />
                </label>
                <label>
                  <span className="user-label">Target UID</span>
                  <input value={targetUid} onChange={(event) => setTargetUid(event.target.value)} className="user-field mt-2" placeholder="User UID" />
                </label>
                <div className="flex items-end gap-2">
                  <button type="submit" className="user-button-primary flex-1">Filter</button>
                  <button type="button" onClick={resetFilters} className="user-button-secondary flex-1">Reset</button>
                </div>
              </div>
              <p className="user-helper">Filters apply to the latest 50 records to avoid requiring Firestore composite indexes in this first phase.</p>
            </form>

            {error && (
              <div className="user-alert user-alert-error mb-4" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Could not load audit logs</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <section className="user-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                <div>
                  <h2 className="user-section-title">Recent Audit Records</h2>
                  <p className="user-helper">{requestId ? `Last request: ${requestId}` : "Loading audit records..."}</p>
                </div>
                <button type="button" onClick={() => void loadAuditLogs({ targetUid, actorUid, action })} className="user-button-secondary px-3 py-1.5 text-xs">
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="user-label px-4 py-3 text-left">Action</th>
                      <th className="user-label px-4 py-3 text-left">Actor</th>
                      <th className="user-label px-4 py-3 text-left">Target</th>
                      <th className="user-label px-4 py-3 text-left">Status</th>
                      <th className="user-label px-4 py-3 text-left">Created</th>
                      <th className="user-label px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="user-helper px-4 py-8 text-center">Loading audit logs...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="user-helper px-4 py-8 text-center">No audit logs found.</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.auditLogId}>
                          <td className="px-4 py-4 align-top">
                            <p className="user-card-title">{log.action}</p>
                            <p className="mt-1 max-w-52 truncate font-mono text-xs text-gray-400">{log.requestId}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="user-body-sm">{log.actorEmail || "No email"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{log.actorUid}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="user-body-sm">{log.targetEmail || "No target email"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{log.targetUid || "No target"}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <StatusPill status={log.status} />
                            {log.errorMessage && <p className="user-helper mt-2">{log.errorMessage}</p>}
                          </td>
                          <td className="user-body-sm px-4 py-4 align-top">{formatDate(log.createdAt)}</td>
                          <td className="min-w-72 px-4 py-4 align-top">
                            <div className="space-y-2">
                              <JsonSummary title="Before" data={log.before} />
                              <JsonSummary title="After" data={log.after} />
                            </div>
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

export default function AdminAuditLogsPage() {
  return (
    <SidebarProvider>
      <AdminAuditLogsContent />
    </SidebarProvider>
  );
}
