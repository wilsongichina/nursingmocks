"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminUserDetail, AdminUserSummary } from "@/lib/admin/users";

type UsersResponse = {
  users: AdminUserSummary[];
  nextPageToken?: string;
};

type DetailResponse = {
  user: AdminUserDetail;
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

function statusBadge(label: string, tone: "green" | "red" | "gray" | "purple" | "amber") {
  const tones = {
    green: "user-pill-green",
    red: "user-pill-red",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
    purple: "user-pill-purple",
    amber: "user-pill-amber",
  };
  return (
    <span className={`user-pill ${tones[tone]}`}>
      {label}
    </span>
  );
}

function formatUnknownValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not available";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? value.map(formatUnknownValue).join(", ") : "Not available";
  if (typeof value === "object") return JSON.stringify(value);
  return "Not available";
}

function pickRecordValue(record: Record<string, unknown> | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    if (record[key] !== null && record[key] !== undefined && record[key] !== "") {
      return formatUnknownValue(record[key]);
    }
  }
  return null;
}

function Field({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div className="user-detail-surface p-3">
      <p className="user-label">{label}</p>
      <p className="user-card-title mt-1 break-words">
        {value === null || value === undefined || value === "" ? "Not available" : String(value)}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="user-card p-4">
      <div>
        <h3 className="user-section-title">{title}</h3>
        {description && <p className="user-helper mt-1">{description}</p>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {children}
      </div>
    </section>
  );
}

function JsonPanel({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  return (
    <div className="user-card p-4">
      <h3 className="user-card-title">{title}</h3>
      {data ? (
        <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="user-helper mt-2">No data available.</p>
      )}
    </div>
  );
}

function UserDetailSections({
  user,
  actionLoading,
  supportMessage,
  onSupportAction,
  statusReason,
  statusMessage,
  onStatusReasonChange,
  onAccountStatusAction,
}: {
  user: AdminUserDetail;
  actionLoading: string | null;
  supportMessage: { tone: "success" | "error"; text: string } | null;
  onSupportAction: (uid: string, action: "send_password_reset" | "send_email_verification") => void;
  statusReason: string;
  statusMessage: { tone: "success" | "error"; text: string } | null;
  onStatusReasonChange: (reason: string) => void;
  onAccountStatusAction: (uid: string, action: "disable_account" | "enable_account") => void;
}) {
  const access = user.firestoreDocument.access;
  const billing = user.firestoreDocument.billing;
  const entitlements = user.firestoreDocument.entitlements;
  const accountState = user.firestoreDocument.accountState;
  const stats = user.firestoreDocument.stats;
  const authProfile = user.firestoreDocument.auth;

  return (
    <div className="mt-4 space-y-4">
      <div className="user-detail-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="user-card-title break-words">
              {user.displayName || user.firestoreProfile?.fullName || "Unnamed user"}
            </h3>
            <p className="user-body-sm mt-1 break-words">{user.email || "No email"}</p>
            <p className="mt-1 break-all font-mono text-xs text-gray-400">{user.uid}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.adminClaim ? statusBadge("Admin", "purple") : statusBadge("Student", "gray")}
            {user.disabled ? statusBadge("Disabled", "red") : statusBadge("Enabled", "green")}
            {user.emailVerified ? statusBadge("Verified", "green") : statusBadge("Unverified", "amber")}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSupportAction(user.uid, "send_password_reset")}
            disabled={actionLoading !== null || !user.email}
            className="user-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading === "send_password_reset" ? "Sending..." : "Send Password Reset"}
          </button>
          {!user.emailVerified && (
            <button
              type="button"
              onClick={() => onSupportAction(user.uid, "send_email_verification")}
              disabled={actionLoading !== null || !user.email}
              className="user-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === "send_email_verification" ? "Sending..." : "Send Email Verification"}
            </button>
          )}
        </div>
        {supportMessage && (
          <div className={`mt-4 user-alert ${supportMessage.tone === "success" ? "user-alert-success" : "user-alert-error"}`} role="status">
            <span className="user-alert-icon" aria-hidden="true">
              {supportMessage.tone === "success" ? "!" : "x"}
            </span>
            <p className="user-helper">{supportMessage.text}</p>
          </div>
        )}
      </div>

      <section className="user-card p-4">
        <div>
          <h3 className="user-section-title">Account Controls</h3>
          <p className="user-helper mt-1">
            Disable blocks sign-in. Enable restores sign-in. A reason is required and every action is audited.
          </p>
        </div>
        <label className="mt-4 block">
          <span className="user-label">Reason</span>
          <textarea
            value={statusReason}
            onChange={(event) => onStatusReasonChange(event.target.value)}
            className="user-field mt-2 min-h-24"
            maxLength={500}
            placeholder="Explain why this account status change is needed."
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.disabled ? (
            <button
              type="button"
              onClick={() => onAccountStatusAction(user.uid, "enable_account")}
              disabled={actionLoading !== null || statusReason.trim().length < 10}
              className="user-button-primary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === "enable_account" ? "Enabling..." : "Enable Account"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAccountStatusAction(user.uid, "disable_account")}
              disabled={actionLoading !== null || statusReason.trim().length < 10}
              className="user-button-secondary border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === "disable_account" ? "Disabling..." : "Disable Account"}
            </button>
          )}
        </div>
        {statusMessage && (
          <div className={`mt-4 user-alert ${statusMessage.tone === "success" ? "user-alert-success" : "user-alert-error"}`} role="status">
            <span className="user-alert-icon" aria-hidden="true">
              {statusMessage.tone === "success" ? "!" : "x"}
            </span>
            <p className="user-helper">{statusMessage.text}</p>
          </div>
        )}
      </section>

      <DetailSection title="Identity" description="Firebase Auth profile and matching user document identity fields.">
        <Field label="Display name" value={user.displayName || user.firestoreProfile?.fullName} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phoneNumber || user.firestoreDocument.phoneE164} />
        <Field label="Providers" value={user.providerIds.join(", ") || null} />
        <Field label="Created" value={formatDate(user.createdAt)} />
        <Field label="Photo URL" value={user.photoURL || user.firestoreDocument.avatarUrl} />
      </DetailSection>

      <DetailSection title="Access" description="Read-only access, role, claim, and entitlement indicators.">
        <Field label="Role" value={user.firestoreProfile?.role || pickRecordValue(access, ["role"])} />
        <Field label="Admin claim" value={user.adminClaim} />
        <Field label="Admin flag" value={user.firestoreProfile?.isAdminFlag} />
        <Field label="Primary exam" value={user.firestoreProfile?.primaryExamId} />
        <Field label="Entitlement status" value={pickRecordValue(entitlements, ["status", "access_status", "accessStatus"])} />
        <Field label="Entitlement IDs" value={pickRecordValue(entitlements, ["exam_ids", "examIds", "package_ids", "packageIds", "active"])} />
      </DetailSection>

      <DetailSection title="Billing" description="Billing snapshot only. Entitlements remain the source of access truth.">
        <Field label="Subscription status" value={user.firestoreProfile?.subscriptionStatus || pickRecordValue(billing, ["subscription_status", "subscriptionStatus"])} />
        <Field label="Plan ID" value={user.firestoreProfile?.planId || pickRecordValue(billing, ["plan_id", "planId"])} />
        <Field label="Access status" value={pickRecordValue(billing, ["access_status", "accessStatus", "status"])} />
        <Field label="Access ends" value={pickRecordValue(billing, ["access_ends_at", "accessEndsAt", "access_end", "accessEnd"])} />
        <Field label="Last payment" value={pickRecordValue(billing, ["last_payment_at", "lastPaymentAt", "last_payment_id", "lastPaymentId"])} />
        <Field label="Customer ref" value={pickRecordValue(billing, ["customer_ref", "customerRef", "customer_id", "customerId"])} />
      </DetailSection>

      <DetailSection title="Activity" description="Login, activity, and practice counters available for account review.">
        <Field label="Last sign-in" value={formatDate(user.lastSignInAt)} />
        <Field label="Last login" value={formatDate(user.firestoreDocument.lastLoginAt)} />
        <Field label="Last active" value={formatDate(user.firestoreDocument.lastActiveAt || user.firestoreProfile?.lastActiveAt || null)} />
        <Field label="Total attempts" value={user.firestoreProfile?.totalAttempts || pickRecordValue(stats, ["total_attempts", "totalAttempts"])} />
        <Field label="Completed exams" value={pickRecordValue(stats, ["completed_exams", "completedExams"])} />
        <Field label="Updated" value={formatDate(user.firestoreDocument.updatedAt)} />
      </DetailSection>

      <DetailSection title="Account State" description="Status values that explain whether the account can be used normally.">
        <Field label="Auth disabled" value={user.disabled} />
        <Field label="Email verified" value={user.emailVerified} />
        <Field label="Account status" value={user.firestoreProfile?.accountStatus || pickRecordValue(accountState, ["status"])} />
        <Field label="Firestore profile" value={user.firestoreDocument.exists ? "Exists" : "Missing"} />
        <Field label="Auth email" value={pickRecordValue(authProfile, ["email"])} />
        <Field label="Profile created" value={formatDate(user.firestoreDocument.createdAt)} />
      </DetailSection>

      <details className="user-card p-4">
        <summary className="cursor-pointer list-none">
          <span className="user-section-title">Technical Records</span>
          <span className="user-helper mt-1 block">Open only when you need the raw read-only Firestore/Auth payloads.</span>
        </summary>
        <div className="mt-4 space-y-4">
          <JsonPanel title="Custom Claims" data={user.customClaims} />
          <JsonPanel title="Access" data={access} />
          <JsonPanel title="Auth Profile" data={authProfile} />
          <JsonPanel title="Billing Summary" data={billing} />
          <JsonPanel title="Entitlements" data={entitlements} />
          <JsonPanel title="Referral Summary" data={user.firestoreDocument.referralSummary} />
          <JsonPanel title="Stats" data={stats} />
        </div>
      </details>
    </div>
  );
}

function AdminUsersContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [supportActionLoading, setSupportActionLoading] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchMode = activeSearch
    ? activeSearch.includes("@")
      ? "Exact email search checks Firebase Auth globally."
      : "This search filters the currently loaded Firebase Auth page."
    : "Showing the current Firebase Auth page.";

  const searchSuggestions = useMemo(() => {
    const values = new Set<string>();
    users.forEach((user) => {
      [
        user.email,
        user.uid,
        user.displayName,
        user.firestoreProfile?.fullName,
      ].forEach((value) => {
        if (value) values.add(value);
      });
    });
    return Array.from(values).sort((first, second) => first.localeCompare(second));
  }, [users]);

  const loadUsers = useCallback(
    async (options: { pageToken?: string; search?: string } = {}) => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);

      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ limit: "50" });
        if (options.pageToken) params.set("pageToken", options.pageToken);
        if (options.search) params.set("search", options.search);

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Could not load users");
        const data = (await response.json()) as UsersResponse;
        setUsers(data.users);
        setNextPageToken(data.nextPageToken);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load users");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  const loadUserDetail = async (uid: string, options: { preserveMessages?: boolean } = {}) => {
    if (!currentUser) return;
    setDetailLoading(true);
    setError(null);
    if (!options.preserveMessages) {
      setSupportMessage(null);
      setStatusMessage(null);
      setStatusReason("");
    }

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/users/${encodeURIComponent(uid)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not load user detail");
      const data = (await response.json()) as DetailResponse;
      setSelectedUser(data.user);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Could not load user detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const runSupportAction = async (uid: string, action: "send_password_reset" | "send_email_verification") => {
    if (!currentUser) return;
    setSupportActionLoading(action);
    setSupportMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/support-actions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; requestId?: string };
      if (!response.ok) throw new Error(data.error || "Could not send support email");

      setSupportMessage({
        tone: "success",
        text: action === "send_password_reset"
          ? "Password reset email queued and audited."
          : "Email verification message queued and audited.",
      });
    } catch (actionError) {
      setSupportMessage({
        tone: "error",
        text: actionError instanceof Error ? actionError.message : "Could not send support email",
      });
    } finally {
      setSupportActionLoading(null);
    }
  };

  const runAccountStatusAction = async (uid: string, action: "disable_account" | "enable_account") => {
    if (!currentUser) return;
    setSupportActionLoading(action);
    setStatusMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/account-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, reason: statusReason.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; requestId?: string; emailQueued?: boolean; emailError?: string | null };
      if (!response.ok) throw new Error(data.error || "Could not update account status");

      setStatusMessage({
        tone: "success",
        text: action === "disable_account"
          ? data.emailQueued
            ? "Account disabled, user email queued, and audit log recorded."
            : `Account disabled and audit log recorded. Email was not queued${data.emailError ? `: ${data.emailError}` : "."}`
          : data.emailQueued
            ? "Account enabled, user email queued, and audit log recorded."
            : `Account enabled and audit log recorded. Email was not queued${data.emailError ? `: ${data.emailError}` : "."}`,
      });
      setStatusReason("");
      await loadUserDetail(uid, { preserveMessages: true });
      await loadUsers({ search: activeSearch });
    } catch (actionError) {
      setStatusMessage({
        tone: "error",
        text: actionError instanceof Error ? actionError.message : "Could not update account status",
      });
    } finally {
      setSupportActionLoading(null);
    }
  };

  useEffect(() => {
    void loadUsers({ search: activeSearch });
  }, [activeSearch, loadUsers]);

  useEffect(() => {
    const nextSearch = search.trim();
    const debounceId = window.setTimeout(() => {
      if (nextSearch === activeSearch) return;
      setSelectedUser(null);
      setPageTokens([]);
      setActiveSearch(nextSearch);
    }, 350);

    return () => window.clearTimeout(debounceId);
  }, [activeSearch, search]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = search.trim();
    if (nextSearch !== activeSearch) {
      setSelectedUser(null);
      setPageTokens([]);
      setActiveSearch(nextSearch);
    }
  };

  const goNext = () => {
    if (!nextPageToken) return;
    setPageTokens((previous) => [...previous, nextPageToken]);
    void loadUsers({ pageToken: nextPageToken, search: activeSearch });
  };

  const goPrevious = () => {
    const tokens = [...pageTokens];
    tokens.pop();
    const previousToken = tokens[tokens.length - 1];
    setPageTokens(tokens);
    void loadUsers({ pageToken: previousToken, search: activeSearch });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="hidden md:block border-b border-gray-200 bg-white h-16">
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
              <span className="font-medium">Users</span>
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
                  <h1 className="user-page-title mt-1">User Management</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Read-only Firebase Auth and Firestore user overview. Sensitive account changes should be added as audited server actions in a later phase.
                  </p>
                </div>
              </div>
              <form onSubmit={submitSearch} className="user-search-panel mt-4 max-w-3xl">
                <div className="user-search-row sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <input
                    type="search"
                    list="admin-user-search-suggestions"
                    autoComplete="off"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search visible page, UID, or exact email"
                    className="user-field min-w-0"
                  />
                  <datalist id="admin-user-search-suggestions">
                    {searchSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                  <button
                    type="submit"
                    className="user-button-primary sm:min-w-28"
                  >
                    Search
                  </button>
                </div>
              </form>
            </header>

            <section className="mb-6 grid gap-3 lg:grid-cols-4">
              <div className="user-card p-4">
                <p className="user-label">Visible users</p>
                <p className="user-stat-value mt-2">{loading ? "..." : users.length}</p>
                <p className="user-helper mt-1">Loaded from the current Firebase Auth page.</p>
              </div>
              <div className="user-card p-4">
                <p className="user-label">Page position</p>
                <p className="user-stat-value mt-2">{pageTokens.length + 1}</p>
                <p className="user-helper mt-1">{nextPageToken && !activeSearch ? "More users available." : "No next page currently available."}</p>
              </div>
              <div className="user-card p-4">
                <p className="user-label">Search mode</p>
                <p className="user-card-title mt-2">{activeSearch ? activeSearch : "No search"}</p>
                <p className="user-helper mt-1">{searchMode}</p>
              </div>
              <div className="user-alert user-alert-warning p-4">
                <span className="user-alert-icon" aria-hidden="true">!</span>
                <div>
                  <p className="user-card-title">Read-only phase</p>
                  <p className="user-helper mt-1">Audit logging should come before write actions.</p>
                </div>
              </div>
            </section>

            {error && (
              <div className="user-alert user-alert-error mb-4" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Could not load users</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
              <section className="user-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <div>
                    <h2 className="user-section-title">Users</h2>
                    <p className="user-helper">{loading ? "Loading..." : `${users.length} shown from current page`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goPrevious}
                      disabled={pageTokens.length === 0 || loading}
                      className="user-button-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!nextPageToken || loading || Boolean(activeSearch)}
                      className="user-button-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="user-label px-4 py-3 text-left">User</th>
                        <th className="user-label px-4 py-3 text-left">Access</th>
                        <th className="user-label px-4 py-3 text-left">Subscription</th>
                        <th className="user-label px-4 py-3 text-left">Last sign-in</th>
                        <th className="user-label px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="user-helper px-4 py-8 text-center">
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="user-helper px-4 py-8 text-center">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.uid} className={selectedUser?.uid === user.uid ? "bg-purple-50/50" : ""}>
                            <td className="px-4 py-4 align-top">
                              <p className="user-card-title">{user.displayName || user.firestoreProfile?.fullName || "Unnamed user"}</p>
                              <p className="user-body-sm mt-1">{user.email || "No email"}</p>
                              <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{user.uid}</p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap gap-2">
                                {user.adminClaim ? statusBadge("Admin claim", "purple") : statusBadge("Student", "gray")}
                                {user.disabled ? statusBadge("Disabled", "red") : statusBadge("Enabled", "green")}
                                {user.emailVerified ? statusBadge("Verified", "green") : statusBadge("Unverified", "amber")}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="user-card-title">{user.firestoreProfile?.subscriptionStatus || "None"}</p>
                              <p className="user-helper">{user.firestoreProfile?.planId || "No plan"}</p>
                            </td>
                            <td className="user-body-sm px-4 py-4 align-top">{formatDate(user.lastSignInAt)}</td>
                            <td className="px-4 py-4 text-right align-top">
                              <button
                                type="button"
                                onClick={() => void loadUserDetail(user.uid)}
                                className="user-button-secondary px-3 py-1.5 text-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="user-helper border-t border-gray-200 bg-gray-50 px-4 py-3">
                  Firebase Auth is paginated. Use exact email search to find a user globally; other searches filter only the currently loaded page.
                </div>
              </section>

              <aside className="space-y-4">
                <div className="user-card p-4">
                  <h2 className="user-section-title">User Detail</h2>
                  {!selectedUser && (
                    <p className="user-helper mt-2">
                      Select a user to view Firebase Auth and Firestore profile details.
                    </p>
                  )}
                  {detailLoading && <p className="user-helper mt-2">Loading detail...</p>}
                  {selectedUser && !detailLoading && (
                    <UserDetailSections
                      user={selectedUser}
                      actionLoading={supportActionLoading}
                      supportMessage={supportMessage}
                      onSupportAction={(uid, action) => void runSupportAction(uid, action)}
                      statusReason={statusReason}
                      statusMessage={statusMessage}
                      onStatusReasonChange={setStatusReason}
                      onAccountStatusAction={(uid, action) => void runAccountStatusAction(uid, action)}
                    />
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <SidebarProvider>
      <AdminUsersContent />
    </SidebarProvider>
  );
}
