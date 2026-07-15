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
    green: "border-green-200 bg-green-50 text-green-700",
    purple: "border-[#d8d3ff] bg-[#f2f0ff] text-[#5948e8]",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return `inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`;
}

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
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
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
      <h2 className="text-base font-bold text-gray-950">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
        </div>
        <div className="rounded-lg bg-[#f2f0ff] p-2 text-[#6a5cff]">{icon}</div>
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: DashboardPackage }) {
  const isStrong = ["active", "cancelling", "lifetime"].includes(pkg.status);
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isStrong
          ? "border-[#c9c2ff] bg-[#faf9ff] shadow-sm"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{pkg.family}</p>
          <h3 className="mt-1 text-sm font-bold text-gray-950">{pkg.name}</h3>
        </div>
        <span className={badgeClasses(packageTone(pkg.status))}>
          {packageStatusLabel(pkg.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{pkg.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pkg.modes.map((mode) => (
          <span key={mode} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {mode}
          </span>
        ))}
      </div>
      {pkg.accessEndsAt && (
        <p className="mt-3 text-xs text-gray-500">Access through {formatDashboardDate(pkg.accessEndsAt)}</p>
      )}
      <div className="mt-4">
        <Link
          href={pkg.status === "locked" || pkg.status === "expired" || pkg.status === "payment_issue" ? "/pricing" : pkg.href}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            isStrong
              ? "bg-[#6a5cff] text-white hover:bg-[#5848e8]"
              : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          {pkg.actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
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
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-500">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-gray-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}

function DashboardContent({ view }: { view: DashboardViewModel }) {
  const activePackages = view.packages.filter((pkg) => ["active", "cancelling", "lifetime"].includes(pkg.status));
  const previewPackages = view.packages.filter((pkg) => pkg.status === "free").slice(0, 3);
  const lockedPackages = view.packages.filter((pkg) => !["active", "cancelling", "lifetime", "free"].includes(pkg.status)).slice(0, 6);
  const packagesToShow = [...activePackages, ...previewPackages, ...lockedPackages].slice(0, 9);

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
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
              <h1 className="mt-3 text-2xl font-bold text-gray-950 sm:text-3xl">
                Welcome back, {view.user.firstName}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {view.user.primaryExamName
                  ? `Primary focus: ${view.user.primaryExamName}`
                  : view.user.focusAreaLabel
                    ? `Study focus: ${view.user.focusAreaLabel}`
                    : "Choose a study focus to make your dashboard more personal."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                <Settings className="h-4 w-4" />
                Account settings
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-[#6a5cff] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5848e8]">
                Contact support
              </Link>
            </div>
          </div>

          {!view.user.userDocumentExists && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your profile document is not available yet. The dashboard is showing Firebase account data and safe empty states until your profile is created.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f0ff] text-[#6a5cff]">
                      <Target className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-950">Continue studying</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                      {view.continueAction.description}
                    </p>
                    {view.continueAction.lastActivityAt && (
                      <p className="mt-2 text-xs text-gray-500">
                        Last activity {formatDashboardDate(view.continueAction.lastActivityAt)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={view.continueAction.href}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#6a5cff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#5848e8]"
                  >
                    {view.continueAction.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              </div>

              {!view.performance.hasStats && (
                <EmptyState
                  icon={<Trophy className="h-5 w-5" />}
                  title="Performance tracking starts after your first practice exam"
                  text="Complete your first practice exam to begin tracking attempts, answered questions, accuracy, and streaks."
                />
              )}

              <Card className="p-5">
                <SectionHeader
                  title="My Packages"
                  subtitle="Active packages are shown first. Free users can preview the first 10 questions per set where previews are available."
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {packagesToShow.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="p-5">
                  <SectionHeader title="Recent activity" subtitle="Owner-scoped attempt history will appear here when reliable attempt data exists." />
                  {view.recentActivity.length ? (
                    <div className="space-y-3">
                      {view.recentActivity.map((item) => (
                        <Link key={item.id} href={item.href} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                          <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </Link>
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

                <Card className="p-5">
                  <SectionHeader title="Completed Exams" subtitle="Recent completed exams will appear here when result records are available." />
                  {view.completedExams.length ? (
                    <div className="space-y-3">
                      {view.completedExams.map((exam) => (
                        <Link key={exam.id} href={exam.href} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                          <p className="text-sm font-semibold text-gray-950">{exam.title}</p>
                          <p className="text-xs text-gray-500">{formatDashboardDate(exam.completedAt)}</p>
                        </Link>
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

            <aside className="space-y-6">
              <Card className="p-5">
                <SectionHeader title="Account and subscription" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Status</span>
                    <span className="font-semibold text-gray-950">{view.access.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Plan</span>
                    <span className="text-right font-semibold text-gray-950">{view.access.planName || "No active paid plan"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">Access end</span>
                    <span className="text-right font-semibold text-gray-950">{formatDashboardDate(view.access.accessEndsAt)}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <Link href="/payments" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                    Manage subscription
                  </Link>
                  <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6a5cff] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5848e8]">
                    View plans
                  </Link>
                </div>
              </Card>

              {view.recommendations.length > 0 && (
                <Card className="p-5">
                  <SectionHeader title="Recommended for you" />
                  <div className="space-y-3">
                    {view.recommendations.map((item) => (
                      <Link key={item.id} href={item.href} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                        <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-600">{item.description}</p>
                        <p className="mt-2 text-xs font-bold text-[#6a5cff]">{item.actionLabel}</p>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {view.profileTasks.length > 0 && (
                <Card className="p-5">
                  <SectionHeader title="Profile tasks" />
                  <div className="space-y-3">
                    {view.profileTasks.map((task) => (
                      <Link key={task.id} href={task.href} className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>
                          <span className="block text-sm font-semibold text-gray-950">{task.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-gray-600">{task.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {view.referral.shouldShow && (
                <Card className="p-5">
                  <SectionHeader title="Referral summary" />
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Referral code</p>
                    <p className="mt-1 font-mono text-sm font-bold text-gray-950">{view.referral.code}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Referrals</p>
                      <p className="mt-1 font-bold text-gray-950">{view.referral.totalReferrals}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Converted</p>
                      <p className="mt-1 font-bold text-gray-950">{view.referral.convertedReferrals}</p>
                    </div>
                  </div>
                  <Link href="/referrals" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6a5cff]">
                    Open referrals
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              )}

              <Card className="p-5">
                <SectionHeader title="Support links" />
                <div className="grid gap-2 text-sm">
                  <Link href="/contact" className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-50">
                    <HelpCircle className="h-4 w-4 text-[#6a5cff]" />
                    Contact support
                  </Link>
                  <Link href="/knowledge-base" className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-50">
                    <BookOpen className="h-4 w-4 text-[#6a5cff]" />
                    Knowledge Base
                  </Link>
                  <Link href="/terms-and-conditions" className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-50">
                    <ShieldCheck className="h-4 w-4 text-[#6a5cff]" />
                    Terms
                  </Link>
                  <Link href="/privacy-policy" className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-50">
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
