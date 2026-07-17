import { USER_ENTITLEMENT_LABELS, type UserEntitlementKey } from "@/lib/user-entitlements";

export type ContentPillarId = "nursing-entrance-exam" | "nursing-test-bank" | "nursing-exit-exam";

export type ContentExamAccessProductId = UserEntitlementKey;

export const CONTENT_ACCESS_PRODUCTS: Record<ContentExamAccessProductId, { label: string }> = {
  ati_teas_7: { label: USER_ENTITLEMENT_LABELS.ati_teas_7 },
  hesi_a2: { label: USER_ENTITLEMENT_LABELS.hesi_a2 },
  nursing_test_bank: { label: USER_ENTITLEMENT_LABELS.nursing_test_bank },
  nursing_exit_exams: { label: USER_ENTITLEMENT_LABELS.nursing_exit_exams },
};

export const CONTENT_ACCESS_PRODUCTS_BY_PILLAR: Record<ContentPillarId, ContentExamAccessProductId[]> = {
  "nursing-entrance-exam": ["ati_teas_7", "hesi_a2"],
  "nursing-test-bank": ["nursing_test_bank"],
  "nursing-exit-exam": ["nursing_exit_exams"],
};

export const DEFAULT_CONTENT_ACCESS_PRODUCT_BY_PILLAR: Record<ContentPillarId, ContentExamAccessProductId | null> = {
  "nursing-entrance-exam": null,
  "nursing-test-bank": "nursing_test_bank",
  "nursing-exit-exam": "nursing_exit_exams",
};

export function isContentPillarId(value: string): value is ContentPillarId {
  return value === "nursing-entrance-exam" || value === "nursing-test-bank" || value === "nursing-exit-exam";
}

export function contentAccessProductLabel(productId: string | null | undefined) {
  if (!productId) return "Not assigned";
  return CONTENT_ACCESS_PRODUCTS[productId as ContentExamAccessProductId]?.label ?? productId;
}

export function normalizeContentExamAccessProductId(
  pillarId: string,
  value: unknown,
  fallback?: unknown
): ContentExamAccessProductId | null {
  if (!isContentPillarId(pillarId)) return null;
  const allowed = CONTENT_ACCESS_PRODUCTS_BY_PILLAR[pillarId];
  const candidate = typeof value === "string" && value.trim() ? value.trim() : typeof fallback === "string" ? fallback.trim() : "";
  if (allowed.includes(candidate as ContentExamAccessProductId)) {
    return candidate as ContentExamAccessProductId;
  }
  if (pillarId === "nursing-entrance-exam") {
    const text = [value, fallback].map((entry) => String(entry ?? "").toLowerCase()).join(" ");
    if (text.includes("hesi") || text.includes("hessi")) return "hesi_a2";
    if (text.includes("teas") || text.includes("ati")) return "ati_teas_7";
  }
  return DEFAULT_CONTENT_ACCESS_PRODUCT_BY_PILLAR[pillarId];
}

export function validateContentExamAccessProductId(pillarId: string, value: unknown) {
  if (!isContentPillarId(pillarId)) return { valid: false, message: "Unsupported content pillar." };
  const allowed = CONTENT_ACCESS_PRODUCTS_BY_PILLAR[pillarId];
  if (typeof value !== "string" || !allowed.includes(value as ContentExamAccessProductId)) {
    return {
      valid: false,
      message: `Choose a valid exam access product for ${pillarId}.`,
    };
  }
  return { valid: true, message: "" };
}
