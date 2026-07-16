"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Filter,
  LockKeyhole,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { buildMyExamsViewModel } from "@/lib/my-exams/get-my-exams";
import type { ExamAccessState, ExamProgressStatus, MyExamItem, MyExamsViewModel } from "@/lib/my-exams/types";
import { subscribeUserDocument } from "@/lib/user-document-firestore";
import type { UserDocument } from "@/types/user-document";

type ExamTab = "all" | "in-progress" | "not-started" | "completed";
type SortOption = "recommended" | "recent" | "name" | "highest-score" | "lowest-score";

const TAB_LABELS: Record<ExamTab, string> = {
  all: "All Exams",
  "in-progress": "In Progress",
  "not-started": "Not Started",
  completed: "Completed",
};

function tabFromQuery(value: string | null): ExamTab {
  if (value === "in-progress" || value === "not-started" || value === "completed") return value;
  return "all";
}

function titleForStatus(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "locked") return "Locked";
  if (access === "preview") return "Preview";
  const labels: Record<ExamProgressStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
    retake_available: "Retake Available",
    preview: "Preview",
    locked: "Locked",
  };
  return labels[status];
}

function statusTone(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "locked") return "";
  if (access === "preview") return "user-pill-purple";
  if (status === "completed" || status === "retake_available") return "user-pill-green";
  if (status === "in_progress") return "user-pill-amber";
  return "user-pill-purple";
}

function primaryAction(exam: MyExamItem) {
  if (exam.accessState === "locked") return { label: "View Access Options", href: "/payments", className: "user-button-secondary" };
  if (exam.accessState === "preview") return { label: "Start Free Preview", href: exam.href, className: "user-button-secondary" };
  if (exam.progressStatus === "in_progress") return { label: "Continue", href: exam.href, className: "user-button-primary" };
  if (exam.progressStatus === "completed") return { label: "Review Results", href: "/progress-reports", className: "user-button-secondary" };
  if (exam.progressStatus === "retake_available") return { label: "Retake", href: exam.href, className: "user-button-primary" };
  return { label: "Start Exam", href: exam.href, className: "user-button-primary" };
}

function modeLabel(mode: MyExamItem["supportedModes"][number]) {
  const labels = {
    study: "Study Mode",
    practice: "Practice Mode",
    exam: "Exam Mode",
  };
  return labels[mode];
}

function matchesTab(exam: MyExamItem, tab: ExamTab) {
  if (tab === "all") return true;
  if (tab === "in-progress") return exam.progressStatus === "in_progress";
  if (tab === "completed") return exam.progressStatus === "completed" || exam.progressStatus === "retake_available";
  return exam.progressStatus === "not_started" || exam.progressStatus === "preview";
}

function searchText(exam: MyExamItem) {
  return [
    exam.title,
    exam.familyName,
    exam.subjectName,
    exam.setNumber ? `set ${exam.setNumber}` : "",
    exam.slug,
  ].join(" ").toLowerCase();
}

function sortExams(exams: MyExamItem[], sort: SortOption) {
  const copy = [...exams];
  if (sort === "name") return copy.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "highest-score") return copy.sort((a, b) => (b.bestScore ?? -1) - (a.bestScore ?? -1));
  if (sort === "lowest-score") return copy.sort((a, b) => (a.bestScore ?? 101) - (b.bestScore ?? 101));
  if (sort === "recent") {
    return copy.sort((a, b) => Date.parse(b.lastAttemptedAt ?? "") - Date.parse(a.lastAttemptedAt ?? ""));
  }
  const priority: Record<ExamAccessState, number> = { full: 0, preview: 1, locked: 2 };
  return copy.sort(
    (a, b) =>
      priority[a.accessState] - priority[b.accessState] ||
      a.familyName.localeCompare(b.familyName) ||
      (a.subjectName ?? "").localeCompare(b.subjectName ?? "") ||
      (a.setNumber ?? 0) - (b.setNumber ?? 0)
  );
}

function EmptyState({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="user-detail-surface p-6 text-center">
      <div className="user-stat-tile mx-auto grid h-12 w-12 place-items-center p-0 text-[#4338ca]">
        {icon}
      </div>
      <h3 className="user-card-title mt-3">{title}</h3>
      <p className="user-helper mx-auto mt-1 max-w-lg">{text}</p>
    </div>
  );
}

