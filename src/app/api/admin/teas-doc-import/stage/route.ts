import path from "path";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID,
  type AtiTeasQuestionFormat,
} from "@/lib/admin/teas-bulk-upload-schema";
import { resolveAllowedTeasDocxPath } from "@/lib/admin/teas-doc-import-paths";
import { getAdminDb, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION_NAME = "teasDocStagedQuestions";
const DELETE_BATCH_SIZE = 450;
const OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type ParsedDocQuestion = {
  index: number;
  subject: string;
  marker: string;
  passageMarker: string;
  passageLines: string[];
  prompt: string;
  choices: string[];
  boldAnswers: string[];
  needsLlmQuestion: boolean;
  warnings: string[];
};

type ProviderRepairResult = {
  provider: "gemini" | "openai";
  model: string;
  status: "repaired" | "skipped" | "error";
  data?: {
    subject?: string;
    marker?: string;
    passageMarker?: string;
    passage?: { text?: string; lines?: string[] };
    question?: { text?: string; lines?: string[] };
    choices?: string[];
    correctAnswerText?: string;
    questionTypeId?: number;
    atiFormat?: string;
    confidence?: number;
    notes?: string;
    raw?: string;
  } | null;
  error?: string;
};

type RepairResponse = {
  results: ProviderRepairResult[];
};

type SelectedQuestionCandidate = {
  provider: "gemini" | "openai" | "original_parser";
  model: string;
  reason: string;
  subject: string;
  passageText: string;
  questionText: string;
  choices: string[];
  correctAnswerText: string;
  questionTypeId: number;
  atiFormat: AtiTeasQuestionFormat;
  confidence: number;
  notes: string;
  sourceCloseness: number;
  passageMarker: string;
};

type StageRequestBody = {
  docxPath?: string;
  parsed?: {
    sourcePath?: string;
    fileName?: string;
    questions?: ParsedDocQuestion[];
  };
  repairResults?: Record<string, RepairResponse>;
};

export async function POST(request: Request) {
  try {
    const admin = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as StageRequestBody;
    const sourcePath = resolveAllowedTeasDocxPath(String(body.docxPath || body.parsed?.sourcePath || ""));
    const questions = Array.isArray(body.parsed?.questions) ? body.parsed.questions : [];
    if (questions.length === 0) {
      return NextResponse.json({ error: "Parse a DOCX file before saving final staging." }, { status: 400 });
    }

    const source = sourceMetadata(sourcePath, body.parsed?.fileName);
    const replacementCount = await deleteExistingDocStaging(source.sourcePath);
    const db = getAdminDb();
    const batch = db.batch();
    const savedIds: string[] = [];
    const stagedQuestions = questions
      .map((question, index) =>
        stagedQuestionDocument(question, body.repairResults?.[String(question.index)], source, index + 1, admin.uid)
      )
      .filter((question): question is Record<string, unknown> => Boolean(question));

    if (stagedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No complete LLM-repaired questions were available to save." },
        { status: 400 }
      );
    }

    stagedQuestions.forEach((question) => {
      const ref = db.collection(COLLECTION_NAME).doc();
      savedIds.push(ref.id);
      batch.set(ref, question);
    });

    await batch.commit();

    return NextResponse.json({
      collection: COLLECTION_NAME,
      savedCount: savedIds.length,
      replacedCount: replacementCount,
      savedIds,
      set: source.set,
      skippedCount: questions.length - stagedQuestions.length,
      readyCount: stagedQuestions.filter((question) => Boolean(question.readyForImport)).length,
      issueCount: stagedQuestions.reduce((total, question) => total + Number(question.issueCount || 0), 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save DOCX final staging." },
      { status: 400 }
    );
  }
}

function stagedQuestionDocument(
  original: ParsedDocQuestion,
  repair: RepairResponse | undefined,
  source: ReturnType<typeof sourceMetadata>,
  scanOrder: number,
  uid: string
) {
  const selected = selectBestQuestion(original, repair);
  if (!selected) return null;
  const choices = selected.choices;
  const options = optionsFromChoices(choices);
  const correctAnswer = correctAnswerForSelected(selected.correctAnswerText, choices, selected.questionTypeId);
  const validation = validateSelectedQuestion(selected, correctAnswer);
  if (validation.errors.length > 0) return null;
  const passage = contentBlockFromText(selected.passageText);
  const questionContent = contentBlockFromText(selected.questionText) || { text: "", html: "" };

  return firestoreSafe({
    status: "staged_final",
    readyForImport: validation.errors.length === 0,
    issueCount: validation.errors.length + validation.warnings.length,
    validation,
    scanOrder,
    sourceType: "ati_teas_docx",
    source,
    set: source.set,
    setName: source.set.name,
    setSlug: source.set.slug,
    setNumber: source.set.number,
    sourcePath: source.sourcePath,
    sourceFileName: source.fileName,
    originalIndex: original.index,
    questionNumber: questionNumberFromMarker(original.marker) || String(original.index),
    questionProgress: original.marker,
    passageMarker: selected.passageMarker || original.passageMarker || "",
    subject: selected.subject,
    passage,
    questionContent,
    question: questionContent,
    questionHtml: questionContent.html,
    questionText: questionContent.text,
    combinedHtml: [passage?.html, questionContent.html].filter(Boolean).join(""),
    options,
    choices,
    correctAnswer,
    correctAnswerText: selected.correctAnswerText,
    questionTypeId: selected.questionTypeId,
    atiFormat: selected.atiFormat,
    explanation: "",
    selectedProvider: selected.provider,
    selectedModel: selected.model,
    selectionReason: selected.reason,
    confidence: selected.confidence,
    sourceCloseness: selected.sourceCloseness,
    llmNotes: selected.notes,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    stagedByUid: uid,
    version: "docx-final-staging-1.0",
  }) as Record<string, unknown>;
}

function selectBestQuestion(original: ParsedDocQuestion, repair: RepairResponse | undefined) {
  const repairedCandidates = (repair?.results || [])
    .filter((result) => result.status === "repaired" && result.data)
    .map((result) => candidateFromRepairResult(result, original))
    .filter((candidate) => isCompleteLlmCandidate(candidate))
    .map((candidate) => ({
      ...candidate,
      sourceCloseness: sourceClosenessScore(candidate, original),
    }))
    .sort((a, b) => candidateScore(b, original) - candidateScore(a, original));

  return repairedCandidates[0] || null;
}

function candidateFromRepairResult(result: ProviderRepairResult, original: ParsedDocQuestion): SelectedQuestionCandidate {
  const data = result.data || {};
  const atiFormat = normalizeAtiFormat(data.atiFormat);
  const questionTypeId = normalizeQuestionTypeId(data.questionTypeId, atiFormat);
  const passageLines = linesFromTextOrArray(data.passage?.text, data.passage?.lines);
  const questionLines = linesFromTextOrArray(data.question?.text, data.question?.lines);
  return {
    provider: result.provider,
    model: result.model,
    reason: `${result.provider} repair selected from ${result.model}.`,
    subject: normalizeSubject(data.subject) || original.subject || "Unknown",
    passageMarker: cleanText(data.passageMarker || original.passageMarker || ""),
    passageText: passageLines.join("\n"),
    questionText: questionLines.join("\n") || original.prompt,
    choices: Array.isArray(data.choices) ? data.choices.map(cleanText).filter(Boolean) : original.choices,
    correctAnswerText: cleanText(data.correctAnswerText || original.boldAnswers[0] || ""),
    questionTypeId,
    atiFormat,
    confidence: Number(data.confidence || 0),
    notes: cleanText(data.notes || ""),
    sourceCloseness: 0,
  };
}

function isCompleteLlmCandidate(candidate: SelectedQuestionCandidate) {
  if (candidate.provider === "original_parser") return false;
  if (!candidate.questionText) return false;
  if (!candidate.subject || candidate.subject === "Unknown") return false;
  if (!candidate.correctAnswerText) return false;
  if ([1, 2, 6].includes(candidate.questionTypeId) && candidate.choices.length < 2) return false;
  if (candidate.questionTypeId === 1 && candidate.choices.length < 4) return false;
  return true;
}

function candidateScore(candidate: SelectedQuestionCandidate, original: ParsedDocQuestion) {
  let score = 0;
  if (candidate.questionText) score += 40;
  if (candidate.choices.length >= 4) score += 25;
  else if (candidate.choices.length > 0) score += 10;
  if (candidate.correctAnswerText) score += 15;
  if (candidate.subject && candidate.subject !== "Unknown") score += 5;
  if (candidate.atiFormat) score += 5;
  score += Math.min(Math.max(candidate.confidence || 0, 0), 1) * 10;
  // The final staged version must be LLM-cleaned, but it should stay anchored to
  // the DOCX parse so the model does not replace the source question with a
  // plausible but different TEAS item.
  score += sourceClosenessScore(candidate, original) * 45;
  if (candidate.provider === "openai") score += 3;
  if (candidate.provider === "gemini") score += 2;
  return score;
}

function sourceClosenessScore(candidate: SelectedQuestionCandidate, original: ParsedDocQuestion) {
  const originalQuestionText = cleanText([original.passageLines.join(" "), original.prompt].filter(Boolean).join(" "));
  const candidateQuestionText = cleanText([candidate.passageText, candidate.questionText].filter(Boolean).join(" "));
  const originalChoices = original.choices.map(cleanText).filter(Boolean);
  const candidateChoices = candidate.choices.map(cleanText).filter(Boolean);
  const textSimilarity = originalQuestionText
    ? tokenSimilarity(candidateQuestionText, originalQuestionText)
    : candidateQuestionText
      ? 0.5
      : 0;
  const choiceSimilarity = originalChoices.length > 0
    ? averageBestChoiceSimilarity(candidateChoices, originalChoices)
    : candidateChoices.length > 0
      ? 0.5
      : 0;
  const choiceCountSimilarity = originalChoices.length > 0
    ? Math.max(0, 1 - Math.abs(candidateChoices.length - originalChoices.length) / Math.max(originalChoices.length, 1))
    : 0.5;
  const answerSimilarity = original.boldAnswers.length > 0 && candidate.correctAnswerText
    ? Math.max(...original.boldAnswers.map((answer) => tokenSimilarity(candidate.correctAnswerText, answer)))
    : 0.5;
  const subjectSimilarity =
    normalizeSubject(original.subject) && normalizeSubject(original.subject) === normalizeSubject(candidate.subject) ? 1 : 0.5;

  return (
    textSimilarity * 0.35 +
    choiceSimilarity * 0.3 +
    choiceCountSimilarity * 0.15 +
    answerSimilarity * 0.1 +
    subjectSimilarity * 0.1
  );
}

function averageBestChoiceSimilarity(candidateChoices: string[], originalChoices: string[]) {
  if (candidateChoices.length === 0 || originalChoices.length === 0) return 0;
  const scores = candidateChoices.map((choice) =>
    Math.max(...originalChoices.map((originalChoice) => tokenSimilarity(choice, originalChoice)))
  );
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function tokenSimilarity(left: string, right: string) {
  const leftTokens = uniqueTokens(left);
  const rightTokens = uniqueTokens(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let overlap = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) overlap += 1;
  });
  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function uniqueTokens(value: string) {
  return new Set(
    cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9.%/]+/g, " ")
      .split(/\s+/g)
      .filter((token) => token.length > 1)
  );
}

