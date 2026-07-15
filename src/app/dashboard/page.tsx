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
    green: "border-dashed border-[rgba(43,170,96,.45)] bg-[rgba(43,170,96,.10)] text-[#2baa60]",
    purple: "border-dashed border-[rgba(106,92,255,.38)] bg-[rgba(106,92,255,.08)] text-[#4f46e5]",
    amber: "border-dashed border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] text-[#b45309]",
    red: "border-dashed border-[rgba(239,68,68,.45)] bg-[rgba(239,68,68,.11)] text-[#b91c1c]",
    gray: "border-dashed border-[#e0e3f0] bg-[rgba(255,255,255,.65)] text-[#7a819c]",
  };
  return `inline-flex min-h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-[10px] text-[11px] font-semibold leading-none ${tones[tone]}`;
}

const primaryActionClass =
  "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#6a5cff] to-[#4f46e5] px-[14px] text-sm font-semibold text-white shadow-[0_14px_34px_rgba(106,92,255,.28)] transition hover:-translate-y-px hover:shadow-[0_18px_42px_rgba(79,70,229,.33)]";

const secondaryActionClass =
  "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-[14px] text-sm font-semibold text-[#7a819c] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]";

const textActionClass =
  "inline-flex items-center gap-2 text-sm font-semibold text-[#6a5cff] underline-offset-2 hover:underline";

const supportLinkClass =
  "flex min-h-[38px] items-center gap-2 rounded-full border border-[#e0e3f0] bg-[rgba(255,255,255,.85)] px-[14px] font-semibold text-[#202437] transition hover:-translate-y-px hover:border-[rgba(106,92,255,.32)] hover:bg-[rgba(106,92,255,.08)] hover:text-[#6a5cff]";

