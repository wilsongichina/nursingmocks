"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import {
  buildDashboardViewModel,
  formatDashboardDate,
  type DashboardPackage,
  type DashboardPackageStatus,
  type DashboardViewModel,
} from "@/lib/dashboard/dashboard-view-model";
import { subscribeUserDocument } from "@/lib/user-document-firestore";
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
  "user-button-primary gap-2";

const secondaryActionClass =
  "user-button-secondary gap-2";

const textActionClass =
  "inline-flex items-center gap-2 text-sm font-bold text-[#4338ca] underline-offset-2 hover:underline";

const supportLinkClass =
  "user-subnav-link";

const detailRowClass =
  "user-detail-surface p-3";

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
    free: "Free preview",
    expired: "Expired",
    locked: "Locked",
    cancelling: "Cancelling",
    lifetime: "Lifetime",
    payment_issue: "Payment issue",
  };
  return labels[status];
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
    <div className="user-stat-tile flex min-h-24 items-center gap-3">
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
    <div className={`flex items-start justify-between gap-3 ${detailRowClass}`}>
      <div className="min-w-0">
        <b className="user-card-title block text-sm">{label}</b>
        {helper && <span className="user-helper mt-1 block">{helper}</span>}
      </div>
      <div className="shrink-0 text-right text-sm font-semibold text-[#0f172a]">{value}</div>
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

