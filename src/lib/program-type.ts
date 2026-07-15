/** Stored as `profile.focus_areas[0]` at registration and in account settings */

export const PROGRAM_TYPE_OPTIONS = [
  { value: "ati_teas", label: "ATI TEAS" },
  { value: "hesi_a2", label: "HESI A2" },
  { value: "nursing_test_bank", label: "Nursing Test Bank" },
  { value: "nursing_exit_exam", label: "Nursing Exit Exam" },
] as const;

export type ProgramTypeValue = (typeof PROGRAM_TYPE_OPTIONS)[number]["value"];

const VALID = new Set<string>(PROGRAM_TYPE_OPTIONS.map((o) => o.value));

export function isValidProgramType(value: string): value is ProgramTypeValue {
  return VALID.has(value);
}

/** Display labels including legacy `focus_areas` values from older sign-ups */
export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  ati_teas: "ATI TEAS",
  hesi_a2: "HESI A2",
  nursing_test_bank: "Nursing Test Bank",
  nursing_exit_exam: "Nursing Exit Exam",
  teas: "Pre-Nursing · TEAS Entrance",
  hesi: "Pre-Nursing · HESI A2 Entrance",
  "rn-testbank": "RN Program · Nursing Test Bank",
  "lpn-testbank": "LPN / LVN Program · Nursing Test Bank",
  "exit-ati": "RN / LPN · ATI Exit / Predictor Prep",
  "exit-hesi": "RN / LPN · HESI Exit Exam Prep",
  other: "Other",
};

export const PRIMARY_EXAM_LABELS: Record<string, string> = {
  ati_teas_7: "ATI TEAS 7",
  hesi_a2: "HESI A2",
};

export function inferPrimaryExamIdFromProgramType(
  programType: string | undefined
): string | null {
  if (!programType) return null;
  if (programType === "ati_teas" || programType === "teas" || programType === "exit-ati") {
    return "ati_teas_7";
  }
  if (programType === "hesi_a2" || programType === "hesi" || programType === "exit-hesi") {
    return "hesi_a2";
  }
  return null;
}

export function recommendedFocusLabelFromProgramType(programType: string | undefined): string {
  if (!programType?.trim()) return "Not set";
  const primaryExamId = inferPrimaryExamIdFromProgramType(programType);
  if (primaryExamId) {
    return PRIMARY_EXAM_LABELS[primaryExamId] ?? primaryExamId;
  }
  return PROGRAM_TYPE_LABELS[programType] ?? programType;
}

/** Map legacy focus area keys to current program type values for forms */
export function normalizeProgramTypeFromProfile(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  const t = raw.trim();
  if (VALID.has(t)) return t;
  if (t === "teas" || t === "exit-ati") return "ati_teas";
  if (t === "hesi" || t === "exit-hesi") return "hesi_a2";
  if (t === "rn-testbank" || t === "lpn-testbank") return "nursing_test_bank";
  return "";
}