function validateSelectedQuestion(selected: SelectedQuestionCandidate, correctAnswer: unknown) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!selected.questionText) errors.push("Question text is missing.");
  if (selected.provider === "original_parser") errors.push("Only complete LLM-repaired questions can be saved to final DOCX staging.");
  if (!selected.subject || selected.subject === "Unknown") warnings.push("Subject could not be confidently detected.");
  if (selected.questionTypeId === 1 && selected.choices.length !== 4) {
    errors.push(`Multiple choice needs 4 choices; found ${selected.choices.length}.`);
  }
  if (selected.questionTypeId === 2 && selected.choices.length < 4) {
    errors.push(`Multiple select needs at least 4 choices; found ${selected.choices.length}.`);
  }
  if ((selected.questionTypeId === 1 || selected.questionTypeId === 2 || selected.questionTypeId === 6) && !correctAnswer) {
    errors.push("Correct answer label could not be mapped from answer text.");
  }
  return { errors, warnings };
}

function optionsFromChoices(choices: string[]) {
  return choices.reduce<Record<string, { choice: string; reason: string }>>((options, choice, index) => {
    const label = OPTION_LABELS[index] || String(index + 1);
    options[label] = { choice, reason: "" };
    return options;
  }, {});
}

function correctAnswerForSelected(answerText: string, choices: string[], questionTypeId: number) {
  if (!answerText) return "";
  const answerTexts = answerText
    .split(/\s*(?:\||;|\n)\s*/g)
    .map(cleanText)
    .filter(Boolean);
  const labels = answerTexts
    .map((answer) => choices.findIndex((choice) => sameAnswerText(choice, answer)))
    .filter((index) => index >= 0)
    .map((index) => OPTION_LABELS[index] || String(index + 1));
  if (questionTypeId === 2 || questionTypeId === 6) return labels;
  return labels[0] || answerText;
}

