"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ArrowRight,
  BookOpenCheck,
  LockKeyhole,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { buildMyExamsViewModel } from "@/lib/my-exams/get-my-exams";
import { inferPrimaryExamIdFromProgramType } from "@/lib/program-type";
import type {
  ExamAccessState,
  ExamProgressStatus,
  MyExamItem,
  MyExamsBillingHistory,
  MyExamsDynamicExamInput,
  MyExamsViewModel,
} from "@/lib/my-exams/types";
import { subscribeUserDocument } from "@/lib/user-document-firestore";
import type { UserDocument } from "@/types/user-document";

const ENTRANCE_PACKAGE_IDS = new Set(["ati_teas_7", "hesi_a2"]);
const EXAM_SUBJECT_CATALOG_COLLECTION = "exam_subject_catalog";
const ENTRANCE_CATALOG_CACHE_KEY = "my-exams:entrance-catalog:v1";

type FirestoreRecord = Record<string, unknown> & { id?: string };

async function fetchMyExamsBillingHistory(user: User) {
  const token = await user.getIdToken();
  const response = await fetch("/api/billing/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Could not load billing history");
  return (await response.json()) as MyExamsBillingHistory;
}

function textValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function subjectIdForName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/practice test/g, "")
    .replace(/ati|teas|hesi|a2/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function setNumberFromFirestore(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return undefined;
}

function questionCountFromMetadata(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
    if (typeof value === "string" && /^\d+$/.test(value.trim()) && Number(value) > 0) return Number(value);
  }
  return 0;
}

function isFullLengthEntranceExam(...values: unknown[]) {
  const text = values.map((value) => String(value ?? "").toLowerCase()).join(" ");
  return text.includes("full-length") || text.includes("full length") || text.includes("full_exam") || text.includes("full exam");
}

function readEntranceCatalogCache(packageId?: string | null) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${ENTRANCE_CATALOG_CACHE_KEY}:${packageId || "all"}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: MyExamsDynamicExamInput[] };
    if (!Array.isArray(parsed.items)) return null;
    if (Date.now() - Number(parsed.savedAt || 0) > 5 * 60 * 1000) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function writeEntranceCatalogCache(packageId: string | null | undefined, items: MyExamsDynamicExamInput[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      `${ENTRANCE_CATALOG_CACHE_KEY}:${packageId || "all"}`,
      JSON.stringify({ savedAt: Date.now(), items })
    );
  } catch {
    // Session storage is an optimization only; Firestore remains the source of truth.
  }
}

async function fetchEntranceExamItems(packageId?: string | null): Promise<MyExamsDynamicExamInput[]> {
  const items: MyExamsDynamicExamInput[] = [];
  // Read the compact catalog index instead of scanning nested quiz documents.
  // The nested quiz document remains the source of truth; admin quiz writes keep
  // this public display index in sync for fast student dashboard loading.
  const constraints = [
    where("examFamilyId", "==", "nursing_entrance_exams"),
    ...(packageId ? [where("examAccessProductId", "==", packageId)] : []),
  ];
  const snapshot = await getDocs(
    query(
      collection(db, EXAM_SUBJECT_CATALOG_COLLECTION),
      ...constraints
    )
  );

  for (const docSnap of snapshot.docs) {
    const quiz = { id: docSnap.id, ...docSnap.data() } as FirestoreRecord;
    if (quiz.examFamilyId !== "nursing_entrance_exams") continue;
    const examId = textValue(quiz.examAccessProductId);
    if (examId !== "ati_teas_7" && examId !== "hesi_a2") continue;
    const examLabel = examId === "hesi_a2" ? "HESI A2" : "ATI TEAS 7";
    const quizId = textValue(quiz.id, quiz.quizId);
    const slug = textValue(quiz.slug, quizId);
    const subjectName = textValue(quiz.subjectName, quiz.pageName, quiz.title, quiz.quizName, examLabel);
    if (!quizId || !slug) continue;
    if (isFullLengthEntranceExam(quiz.pageName, quiz.title, quiz.quizName, quiz.slug, subjectName)) continue;

    const questionCount = questionCountFromMetadata(
      quiz.questionCount,
      quiz.questionsCount,
      quiz.totalQuestions,
      quiz.question_count
    );

    items.push({
      id: `${examId}-${quizId}`,
      slug,
      title: textValue(quiz.pageName, quiz.title, quiz.quizName, `${examLabel} ${subjectName}`),
      familyId: "nursing_entrance_exams",
      familyName: "Nursing Entrance Exams",
      packageId: examId,
      subjectId: textValue(quiz.subjectId) || subjectIdForName(subjectName || quizId),
      subjectName,
      setNumber: setNumberFromFirestore(quiz.setNumber),
      questionCount,
      supportedModes: ["practice", "exam"],
      href: `/${slug}`,
      previewEnabled: true,
      previewPercentage: questionCountFromMetadata(quiz.previewPercentage) || 20,
      requiredPackageIds: [examId],
    });
  }

  return items.sort(
    (a, b) =>
      a.packageId.localeCompare(b.packageId) ||
      (a.setNumber ?? Number.MAX_SAFE_INTEGER) - (b.setNumber ?? Number.MAX_SAFE_INTEGER) ||
      (a.subjectName ?? "").localeCompare(b.subjectName ?? "")
  );
}

