import type { UserDocument } from "@/types/user-document";
import type { ExamAccessState, ExamMode, ExamProgressStatus, MyExamItem, MyExamLockedPackage, MyExamsViewModel } from "./types";
import { normalizeUserEntitlements, USER_ENTITLEMENT_LABELS } from "@/lib/user-entitlements";

type CatalogExam = Omit<MyExamItem, "accessState" | "progressStatus"> & {
  previewEnabled: boolean;
  requiredPackageIds: string[];
};

const PACKAGE_LABELS: Record<string, string> = {
  ...USER_ENTITLEMENT_LABELS,
};

const DEFAULT_MODES: ExamMode[] = ["study", "practice", "exam"];

const EXAM_CATALOG: CatalogExam[] = [
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
    previewQuestionCount: 10,
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
    previewQuestionCount: 10,
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
    previewQuestionCount: 10,
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
    previewQuestionCount: 10,
    requiredPackageIds: ["ati_teas_7"],
  },
  {
    id: "ati-teas-full-length-set-1",
    slug: "ati-teas-practice-test",
    title: "ATI TEAS 7 Full-Length Exam",
    familyId: "nursing_entrance_exams",
    familyName: "Nursing Entrance Exams",
    packageId: "ati_teas_7",
    subjectId: "full_length",
    subjectName: "Full-Length Exams",
    setNumber: 1,
    questionCount: 170,
    estimatedMinutes: 209,
    supportedModes: ["practice", "exam"],
    href: "/ati-teas-practice-test",
    previewEnabled: true,
    previewQuestionCount: 10,
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
    previewQuestionCount: 10,
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
  {
    id: "all-access",
    name: "All Access",
    description: "Unlock all entrance, test bank, and exit exam packages.",
    packageIds: ["ati_teas_7", "hesi_a2", "nursing_test_bank", "nursing_exit_exams"],
    href: "/payments",
    includedExamCount: EXAM_CATALOG.length,
  },
];

function activePackageIds(doc: UserDocument | null) {
  const active = new Set<string>();
  const entitlements = normalizeUserEntitlements(doc?.entitlements);

  for (const [key, enabled] of Object.entries(entitlements)) {
    if (enabled) active.add(key);
  }

  return active;
}

function hasAccessToExam(activePackages: Set<string>, exam: CatalogExam) {
  return exam.requiredPackageIds.some((packageId) => activePackages.has(packageId));
}

function accessStateFor(activePackages: Set<string>, exam: CatalogExam): ExamAccessState {
  if (hasAccessToExam(activePackages, exam)) return "full";
  return exam.previewEnabled ? "preview" : "locked";
}

function progressStatusFor(accessState: ExamAccessState): ExamProgressStatus {
  if (accessState === "locked") return "locked";
  if (accessState === "preview") return "preview";
  return "not_started";
}

export function buildMyExamsViewModel(doc: UserDocument | null): MyExamsViewModel {
  const activePackages = activePackageIds(doc);
  const exams = EXAM_CATALOG.map((exam) => {
    const accessState = accessStateFor(activePackages, exam);
    return {
      ...exam,
      accessState,
      progressStatus: progressStatusFor(accessState),
    };
  });

  const accessLabels = Array.from(activePackages)
    .map((packageId) => PACKAGE_LABELS[packageId] ?? packageId)
    .filter((label, index, labels) => labels.indexOf(label) === index);

  const lockedPackages = LOCKED_PACKAGES.filter(
    (pkg) => !pkg.packageIds.every((packageId) => activePackages.has(packageId))
  );

  return {
    accessLabels: accessLabels.length > 0 ? accessLabels : ["Free preview"],
    exams,
    // Attempt data is intentionally empty until the app has an owner-scoped attempt source.
    continueAttempts: [],
    lockedPackages,
    hasPaidAccess: activePackages.size > 0,
  };
}
