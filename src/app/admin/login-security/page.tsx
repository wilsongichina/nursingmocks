"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminLoginSecurity, AdminLoginSecurityOverviewUser } from "@/lib/admin/login-security";

type LoginSecurityResponse = {
  requestId: string;
  matches?: UserMatch[];
  targetUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    disabled: boolean;
    emailVerified: boolean;
  };
  loginSecurity: AdminLoginSecurity;
};

type UserMatch = {
  uid: string;
  email: string | null;
  displayName: string | null;
  fullName: string | null;
};

type UserSuggestionsResponse = {
  matches?: UserMatch[];
};

type LoginSecurityOverviewResponse = {
  requestId: string;
  users: AdminLoginSecurityOverviewUser[];
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

function formatPlace(location: AdminLoginSecurity["events"][number]["location"]) {
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not available";
}

function formatDevice(device: AdminLoginSecurity["events"][number]["device"]) {
  const parts = [device.browser, device.os, device.deviceType].filter(Boolean);
  return parts.length ? parts.join(" / ") : "Not available";
}

function formatPersonName(value: string | null | undefined) {
  const cleaned = value?.replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  if (cleaned.includes("@")) return cleaned.toLowerCase();
  return cleaned
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (["RN", "LPN", "ATI", "TEAS", "HESI"].includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function userDisplayName(user: { displayName?: string | null; fullName?: string | null; email?: string | null }) {
  return formatPersonName(user.displayName) || formatPersonName(user.fullName) || user.email?.toLowerCase() || "Unnamed User";
}

function statusBadge(label: string, tone: "green" | "red" | "amber" | "gray") {
  const tones = {
    green: "user-pill-green",
    red: "user-pill-red",
    amber: "user-pill-amber",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return <span className={`user-pill ${tones[tone]}`}>{label}</span>;
}

function signalTone(status: AdminLoginSecurity["sharingSignals"]["status"]) {
  if (status === "high_attention") return "red";
  if (status === "review") return "amber";
  if (status === "watch") return "amber";
  return "green";
}

function signalLabel(status: AdminLoginSecurity["sharingSignals"]["status"]) {
  const labels = {
    normal: "Normal",
    watch: "Watch",
    review: "Review",
    high_attention: "High Attention",
  };
  return labels[status];
}

function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="user-card p-4">
      <p className="user-label">{label}</p>
      <p className="user-stat-value mt-2">{value}</p>
      <p className="user-helper mt-1">{helper}</p>
    </div>
  );
}

function SharingSignalsPanel({ signals }: { signals: AdminLoginSecurity["sharingSignals"] }) {
  return (
    <section className="user-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div>
          <h2 className="user-section-title">Account Sharing Signals</h2>
          <p className="user-helper">Conservative indicators for manual review only. These signals do not automatically block the account.</p>
        </div>
        {statusBadge(signalLabel(signals.status), signalTone(signals.status))}
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-4">
        <StatCard label="IP Changes" value={signals.uniqueIpHashes30d} helper={`${signals.uniqueIpHashes7d} in 7 days, ${signals.uniqueIpHashes24h} in 24 hours`} />
        <StatCard label="Device Changes" value={signals.uniqueDevices30d} helper={`${signals.uniqueDevices7d} in 7 days, ${signals.uniqueDevices24h} in 24 hours`} />
        <StatCard label="Location Changes" value={signals.uniqueLocations30d} helper={`${signals.uniqueCountries30d} unique countries in 30 days`} />
        <StatCard label="Recent Switching" value={signals.recentIpSwitches24h + signals.recentDeviceSwitches24h} helper={signals.lastSwitchAt ? `Last switch ${formatDate(signals.lastSwitchAt)}` : "No recent switch detected"} />
      </div>
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)]">
          <div>
            <p className="user-label">Signals Found</p>
            <div className="mt-2 space-y-2">
              {signals.reasons.map((reason) => (
                <div key={reason} className="user-alert user-alert-warning py-2">
                  <span className="user-alert-icon" aria-hidden="true">!</span>
                  <p className="user-helper">{reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="user-detail-surface p-3">
            <p className="user-label">Recommendation</p>
            <p className="user-helper mt-2">{signals.recommendation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewPanel({
  users,
  loading,
  error,
  onRefresh,
  onSelectUser,
}: {
  users: AdminLoginSecurityOverviewUser[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectUser: (uid: string) => void;
}) {
  return (
    <section className="user-card mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div>
          <h2 className="user-section-title">Auto-Detected Accounts</h2>
          <p className="user-helper">Users with stored Watch, Review, or High Attention login-security snapshots.</p>
        </div>
        <button type="button" onClick={onRefresh} className="user-button-secondary px-3 py-1.5 text-xs">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {error && (
        <div className="user-alert user-alert-error m-4" role="alert">
          <span className="user-alert-icon" aria-hidden="true">x</span>
          <div>
            <p className="user-card-title">Could not load auto-detected accounts</p>
            <p className="user-helper mt-1">{error}</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="user-label px-4 py-3 text-left">User</th>
              <th className="user-label px-4 py-3 text-left">Status</th>
              <th className="user-label px-4 py-3 text-left">30-Day Signals</th>
              <th className="user-label px-4 py-3 text-left">Last Evaluated</th>
              <th className="user-label px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="user-helper px-4 py-8 text-center">Loading detected accounts...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="user-helper px-4 py-8 text-center">No flagged login-security snapshots yet.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-4 py-4 align-top">
                    <p className="user-card-title">{userDisplayName(user)}</p>
                    <p className="user-helper mt-1">{user.email?.toLowerCase() || "No email"}</p>
                    <p className="mt-1 max-w-72 truncate font-mono text-xs text-gray-400">{user.uid}</p>
                    {user.reasons[0] && <p className="user-helper mt-2 max-w-xl">{user.reasons[0]}</p>}
                  </td>
                  <td className="px-4 py-4 align-top">{statusBadge(signalLabel(user.status), signalTone(user.status))}</td>
                  <td className="user-body-sm px-4 py-4 align-top">
                    <p>{user.uniqueIpHashes30d} IP hashes</p>
                    <p>{user.uniqueDevices30d} devices</p>
                    <p>{user.uniqueCountries30d} countries</p>
                    <p>{user.recentSwitches24h} recent switches</p>
                  </td>
                  <td className="user-body-sm px-4 py-4 align-top">{formatDate(user.lastEvaluatedAt)}</td>
                  <td className="px-4 py-4 text-right align-top">
                    <button type="button" onClick={() => onSelectUser(user.uid)} className="user-button-secondary px-3 py-1.5 text-xs">
                      View Activity
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminLoginSecurityContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LoginSecurityResponse | null>(null);
  const [matches, setMatches] = useState<NonNullable<LoginSecurityResponse["matches"]>>([]);
  const [suggestions, setSuggestions] = useState<UserMatch[]>([]);
  const [overviewUsers, setOverviewUsers] = useState<AdminLoginSecurityOverviewUser[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLoginSecurity = useCallback(
    async (value: string) => {
      if (!currentUser) return;
      const trimmed = value.trim();
      if (!trimmed) {
        setError("Enter a user name, UID, or exact email address.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ q: trimmed });
        const response = await fetch(`/api/admin/login-security?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await response.json().catch(() => ({}))) as Partial<LoginSecurityResponse> & { error?: string; requestId?: string };
        if (data.matches?.length) {
          setResult(null);
          setMatches(data.matches);
          setRequestId(data.requestId || null);
          return;
        }
        if (!response.ok || !data.loginSecurity || !data.targetUser) {
          throw new Error(data.error || "Could not load login security activity");
        }

        setResult(data as LoginSecurityResponse);
        setMatches([]);
        setRequestId(data.requestId || null);
      } catch (loadError) {
        setResult(null);
        setMatches([]);
        setRequestId(null);
        setError(loadError instanceof Error ? loadError.message : "Could not load login security activity");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadLoginSecurity(query);
  };

  const loadOverview = useCallback(async () => {
    if (!currentUser) return;
    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/login-security?overview=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as Partial<LoginSecurityOverviewResponse> & { error?: string };
      if (!response.ok || !data.users) throw new Error(data.error || "Could not load auto-detected accounts");
      setOverviewUsers(data.users);
    } catch (overviewLoadError) {
      setOverviewError(overviewLoadError instanceof Error ? overviewLoadError.message : "Could not load auto-detected accounts");
    } finally {
      setOverviewLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!currentUser) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ q: trimmed, suggest: "1" });
        const response = await fetch(`/api/admin/login-security?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await response.json().catch(() => ({}))) as UserSuggestionsResponse;
        if (!cancelled && response.ok) {
          setSuggestions(data.matches ?? []);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentUser, query]);

  const security = result?.loginSecurity ?? null;

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
              <span className="font-medium">Login Security</span>
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
                  <h1 className="user-page-title mt-1">Login Security</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Review recent login activity for a specific user using privacy-preserving IP hashes, device summaries, and coarse location signals.
                  </p>
                </div>
              </div>
            </header>

            <form onSubmit={submitSearch} className="user-search-panel mb-6 max-w-3xl">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <label>
                  <span className="user-label">User Name, UID, or Exact Email</span>
                  <input
                    type="search"
                    list="login-security-user-suggestions"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="user-field mt-2"
                    placeholder="Jane Student, student@example.com, or Firebase UID"
                  />
                  <datalist id="login-security-user-suggestions">
                    {suggestions.map((suggestion) => (
                      <option
                        key={suggestion.uid}
                        value={suggestion.email || suggestion.displayName || suggestion.fullName || suggestion.uid}
                        label={`${userDisplayName(suggestion)}${suggestion.email ? ` - ${suggestion.email.toLowerCase()}` : ""}`}
                      />
                    ))}
                  </datalist>
                </label>
                <button type="submit" disabled={loading} className="user-button-primary md:min-w-36 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? "Loading..." : "View Activity"}
                </button>
              </div>
              <p className="user-helper">
                Location is usually unavailable on localhost. Deployed environments can provide country, region, and city through hosting or CDN headers.
              </p>
            </form>

            {error && (
              <div className="user-alert user-alert-error mb-4" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Could not load login activity</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="user-alert user-alert-warning mb-6">
                <span className="user-alert-icon" aria-hidden="true">!</span>
                <div>
                  <p className="user-card-title">Search for a user</p>
                  <p className="user-helper mt-1">Enter a name, UID, or exact email to review that user's latest login activity.</p>
                </div>
              </div>
            )}

            <OverviewPanel
              users={overviewUsers}
              loading={overviewLoading}
              error={overviewError}
              onRefresh={() => void loadOverview()}
              onSelectUser={(uid) => {
                setQuery(uid);
                void loadLoginSecurity(uid);
              }}
            />

            {matches.length > 0 && (
              <section className="user-card mb-6 overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="user-section-title">Select User</h2>
                  <p className="user-helper">More than one user matched your search. Choose the correct account to view login activity.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {matches.map((match) => (
                    <button
                      key={match.uid}
                      type="button"
                      onClick={() => {
                        setQuery(match.email || match.uid);
                        void loadLoginSecurity(match.uid);
                      }}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-purple-50"
                    >
                      <span>
                        <span className="user-card-title block">{userDisplayName(match)}</span>
                        <span className="user-helper mt-1 block">{match.email?.toLowerCase() || "No email"}</span>
                        <span className="mt-1 block break-all font-mono text-xs text-gray-400">{match.uid}</span>
                      </span>
                      <span className="user-button-secondary px-3 py-1.5 text-xs">View Activity</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {result && security && (
              <div className="space-y-6">
                <section className="user-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="user-section-title">{userDisplayName(result.targetUser)}</h2>
                      <p className="user-body-sm mt-1 break-words">{result.targetUser.email?.toLowerCase() || "No email"}</p>
                      <p className="mt-1 break-all font-mono text-xs text-gray-400">{result.targetUser.uid}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.targetUser.disabled ? statusBadge("Disabled", "red") : statusBadge("Enabled", "green")}
                      {result.targetUser.emailVerified ? statusBadge("Verified", "green") : statusBadge("Unverified", "amber")}
                    </div>
                  </div>
                  {requestId && <p className="user-helper mt-3">Audit request: {requestId}</p>}
                </section>

                <section className="grid gap-3 lg:grid-cols-5">
                  <StatCard label="Latest Login" value={formatDate(security.summary.latestLoginAt)} helper="Most recent recorded login event." />
                  <StatCard label="Events Reviewed" value={security.summary.totalEventsReviewed} helper="Recent login history loaded." />
                  <StatCard label="Unique IP Hashes" value={security.summary.uniqueIpHashes} helper="Privacy-safe IP comparison." />
                  <StatCard label="Unique Devices" value={security.summary.uniqueDevices} helper="Browser, OS, and device profiles." />
                  <StatCard label="Unique Locations" value={security.summary.uniqueLocations} helper="Coarse city, region, and country." />
                </section>

                <SharingSignalsPanel signals={security.sharingSignals} />

                {security.summary.flags.length > 0 && (
                  <section className="space-y-2">
                    {security.summary.flags.map((flag) => (
                      <div key={flag} className="user-alert user-alert-warning">
                        <span className="user-alert-icon" aria-hidden="true">!</span>
                        <p className="user-helper">{flag}</p>
                      </div>
                    ))}
                  </section>
                )}

                <section className="user-card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                    <div>
                      <h2 className="user-section-title">Recent Login Activity</h2>
                      <p className="user-helper">Read-only login events from `user_login_events`.</p>
                    </div>
                    <button type="button" onClick={() => void loadLoginSecurity(query)} className="user-button-secondary px-3 py-1.5 text-xs">
                      Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="user-label px-4 py-3 text-left">Login Time</th>
                          <th className="user-label px-4 py-3 text-left">Device</th>
                          <th className="user-label px-4 py-3 text-left">Location</th>
                          <th className="user-label px-4 py-3 text-left">IP Hash</th>
                          <th className="user-label px-4 py-3 text-left">Provider</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {security.events.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="user-helper px-4 py-8 text-center">
                              No login activity has been recorded for this user yet.
                            </td>
                          </tr>
                        ) : (
                          security.events.map((event) => (
                            <tr key={event.eventId}>
                              <td className="user-body-sm px-4 py-4 align-top">{formatDate(event.loginAt)}</td>
                              <td className="user-body-sm px-4 py-4 align-top">{formatDevice(event.device)}</td>
                              <td className="user-body-sm px-4 py-4 align-top">{formatPlace(event.location)}</td>
                              <td className="px-4 py-4 align-top font-mono text-xs text-gray-500">{event.ipHashPreview || "Not available"}</td>
                              <td className="user-body-sm px-4 py-4 align-top">{event.provider || "Not available"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLoginSecurityPage() {
  return (
    <SidebarProvider>
      <AdminLoginSecurityContent />
    </SidebarProvider>
  );
}
