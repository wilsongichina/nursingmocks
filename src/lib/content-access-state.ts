import { DEFAULT_EXAM_ACCESS_PRODUCTS } from "@/lib/exam-access-catalog";
import { contentAccessProductLabel } from "@/lib/content-access-products";

export type ContentAccessSource = {
  examAccessProductId?: unknown;
  pillarId?: unknown;
  slug?: unknown;
  refPath?: unknown;
  pageName?: unknown;
  title?: unknown;
  quizName?: unknown;
  meta?: {
    title?: unknown;
    description?: unknown;
    keywords?: unknown;
  };
};

export type ContentAccessPreviewProduct = {
  examId: string;
  name: string;
  previewEnabled?: boolean;
  previewPercentage?: number;
};

function sourceText(...sources: Array<ContentAccessSource | null | undefined>) {
  return sources
    .flatMap((source) => [
      source?.pillarId,
      source?.slug,
      source?.refPath,
      source?.pageName,
      source?.title,
      source?.quizName,
      source?.meta?.title,
      source?.meta?.description,
      source?.meta?.keywords,
    ])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .toLowerCase();
}

function inferLegacyExamAccessProduct(
  mapping: ContentAccessSource | null | undefined,
  pageData: ContentAccessSource | null | undefined
) {
  const text = sourceText(mapping, pageData);

  if (text.includes("nursing-test-bank")) return "nursing_test_bank";
  if (text.includes("nursing-exit-exam")) return "nursing_exit_exams";
  if (text.includes("hesi") || text.includes("hessi")) return "hesi_a2";
  if (text.includes("teas") || text.includes("ati")) return "ati_teas_7";

  return null;
}

export function resolveRequiredExamAccessProduct(
  mapping: ContentAccessSource | null | undefined,
  pageData: ContentAccessSource | null | undefined
) {
  const mappingProductId = typeof mapping?.examAccessProductId === "string" ? mapping.examAccessProductId.trim() : "";
  if (mappingProductId) return mappingProductId;

  const pageProductId = typeof pageData?.examAccessProductId === "string" ? pageData.examAccessProductId.trim() : "";
  if (pageProductId) return pageProductId;

  return inferLegacyExamAccessProduct(mapping, pageData);
}

export function resolvePreviewProduct(
  requiredProductId: string | null,
  products: ContentAccessPreviewProduct[] = DEFAULT_EXAM_ACCESS_PRODUCTS
) {
  if (!requiredProductId) return null;
  return products.find((product) => product.examId === requiredProductId) ?? null;
}

export function resolvePreviewLimit(totalQuestions: number, previewPercentage: number | null | undefined) {
  if (totalQuestions <= 0) return 0;
  const percentage = Number.isFinite(previewPercentage) ? Number(previewPercentage) : 20;
  const boundedPercentage = Math.min(100, Math.max(0, percentage));
  if (boundedPercentage <= 0) return 0;
  return Math.max(1, Math.ceil((totalQuestions * boundedPercentage) / 100));
}

export function buildQuizPreviewState(
  totalQuestions: number,
  requiredProductId: string | null,
  products: ContentAccessPreviewProduct[] = DEFAULT_EXAM_ACCESS_PRODUCTS
) {
  if (!requiredProductId) {
    return {
      requiredProductId: null,
      productLabel: "Public content",
      previewEnabled: true,
      previewPercentage: 100,
      previewLimit: totalQuestions,
      hiddenQuestionCount: 0,
    };
  }

  const product = resolvePreviewProduct(requiredProductId, products);
  const previewEnabled = product?.previewEnabled ?? true;
  const previewPercentage = previewEnabled ? product?.previewPercentage ?? 20 : 0;
  const previewLimit = resolvePreviewLimit(totalQuestions, previewPercentage);

  return {
    requiredProductId,
    productLabel: product?.name ?? contentAccessProductLabel(requiredProductId),
    previewEnabled,
    previewPercentage,
    previewLimit,
    hiddenQuestionCount: Math.max(0, totalQuestions - previewLimit),
  };
}
