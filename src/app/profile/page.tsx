"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import ct from "countries-and-timezones";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { buildProfileView } from "@/lib/profile-view-model";
import {
  isValidProgramType,
  normalizeProgramTypeFromProfile,
  PROGRAM_TYPE_OPTIONS,
  recommendedFocusLabelFromProgramType,
} from "@/lib/program-type";
import {
  ensureUserDocumentOnRegister,
  subscribeUserDocument,
  updateUserPreferenceFields,
  updateUserProfileContact,
} from "@/lib/user-document-firestore";
import type { UserDocument } from "@/types/user-document";

type TabKey = "account" | "preferences" | "security";

function isTabKey(value: string | null): value is TabKey {
  return value === "account" || value === "preferences" || value === "security";
}

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

const primaryButtonClass =
  "inline-flex min-h-[38px] items-center justify-center rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex min-h-[38px] items-center justify-center rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-4 text-sm font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff] disabled:cursor-not-allowed disabled:opacity-60";

const panelClass = "rounded-2xl bg-white shadow-[0_18px_45px_rgba(23,35,79,.08)]";
const fieldClass = "mt-2 w-full rounded-xl border border-[#e0e3f0] bg-white px-3 py-[10px] text-sm outline-none transition focus:border-[#6a5cff] focus:shadow-[0_0_0_3px_rgba(106,92,255,.12)]";
const readOnlyFieldClass = `${fieldClass} bg-[rgba(106,92,255,.03)]`;
const tabLabels: Record<TabKey, string> = {
  account: "Account",
  preferences: "Preferences",
  security: "Manage Password",
};

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "green" | "purple" | "amber" | "gray" }) {
  const tones = {
    green: "border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]",
    purple: "border-[rgba(106,92,255,.38)] bg-[rgba(106,92,255,.08)] text-[#4f46e5]",
    amber: "border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#b45309]",
    gray: "border-[#e0e3f0] bg-[rgba(255,255,255,.65)] text-[#7a819c]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border border-dashed px-[10px] py-[6px] text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FormField({
  label,
  hint,
  children,
  wide = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`${wide ? "sm:col-span-2" : ""} rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3`}>
      <label className="text-xs font-semibold text-[#a0a5bf]">{label}</label>
      {children}
      {hint && <div className="mt-2 text-[13px] leading-5 text-[#7a819c]">{hint}</div>}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  disabled,
  onToggle,
}: {
  label: string;
  hint: string;
  value: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-3">
      <div>
        <b className="text-sm font-semibold">{label}</b>
        <span className="mt-[2px] block text-[13px] leading-5 text-[#7a819c]">{hint}</span>
      </div>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-7 w-[50px] shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
          value
            ? "border-[rgba(106,92,255,.55)] bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] shadow-[0_0_0_3px_rgba(106,92,255,.12)]"
            : "border-[rgba(210,217,245,.95)] bg-[#dfe4fb]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_10px_18px_rgba(23,35,79,.18)] transition ${
            value ? "left-[25px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const ensureAttemptedRef = useRef(false);

  const [accountDisplayName, setAccountDisplayName] = useState("");
  const [accountFullName, setAccountFullName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountTimezone, setAccountTimezone] = useState("");
  const [accountCountry, setAccountCountry] = useState("");
  const [accountLocale, setAccountLocale] = useState("");
  const [accountBio, setAccountBio] = useState("");
  const [accountProgramType, setAccountProgramType] = useState("");
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
  const [securityPasswordSaving, setSecurityPasswordSaving] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (isTabKey(tab)) setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
  }, [currentUser, loading, router]);

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
              fullName: currentUser.displayName?.trim() || currentUser.email?.split("@")[0] || "User",
            });
          } catch (error) {
            setDocError(error instanceof Error ? error.message : "Could not create profile document");
          }
        }
        setUserDoc(data);
        setHasSnapshot(true);
      },
      (error) => {
        setDocError(error.message);
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
    setAccountProgramType(normalizeProgramTypeFromProfile(userDoc.profile?.focus_areas?.[0]?.trim() ?? ""));
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

  const view = useMemo(() => (currentUser ? buildProfileView(userDoc, currentUser) : null), [currentUser, userDoc]);

  const countryOptions = useMemo(() => {
    const displayNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
    return Object.values(ct.getAllCountries())
      .map((country) => ({ code: country.id, name: displayNames?.of(country.id) ?? country.name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, []);

  const timezoneOptions = useMemo(() => {
    const merged = new Set<string>(TIMEZONE_OPTIONS);
    if (accountTimezone) merged.add(accountTimezone);
    return Array.from(merged);
  }, [accountTimezone]);

  const accountPhonePlaceholder = useMemo(() => {
    if (!accountCountry) return "eg +15551234567";
    try {
      return `eg +${getCountryCallingCode(accountCountry as CountryCode)}555123456`;
    } catch {
      return "eg +15551234567";
    }
  }, [accountCountry]);

  const accountPrimaryExamPreview = useMemo(
    () => recommendedFocusLabelFromProgramType(accountProgramType),
    [accountProgramType]
  );

  const resetAccountForm = useCallback(() => {
    if (!userDoc) return;
    setAccountDisplayName(userDoc.profile?.display_name ?? "");
    setAccountFullName(userDoc.full_name ?? "");
    setAccountPhone(userDoc.phone_e164 ?? "");
    setAccountTimezone(userDoc.profile?.timezone ?? "America/New_York");
    setAccountCountry(normalizeCountryCode(userDoc.profile?.country));
    setAccountLocale(userDoc.profile?.locale ?? "");
    setAccountBio(userDoc.profile?.bio ?? "");
    setAccountProgramType(normalizeProgramTypeFromProfile(userDoc.profile?.focus_areas?.[0]?.trim() ?? ""));
    setAccountSaveMessage(null);
  }, [userDoc]);

  const handleCountryChange = useCallback((value: string) => {
    const nextCode = normalizeCountryCode(value);
    setAccountCountry(nextCode);
    if (!nextCode) return;
    const country = ct.getCountry(nextCode);
    const preferredTimezone = PREFERRED_COUNTRY_TIMEZONE[nextCode];
    const timezone =
      (preferredTimezone && country?.timezones?.some((tz) => tz === preferredTimezone) ? preferredTimezone : undefined) ??
      country?.timezones?.find((tz) => TIMEZONE_OPTIONS.includes(tz as never)) ??
      country?.timezones?.[0] ??
      "UTC";
    setAccountTimezone(timezone);
    setAccountLocale(`en-${nextCode}`);
  }, []);

  const handleSaveAccount = useCallback(async () => {
    if (!currentUser || !userDoc) return;
    setAccountSaveMessage(null);
    setAccountSaving(true);
    try {
      if (!isValidProgramType(accountProgramType)) {
        setAccountSaveMessage("Please select a program type.");
        return;
      }
      await updateUserProfileContact(currentUser.uid, {
        full_name: accountFullName.trim(),
        display_name: accountDisplayName.trim(),
        phone_e164: accountPhone.trim() || null,
        timezone: accountTimezone || "America/New_York",
        country: accountCountry.trim() || null,
        locale: accountLocale.trim() || null,
        bio: accountBio.trim() || null,
        program_type: accountProgramType,
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: accountDisplayName.trim() });
      }
      setAccountSaveMessage("Saved.");
    } catch (error) {
      setAccountSaveMessage(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setAccountSaving(false);
    }
  }, [accountBio, accountCountry, accountDisplayName, accountFullName, accountLocale, accountPhone, accountProgramType, accountTimezone, currentUser, userDoc]);

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
    } catch (error) {
      setPrefError(error instanceof Error ? error.message : "Could not update settings");
    } finally {
      setPrefSaving(false);
    }
  }, [currentUser, prefDarkMode, prefEmailUpdates, prefNotifEmail, prefNotifPush, prefNotifSms, prefQuizMode, prefShowExplanations, userDoc]);

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

  const handleUpdatePassword = useCallback(async () => {
    setSecurityMessage(null);
    if (!securityCurrentPassword.trim() || !securityNewPassword.trim() || !securityConfirmPassword.trim()) {
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

    const user = auth.currentUser;
    const email = user?.email ?? currentUser?.email ?? null;
    if (!user || !email) {
      setSecurityMessage("You must be signed in with an email account to change your password.");
      return;
    }

    setSecurityPasswordSaving(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, securityCurrentPassword));
      await updatePassword(user, securityNewPassword.trim());
      setSecurityCurrentPassword("");
      setSecurityNewPassword("");
      setSecurityConfirmPassword("");
      setSecurityMessage("Password updated.");
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: string }).code) : "";
      let message = "Could not update password. Please try again.";
      if (["auth/wrong-password", "auth/invalid-credential", "auth/invalid-login-credentials"].includes(code)) {
        message = "Current password is incorrect.";
      } else if (code === "auth/weak-password") {
        message = "New password is too weak. Choose a stronger password.";
      } else if (code === "auth/requires-recent-login") {
        message = "Please sign out and sign in again, then try changing your password.";
      } else if (code === "auth/too-many-requests") {
        message = "Too many attempts. Try again later.";
      } else if (code === "auth/network-request-failed") {
        message = "Network error. Check your connection and try again.";
      }
      setSecurityMessage(message);
    } finally {
      setSecurityPasswordSaving(false);
    }
  }, [currentUser, securityConfirmPassword, securityCurrentPassword, securityNewPassword]);

  if (loading || (!hasSnapshot && !docError && currentUser)) {
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

  if (!currentUser || !view) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(106,92,255,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.05),transparent_55%),#f5f6fb]">
        <div className="mx-auto max-w-[1360px] px-4 pb-14 pt-[18px] text-[#202437] max-[560px]:px-[14px] max-[560px]:pb-[46px] max-[560px]:pt-[14px]">
          {docError && (
            <p className="mb-3 rounded-xl border border-[rgba(239,68,68,0.45)] bg-[#fee2e2] px-3 py-2.5 text-sm font-medium text-[#991b1b]" role="alert">
              Profile data: {docError}
            </p>
          )}

          <header className="pb-[14px] pt-[18px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="green">{view.accountStatusLabel}</Badge>
                  <Badge tone="purple">Role: {view.roleLabel}</Badge>
                </div>
                <h1 className="mt-3 text-[30px] font-extrabold tracking-[-0.03em] max-[560px]:text-2xl">Profile Settings</h1>
                <p className="mt-2 max-w-[86ch] text-[15px] font-medium leading-6 text-[#7a819c]">
                  Manage your identity, study preferences, and sign-in security. Payments and referrals have their own pages.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-end gap-[10px] max-[720px]:justify-start">
                <Link href="/dashboard" className={secondaryButtonClass}>Dashboard</Link>
                <Link href="/payments" className={primaryButtonClass}>Manage payments</Link>
              </div>
            </div>
          </header>

          <div className="mt-2 grid grid-cols-[340px_1fr] items-start gap-[18px] max-[980px]:grid-cols-1">
            <aside className={`${panelClass} overflow-hidden`}>
              <div className="px-4 pb-4 pt-[14px]">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.35),transparent_55%),linear-gradient(180deg,#6a5cff,#4f46e5)] font-semibold text-white shadow-[0_12px_26px_rgba(106,92,255,.25)]">
                    {view.photoURL ? (
                      <Image src={view.photoURL} alt="" width={56} height={56} className="h-full w-full rounded-full object-cover" unoptimized />
                    ) : (
                      view.avatarInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-2xl font-semibold tracking-[-0.025em]">{view.displayName}</div>
                    <p className="mt-1 truncate text-sm text-[#7a819c]">{view.email}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-[10px]">
                  <InfoRow label="Program" value={view.programTypeLabel} />
                  <InfoRow label="Recommended focus" value={view.primaryExamLabel} />
                  <InfoRow label="Current plan" value={view.planLabel} />
                  <InfoRow label="Access ends" value={view.accessUntilLabel} />
                </div>

                <div className="mt-4 grid gap-2">
                  <Link href="/payments" className={secondaryButtonClass}>Payments & access</Link>
                  <Link href="/referrals" className={secondaryButtonClass}>Referral center</Link>
                </div>
              </div>
            </aside>

            <main>
              <nav className="mb-3 flex gap-[10px] overflow-x-auto border-t border-dashed border-[rgba(224,227,240,.7)] pb-[10px] pt-[14px]">
                {(["account", "preferences", "security"] as TabKey[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-[10px] text-sm font-semibold transition ${
                      activeTab === tab
                        ? "border-[rgba(106,92,255,.40)] bg-gradient-to-b from-[rgba(106,92,255,.10)] to-[rgba(255,255,255,.86)] text-[#4f46e5] shadow-[0_12px_26px_rgba(106,92,255,.12)]"
                        : "border-[rgba(224,227,240,.9)] bg-[rgba(255,255,255,.82)] text-[#202437]"
                    }`}
                  >
                    {tabLabels[tab]}
                  </button>
                ))}
              </nav>

              <section className={`${panelClass} p-4`}>
                {activeTab === "account" && (
                  <div>
                    <PanelHeader
                      title="Account Details"
                      description="Edit the profile information used across your account and dashboard."
                      actions={
                        <>
                          <button type="button" className={primaryButtonClass} disabled={!userDoc || accountSaving} onClick={() => void handleSaveAccount()}>
                            {accountSaving ? "Saving..." : "Save changes"}
                          </button>
                          <button type="button" className={secondaryButtonClass} disabled={!userDoc} onClick={resetAccountForm}>
                            Reset
                          </button>
                        </>
                      }
                    />
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <FormField label="Display name">
                        <input className={fieldClass} value={accountDisplayName} onChange={(event) => setAccountDisplayName(event.target.value)} disabled={!userDoc} />
                      </FormField>
                      <FormField label="Full name" hint="Stored as the main account identity name.">
                        <input className={fieldClass} value={accountFullName} onChange={(event) => setAccountFullName(event.target.value)} disabled={!userDoc} />
                      </FormField>
                      <FormField label="Email" hint="Primary login email. This cannot be edited here.">
                        <input className={readOnlyFieldClass} value={view.email} readOnly />
                      </FormField>
                      <FormField label="Country" hint="Country selection updates timezone and locale.">
                        <select className={fieldClass} value={accountCountry} onChange={(event) => handleCountryChange(event.target.value)} disabled={!userDoc}>
                          <option value="">Select country</option>
                          {accountCountry && !ct.getCountry(accountCountry) && <option value={accountCountry}>{accountCountry}</option>}
                          {countryOptions.map((country) => (
                            <option key={country.code} value={country.code}>{country.name}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Phone number">
                        <input className={fieldClass} value={accountPhone} onChange={(event) => setAccountPhone(event.target.value)} disabled={!userDoc} placeholder={accountPhonePlaceholder} />
                      </FormField>
                      <FormField label="Timezone">
                        <select className={fieldClass} value={accountTimezone} onChange={(event) => setAccountTimezone(event.target.value)} disabled={!userDoc}>
                          <option value="">Select timezone</option>
                          {timezoneOptions.map((timezone) => (
                            <option key={timezone} value={timezone}>{timezone}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Program type" hint="This also updates your recommended focus.">
                        <select className={fieldClass} value={accountProgramType} onChange={(event) => setAccountProgramType(event.target.value)} disabled={!userDoc} required>
                          <option value="" disabled>Select program type</option>
                          {PROGRAM_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Recommended focus">
                        <input className={readOnlyFieldClass} value={accountPrimaryExamPreview} readOnly />
                      </FormField>
                      <FormField label="Locale">
                        <input className={readOnlyFieldClass} value={accountLocale} readOnly />
                      </FormField>
                      <FormField label="Bio" wide>
                        <textarea className={`${fieldClass} min-h-[90px] resize-y`} value={accountBio} onChange={(event) => setAccountBio(event.target.value)} disabled={!userDoc} placeholder="Short bio (optional)" />
                      </FormField>
                    </div>
                    {accountSaveMessage && <AlertMessage text={accountSaveMessage} success={accountSaveMessage === "Saved."} />}
                  </div>
                )}

                {activeTab === "preferences" && (
                  <div>
                    <PanelHeader
                      title="Preferences"
                      description="Control communication and quiz defaults without mixing them into your profile identity."
                      actions={
                        <>
                          <button type="button" className={primaryButtonClass} disabled={!userDoc || prefSaving} onClick={() => void handleSavePrefs()}>
                            {prefSaving ? "Saving..." : "Save preferences"}
                          </button>
                          <button type="button" className={secondaryButtonClass} disabled={!userDoc} onClick={handleResetPrefs}>
                            Reset
                          </button>
                        </>
                      }
                    />
                    {prefError && <AlertMessage text={prefError} success={false} />}
                    <div className="mt-4 grid gap-3">
                      <ToggleRow label="Dark mode" hint="Choose your preferred theme for the dashboard." value={prefDarkMode} disabled={!userDoc} onToggle={() => setPrefDarkMode((value) => !value)} />
                      <ToggleRow label="Email updates" hint="Receive product updates and occasional study reminders." value={prefEmailUpdates} disabled={!userDoc} onToggle={() => setPrefEmailUpdates((value) => !value)} />
                      <ToggleRow label="Email notifications" hint="Receive important account and security messages by email." value={prefNotifEmail} disabled={!userDoc} onToggle={() => setPrefNotifEmail((value) => !value)} />
                      <ToggleRow label="Push notifications" hint="Get reminders and account alerts on supported devices." value={prefNotifPush} disabled={!userDoc} onToggle={() => setPrefNotifPush((value) => !value)} />
                      <ToggleRow label="SMS notifications" hint="Only use this for essential account messages." value={prefNotifSms} disabled={!userDoc} onToggle={() => setPrefNotifSms((value) => !value)} />
                      <ToggleRow label="Show explanations by default" hint="Automatically reveal answer explanations when available." value={prefShowExplanations} disabled={!userDoc} onToggle={() => setPrefShowExplanations((value) => !value)} />
                      <FormField label="Default quiz mode">
                        <select className={fieldClass} value={prefQuizMode} onChange={(event) => setPrefQuizMode(event.target.value as "timed" | "tutor")} disabled={!userDoc}>
                          <option value="timed">Timed mode</option>
                          <option value="tutor">Tutor mode</option>
                        </select>
                      </FormField>
                    </div>
                    {prefSaveMessage && <AlertMessage text={prefSaveMessage} success />}
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    {canChangePassword ? (
                      <div>
                        <PanelHeader
                          title="Change Password"
                          description="Update your account password. Keep it private and use a password you do not use elsewhere."
                        />
                        <div className="mt-4 rounded-2xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(245,246,251,.65)] p-4">
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="grid gap-3">
                              <FormField label="Current password">
                                <input
                                  type="password"
                                  autoComplete="current-password"
                                  className={fieldClass}
                                  value={securityCurrentPassword}
                                  onChange={(event) => setSecurityCurrentPassword(event.target.value)}
                                />
                              </FormField>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <FormField label="New password">
                                  <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={fieldClass}
                                    value={securityNewPassword}
                                    onChange={(event) => setSecurityNewPassword(event.target.value)}
                                  />
                                </FormField>
                                <FormField label="Confirm new password">
                                  <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={fieldClass}
                                    value={securityConfirmPassword}
                                    onChange={(event) => setSecurityConfirmPassword(event.target.value)}
                                  />
                                </FormField>
                              </div>
                            </div>

                            <aside className="rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-white p-4">
                              <p className="text-sm font-semibold text-[#202437]">Password requirements</p>
                              <ul className="mt-3 grid gap-2 text-[13px] leading-5 text-[#7a819c]">
                                <li>Use at least 8 characters.</li>
                                <li>Use a password unique to this account.</li>
                                <li>You may be asked to sign in again if your session is old.</li>
                              </ul>
                              <button
                                type="button"
                                className={`${primaryButtonClass} mt-4 w-full`}
                                disabled={securityPasswordSaving}
                                onClick={() => void handleUpdatePassword()}
                              >
                                {securityPasswordSaving ? "Updating..." : "Update password"}
                              </button>
                            </aside>
                          </div>
                          {securityMessage && <AlertMessage text={securityMessage} success={securityMessage === "Password updated."} />}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <PanelHeader
                          title="Change Password"
                          description="Password changes are managed by your sign-in provider for this account."
                        />
                        <div className="mt-4 rounded-2xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-4 text-sm leading-6 text-[#7a819c]">
                          Use your sign-in provider account settings to update your password.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[10px] rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
      <b className="block text-sm font-semibold">{label}</b>
      <span className="min-w-0 break-words text-right text-sm font-semibold text-[#202437]">{value}</span>
    </div>
  );
}

function PanelHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="mt-2 max-w-[78ch] text-sm leading-6 text-[#7a819c]">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function AlertMessage({ text, success }: { text: string; success: boolean }) {
  return (
    <div
      className={`mt-3 rounded-xl border px-3 py-2.5 text-sm font-medium ${
        success
          ? "border-[rgba(34,197,94,0.45)] bg-[#dcfce7] text-[#166534]"
          : "border-[rgba(239,68,68,0.45)] bg-[#fee2e2] text-[#991b1b]"
      }`}
      role={success ? "status" : "alert"}
    >
      {text}
    </div>
  );
}