const detailRowClass =
  "rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3";

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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(23,35,79,.08)] ${className}`}>
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
      <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#202437]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-[88ch] text-[13px] text-[#7a819c]">{subtitle}</p>}
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
    <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-[rgba(106,92,255,.22)] bg-[rgba(106,92,255,.045)] p-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a5bf]">{label}</p>
        <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#202437]">{value}</p>
        {helper && <p className="mt-1 text-xs leading-5 text-[#7a819c]">{helper}</p>}
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
        <b className="block text-[13px] font-semibold text-[#202437]">{label}</b>
        {helper && <span className="mt-[6px] block text-xs leading-[1.35] text-[#7a819c]">{helper}</span>}
      </div>
      <div className="shrink-0 text-right text-sm font-semibold text-[#202437]">{value}</div>
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
    <Link href={href} className={`block transition hover:-translate-y-px hover:bg-[rgba(106,92,255,.08)] ${detailRowClass}`}>
      {children}
    </Link>
  );
}

function PackageCard({ pkg }: { pkg: DashboardPackage }) {
  const isStrong = ["active", "cancelling", "lifetime"].includes(pkg.status);
  return (
    <div
      className={`flex min-h-[248px] flex-col rounded-xl border border-dashed p-3 transition ${
        isStrong
          ? "border-[rgba(106,92,255,.38)] bg-[rgba(106,92,255,.045)]"
          : "border-[#e0e3f0] bg-[rgba(245,246,251,.65)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a5bf]">Package</p>
          <h3 className="mt-1 text-sm font-semibold text-[#202437]">{pkg.name}</h3>
        </div>
        <span className={badgeClasses(packageTone(pkg.status))}>
          {packageStatusLabel(pkg.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#7a819c]">{pkg.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pkg.modes.map((mode) => (
          <span key={mode} className="rounded-full border border-dashed border-[#e0e3f0] bg-white px-[10px] py-[6px] text-[11px] font-semibold text-[#7a819c]">
            {mode}
          </span>
        ))}
      </div>
      {pkg.accessEndsAt && (
        <p className="mt-3 text-xs text-[#7a819c]">Access through {formatDashboardDate(pkg.accessEndsAt)}</p>
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
          <h3 className="text-sm font-semibold text-[#202437]">{title}</h3>
          <p className="mt-1 text-xs text-[#7a819c]">Two package cards from the left panel structure.</p>
        </div>
        <span className={badgeClasses("gray")}>{packages.length} packages</span>
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
    <div className="rounded-xl border border-dashed border-[#e0e3f0] bg-[rgba(245,246,251,.65)] p-5 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#202437]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#7a819c]">{text}</p>
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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(106,92,255,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.05),transparent_55%),#f5f6fb]">
        <div className="mx-auto max-w-[1220px] px-4 pb-14 pt-[18px] text-[#202437] max-[560px]:px-[14px] max-[560px]:pb-[46px] max-[560px]:pt-[14px]">
          <header className="pb-[14px] pt-[18px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
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
              <h1 className="mt-3 text-[30px] font-extrabold tracking-[-0.03em] text-[#202437] max-[560px]:text-2xl">
                Welcome back, {view.user.firstName}
              </h1>
              <p className="mt-2 max-w-[96ch] text-sm font-medium text-[#7a819c]">
                {view.user.primaryExamName
                  ? `Primary focus: ${view.user.primaryExamName}`
                  : view.user.focusAreaLabel
                    ? `Study focus: ${view.user.focusAreaLabel}`
                    : "Choose a study focus to make your dashboard more personal."}
              </p>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-end gap-[10px] max-[720px]:items-start max-[720px]:justify-start">
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
            <div className="mb-4 rounded-xl border border-dashed border-[rgba(245,158,11,.45)] bg-[rgba(245,158,11,.12)] p-4 text-sm font-medium text-[#b45309]">
              Your profile document is not available yet. The dashboard is showing Firebase account data and safe empty states until your profile is created.
            </div>
          )}

          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-[18px] max-[980px]:grid-cols-1">
            <div className="space-y-[18px]">
              <Card className="p-4">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-[rgba(106,92,255,.45)] bg-white text-[#6a5cff]">
                      <Target className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-[#202437]">Continue studying</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a819c]">
                      {view.continueAction.description}
                    </p>
                    {view.continueAction.lastActivityAt && (
                      <p className="mt-2 text-xs text-[#7a819c]">
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
                          <p className="text-sm font-semibold text-[#202437]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#7a819c]">{item.category}</p>
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
                          <p className="text-sm font-semibold text-[#202437]">{exam.title}</p>
                          <p className="mt-1 text-xs text-[#7a819c]">{formatDashboardDate(exam.completedAt)}</p>
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
                        <p className="text-sm font-semibold text-[#202437]">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#7a819c]">{item.description}</p>
                        <p className="mt-2 text-xs font-semibold text-[#6a5cff]">{item.actionLabel}</p>
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
                      <Link key={task.id} href={task.href} className={`flex gap-3 transition hover:-translate-y-px hover:bg-[rgba(106,92,255,.08)] ${detailRowClass}`}>
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                        <span>
                          <span className="block text-sm font-semibold text-[#202437]">{task.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-[#7a819c]">{task.description}</span>
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
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a5bf]">Referral code</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[#202437]">{view.referral.code}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className={detailRowClass}>
                      <p className="text-xs text-[#7a819c]">Referrals</p>
                      <p className="mt-1 font-semibold text-[#202437]">{view.referral.totalReferrals}</p>
                    </div>
                    <div className={detailRowClass}>
                      <p className="text-xs text-[#7a819c]">Converted</p>
                      <p className="mt-1 font-semibold text-[#202437]">{view.referral.convertedReferrals}</p>
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
                    <HelpCircle className="h-4 w-4 text-[#6a5cff]" />
                    Contact support
                  </Link>
                  <Link href="/knowledge-base" className={supportLinkClass}>
                    <BookOpen className="h-4 w-4 text-[#6a5cff]" />
                    Knowledge Base
                  </Link>
                  <Link href="/terms-and-conditions" className={supportLinkClass}>
                    <ShieldCheck className="h-4 w-4 text-[#6a5cff]" />
                    Terms
                  </Link>
                  <Link href="/privacy-policy" className={supportLinkClass}>
                    <Lock className="h-4 w-4 text-[#6a5cff]" />
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
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-b-[#6a5cff]" />
            <p className="mt-4 text-sm font-medium text-gray-600">Loading your dashboard...</p>
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
