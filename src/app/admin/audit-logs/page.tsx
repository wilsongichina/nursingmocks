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
  return <AdminStatusBadge label={displayName(status)} tone={status === "failure" ? "red" : "green"} />;
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

function JsonSummary({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  return (
    <details className="admin-info-tile p-3">
      <summary className="cursor-pointer list-none">
        <span className="admin-info-tile-label">{title}</span>
      </summary>
      {data ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="admin-helper mt-2">No data captured.</p>
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
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Audit Logs" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <header className="admin-header mb-6">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <p className="admin-eyebrow">Admin</p>
                  <h1 className="admin-page-title mt-1">Audit Logs</h1>
                  <p className="admin-body mt-2 max-w-4xl">
                    Review server-created admin audit records before enabling account-changing user-management actions.
                  </p>
                </div>
              </div>
            </header>

            <section className="mb-6 grid gap-3 lg:grid-cols-3">
              <AdminStatCard label="Visible Logs" value={loading ? "..." : logs.length} helper="Most recent records from adminAuditLogs." />
              <AdminStatCard label="Collection" value="adminAuditLogs" helper="Append-only server-created audit trail." />
              <AdminAlert tone="warning" title="Read-Only Viewer">
                Audit records are not editable from the admin UI.
              </AdminAlert>
            </section>

            <form onSubmit={submitFilters} className="admin-card mb-6 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <label>
                  <span className="admin-field-label">Action</span>
                  <input value={action} onChange={(event) => setAction(event.target.value)} className="admin-field mt-2" placeholder="Admin Audit View" />
                </label>
                <label>
                  <span className="admin-field-label">Actor UID</span>
                  <input value={actorUid} onChange={(event) => setActorUid(event.target.value)} className="admin-field mt-2" placeholder="Admin UID" />
                </label>
                <label>
                  <span className="admin-field-label">Target UID</span>
                  <input value={targetUid} onChange={(event) => setTargetUid(event.target.value)} className="admin-field mt-2" placeholder="User UID" />
                </label>
                <div className="flex items-end gap-2">
                  <button type="submit" className="admin-button-primary flex-1">Filter</button>
                  <button type="button" onClick={resetFilters} className="admin-button-secondary flex-1">Reset</button>
                </div>
              </div>
              <p className="admin-helper mt-3">Filters apply to the latest 50 records to avoid requiring Firestore composite indexes in this first phase.</p>
            </form>

            {error && (
              <div className="mb-4">
                <AdminAlert tone="error" title="Could Not Load Audit Logs">
                  {error}
                </AdminAlert>
              </div>
            )}

            <section className="admin-table-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                <div>
                  <h2 className="admin-section-title">Recent Audit Records</h2>
                  <p className="admin-helper">{requestId ? `Last request: ${requestId}` : "Loading audit records..."}</p>
                </div>
                <button type="button" onClick={() => void loadAuditLogs({ targetUid, actorUid, action })} className="admin-button-secondary px-3 py-1.5 text-xs">
                  Refresh
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Action</th>
                      <th className="px-4 py-3 text-left">Actor</th>
                      <th className="px-4 py-3 text-left">Target</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <AdminInlineLoading label="Loading Audit Logs" />
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-helper px-4 py-8 text-center">No audit logs found.</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.auditLogId}>
                          <AdminTableCell>
                            <p className="admin-card-title">{displayName(log.action)}</p>
                            <p className="mt-1 max-w-52 truncate font-mono text-xs text-gray-400">{log.requestId}</p>
                          </AdminTableCell>
                          <AdminTableCell>
                            <p>{log.actorEmail || "No email"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{log.actorUid}</p>
                          </AdminTableCell>
                          <AdminTableCell>
                            <p>{log.targetEmail || "No target email"}</p>
                            <p className="mt-1 max-w-44 truncate font-mono text-xs text-gray-400">{log.targetUid || "No target"}</p>
                          </AdminTableCell>
                          <AdminTableCell>
                            <StatusPill status={log.status} />
                            {log.errorMessage && <p className="admin-helper mt-2">{log.errorMessage}</p>}
                          </AdminTableCell>
                          <AdminTableCell>{formatDate(log.createdAt)}</AdminTableCell>
                          <AdminTableCell className="min-w-72">
                            <div className="space-y-2">
                              <JsonSummary title="Before" data={log.before} />
                              <JsonSummary title="After" data={log.after} />
                            </div>
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

export default function AdminAuditLogsPage() {
  return (
    <SidebarProvider>
      <AdminAuditLogsContent />
    </SidebarProvider>
  );
}
