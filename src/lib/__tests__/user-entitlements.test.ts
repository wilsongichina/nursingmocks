import { describe, expect, it } from "vitest";
import {
  entitlementKeysForPackageIds,
  entitlementPatchForPackageIds,
  normalizeUserEntitlements,
} from "@/lib/user-entitlements";

describe("user entitlement helpers", () => {
  it("expands all access into every canonical user entitlement", () => {
    expect(entitlementKeysForPackageIds(["all_access"])).toEqual([
      "ati_teas_7",
      "hesi_a2",
      "nursing_test_bank",
      "nursing_exit_exams",
    ]);
  });

  it("writes all canonical flags for all access billing plans", () => {
    expect(entitlementPatchForPackageIds(["all_access"], true)).toEqual({
      ati_teas_7: true,
      hesi_a2: true,
      nursing_test_bank: true,
      nursing_exit_exams: true,
    });
  });

  it("normalizes legacy and billing aliases to canonical user entitlements", () => {
    expect(normalizeUserEntitlements({ ati_teas: true, "bundle:all_access": true })).toEqual({
      ati_teas_7: true,
      hesi_a2: true,
      nursing_test_bank: true,
      nursing_exit_exams: true,
    });
  });
});
