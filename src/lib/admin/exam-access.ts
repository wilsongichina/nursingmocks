import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { ExamAccessProduct } from "@/lib/billing/models";
import {
  DEFAULT_EXAM_ACCESS_PRODUCTS,
  EXAM_ACCESS_COLLECTION,
  normalizeExamAccessId,
} from "@/lib/exam-access-catalog";
import { getAdminDb } from "@/lib/server/firebase-admin";

type Serializable<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type ExamAccessInput = {
  examId?: unknown;
  name?: unknown;
  category?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  active?: unknown;
  previewEnabled?: unknown;
  previewPercentage?: unknown;
};

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function serializeDates<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      toDateOrNull(entry) ? toDateOrNull(entry)?.toISOString() ?? null : entry,
    ])
  ) as Serializable<T>;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function validateExamAccessInput(input: ExamAccessInput, options: { requireId: boolean }) {
  const issues: string[] = [];
  const examId = normalizeExamAccessId(text(input.examId));
  const name = text(input.name);
  const category = text(input.category);
  const shortDescription = text(input.shortDescription);
  const description = text(input.description);
  const previewPercentage = numberValue(input.previewPercentage, 20);

  if (options.requireId && !examId) issues.push("Exam ID is required.");
  if (examId && examId.length > 80) issues.push("Exam ID must be 80 characters or fewer.");
  if (!name) issues.push("Exam name is required.");
  if (!category) issues.push("Category is required.");
  if (!Number.isFinite(previewPercentage) || previewPercentage < 0 || previewPercentage > 100) {
    issues.push("Preview percentage must be between 0 and 100.");
  }
  if (issues.length > 0) {
    return { valid: false as const, issues };
  }

  return {
    valid: true as const,
    product: {
      examId,
      name,
      category,
      shortDescription,
      description,
      active: booleanValue(input.active, true),
      previewEnabled: booleanValue(input.previewEnabled, true),
      previewPercentage,
    },
  };
}

function sortTime(value: unknown) {
  const date = toDateOrNull(value);
  return date ? date.getTime() : 0;
}

export async function getAdminExamAccessProducts() {
  const snapshot = await getAdminDb().collection(EXAM_ACCESS_COLLECTION).get();
  const firestoreProducts = new Map(
    snapshot.docs.map((doc) => [doc.id, { ...doc.data(), examId: doc.id } as ExamAccessProduct])
  );

  for (const product of DEFAULT_EXAM_ACCESS_PRODUCTS) {
    if (!firestoreProducts.has(product.examId)) {
      firestoreProducts.set(product.examId, product);
    }
  }

  return Array.from(firestoreProducts.values())
    .sort((left, right) => {
      const leftTime = sortTime(left.updatedAt) || sortTime(left.createdAt);
      const rightTime = sortTime(right.updatedAt) || sortTime(right.createdAt);
      return rightTime - leftTime || left.name.localeCompare(right.name);
    })
    .map((product) => serializeDates(product));
}

export async function createAdminExamAccessProduct(input: ExamAccessInput, adminUid: string | null) {
  const result = validateExamAccessInput(input, { requireId: true });
  if (!result.valid) throw new Error(result.issues.join(" "));

  const productRef = getAdminDb().collection(EXAM_ACCESS_COLLECTION).doc(result.product.examId);
  const existing = await productRef.get();
  if (existing.exists || DEFAULT_EXAM_ACCESS_PRODUCTS.some((product) => product.examId === result.product.examId)) {
    throw new Error("Exam ID already exists.");
  }

  const product: ExamAccessProduct = {
    ...result.product,
    displayOrder: 100,
    createdAt: new Date(),
    createdBy: adminUid,
    updatedAt: new Date(),
    updatedBy: adminUid,
  };

  await productRef.set({
    ...product,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { product: serializeDates(product) };
}

export async function updateAdminExamAccessProduct(examId: string, input: ExamAccessInput, adminUid: string | null) {
  const normalizedExamId = normalizeExamAccessId(examId);
  if (!normalizedExamId) throw new Error("Exam ID is required.");

  const current =
    (await getAdminDb().collection(EXAM_ACCESS_COLLECTION).doc(normalizedExamId).get()).data() ??
    DEFAULT_EXAM_ACCESS_PRODUCTS.find((product) => product.examId === normalizedExamId);

  if (!current) throw new Error("Exam access product was not found.");

  const result = validateExamAccessInput(
    {
      examId: normalizedExamId,
      name: input.name ?? current.name,
      category: input.category ?? current.category,
      shortDescription: input.shortDescription ?? current.shortDescription,
      description: input.description ?? current.description,
      active: input.active ?? current.active,
      previewEnabled: input.previewEnabled ?? current.previewEnabled,
      previewPercentage: input.previewPercentage ?? current.previewPercentage ?? 20,
    },
    { requireId: true }
  );
  if (!result.valid) throw new Error(result.issues.join(" "));

  const productRef = getAdminDb().collection(EXAM_ACCESS_COLLECTION).doc(normalizedExamId);
  await productRef.set(
    {
      ...result.product,
      examId: normalizedExamId,
      createdAt: current.createdAt ?? FieldValue.serverTimestamp(),
      createdBy: current.createdBy ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: adminUid,
    },
    { merge: true }
  );

  return {
    product: serializeDates({
      ...current,
      ...result.product,
      examId: normalizedExamId,
      updatedAt: new Date(),
      updatedBy: adminUid,
    } as ExamAccessProduct),
  };
}
