import { normalizeBillingSlug, normalizePlanName } from "@/lib/billing/admin-config";

const ADMIN_CONTENT_ACRONYMS: Record<string, string> = {
  a2: "A2",
  ati: "ATI",
  hesi: "HESI",
  lpn: "LPN",
  rn: "RN",
  teas: "TEAS",
};

export function normalizeAdminContentName(value: string) {
  return normalizePlanName(value)
    .split(" ")
    .map((word) => ADMIN_CONTENT_ACRONYMS[word.toLowerCase()] || word)
    .join(" ");
}

export function normalizeAdminContentNameInput(value: string) {
  const normalizedName = normalizeAdminContentName(value);
  return value.endsWith(" ") && normalizedName ? `${normalizedName} ` : normalizedName;
}

export function normalizeAdminContentSlug(value: string) {
  return normalizeBillingSlug(value);
}
