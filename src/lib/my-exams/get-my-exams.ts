import type { UserDocument } from "@/types/user-document";
import type {
  ExamAccessState,
  ExamMode,
  ExamProgressStatus,
  MyExamItem,
  MyExamsDynamicExamInput,
  MyExamLockedPackage,
  MyExamsBillingHistory,
  MyExamsBillingHistoryRecord,
  MyExamsViewModel,
} from "./types";
import {
  entitlementKeysForPackageIds,
  normalizeUserEntitlements,
  USER_ENTITLEMENT_KEYS,
  USER_ENTITLEMENT_LABELS,
  type UserEntitlementKey,
} from "@/lib/user-entitlements";
import { inferPrimaryExamIdFromProgramType } from "@/lib/program-type";

type CatalogExam = Omit<MyExamItem, "accessState" | "progressStatus"> & {
  previewEnabled: boolean;
  requiredPackageIds: string[];
};

const PACKAGE_LABELS: Record<string, string> = {
  ...USER_ENTITLEMENT_LABELS,
};

const DEFAULT_MODES: ExamMode[] = ["study", "practice", "exam"];
const DEFAULT_PREVIEW_PERCENTAGE = 20;

const FALLBACK_EXAM_CATALOG: CatalogExam[] = [
  {
    id: "ati-teas-reading-set-1",
    slug: "ati-teas-practice-test",
    title: "ATI TEAS 7 Reading",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "ati_teas_7",
    subjectId: "reading",
    subjectName: "Reading",
    setNumber: 1,
    questionCount: 50,
    estimatedMinutes: 55,
    supportedModes: DEFAULT_MODES,
    href: "/ati-teas-practice-test",
    previewEnabled: true,
    previewPercentage: DEFAULT_PREVIEW_PERCENTAGE,
    requiredPackageIds: ["ati_teas_7"],
  },
  {
    id: "ati-teas-math-set-1",
    slug: "ati-teas-practice-test",
    title: "ATI TEAS 7 Mathematics",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "ati_teas_7",
    subjectId: "mathematics",
    subjectName: "Mathematics",
    setNumber: 1,
    questionCount: 38,
    estimatedMinutes: 57,
    supportedModes: DEFAULT_MODES,
    href: "/ati-teas-practice-test",
    previewEnabled: true,
    previewPercentage: DEFAULT_PREVIEW_PERCENTAGE,
    requiredPackageIds: ["ati_teas_7"],
  },
  {
    id: "ati-teas-science-set-1",
    slug: "ati-teas-practice-test",
    title: "ATI TEAS 7 Science",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "ati_teas_7",
    subjectId: "science",
    subjectName: "Science",
    setNumber: 1,
    questionCount: 50,
    estimatedMinutes: 60,
    supportedModes: DEFAULT_MODES,
    href: "/ati-teas-practice-test",
    previewEnabled: true,
    previewPercentage: DEFAULT_PREVIEW_PERCENTAGE,
    requiredPackageIds: ["ati_teas_7"],
  },
  {
    id: "ati-teas-english-set-1",
    slug: "ati-teas-practice-test",
    title: "ATI TEAS 7 English and Language Usage",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "ati_teas_7",
    subjectId: "english",
    subjectName: "English and Language Usage",
    setNumber: 1,
    questionCount: 37,
    estimatedMinutes: 37,
    supportedModes: DEFAULT_MODES,
    href: "/ati-teas-practice-test",
    previewEnabled: true,
    previewPercentage: DEFAULT_PREVIEW_PERCENTAGE,
    requiredPackageIds: ["ati_teas_7"],
  },
  {
    id: "hesi-a2-diagnostic-set-1",
    slug: "hesi-a2-practice-test",
    title: "HESI A2 Diagnostic Practice",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "hesi_a2",
    subjectId: "diagnostic",
    subjectName: "Diagnostic Practice",
    setNumber: 1,
    questionCount: 75,
    estimatedMinutes: 90,
    supportedModes: DEFAULT_MODES,
    href: "/hesi-a2-practice-test",
    previewEnabled: true,
    previewPercentage: DEFAULT_PREVIEW_PERCENTAGE,
    requiredPackageIds: ["hesi_a2"],
  },
  {
    id: "rn-test-bank-set-1",
    slug: "nursing-test-bank",
    title: "RN Test Bank Practice",
    familyId: "nursing_test_bank",
    familyName: "Nursing Test Bank",
    packageId: "nursing_test_bank_rn",
    subjectId: "rn_exams",
    subjectName: "RN Exams",
    setNumber: 1,
    questionCount: 60,
    estimatedMinutes: 75,
    supportedModes: ["study", "practice"],
    href: "/nursing-test-bank",
    previewEnabled: false,
    requiredPackageIds: ["nursing_test_bank"],
  },
  {
    id: "lpn-test-bank-set-1",
    slug: "nursing-test-bank",
    title: "LPN Test Bank Practice",
    familyId: "nursing_test_bank",
    familyName: "Nursing Test Bank",
    packageId: "nursing_test_bank_lpn",
    subjectId: "lpn_exams",
    subjectName: "LPN Exams",
    setNumber: 1,
    questionCount: 60,
    estimatedMinutes: 75,
    supportedModes: ["study", "practice"],
    href: "/nursing-test-bank",
    previewEnabled: false,
    requiredPackageIds: ["nursing_test_bank"],
  },
  {
    id: "rn-exit-exam-set-1",
    slug: "nursing-exit-exam",
    title: "RN Exit Exam Practice",
    familyId: "nursing_exit_exams",
    familyName: "Nursing Exit Exams",
    packageId: "nursing_exit_exam_rn",
    subjectId: "rn_exit",
    subjectName: "RN Exit Exams",
    setNumber: 1,
    questionCount: 100,
    estimatedMinutes: 120,
    supportedModes: ["practice", "exam"],
    href: "/nursing-exit-exam",
    previewEnabled: false,
    requiredPackageIds: ["nursing_exit_exams"],
  },
  {
    id: "lpn-exit-exam-set-1",
    slug: "nursing-exit-exam",
    title: "LPN Exit Exam Practice",
    familyId: "nursing_exit_exams",
    familyName: "Nursing Exit Exams",
    packageId: "nursing_exit_exam_lpn",
    subjectId: "lpn_exit",
    subjectName: "LPN Exit Exams",
    setNumber: 1,
    questionCount: 100,
    estimatedMinutes: 120,
    supportedModes: ["practice", "exam"],
    href: "/nursing-exit-exam",
    previewEnabled: false,
    requiredPackageIds: ["nursing_exit_exams"],
  },
];

