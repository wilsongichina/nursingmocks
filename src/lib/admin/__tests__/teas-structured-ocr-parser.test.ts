import { describe, expect, it } from "vitest";
import { parseTeasStructuredOcrToBulkUploadPayload } from "@/lib/admin/teas-structured-ocr-parser";

describe("TEAS structured OCR parser", () => {
  it("converts structured OCR page data into Type 1 bulk-upload JSON", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "1.jpg",
          page: 1,
          width: 1280,
          height: 720,
          subject: "Reading",
          regionText: {
            left_context: "The Deaf President Now Movement\nGallaudet University grew as a center.",
            question_column: "Which of the following is irrelevant information?",
          },
          rows: [
            { text: "Which", score: 0.98, left: 600, top: 200, right: 650, bottom: 220 },
          ],
          lines: [
            {
              text: "Which of the following is irrelevant information?",
              left: 600,
              top: 200,
              right: 1000,
              bottom: 220,
              region: "question_column",
              isUiText: false,
            },
          ],
          questionColumn: {
            promptLines: [
              "Which of the following is irrelevant information when writing a summary",
              "of the passage?",
            ],
            choiceLines: [
              "Students wore buttons that read 3/2",
              "Students protested for just a week.",
              "All the demands of the DPN protest were met.",
              "The board of trustees selected the only hearing candidate.",
            ],
            selectedAnswer: "A",
            selectedAnswerScore: 1030,
            selectedAnswerConfidenceRatio: 5.36,
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions).toHaveLength(1);
    expect(result.payload.questions[0]).toMatchObject({
      id: "teas-structured-1",
      question_type_id: 1,
      ati_format: "multiple_choice",
      correctAnswer: "A",
      options: {
        A: { choice: "Students wore buttons that read 3/2" },
        D: { choice: "The board of trustees selected the only hearing candidate." },
      },
    });
    expect(result.payload.questions[0].question).not.toContain("<strong>Subject:</strong> Reading");
    expect(result.payload.questions[0].question).toContain("<strong>Passage:</strong>");
    expect(result.payload.questions[0].question).toContain(
      "<p>Which of the following is irrelevant information when writing a summary</p><p>of the passage?</p>"
    );
    expect(result.payload.questions[0].scanLayout).toMatchObject({
      page: 1,
      fileName: "1.jpg",
      width: 1280,
      height: 720,
      subject: "Reading",
      questionColumn: {
        selectedAnswer: "A",
      },
      lines: [
        {
          text: "Which of the following is irrelevant information?",
          region: "question_column",
          isUiText: false,
        },
      ],
      rows: [
        {
          text: "Which",
          score: 0.98,
        },
      ],
    });
    expect(result.payload.questions[0].scanReview).toMatchObject({
      subject: "Reading",
    });
  });

  it("warns when pages are missing choices or selected answer", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "2.jpg",
          questionColumn: {
            promptLines: ["What is shown?"],
            choiceLines: ["One choice"],
            selectedAnswer: "",
          },
        },
      ],
    });

    expect(result.payload.questions).toHaveLength(1);
    expect(result.warnings).toEqual([
      "2.jpg expected 4 choices but found 1.",
      "2.jpg has no reliable selected answer marker.",
    ]);
  });

  it("does not apply multiple-choice warnings to fill-in-the-blank questions", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "7.jpg",
          questionColumn: {
            questionTypeId: 7,
            promptLines: ["Enter the value of x."],
            choiceLines: [],
            selectedAnswer: "42",
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0]).toMatchObject({
      question_type_id: 7,
      ati_format: "fill_in_blank",
      options: {},
      correctAnswer: "42",
    });
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: false,
    });
  });

  it("does not flag empty selectedAnswer wording for fill-in-the-blank questions", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "40_no-ati-logo.jpg",
          subject: "Mathematics",
          questionColumn: {
            questionTypeId: 7,
            promptLines: [
              "What is the least common denominator for the fractions below? (Round the answer to the nearest integer.) 1/2, 2/3, 4/5",
            ],
            choiceLines: [],
            selectedAnswer: "",
            warnings: [
              "This question is a fill-in-the-blank question, so selectedAnswer is left empty.",
            ],
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0].question_type_id).toBe(7);
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: false,
      warnings: [],
    });
  });

  it("keeps failed no-text pages as manual review placeholder questions", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "9.jpg",
          page: 9,
          subject: "Science",
          questionColumn: {
            promptLines: [],
            choiceLines: [],
            selectedAnswer: "",
            warnings: ["Gemini image extraction returned no text."],
          },
        },
      ],
    });

    expect(result.payload.questions).toHaveLength(1);
    expect(result.payload.questions[0].question).toContain("Manual review required");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: true,
      promptLineCount: 0,
      sourceFileName: "9.jpg",
      sourceImageRequired: true,
      warnings: [
        "9.jpg Gemini image extraction returned no text.",
        "9.jpg has no detected prompt lines.",
      ],
    });
    expect(result.warnings).toEqual([
      "9.jpg Gemini image extraction returned no text.",
      "9.jpg has no detected prompt lines.",
    ]);
  });

  it("does not render already-encoded apostrophes as visible HTML entities", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "3.jpg",
          questionColumn: {
            promptLines: ["Which sentence correctly uses the word student&#39;s?"],
            choiceLines: [
              "The student&#39;s notebook is on the desk.",
              "The students notebook is on the desk.",
              "The students&#39;s notebook is on the desk.",
              "The student notebook&#39;s is on the desk.",
            ],
            selectedAnswer: "A",
          },
        },
      ],
    });

    expect(result.payload.questions[0].question).toContain("student&#39;s");
    expect(result.payload.questions[0].question).not.toContain("&amp;#39;");
    expect(result.payload.questions[0].options).toMatchObject({
      A: { choice: "The student's notebook is on the desk." },
    });
  });

  it("keeps exam title and subject metadata out of question HTML", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "reading.jpg",
          subject: "Reading",
          questionColumn: {
            promptHtmlLines: [
              "ATI TEAS Version 7 - Reading",
              "Subject: Reading",
              "Which sentence best summarizes the passage?",
            ],
            promptLines: [
              "ATI TEAS Version 7 - Reading",
              "Subject: Reading",
              "Which sentence best summarizes the passage?",
            ],
            passageHtmlLines: [
              "ATI TEAS Version 7 - Reading",
              "Subject: Reading",
              "The author describes the steps used to preserve historic documents.",
            ],
            passageLines: [
              "ATI TEAS Version 7 - Reading",
              "Subject: Reading",
              "The author describes the steps used to preserve historic documents.",
            ],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
          },
        },
      ],
    });

    expect(result.payload.questions[0].question).not.toContain("ATI TEAS Version 7 - Reading");
    expect(result.payload.questions[0].question).not.toContain("Subject: Reading");
    expect(result.payload.questions[0].question).toContain("Which sentence best summarizes the passage?");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      subject: "Reading",
      hasPassage: true,
    });
  });

  it("inlines passage and question titles in generated HTML when provided", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "reading-title.jpg",
          subject: "Reading",
          questionColumn: {
            passageTitle: "The History of Gallaudet University",
            questionTitle: "Main Idea",
            passageLines: ["Gallaudet University became an important center for Deaf education."],
            promptLines: ["Which statement best identifies the main idea of the passage?"],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "B",
          },
        },
      ],
    });

    expect(result.payload.questions[0].question).toContain(
      "<p><strong>The History of Gallaudet University</strong></p>"
    );
    expect(result.payload.questions[0].question).toContain("<p><strong>Main Idea</strong></p>");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      hasPassage: true,
    });
    expect(result.payload.questions[0].scanLayout).toMatchObject({
      questionColumn: {
        passageTitle: "The History of Gallaudet University",
        questionTitle: "Main Idea",
      },
    });
  });

  it("warns on incomplete-looking prompts and low-confidence answer markers", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "5.jpg",
          questionColumn: {
            promptLines: ["conclusion that the board of trustees sparked the movement?"],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
            selectedAnswerScore: 936,
            selectedAnswerConfidenceRatio: 1.19,
          },
        },
      ],
    });

    expect(result.payload.questions).toHaveLength(1);
    expect(result.warnings).toEqual([
      "5.jpg prompt starts mid-sentence; review for a continuation or cropped question.",
      "5.jpg selected answer marker is low confidence (1.19x over runner-up).",
    ]);
  });

  it("allows complete four-choice prompts without a question mark", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "7.jpg",
          questionColumn: {
            promptLines: ["A chart showing the number of U.S. university graduates"],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "D",
            selectedAnswerScore: 795,
            selectedAnswerConfidenceRatio: 3.01,
          },
        },
      ],
    });

    expect(result.payload.questions).toHaveLength(1);
    expect(result.warnings).toEqual([]);
  });

  it("classifies ordered response prompts as Type 6", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "75.jpg",
          questionColumn: {
            promptLines: [
              "Identify the order of the following values from least to greatest.",
              "Move the options into the box on the right, placing them in order from least to greatest.",
            ],
            choiceLines: ["70%", "5/7", "3/4", "0.79"],
            selectedAnswer: "D",
            selectedAnswerScore: 458,
            selectedAnswerConfidenceRatio: 1.4,
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0]).toMatchObject({
      question_type_id: 6,
      ati_format: "ordered_response",
      correctAnswer: ["A", "B", "C", "D"],
      options: {
        A: { choice: "70%" },
        D: { choice: "0.79" },
      },
    });
  });

  it("does not turn Math question fragments into passage text", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "60.jpg",
          subject: "Math",
          regionText: {
            left_context:
              "of the pizza did each of the other three friends receive? 1/6 1/5 1/4 1/3",
          },
          questionColumn: {
            promptLines: [
              "Four friends are sharing a pizza.One friend eats half of the pizza.The other three friends equally divide the rest among themselves.What portion",
              "of the pizza did each of the other three friends receive?",
            ],
            choiceLines: ["1/6", "1/5", "1/4", "1/3"],
            selectedAnswer: "A",
            selectedAnswerScore: 900,
            selectedAnswerConfidenceRatio: 4.8,
          },
        },
      ],
    });

    const questionHtml = result.payload.questions[0].question;
    expect(questionHtml).not.toContain("Subject:</strong>");
    expect(questionHtml).not.toContain("Passage:");
    expect(questionHtml).toContain("pizza. One friend eats half");
    expect(questionHtml).toContain("themselves. What portion");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      subject: "Mathematics",
    });
  });

  it("preserves Gemini table exhibits in the generated question HTML", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "46.jpg",
          subject: "Math",
          questionColumn: {
            questionNumber: "46",
            promptLines: ["Based on the information in the table, which class has the highest enrollment?"],
            exhibits: [
              {
                type: "table",
                title: "Enrollment by Class",
                headers: ["Class", "Students"],
                rows: [
                  ["Biology", "24"],
                  ["Chemistry", "31"],
                  ["Anatomy", "28"],
                ],
                textLines: [],
                description: "",
              },
            ],
            choiceLines: ["Biology", "Chemistry", "Anatomy", "Physics"],
            selectedAnswer: "B",
            selectedAnswerScore: 900,
            selectedAnswerConfidenceRatio: 4.8,
          },
        },
      ],
    });

    const question = result.payload.questions[0];
    expect(result.warnings).toEqual([]);
    expect(question.question).toContain('class="teas-scan-exhibit"');
    expect(question.question).not.toContain("<strong>Question 46</strong>");
    expect(question.question).toContain('<th scope="col">Class</th>');
    expect(question.question).toContain("<td>Chemistry</td>");
    expect(question.scanReview).toMatchObject({
      questionNumber: "46",
      exhibitCount: 1,
      sourceImageRequired: false,
    });
  });

  it("renders table exhibits at inline placeholder positions without duplicating them", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "47.jpg",
          subject: "Math",
          questionColumn: {
            promptLines: ["Which value is greatest?"],
            promptHtmlLines: [
              "Use the table below.",
              "<figure data-exhibit-id=\"exhibit_1\"></figure>",
              "Which value is greatest?",
            ],
            exhibits: [
              {
                id: "exhibit_1",
                type: "table",
                title: "Values",
                placement: "inside_question",
                headers: ["Item", "Value"],
                rows: [
                  ["A", "4"],
                  ["B", "7"],
                ],
                textLines: [],
                description: "",
              },
            ],
            choiceLines: ["A", "B", "C", "D"],
            selectedAnswer: "B",
          },
        },
      ],
    });

    const html = result.payload.questions[0].question;
    expect(html.indexOf("Use the table below.")).toBeLessThan(html.indexOf('<table class="teas-scan-table">'));
    expect(html.indexOf('<table class="teas-scan-table">')).toBeLessThan(html.indexOf("Which value is greatest?"));
    expect(html.match(/<table class="teas-scan-table">/g)).toHaveLength(1);
  });

  it("adds a blank leading table header when rows include labels", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "45.jpg",
          subject: "Mathematics",
          questionColumn: {
            promptLines: ["The table above represents the eye color of each student in a class."],
            exhibits: [
              {
                id: "exhibit_1",
                type: "table",
                placement: "before_passage",
                headers: ["Male", "Female"],
                rows: [
                  ["Green", "5", "3"],
                  ["Blue", "16", "19"],
                  ["Brown", "27", "18"],
                ],
                textLines: [],
                description: "Table showing eye color distribution by gender.",
              },
            ],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "B",
          },
        },
      ],
    });

    const html = result.payload.questions[0].question;
    expect(html).toContain(
      '<thead><tr><th scope="col" class="teas-scan-empty-header" aria-label="Row labels">&#160;</th><th scope="col">Male</th><th scope="col">Female</th></tr></thead>'
    );
    expect(html).toContain("<tr><td>Green</td><td>5</td><td>3</td></tr>");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      sourceImageRequired: false,
    });
  });

  it("pads short table rows so cells stay under the correct headers", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "table-pad.jpg",
          subject: "Science",
          questionColumn: {
            promptLines: ["Which conclusion is supported by the table?"],
            exhibits: [
              {
                id: "exhibit_1",
                type: "table",
                placement: "inside_question",
                headers: ["Item", "Value", "Unit"],
                rows: [
                  ["A", "10", "mg"],
                  ["B", "12"],
                ],
              },
            ],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
          },
        },
      ],
    });

    const html = result.payload.questions[0].question;
    expect(html).toContain(
      '<thead><tr><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Unit</th></tr></thead>'
    );
    expect(html).toContain("<tr><td>B</td><td>12</td><td></td></tr>");
  });

  it("promotes table captions from page headers instead of rendering them as loose question headers", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "blood-alcohol.jpg",
          subject: "Science",
          questionColumn: {
            questionNumber: "50",
            headerLines: ["Blood Alcohol Concentration (percent)"],
            promptLines: ["Which conclusion is supported by the data in the table?"],
            exhibits: [
              {
                id: "exhibit_1",
                type: "table",
                title: "",
                placement: "before_passage",
                headers: ["Number of drinks in one hour", "45", "54"],
                rows: [
                  ["1", "0.04", "0.03"],
                  ["2", "0.08", "0.06"],
                ],
              },
            ],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
          },
        },
      ],
    });

    const html = result.payload.questions[0].question;
    expect(html).toContain("<strong>Blood Alcohol Concentration (percent):</strong>");
    expect(html.indexOf("Blood Alcohol Concentration")).toBeLessThan(html.indexOf('<table class="teas-scan-table">'));
    expect(html).toContain(
      '<thead><tr><th scope="col">Number of drinks in one hour</th><th scope="col">45</th><th scope="col">54</th></tr></thead>'
    );
  });

  it("removes duplicated table-title header rows after caption promotion", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "weekly-running.jpg",
          subject: "Mathematics",
          questionColumn: {
            headerLines: ["Weekly Running Schedule"],
            promptLines: ["Which measure will change?"],
            exhibits: [
              {
                id: "exhibit_1",
                type: "table",
                title: "",
                placement: "before_passage",
                headers: ["", "Weekly Running Schedule"],
                rows: [
                  ["Monday", "7 miles"],
                  ["Tuesday", "8 miles"],
                ],
              },
            ],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
          },
        },
      ],
    });

    const html = result.payload.questions[0].question;
    expect(html).toContain("<strong>Weekly Running Schedule:</strong>");
    expect(html).not.toContain("<thead>");
    expect(html).toContain("<tr><td>Monday</td><td>7 miles</td></tr>");
  });

  it("preserves Gemini headers, explicit passages, subject names, and allowed inline formatting", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "12.jpg",
          subject: "English",
          questionColumn: {
            headerLines: ["Passage 1"],
            passageLines: ["The student wrote a short paragraph."],
            passageHtmlLines: ["The student wrote a <em>short</em> paragraph."],
            promptLines: ["Which sentence should be revised?"],
            promptHtmlLines: ["Which <strong>sentence</strong> should be revised?"],
            exhibits: [
              {
                type: "image",
                title: "Diagram",
                headers: [],
                rows: [],
                textLines: ["Visible label: sample figure"],
                description: "A diagram appears above the question.",
              },
            ],
            choiceLines: ["Sentence 1", "Sentence 2", "Sentence 3", "Sentence 4"],
            selectedAnswer: "C",
            selectedAnswerScore: 900,
            selectedAnswerConfidenceRatio: 4.8,
          },
        },
      ],
    });

    const question = result.payload.questions[0];
    expect(result.warnings).toEqual([]);
    expect(question.question).toContain("<strong>Passage 1</strong>");
    expect(question.question).not.toContain("<strong>Subject:</strong> English and Language Usage");
    expect(question.question).toContain("The student wrote a <em>short</em> paragraph.");
    expect(question.question).toContain("Which <strong>sentence</strong> should be revised?");
    expect(question.question).toContain("teas-scan-image-notice");
    expect(question.scanReview).toMatchObject({
      subject: "English and Language Usage",
      exhibitCount: 1,
      imageExhibitCount: 1,
    });
  });

  it("stores TEAS chrome metadata separately from the question body", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "12.jpg",
          subject: "English and Language Usage",
          questionColumn: {
            questionNumber: "12",
            headerLines: [
              "Question 12 of 37",
              "ATI TEAS Version 7 - English and Language Usage",
              "Question: 12 of 37",
              "Subject: English and Language Usage",
            ],
            promptLines: ["Which option is grammatically correct?"],
            choiceLines: ["Choice A", "Choice B", "Choice C", "Choice D"],
            selectedAnswer: "A",
          },
        },
      ],
    });

    const question = result.payload.questions[0];
    expect(question.question).not.toContain("Question 12 of 37");
    expect(question.question).not.toContain("ATI TEAS Version 7");
    expect(question.question).not.toContain("Subject:");
    expect(question.scanReview).toMatchObject({
      questionNumber: "12",
      questionProgress: "12 of 37",
      examTitle: "ATI TEAS Version 7 - English and Language Usage",
      subject: "English and Language Usage",
    });
  });

  it("recovers Google Vision split-column answer choices", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "46.jpg",
          questionColumn: {
            promptLines: ["TOTAL Male Female", "the following statements is most accurate ?"],
            choiceLines: ["than boys in 10th grade . each year of high school . than any other grade level . in choir ."],
            selectedAnswer: "A",
            selectedAnswerScore: 1200,
            selectedAnswerConfidenceRatio: 4.2,
          },
          lines: [
            { region: "left_context", top: 410, left: 214, right: 591, text: "Based on the information contained in the graph , which of", isUiText: false },
            { region: "question_column", top: 410, left: 591, right: 869, text: "the following statements is most accurate ?", isUiText: false },
            { region: "left_context", top: 490, left: 258, right: 601, text: "Girls in 9th grade are twice as likely to participate in choir", isUiText: false },
            { region: "question_column", top: 490, left: 603, right: 749, text: "than boys in 10th grade .", isUiText: false },
            { region: "left_context", top: 534, left: 259, right: 588, text: "In general , total participation in choir is likely to decline", isUiText: false },
            { region: "question_column", top: 534, left: 591, right: 740, text: "each year of high school .", isUiText: false },
            { region: "left_context", top: 579, left: 260, right: 594, text: "Boys in 11th grade are more likely to participate in choir", isUiText: false },
            { region: "question_column", top: 579, left: 596, right: 758, text: "than any other grade level .", isUiText: false },
            { region: "left_context", top: 624, left: 259, right: 628, text: "By 12th grade , both boys and girls are less likely to participate", isUiText: false },
            { region: "question_column", top: 624, left: 631, right: 680, text: "in choir .", isUiText: false },
          ],
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(Object.keys(result.payload.questions[0].options || {})).toHaveLength(4);
    expect(result.payload.questions[0].question).toContain(
      "Based on the information contained in the graph"
    );
    expect(result.payload.questions[0].options).toMatchObject({
      A: { choice: expect.stringContaining("Girls in 9th grade") },
      D: { choice: expect.stringContaining("By 12th grade") },
    });
  });

  it("does not flag missing selected answer markers for ordered response questions", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "43_no-ati-logo.jpg",
          subject: "English and Language Usage",
          questionColumn: {
            questionTypeId: 6,
            promptLines: [
              "A chef is making fried chicken. Identify the sequence the chef should follow. (Move the options into the box on the right, placing them in the order of performance. Use all the options.)",
            ],
            choiceLines: ["Season the chicken", "Dredge in flour", "Place in hot oil", "Drain on paper towels"],
            selectedAnswer: "",
            warnings: ["Selected answer is not visually marked."],
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0].question_type_id).toBe(6);
    expect(result.payload.questions[0].correctAnswer).toEqual(["A", "B", "C", "D"]);
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: false,
      warnings: [],
    });
  });

  it("allows multiple-select questions with more than four options and multiple selected labels", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "125_no-ati-logo.jpg",
          subject: "Science",
          questionColumn: {
            questionTypeId: 2,
            promptLines: [
              "Which of the following correctly describes the result of a P1 cross between a homozygous dominant female and a homozygous recessive male for a single gene? (Select all that apply.)",
            ],
            choiceLines: [
              "F1 generation will result in offspring that all express the dominant phenotype.",
              "F1 generation will result in offspring that are all heterozygous.",
              "F2 generation will result in offspring that only express the recessive phenotype.",
              "F1 generation will result in offspring with a 3:1 phenotypic ratio.",
              "F2 generation will result in offspring that are all homozygous dominant.",
            ],
            selectedAnswer: "A, B",
            warnings: [
              "expected 4 choices but found 5.",
              "has no reliable selected answer marker.",
            ],
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0].question_type_id).toBe(2);
    expect(Object.keys(result.payload.questions[0].options || {})).toHaveLength(5);
    expect(result.payload.questions[0].correctAnswer).toBe("A, B");
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: false,
      warnings: [],
    });
  });

  it("does not flag unselected screenshots for complete ordered-response questions", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "150_no-ati-logo.jpg",
          subject: "English and Language Usage",
          questionColumn: {
            questionTypeId: 6,
            promptLines: [
              "Which arrangement of the following five sentences yields the most logically organized paragraph? (Move the options into the box on the right, placing them in the selected order. Use all the options.)",
            ],
            choiceLines: ["Sentence one.", "Sentence two.", "Sentence three.", "Sentence four.", "Sentence five."],
            selectedAnswer: "",
            warnings: [
              "No answer is visually selected in the screenshot.",
              "Selected answer is not visibly indicated.",
            ],
          },
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions[0].question_type_id).toBe(6);
    expect(result.payload.questions[0].correctAnswer).toEqual(["A", "B", "C", "D", "E"]);
    expect(result.payload.questions[0].scanReview).toMatchObject({
      needsReview: false,
      warnings: [],
    });
  });

  it("recovers Math percentage choices when Google misses the question mark boundary", () => {
    const result = parseTeasStructuredOcrToBulkUploadPayload({
      pages: [
        {
          fileName: "50.jpg",
          subject: "Math",
          questionColumn: {
            promptLines: ["C ce ered to $ 180,000 . Which of the"],
            choiceLines: ["8 9 63 X"],
            selectedAnswer: "",
          },
          lines: [
            { region: "question_column", top: 264, left: 597, right: 1189, text: "C ce ered to $ 180,000 . Which of the", isUiText: false },
            { region: "left_context", top: 271, left: 86, right: 384, text: "An individual wishes to sell her home", isUiText: false },
            { region: "left_context", top: 293, left: 85, right: 380, text: "following is the percent decrease in t", isUiText: false },
            { region: "left_context", top: 317, left: 468, right: 479, text: "7", isUiText: false },
            { region: "question_column", top: 317, left: 597, right: 735, text: "8 9", isUiText: false },
            { region: "left_context", top: 370, left: 467, right: 606, text: "4 5", isUiText: false },
            { region: "question_column", top: 372, left: 722, right: 862, text: "63 X", isUiText: false },
            { region: "left_context", top: 392, left: 143, right: 172, text: "10 %", isUiText: false },
            { region: "left_context", top: 428, left: 469, right: 606, text: "1 2", isUiText: false },
            { region: "left_context", top: 449, left: 142, right: 173, text: "20 %", isUiText: false },
            { region: "left_context", top: 486, left: 468, right: 479, text: "0", isUiText: false },
            { region: "left_context", top: 503, left: 142, right: 172, text: "22 %", isUiText: false },
            { region: "left_context", top: 559, left: 142, right: 171, text: "11 %", isUiText: false },
          ],
        },
      ],
    });

    expect(result.warnings).toEqual(["50.jpg has no reliable selected answer marker."]);
    expect(result.payload.questions[0].question).toContain("An individual wishes to sell her home");
    expect(result.payload.questions[0].question).toContain("following is the percent decrease");
    expect(result.payload.questions[0].question).not.toContain("C ce ered");
    expect(result.payload.questions[0].question).not.toContain("8 9");
    expect(Object.keys(result.payload.questions[0].options || {})).toHaveLength(4);
    expect(result.payload.questions[0].options).toMatchObject({
      A: { choice: "10 %" },
      B: { choice: "20 %" },
      C: { choice: "22 %" },
      D: { choice: "11 %" },
    });
  });
});
