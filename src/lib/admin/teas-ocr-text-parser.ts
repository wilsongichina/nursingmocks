import {
  buildTeasBulkUploadPayload,
  type TeasBulkUploadPayload,
  type TeasBulkUploadQuestion,
} from "@/lib/admin/teas-bulk-upload-schema";

export type TeasOcrTextParseResult = {
  payload: TeasBulkUploadPayload;
  warnings: string[];
};

export function parseTeasOcrTextToBulkUploadPayload(text: string): TeasOcrTextParseResult {
  const warnings: string[] = [];
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { payload: buildTeasBulkUploadPayload([]), warnings: ["OCR text is empty."] };

  const subject = subjectFromText(normalized);
  const blocks = questionBlocks(normalized);
  const questions = blocks
    .map((block, index) => parseQuestionBlock(block, index, subject, warnings))
    .filter((question): question is TeasBulkUploadQuestion => Boolean(question));

  return {
    payload: buildTeasBulkUploadPayload(questions),
    warnings,
  };
}

function subjectFromText(text: string) {
  const match = text.match(/^Subject:\s*(.+)$/im);
  return match?.[1]?.trim() || "";
}

function questionBlocks(text: string) {
  const questionMatches = [...text.matchAll(/^Question:\s*$/gim)];
  if (questionMatches.length === 0) return [];

  return questionMatches.map((match, index) => {
    const start = index === 0 ? 0 : match.index || 0;
    const end = questionMatches[index + 1]?.index ?? text.length;
    return text.slice(start, end).trim();
  });
}

function parseQuestionBlock(
  block: string,
  index: number,
  subject: string,
  warnings: string[]
): TeasBulkUploadQuestion | null {
  const passage = section(block, "Passage", "Question");
  const question = section(block, "Question", "Multiple Choices");
  const choicesText = section(block, "Multiple Choices", "Answer");
  const answer = answerFromBlock(block);
  const choices = choicesFromText(choicesText);

  if (!question) {
    warnings.push(`Question ${index + 1} has no question text.`);
    return null;
  }
  if (Object.keys(choices).length !== 4) {
    warnings.push(`Question ${index + 1} expected 4 choices but found ${Object.keys(choices).length}.`);
  }
  if (!answer) {
    warnings.push(`Question ${index + 1} has no detected answer.`);
  }

  const questionHtml = [
    subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : "",
    passage ? `<p><strong>Passage:</strong></p>${paragraphsToHtml(passage)}` : "",
    `<p>${escapeHtml(question)}</p>`,
  ]
    .filter(Boolean)
    .join("");

  return {
    id: `teas-ocr-${index + 1}`,
    question: questionHtml,
    options: choices,
    correctAnswer: answer,
    solution: "",
    question_type_id: 1,
    ati_format: "multiple_choice" as const,
  };
}

function section(block: string, startLabel: string, endLabel: string) {
  const pattern = new RegExp(`${startLabel}:\\s*\\n([\\s\\S]*?)\\n\\s*${endLabel}:`, "i");
  return cleanOcrText(block.match(pattern)?.[1] || "");
}

function answerFromBlock(block: string) {
  const match = block.match(/^Answer:\s*([A-F])\b/im);
  return match?.[1]?.trim().toUpperCase() || "";
}

function choicesFromText(text: string) {
  const choices: Record<string, { choice: string }> = {};
  const pattern = /^([A-F])\.\s*(.+)$/gim;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    choices[match[1].toUpperCase()] = { choice: cleanOcrText(match[2]) };
  }
  return choices;
}

function cleanOcrText(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function paragraphsToHtml(text: string) {
  return text
    .split(/\n{1,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
