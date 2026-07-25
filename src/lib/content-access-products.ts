import { USER_ENTITLEMENT_LABELS, type UserEntitlementKey } from "@/lib/user-entitlements";

export type ContentPillarId = "nursing-entrance-exam" | "nursing-test-bank" | "nursing-exit-exam";

export type ContentExamAccessProductId = UserEntitlementKey | string;

export const CONTENT_ACCESS_PRODUCTS: Record<UserEntitlementKey, { label: string }> = {
  ati_teas_7: { label: USER_ENTITLEMENT_LABELS.ati_teas_7 },
  hesi_a2: { label: USER_ENTITLEMENT_LABELS.hesi_a2 },
  nursing_test_bank: { label: USER_ENTITLEMENT_LABELS.nursing_test_bank },
  nursing_exit_exams: { label: USER_ENTITLEMENT_LABELS.nursing_exit_exams },
};

export const CONTENT_ACCESS_PRODUCTS_BY_PILLAR: Record<ContentPillarId, UserEntitlementKey[]> = {
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
  return CONTENT_ACCESS_PRODUCTS[productId as UserEntitlementKey]?.label ?? productId;
}

export function normalizeDynamicContentExamAccessProductId(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeContentExamAccessProductId(
  pillarId: string,
  value: unknown,
  fallback?: unknown
): ContentExamAccessProductId | null {
  if (!isContentPillarId(pillarId)) return null;
  const allowed = CONTENT_ACCESS_PRODUCTS_BY_PILLAR[pillarId];
  const explicitCandidate = normalizeDynamicContentExamAccessProductId(value);
  const fallbackCandidate = normalizeDynamicContentExamAccessProductId(fallback);
  const candidate = explicitCandidate || fallbackCandidate;
  if ((allowed as readonly string[]).includes(candidate)) {
    return candidate as ContentExamAccessProductId;
  }
  // New exam products are admin-managed in Firestore, so preserve normalized IDs that come from the dynamic catalog.
  if (explicitCandidate) return explicitCandidate;
  if (pillarId === "nursing-entrance-exam") {
    const text = [value, fallback].map((entry) => String(entry ?? "").toLowerCase()).join(" ");
    if (text.includes("hesi") || text.includes("hessi")) return "hesi_a2";
    if (text.includes("teas") || text.includes("ati")) return "ati_teas_7";
  }
  return DEFAULT_CONTENT_ACCESS_PRODUCT_BY_PILLAR[pillarId];
}

export function validateContentExamAccessProductId(pillarId: string, value: unknown) {
  if (!isContentPillarId(pillarId)) return { valid: false, message: "Unsupported content pillar." };
  const normalized = normalizeContentExamAccessProductId(pillarId, value);
  if (!normalized) {
    return {
      valid: false,
      message: `Choose a valid exam access product for ${pillarId}.`,
    };
  }
  return { valid: true, message: "" };
}
