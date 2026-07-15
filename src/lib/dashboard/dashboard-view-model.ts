import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";
import type { UserDocument } from "@/types/user-document";
import {
  inferPrimaryExamIdFromProgramType,
  PROGRAM_TYPE_LABELS,
} from "@/lib/program-type";

export type DashboardAccessStatus =
  | "active"
  | "free"
  | "expired"
  | "past_due"
  | "cancelling"
  | "lifetime"
  | "none";

export type DashboardPackageStatus =
  | "active"
  | "free"
  | "expired"
  | "locked"
  | "cancelling"
  | "lifetime"
  | "payment_issue";

export type DashboardPackage = {
  id: string;
  family: "Entrance Exams" | "Test Banks" | "Exit Exams";
  name: string;
  description: string;
  href: string;
  status: DashboardPackageStatus;
  actionLabel: "Continue" | "Start" | "View Exams" | "View Plans";
  modes: string[];
  accessEndsAt: Date | null;
  progressPercent: number | null;
};

export type DashboardActivity = {
  id: string;
  title: string;
  category: string;
  status: "In Progress" | "Completed";
  href: string;
  scorePercent?: number;
  lastActivityAt?: Date | null;
};

export type DashboardCompletedExam = {
  id: string;
  title: string;
  mode?: string;
  href: string;
  scorePercent?: number;
  completedAt?: Date | null;
};

export type DashboardRecommendation = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export type DashboardProfileTask = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export interface DashboardViewModel {
  user: {
    firstName: string;
    fullName: string;
    email: string | null;
    emailVerified: boolean;
    primaryExamId: string | null;
    primaryExamName: string | null;
    focusAreaLabel: string | null;
    accountStatusLabel: string;
    userDocumentExists: boolean;
  };
  access: {
    status: DashboardAccessStatus;
    label: string;
    planName: string | null;
    accessEndsAt: Date | null;
    cancelAtPeriodEnd: boolean;
  };
  packages: DashboardPackage[];
  continueAction: {
    title: string;
    description: string;
    href: string;
    progressPercent?: number;
    lastActivityAt?: Date | null;
  };
  performance: {
    completedExams: number;
    totalAttempts: number;
    questionsAnswered: number;
    accuracy: number | null;
    streakDays: number;
    lastAttemptAt: Date | null;
    hasStats: boolean;
  };
  recentActivity: DashboardActivity[];
  completedExams: DashboardCompletedExam[];
  recommendations: DashboardRecommendation[];
  profileTasks: DashboardProfileTask[];
  referral: {
    shouldShow: boolean;
    code: string | null;
    totalReferrals: number;
    convertedReferrals: number;
    commissionEarnedFormatted: string;
    commissionPaidFormatted: string;
  };
}

const PRIMARY_EXAM_LABELS: Record<string, string> = {
  ati_teas_7: "ATI TEAS 7",
  hesi_a2: "HESI A2",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  locked: "Locked",
  deleted_requested: "Deletion requested",
  deleted: "Deleted",
};

const ENTITLEMENT_PACKAGE_MAP: Record<string, string[]> = {
  "exam:ati_teas_7": ["ati_teas_7"],
  "exam:hesi_a2": ["hesi_a2"],
  "bundle:all_access": [
    "ati_teas_7",
    "hesi_a2",
    "ati_fundamentals",
    "ati_pharmacology",
    "ati_med_surg",
    "hesi_fundamentals",
    "hesi_pharmacology",
    "hesi_med_surg",
    "hesi_lpn_exit",
    "hesi_rn_exit",
    "ati_lpn_predictor",
    "ati_rn_predictor",
  ],
};