function PackageCard({ pkg }: { pkg: DashboardPackage }) {
  const isStrong = ["active", "cancelling", "lifetime"].includes(pkg.status);
  return (
    <div
      className={`flex min-h-[248px] flex-col p-4 transition ${isStrong ? "user-feature-surface" : "user-detail-surface"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="user-label">Package</p>
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
      <div className="mt-auto pt-4">
        <Link
          href={pkg.status === "locked" || pkg.status === "expired" || pkg.status === "payment_issue" ? "/pricing" : pkg.href}
          className={isStrong ? primaryActionClass : secondaryActionClass}
        >
          {pkg.actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PackageGroup({
  title,
  packages,
}: {
  title: DashboardPackage["family"];
  packages: DashboardPackage[];
}) {
  return (
    <section className={detailRowClass}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="user-card-title">{title}</h3>
          <p className="user-helper mt-1">Two package cards from the left panel structure.</p>
        </div>
        <span className="user-badge">{packages.length} packages</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="user-detail-surface p-5 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
        {icon}
      </div>
      <h3 className="user-card-title mt-3">{title}</h3>
      <p className="user-helper mt-1">{text}</p>
    </div>
  );
}

function DashboardContent({ view }: { view: DashboardViewModel }) {
  const packageFamilies: DashboardPackage["family"][] = [
    "Nursing Entrance Exams",
    "Nursing Test Bank",
    "Nursing Exit Exams",
  ];
  const focusLabel = view.user.primaryExamName || view.user.focusAreaLabel || "Not selected";
  const focusHref = "/profile?tab=account";

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
                  ? `Primary focus: ${view.user.primaryExamName}`
                  : view.user.focusAreaLabel
                    ? `Study focus: ${view.user.focusAreaLabel}`
                    : "Choose a study focus to make your dashboard more personal."}
              </p>
              <div className="user-page-header-meta mt-4">
                <span className={badgeClasses(view.access.status === "past_due" ? "amber" : view.access.status === "expired" ? "red" : view.access.status === "free" ? "purple" : "green")}>
                  {view.access.label}
                </span>
                <span className={badgeClasses(view.user.accountStatusLabel === "Active" ? "green" : "amber")}>
                  Account {view.user.accountStatusLabel}
                </span>
                {!view.user.emailVerified && (
                  <span className={badgeClasses("amber")}>
                    <AlertCircle className="mr-1 h-3.5 w-3.5" />
                    Email not verified
                  </span>
                )}
              </div>
            </div>
            <div className="user-page-header-actions">
              <Link href="/profile" className={secondaryActionClass}>
                <Settings className="h-4 w-4" />
                Account settings
              </Link>
              <Link href="/contact" className={primaryActionClass}>
                Contact support
              </Link>
            </div>
            </div>
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

          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-[18px] max-[980px]:grid-cols-1">
            <div className="space-y-[18px]">
              <Card id="my-exams" className="p-4">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)] text-[#4338ca]">
                      <Target className="h-6 w-6" />
                    </div>
                    <h2 className="user-section-title mt-4">Continue studying</h2>
                    <p className="user-body-sm mt-2 max-w-2xl">
                      {view.continueAction.description}
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
                    {view.continueAction.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>

              <section className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
                <MetricCard
                  label="Completed attempts"
                  value={String(view.performance.completedExams)}
                  helper={view.performance.hasStats ? "From your profile stats" : "No attempts yet"}
                  icon={<Trophy className="h-5 w-5" />}
                />
                <MetricCard
                  label="Questions answered"
                  value={String(view.performance.questionsAnswered)}
                  helper="Real profile value"
                  icon={<BookOpen className="h-5 w-5" />}
                />
                <MetricCard
                  label="Overall accuracy"
                  value={view.performance.accuracy === null ? "--" : `${view.performance.accuracy}%`}
                  helper={view.performance.accuracy === null ? "Complete a practice exam first" : "Rounded percentage"}
                  icon={<Target className="h-5 w-5" />}
                />
                <MetricCard
                  label="Study streak"
                  value={`${view.performance.streakDays}d`}
                  helper={`Last practice: ${formatDashboardDate(view.performance.lastAttemptAt)}`}
                  icon={<Sparkles className="h-5 w-5" />}
                />
              </section>

              {!view.performance.hasStats && (
                <EmptyState
                  icon={<Trophy className="h-5 w-5" />}
                  title="Performance tracking starts after your first practice exam"
                  text="Complete your first practice exam to begin tracking attempts, answered questions, accuracy, and streaks."
                />
              )}

              <Card className="p-4">
                <SectionHeader
                  title="My Packages"
                  subtitle="Packages are grouped by the three exam types from the left panel. Each group has two package cards."
                />
                <div className="space-y-4">
                  {packageFamilies.map((family) => (
                    <PackageGroup
                      key={family}
                      title={family}
                      packages={view.packages.filter((pkg) => pkg.family === family)}
                    />
                  ))}
                </div>
              </Card>

              <div className="grid gap-[18px] xl:grid-cols-2">
                <Card className="p-4">
                  <SectionHeader title="Recent activity" subtitle="Owner-scoped attempt history will appear here when reliable attempt data exists." />
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
                    <EmptyState
                      icon={<Clock className="h-5 w-5" />}
                      title="No recent quiz activity yet"
                      text="The codebase does not currently expose a confirmed owner-scoped attempt feed, so this section stays empty instead of showing fake activity."
                    />
                  )}
                </Card>

                <Card className="p-4">
                  <SectionHeader title="Completed Exams" subtitle="Recent completed exams will appear here when result records are available." />
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
                    <EmptyState
                      icon={<CheckCircle2 className="h-5 w-5" />}
                      title="No completed exams yet"
                      text="Complete a practice exam and this area can show review links once the result model is connected."
                    />
                  )}
                </Card>
              </div>
            </div>

            <aside className="space-y-[18px]">
              <Card className="p-4">
                <SectionHeader title="Account and subscription" />
                <div className="space-y-3">
                  <InfoRow
                    label="Recommended focus"
                    helper="Change this from Profile > Account"
                    value={
                      <Link href={focusHref} className={textActionClass}>
                        {focusLabel}
                      </Link>
                    }
                  />
                  <InfoRow label="Status" helper="Current access state" value={view.access.label} />
                  <InfoRow label="Plan" helper="Active subscription snapshot" value={view.access.planName || "No active paid plan"} />
                  <InfoRow label="Access end" helper="Renew before access expires" value={formatDashboardDate(view.access.accessEndsAt)} />
                </div>
                <div className="mt-4 grid gap-2">
                  <Link href={focusHref} className={secondaryActionClass}>
                    Change focus
                  </Link>
                  <Link href="/payments" className={secondaryActionClass}>
                    Manage subscription
                  </Link>
                  <Link href="/pricing" className={primaryActionClass}>
                    View plans
                  </Link>
                </div>
              </Card>

              {view.recommendations.length > 0 && (
                <Card className="p-4">
                  <SectionHeader title="Recommended for you" />
                  <div className="space-y-3">
                    {view.recommendations.map((item) => (
                      <ListLink key={item.id} href={item.href}>
                        <p className="user-card-title">{item.title}</p>
                        <p className="user-helper mt-1">{item.description}</p>
                        <p className="mt-2 text-sm font-bold text-[#4338ca]">{item.actionLabel}</p>
                      </ListLink>
                    ))}
                  </div>
                </Card>
              )}

              {view.profileTasks.length > 0 && (
                <Card className="p-4">
                  <SectionHeader title="Profile tasks" />
                  <div className="space-y-3">
                    {view.profileTasks.map((task) => (
                      <Link key={task.id} href={task.href} className={`flex gap-3 transition hover:-translate-y-px hover:bg-white ${detailRowClass}`}>
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                        <span>
                          <span className="user-card-title block">{task.title}</span>
                          <span className="user-helper mt-1 block">{task.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {view.referral.shouldShow && (
                <Card className="p-4">
                  <SectionHeader title="Referral summary" />
                  <div className={detailRowClass}>
                    <p className="user-label">Referral code</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[#0f172a]">{view.referral.code}</p>
                  </div>
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
                  <Link href="/referrals" className={`mt-4 ${textActionClass}`}>
                    Open referrals
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              )}

              <Card className="p-4">
                <SectionHeader title="Support links" />
                <div className="grid gap-2 text-sm">
                  <Link href="/contact" className={supportLinkClass}>
                    <HelpCircle className="h-4 w-4 text-[#4338ca]" />
                    Contact support
                  </Link>
                  <Link href="/knowledge-base" className={supportLinkClass}>
                    <BookOpen className="h-4 w-4 text-[#4338ca]" />
                    Knowledge Base
                  </Link>
                  <Link href="/terms-and-conditions" className={supportLinkClass}>
                    <ShieldCheck className="h-4 w-4 text-[#4338ca]" />
                    Terms
                  </Link>
                  <Link href="/privacy-policy" className={supportLinkClass}>
                    <Lock className="h-4 w-4 text-[#4338ca]" />
                    Privacy
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
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

  const view = useMemo(() => {
    if (!currentUser) return null;
    return buildDashboardViewModel(userDoc, currentUser);
  }, [currentUser, userDoc]);

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
      <DashboardContent view={view} />
    </>
  );
}
