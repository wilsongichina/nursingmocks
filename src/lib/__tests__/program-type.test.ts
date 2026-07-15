import { describe, expect, it } from "vitest";
import {
  inferPrimaryExamIdFromProgramType,
  recommendedFocusLabelFromProgramType,
} from "@/lib/program-type";

describe("program type focus mapping", () => {
  it.each([
    ["ati_teas", "ati_teas_7", "ATI TEAS 7"],
    ["hesi_a2", "hesi_a2", "HESI A2"],
    ["nursing_test_bank", null, "Nursing Test Bank"],
    ["nursing_exit_exam", null, "Nursing Exit Exam"],
  ])("maps %s consistently", (programType, primaryExamId, focusLabel) => {
    expect(inferPrimaryExamIdFromProgramType(programType)).toBe(primaryExamId);
    expect(recommendedFocusLabelFromProgramType(programType)).toBe(focusLabel);
  });
});