function statusLabel(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "locked") return "Locked";
  if (access === "preview") return "Preview";
  if (status === "completed") return "Completed";
  if (status === "retake_available") return "Retake Available";
  if (status === "in_progress") return "In Progress";
  return "Active";
}

function statusClass(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "full") return "user-pill-green";
  if (access === "preview") return "user-pill-purple";
  if (status === "in_progress") return "user-pill-amber";
  return "";
}

function subjectStatusLabel(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "locked") return "Locked";
  if (access === "preview") return "Preview";
  if (status === "completed") return "Completed";
  if (status === "retake_available") return "Retake Available";
  if (status === "in_progress") return "In Progress";
  return "Not Started";
}

function subjectStatusClass(status: ExamProgressStatus, access: ExamAccessState) {
  if (access === "preview") return "user-pill-purple";
  if (status === "completed" || status === "retake_available") return "user-pill-green";
  if (status === "in_progress") return "user-pill-amber";
  return "";
}

function includedExamCountLabel(count: number) {
  return `${count} ${count === 1 ? "exam" : "exams"} included`;
}

function selectedEntranceExamId(doc: UserDocument | null) {
  const primaryExamId = doc?.profile?.primary_exam_id ?? inferPrimaryExamIdFromProgramType(doc?.profile?.focus_areas?.[0]);
  return primaryExamId === "ati_teas_7" || primaryExamId === "hesi_a2" ? primaryExamId : null;
}

function primaryAction(exam: MyExamItem) {
  if (exam.accessState === "locked") return { label: "View Access Options", href: "/payments", className: "user-button-secondary" };
  if (exam.accessState === "preview") return { label: "Start Free Preview", href: exam.href, className: "user-button-secondary" };
  if (exam.progressStatus === "in_progress") return { label: "Continue", href: exam.href, className: "user-button-primary" };
  if (exam.progressStatus === "completed") return { label: "Review Results", href: "/progress-reports", className: "user-button-secondary" };
  return { label: "Exam Mode", href: exam.href, className: "user-button-primary" };
}

