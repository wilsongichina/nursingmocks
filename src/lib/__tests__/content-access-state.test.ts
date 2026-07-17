import { describe, expect, it } from "vitest";
import {
  buildQuizPreviewState,
  resolvePreviewLimit,
  resolveRequiredExamAccessProduct,
} from "@/lib/content-access-state";

describe("content access state", () => {
  it("prefers route mapping exam access over page data fallback", () => {
    expect(
      resolveRequiredExamAccessProduct(
        { examAccessProductId: "ati_teas_7" },
        { examAccessProductId: "hesi_a2" }
      )
    ).toBe("ati_teas_7");
  });

  it("uses page data when route mapping has no exam access product", () => {
    expect(resolveRequiredExamAccessProduct({}, { examAccessProductId: "hesi_a2" })).toBe("hesi_a2");
  });

  it("infers HESI A2 access for legacy dynamic routes without saved product IDs", () => {
    expect(
      resolveRequiredExamAccessProduct(
        {
          pillarId: "nursing-entrance-exam",
          slug: "hesi-a2-math-practice-test-set-1",
        },
        {}
      )
    ).toBe("hesi_a2");
  });

  it("derives preview limit from percentage", () => {
    expect(resolvePreviewLimit(75, 20)).toBe(15);
    expect(resolvePreviewLimit(38, 20)).toBe(8);
    expect(resolvePreviewLimit(32, 20)).toBe(7);
  });

  it("builds hidden question counts for a previewed quiz", () => {
    const state = buildQuizPreviewState(50, "ati_teas_7", [
      {
        examId: "ati_teas_7",
        name: "ATI TEAS 7",
        previewEnabled: true,
        previewPercentage: 20,
      },
    ]);

    expect(state.previewLimit).toBe(10);
    expect(state.hiddenQuestionCount).toBe(40);
    expect(state.productLabel).toBe("ATI TEAS 7");
  });

  it("keeps unassigned content public during the preparation stage", () => {
    const state = buildQuizPreviewState(50, null);

    expect(state.previewLimit).toBe(50);
    expect(state.hiddenQuestionCount).toBe(0);
  });
});