function sourceMetadata(sourcePath: string, fileName?: string) {
  const normalized = path.resolve(sourcePath);
  const detectedSet = setNumberFromPath(normalized);
  const setName = detectedSet ? `TEAS Version 7 - Set ${detectedSet}` : path.basename(path.dirname(normalized));
  return {
    sourcePath: normalized,
    fileName: fileName || path.basename(normalized),
    set: {
      name: setName,
      slug: slugify(setName),
      number: detectedSet,
    },
  };
}

async function deleteExistingDocStaging(sourcePath: string) {
  const db = getAdminDb();
  const snapshot = await db.collection(COLLECTION_NAME).where("source.sourcePath", "==", sourcePath).get();
  const refs = snapshot.docs.map((doc) => doc.ref);
  for (let index = 0; index < refs.length; index += DELETE_BATCH_SIZE) {
    const batch = db.batch();
    refs.slice(index, index + DELETE_BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return refs.length;
}

function contentBlockFromText(text: string) {
  const cleaned = cleanText(text);
  if (!cleaned) return null;
  const html = cleaned
    .split(/\n+/g)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  return { text: cleaned, html };
}

function linesFromTextOrArray(text: unknown, lines: unknown) {
  if (Array.isArray(lines) && lines.length > 0) return lines.map(cleanText).filter(Boolean);
  return String(text || "")
    .split(/\n+/g)
    .map(cleanText)
    .filter(Boolean);
}

function normalizeAtiFormat(value: unknown): AtiTeasQuestionFormat {
  const normalized = String(value || "").trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "fill_in_the_blank" || normalized === "fill_in_blank") return "fill_in_blank";
  if (normalized === "multiple_select" || normalized === "select_all_that_apply") return "multiple_select";
  if (normalized === "hot_spot" || normalized === "hotspot") return "hot_spot";
  if (normalized === "ordered_response" || normalized === "drag_order") return "ordered_response";
  return "multiple_choice";
}

function normalizeQuestionTypeId(value: unknown, format: AtiTeasQuestionFormat) {
  const numeric = Number(value);
  if ([1, 2, 6, 7, 9].includes(numeric)) return numeric;
  return ATI_TEAS_FORMAT_TO_QUESTION_TYPE_ID[format];
}

function normalizeSubject(value: unknown) {
  const text = cleanText(value);
  if (/^math/i.test(text)) return "Mathematics";
  if (/^english/i.test(text)) return "English and Language Usage";
  if (/^reading$/i.test(text)) return "Reading";
  if (/^science$/i.test(text)) return "Science";
  return text;
}

function questionNumberFromMarker(value: string) {
  return value.match(/\b(?:question|stimulus)\s*:?\s*(\d+)\s+of\s+\d+/i)?.[1] || "";
}

function setNumberFromPath(value: string) {
  return value.match(/\bSet\s+(\d+)\b/i)?.[1] || "";
}

function sameAnswerText(left: string, right: string) {
  return cleanText(left).toLowerCase() === cleanText(right).toLowerCase();
}

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firestoreSafe(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    return value.map((item) => (Array.isArray(item) ? { values: firestoreSafe(item) } : firestoreSafe(item)));
  }
  if (typeof value === "object") {
    if (value instanceof FieldValue) return value;
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (!key || nestedValue === undefined) return;
      output[key] = firestoreSafe(nestedValue);
    });
    return output;
  }
  return String(value);
}