const PACKAGE_CATALOG: Omit<DashboardPackage, "status" | "actionLabel" | "accessEndsAt" | "progressPercent">[] = [
  {
    id: "ati_teas_7",
    family: "Entrance Exams",
    name: "ATI TEAS 7",
    description: "Entrance exam practice for TEAS-style reading, math, science, and English.",
    href: "/teas-7-practice",
    modes: ["Timed mode", "Review mode"],
  },
  {
    id: "hesi_a2",
    family: "Entrance Exams",
    name: "HESI A2",
    description: "HESI A2 entrance exam practice and review.",
    href: "/hesi-a2-practice-test",
    modes: ["Timed mode", "Review mode"],
  },
  {
    id: "ati_fundamentals",
    family: "Test Banks",
    name: "ATI Fundamentals",
    description: "Fundamentals-style nursing test bank practice.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "ati_pharmacology",
    family: "Test Banks",
    name: "ATI Pharmacology",
    description: "Medication safety and pharmacology practice.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "ati_med_surg",
    family: "Test Banks",
    name: "ATI Medical-Surgical",
    description: "Medical-surgical nursing practice questions.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "hesi_fundamentals",
    family: "Test Banks",
    name: "HESI Fundamentals",
    description: "HESI-style fundamentals practice.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "hesi_pharmacology",
    family: "Test Banks",
    name: "HESI Pharmacology",
    description: "HESI-style pharmacology practice.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "hesi_med_surg",
    family: "Test Banks",
    name: "HESI Medical-Surgical",
    description: "HESI-style medical-surgical practice.",
    href: "/nursing-test-bank",
    modes: ["Practice sets"],
  },
  {
    id: "hesi_lpn_exit",
    family: "Exit Exams",
    name: "HESI LPN Exit",
    description: "LPN exit exam preparation.",
    href: "/nursing-exit-exam",
    modes: ["Predictor practice"],
  },
  {
    id: "hesi_rn_exit",
    family: "Exit Exams",
    name: "HESI RN Exit",
    description: "RN exit exam preparation.",
    href: "/nursing-exit-exam",
    modes: ["Predictor practice"],
  },
  {
    id: "ati_lpn_predictor",
    family: "Exit Exams",
    name: "ATI LPN Comprehensive Predictor",
    description: "LPN comprehensive predictor practice.",
    href: "/nursing-exit-exam",
    modes: ["Predictor practice"],
  },
  {
    id: "ati_rn_predictor",
    family: "Exit Exams",
    name: "ATI RN Comprehensive Predictor",
    description: "RN comprehensive predictor practice.",
    href: "/nursing-exit-exam",
    modes: ["Predictor practice"],
  },
];

function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  );
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (isTimestamp(value)) return value.toDate();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function firstNameFrom(value: string | null | undefined) {
  const clean = value?.trim();
  if (!clean) return "";
  return clean.split(/\s+/)[0] || clean;
}

function currency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value ?? 0);
}

