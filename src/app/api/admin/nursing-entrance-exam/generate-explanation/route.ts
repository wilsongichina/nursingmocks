import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PILLAR_ID = "nursing-entrance-exam";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const ATI_TEAS_SECTIONS = {
  Reading: [
    "Key ideas and details",
    "Craft and structure",
    "Integration of knowledge & ideas",
  ],
  Mathematics: ["Numbers and algebra", "Measurement and data"],
  Science: [
    "Human anatomy & physiology",
    "Biology",
    "Chemistry",
    "Scientific reasoning",
  ],
  "English and Language Usage": [
    "Conventions of standard English",
    "Knowledge of language",
    "Using Language and Vocabulary to Express Ideas in Writing",
  ],
} as const;

type AtiTeasSubject = keyof typeof ATI_TEAS_SECTIONS;
const DEFAULT_EXPLANATION_PROMPT = `You are an experienced ATI TEAS tutor writing explanations for practice questions.

Your goal is to help a student understand the reasoning behind the saved correct answer in a clear, natural, and accurate way.

Answer handling:
- Treat the provided saved correct answer as the intended answer.
- Do not silently replace it with another answer.
- Independently check whether the saved answer is consistent with the question, passage, calculation, and answer choices.
- If the saved answer appears incorrect, ambiguous, unsupported, or inconsistent, return status "NEEDS_ANSWER_REVIEW".
- When returning "NEEDS_ANSWER_REVIEW", briefly identify the issue without writing a misleading explanation.
- Otherwise, return status "GENERATED".

Explanation style:
- Write like a knowledgeable tutor speaking directly to a student.
- Use clear, natural language appropriate for an ATI TEAS learner.
- Be confident but not overly formal.
- Get to the reasoning quickly.
- Format the explanation as 2 to 3 short paragraphs separated by a blank line.
- Put the main reasoning first, then add a second paragraph only when it helps explain a calculation, rule, or common mistake.
- Avoid one long paragraph.
- Avoid generic openings such as "The correct answer is", "This is correct because", "Let's break it down", and "Great question".
- Vary sentence structure and wording between explanations.
- Do not use unnecessarily advanced vocabulary.
- Do not sound like a textbook, answer key, or automated template.
- Do not mention AI, prompts, saved answers, internal instructions, or answer validation.
- Do not add motivational filler or unnecessary conclusions.
- Avoid repeating the question or answer choice unless needed for clarity.
- Do not use phrases such as "clearly", "obviously", or "simply" when they could make the student feel dismissed.

Content requirements:
- Explain the central concept or reasoning that makes the saved answer correct.
- Connect the explanation directly to the wording of the question.
- Include enough context for the student to learn the underlying rule, skill, or concept.
- Do not invent facts, assumptions, patient details, passage information, formulas, or definitions.
- Use only information supported by the question, passage, answer choices, and reliable foundational subject knowledge.
- Briefly address incorrect options only when doing so improves understanding or prevents a likely misconception.
- Do not discuss every incorrect option mechanically.
- When referring to options, use their actual text or labels accurately.
- Do not claim an option says something it does not say.

Passage-based questions:
- Base the explanation primarily on evidence from the passage.
- Identify the relevant detail, idea, inference, or relationship from the passage.
- Do not introduce outside information unless it is required to explain a general reading or language rule.
- Do not quote long sections of the passage.
- Paraphrase where possible.

Mathematics questions:
- Show the calculation in logical, easy-to-follow steps.
- Include the formula or setup when useful.
- Keep units throughout the calculation.
- Check arithmetic before producing the final explanation.
- State the final value with the correct unit.
- Explain why the method works, not only the arithmetic.
- For generic money examples, use U.S. dollars unless the question provides another currency.

Science questions:
- Explain the relevant scientific relationship, process, structure, or principle.
- Distinguish closely related concepts when that is the source of difficulty.
- Avoid adding clinical claims that are not needed to answer the question.

English and language usage questions:
- Name the grammar, punctuation, vocabulary, or sentence-structure rule when helpful.
- Explain how the rule applies to the exact sentence.
- Keep terminology understandable and define technical terms briefly when needed.

Reading questions:
- Explain how the passage supports the answer.
- Distinguish between directly stated information and reasonable inference.
- For main idea, purpose, tone, evidence, and conclusion questions, identify the specific textual reasoning involved.

ATI TEAS classification:
- Classify the question into the official ATI TEAS subject and section.
- Choose only one exact subject and one exact section from the list provided in the request.
- Choose the section that best matches the main skill being tested.
- If the question cannot be confidently classified, use "Needs Review" for atiSection.
- Do not invent a new section name.

Length:
- Keep most explanations between 60 and 140 words.
- Use fewer words for straightforward questions.
- Use additional detail only when calculation steps or concept clarification require it.
- Do not pad the explanation to reach a target length.`;