const LOCKED_PACKAGES: MyExamLockedPackage[] = [
  {
    id: "hesi-a2",
    name: "HESI A2",
    description: "Entrance exam practice for HESI A2 reading, vocabulary, grammar, math, and science.",
    packageIds: ["hesi_a2"],
    href: "/payments",
    includedExamCount: 1,
  },
  {
    id: "nursing-test-bank",
    name: "Nursing Test Bank",
    description: "RN and LPN practice organized around nursing school subject areas.",
    packageIds: ["nursing_test_bank"],
    href: "/payments",
    includedExamCount: 2,
  },
  {
    id: "nursing-exit-exams",
    name: "Nursing Exit Exams",
    description: "RN and LPN predictor-style exit exam practice.",
    packageIds: ["nursing_exit_exams"],
    href: "/payments",
    includedExamCount: 2,
  },
];

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function isActiveBillingEntitlement(record: MyExamsBillingHistoryRecord) {
  const status = String(record.status ?? "").toLowerCase();
  if (status !== "active") return false;
  const accessEnd = toDate(record.accessEndsAt);
  return accessEnd === null || accessEnd.getTime() > Date.now();
}

function entitlementKeysForBillingRecord(record: MyExamsBillingHistoryRecord) {
  const ids = [
    typeof record.examId === "string" ? record.examId : "",
    typeof record.packageId === "string" ? record.packageId : "",
  ].filter(Boolean);

  return entitlementKeysForPackageIds(ids);
}

function activeExamAccess(doc: UserDocument | null, history?: MyExamsBillingHistory | null) {
  const active = new Map<UserEntitlementKey, Date | null>();
  const entitlements = normalizeUserEntitlements(doc?.entitlements);

  for (const key of USER_ENTITLEMENT_KEYS) {
    if (entitlements[key]) active.set(key, null);
  }

  for (const record of history?.entitlements ?? []) {
    if (!isActiveBillingEntitlement(record)) continue;
    const accessEndsAt = toDate(record.accessEndsAt);
    for (const key of entitlementKeysForBillingRecord(record)) {
      const existing = active.get(key);
      // Null represents active access with no known end date, so a dated grant should not override it.
      if (active.has(key) && existing === null) continue;
      if (accessEndsAt === null) {
        active.set(key, null);
        continue;
      }
      if (!existing || (accessEndsAt && accessEndsAt.getTime() > existing.getTime())) {
        active.set(key, accessEndsAt);
      }
    }
  }

  return active;
}

function hasAccessToExam(activeAccess: Map<UserEntitlementKey, Date | null>, exam: CatalogExam) {
  return exam.requiredPackageIds.some((packageId) => activeAccess.has(packageId as UserEntitlementKey));
}

