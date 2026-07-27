import type { UserDocument } from "@/types/user-document";

export const ONBOARDING_EXAM_TYPES = [
  {
    value: "ati_teas_7",
    label: "ATI TEAS 7",
    description: "Reading, math, science, and English language usage practice for ATI TEAS Version 7.",
  },
  {
    value: "hesi_a2",
    label: "HESI A2",
    description: "Math, reading, vocabulary, grammar, anatomy, and physiology practice for HESI A2.",
  },
  {
    value: "nursing_test_bank",
    label: "Nursing Test Bank",
    description: "RN and LPN question banks for fundamentals, pharmacology, med-surg, maternal newborn, pediatrics, and mental health.",
  },
  {
    value: "nursing_exit_exams",
    label: "Nursing Exit Exams",
    description: "RN and LPN exit exam practice for ATI and HESI predictor-style readiness, clinical judgment, safety, and prioritization.",
  },
] as const;

export type OnboardingExamType = (typeof ONBOARDING_EXAM_TYPES)[number]["value"];

const ONBOARDING_EXAM_TYPE_VALUES = new Set<string>(
  ONBOARDING_EXAM_TYPES.map((exam) => exam.value)
);

export function isOnboardingExamType(value: unknown): value is OnboardingExamType {
  return typeof value === "string" && ONBOARDING_EXAM_TYPE_VALUES.has(value);
}

export function onboardingExamLabel(value: unknown) {
  return ONBOARDING_EXAM_TYPES.find((exam) => exam.value === value)?.label || "Not selected";
}

export function normalizeOnboardingExamType(value: unknown): OnboardingExamType | "" {
  if (isOnboardingExamType(value)) return value;
  if (value === "ati_teas" || value === "teas" || value === "exit-ati") return "ati_teas_7";
  if (value === "hesi") return "hesi_a2";
  if (value === "nursing_exit_exam" || value === "exit-hesi") return "nursing_exit_exams";
  if (value === "rn-testbank" || value === "lpn-testbank") return "nursing_test_bank";
  return "";
}

export function primaryExamIdForOnboardingExam(value: OnboardingExamType) {
  if (value === "ati_teas_7" || value === "hesi_a2") return value;
  return null;
}

export function focusAreasForOnboardingExam(value: OnboardingExamType) {
  return [value];
}

export function hasCompletedOnboarding(doc: UserDocument | null | undefined) {
  if (!doc) return false;
  if (doc.profile?.onboarding_completed === true) return true;

  // Existing users created before onboarding should not be blocked when they
  // already have a usable exam focus saved from the previous signup/profile flow.
  if (doc.profile?.primary_exam_id || doc.profile?.focus_areas?.some((area) => area?.trim())) {
    return true;
  }

  return false;
}

export function onboardingStepForProfile(doc: UserDocument | null | undefined) {
  const rawStep = Number(doc?.profile?.onboarding_step || 1);
  if (rawStep === 2 || rawStep === 3) return rawStep;
  return 1;
}