function EmptyState({ view }: { view: MyExamsViewModel }) {
  return (
    <section className="user-detail-surface p-6 text-center">
      <div className="user-stat-tile mx-auto grid h-12 w-12 place-items-center p-0 text-[#4338ca]">
        {view.hasPaidAccess ? <BookOpenCheck className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </div>
      <h2 className="user-section-title mt-4">{view.hasPaidAccess ? "No exam subjects available yet" : "Start with a free preview"}</h2>
      <p className="user-body-sm mx-auto mt-2 max-w-xl">
        {view.hasPaidAccess
          ? "Your available exam subjects will appear here once they are ready for your account."
          : "Try the available preview questions or view access options to unlock complete exams."}
      </p>
      {!view.hasPaidAccess && (
        <Link href="/payments" className="user-button-primary mt-5 inline-flex">
          View Access Options
        </Link>
      )}
    </section>
  );
}

function PageHeader({
  accessLoading,
  view,
  title,
}: {
  accessLoading: boolean;
  view: MyExamsViewModel;
  title: string;
}) {
  return (
    <header className="user-page-header">
      <div className="user-page-header-row">
        <div className="user-page-header-copy">
          <p className="user-eyebrow inline-flex items-center gap-2">
            <span className="user-accent-dot" />
            My Exams
          </p>
          <h1 className="user-page-title mt-2">{title}</h1>
          <p className="user-body-sm mt-3">
            Choose a set, then start one available subject for your active exam access.
          </p>
        </div>
      </div>
      <div className="user-page-header-meta">
        {accessLoading && <span className="user-pill user-pill-amber">Checking access</span>}
        {view.accessLabels.map((label) => (
          <span key={label} className={`user-pill ${view.hasPaidAccess ? "user-pill-green" : "user-pill-purple"}`}>
            {label}
          </span>
        ))}
      </div>
    </header>
  );
}

function SetNumberTile({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`user-stat-tile grid h-10 w-10 flex-none place-items-center p-0 text-sm ${active ? "text-[#4338ca]" : "text-[#6b7280]"}`}>
      {label}
    </span>
  );
}

function SubjectInitialTile({ label }: { label: string }) {
  return (
    <span className="user-stat-tile grid h-9 w-9 flex-none place-items-center p-0 text-xs text-[#4338ca]">
      {label}
    </span>
  );
}

function SetButton({
  examLabel,
  isActive,
  label,
  setFullCount,
  setItems,
  setKey,
  setQuestionCount,
  onSelect,
}: {
  examLabel: string;
  isActive: boolean;
  label: string;
  setFullCount: number;
  setItems: MyExamItem[];
  setKey: string;
  setQuestionCount: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`relative min-w-[92px] rounded-full px-3 py-2 text-left transition sm:min-w-[230px] sm:rounded-[1.125rem] sm:p-3 lg:min-w-0 ${
        isActive ? "user-feature-surface" : "user-card hover:-translate-y-0.5 hover:border-[#4f46e5]/30"
      }`}
    >
      {isActive && <span className="absolute bottom-3 left-0 top-3 hidden w-1 rounded-r-full bg-[#4f46e5] sm:block" />}
      <div className="flex items-center justify-center gap-2 sm:hidden">
        <span className="text-sm font-bold text-[#4338ca]">{setKey === "unassigned" ? "?" : setKey}</span>
        <span className="sr-only">{examLabel} {label}</span>
      </div>
      <div className="hidden items-start justify-between gap-3 sm:flex">
        <div className="flex min-w-0 gap-3">
          <SetNumberTile label={setKey === "unassigned" ? "?" : setKey} active={isActive} />
          <div className="min-w-0">
            <h3 className="user-card-title truncate text-sm">{examLabel} {label}</h3>
            <p className="user-helper mt-1">
                    {setQuestionCount > 0 ? `${setQuestionCount} questions` : `${setItems.length} subjects`}
            </p>
          </div>
        </div>
        <span className={`user-pill ${setFullCount > 0 ? "user-pill-green" : "user-pill-purple"}`}>
          {setFullCount > 0 ? "Active" : "Preview"}
        </span>
      </div>
    </button>
  );
}

