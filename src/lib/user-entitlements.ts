import type { UserDocumentEntitlements } from "@/types/user-document";

export const USER_ENTITLEMENT_KEYS = [
  "ati_teas_7",
  "hesi_a2",
  "nursing_test_bank",
  "nursing_exit_exams",
] as const;

export type UserEntitlementKey = (typeof USER_ENTITLEMENT_KEYS)[number];

export const USER_ENTITLEMENT_LABELS: Record<UserEntitlementKey, string> = {
  ati_teas_7: "ATI TEAS 7",
  hesi_a2: "HESI A2",
  nursing_test_bank: "Nursing Test Bank",
  nursing_exit_exams: "Nursing Exit Exams",
};

const LEGACY_ENTITLEMENT_MAP: Record<string, UserEntitlementKey[]> = {
  "exam:ati_teas_7": ["ati_teas_7"],
  "exam:hesi_a2": ["hesi_a2"],
  "bundle:all_access": [...USER_ENTITLEMENT_KEYS],
  all_access: [...USER_ENTITLEMENT_KEYS],
  "test_bank:rn": ["nursing_test_bank"],
  "test_bank:lpn": ["nursing_test_bank"],
  "exit_exam:rn": ["nursing_exit_exams"],
  "exit_exam:lpn": ["nursing_exit_exams"],
};

export function defaultUserEntitlements(): Record<UserEntitlementKey, boolean> {
  return {
    ati_teas_7: false,
    hesi_a2: false,
    nursing_test_bank: false,
    nursing_exit_exams: false,
  };
}

export function normalizeUserEntitlements(entitlements: UserDocumentEntitlements | null | undefined) {
  const normalized = defaultUserEntitlements();

  for (const [key, enabled] of Object.entries(entitlements ?? {})) {
    if (enabled !== true) continue;
    if (USER_ENTITLEMENT_KEYS.includes(key as UserEntitlementKey)) {
      normalized[key as UserEntitlementKey] = true;
      continue;
    }
    for (const canonicalKey of LEGACY_ENTITLEMENT_MAP[key] ?? []) {
      normalized[canonicalKey] = true;
    }
  }

  return normalized;
}

export function entitlementPatchForPackageIds(packageIds: string[], enabled: boolean) {
  return Object.fromEntries(
    USER_ENTITLEMENT_KEYS.map((key) => [key, packageIds.includes(key) ? enabled : undefined]).filter(
      (entry): entry is [UserEntitlementKey, boolean] => entry[1] !== undefined
    )
  );
}
