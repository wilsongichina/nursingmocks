import { describe, expect, it } from "vitest";
import {
  buildTeasBulkUploadPayload,
  buildTeasBulkUploadQuestion,
  inlineImageReferencesForQuestion,
  questionTypeIdForAtiFormat,
  validateTeasBulkUploadPayload,
} from "@/lib/admin/teas-bulk-upload-schema";

const fourOptions = {
  A: { choice: "Option A" },
  B: { choice: "Option B" },
  C: { choice: "Option C" },
  D: { choice: "Option D" },
};

describe("TEAS bulk upload schema", () => {
  it("maps ATI TEAS formats to existing bulk upload question types", () => {
    expect(questionTypeIdForAtiFormat("multiple_choice")).toBe(1);
    expect(questionTypeIdForAtiFormat("multiple_select")).toBe(2);
    expect(questionTypeIdForAtiFormat("fill_in_blank")).toBe(7);
    expect(questionTypeIdForAtiFormat("hot_spot")).toBe(9);
    expect(questionTypeIdForAtiFormat("ordered_response")).toBe(6);
  });

  it("accepts valid examples for all five ATI TEAS formats", () => {
    const payload = buildTeasBulkUploadPayload([
      buildTeasBulkUploadQuestion({
        ati_format: "multiple_choice",
        id: "mc-1",
        question: "Which value is greatest?",
        options: fourOptions,
        correctAnswer: "A",
        solution: "Option A is greatest.",
      }),
      buildTeasBulkUploadQuestion({
        ati_format: "multiple_select",
        id: "ms-1",
        question: "Which values are even? Select all that apply.",
        options: {
          ...fourOptions,
          E: { choice: "Option E" },
        },
        correctAnswer: ["A", "C"],
      }),
      buildTeasBulkUploadQuestion({
        ati_format: "fill_in_blank",
        id: "fib-1",
        question: "What is 103% as a decimal?",
        correctAnswer: "1.03",
        units: null,
      }),
      buildTeasBulkUploadQuestion({
        ati_format: "hot_spot",
        id: "hs-1",
        question: "Select point 3 on the diagram.",
        image_path: "teas/hotspot/pentagon.png",
        correctAnswer: { xRanges: [40, 50], yRanges: [20, 30] },
      }),
      buildTeasBulkUploadQuestion({
        ati_format: "ordered_response",
        id: "or-1",
        question: "Order the steps.",
        options: {
          A: { choice: "First step" },
          B: { choice: "Second step" },
          C: { choice: "Third step" },
          D: { choice: "Fourth step" },
        },
        correctAnswer: ["A", "B", "C", "D"],
      }),
    ]);

    expect(validateTeasBulkUploadPayload(payload)).toMatchObject({
      valid: true,
      errors: [],
    });
  });

  it("rejects multiple choice questions without exactly four options and one valid answer", () => {
    const result = validateTeasBulkUploadPayload({
      questions: [
        {
          question_type_id: 1,
          question: "Which option is correct?",
          options: {
            A: { choice: "A" },
            B: { choice: "B" },
            C: { choice: "C" },
          },
          correctAnswer: "D",
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.path)).toContain("$.questions[0].options");
    expect(result.errors.map((error) => error.path)).toContain("$.questions[0].correctAnswer");
  });

  it("accepts fill-in-the-blank questions without multiple-choice options", () => {
    const result = validateTeasBulkUploadPayload({
      questions: [
        {
          question_type_id: 7,
          ati_format: "fill_in_blank",
          question: "Enter the percent decrease.",
          correctAnswer: "20%",
          options: {},
        },
      ],
    });

    expect(result).toMatchObject({
      valid: true,
      errors: [],
    });
  });

  it("rejects ordered response questions unless every option is represented in order", () => {
    const result = validateTeasBulkUploadPayload({
      questions: [
        {
          question_type_id: 6,
          question: "Order the steps.",
          options: {
            A: { choice: "One" },
            B: { choice: "Two" },
            C: { choice: "Three" },
            D: { choice: "Four" },
          },
          correctAnswer: ["A", "C", "D"],
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.questions[0].correctAnswer",
          message: "Ordered response correctAnswer must include every option label in order.",
        }),
      ])
    );
  });

  it("rejects hot spot questions without image and coordinate answer data", () => {
    const result = validateTeasBulkUploadPayload({
      questions: [
        {
          question_type_id: 9,
          question: "Click the correct location.",
          correctAnswer: "A",
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.path)).toContain("$.questions[0].image_path");
    expect(result.errors.map((error) => error.path)).toContain("$.questions[0].correctAnswer");
  });

  it("tracks inline images in questions, options, and solutions", () => {
    const question = {
      question_type_id: 1,
      question: 'Refer to <img src="/teas-assets/chart.png" alt="chart"> before answering.',
      options: {
        A: { choice: 'The value beside <img src="/teas-assets/a.png" alt="A">' },
        B: { choice: "No image" },
        C: { choice: "Third option" },
        D: { choice: "Fourth option" },
      },
      correctAnswer: "B",
      solution: 'The chart shows the value. <img src="/teas-assets/explanation.png" alt="">',
    };

    expect(inlineImageReferencesForQuestion(question)).toEqual([
      { path: "$.question.img[0]", src: "/teas-assets/chart.png" },
      { path: "$.options.A.img[0]", src: "/teas-assets/a.png" },
      { path: "$.solution.img[0]", src: "/teas-assets/explanation.png" },
    ]);
  });

  it("warns when inline images use temporary browser URLs", () => {
    const result = validateTeasBulkUploadPayload({
      questions: [
        {
          question_type_id: 1,
          question: 'What does this show? <img src="data:image/png;base64,abc">',
          options: fourOptions,
          correctAnswer: "A",
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.questions[0].question.img[0]",
          message: "Inline images should use a saved public asset URL, not a temporary data/blob URL.",
        }),
      ])
    );
  });
});
