import {
  BILLING_EXAM_ACCESS_IDS,
  type BillingExamAccessId,
  type ExamAccessProduct,
} from "@/lib/billing/models";

export const EXAM_ACCESS_COLLECTION = "exam_access_products";

export const FIXED_ACCESS_DURATIONS = [
  { label: "1 Month Access", durationDays: 30 },
  { label: "3 Months Access", durationDays: 90 },
] as const;

export type FixedAccessDurationDays = (typeof FIXED_ACCESS_DURATIONS)[number]["durationDays"];

export const DEFAULT_EXAM_ACCESS_PRODUCTS: ExamAccessProduct[] = [
  {
    examId: "ati_teas_7",
    name: "ATI TEAS 7",
    category: "Nursing Entrance Exams",
    shortDescription: "ATI TEAS 7 entrance exam practice.",
    description: "Practice for ATI TEAS 7 with focused nursing entrance exam preparation.",
    active: true,
    previewEnabled: true,
    previewPercentage: 20,
    displayOrder: 10,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  },
  {
    examId: "hesi_a2",
    name: "HESI A2",
    category: "Nursing Entrance Exams",
    shortDescription: "HESI A2 entrance exam practice.",
    description: "Practice for HESI A2 with focused nursing entrance exam preparation.",
    active: true,
    previewEnabled: true,
    previewPercentage: 20,
    displayOrder: 20,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  },
  {
    examId: "nursing_test_bank",
    name: "Nursing Test Bank",
    category: "Nursing Test Bank",
    shortDescription: "RN and LPN test bank practice.",
    description: "Practice with RN and LPN nursing test bank questions.",
    active: true,
    previewEnabled: true,
    previewPercentage: 20,
    displayOrder: 30,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  },
  {
    examId: "nursing_exit_exams",
    name: "Nursing Exit Exams",
    category: "Nursing Exit Exams",
    shortDescription: "RN and LPN exit exam practice.",
    description: "Practice with RN and LPN nursing exit exam preparation.",
    active: true,
    previewEnabled: true,
    previewPercentage: 20,
    displayOrder: 40,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  },
];

export function isExamAccessId(value: string): value is BillingExamAccessId {
  return (BILLING_EXAM_ACCESS_IDS as readonly string[]).includes(value);
}

export function normalizeExamAccessId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getDefaultExamAccessProduct(examId: string) {
  return DEFAULT_EXAM_ACCESS_PRODUCTS.find((product) => product.examId === examId) ?? null;
}

export function getActiveExamAccessProducts(products: ExamAccessProduct[] = DEFAULT_EXAM_ACCESS_PRODUCTS) {
  return [...products]
    .filter((product) => product.active)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name));
}

export function isFixedAccessDurationDays(value: number): value is FixedAccessDurationDays {
  return FIXED_ACCESS_DURATIONS.some((duration) => duration.durationDays === value);
}