type ExplanationStatus =
  | "generated"
  | "skipped"
  | "failed"
  | "needs_answer_review";

type ExplanationResult = {
  status: ExplanationStatus;
  explanation?: string;
  model?: string;
  atiSubject?: string;
  atiSection?: string;
  atiClassificationReason?: string;
  answerReviewReason?: string;
  modelSuggestedAnswer?: string;
  error?: string;
};

function normalizeSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

async function resolveDocBySlugOrId(
  collectionRef: FirebaseFirestore.CollectionReference,
  value: string
) {
  const normalized = normalizeSlug(value);
  const slugSnapshot = await collectionRef.where("slug", "==", normalized).limit(1).get();
  if (!slugSnapshot.empty) return slugSnapshot.docs[0];
  const docSnapshot = await collectionRef.doc(value).get();
  return docSnapshot.exists ? docSnapshot : null;
}

function stripHtmlTags(value: unknown) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(formatAnswer).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

function formatOptions(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(formatAnswer).filter(Boolean);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
      .map(([key, option]) => `${key}: ${formatAnswer(option)}`.trim())
      .filter(Boolean);
  }
  return String(value)
    .split(/\n+/)
    .map((option) => option.trim())
    .filter(Boolean);
}

function explanationPromptInstructions() {
  return String(process.env.OPENAI_EXPLANATION_PROMPT || DEFAULT_EXPLANATION_PROMPT)
    .replace(/\\n/g, "\n")
    .trim();
}