function ExamCard({ exam }: { exam: MyExamItem }) {
  const action = primaryAction(exam);
  const progressPercent =
    exam.completedQuestions && exam.questionCount > 0 ? Math.round((exam.completedQuestions / exam.questionCount) * 100) : 0;

  return (
    <article className={`flex min-h-[310px] flex-col p-4 ${exam.accessState === "full" ? "user-feature-surface" : "user-detail-surface"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="user-label">{exam.familyName}</p>
          <h3 className="user-card-title mt-1 text-lg">{exam.title}</h3>
          <p className="user-helper mt-1">
            {[exam.subjectName, exam.setNumber ? `Set ${exam.setNumber}` : null].filter(Boolean).join(" / ")}
          </p>
        </div>
        <span className={`user-pill ${statusTone(exam.progressStatus, exam.accessState)}`}>
          {titleForStatus(exam.progressStatus, exam.accessState)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="user-detail-surface px-3 py-2">
          <p className="user-label">Questions</p>
          <p className="user-card-title">{exam.questionCount}</p>
        </div>
        <div className="user-detail-surface px-3 py-2">
          <p className="user-label">Time</p>
          <p className="user-card-title">{exam.estimatedMinutes ? `${exam.estimatedMinutes} min` : "Flexible"}</p>
        </div>
      </div>

      {exam.accessState === "preview" && (
        <p className="user-helper mt-3">{exam.previewQuestionCount ?? 10} questions available in free preview.</p>
      )}

      {exam.progressStatus === "in_progress" && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="user-helper">{exam.completedQuestions ?? 0} of {exam.questionCount} questions completed</p>
            <p className="user-label text-[#4338ca]">{progressPercent}%</p>
          </div>
          <div className="user-progress">
            <div className="user-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {exam.supportedModes.map((mode) => (
          <span key={mode} className="user-badge">
            {modeLabel(mode)}
          </span>
        ))}
      </div>

      {exam.latestScore !== undefined && (
        <p className="user-helper mt-3">
          Latest score: <span className="user-card-title inline">{exam.latestScore}%</span>
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Link href={action.href} className={`${action.className} gap-2`}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {exam.progressStatus === "completed" && exam.accessState === "full" && (
          <Link href={exam.href} className="user-button-secondary gap-2">
            Retake
            <RotateCcw className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

function AccessSummary({ view }: { view: MyExamsViewModel }) {
  return (
    <section className="user-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="user-label">Your access</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {view.accessLabels.map((label) => (
              <span key={label} className={`user-pill ${view.hasPaidAccess ? "user-pill-green" : "user-pill-purple"}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
        {!view.hasPaidAccess && (
          <div className="user-detail-surface max-w-xl p-3">
            <p className="user-card-title text-sm">Start with a free preview</p>
            <p className="user-helper mt-1">Try available preview questions, then view access options when you are ready to unlock complete exams.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MyExamsContent({ view }: { view: MyExamsViewModel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ExamTab>(() => tabFromQuery(searchParams.get("status")));
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [subject, setSubject] = useState("all");
  const [access, setAccess] = useState("all");
  const [sort, setSort] = useState<SortOption>("recommended");

  useEffect(() => {
    setActiveTab(tabFromQuery(searchParams.get("status")));
  }, [searchParams]);

  const families = useMemo(() => Array.from(new Set(view.exams.map((exam) => exam.familyName))), [view.exams]);
  const subjects = useMemo(
    () => Array.from(new Set(view.exams.map((exam) => exam.subjectName).filter((value): value is string => Boolean(value)))),
    [view.exams]
  );

  const filteredExams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortExams(
      view.exams.filter((exam) => {
        if (!matchesTab(exam, activeTab)) return false;
        if (family !== "all" && exam.familyName !== family) return false;
        if (subject !== "all" && exam.subjectName !== subject) return false;
        if (access !== "all" && exam.accessState !== access) return false;
        return !normalizedQuery || searchText(exam).includes(normalizedQuery);
      }),
      sort
    );
  }, [access, activeTab, family, query, sort, subject, view.exams]);

  const groupedExams = useMemo(() => {
    const groups = new Map<string, MyExamItem[]>();
    filteredExams.forEach((exam) => {
      const key = `${exam.familyName}${exam.subjectName ? ` / ${exam.subjectName}` : ""}`;
      groups.set(key, [...(groups.get(key) ?? []), exam]);
    });
    return Array.from(groups.entries());
  }, [filteredExams]);

  function updateTab(tab: ExamTab) {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      next.delete("status");
    } else {
      next.set("status", tab);
    }
    const suffix = next.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  const hasActiveFilters = query.trim() || family !== "all" || subject !== "all" || access !== "all";
  const emptyState =
    hasActiveFilters
      ? {
          title: "No exams found",
          text: "Try changing your search or filters.",
          icon: <Search className="h-5 w-5" />,
        }
      : activeTab === "completed"
        ? {
            title: "No completed exams yet",
            text: "Your submitted exams will appear here with scores and review options.",
            icon: <CheckCircle2 className="h-5 w-5" />,
          }
        : activeTab === "in-progress"
          ? {
              title: "No unfinished exams",
              text: "When you leave an exam before submitting it, it will appear here so you can continue.",
              icon: <Clock3 className="h-5 w-5" />,
            }
          : !view.hasPaidAccess
            ? {
                title: "Start with a free preview",
                text: "Try the available preview questions or view access options to unlock complete exams.",
                icon: <Sparkles className="h-5 w-5" />,
              }
            : {
                title: "You have not started an exam yet",
                text: "Choose an available exam below and select Study, Practice, or Exam Mode.",
                icon: <BookOpenCheck className="h-5 w-5" />,
              };

  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <header className="user-page-header">
            <div className="user-page-header-row">
              <div className="user-page-header-copy">
                <p className="user-eyebrow inline-flex items-center gap-2">
                  <span className="user-accent-dot" />
                  Student Library
                </p>
                <h1 className="user-page-title mt-2">My Exams</h1>
                <p className="user-body-sm mt-3">
                  Access your available exams, continue unfinished attempts, and review completed sets.
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-5">
            <AccessSummary view={view} />

            {view.continueAttempts.length > 0 && (
              <section className="user-card p-5">
                <div className="mb-4">
                  <h2 className="user-section-title">Continue where you left off</h2>
                  <p className="user-body-sm mt-1">Your three most recently active unfinished attempts.</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  {view.continueAttempts.slice(0, 3).map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              </section>
            )}

            <section className="user-card overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h2 className="user-section-title">Exam Library</h2>
                    <p className="user-body-sm mt-1">Filter by access, status, family, or subject without leaving the page.</p>
                  </div>
                  <p className="user-helper" aria-live="polite">
                    Showing {filteredExams.length} of {view.exams.length} exams
                  </p>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,190px))]">
                  <label className="user-control">
                    <span className="user-label mb-1 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search
                    </span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="user-field"
                      placeholder="Search exam, subject, or set"
                    />
                  </label>
                  <label className="user-control">
                    <span className="user-label mb-1 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Family
                    </span>
                    <select value={family} onChange={(event) => setFamily(event.target.value)} className="user-field">
                      <option value="all">All families</option>
                      {families.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="user-control">
                    <span className="user-label mb-1">Subject</span>
                    <select value={subject} onChange={(event) => setSubject(event.target.value)} className="user-field">
                      <option value="all">All subjects</option>
                      {subjects.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="user-control">
                    <span className="user-label mb-1">Access</span>
                    <select value={access} onChange={(event) => setAccess(event.target.value)} className="user-field">
                      <option value="all">All access</option>
                      <option value="full">Full access</option>
                      <option value="preview">Preview</option>
                      <option value="locked">Locked</option>
                    </select>
                  </label>
                  <label className="user-control">
                    <span className="user-label mb-1 flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Sort
                    </span>
                    <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="user-field">
                      <option value="recommended">Recommended</option>
                      <option value="recent">Recently accessed</option>
                      <option value="name">Name</option>
                      <option value="highest-score">Highest score</option>
                      <option value="lowest-score">Lowest score</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="px-5 pt-4">
                <div role="tablist" aria-label="Exam status filters" className="user-tabs">
                  {(Object.keys(TAB_LABELS) as ExamTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab}
                      onClick={() => updateTab(tab)}
                      className="user-tab"
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {groupedExams.length === 0 ? (
                  <EmptyState title={emptyState.title} text={emptyState.text} icon={emptyState.icon} />
                ) : (
                  <div className="grid gap-6">
                    {groupedExams.map(([group, exams]) => (
                      <section key={group} className="grid gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="user-card-title">{group}</h3>
                          <span className="user-badge">{exams.length} exams</span>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                          {exams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {view.lockedPackages.length > 0 && (
              <section className="user-card p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="user-section-title">More exams available</h2>
                    <p className="user-body-sm mt-1">Exam access options that are not currently included in your account.</p>
                  </div>
                  <LockKeyhole className="hidden h-5 w-5 text-[#4338ca] sm:block" />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {view.lockedPackages.map((pkg) => (
                    <article key={pkg.id} className="user-detail-surface flex min-h-[190px] flex-col p-4">
                      <p className="user-label">{pkg.includedExamCount} exams included</p>
                      <h3 className="user-card-title mt-1">{pkg.name}</h3>
                      <p className="user-helper mt-2">{pkg.description}</p>
                      <div className="mt-auto pt-4">
                        <Link href={pkg.href} className="user-button-secondary gap-2">
                          View Access Options
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

function LoadingState() {
  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <div className="user-card mx-auto mt-12 max-w-2xl p-5">
            <p className="user-card-title">Loading your exams</p>
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

export default function MyExamsPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (!currentUser) return;
    setDocLoading(true);
    return subscribeUserDocument(
      currentUser.uid,
      (doc) => {
        setUserDoc(doc);
        setDocLoading(false);
      },
      () => {
        setError("Could not load your exam access.");
        setDocLoading(false);
      }
    );
  }, [currentUser]);

  const view = useMemo(() => buildMyExamsViewModel(userDoc), [userDoc]);

  if (loading || (currentUser && docLoading)) return <LoadingState />;
  if (!currentUser) return null;

  if (error) {
    return (
      <Layout>
        <main className="user-page">
          <div className="user-page-container">
            <div className="user-alert user-alert-error mt-6" role="alert">
              <span className="user-alert-icon" aria-hidden="true">x</span>
              <div>
                <p className="user-card-title">My Exams could not load</p>
                <p className="user-helper mt-1">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="user-button-secondary mt-3">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <MyExamsContent view={view} />
    </Suspense>
  );
}
