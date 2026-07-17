import { describe, expect, it } from "vitest";
import { buildMyExamsViewModel } from "@/lib/my-exams/get-my-exams";
import type { MyExamsDynamicExamInput } from "@/lib/my-exams/types";
import type { UserDocument } from "@/types/user-document";

function docWithEntitlements(entitlements: Record<string, boolean>): UserDocument {
  return {
    entitlements,
  } as UserDocument;
}

function docWithSelectedExam(profile: UserDocument["profile"]): UserDocument {
  return {
    entitlements: {},
    profile,
  } as UserDocument;
}

describe("buildMyExamsViewModel", () => {
  it("grants full ATI TEAS access from a specific exam entitlement", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }));
    const atiExams = view.exams.filter((exam) => exam.packageId === "ati_teas_7");

    expect(atiExams.length).toBeGreaterThan(0);
    expect(atiExams.every((exam) => exam.accessState === "full")).toBe(true);
    expect(view.exams.every((exam) => exam.packageId === "ati_teas_7")).toBe(true);
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
    expect(view.exams.every((exam) => ["ati_teas_7", "nursing_test_bank_rn", "nursing_test_bank_lpn"].includes(exam.packageId))).toBe(true);
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
    expect(view.exams.some((exam) => exam.accessState === "locked")).toBe(false);
    expect(view.lockedPackages.length).toBeGreaterThan(0);
  });

  it("grants full access from active billing history and preserves access end dates", () => {
    const accessEndsAt = "2030-01-31T00:00:00.000Z";
    const view = buildMyExamsViewModel(docWithEntitlements({}), {
      entitlements: [
        {
          status: "active",
          examId: "hesi_a2",
          accessEndsAt,
        },
      ],
    });

    const hesiExam = view.exams.find((exam) => exam.packageId === "hesi_a2");

    expect(hesiExam?.accessState).toBe("full");
    expect(hesiExam?.accessEndsAt?.toISOString()).toBe(accessEndsAt);
    expect(view.accessLabels).toContain("HESI A2");
  });

  it("ignores expired billing history records", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({}), {
      entitlements: [
        {
          status: "active",
          examId: "hesi_a2",
          accessEndsAt: "2020-01-31T00:00:00.000Z",
        },
      ],
    });

    expect(view.exams.find((exam) => exam.packageId === "hesi_a2")?.accessState).toBe("preview");
    expect(view.hasPaidAccess).toBe(false);
  });

  it("derives free preview count from the configured preview percentage", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({}));
    const mathPreview = view.exams.find((exam) => exam.id === "ati-teas-math-set-1");

    expect(mathPreview?.accessState).toBe("preview");
    expect(mathPreview?.previewPercentage).toBe(20);
    expect(mathPreview?.previewQuestionCount).toBe(8);
  });

  it("does not create fake attempt records", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }));

    expect(view.continueAttempts).toEqual([]);
    expect(view.exams.some((exam) => exam.progressStatus === "completed")).toBe(false);
    expect(view.exams.some((exam) => exam.progressStatus === "in_progress")).toBe(false);
  });

  it("uses dynamic Firestore entrance exams instead of fallback entrance placeholders", () => {
    const dynamicEntranceExam: MyExamsDynamicExamInput = {
      id: "teas-firestore-math-set-2",
      slug: "teas-math-practice-test-set-2",
      title: "TEAS Math Practice Test Set 2",
      familyId: "nursing_entrance_exams",
      familyName: "Nursing Entrance Exams",
      packageId: "ati_teas_7",
      subjectId: "math",
      subjectName: "TEAS Math Practice Test",
      setNumber: 2,
      questionCount: 40,
      supportedModes: ["practice", "exam"],
      href: "/teas-math-practice-test-set-2",
      previewEnabled: true,
      previewPercentage: 20,
      requiredPackageIds: ["ati_teas_7"],
    };

    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }), null, [dynamicEntranceExam]);
    const entranceExams = view.exams.filter((exam) => exam.familyId === "nursing_entrance_exams");

    expect(entranceExams).toHaveLength(1);
    expect(entranceExams[0].setNumber).toBe(2);
    expect(entranceExams[0].href).toBe("/teas-math-practice-test-set-2");
    expect(entranceExams[0].accessState).toBe("full");
  });

  it("does not show fallback entrance placeholders while dynamic entrance exams are loading", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({ ati_teas_7: true }), null, null);

    expect(view.exams.some((exam) => exam.familyId === "nursing_entrance_exams")).toBe(false);
    expect(view.accessLabels).toContain("ATI TEAS 7");
    expect(view.hasPaidAccess).toBe(true);
  });

  it("shows the registration-selected entrance exam as limited preview for free users", () => {
    const dynamicEntranceExam: MyExamsDynamicExamInput = {
      id: "teas-firestore-math-set-4",
      slug: "teas-math-practice-test-set-4",
      title: "TEAS Math Practice Test Set 4",
      familyId: "nursing_entrance_exams",
      familyName: "Nursing Entrance Exams",
      packageId: "ati_teas_7",
      subjectId: "math",
      subjectName: "TEAS Math Practice Test",
      setNumber: 4,
      questionCount: 38,
      supportedModes: ["practice", "exam"],
      href: "/teas-math-practice-test-set-4",
      previewEnabled: true,
      previewPercentage: 20,
      requiredPackageIds: ["ati_teas_7"],
    };
    const view = buildMyExamsViewModel(
      docWithSelectedExam({
        primary_exam_id: "ati_teas_7",
        focus_areas: ["ati_teas"],
      } as UserDocument["profile"]),
      null,
      [dynamicEntranceExam]
    );

    expect(view.hasPaidAccess).toBe(false);
    expect(view.exams).toHaveLength(1);
    expect(view.exams[0].setNumber).toBe(4);
    expect(view.exams[0].accessState).toBe("preview");
  });

  it("shows the registration-selected nursing test bank as limited preview for free users", () => {
    const view = buildMyExamsViewModel(
      docWithSelectedExam({
        primary_exam_id: null,
        focus_areas: ["nursing_test_bank"],
      } as UserDocument["profile"])
    );

    expect(view.hasPaidAccess).toBe(false);
    expect(view.exams).toHaveLength(2);
    expect(view.exams.every((exam) => exam.familyId === "nursing_test_bank")).toBe(true);
    expect(view.exams.every((exam) => exam.accessState === "preview")).toBe(true);
  });

  it("keeps locked Nursing Test Bank and Nursing Exit Exams out of preview-only main exam list", () => {
    const view = buildMyExamsViewModel(docWithEntitlements({}), null, [
      {
        id: "hesi-firestore-math-set-1",
        slug: "hesi-a2-math-practice-test-set-1",
        title: "HESI A2 Math Practice Test Set 1",
        familyId: "nursing_entrance_exams",
        familyName: "Nursing Entrance Exams",
        packageId: "hesi_a2",
        subjectId: "math",
        subjectName: "HESI A2 Math Practice Test",
        setNumber: 1,
        questionCount: 32,
        supportedModes: ["practice", "exam"],
        href: "/hesi-a2-math-practice-test-set-1",
        previewEnabled: true,
        previewPercentage: 20,
        requiredPackageIds: ["hesi_a2"],
      },
    ]);

    expect(view.exams.some((exam) => exam.familyId === "nursing_test_bank")).toBe(false);
    expect(view.exams.some((exam) => exam.familyId === "nursing_exit_exams")).toBe(false);
    expect(view.exams.filter((exam) => exam.familyId === "nursing_entrance_exams")).toHaveLength(1);
    expect(view.lockedPackages.map((pkg) => pkg.id)).toEqual(
      expect.arrayContaining(["nursing-test-bank", "nursing-exit-exams"])
    );
  });
});
