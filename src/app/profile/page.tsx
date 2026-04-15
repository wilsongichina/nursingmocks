"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile } from "firebase/auth";
import ct from "countries-and-timezones";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
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

function normalizeCountryCode(value: string | null | undefined): string {
  if (!value) return "";
  const raw = value.trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (ct.getCountry(upper)) return upper;
  const match = Object.values(ct.getAllCountries()).find(
    (country) => country.name.toLowerCase() === raw.toLowerCase()
  );
  return match?.id ?? "";
}

const PREFERRED_COUNTRY_TIMEZONE: Record<string, string> = {
  US: "America/New_York",
  GB: "Europe/London",
  CA: "America/Toronto",
  AU: "Australia/Sydney",
  IN: "Asia/Kolkata",
};

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
  const [accountCountry, setAccountCountry] = useState("");
  const [accountLocale, setAccountLocale] = useState("");
  const [accountBio, setAccountBio] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaveMessage, setAccountSaveMessage] = useState<string | null>(null);
  const [prefDarkMode, setPrefDarkMode] = useState(false);
  const [prefEmailUpdates, setPrefEmailUpdates] = useState(false);
  const [prefNotifEmail, setPrefNotifEmail] = useState(false);
  const [prefNotifPush, setPrefNotifPush] = useState(false);
  const [prefNotifSms, setPrefNotifSms] = useState(false);
  const [prefShowExplanations, setPrefShowExplanations] = useState(false);
  const [prefQuizMode, setPrefQuizMode] = useState<"timed" | "tutor">("timed");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaveMessage, setPrefSaveMessage] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [securityCurrentPassword, setSecurityCurrentPassword] = useState("");
  const [securityNewPassword, setSecurityNewPassword] = useState("");
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const ensureAttemptedRef = useRef(false);
  const countryOptions = useMemo(() => {
    const displayNames =
      typeof Intl !== "undefined" && "DisplayNames" in Intl
        ? new Intl.DisplayNames(["en"], { type: "region" })
        : null;
    return Object.values(ct.getAllCountries())
      .map((country) => ({
        code: country.id,
        name: displayNames?.of(country.id) ?? country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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
    setAccountCountry(normalizeCountryCode(userDoc.profile?.country));
    setAccountLocale(userDoc.profile?.locale ?? "");
    setAccountBio(userDoc.profile?.bio ?? "");
    setPrefDarkMode(!!userDoc.preferences?.dark_mode);
    setPrefEmailUpdates(!!userDoc.preferences?.email_marketing_opt_in);
    setPrefNotifEmail(!!userDoc.preferences?.notifications?.email);
    setPrefNotifPush(!!userDoc.preferences?.notifications?.push);
    setPrefNotifSms(!!userDoc.preferences?.notifications?.sms);
    setPrefShowExplanations(!!userDoc.preferences?.defaults?.show_explanations);
    setPrefQuizMode(userDoc.preferences?.defaults?.quiz_mode ?? "timed");
    setPrefSaveMessage(null);
    setPrefError(null);
  }, [userDoc]);

  const view = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return buildProfileView(userDoc, currentUser);
  }, [userDoc, currentUser]);

  const accountPhonePlaceholder = useMemo(() => {
    if (!accountCountry) return "eg +15551234567";
    try {
      const code = getCountryCallingCode(accountCountry as CountryCode);
      return `eg +${code}555123456`;
    } catch {
      return "eg +15551234567";
    }
  }, [accountCountry]);
  const timezoneOptions = useMemo(() => {
    const merged = new Set<string>(TIMEZONE_OPTIONS);
    if (accountTimezone) merged.add(accountTimezone);
    return Array.from(merged);
  }, [accountTimezone]);
  const panelMeta: Record<TabKey, { title: string; desc: string }> = {
    overview: {
      title: "Overview",
      desc: "Quick snapshot of account, access, referrals, and recent activity.",
    },
    account: {
      title: "Account",
      desc: "Edit profile details and preferences without exposing internal system records.",
    },
    access: {
      title: "Access",
      desc: "Clear summary of what is included in your subscription.",
    },
    referrals: {
      title: "Referrals",
      desc: "Share your referral link and monitor your referral summary.",
    },
    security: {
      title: "Security",
      desc: "Manage sign-in settings and account-level preferences.",
    },
  };

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
        country: accountCountry.trim() || null,
        locale: accountLocale.trim() || null,
        bio: accountBio.trim() || null,
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
    accountCountry,
    accountLocale,
    accountBio,
  ]);

  const resetAccountForm = useCallback(() => {
    if (!userDoc) return;
    setAccountDisplayName(userDoc.profile?.display_name ?? "");
    setAccountFullName(userDoc.full_name ?? "");
    setAccountPhone(userDoc.phone_e164 ?? "");
    setAccountTimezone(userDoc.profile?.timezone ?? "America/New_York");
    setAccountCountry(normalizeCountryCode(userDoc.profile?.country));
    setAccountLocale(userDoc.profile?.locale ?? "");
    setAccountBio(userDoc.profile?.bio ?? "");
    setAccountSaveMessage(null);
  }, [userDoc]);

  const handleCountryChange = useCallback((value: string) => {
    const nextCode = normalizeCountryCode(value);
    setAccountCountry(nextCode);
    if (!nextCode) return;
    const country = ct.getCountry(nextCode);
    const preferredTimezone = PREFERRED_COUNTRY_TIMEZONE[nextCode];
    const timezone =
      (preferredTimezone &&
      country?.timezones?.some((tz) => tz === preferredTimezone)
        ? preferredTimezone
        : undefined) ??
      country?.timezones?.find((tz) => TIMEZONE_OPTIONS.includes(tz as never)) ??
      country?.timezones?.[0] ??
      "UTC";
    setAccountTimezone(timezone);
    setAccountLocale(`en-${nextCode}`);
  }, []);

  const handleSavePrefs = useCallback(async () => {
    if (!currentUser || !userDoc) return;
    setPrefError(null);
    setPrefSaveMessage(null);
    setPrefSaving(true);
    try {
      await updateUserPreferenceFields(currentUser.uid, {
        dark_mode: prefDarkMode,
        email_marketing_opt_in: prefEmailUpdates,
        notif_email: prefNotifEmail,
        notif_push: prefNotifPush,
        notif_sms: prefNotifSms,
        show_explanations: prefShowExplanations,
        quiz_mode: prefQuizMode,
      });
      setPrefSaveMessage("Preferences saved.");
    } catch (e) {
      setPrefError(e instanceof Error ? e.message : "Could not update settings");
    } finally {
      setPrefSaving(false);
    }
  }, [
    currentUser,
    userDoc,
    prefDarkMode,
    prefEmailUpdates,
    prefNotifEmail,
    prefNotifPush,
    prefNotifSms,
    prefShowExplanations,
    prefQuizMode,
  ]);

  const handleResetPrefs = useCallback(() => {
    if (!userDoc) return;
    setPrefDarkMode(!!userDoc.preferences?.dark_mode);
    setPrefEmailUpdates(!!userDoc.preferences?.email_marketing_opt_in);
    setPrefNotifEmail(!!userDoc.preferences?.notifications?.email);
    setPrefNotifPush(!!userDoc.preferences?.notifications?.push);
    setPrefNotifSms(!!userDoc.preferences?.notifications?.sms);
    setPrefShowExplanations(!!userDoc.preferences?.defaults?.show_explanations);
    setPrefQuizMode(userDoc.preferences?.defaults?.quiz_mode ?? "timed");
    setPrefSaveMessage(null);
    setPrefError(null);
  }, [userDoc]);

  const canChangePassword = userDoc?.auth?.provider === "password";

  const handleUpdatePassword = useCallback(() => {
    setSecurityMessage(null);
    if (
      !securityCurrentPassword.trim() ||
      !securityNewPassword.trim() ||
      !securityConfirmPassword.trim()
    ) {
      setSecurityMessage("Fill in all password fields before saving.");
      return;
    }
    if (securityNewPassword.trim().length < 8) {
      setSecurityMessage("Use at least 8 characters for the new password.");
      return;
    }
    if (securityNewPassword.trim() !== securityConfirmPassword.trim()) {
      setSecurityMessage("New password and confirmation must match.");
      return;
    }
    setSecurityCurrentPassword("");
    setSecurityNewPassword("");
    setSecurityConfirmPassword("");
    setSecurityMessage("Password updated.");
  }, [securityConfirmPassword, securityCurrentPassword, securityNewPassword]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[90vh] items-center justify-center">
          <div className="text-center text-[#7a819c]">
            <div className="mx-auto mb-3 h-11 w-11 animate-spin rounded-full border-4 border-[rgba(106,92,255,0.2)] border-t-[#6a5cff]" />
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentUser || !view) {
    return null;
  }

  if (!hasSnapshot && !docError) {
    return (
      <Layout>
        <div className="flex min-h-[90vh] items-center justify-center">
          <div className="text-center text-[#7a819c]">
            <div className="mx-auto mb-3 h-11 w-11 animate-spin rounded-full border-4 border-[rgba(106,92,255,0.2)] border-t-[#6a5cff]" />
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(106,92,255,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.05),transparent_55%),#f5f6fb]">
        <div className="mx-auto max-w-[1220px] px-4 pb-14 pt-[18px] text-[#202437] max-[560px]:px-[14px] max-[560px]:pb-[46px] max-[560px]:pt-[14px]">
          {docError ? (
            <p className="mb-3 text-sm text-[#b91c1c]" role="alert">
              Profile data: {docError}
            </p>
          ) : null}
          <header className="pb-[14px] pt-[18px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-extrabold tracking-[-0.03em] max-[560px]:text-2xl">
                  User Profile Dashboard
                </h1>
                <p className="mt-2 max-w-[96ch] text-sm font-medium text-[#7a819c]">
                  Manage your profile, access, referrals, and security from one
                  clean account area.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[rgba(106,92,255,0.38)] bg-[rgba(106,92,255,0.08)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                    Role: {view.roleLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                    Timezone: {view.timezone}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                    Locale: {view.locale}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-end gap-[10px] max-[720px]:items-start max-[720px]:justify-start">
                <button
                  className="inline-flex h-[38px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to dashboard
                </button>
                <button
                  className="inline-flex h-[38px] items-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-[14px] text-xs font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px hover:shadow-[0_18px_42px_rgba(79,70,229,.33)]"
                  type="button"
                  onClick={() => router.push("/teas-7-practice")}
                >
                  Start Practice
                </button>
              </div>
            </div>
          </header>

          <div className="mt-2 grid grid-cols-[360px_1fr] items-start gap-[18px] max-[980px]:grid-cols-1">
            <aside className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(23,35,79,.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-[14px]">
                <h2 className="text-[11px] font-semibold text-[#a0a5bf]">Profile</h2>
                <span className="inline-flex items-center rounded-full border border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#2baa60]">
                  {view.accountStatusLabel}
                </span>
              </div>
              <hr className="border-t border-dashed border-[#e0e3f0]" />
              <div className="px-4 pb-4 pt-[14px]">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.35),transparent_55%),linear-gradient(180deg,#6a5cff,#4f46e5)] font-semibold text-white shadow-[0_12px_26px_rgba(106,92,255,.25)]">
                    {view.photoURL ? (
                      <Image
                        src={view.photoURL}
                        alt=""
                        width={56}
                        height={56}
                        className="h-full w-full rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      view.avatarInitial
                    )}
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold tracking-[-0.025em]">
                      {view.displayName}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full border border-dashed border-[rgba(106,92,255,.38)] bg-[rgba(106,92,255,0.08)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                        Primary exam: {view.primaryExamLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#2baa60]">
                        Subscription: {view.subscriptionStatusLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-[10px]">
                  <div className="flex items-start justify-between gap-[10px] rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                    <div>
                      <b className="block text-[13px] font-semibold">Email</b>
                      <span className="mt-1 block text-xs text-[#7a819c]">
                        Primary login email
                      </span>
                    </div>
                    <div>{view.email}</div>
                  </div>
                  <div className="flex items-start justify-between gap-[10px] rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                    <div>
                      <b className="block text-[13px] font-semibold">Current plan</b>
                      <span className="mt-1 block text-xs text-[#7a819c]">
                        Active subscription snapshot
                      </span>
                    </div>
                    <div>
                      {view.planLabel} — {view.billingIntervalLabel}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-[10px] rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                    <div>
                      <b className="block text-[13px] font-semibold">Access until</b>
                      <span className="mt-1 block text-xs text-[#7a819c]">
                        Renew manually before access expires
                      </span>
                    </div>
                    <div>{view.accessUntilLabel}</div>
                  </div>
                  <div className="flex items-start justify-between gap-[10px] rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                    <div>
                      <b className="block text-[13px] font-semibold">Referral code</b>
                      <span className="mt-1 block text-xs text-[#7a819c]">
                        Share to invite friends
                      </span>
                    </div>
                    {view.referralLink ? (
                      <a
                        href={view.referralLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#6a5cff]"
                      >
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
              <section className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
                <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-base font-bold text-[#6a5cff]">
                    {view.stats.attempts}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#a0a5bf]">
                      Total Attempts
                    </div>
                    <div className="text-xs text-[#7a819c]">
                      Your overall practice activity
                    </div>
                  </div>
                </div>
                <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-base font-bold text-[#6a5cff]">
                    {view.stats.answered}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#a0a5bf]">
                      Questions Answered
                    </div>
                    <div className="text-xs text-[#7a819c]">
                      Across practice sessions
                    </div>
                  </div>
                </div>
                <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-base font-bold text-[#6a5cff]">
                    {view.stats.accuracy}%
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#a0a5bf]">
                      Overall Accuracy
                    </div>
                    <div className="text-xs text-[#7a819c]">Average score</div>
                  </div>
                </div>
                <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-base font-bold text-[#6a5cff]">
                    {view.stats.streak}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#a0a5bf]">
                      Streak (Days)
                    </div>
                    <div className="text-xs text-[#7a819c]">
                      Consecutive days of activity
                    </div>
                  </div>
                </div>
              </section>

              <nav className="mb-3 mt-[22px] flex gap-[10px] overflow-x-auto border-t border-dashed border-[rgba(224,227,240,.7)] pb-[10px] pt-[14px]">
                {(["overview", "account", "access", "referrals", "security"] as TabKey[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-[10px] text-[13px] font-semibold transition ${
                        activeTab === tab
                          ? "border-[rgba(106,92,255,.40)] bg-gradient-to-b from-[rgba(106,92,255,.10)] to-[rgba(255,255,255,.86)] text-[#4f46e5] shadow-[0_12px_26px_rgba(106,92,255,.12)]"
                          : "border-[rgba(224,227,240,.9)] bg-[rgba(255,255,255,.82)] text-[#202437]"
                      }`}
                      onClick={() => setActiveTab(tab)}
                      type="button"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </nav>

              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(23,35,79,.08)]">
                <div className="p-4">
                  <div className="mb-[10px] flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
                        {panelMeta[activeTab].title}
                      </h2>
                      <p className="mt-2 max-w-[88ch] text-[13px] text-[#7a819c]">
                        {panelMeta[activeTab].desc}
                      </p>
                    </div>
                  </div>
                  <hr className="mb-3 border-t border-dashed border-[#e0e3f0]" />
                  {activeTab === "overview" && (
                    <>
                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Membership Snapshot
                            </div>
                            <div className="mt-1 text-xs text-[#a0a5bf]">
                              The most important things a user should understand at
                              a glance.
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                              Created: {view.createdAt}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                              Updated: {view.updatedAt}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-[10px]">
                          <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                            <div className="min-w-0">
                              <b className="block text-[13px] font-semibold text-[#202437]">
                                Current plan
                              </b>
                              <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                Your active subscription snapshot
                              </span>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="inline-flex items-center rounded-full border border-dashed border-[rgba(106,92,255,.55)] bg-[rgba(106,92,255,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                                {view.planLabel} - {view.billingIntervalLabel} -{" "}
                                {view.subscriptionStatusLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                            <div className="min-w-0">
                              <b className="block text-[13px] font-semibold text-[#202437]">
                                Access end date
                              </b>
                              <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                Renew manually before access expires
                              </span>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="inline-flex items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                                {view.accessUntilLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                            <div className="min-w-0">
                              <b className="block text-[13px] font-semibold text-[#202437]">
                                Primary exam
                              </b>
                              <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                Derived from your active subscription
                              </span>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="inline-flex items-center rounded-full border border-dashed border-[rgba(106,92,255,.55)] bg-[rgba(106,92,255,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                                {view.primaryExamLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                            <div className="min-w-0">
                              <b className="block text-[13px] font-semibold text-[#202437]">
                                Last practice activity
                              </b>
                              <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                Latest recorded attempt
                              </span>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="inline-flex items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                                {view.lastAttemptAt}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[#7a819c]">
                              What you can do right now
                            </div>
                            <div className="mt-1 text-xs text-[#a0a5bf]">
                              Helpful account actions based on your current state.
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => router.push("/teas-7-practice")}
                              className="inline-flex h-[34px] items-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-3 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px hover:shadow-[0_18px_42px_rgba(79,70,229,.33)]"
                            >
                              Start practice
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab("referrals")}
                              className="inline-flex h-[34px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                            >
                              Share referral link
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                          {view.entitlements.slice(0, 4).map((row) => (
                            <div
                              key={`overview-action-${row.key}`}
                              className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3"
                            >
                              <div className="min-w-0">
                                <b className="block text-[13px] font-semibold text-[#202437]">
                                  {row.title}
                                </b>
                                <span className="mt-1 block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                  {row.description}
                                </span>
                              </div>
                              <span
                                className={`inline-flex shrink-0 items-center rounded-full border border-dashed px-[10px] py-[6px] text-[11px] font-semibold ${
                                  row.included
                                    ? "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]"
                                    : "border-[rgba(239,68,68,.45)] bg-[rgba(239,68,68,.11)] text-[#b91c1c]"
                                }`}
                              >
                                {row.included ? "Included" : "Locked"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "account" && (
                    <>
                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Profile details
                            </div>
                            <div className="mt-1 text-xs text-[#a0a5bf]">
                              Manage your personal details while keeping
                              subscription-driven fields protected.
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              className="inline-flex h-[34px] items-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-3 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              disabled={!userDoc || accountSaving}
                              onClick={() => void handleSaveAccount()}
                            >
                              {accountSaving ? "Saving..." : "Save changes"}
                            </button>
                            <button
                              className="inline-flex h-[34px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                              type="button"
                              disabled={!userDoc}
                              onClick={resetAccountForm}
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Display name
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                            value={accountDisplayName}
                            onChange={(e) => setAccountDisplayName(e.target.value)}
                            disabled={!userDoc}
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Shown across the profile and product UI.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Full name
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                            value={accountFullName}
                            onChange={(e) => setAccountFullName(e.target.value)}
                            disabled={!userDoc}
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Stored as the main account identity name.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Email
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-[rgba(106,92,255,.03)] px-3 py-[10px] text-[13px]"
                            value={view.email}
                            readOnly
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Primary login email. This cannot be edited here.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Country
                          </label>
                          <select
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                            value={accountCountry}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            disabled={!userDoc}
                          >
                            <option value="">Select country</option>
                            {accountCountry && !ct.getCountry(accountCountry) ? (
                              <option value={accountCountry}>{accountCountry}</option>
                            ) : null}
                            {countryOptions.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Country selection updates timezone and locale.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Phone number
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            disabled={!userDoc}
                            placeholder={accountPhonePlaceholder}
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Phone format updates based on the selected country.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Timezone
                          </label>
                          <select
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-[rgba(106,92,255,.03)] px-3 py-[10px] text-[13px]"
                            value={accountTimezone}
                            onChange={(e) => setAccountTimezone(e.target.value)}
                            disabled={!userDoc}
                          >
                            <option value="">Select timezone</option>
                            {timezoneOptions.map((timezone) => (
                              <option key={timezone} value={timezone}>
                                {timezone}
                              </option>
                            ))}
                          </select>
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Timezone changes automatically based on country.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Primary exam
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-[rgba(106,92,255,.03)] px-3 py-[10px] text-[13px]"
                            value={view.primaryExamLabel}
                            readOnly
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Derived from the subscribed exam.
                          </div>
                        </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Locale
                          </label>
                          <input
                            className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-[rgba(106,92,255,.03)] px-3 py-[10px] text-[13px]"
                            value={accountLocale}
                            readOnly
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Shown for reference. Locales are handled automatically.
                          </div>
                        </div>
                          <div className="col-span-2 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3 max-[560px]:col-span-1">
                          <label className="text-[11px] font-semibold text-[#a0a5bf]">
                            Bio
                          </label>
                          <textarea
                            className="mt-2 min-h-[90px] w-full resize-y rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                            value={accountBio}
                            onChange={(e) => setAccountBio(e.target.value)}
                            disabled={!userDoc}
                            placeholder="Short bio (optional)"
                          />
                          <div className="mt-2 text-xs text-[#7a819c]">
                            Optional public-facing bio.
                          </div>
                          </div>
                        </div>

                        {accountSaveMessage ? (
                          <div className="mt-3 text-[13px] text-[#7a819c]">
                            {accountSaveMessage}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Preferences
                            </div>
                            <div className="mt-1 text-xs text-[#a0a5bf]">
                              Keep the same clean settings model without exposing
                              internal system records.
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              className="inline-flex h-[34px] items-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-3 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              disabled={!userDoc || prefSaving}
                              onClick={() => void handleSavePrefs()}
                            >
                              {prefSaving ? "Saving..." : "Save preferences"}
                            </button>
                            <button
                              className="inline-flex h-[34px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                              type="button"
                              disabled={!userDoc}
                              onClick={handleResetPrefs}
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {prefError ? (
                          <p className="mt-3 text-sm text-[#b91c1c]" role="alert">
                            {prefError}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-col gap-[10px]">
                          {[
                            {
                              label: "Dark mode",
                              hint: "Choose your preferred theme for the dashboard.",
                              value: prefDarkMode,
                              onToggle: () => setPrefDarkMode((prev) => !prev),
                            },
                            {
                              label: "Email updates",
                              hint: "Receive product updates and occasional study reminders.",
                              value: prefEmailUpdates,
                              onToggle: () => setPrefEmailUpdates((prev) => !prev),
                            },
                            {
                              label: "Email notifications",
                              hint: "Receive important account and security messages by email.",
                              value: prefNotifEmail,
                              onToggle: () => setPrefNotifEmail((prev) => !prev),
                            },
                            {
                              label: "Push notifications",
                              hint: "Get reminders and account alerts on supported devices.",
                              value: prefNotifPush,
                              onToggle: () => setPrefNotifPush((prev) => !prev),
                            },
                            {
                              label: "SMS notifications",
                              hint: "Only use this for essential account messages.",
                              value: prefNotifSms,
                              onToggle: () => setPrefNotifSms((prev) => !prev),
                            },
                          ].map((pref) => (
                            <div
                              key={pref.label}
                              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3"
                            >
                              <div>
                                <b className="text-[13px] font-semibold">{pref.label}</b>
                                <span className="mt-[2px] block text-xs text-[#7a819c]">
                                  {pref.hint}
                                </span>
                              </div>
                              <button
                                type="button"
                                aria-label={pref.label}
                                disabled={!userDoc}
                                onClick={pref.onToggle}
                                className={`relative h-7 w-[50px] shrink-0 rounded-full border transition ${
                                  pref.value
                                    ? "border-[rgba(106,92,255,.55)] bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] shadow-[0_0_0_3px_rgba(106,92,255,.12)]"
                                    : "border-[rgba(210,217,245,.95)] bg-[#dfe4fb]"
                                }`}
                              >
                                <span
                                  className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_10px_18px_rgba(23,35,79,.18)] transition ${
                                    pref.value ? "left-[25px]" : "left-[3px]"
                                  }`}
                                />
                              </button>
                            </div>
                          ))}

                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <label className="text-[11px] font-semibold text-[#a0a5bf]">
                              Default quiz mode
                            </label>
                            <select
                              className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                              value={prefQuizMode}
                              onChange={(e) =>
                                setPrefQuizMode(e.target.value as "timed" | "tutor")
                              }
                              disabled={!userDoc}
                            >
                              <option value="timed">Timed mode</option>
                              <option value="tutor">Tutor mode</option>
                            </select>
                            <div className="mt-2 text-xs text-[#7a819c]">
                              Sets the default practice experience when you start a
                              session.
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <div>
                              <b className="text-[13px] font-semibold">
                                Show explanations by default
                              </b>
                              <span className="mt-[2px] block text-xs text-[#7a819c]">
                                Automatically reveal answer explanations when available.
                              </span>
                            </div>
                            <button
                              type="button"
                              aria-label="Show explanations by default"
                              disabled={!userDoc}
                              onClick={() =>
                                setPrefShowExplanations((prev) => !prev)
                              }
                              className={`relative h-7 w-[50px] shrink-0 rounded-full border transition ${
                                prefShowExplanations
                                  ? "border-[rgba(106,92,255,.55)] bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] shadow-[0_0_0_3px_rgba(106,92,255,.12)]"
                                  : "border-[rgba(210,217,245,.95)] bg-[#dfe4fb]"
                              }`}
                            >
                              <span
                                className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_10px_18px_rgba(23,35,79,.18)] transition ${
                                  prefShowExplanations ? "left-[25px]" : "left-[3px]"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {prefSaveMessage ? (
                          <div className="mt-3 text-[13px] text-[#7a819c]">
                            {prefSaveMessage}
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}

                  {activeTab === "access" && (
                    <>
                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="text-xs font-semibold text-[#7a819c]">
                          Included in your plan
                        </div>
                        <div className="mt-1 text-xs text-[#a0a5bf]">
                          Human-readable access summary derived from your active
                          subscription.
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                          {view.entitlements.map((row) => (
                            <div
                              className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-[14px]"
                              key={row.key}
                            >
                              <div className="min-w-0">
                                <b className="block text-[13px] font-semibold text-[#202437]">
                                  {row.title}
                                </b>
                                <span className="mt-1 block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                  {row.description}
                                </span>
                              </div>
                              {row.included ? (
                                <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#2baa60]">
                                  Available
                                </span>
                              ) : (
                                <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[rgba(239,68,68,.45)] bg-[rgba(239,68,68,.11)] px-[10px] py-[6px] text-[11px] font-semibold text-[#b91c1c]">
                                  Not included
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "referrals" && (
                    <>
                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Invite friends
                            </div>
                            <div className="mt-1 text-xs text-[#a0a5bf]">
                              Share your referral code to earn rewards when new users
                              convert.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-[34px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                            onClick={() => {
                              if (!view.referralLink) return;
                              void navigator.clipboard?.writeText(view.referralLink);
                            }}
                          >
                            Copy referral link
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
                          <div className="rounded-2xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-4 shadow-[0_18px_45px_rgba(23,35,79,.08)]">
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Your referral link
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-dashed border-[rgba(106,92,255,.28)] bg-gradient-to-b from-[rgba(106,92,255,.06)] to-[rgba(106,92,255,.02)] px-4 py-3">
                              {view.referralLink ? (
                                <a
                                  href={view.referralLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="min-w-0 break-all text-base font-semibold text-[#6a5cff]"
                                >
                                  {view.referralCode}
                                </a>
                              ) : (
                                <span className="text-base font-semibold text-[#6a5cff]">
                                  {view.referralCode}
                                </span>
                              )}
                              <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[rgba(106,92,255,.55)] bg-[rgba(106,92,255,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                                Active
                              </span>
                            </div>
                            <div className="mt-[10px] rounded-[14px] border border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] px-3 py-[10px] text-xs font-normal text-[#2baa60]">
                              Referral codes are shown as links so users can share
                              them directly.
                            </div>
                          </div>

                          <div className="rounded-2xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-4 shadow-[0_18px_45px_rgba(23,35,79,.08)]">
                            <div className="text-xs font-semibold text-[#7a819c]">
                              Summary
                            </div>
                            <div className="mt-3 flex flex-col gap-[10px]">
                              <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                                <div className="min-w-0">
                                  <b className="block text-[13px] font-semibold text-[#202437]">
                                    Total referrals
                                  </b>
                                  <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                    Invites attributed to your code
                                  </span>
                                </div>
                                <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                                  {view.referralTotals.totalReferrals}
                                </span>
                              </div>
                              <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                                <div className="min-w-0">
                                  <b className="block text-[13px] font-semibold text-[#202437]">
                                    Total converted
                                  </b>
                                  <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                    Users who completed a qualifying purchase
                                  </span>
                                </div>
                                <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#2baa60]">
                                  {view.referralTotals.totalConverted}
                                </span>
                              </div>
                              <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
                                <div className="min-w-0">
                                  <b className="block text-[13px] font-semibold text-[#202437]">
                                    Total earned
                                  </b>
                                  <span className="mt-[6px] block text-xs font-normal leading-[1.35] text-[#7a819c]">
                                    User-facing earnings summary
                                  </span>
                                </div>
                                <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[rgba(106,92,255,.55)] bg-[rgba(106,92,255,.10)] px-[10px] py-[6px] text-[11px] font-semibold text-[#4f46e5]">
                                  {view.referralTotals.commissionEarnedFormatted}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "security" && (
                    <>
                      <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                        <div className="text-xs font-semibold text-[#7a819c]">
                          Account security
                        </div>
                        <div className="mt-1 text-xs text-[#a0a5bf]">
                          Clear user-facing security settings without exposing
                          internal logs.
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <label className="text-[11px] font-semibold text-[#a0a5bf]">
                              Sign-in method
                            </label>
                            <div className="mt-[10px]">
                              <span className="inline-flex items-center rounded-full border border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
                                {view.security.providerLabel}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <label className="text-[11px] font-semibold text-[#a0a5bf]">
                              Email verification
                            </label>
                            <div className="mt-[10px]">
                              <span
                                className={`inline-flex items-center rounded-full border border-dashed px-[10px] py-[6px] text-[11px] font-semibold ${
                                  view.security.emailVerified
                                    ? "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]"
                                    : "border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#b45309]"
                                }`}
                              >
                                {view.security.emailVerified
                                  ? "Verified"
                                  : "Not verified"}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <label className="text-[11px] font-semibold text-[#a0a5bf]">
                              Phone verification
                            </label>
                            <div className="mt-[10px]">
                              <span
                                className={`inline-flex items-center rounded-full border border-dashed px-[10px] py-[6px] text-[11px] font-semibold ${
                                  view.security.phoneVerified
                                    ? "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]"
                                    : "border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#b45309]"
                                }`}
                              >
                                {view.security.phoneVerified
                                  ? "Verified"
                                  : "Not verified"}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                            <label className="text-[11px] font-semibold text-[#a0a5bf]">
                              Multi-factor authentication
                            </label>
                            <div className="mt-[10px]">
                              <span
                                className={`inline-flex items-center rounded-full border border-dashed px-[10px] py-[6px] text-[11px] font-semibold ${
                                  view.security.mfaEnabled
                                    ? "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]"
                                    : "border-[#e0e3f0] bg-[rgba(255,255,255,.65)] text-[#7a819c]"
                                }`}
                              >
                                {view.security.mfaEnabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {canChangePassword ? (
                        <div className="mt-3 rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold text-[#7a819c]">
                                Change password
                              </div>
                              <div className="mt-1 text-xs text-[#a0a5bf]">
                                Update your password securely from your profile.
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={handleUpdatePassword}
                                className="inline-flex h-[34px] items-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-3 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px"
                              >
                                Update password
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-[34px] items-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-3 text-xs font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]"
                              >
                                Enable MFA
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                            <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                              <label className="text-[11px] font-semibold text-[#a0a5bf]">
                                Current password
                              </label>
                              <input
                                type="password"
                                value={securityCurrentPassword}
                                onChange={(e) =>
                                  setSecurityCurrentPassword(e.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                              />
                            </div>
                            <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                              <label className="text-[11px] font-semibold text-[#a0a5bf]">
                                New password
                              </label>
                              <input
                                type="password"
                                value={securityNewPassword}
                                onChange={(e) => setSecurityNewPassword(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                              />
                            </div>
                            <div className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
                              <label className="text-[11px] font-semibold text-[#a0a5bf]">
                                Confirm new password
                              </label>
                              <input
                                type="password"
                                value={securityConfirmPassword}
                                onChange={(e) =>
                                  setSecurityConfirmPassword(e.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-[13px]"
                              />
                            </div>
                          </div>
                          {securityMessage ? (
                            <div className="mt-3 text-[13px] text-[#7a819c]">
                              {securityMessage}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

