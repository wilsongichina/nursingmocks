import { describe, expect, it } from "vitest";
import { parseTeasOcrTextToBulkUploadPayload } from "@/lib/admin/teas-ocr-text-parser";

const ocrText = `Subject: Reading

Passage:
The Deaf President Now Movement
The Deaf President Now DPN) movement marked a growing shift in
perceptions of deaf people

Question:
Which of the following is irrelevant information when writing a summary of the passage?

Multiple Choices:
A. Students wore buttons that read 3/2
B. Students protested for just a week.
C. All the demands of the DPN protest were met.
D. The board of trustees selected the only hearing candidate.

Answer: A


Passage:
The Deaf President Now Movement
Gallaudet University grew as a center for deaf education and advocacy.

Question:
Which of the following is a detail that can help the reader infer why the U.S.vice president wrote a letter of support for the DPN movement?

Multiple Choices:
A. The U.S.vice president was a Gallaudet University graduate who was not deaf.
B. The Gallaudet University students gave speeches supporting their demands.
C. Closed-door discussion created more discontent among the Gallaudet University students.
D. The U.S.president signs the diplomas of Gallaudet University graduates.

Answer: B`;

describe("TEAS OCR text parser", () => {
  it("converts OCR text blocks into bulk-upload multiple-choice questions", () => {
    const result = parseTeasOcrTextToBulkUploadPayload(ocrText);

    expect(result.warnings).toEqual([]);
    expect(result.payload.questions).toHaveLength(2);
    expect(result.payload.questions[0]).toMatchObject({
      id: "teas-ocr-1",
      question_type_id: 1,
      ati_format: "multiple_choice",
      correctAnswer: "A",
      options: {
        A: { choice: "Students wore buttons that read 3/2" },
        D: { choice: "The board of trustees selected the only hearing candidate." },
      },
    });
    expect(result.payload.questions[0].question).toContain("<strong>Subject:</strong> Reading");
    expect(result.payload.questions[0].question).toContain("<strong>Passage:</strong>");
  });

  it("returns an empty payload with a warning for empty OCR text", () => {
    const result = parseTeasOcrTextToBulkUploadPayload("");

    expect(result.payload.questions).toEqual([]);
    expect(result.warnings).toEqual(["OCR text is empty."]);
  });
});
