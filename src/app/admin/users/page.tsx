"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value === null || value === undefined || value === "" ? "Not available" : String(value)}
      </p>
    </div>
  );
}

function JsonPanel({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {data ? (
        <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No data available.</p>
      )}
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
  const [error, setError] = useState<string | null>(null);

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

  const loadUserDetail = async (uid: string) => {
    if (!currentUser) return;
    setDetailLoading(true);
    setError(null);

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

  useEffect(() => {
    void loadUsers({ search: activeSearch });
  }, [activeSearch, loadUsers]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSelectedUser(null);
    setPageTokens([]);
    setActiveSearch(search.trim());
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
    <div className="min-h-screen bg-white overflow-x-hidden">
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

        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">Admin</p>
                <h1 className="mt-1 text-2xl font-bold text-gray-950">User Management</h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Read-only Firebase Auth and Firestore user overview. Sensitive account changes should be added as audited server actions in a later phase.
                </p>
              </div>
              <form onSubmit={submitSearch} className="flex w-full gap-2 sm:max-w-lg">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search visible page, UID, or exact email"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  Search
                </button>
              </form>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-950">Users</h2>
                    <p className="text-xs text-gray-500">{loading ? "Loading..." : `${users.length} shown`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goPrevious}
                      disabled={pageTokens.length === 0 || loading}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!nextPageToken || loading || Boolean(activeSearch)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Access</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subscription</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last sign-in</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.uid} className={selectedUser?.uid === user.uid ? "bg-purple-50/50" : ""}>
                            <td className="px-4 py-4 align-top">
                              <p className="font-semibold text-gray-950">{user.displayName || user.firestoreProfile?.fullName || "Unnamed user"}</p>
                              <p className="mt-1 text-gray-600">{user.email || "No email"}</p>
                              <p className="mt-1 max-w-56 truncate font-mono text-xs text-gray-400">{user.uid}</p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap gap-2">
                                {user.adminClaim ? statusBadge("Admin claim", "purple") : statusBadge("Student", "gray")}
                                {user.disabled ? statusBadge("Disabled", "red") : statusBadge("Enabled", "green")}
                                {user.emailVerified ? statusBadge("Verified", "green") : statusBadge("Unverified", "amber")}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top text-gray-700">
                              <p className="font-medium">{user.firestoreProfile?.subscriptionStatus || "None"}</p>
                              <p className="text-xs text-gray-500">{user.firestoreProfile?.planId || "No plan"}</p>
                            </td>
                            <td className="px-4 py-4 align-top text-gray-700">{formatDate(user.lastSignInAt)}</td>
                            <td className="px-4 py-4 text-right align-top">
                              <button
                                type="button"
                                onClick={() => void loadUserDetail(user.uid)}
                                className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
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
              </section>

              <aside className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h2 className="text-sm font-semibold text-gray-950">User Detail</h2>
                  {!selectedUser && (
                    <p className="mt-2 text-sm text-gray-500">
                      Select a user to view Firebase Auth and Firestore profile details.
                    </p>
                  )}
                  {detailLoading && <p className="mt-2 text-sm text-gray-500">Loading detail...</p>}
                  {selectedUser && !detailLoading && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="break-words text-lg font-bold text-gray-950">
                          {selectedUser.displayName || selectedUser.firestoreProfile?.fullName || "Unnamed user"}
                        </h3>
                        <p className="break-words text-sm text-gray-600">{selectedUser.email || "No email"}</p>
                        <p className="mt-1 break-all font-mono text-xs text-gray-400">{selectedUser.uid}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <Field label="Auth disabled" value={selectedUser.disabled} />
                        <Field label="Email verified" value={selectedUser.emailVerified} />
                        <Field label="Admin claim" value={selectedUser.adminClaim} />
                        <Field label="Providers" value={selectedUser.providerIds.join(", ") || null} />
                        <Field label="Created" value={formatDate(selectedUser.createdAt)} />
                        <Field label="Last sign-in" value={formatDate(selectedUser.lastSignInAt)} />
                        <Field label="Account status" value={selectedUser.firestoreProfile?.accountStatus} />
                        <Field label="Subscription" value={selectedUser.firestoreProfile?.subscriptionStatus} />
                        <Field label="Total attempts" value={selectedUser.firestoreProfile?.totalAttempts} />
                      </div>
                    </div>
                  )}
                </div>

                {selectedUser && !detailLoading && (
                  <>
                    <JsonPanel title="Custom Claims" data={selectedUser.customClaims} />
                    <JsonPanel title="Access" data={selectedUser.firestoreDocument.access} />
                    <JsonPanel title="Auth Profile" data={selectedUser.firestoreDocument.auth} />
                    <JsonPanel title="Billing Summary" data={selectedUser.firestoreDocument.billing} />
                    <JsonPanel title="Entitlements" data={selectedUser.firestoreDocument.entitlements} />
                    <JsonPanel title="Referral Summary" data={selectedUser.firestoreDocument.referralSummary} />
                    <JsonPanel title="Stats" data={selectedUser.firestoreDocument.stats} />
                  </>
                )}
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