function ContinueExamCard({ exams }: { exams: MyExamItem[] }) {
  const exam = exams.find((item) => item.progressStatus === "in_progress") ||
    exams.find((item) => item.accessState === "full") ||
    exams[0];
  if (!exam) return null;

  const action = primaryAction(exam);
  const setLabel = exam.setNumber ? `Set ${exam.setNumber}` : "Practice Set";

  return (
    <section className="user-feature-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="user-label">Continue</p>
          <h2 className="user-section-title mt-1 truncate">{exam.subjectName || exam.title}</h2>
          <p className="user-body-sm mt-2">
            {setLabel} - {exam.questionCount > 0 ? `${exam.questionCount} questions` : "Practice set"}
          </p>
        </div>
        <Link href={action.href} className={`${action.className} justify-center gap-2 sm:min-w-[160px]`}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function EntranceCatalogLoading() {
  return (
    <section className="user-feature-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="user-label">Loading sets</p>
          <h2 className="user-section-title mt-1">Preparing your exam subjects</h2>
        </div>
        <span className="user-pill user-pill-purple">Syncing</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="user-skeleton h-10 rounded-full sm:h-20 sm:rounded-[1.125rem]" />
        <div className="user-skeleton h-10 rounded-full sm:h-20 sm:rounded-[1.125rem]" />
        <div className="user-skeleton h-10 rounded-full sm:h-20 sm:rounded-[1.125rem]" />
        <div className="user-skeleton h-10 rounded-full sm:h-20 sm:rounded-[1.125rem]" />
      </div>
    </section>
  );
}

function EntranceExamExperience({ exams }: { exams: MyExamItem[] }) {
  const groupedByExam = useMemo(() => {
    const groups = new Map<string, MyExamItem[]>();
    for (const exam of exams) {
      const label = exam.packageId === "hesi_a2" ? "HESI A2" : "ATI TEAS 7";
      groups.set(label, [...(groups.get(label) ?? []), exam]);
    }
    return Array.from(groups.entries());
  }, [exams]);

  return (
    <div className="grid gap-5">
      {groupedByExam.map(([examLabel, examItems]) => (
        <EntranceExamModule key={examLabel} examLabel={examLabel} exams={examItems} />
      ))}
    </div>
  );
}

function EntranceExamModule({ examLabel, exams }: { examLabel: string; exams: MyExamItem[] }) {
  const sets = useMemo(() => {
    const grouped = new Map<string, MyExamItem[]>();
    for (const exam of exams) {
      const key = exam.setNumber ? String(exam.setNumber) : "unassigned";
      grouped.set(key, [...(grouped.get(key) ?? []), exam]);
    }
    return Array.from(grouped.entries()).sort(([left], [right]) => {
      if (left === "unassigned") return 1;
      if (right === "unassigned") return -1;
      return Number(left) - Number(right);
    });
  }, [exams]);

  const [activeSetKey, setActiveSetKey] = useState(() => sets[0]?.[0] ?? "unassigned");

  useEffect(() => {
    if (!sets.some(([key]) => key === activeSetKey)) {
      setActiveSetKey(sets[0]?.[0] ?? "unassigned");
    }
  }, [activeSetKey, sets]);

  const activeSet = sets.find(([key]) => key === activeSetKey) ?? sets[0];
  const activeSetExams = activeSet?.[1] ?? [];
  const activeSetLabel = activeSet?.[0] === "unassigned" ? "Unassigned Set" : `Set ${activeSet?.[0]}`;
  const fullAccessCount = activeSetExams.filter((item) => item.accessState === "full").length;

  return (
    <section className="user-feature-surface overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="user-label">Module: {examLabel}</p>
            <h2 className="user-section-title mt-1">{examLabel} Sets And Subjects</h2>
            <p className="user-body-sm mt-2">
              Choose a set, then practice one subject at a time.
            </p>
          </div>
          {sets.length > 1 && <span className="user-pill user-pill-purple">{sets.length} sets</span>}
        </div>
      </div>

      <div className="user-divider" />

      <div className="grid lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-dashed border-slate-200/70 bg-white/45 p-3 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="user-label">Sets</p>
            {sets.length > 1 && <span className="user-badge">{sets.length} sets</span>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[calc(100vh-290px)] lg:flex-col lg:overflow-auto lg:pb-0">
            {sets.map(([setKey, setItems]) => {
              const isActive = setKey === activeSetKey;
              const label = setKey === "unassigned" ? "Unassigned Set" : `Set ${setKey}`;
              const setQuestionCount = setItems.reduce((sum, item) => sum + item.questionCount, 0);
              const setFullCount = setItems.filter((item) => item.accessState === "full").length;

              return (
                <SetButton
                  key={setKey}
                  examLabel={examLabel}
                  isActive={isActive}
                  label={label}
                  setFullCount={setFullCount}
                  setItems={setItems}
                  setKey={setKey}
                  setQuestionCount={setQuestionCount}
                  onSelect={() => setActiveSetKey(setKey)}
                />
              );
            })}
          </div>
        </aside>

        <main className="bg-white/35 p-4 sm:p-5" aria-label={`${examLabel} set details`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="user-section-title">{examLabel} {activeSetLabel}</h2>
              <p className="user-body-sm mt-2 max-w-3xl">
                Start with one available subject in this set.
              </p>
              <p className="user-helper mt-1">
                Subject practice helps you focus on one area at a time.
              </p>
            </div>
            <span className={`user-pill ${fullAccessCount > 0 ? "user-pill-green" : "user-pill-purple"}`}>
              {fullAccessCount > 0 ? "Active access" : "Preview"}
            </span>
          </div>

          <section className="mt-4 grid gap-3 md:grid-cols-2" aria-label="Subjects">
            {activeSetExams.map((exam) => {
              const action = primaryAction(exam);
              return (
                <article
                  key={exam.id}
                  className="user-card flex min-h-[170px] flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#4f46e5]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <SubjectInitialTile label={(exam.subjectName || "S").charAt(0).toUpperCase()} />
                      <div className="min-w-0">
                        <h3 className="user-card-title truncate text-sm">{exam.subjectName || "Subject"}</h3>
                        <p className="user-helper mt-1">{exam.title}</p>
                      </div>
                    </div>
                    <span className={`user-pill ${subjectStatusClass(exam.progressStatus, exam.accessState)}`}>
                      {subjectStatusLabel(exam.progressStatus, exam.accessState)}
                    </span>
                  </div>

                  <p className="user-helper mt-3">
                    {activeSetLabel} • {exam.questionCount > 0 ? `${exam.questionCount} questions` : "Practice set"}
                  </p>

                  <div className="mt-auto flex flex-wrap justify-center gap-2 pt-4">
                    <Link href={action.href} className={`${action.className} gap-2`}>
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {exam.accessState === "full" && (
                      <Link href={exam.href} className="user-button-secondary">
                        Review Mode
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </section>
  );
}

function BankExamCard({ exam }: { exam: MyExamItem }) {
  const action = primaryAction(exam);

  return (
    <article className="user-feature-surface flex min-h-[230px] flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="user-label">{exam.familyName}</p>
          <h3 className="user-card-title mt-1">{exam.title}</h3>
          <p className="user-helper mt-2">{exam.subjectName || "Practice bank"}</p>
        </div>
        <span className={`user-pill ${statusClass(exam.progressStatus, exam.accessState)}`}>
          {statusLabel(exam.progressStatus, exam.accessState)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="user-detail-surface px-3 py-2">
          <p className="user-label">Questions</p>
          <p className="user-card-title">{exam.questionCount}</p>
        </div>
        <div className="user-detail-surface px-3 py-2">
          <p className="user-label">Mode</p>
          <p className="user-card-title">Flexible</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link href={action.href} className={`${action.className} gap-2`}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {exam.accessState === "full" && (
          <Link href={exam.href} className="user-button-secondary gap-2">
            Retake
            <RotateCcw className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

function BankAndExitExperience({ exams }: { exams: MyExamItem[] }) {
  const groups = useMemo(() => {
    const grouped = new Map<string, MyExamItem[]>();
    for (const exam of exams) {
      const key = `${exam.familyName}${exam.subjectName ? ` / ${exam.subjectName}` : ""}`;
      grouped.set(key, [...(grouped.get(key) ?? []), exam]);
    }
    return Array.from(grouped.entries());
  }, [exams]);

  if (groups.length === 0) return null;

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="user-section-title">Question Bank And Exit Exams</h2>
        <p className="user-body-sm mt-1">These exams use a bank-style interface without set grouping.</p>
      </div>
      {groups.map(([group, groupExams]) => (
        <div key={group} className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="user-card-title">{group}</h3>
            <span className="user-badge">{groupExams.length} exams</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {groupExams.map((exam) => (
              <BankExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function MyExamsContent({
  accessLoading,
  entranceCatalogLoading,
  view,
}: {
  accessLoading: boolean;
  entranceCatalogLoading: boolean;
  view: MyExamsViewModel;
}) {
  const entranceExams = useMemo(() => view.exams.filter((exam) => ENTRANCE_PACKAGE_IDS.has(exam.packageId)), [view.exams]);
  const bankAndExitExams = useMemo(() => view.exams.filter((exam) => !ENTRANCE_PACKAGE_IDS.has(exam.packageId)), [view.exams]);
  const title = entranceExams[0]?.packageId === "hesi_a2"
    ? "HESI A2 Sets And Subjects"
    : entranceExams[0]?.packageId === "ati_teas_7"
      ? "ATI TEAS 7 Sets And Subjects"
      : "My Exams";

  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <PageHeader accessLoading={accessLoading} view={view} title={title} />

          <div className="grid gap-5">
            {entranceExams.length > 0 && <ContinueExamCard exams={entranceExams} />}
            {entranceExams.length > 0 && <EntranceExamExperience exams={entranceExams} />}
            {entranceCatalogLoading && entranceExams.length === 0 && <EntranceCatalogLoading />}
            {bankAndExitExams.length > 0 && <BankAndExitExperience exams={bankAndExitExams} />}
            {view.exams.length === 0 && !entranceCatalogLoading && <EmptyState view={view} />}

            {!accessLoading && view.lockedPackages.length > 0 && (
              <section className="user-feature-surface p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="user-section-title">More exams available</h2>
                    <p className="user-body-sm mt-1">Access options that are not currently included in your account.</p>
                  </div>
                  <LockKeyhole className="hidden h-5 w-5 text-[#6a5cff] sm:block" />
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                  {view.lockedPackages.map((pkg) => (
                    <article key={pkg.id} className="user-card flex min-h-[170px] flex-col p-4">
                      <p className="user-label">{includedExamCountLabel(pkg.includedExamCount)}</p>
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
  const [billingHistory, setBillingHistory] = useState<MyExamsBillingHistory | null>(null);
  const [entranceExamItems, setEntranceExamItems] = useState<MyExamsDynamicExamInput[] | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [entranceLoading, setEntranceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
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

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setBillingLoading(true);

    async function loadBillingHistory() {
      try {
        const history = await fetchMyExamsBillingHistory(currentUser as User);
        if (!cancelled) setBillingHistory(history);
      } catch {
        if (!cancelled) setError("Could not load your latest billing access.");
      } finally {
        if (!cancelled) setBillingLoading(false);
      }
    }

    void loadBillingHistory();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const selectedEntrancePackageId = selectedEntranceExamId(userDoc);

  useEffect(() => {
    if (!currentUser || docLoading) return;
    let cancelled = false;
    const cachedItems = readEntranceCatalogCache(selectedEntrancePackageId);
    if (cachedItems) {
      setEntranceExamItems(cachedItems);
      setEntranceLoading(false);
      return;
    }
    setEntranceExamItems(null);
    setEntranceLoading(true);

    async function loadEntranceItems() {
      try {
        const items = await fetchEntranceExamItems(selectedEntrancePackageId);
        if (!cancelled) {
          writeEntranceCatalogCache(selectedEntrancePackageId, items);
          setEntranceExamItems(items);
        }
      } catch (error) {
        console.warn("Could not load dynamic entrance exam sets", error);
        if (!cancelled) setEntranceExamItems([]);
      } finally {
        if (!cancelled) setEntranceLoading(false);
      }
    }

    void loadEntranceItems();
    return () => {
      cancelled = true;
    };
  }, [currentUser, docLoading, selectedEntrancePackageId]);

  const view = useMemo(
    () => buildMyExamsViewModel(userDoc, billingHistory, entranceExamItems),
    [billingHistory, entranceExamItems, userDoc]
  );
  const isSelectedEntranceCatalogLoading = Boolean(selectedEntrancePackageId) && entranceExamItems === null;

  // Render the page as soon as the user document is available. Billing and the
  // entrance catalog continue loading into their own sections so mobile users
  // are not stuck on a full-page spinner.
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
      <MyExamsContent
        accessLoading={billingLoading}
        entranceCatalogLoading={entranceLoading || isSelectedEntranceCatalogLoading}
        view={view}
      />
    </Suspense>
  );
}
