import { describe, expect, it } from "vitest";
import {
  buildEntranceQuizSchemaObject,
  buildPublicPageSchemaObject,
} from "@/lib/seo/structured-data";

describe("structured data builders", () => {
  it("uses canonical production URLs and avoids private answer fields", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    const schema = buildEntranceQuizSchemaObject({
      slug: "teas-math-practice-test-set-1",
      quizName: "TEAS Math Practice Test Set 1",
      description: "Practice TEAS Math questions for Set 1.",
      examProductName: "ATI TEAS 7",
      subjectName: "Mathematics",
      categoryName: "Nursing Entrance Exam",
      questionCount: 32,
      breadcrumbs: [
        { name: "Nursing Entrance Exam", slug: "nursing-entrance-exam" },
        { name: "ATI TEAS 7", slug: "ati-teas-7-practice-test" },
        { name: "TEAS Math Practice Test", slug: "teas-math-practice-test" },
        { name: "TEAS Math Practice Test Set 1", slug: "teas-math-practice-test-set-1" },
      ],
      questions: [
        {
          id: "question-1",
          question: "<p>What is 2 + 2?</p>",
        },
      ],
    });

    const serialized = JSON.stringify(schema);

    expect(serialized).toContain("https://nursingmocks.com/teas-math-practice-test-set-1");
    expect(serialized).not.toContain("localhost");
    expect(serialized).not.toContain("acceptedAnswer");
    expect(serialized).not.toContain("suggestedAnswer");
    expect(serialized).not.toContain("eduQuestionType");
    expect(serialized).not.toContain("explanation");
    expect(serialized).toContain('"@type":"Thing"');
    expect(serialized).toContain('"name":"ATI TEAS 7"');
    expect(serialized).toContain('"name":"Mathematics"');
    expect(serialized).not.toContain("numberOfQuestions");
  });

  it("does not emit unsupported question count schema properties", () => {
    const schema = buildEntranceQuizSchemaObject({
      slug: "teas-math-practice-test-set-1",
      quizName: "TEAS Math Practice Test Set 1",
      examProductName: "ATI TEAS 7",
      subjectName: "Mathematics",
      breadcrumbs: [{ name: "Nursing Entrance Exam", slug: "nursing-entrance-exam" }],
      questions: [{ question: "Visible preview question" }],
    });

    expect(JSON.stringify(schema)).not.toContain("numberOfQuestions");
  });

  it("generates page-level schema for dynamic sub-pages and child pages", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    const schema = buildPublicPageSchemaObject({
      slug: "teas-practice-test",
      pageName: "ATI TEAS 7 Practice Test",
      description: "Practice ATI TEAS 7 by subject with NursingMocks.",
      categoryName: "Nursing Entrance Exams",
      pageType: "CollectionPage",
      breadcrumbs: [
        { name: "Nursing Entrance Exams", slug: "nursing-entrance-exam" },
        { name: "ATI TEAS 7 Practice Test", slug: "teas-practice-test" },
      ],
      childItems: [
        {
          name: "TEAS Math Practice Test",
          slug: "teas-math-practice-test",
          description: "Practice TEAS mathematics questions by set.",
        },
      ],
      faqs: [
        {
          question: "Can I practice ATI TEAS 7 by subject?",
          answer: "Yes. NursingMocks organizes ATI TEAS 7 practice by subject.",
        },
      ],
    });

    const serialized = JSON.stringify(schema);

    expect(serialized).toContain("https://nursingmocks.com/teas-practice-test");
    expect(serialized).not.toContain("localhost");
    expect(serialized).toContain('"@type":"CollectionPage"');
    expect(serialized).toContain('"@type":"ItemList"');
    expect(serialized).toContain('"@type":"FAQPage"');
    expect(serialized).toContain('"name":"TEAS Math Practice Test"');
    expect(serialized).not.toContain("numberOfQuestions");
  });
});
