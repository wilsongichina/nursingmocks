"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendEmailVerification, type User } from "firebase/auth";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lock,
  Mail,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import {
  buildDashboardViewModel,
  formatDashboardDate,
  type DashboardBillingHistory,
  type DashboardPackage,
  type DashboardPackageStatus,
  type DashboardViewModel,
} from "@/lib/dashboard/dashboard-view-model";
import { subscribeUserDocument, updateUserDashboardExamIds } from "@/lib/user-document-firestore";
import type { UserDocument } from "@/types/user-document";

function badgeClasses(tone: "green" | "purple" | "amber" | "red" | "gray") {
  const tones = {
    green: "user-pill-green",
    purple: "user-pill-purple",
    amber: "user-pill-amber",
    red: "user-pill-red",
    gray: "",
  };
  return `user-pill ${tones[tone]}`;
}

const primaryActionClass =
  "user-button-primary gap-2 max-[560px]:w-full";

const secondaryActionClass =
  "user-button-secondary gap-2 max-[560px]:w-full";

const textActionClass =
  "inline-flex items-center gap-2 text-sm font-bold text-[#4338ca] underline-offset-2 hover:underline";

const supportLinkClass =
  "flex min-h-8 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#4b5563] transition hover:bg-[#f8fafc] hover:text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/20";

const detailRowClass =
  "user-detail-surface p-3";

async function fetchDashboardBillingHistory(user: User) {
  const token = await user.getIdToken();
  const response = await fetch("/api/billing/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Could not load billing history");
  return (await response.json()) as DashboardBillingHistory;
}

type DashboardExamOption = {
  id: "ati_teas" | "hesi_a2" | "nursing_test_bank" | "nursing_exit_exams";
  name: string;
  description: string;
  href: string;
  packageIds: string[];
};

const DASHBOARD_EXAM_OPTIONS: DashboardExamOption[] = [
  {
    id: "ati_teas",
    name: "ATI TEAS 7",
    description: "Reading, math, science, and English entrance exam practice.",
    href: "/ati-teas-practice-test",
    packageIds: ["ati_teas"],
  },
  {
    id: "hesi_a2",
    name: "HESI A2",
    description: "Entrance exam practice for HESI A2 reading, vocabulary, grammar, math, and science.",
    href: "/hesi-a2-practice-test",
    packageIds: ["hesi_a2"],
  },
  {
    id: "nursing_test_bank",
    name: "Nursing Test Bank",
    description: "RN and LPN practice sets across core nursing school subjects.",
    href: "/nursing-test-bank",
    packageIds: ["nursing_test_bank_rn", "nursing_test_bank_lpn"],
  },
  {
    id: "nursing_exit_exams",
    name: "Nursing Exit Exams",
    description: "RN and LPN exit exam preparation and predictor-style practice.",
    href: "/nursing-exit-exam",
    packageIds: ["nursing_exit_exam_rn", "nursing_exit_exam_lpn"],
  },
];

function packageTone(status: DashboardPackageStatus) {
  if (status === "active" || status === "lifetime") return "green";
  if (status === "cancelling" || status === "free") return "purple";
  if (status === "payment_issue") return "amber";
  if (status === "expired") return "red";
  return "gray";
}

function packageStatusLabel(status: DashboardPackageStatus) {
  const labels: Record<DashboardPackageStatus, string> = {
    active: "Active",
    free: "Free Preview",
    expired: "Expired",
    locked: "Locked",
    cancelling: "Cancelling",
    lifetime: "Lifetime",
    payment_issue: "Payment issue",
  };
  return labels[status];
}

function hasActiveExamAccess(status: DashboardPackageStatus) {
  return status === "active" || status === "cancelling" || status === "lifetime";
}