function planName(planId: string | null | undefined) {
  if (!planId?.trim()) return null;
  return planId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPrimaryExam(doc: UserDocument | null) {
  const focusArea = doc?.profile?.focus_areas?.find((area) => area?.trim()) ?? "";
  const inferred = inferPrimaryExamIdFromProgramType(focusArea);
  const primaryExamId = doc?.profile?.primary_exam_id || inferred;
  return {
    primaryExamId,
    primaryExamName: primaryExamId ? PRIMARY_EXAM_LABELS[primaryExamId] ?? primaryExamId : null,
    focusAreaLabel: focusArea ? PROGRAM_TYPE_LABELS[focusArea] ?? focusArea : null,
  };
}

function deriveAccess(doc: UserDocument | null): DashboardViewModel["access"] {
  const billing = doc?.billing;
  const periodEnd = toDate(billing?.current_period_end);
  const now = new Date();
  const hasActiveEntitlement = Object.values(doc?.entitlements ?? {}).some(Boolean);
  const hasFutureAccess = Boolean(periodEnd && periodEnd.getTime() > now.getTime());

  if (billing?.cancel_at_period_end && hasFutureAccess) {
    return {
      status: "cancelling",
      label: "Cancels on access end date",
      planName: planName(billing.plan_id),
      accessEndsAt: periodEnd,
      cancelAtPeriodEnd: true,
    };
  }

  if (billing?.subscription_status === "active" || hasActiveEntitlement) {
    return {
      status: "active",
      label: "Active",
      planName: planName(billing?.plan_id),
      accessEndsAt: periodEnd,
      cancelAtPeriodEnd: Boolean(billing?.cancel_at_period_end),
    };
  }

  if (billing?.subscription_status === "past_due") {
    return {
      status: "past_due",
      label: "Payment issue",
      planName: planName(billing.plan_id),
      accessEndsAt: periodEnd,
      cancelAtPeriodEnd: Boolean(billing.cancel_at_period_end),
    };
  }

  if (billing?.subscription_status === "canceled") {
    return {
      status: hasFutureAccess ? "cancelling" : "expired",
      label: hasFutureAccess ? "Cancelling" : "Expired",
      planName: planName(billing.plan_id),
      accessEndsAt: periodEnd,
      cancelAtPeriodEnd: Boolean(billing.cancel_at_period_end),
    };
  }

  return {
    status: "free",
    label: "Free access",
    planName: null,
    accessEndsAt: null,
    cancelAtPeriodEnd: false,
  };
}

function activePackageIds(doc: UserDocument | null) {
  const active = new Set<string>();
  const entitlements = doc?.entitlements ?? {};
  for (const [key, enabled] of Object.entries(entitlements)) {
    if (!enabled) continue;
    for (const packageId of ENTITLEMENT_PACKAGE_MAP[key] ?? []) {
      active.add(packageId);
    }
  }
  return active;
}

function buildPackages(doc: UserDocument | null, access: DashboardViewModel["access"]): DashboardPackage[] {
  const active = activePackageIds(doc);
  const hasAnyPaidAccess = access.status === "active" || access.status === "cancelling" || access.status === "lifetime";
  const defaultStatus: DashboardPackageStatus =
    access.status === "past_due" ? "payment_issue" : access.status === "expired" ? "expired" : "locked";

  return PACKAGE_CATALOG.map((pkg) => {
    const isActive = active.has(pkg.id) || (doc?.entitlements?.["bundle:all_access"] === true && hasAnyPaidAccess);
    const status: DashboardPackageStatus = isActive
      ? access.status === "cancelling"
        ? "cancelling"
        : access.status === "lifetime"
          ? "lifetime"
          : "active"
      : pkg.family === "Entrance Exams"
        ? "free"
        : defaultStatus;
    const actionLabel: DashboardPackage["actionLabel"] =
      status === "active" || status === "cancelling" || status === "lifetime"
        ? "Continue"
        : status === "free"
          ? "Start"
          : "View Plans";

    return {
      ...pkg,
      status,
      actionLabel,
      accessEndsAt: isActive ? access.accessEndsAt : null,
      progressPercent: null,
    };
  }).sort((a, b) => {
    const priority = { active: 0, cancelling: 1, lifetime: 2, free: 3, payment_issue: 4, expired: 5, locked: 6 };
    return priority[a.status] - priority[b.status] || a.family.localeCompare(b.family) || a.name.localeCompare(b.name);
  });
}

function buildContinueAction(
  doc: UserDocument | null,
  packages: DashboardPackage[],
  primaryExamId: string | null,
  primaryExamName: string | null
): DashboardViewModel["continueAction"] {
  const activePackage = packages.find((pkg) => ["active", "cancelling", "lifetime"].includes(pkg.status));
  if (activePackage) {
    return {
      title: `Continue ${activePackage.name}`,
      description: `${activePackage.family} package is ready. Open it and choose the next practice set.`,
      href: activePackage.href,
    };
  }

  if (primaryExamId === "ati_teas_7") {
    return {
      title: "Start ATI TEAS 7 practice",
      description: "Use your selected exam focus to begin with TEAS practice.",
      href: "/teas-7-practice",
    };
  }

  if (primaryExamId === "hesi_a2") {
    return {
      title: "Start HESI A2 practice",
      description: "Use your selected exam focus to begin with HESI A2 practice.",
      href: "/hesi-a2-practice-test",
    };
  }

  const focusArea = doc?.profile?.focus_areas?.[0];
  if (focusArea === "nursing_test_bank") {
    return {
      title: "Browse Nursing Test Bank",
      description: "Choose a nursing test bank area and start a practice set.",
      href: "/nursing-test-bank",
    };
  }

  if (focusArea === "nursing_exit_exam") {
    return {
      title: "Browse Nursing Exit Exam practice",
      description: "Choose RN or LPN exit exam practice and start reviewing.",
      href: "/nursing-exit-exam",
    };
  }

  return {
    title: primaryExamName ? `Start ${primaryExamName}` : "Choose your first practice area",
    description: "Select an exam focus or browse available NursingMocks practice options.",
    href: "/nursing-entrance-exam",
  };
}

function buildRecommendations(
  doc: UserDocument | null,
  packages: DashboardPackage[],
  primaryExamId: string | null
): DashboardRecommendation[] {
  const recommendations: DashboardRecommendation[] = [];
  const activePackage = packages.find((pkg) => ["active", "cancelling", "lifetime"].includes(pkg.status));

  if (activePackage) {
    recommendations.push({
      id: `active-${activePackage.id}`,
      title: `Keep going with ${activePackage.name}`,
      description: "You already have access. Open the package and choose the next available practice set.",
      href: activePackage.href,
      actionLabel: "Continue",
    });
  }

  if (primaryExamId === "ati_teas_7") {
    recommendations.push({
      id: "primary-ati-teas",
      title: "ATI TEAS 7 practice",
      description: "Matches your selected primary exam focus.",
      href: "/teas-7-practice",
      actionLabel: "Start practice",
    });
  } else if (primaryExamId === "hesi_a2") {
    recommendations.push({
      id: "primary-hesi-a2",
      title: "HESI A2 practice",
      description: "Matches your selected primary exam focus.",
      href: "/hesi-a2-practice-test",
      actionLabel: "Start practice",
    });
  }

  if (!doc?.profile?.primary_exam_id && !doc?.profile?.focus_areas?.length) {
    recommendations.push({
      id: "choose-focus",
      title: "Choose an exam focus",
      description: "Set your primary focus so NursingMocks can put the right practice areas first.",
      href: "/profile",
      actionLabel: "Update profile",
    });
  }

  recommendations.push({
    id: "knowledge-base",
    title: "Use the Knowledge Base",
    description: "Review practical guidance before starting longer practice sets.",
    href: "/knowledge-base",
    actionLabel: "Open guide",
  });

  return recommendations.slice(0, 3);
}

function buildProfileTasks(doc: UserDocument | null, authUser: User): DashboardProfileTask[] {
  const tasks: DashboardProfileTask[] = [];
  if (!authUser.emailVerified && doc?.auth?.email_verified !== true) {
    tasks.push({
      id: "verify-email",
      title: "Verify your email",
      description: "Keep your account secure and make password recovery easier.",
      href: "/profile",
    });
  }
  if (!doc?.profile?.display_name?.trim() && !doc?.full_name?.trim() && !authUser.displayName?.trim()) {
    tasks.push({
      id: "display-name",
      title: "Add your display name",
      description: "Personalize your account and support requests.",
      href: "/profile",
    });
  }
  if (!doc?.profile?.primary_exam_id && !doc?.profile?.focus_areas?.length) {
    tasks.push({
      id: "exam-focus",
      title: "Select your exam focus",
      description: "Help the dashboard recommend the right practice area.",
      href: "/profile",
    });
  }
  if (!doc?.profile?.timezone?.trim()) {
    tasks.push({
      id: "timezone",
      title: "Set your timezone",
      description: "Keep account dates and reminders consistent.",
      href: "/profile",
    });
  }
  if (!doc?.preferences) {
    tasks.push({
      id: "preferences",
      title: "Set study preferences",
      description: "Choose default quiz and notification preferences.",
      href: "/profile",
    });
  }
  return tasks;
}

export function buildDashboardViewModel(doc: UserDocument | null, authUser: User): DashboardViewModel {
  const email = doc?.email || authUser.email || null;
  const fullName =
    doc?.profile?.display_name?.trim() ||
    doc?.full_name?.trim() ||
    authUser.displayName?.trim() ||
    email?.split("@")[0] ||
    "Student";
  const { primaryExamId, primaryExamName, focusAreaLabel } = getPrimaryExam(doc);
  const access = deriveAccess(doc);
  const packages = buildPackages(doc, access);
  const stats = doc?.stats;
  const totalAttempts = stats?.total_attempts ?? 0;
  const questionsAnswered = stats?.total_questions_answered ?? 0;
  const accuracyValue = stats?.accuracy_overall;
  const accuracy = typeof accuracyValue === "number" && Number.isFinite(accuracyValue) ? Math.round(accuracyValue) : null;

  return {
    user: {
      firstName: firstNameFrom(fullName) || "Student",
      fullName,
      email,
      emailVerified: doc?.auth?.email_verified ?? authUser.emailVerified,
      primaryExamId,
      primaryExamName,
      focusAreaLabel,
      accountStatusLabel: ACCOUNT_STATUS_LABELS[doc?.account_state?.status ?? "active"] ?? "Active",
      userDocumentExists: Boolean(doc),
    },
    access,
    packages,
    continueAction: buildContinueAction(doc, packages, primaryExamId, primaryExamName),
    performance: {
      completedExams: totalAttempts,
      totalAttempts,
      questionsAnswered,
      accuracy,
      streakDays: stats?.streak_days ?? 0,
      lastAttemptAt: toDate(stats?.last_attempt_at),
      hasStats: totalAttempts > 0 || questionsAnswered > 0 || accuracy !== null || Boolean(stats?.last_attempt_at),
    },
    recentActivity: [],
    completedExams: [],
    recommendations: buildRecommendations(doc, packages, primaryExamId),
    profileTasks: buildProfileTasks(doc, authUser),
    referral: {
      shouldShow: Boolean(doc?.referral_summary?.referral_code),
      code: doc?.referral_summary?.referral_code ?? null,
      totalReferrals: doc?.referral_summary?.total_referrals ?? 0,
      convertedReferrals: doc?.referral_summary?.total_converted ?? 0,
      commissionEarnedFormatted: currency(doc?.referral_summary?.total_commission_earned),
      commissionPaidFormatted: currency(doc?.referral_summary?.total_commission_paid),
    },
  };
}

export function formatDashboardDate(value: Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
