import { describe, expect, it } from "vitest";
import { buildMyExamsViewModel } from "@/lib/my-exams/get-my-exams";
import type { UserDocument } from "@/types/user-document";

function docWithEntitlements(entitlements: Record<string, boolean>): UserDocument {
  return {
    entitlements,
  } as UserDocument;
}

describe("buildMyExamsViewModel", () => {
  it("grants full ATI TEAS access from a specific exam entitlement", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }));
    const atiExams = view.exams.filter((exam) => exam.packageId === "ati_teas_7");

    expect(atiExams.length).toBeGreaterThan(0);
    expect(atiExams.every((exam) => exam.accessState === "full")).toBe(true);
    expect(view.accessLabels).toContain("ATI TEAS 7");
  });

  it("supports multiple package entitlements", () => {
    const view = buildMyExamsViewModel(
      docWithEntitlements({
        "exam:ati_teas_7": true,
        nursing_test_bank: true,
      })
    );

    expect(view.exams.find((exam) => exam.packageId === "ati_teas_7")?.accessState).toBe("full");
    expect(view.exams.find((exam) => exam.packageId === "nursing_test_bank_rn")?.accessState).toBe("full");
    expect(view.accessLabels).toEqual(expect.arrayContaining(["ATI TEAS 7", "Nursing Test Bank"]));
  });

  it("unlocks every exam for all access users", () => {
    const view = buildMyExamsViewModel(
      docWithEntitlements({
        ati_teas_7: true,
        hesi_a2: true,
        nursing_test_bank: true,
        nursing_exit_exams: true,
      })
    );

    expect(view.exams.every((exam) => exam.accessState === "full")).toBe(true);
    expect(view.lockedPackages).toHaveLength(0);
  });

  it("shows preview-enabled exams and locked package cards for preview-only users", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({}));

    expect(view.hasPaidAccess).toBe(false);
    expect(view.accessLabels).toEqual(["Free preview"]);
    expect(view.exams.some((exam) => exam.accessState === "preview")).toBe(true);
    expect(view.exams.some((exam) => exam.accessState === "locked")).toBe(true);
    expect(view.lockedPackages.length).toBeGreaterThan(0);
  });

  it("does not create fake attempt records", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }));

    expect(view.continueAttempts).toEqual([]);
    expect(view.exams.some((exam) => exam.progressStatus === "completed")).toBe(false);
    expect(view.exams.some((exam) => exam.progressStatus === "in_progress")).toBe(false);
  });
});