function buildExplanationPrompt(question: Record<string, unknown>) {
  const subject = formatAnswer(question.subjectName || question.subject || question.category);
  const questionType = formatAnswer(question.questionTypeId || question.question_type_id || "unknown");
  const passage = stripHtmlTags(question.passage);
  const prompt = stripHtmlTags(question.question);
  const options = formatOptions(question.options);
  const correctAnswer = formatAnswer(question.correctAnswer || question.correct_answer);

  return `${explanationPromptInstructions()}

Classify the question into the official ATI TEAS subject and section.
Use only one of the official subjects and sections listed below.
Choose the section that best matches the main skill being tested.
If the question cannot be confidently classified, use "Needs Review" for atiSection.
Do not invent a new subject or section name.

Return strict JSON only:
{
  "status": "GENERATED",
  "explanation": "Natural student-facing explanation.",
  "atiSubject": "Reading | Mathematics | Science | English and Language Usage",
  "atiSection": "One exact official ATI TEAS section name, or Needs Review",
  "atiClassificationReason": "Brief reason for this subject and section classification.",
  "answerReviewReason": "",
  "modelSuggestedAnswer": ""
}

For a questionable saved answer, return:
{
  "status": "NEEDS_ANSWER_REVIEW",
  "explanation": "",
  "atiSubject": "Reading | Mathematics | Science | English and Language Usage",
  "atiSection": "One exact official ATI TEAS section name, or Needs Review",
  "atiClassificationReason": "Brief reason for this subject and section classification.",
  "answerReviewReason": "Brief, specific explanation of the inconsistency or ambiguity.",
  "modelSuggestedAnswer": "Optional suggested answer if identifiable."
}

Official ATI TEAS subjects and sections:
Reading:
- Key ideas and details
- Craft and structure
- Integration of knowledge & ideas

Mathematics:
- Numbers and algebra
- Measurement and data

Science:
- Human anatomy & physiology
- Biology
- Chemistry
- Scientific reasoning

English and Language Usage:
- Conventions of standard English
- Knowledge of language
- Using Language and Vocabulary to Express Ideas in Writing

Question data:
Subject: ${subject || "Unknown"}
Question type: ${questionType}
Passage:
${passage || "(none)"}

Question:
${prompt}

Options:
${options.length > 0 ? options.join("\n") : "(none)"}

Saved correct answer:
${correctAnswer || "(missing)"}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonText(text: string): Record<string, unknown> {
  const trimmed = String(text || "").trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

function formatExplanationText(value: unknown) {
  const text = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!text) return "";
  if (text.includes("\n\n")) return text;

  const sentences = text.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [text];
  if (sentences.length <= 3) return text;

  const firstBreak = Math.min(2, sentences.length - 1);
  const secondBreak = sentences.length > 5 ? Math.ceil((sentences.length + firstBreak) / 2) : sentences.length;
  const paragraphs = [
    sentences.slice(0, firstBreak).join(" "),
    sentences.slice(firstBreak, secondBreak).join(" "),
    sentences.slice(secondBreak).join(" "),
  ].filter(Boolean);

  return paragraphs.join("\n\n");
}

function normalizeAtiSubject(value: unknown, fallbackSubject: unknown) {
  const raw = String(value || fallbackSubject || "").trim().toLowerCase();
  const normalized = raw.replace(/&/g, "and").replace(/\s+/g, " ");
  if (normalized.includes("reading")) return "Reading";
  if (normalized.includes("math")) return "Mathematics";
  if (normalized.includes("science")) return "Science";
  if (normalized.includes("english") || normalized.includes("language")) {
    return "English and Language Usage";
  }
  return "";
}

function normalizeAtiSection(subject: string, section: unknown) {
  const allowedSections = ATI_TEAS_SECTIONS[subject as AtiTeasSubject];
  if (!allowedSections) return "Needs Review";
  const raw = String(section || "").trim();
  const normalized = raw.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");
  const matched = allowedSections.find(
    (allowedSection) =>
      allowedSection.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ") === normalized
  );
  return matched || "Needs Review";
}

async function generateWithOpenAI(question: Record<string, unknown>): Promise<ExplanationResult> {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_EXPLANATION_MODEL || "gpt-5-nano";
  if (!apiKey) {
    return { status: "failed", model, error: "Missing OPENAI_API_KEY." };
  }

  const response = await fetchWithTimeout(
    OPENAI_CHAT_COMPLETIONS_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write concise ATI TEAS tutoring explanations. Return valid JSON only.",
          },
          { role: "user", content: buildExplanationPrompt(question) },
        ],
      }),
    },
    Number(process.env.OPENAI_EXPLANATION_TIMEOUT_MS || 60000)
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI explanation request failed.");
  }

  const parsed = parseJsonText(payload?.choices?.[0]?.message?.content || "");
  const status = String(parsed.status || "").toUpperCase();
  const atiSubject = normalizeAtiSubject(parsed.atiSubject, question.subjectName || question.subject || question.category);
  const atiSection = normalizeAtiSection(atiSubject, parsed.atiSection);
  const atiClassificationReason = String(parsed.atiClassificationReason || "").trim();
  if (status === "NEEDS_ANSWER_REVIEW") {
    return {
      status: "needs_answer_review",
      model,
      atiSubject: atiSubject || undefined,
      atiSection,
      atiClassificationReason,
      answerReviewReason: String(parsed.answerReviewReason || "The saved answer may not match the question."),
      modelSuggestedAnswer: String(parsed.modelSuggestedAnswer || ""),
    };
  }

  const explanation = formatExplanationText(parsed.explanation);
  if (!explanation) {
    return { status: "failed", model, error: "The model returned no explanation." };
  }
  return {
    status: "generated",
    model,
    explanation,
    atiSubject: atiSubject || undefined,
    atiSection,
    atiClassificationReason,
  };
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const subPageId = String(body.subPageId || "").trim();
    const nestedSubPageId = String(body.nestedSubPageId || "").trim();
    const quizId = String(body.quizId || "").trim();
    const questionId = String(body.questionId || "").trim();
    const regenerate = body.regenerate === true;

    if (!subPageId || !nestedSubPageId || !quizId || !questionId) {
      return NextResponse.json({ error: "Missing quiz or question identifiers." }, { status: 400 });
    }

    const db = getAdminDb();
    const subPagesRef = db.collection("pillarPages").doc(PILLAR_ID).collection("subPages");
    const parentDoc = await resolveDocBySlugOrId(subPagesRef, subPageId);
    if (!parentDoc) return NextResponse.json({ error: `Parent sub-page ${subPageId} not found.` }, { status: 404 });

    const nestedDoc = await resolveDocBySlugOrId(parentDoc.ref.collection("nestedSubPages"), nestedSubPageId);
    if (!nestedDoc) return NextResponse.json({ error: `Nested sub-page ${nestedSubPageId} not found.` }, { status: 404 });

    const quizDoc = await resolveDocBySlugOrId(nestedDoc.ref.collection("quizzes"), quizId);
    if (!quizDoc) return NextResponse.json({ error: `Quiz ${quizId} not found.` }, { status: 404 });

    const questionRef = quizDoc.ref.collection("questions").doc(questionId);
    const questionSnap = await questionRef.get();
    if (!questionSnap.exists) {
      return NextResponse.json({ error: `Question ${questionId} not found.` }, { status: 404 });
    }

    const question = questionSnap.data() || {};
    const existingExplanation = String(question.explanation || "").trim();
    if (existingExplanation && !regenerate) {
      return NextResponse.json({
        status: "skipped",
        questionId,
        message: "Question already has an explanation.",
      });
    }

    const result = await generateWithOpenAI({ ...question, id: questionSnap.id });
    const now = FieldValue.serverTimestamp();

    if (result.status === "generated") {
      await questionRef.set(
        {
          explanation: result.explanation,
          explanationStatus: "ai_generated",
          explanationGeneratedBy: `openai:${result.model}`,
          explanationGeneratedAt: now,
          atiSubject: result.atiSubject || null,
          atiSection: result.atiSection || "Needs Review",
          atiClassificationReason: result.atiClassificationReason || "",
          atiClassificationGeneratedBy: `openai:${result.model}`,
          atiClassificationGeneratedAt: now,
          explanationError: null,
          answerReviewReason: null,
          modelSuggestedAnswer: null,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } else if (result.status === "needs_answer_review") {
      await questionRef.set(
        {
          explanationStatus: "needs_answer_review",
          explanationGeneratedBy: `openai:${result.model}`,
          explanationGeneratedAt: now,
          atiSubject: result.atiSubject || null,
          atiSection: result.atiSection || "Needs Review",
          atiClassificationReason: result.atiClassificationReason || "",
          atiClassificationGeneratedBy: `openai:${result.model}`,
          atiClassificationGeneratedAt: now,
          answerReviewReason: result.answerReviewReason,
          modelSuggestedAnswer: result.modelSuggestedAnswer || null,
          explanationError: null,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } else {
      await questionRef.set(
        {
          explanationStatus: "failed",
          explanationGeneratedBy: result.model ? `openai:${result.model}` : "openai",
          explanationError: result.error || "Explanation generation failed.",
          explanationGeneratedAt: now,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ...result, questionId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate explanation." },
      { status: 400 }
    );
  }
}
