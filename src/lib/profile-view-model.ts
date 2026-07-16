import type { Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserDocument } from "@/types/user-document";
import {
  inferPrimaryExamIdFromProgramType,
  PRIMARY_EXAM_LABELS,
  PROGRAM_TYPE_LABELS,
} from "@/lib/program-type";

const ACCESS_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  canceled: "Canceled",
  past_due: "Past due",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  locked: "Locked",
  deleted_requested: "Deletion requested",
  deleted: "Deleted",
};

const AUTH_PROVIDER_LABELS = {
  password: "Password",
  google: "Google",
  apple: "Apple",
} as const;

const ENTITLEMENT_METADATA: Record<string, { title: string; description: string }> = {
  "exam:ati_teas_7": {
    title: "ATI TEAS 7",
    description: "Practice exams and content",
  },
  "exam:hesi_a2": {
    title: "HESI A2",
    description: "HESI A2 content access",
  },
  "bundle:all_access": {
    title: "All Access Bundle",
    description: "Combined access to all exam content",
  },
  "feature:analytics": {
    title: "Analytics",
    description: "Performance insights and tracking",
  },
  "feature:review_mode": {
    title: "Review mode",
    description: "Detailed answer review support",
  },
  "feature:timed_mode": {
    title: "Timed mode",
    description: "Timed test experience",
  },
};

function formatEntitlementKey(key: string): string {
  const parts = key.split(":");
  const raw = parts.length > 1 ? parts[1] : key;
  return raw
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  );
}

export function formatFirestoreDate(value: unknown): string {
  if (!value) return "-";
  if (isTimestamp(value)) {
    return value.toDate().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return "-";
}

function formatDateShort(value: unknown): string {
  if (!value) return "-";
  if (isTimestamp(value)) {
    return value.toDate().toLocaleDateString(undefined, { dateStyle: "medium" });
  }
  return "-";
}

function roleLabel(role: string | undefined): string {
  if (!role) return "Student";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/** UI-facing snapshot: Firestore `users/{uid}` + Firebase Auth fallbacks */
export function buildProfileView(
  doc: UserDocument | null,
  authUser: User
): {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  roleLabel: string;
  timezone: string;
  locale: string;
  country: string;
  programTypeLabel: string;
  primaryExamLabel: string;
  accessStatusLabel: string;
  accountStatusLabel: string;
  planLabel: string;
  billingIntervalLabel: string;
  accessUntilLabel: string;
  referralCode: string;
  referralLink: string;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt: string;
  stats: {
    attempts: number;
    answered: number;
    accuracy: number;
    streak: number;
  };
  entitlements: { key: string; title: string; description: string; included: boolean }[];
  referralTotals: {
    totalReferrals: number;
    totalConverted: number;
    commissionEarnedFormatted: string;
  };
  security: {
    providerLabel: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    mfaEnabled: boolean;
  };
  avatarInitial: string;
  photoURL: string | null;
} {
  const email = doc?.email ?? authUser.email ?? "";
  const fullName =
    doc?.full_name?.trim() ||
    authUser.displayName?.trim() ||
    email.split("@")[0] ||
    "";
  const displayName =
    doc?.profile?.display_name?.trim() ||
    authUser.displayName?.trim() ||
    fullName.split(/\s+/)[0] ||
    fullName;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://teasgurus.com";
  const code = doc?.referral_summary?.referral_code?.trim() || "";
  const referralLink = code ? `${origin}/ref/${encodeURIComponent(code)}` : "";

  const firstFocusArea = doc?.profile?.focus_areas?.[0]?.trim() ?? "";
  const inferredPrimaryId = inferPrimaryExamIdFromProgramType(firstFocusArea);
  const primaryId = doc?.profile?.primary_exam_id ?? inferredPrimaryId;
  const primaryExamLabel = primaryId
    ? PRIMARY_EXAM_LABELS[primaryId] ?? primaryId
    : "Not set";
  const programTypeLabel = firstFocusArea
    ? PROGRAM_TYPE_LABELS[firstFocusArea] ?? firstFocusArea
    : "Not set";

  const sub = doc?.billing?.subscription_status;
  const accessStatusLabel = sub
    ? ACCESS_STATUS_LABELS[sub] ?? sub
    : "None";

  const acct = doc?.account_state?.status;
  const accountStatusLabel = acct
    ? ACCOUNT_STATUS_LABELS[acct] ?? acct
    : "Active";

  const interval = doc?.billing?.interval;
  const billingIntervalLabel =
    interval === "monthly"
      ? "Monthly"
      : interval === "yearly"
        ? "Yearly"
        : "-";

  const planId = doc?.billing?.plan_id?.trim();
  const planLabel = planId || "-";

  const periodEnd = doc?.billing?.current_period_end;
  const accessUntilLabel = formatDateShort(periodEnd);

  const provider = doc?.auth?.provider;
  const providerLabel = provider
    ? AUTH_PROVIDER_LABELS[provider] ?? provider
    : authUser.providerData[0]?.providerId === "google.com"
      ? "Google"
      : "Password";

  const ent = doc?.entitlements ?? {};
  const entitlementKeys = Object.keys(ent).sort();
  const entitlements = entitlementKeys.map((key) => {
    const metadata = ENTITLEMENT_METADATA[key];
    return {
      key,
      title: metadata?.title ?? formatEntitlementKey(key),
      description: metadata?.description ?? "Access permission from your profile",
      included: Boolean(ent[key]),
    };
  });

  const refSum = doc?.referral_summary;
  const commissionEarned = refSum?.total_commission_earned ?? 0;
  const commissionEarnedFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(commissionEarned);

  const statsDoc = doc?.stats;
  const stats = {
    attempts: statsDoc?.total_attempts ?? 0,
    answered: statsDoc?.total_questions_answered ?? 0,
    accuracy: Math.round(statsDoc?.accuracy_overall ?? 0),
    streak: statsDoc?.streak_days ?? 0,
  };

  const photoURL = doc?.avatar_url ?? authUser.photoURL ?? null;
  const initialSource = displayName || fullName || email || "?";
  const avatarInitial = initialSource.slice(0, 1).toUpperCase();

  return {
    displayName,
    fullName,
    email,
    phone: doc?.phone_e164 ?? "",
    roleLabel: roleLabel(doc?.access?.role),
    timezone: doc?.profile?.timezone ?? "-",
    locale: doc?.profile?.locale ?? "-",
    country: doc?.profile?.country ?? "-",
    programTypeLabel,
    primaryExamLabel,
    accessStatusLabel,
    accountStatusLabel,
    planLabel,
    billingIntervalLabel,
    accessUntilLabel,
    referralCode: code || "-",
    referralLink,
    createdAt: formatFirestoreDate(doc?.created_at),
    updatedAt: formatFirestoreDate(doc?.updated_at),
    lastAttemptAt: formatFirestoreDate(doc?.stats?.last_attempt_at),
    stats,
    entitlements,
    referralTotals: {
      totalReferrals: refSum?.total_referrals ?? 0,
      totalConverted: refSum?.total_converted ?? 0,
      commissionEarnedFormatted,
    },
    security: {
      providerLabel,
      emailVerified: doc?.auth?.email_verified ?? authUser.emailVerified,
      phoneVerified: doc?.auth?.phone_verified ?? false,
      mfaEnabled: doc?.auth?.mfa_enabled ?? false,
    },
    avatarInitial,
    photoURL,
  };
}