function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`user-card overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="user-section-title">{title}</h2>
      {subtitle && <p className="user-body-sm mt-2 max-w-[88ch]">{subtitle}</p>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="user-stat-tile flex min-h-24 items-center gap-3 max-[420px]:items-start">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(79,70,229,.18)] bg-[rgba(79,70,229,.06)] text-[#4338ca]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="user-label">{label}</p>
        <p className="user-stat-value mt-1 text-xl">{value}</p>
        {helper && <p className="user-helper mt-1">{helper}</p>}
      </div>
    </div>
  );
}

function metricValue(value: number, fallback = "0") {
  return value > 0 ? String(value) : fallback;
}

function InfoRow({
  label,
  helper,
  value,
}: {
  label: string;
  helper?: string;
  value: React.ReactNode;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 max-[520px]:grid ${detailRowClass}`}>
      <div className="min-w-0">
        <b className="user-card-title block text-sm">{label}</b>
        {helper && <span className="user-helper mt-1 block">{helper}</span>}
      </div>
      <div className="min-w-0 shrink-0 text-right text-sm font-semibold text-[#0f172a] max-[520px]:text-left">{value}</div>
    </div>
  );
}

function ListLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`block transition hover:-translate-y-px hover:bg-white ${detailRowClass}`}>
      {children}
    </Link>
  );
}