function accessStateFor(activeAccess: Map<UserEntitlementKey, Date | null>, exam: CatalogExam): ExamAccessState {
  if (hasAccessToExam(activeAccess, exam)) return "full";
  return exam.previewEnabled ? "preview" : "locked";
}

function progressStatusFor(accessState: ExamAccessState): ExamProgressStatus {
  if (accessState === "locked") return "locked";
  if (accessState === "preview") return "preview";
  return "not_started";
}

function accessEndForExam(activeAccess: Map<UserEntitlementKey, Date | null>, exam: CatalogExam) {
  for (const packageId of exam.requiredPackageIds) {
    if (activeAccess.has(packageId as UserEntitlementKey)) {
      return activeAccess.get(packageId as UserEntitlementKey) ?? null;
    }
  }
  return null;
}

function selectedPreviewPackageIds(doc: UserDocument | null) {
  const selected = new Set<UserEntitlementKey>();
  const primaryExamId = doc?.profile?.primary_exam_id ?? inferPrimaryExamIdFromProgramType(doc?.profile?.focus_areas?.[0]);
  const focusArea = doc?.profile?.focus_areas?.[0];

  if (primaryExamId === "ati_teas_7" || primaryExamId === "hesi_a2") {
    selected.add(primaryExamId);
  }

  if (focusArea === "nursing_test_bank") {
    selected.add("nursing_test_bank");
  }

  if (focusArea === "nursing_exit_exam") {
    selected.add("nursing_exit_exams");
  }

  return selected;
}

function isSelectedPreviewExam(selectedPackages: Set<UserEntitlementKey>, exam: CatalogExam) {
  return exam.requiredPackageIds.some((packageId) => selectedPackages.has(packageId as UserEntitlementKey));
}

function previewCountFor(exam: CatalogExam) {
  const percentage = exam.previewPercentage ?? DEFAULT_PREVIEW_PERCENTAGE;
  return Math.max(1, Math.ceil((exam.questionCount * percentage) / 100));
}

export function buildMyExamsViewModel(
  doc: UserDocument | null,
  history?: MyExamsBillingHistory | null,
  dynamicExams?: MyExamsDynamicExamInput[] | null
): MyExamsViewModel {
  const activeAccess = activeExamAccess(doc, history);
  const selectedPreviewPackages = selectedPreviewPackageIds(doc);
  const usesDynamicEntranceSource = dynamicExams !== undefined;
  const dynamicCatalog = dynamicExams ?? [];
  const catalog = [
    ...dynamicCatalog,
    ...FALLBACK_EXAM_CATALOG.filter((exam) => !usesDynamicEntranceSource || exam.familyId !== "nursing_entrance_exams"),
  ];

  const exams = catalog.map((exam) => {
    const selectedPreview = activeAccess.size === 0 && isSelectedPreviewExam(selectedPreviewPackages, exam);
    const accessState = selectedPreview ? "preview" : accessStateFor(activeAccess, exam);
    return {
      ...exam,
      accessState,
      progressStatus: progressStatusFor(accessState),
      accessEndsAt: accessState === "full" ? accessEndForExam(activeAccess, exam) : null,
      previewPercentage: exam.previewEnabled || selectedPreview ? exam.previewPercentage ?? DEFAULT_PREVIEW_PERCENTAGE : undefined,
      previewQuestionCount: exam.previewEnabled || selectedPreview ? previewCountFor(exam) : undefined,
    };
  }).filter((exam) => {
    // My Exams is a personal library: paid users should see only exams they actively own.
    // Preview-only users should see the exam they chose during registration.
    if (activeAccess.size > 0) return exam.accessState === "full";
    if (selectedPreviewPackages.size > 0) return isSelectedPreviewExam(selectedPreviewPackages, exam);
    return exam.accessState === "preview";
  });

  const accessLabels = Array.from(activeAccess.keys())
    .map((packageId) => PACKAGE_LABELS[packageId] ?? packageId)
    .filter((label, index, labels) => labels.indexOf(label) === index);

  const lockedPackages = LOCKED_PACKAGES.filter(
    (pkg) => !pkg.packageIds.every((packageId) => activeAccess.has(packageId as UserEntitlementKey))
  );

  return {
    accessLabels: accessLabels.length > 0 ? accessLabels : ["Free preview"],
    exams,
    // Attempt data is intentionally empty until the app has an owner-scoped attempt source.
    continueAttempts: [],
    lockedPackages,
    hasPaidAccess: activeAccess.size > 0,
  };
}
