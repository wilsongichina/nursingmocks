"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { auth } from "@/lib/firebase";
import { buildProfileView } from "@/lib/profile-view-model";
import type { UserDocument } from "@/types/user-document";
import {
  ensureUserDocumentOnRegister,
  subscribeUserDocument,
  updateUserPreferenceFields,
  updateUserProfileContact,
} from "@/lib/user-document-firestore";

type TabKey = "overview" | "account" | "access" | "referrals" | "security";

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "Europe/London",
  "UTC",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
  "America/Toronto",
  "America/Vancouver",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Copenhagen",
  "Europe/Helsinki",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Vienna",
  "Europe/Budapest",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Kiev",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Asia/Jerusalem",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Tehran",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "Pacific/Fiji",
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [accountDisplayName, setAccountDisplayName] = useState("");
  const [accountFullName, setAccountFullName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountTimezone, setAccountTimezone] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaveMessage, setAccountSaveMessage] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const ensureAttemptedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) return;
    setDocError(null);
    setHasSnapshot(false);
    ensureAttemptedRef.current = false;
    const unsub = subscribeUserDocument(
      currentUser.uid,
      async (data) => {
        if (data === null && !ensureAttemptedRef.current) {
          ensureAttemptedRef.current = true;
          try {
            await ensureUserDocumentOnRegister(currentUser, {
              fullName:
                currentUser.displayName?.trim() ||
                currentUser.email?.split("@")[0] ||
                "User",
            });
          } catch (e) {
            setDocError(
              e instanceof Error ? e.message : "Could not create profile document"
            );
          }
        }
        setUserDoc(data);
        setHasSnapshot(true);
      },
      (err) => {
        setDocError(err.message);
        setHasSnapshot(true);
      }
    );
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!userDoc) return;
    setAccountDisplayName(userDoc.profile?.display_name ?? "");
    setAccountFullName(userDoc.full_name ?? "");
    setAccountPhone(userDoc.phone_e164 ?? "");
    setAccountTimezone(userDoc.profile?.timezone ?? "America/New_York");
  }, [userDoc]);

  const view = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return buildProfileView(userDoc, currentUser);
  }, [userDoc, currentUser]);

  const prefs = userDoc?.preferences;

  const handleSaveAccount = useCallback(async () => {
    if (!currentUser || !userDoc) return;
    setAccountSaveMessage(null);
    setAccountSaving(true);
    try {
      await updateUserProfileContact(currentUser.uid, {
        full_name: accountFullName.trim(),
        display_name: accountDisplayName.trim(),
        phone_e164: accountPhone.trim() || null,
        timezone: accountTimezone || "America/New_York",
      });
      const u = auth.currentUser;
      if (u) {
        await updateProfile(u, { displayName: accountDisplayName.trim() });
      }
      setAccountSaveMessage("Saved.");
    } catch (e) {
      setAccountSaveMessage(
        e instanceof Error ? e.message : "Could not save profile"
      );
    } finally {
      setAccountSaving(false);
    }
  }, [
    currentUser,
    userDoc,
    accountDisplayName,
    accountFullName,
    accountPhone,
    accountTimezone,
  ]);

  const togglePref = useCallback(
    async (patch: Parameters<typeof updateUserPreferenceFields>[1]) => {
      if (!currentUser || !userDoc) return;
      setPrefError(null);
      try {
        await updateUserPreferenceFields(currentUser.uid, patch);
      } catch (e) {
        setPrefError(e instanceof Error ? e.message : "Could not update settings");
      }
    },
    [currentUser, userDoc]
  );

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="profile-loading-wrap">
          <div className="profile-loading">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        </div>
        <style jsx>{`
          .profile-loading-wrap {
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .profile-loading {
            text-align: center;
            color: #7a819c;
          }
          .spinner {
            width: 44px;
            height: 44px;
            margin: 0 auto 12px;
            border: 4px solid rgba(106, 92, 255, 0.2);
            border-top-color: #6a5cff;
            border-radius: 999px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Layout>
    );
  }

  if (!currentUser || !view) {
    return null;
  }

  if (!hasSnapshot && !docError) {
    return (
      <Layout>
        <div className="profile-loading-wrap">
          <div className="profile-loading">
            <div className="spinner" />
            <p>Loading profile...</p>
          </div>
        </div>
        <style jsx>{`
          .profile-loading-wrap {
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .profile-loading {
            text-align: center;
            color: #7a819c;
          }
          .spinner {
            width: 44px;
            height: 44px;
            margin: 0 auto 12px;
            border: 4px solid rgba(106, 92, 255, 0.2);
            border-top-color: #6a5cff;
            border-radius: 999px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="page-inner">
          {docError ? (
            <p className="profile-doc-error" role="alert">
              Profile data: {docError}
            </p>
          ) : null}
          <header className="page-header">
            <div className="page-header-grid">
              <div>
                <h1>User Profile Dashboard</h1>
                <p>
                  Manage your profile, access, referrals, and security from one
                  clean account area.
                </p>
                <div className="header-pills">
                  <span className="pill">Role: {view.roleLabel}</span>
                  <span className="pill pill-neutral">
                    Timezone: {view.timezone}
                  </span>
                  <span className="pill pill-neutral">Locale: {view.locale}</span>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="btn-ghost header-btn"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to dashboard
                </button>
                <button
                  className="btn-primary header-btn"
                  type="button"
                  onClick={() => router.push("/teas-7-practice")}
                >
                  Start Practice
                </button>
              </div>
            </div>
          </header>

          <div className="layout">
            <aside className="card">
              <div className="card-header">
                <h2>Profile</h2>
                <span className="pill pill-ok">{view.accountStatusLabel}</span>
              </div>
              <hr className="dotted-divider" />
              <div className="profile-hero">
                <div className="profile-row">
                  <div className="profile-avatar">
                    {view.photoURL ? (
                      <Image
                        src={view.photoURL}
                        alt=""
                        width={56}
                        height={56}
                        className="profile-avatar-img"
                        unoptimized
                      />
                    ) : (
                      view.avatarInitial
                    )}
                  </div>
                  <div>
                    <div className="profile-name">{view.displayName}</div>
                    <div className="profile-sub">
                      <span className="pill">Program: {view.focusAreaLabel}</span>
                      <span className="pill">Primary exam: {view.primaryExamLabel}</span>
                      <span className="pill pill-ok">
                        Subscription: {view.subscriptionStatusLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="summary-list">
                  <div className="summary-item">
                    <div>
                      <b>Email</b>
                      <span>Primary login email</span>
                    </div>
                    <div>{view.email}</div>
                  </div>
                  <div className="summary-item">
                    <div>
                      <b>Current plan</b>
                      <span>Active subscription snapshot</span>
                    </div>
                    <div>
                      {view.planLabel} — {view.billingIntervalLabel}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div>
                      <b>Access until</b>
                      <span>Renew manually before access expires</span>
                    </div>
                    <div>{view.accessUntilLabel}</div>
                  </div>
                  <div className="summary-item">
                    <div>
                      <b>Referral code</b>
                      <span>Share to invite friends</span>
                    </div>
                    {view.referralLink ? (
                      <a href={view.referralLink} target="_blank" rel="noreferrer">
                        {view.referralCode}
                      </a>
                    ) : (
                      <div>{view.referralCode}</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            <main>
              <section className="stats">
                <div className="stat">
                  <div className="num-circle">{view.stats.attempts}</div>
                  <div>
                    <div className="label">Total Attempts</div>
                    <div className="hint">Your overall practice activity</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="num-circle">{view.stats.answered}</div>
                  <div>
                    <div className="label">Questions Answered</div>
                    <div className="hint">Across practice sessions</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="num-circle">{view.stats.accuracy}%</div>
                  <div>
                    <div className="label">Overall Accuracy</div>
                    <div className="hint">Average score</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="num-circle">{view.stats.streak}</div>
                  <div>
                    <div className="label">Streak (Days)</div>
                    <div className="hint">Consecutive days of activity</div>
                  </div>
                </div>
              </section>

              <nav className="tabs">
                {(["overview", "account", "access", "referrals", "security"] as TabKey[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`tab ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                      type="button"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </nav>

              <div className="card">
                <div className="content">
                  {activeTab === "overview" && (
                    <>
                      <h3>Overview</h3>
                      <p className="panel-desc">
                        Quick snapshot of account, access, referrals, and recent
                        activity.
                      </p>
                      <div className="grid">
                        <div className="summary-item">
                          <div>
                            <b>Created</b>
                            <span>Account creation date</span>
                          </div>
                          <div>{view.createdAt}</div>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Updated</b>
                            <span>Latest profile update</span>
                          </div>
                          <div>{view.updatedAt}</div>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Last practice activity</b>
                            <span>Latest recorded attempt</span>
                          </div>
                          <div>{view.lastAttemptAt}</div>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Timezone</b>
                            <span>Current timezone profile</span>
                          </div>
                          <div>{view.timezone}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "account" && (
                    <>
                      <h3>Account</h3>
                      <p className="panel-desc">
                        Name and phone are saved to your Firestore user profile.
                        Email and read-only fields come from your account record.
                      </p>
                      <div className="grid">
                        <div className="field">
                          <label>Display name</label>
                          <input
                            value={accountDisplayName}
                            onChange={(e) => setAccountDisplayName(e.target.value)}
                            disabled={!userDoc}
                          />
                        </div>
                        <div className="field">
                          <label>Full name</label>
                          <input
                            value={accountFullName}
                            onChange={(e) => setAccountFullName(e.target.value)}
                            disabled={!userDoc}
                          />
                        </div>
                        <div className="field">
                          <label>Email</label>
                          <input value={view.email} readOnly />
                        </div>
                        <div className="field">
                          <label>Phone</label>
                          <input
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            disabled={!userDoc}
                            placeholder="E.164 e.g. +15551234567"
                          />
                        </div>
                        <div className="field">
                          <label>Timezone</label>
                          <select
                            value={accountTimezone}
                            onChange={(e) => setAccountTimezone(e.target.value)}
                            disabled={!userDoc}
                          >
                            <option value="">Select timezone</option>
                            {TIMEZONE_OPTIONS.map((timezone) => (
                              <option key={timezone} value={timezone}>
                                {timezone}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Primary exam</label>
                          <input value={view.primaryExamLabel} readOnly />
                        </div>
                      </div>
                      <div className="account-actions">
                        <button
                          className="btn-primary"
                          type="button"
                          disabled={!userDoc || accountSaving}
                          onClick={() => void handleSaveAccount()}
                        >
                          {accountSaving ? "Saving…" : "Save changes"}
                        </button>
                        {accountSaveMessage ? (
                          <span className="account-save-msg">{accountSaveMessage}</span>
                        ) : null}
                      </div>
                    </>
                  )}

                  {activeTab === "access" && (
                    <>
                      <h3>Access</h3>
                      <p className="panel-desc">
                        Entitlements from your user document in Firestore (
                        <code>entitlements.*</code>).
                      </p>
                      <div className="grid">
                        {view.entitlements.map((row) => (
                          <div className="summary-item" key={row.key}>
                            <div>
                              <b>{row.title}</b>
                              <span>{row.description}</span>
                            </div>
                            {row.included ? (
                              <span className="pill pill-ok">Included</span>
                            ) : (
                              <span className="pill pill-bad">Locked</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === "referrals" && (
                    <>
                      <h3>Referrals</h3>
                      <p className="panel-desc">
                        Share your referral link and monitor referral summary.
                      </p>
                      <div className="summary-item">
                        <div>
                          <b>Your referral link</b>
                          <span>Share with friends to earn rewards</span>
                        </div>
                        {view.referralLink ? (
                          <a href={view.referralLink} target="_blank" rel="noreferrer">
                            {view.referralCode}
                          </a>
                        ) : (
                          <div>{view.referralCode}</div>
                        )}
                      </div>
                      <div className="grid">
                        <div className="summary-item">
                          <div>
                            <b>Total referrals</b>
                            <span>Invites attributed to code</span>
                          </div>
                          <span className="pill pill-neutral">
                            {view.referralTotals.totalReferrals}
                          </span>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Total converted</b>
                            <span>Qualified purchases</span>
                          </div>
                          <span className="pill pill-ok">
                            {view.referralTotals.totalConverted}
                          </span>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Total earned</b>
                            <span>User-facing earning summary</span>
                          </div>
                          <span className="pill">
                            {view.referralTotals.commissionEarnedFormatted}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "security" && (
                    <>
                      <h3>Security</h3>
                      <p className="panel-desc">
                        Auth state from your user document; preferences sync to
                        Firestore when toggled.
                      </p>
                      <div className="grid">
                        <div className="summary-item">
                          <div>
                            <b>Sign-in method</b>
                            <span>Configured auth provider</span>
                          </div>
                          <span className="pill pill-neutral">
                            {view.security.providerLabel}
                          </span>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Email verification</b>
                            <span>Primary email state</span>
                          </div>
                          <span
                            className={
                              view.security.emailVerified ? "pill pill-ok" : "pill pill-warn"
                            }
                          >
                            {view.security.emailVerified ? "Verified" : "Not verified"}
                          </span>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>Phone verification</b>
                            <span>Phone auth state</span>
                          </div>
                          <span
                            className={
                              view.security.phoneVerified ? "pill pill-ok" : "pill pill-warn"
                            }
                          >
                            {view.security.phoneVerified ? "Verified" : "Not verified"}
                          </span>
                        </div>
                        <div className="summary-item">
                          <div>
                            <b>MFA</b>
                            <span>Two-factor authentication</span>
                          </div>
                          <span
                            className={
                              view.security.mfaEnabled ? "pill pill-ok" : "pill pill-neutral"
                            }
                          >
                            {view.security.mfaEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>

                      {prefError ? (
                        <p className="profile-doc-error" role="alert">
                          {prefError}
                        </p>
                      ) : null}

                      <div className="toggles">
                        <button
                          className={`switch ${prefs?.dark_mode ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({ dark_mode: !prefs?.dark_mode })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          Dark mode
                        </button>
                        <button
                          className={`switch ${prefs?.email_marketing_opt_in ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({
                              email_marketing_opt_in: !prefs?.email_marketing_opt_in,
                            })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          Email updates
                        </button>
                        <button
                          className={`switch ${prefs?.notifications?.email ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({
                              notif_email: !prefs?.notifications?.email,
                            })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          Email notifications
                        </button>
                        <button
                          className={`switch ${prefs?.notifications?.push ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({
                              notif_push: !prefs?.notifications?.push,
                            })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          Push notifications
                        </button>
                        <button
                          className={`switch ${prefs?.notifications?.sms ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({
                              notif_sms: !prefs?.notifications?.sms,
                            })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          SMS notifications
                        </button>
                        <button
                          className={`switch ${prefs?.defaults?.show_explanations ? "on" : ""}`}
                          onClick={() =>
                            void togglePref({
                              show_explanations: !prefs?.defaults?.show_explanations,
                            })
                          }
                          type="button"
                          disabled={!userDoc}
                        >
                          Show explanations
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          --bg-page: #f5f6fb;
          --bg-card: #ffffff;
          --accent: #6a5cff;
          --accent-2: #4f46e5;
          --text-main: #202437;
          --text-muted: #7a819c;
          --text-soft: #a0a5bf;
          --border-subtle: #e0e3f0;
          --ok: #2baa60;
          --warn: #b45309;
          --bad: #b91c1c;
          min-height: 100vh;
          background: radial-gradient(
              circle at top,
              rgba(106, 92, 255, 0.08),
              transparent 55%
            ),
            var(--bg-page);
        }
        .profile-doc-error {
          color: var(--bad);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .profile-avatar-img {
          border-radius: 999px;
          object-fit: cover;
        }
        .account-actions {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .account-save-msg {
          font-size: 13px;
          color: var(--text-muted);
        }
        .page-inner {
          max-width: 1220px;
          margin: 0 auto;
          padding: 18px 16px 56px;
          color: var(--text-main);
        }
        .page-header-grid {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        h1 {
          font-size: 30px;
          font-weight: 800;
        }
        p {
          color: var(--text-muted);
          margin-top: 8px;
        }
        .header-pills,
        .header-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .layout {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 18px;
          align-items: start;
        }
        .card {
          background: var(--bg-card);
          border-radius: 16px;
          box-shadow: 0 18px 45px rgba(23, 35, 79, 0.08);
          overflow: hidden;
        }
        .card-header {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dotted-divider {
          border: 0;
          border-top: 1px dashed var(--border-subtle);
        }
        .profile-hero {
          padding: 16px;
        }
        .profile-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 800;
          background: linear-gradient(160deg, var(--accent), var(--accent-2));
        }
        .profile-name {
          font-size: 22px;
          font-weight: 700;
        }
        .profile-sub {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .summary-list,
        .grid {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }
        .summary-item {
          border-radius: 12px;
          border: 1px dashed rgba(106, 92, 255, 0.22);
          background: rgba(106, 92, 255, 0.04);
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }
        .summary-item b {
          display: block;
        }
        .summary-item span {
          color: var(--text-muted);
          font-size: 12px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .stat {
          border-radius: 12px;
          border: 1px dashed rgba(106, 92, 255, 0.22);
          background: #fff;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .num-circle {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 1px dashed rgba(106, 92, 255, 0.45);
          color: var(--accent-2);
          font-weight: 700;
          background: #fff;
          flex: 0 0 auto;
        }
        .label {
          font-size: 12px;
          font-weight: 700;
        }
        .hint {
          font-size: 12px;
          color: var(--text-muted);
        }
        .tabs {
          margin: 16px 0 10px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .tab,
        .btn-primary,
        .btn-ghost,
        .pill,
        .switch {
          border-radius: 999px;
          font-size: 12px;
        }
        .tab {
          border: 1px solid var(--border-subtle);
          background: #fff;
          padding: 10px 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .tab.active {
          color: var(--accent-2);
          border-color: rgba(106, 92, 255, 0.45);
          background: rgba(106, 92, 255, 0.08);
        }
        .content {
          padding: 16px;
        }
        .content h3 {
          font-size: 22px;
        }
        .panel-desc {
          margin-top: 6px;
          margin-bottom: 8px;
        }
        .field {
          border-radius: 12px;
          border: 1px dashed rgba(106, 92, 255, 0.22);
          background: #fff;
          padding: 12px;
        }
        .field label {
          font-size: 12px;
          color: var(--text-soft);
        }
        .field input,
        .field select {
          margin-top: 8px;
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 10px 12px;
          background: #fff;
        }
        .btn-primary,
        .btn-ghost {
          border: 1px solid transparent;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 700;
        }
        .btn-primary {
          color: #fff;
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
        }
        .btn-ghost {
          border-color: var(--border-subtle);
          color: var(--text-muted);
          background: #fff;
        }
        .header-btn {
          padding: 0 14px;
          height: 30px;
          min-height: 30px;
          line-height: 1;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            filter 0.15s ease,
            background-color 0.15s ease;
        }
        .header-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(23, 35, 79, 0.12);
        }
        .btn-primary.header-btn:hover {
          filter: brightness(1.05);
        }
        .btn-ghost.header-btn:hover {
          background: #f8f9ff;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          border: 1px dashed rgba(106, 92, 255, 0.4);
          padding: 6px 10px;
          color: var(--accent-2);
          background: rgba(106, 92, 255, 0.08);
          font-weight: 700;
          white-space: nowrap;
        }
        .pill-neutral {
          border-color: var(--border-subtle);
          color: var(--text-muted);
          background: #fff;
        }
        .pill-ok {
          border-color: rgba(43, 170, 96, 0.45);
          color: var(--ok);
          background: rgba(43, 170, 96, 0.1);
        }
        .pill-bad {
          border-color: rgba(239, 68, 68, 0.45);
          color: var(--bad);
          background: rgba(239, 68, 68, 0.12);
        }
        .pill-warn {
          border-color: rgba(245, 158, 11, 0.45);
          color: var(--warn);
          background: rgba(245, 158, 11, 0.12);
        }
        .toggles {
          margin-top: 12px;
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .switch {
          border: 1px solid var(--border-subtle);
          padding: 10px 12px;
          text-align: left;
          background: #fff;
          color: var(--text-main);
          cursor: pointer;
          font-weight: 600;
        }
        .switch.on {
          border-color: rgba(106, 92, 255, 0.45);
          color: var(--accent-2);
          background: rgba(106, 92, 255, 0.08);
        }
        @media (max-width: 1100px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 980px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 560px) {
          .page-inner {
            padding: 14px 14px 48px;
          }
          .stats,
          .grid,
          .toggles {
            grid-template-columns: 1fr;
          }
          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </Layout>
  );
}