function PackageCard({
  pkg,
  canRemove = false,
  isRemoving = false,
  onRemove,
}: {
  pkg: DashboardPackage;
  canRemove?: boolean;
  isRemoving?: boolean;
  onRemove?: () => void;
}) {
  const isStrong = hasActiveExamAccess(pkg.status);
  return (
    <div
      className={`flex min-h-[248px] flex-col p-4 transition max-[560px]:min-h-0 ${isStrong ? "user-feature-surface" : "user-detail-surface"}`}
    >
      <div className="flex items-start justify-between gap-3 max-[420px]:grid">
        <div className="min-w-0">
          <p className="user-label">Exam access</p>
          <h3 className="user-card-title mt-1">{pkg.name}</h3>
        </div>
        <span className={badgeClasses(packageTone(pkg.status))}>
          {packageStatusLabel(pkg.status)}
        </span>
      </div>
      <p className="user-helper mt-3">{pkg.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pkg.modes.map((mode) => (
          <span key={mode} className="user-badge">
            {mode}
          </span>
        ))}
      </div>
      {pkg.accessEndsAt && (
        <p className="user-helper mt-3">Access through {formatDashboardDate(pkg.accessEndsAt)}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 max-[560px]:grid">
        <Link
          href={pkg.status === "locked" || pkg.status === "expired" || pkg.status === "payment_issue" ? "/pricing" : pkg.href}
          className={isStrong ? primaryActionClass : secondaryActionClass}
        >
          {pkg.actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#fecaca] bg-white px-4 py-2 text-sm font-bold text-[#b91c1c] transition hover:bg-[#fff1f2] focus:outline-none focus:ring-2 focus:ring-[#ef4444]/20 disabled:cursor-not-allowed disabled:opacity-70 max-[560px]:w-full"
          >
            <Trash2 className="h-4 w-4" />
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}

function AddExamCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex min-h-[248px] flex-col rounded-[18px] border-2 border-dashed border-[#c7d2fe] bg-[#f8f7ff] p-4 transition hover:border-[#8b7cff] hover:bg-white max-[560px]:min-h-0">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#6a5cff] text-white shadow-sm shadow-[#6a5cff]/20">
        <PlusCircle className="h-6 w-6" />
      </div>
      <h3 className="user-card-title mt-4">Add exam</h3>
      <p className="user-helper mt-2">
        Choose another exam area to pin to this dashboard.
      </p>
      <div className="mt-auto pt-4">
        <button type="button" onClick={onOpen} className={primaryActionClass}>
          Choose exam
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function chosenExamOptionId(view: DashboardViewModel): DashboardExamOption["id"] | null {
  if (view.user.primaryExamId === "ati_teas_7") return "ati_teas";
  if (view.user.primaryExamId === "hesi_a2") return "hesi_a2";
  if (view.user.focusAreaLabel === "Nursing Test Bank") return "nursing_test_bank";
  if (view.user.focusAreaLabel === "Nursing Exit Exam") return "nursing_exit_exams";
  return null;
}

function packageIdForChosenExam(view: DashboardViewModel) {
  if (view.user.primaryExamId === "ati_teas_7") return "ati_teas";
  if (view.user.primaryExamId === "hesi_a2") return "hesi_a2";
  if (view.user.focusAreaLabel === "Nursing Test Bank") return "nursing_test_bank_rn";
  if (view.user.focusAreaLabel === "Nursing Exit Exam") return "nursing_exit_exam_rn";
  return null;
}

function packageForExamOption(optionId: DashboardExamOption["id"], packages: DashboardPackage[]) {
  const option = DASHBOARD_EXAM_OPTIONS.find((item) => item.id === optionId);
  if (!option) return null;
  const relatedPackages = packages.filter((pkg) => option.packageIds.includes(pkg.id));
  const activePackage = relatedPackages.find((pkg) => hasActiveExamAccess(pkg.status));
  return activePackage ?? relatedPackages[0] ?? null;
}

function examOptionIdForPackageId(packageId: string): DashboardExamOption["id"] | null {
  return DASHBOARD_EXAM_OPTIONS.find((option) => option.packageIds.includes(packageId))?.id ?? null;
}

function dashboardExamPackages(view: DashboardViewModel) {
  const activePackages = view.packages.filter((pkg) => hasActiveExamAccess(pkg.status));
  const chosenId = packageIdForChosenExam(view);
  const chosenActive = chosenId ? activePackages.find((pkg) => pkg.id === chosenId) : null;
  const chosenPackage = chosenId ? view.packages.find((pkg) => pkg.id === chosenId) : null;
  const primaryPackage = chosenActive ?? activePackages[0] ?? chosenPackage ?? null;
  const addedPackages = view.user.dashboardExamIds
    .map((optionId) => packageForExamOption(optionId as DashboardExamOption["id"], view.packages))
    .filter((pkg): pkg is DashboardPackage => Boolean(pkg));
  const byId = new Map<string, DashboardPackage>();

  // Keep the signup/active exam first, then append user-added dashboard exam cards.
  [primaryPackage, ...addedPackages].forEach((pkg) => {
    if (pkg) byId.set(pkg.id, pkg);
  });

  return Array.from(byId.values());
}

function examOptionStatus(option: DashboardExamOption, packages: DashboardPackage[]) {
  const relatedPackages = packages.filter((pkg) => option.packageIds.includes(pkg.id));
  const active = relatedPackages.find((pkg) => hasActiveExamAccess(pkg.status));
  return active ?? relatedPackages[0] ?? null;
}

function dashboardExamOptionIds(view: DashboardViewModel, displayedExams: DashboardPackage[]) {
  const ids = new Set<DashboardExamOption["id"]>();
  const chosenId = chosenExamOptionId(view);
  if (chosenId) ids.add(chosenId);
  displayedExams.forEach((exam) => {
    const id = DASHBOARD_EXAM_OPTIONS.find((option) => option.packageIds.includes(exam.id))?.id;
    if (id) ids.add(id);
  });
  view.user.dashboardExamIds.forEach((id) => {
    if (DASHBOARD_EXAM_OPTIONS.some((option) => option.id === id)) {
      ids.add(id as DashboardExamOption["id"]);
    }
  });
  return ids;
}

function AddExamModal({
  options,
  packages,
  savingExamId,
  onAdd,
  onClose,
}: {
  options: DashboardExamOption[];
  packages: DashboardPackage[];
  savingExamId: string | null;
  onAdd: (examId: DashboardExamOption["id"]) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm max-[560px]:items-end max-[560px]:p-2">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-exam-modal-title"
        className="user-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5 shadow-2xl max-[560px]:max-h-[92vh] max-[560px]:rounded-[1rem] max-[560px]:p-4"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#edf0f7] pb-4">
          <div>
            <p className="user-eyebrow">Add exam</p>
            <h2 id="add-exam-modal-title" className="user-section-title mt-1">
              Choose another exam area
            </h2>
            <p className="user-body-sm mt-2">
              These are the other exam areas available from your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d9deea] bg-white text-[#475569] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/30"
            aria-label="Close add exam"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {options.length === 0 ? (
          <div className="user-detail-surface mt-5 p-5 text-center">
            <h3 className="user-card-title">All exam areas are already shown</h3>
            <p className="user-helper mt-1">Your dashboard currently includes every available exam area.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option) => {
              const statusPackage = examOptionStatus(option, packages);
              const status = statusPackage?.status ?? "free";
              const saving = savingExamId === option.id;

              return (
                <article key={option.id} className="user-detail-surface flex min-h-[230px] flex-col p-4 max-[560px]:min-h-0">
                  <div className="flex items-start justify-between gap-3 max-[420px]:grid">
                    <h3 className="user-card-title">{option.name}</h3>
                    <span className={badgeClasses(packageTone(status))}>{packageStatusLabel(status)}</span>
                  </div>
                  <p className="user-helper mt-3">{option.description}</p>
                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => onAdd(option.id)}
                      disabled={saving}
                      className={`${saving ? secondaryActionClass : primaryActionClass} w-full`}
                    >
                      {saving ? "Adding..." : "Add to dashboard"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmailVerificationNotice({
  user,
  onVerified,
}: {
  user: User;
  onVerified: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resendVerification() {
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false,
      });
      setMessage("Verification email sent. Open the link in your inbox, then come back and check again.");
    } catch {
      setError("Could not send the verification email. Please wait a moment and try again.");
    } finally {
      setSending(false);
    }
  }

  async function checkVerification() {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      await user.reload();
      await user.getIdToken(true);
      if (user.emailVerified) {
        onVerified();
        return;
      }
      setMessage("Your email is not verified yet. Open the verification link from your inbox, then check again.");
    } catch {
      setError("Could not refresh your verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="user-alert user-alert-warning" role="status">
      <span className="user-alert-icon" aria-hidden="true">
        <Mail className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 max-[720px]:grid">
          <div className="min-w-0">
            <p className="user-card-title">Verify your email to keep full access to your account.</p>
            <p className="user-helper mt-1">Use the verification link sent to {user.email ?? "your email address"}.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[560px]:grid max-[560px]:w-full">
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={sending}
              className="user-button-secondary gap-2 max-[560px]:w-full"
            >
              {sending ? "Sending..." : "Resend Verification"}
            </button>
            <button
              type="button"
              onClick={() => void checkVerification()}
              disabled={checking}
              className="user-button-primary gap-2 max-[560px]:w-full"
            >
              {checking ? "Checking..." : "I Verified"}
            </button>
          </div>
        </div>
        {(message || error) && (
          <p className={`user-feedback ${error ? "user-feedback-error" : "user-feedback-success"}`}>
            {error ?? message}
          </p>
        )}
      </div>
    </div>
  );
}

function DashboardContent({
  view,
  uid,
  authUser,
}: {
  view: DashboardViewModel;
  uid: string;
  authUser: User;
}) {
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [addExamError, setAddExamError] = useState<string | null>(null);
  const [savingExamId, setSavingExamId] = useState<string | null>(null);
  const [removingExamId, setRemovingExamId] = useState<string | null>(null);
  const [emailVerifiedLocally, setEmailVerifiedLocally] = useState(false);
  const featuredExams = dashboardExamPackages(view);
  const displayedExamIds = dashboardExamOptionIds(view, featuredExams);
  const addExamOptions = DASHBOARD_EXAM_OPTIONS.filter((option) => !displayedExamIds.has(option.id));
  const focusLabel = view.user.primaryExamName || view.user.focusAreaLabel || "Not selected";
  const focusHref = "/profile?tab=account";
  const shouldShowEmailVerificationNotice = !emailVerifiedLocally && !view.user.emailVerified;
  const hasAttemptHistory = view.performance.totalAttempts > 0;
  const firstPracticeTitle = hasAttemptHistory ? "Continue your practice set" : "Start your first practice set";
  const firstPracticeDescription =
    view.user.primaryExamName
      ? `${view.user.primaryExamName} reading, math, science, and English.`
      : view.continueAction.description;
  const shouldShowAccessEnd = Boolean(view.access.accessEndsAt);
  const activeExamNames = featuredExams
    .filter((exam) => hasActiveExamAccess(exam.status))
    .map((exam) => exam.name)
    .filter((name, index, names) => names.indexOf(name) === index);
  const examAccessLabel = activeExamNames.length > 0 ? activeExamNames.join(", ") : "Free Preview";
  const emptyStatePracticeLabel = view.user.primaryExamName
    ? `Start ${view.user.primaryExamName} practice`
    : view.user.focusAreaLabel
      ? `Start ${view.user.focusAreaLabel} practice`
      : "Start practice";

  async function addDashboardExam(examId: DashboardExamOption["id"]) {
    setAddExamError(null);
    setSavingExamId(examId);
    try {
      const nextExamIds = Array.from(new Set([...view.user.dashboardExamIds, examId]));
      await updateUserDashboardExamIds(uid, nextExamIds);
      setIsAddExamOpen(false);
    } catch {
      setAddExamError("Could not add this exam to your dashboard.");
    } finally {
      setSavingExamId(null);
    }
  }

  async function removeDashboardExam(examId: DashboardExamOption["id"]) {
    setAddExamError(null);
    setRemovingExamId(examId);
    try {
      await updateUserDashboardExamIds(
        uid,
        view.user.dashboardExamIds.filter((id) => id !== examId)
      );
    } catch {
      setAddExamError("Could not remove this exam from your dashboard.");
    } finally {
      setRemovingExamId(null);
    }
  }

  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <header className="user-page-header">
            <div className="user-page-header-row">
              <div className="user-page-header-copy">
                <p className="user-eyebrow inline-flex items-center gap-2">
                  <span className="user-accent-dot" />
                  Student Dashboard
                </p>
                <h1 className="user-page-title mt-2">
                  Welcome back, {view.user.firstName}
                </h1>
                <p className="user-body-sm mt-3">
                  {view.user.primaryExamName
                    ? `Primary Exam: ${view.user.primaryExamName}`
                    : view.user.focusAreaLabel
                      ? `Primary Exam: ${view.user.focusAreaLabel}`
                      : "Choose a Primary Exam to make your dashboard more personal."}
                </p>
                <div className="user-page-header-meta mt-4">
                  <span className={badgeClasses(view.user.accountStatusLabel === "Active" ? "green" : "amber")}>
                    Account {view.user.accountStatusLabel}
                  </span>
                </div>
              </div>
              <div className="user-page-header-actions">
                <Link href="/profile" className={secondaryActionClass}>
                  <Settings className="h-4 w-4" />
                  Account settings
                </Link>
              </div>
            </div>
            {shouldShowEmailVerificationNotice && (
              <EmailVerificationNotice
                user={authUser}
                onVerified={() => setEmailVerifiedLocally(true)}
              />
            )}
          </header>

          {!view.user.userDocumentExists && (
            <div className="user-alert user-alert-warning mb-5" role="status">
              <span className="user-alert-icon" aria-hidden="true">!</span>
              <div>
                <p className="user-card-title">Profile data unavailable</p>
                <p className="user-helper mt-1">
                  Your profile document is not available yet. The dashboard is showing Firebase account data and safe empty states until your profile is created.
                </p>
              </div>
            </div>
          )}

          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-[18px] max-[1180px]:grid-cols-1">
            <div className="space-y-[18px]">
              <Card id="my-exams" className="p-4">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between max-[560px]:gap-4">
                  <div>
                    <h2 className="user-section-title">{firstPracticeTitle}</h2>
                    <p className="user-body-sm mt-2 max-w-2xl">
                      {firstPracticeDescription}
                    </p>
                    {view.continueAction.lastActivityAt && (
                      <p className="user-helper mt-2">
                        Last activity {formatDashboardDate(view.continueAction.lastActivityAt)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={view.continueAction.href}
                    className={`${primaryActionClass} shrink-0`}
                  >
                    {hasAttemptHistory ? view.continueAction.title : "Start Practice"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>

              <section className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[560px]:grid-cols-1">
                <MetricCard
                  label="Study streak"
                  value={view.performance.streakDays > 0 ? `${view.performance.streakDays}d` : "Not started"}
                  helper={view.performance.lastAttemptAt ? `Last practice: ${formatDashboardDate(view.performance.lastAttemptAt)}` : "Start a practice set"}
                  icon={<Sparkles className="h-5 w-5" />}
                />
                <MetricCard
                  label="Attempts"
                  value={metricValue(view.performance.totalAttempts)}
                  helper="Completed practice sets"
                  icon={<Trophy className="h-5 w-5" />}
                />
                <MetricCard
                  label="Questions"
                  value={metricValue(view.performance.questionsAnswered)}
                  helper="Answered so far"
                  icon={<BookOpen className="h-5 w-5" />}
                />
                <MetricCard
                  label="Accuracy"
                  value={view.performance.accuracy === null ? "Not started" : `${view.performance.accuracy}%`}
                  helper={view.performance.accuracy === null ? "Complete a set first" : "Rounded percentage"}
                  icon={<Target className="h-5 w-5" />}
                />
              </section>

              <Card className="p-4">
                <h2 className="sr-only">My Exams</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {featuredExams.length > 0 ? (
                    featuredExams.map((exam) => {
                      const optionId = examOptionIdForPackageId(exam.id);
                      const isUserAdded = Boolean(optionId && view.user.dashboardExamIds.includes(optionId));
                      const canRemove = Boolean(optionId && isUserAdded && !hasActiveExamAccess(exam.status));

                      return (
                        <PackageCard
                          key={exam.id}
                          pkg={exam}
                          canRemove={canRemove}
                          isRemoving={optionId === removingExamId}
                          onRemove={optionId ? () => void removeDashboardExam(optionId) : undefined}
                        />
                      );
                    })
                  ) : (
                    <div className="user-detail-surface flex min-h-[248px] flex-col p-4">
                      <p className="user-label">Primary Exam</p>
                      <h3 className="user-card-title mt-1">Choose your first exam</h3>
                      <p className="user-helper mt-3">
                        Select a Primary Exam so the dashboard can show the right exam first.
                      </p>
                      <div className="mt-auto pt-4">
                        <Link href={focusHref} className={primaryActionClass}>
                          Choose Primary Exam
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                  {addExamOptions.length > 0 && <AddExamCard onOpen={() => setIsAddExamOpen(true)} />}
                </div>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Recent Activity" />
                {view.recentActivity.length ? (
                  <div className="space-y-3">
                    {view.recentActivity.map((item) => (
                      <ListLink key={item.id} href={item.href}>
                        <p className="user-card-title">{item.title}</p>
                        <p className="user-helper mt-1">{item.category}</p>
                      </ListLink>
                    ))}
                  </div>
                ) : (
                  <div className="user-detail-surface p-5">
                    <h3 className="user-card-title">Your activity will show up here</h3>
                    <p className="user-helper mt-1 max-w-lg">
                      Complete a practice set to start tracking your history and scores.
                    </p>
                    <Link href={view.continueAction.href} className={`${secondaryActionClass} mt-4`}>
                      {emptyStatePracticeLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <SectionHeader title="Completed Exams" />
                {view.completedExams.length ? (
                  <div className="space-y-3">
                    {view.completedExams.map((exam) => (
                      <ListLink key={exam.id} href={exam.href}>
                        <p className="user-card-title">{exam.title}</p>
                        <p className="user-helper mt-1">{formatDashboardDate(exam.completedAt)}</p>
                      </ListLink>
                    ))}
                  </div>
                ) : (
                  <div className="user-detail-surface p-5">
                    <h3 className="user-card-title">Your completed exams will show up here</h3>
                    <p className="user-helper mt-1 max-w-lg">
                      Finish a practice set to review your score, answers, and completed exam history.
                    </p>
                    <Link href={view.continueAction.href} className={`${secondaryActionClass} mt-4`}>
                      {emptyStatePracticeLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            <aside className="space-y-[18px]">
              <Card className="p-4">
                <SectionHeader title="Account and Access" />
                <div className="space-y-3">
                  <InfoRow
                    label="Primary Exam"
                    helper="Change this from Profile > Account"
                    value={
                      <Link href={focusHref} className={textActionClass}>
                        {focusLabel}
                      </Link>
                    }
                  />
                  <InfoRow label="Exam Access" helper="Current exam access" value={examAccessLabel} />
                  <InfoRow label="Access Status" helper="Current access state" value={activeExamNames.length > 0 ? "Active" : "Free Preview"} />
                  {shouldShowAccessEnd && (
                    <InfoRow label="Access Ends" helper="Renew before access expires" value={formatDashboardDate(view.access.accessEndsAt)} />
                  )}
                </div>
                <div className="mt-4 grid gap-2">
                  <Link href="/pricing" className={primaryActionClass}>
                    View Plans
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Knowledge Base" />
                <p className="user-helper">
                  Practical guidance before starting longer practice sets.
                </p>
                <Link href="/knowledge-base" className={`mt-3 ${textActionClass}`}>
                  Open guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="p-4 opacity-80">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <h2 className="user-section-title">Referral Summary</h2>
                  <span className="user-badge user-badge-amber">Unlocks after first attempt</span>
                </div>
                {view.referral.code && (
                  <div className={detailRowClass}>
                    <p className="user-label">Referral code</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[#0f172a]">{view.referral.code}</p>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className={detailRowClass}>
                    <p className="user-helper">Referrals</p>
                    <p className="mt-1 font-semibold text-[#0f172a]">{view.referral.totalReferrals}</p>
                  </div>
                  <div className={detailRowClass}>
                    <p className="user-helper">Converted</p>
                    <p className="mt-1 font-semibold text-[#0f172a]">{view.referral.convertedReferrals}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Support links" />
                <div className="grid gap-1.5 text-sm">
                  <Link href="/contact" className={supportLinkClass}>
                    <HelpCircle className="h-3.5 w-3.5 text-[#4338ca]" />
                    Contact support
                  </Link>
                  <Link href="/terms-and-conditions" className={supportLinkClass}>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#4338ca]" />
                    Terms
                  </Link>
                  <Link href="/privacy-policy" className={supportLinkClass}>
                    <Lock className="h-3.5 w-3.5 text-[#4338ca]" />
                    Privacy
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      {isAddExamOpen && (
        <AddExamModal
          options={addExamOptions}
          packages={view.packages}
          savingExamId={savingExamId}
          onAdd={(examId) => void addDashboardExam(examId)}
          onClose={() => setIsAddExamOpen(false)}
        />
      )}
      {addExamError && (
        <div className="sr-only" role="alert">
          {addExamError}
        </div>
      )}
    </Layout>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [billingHistory, setBillingHistory] = useState<DashboardBillingHistory | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (!currentUser) return;
    setDocLoading(true);
    const unsubscribe = subscribeUserDocument(
      currentUser.uid,
      (doc) => {
        setUserDoc(doc);
        setDocLoading(false);
      },
      () => {
        setDocError("Some dashboard sections could not be loaded.");
        setDocLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    async function loadBillingHistory() {
      try {
        const history = await fetchDashboardBillingHistory(currentUser as User);
        if (!cancelled) setBillingHistory(history);
      } catch {
        if (!cancelled) setDocError("Some billing details could not be loaded.");
      }
    }

    void loadBillingHistory();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const view = useMemo(() => {
    if (!currentUser) return null;
    return buildDashboardViewModel(userDoc, currentUser, billingHistory);
  }, [billingHistory, currentUser, userDoc]);

  if (loading || (currentUser && docLoading)) {
    return (
      <Layout>
        <main className="user-page">
          <div className="user-page-container">
            <div className="user-card mx-auto mt-12 max-w-xl p-5">
              <p className="user-card-title">Loading your dashboard</p>
              <div className="mt-4 grid gap-3">
                <div className="user-skeleton h-5 w-2/3" />
                <div className="user-skeleton h-4 w-full" />
                <div className="user-skeleton h-4 w-3/4" />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!currentUser || !view) {
    return null;
  }

  return (
    <>
      {docError && (
        <div className="sr-only" role="status">
          {docError}
        </div>
      )}
      <DashboardContent view={view} uid={currentUser.uid} authUser={currentUser} />
    </>
  );
}
