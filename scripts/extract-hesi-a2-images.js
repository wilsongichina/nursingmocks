const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function slugify(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function mimeTypeForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function parseArgs(argv) {
  const args = {
    source: "Anatomy Version 1",
    quizTitle: "HESI A2 Anatomy and Physiology - Set 1",
    setNumber: 1,
    model: process.env.OPENAI_HESI_A2_IMAGE_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o",
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") args.source = argv[++index];
    else if (arg === "--quiz-title") args.quizTitle = argv[++index];
    else if (arg === "--set-number") args.setNumber = Number(argv[++index]);
    else if (arg === "--model") args.model = argv[++index];
  }
  return args;
}

function stripJsonFence(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function formatOptionValue(option) {
  if (option === null || option === undefined) return "";
  if (typeof option !== "object") return String(option).trim();
  if (Array.isArray(option)) return option.map(formatOptionValue).filter(Boolean).join(" ").trim();
  const optionText =
    option.choice ??
    option.text ??
    option.label ??
    option.answer ??
    option.value ??
    option.option ??
    option.content ??
    option.html ??
    option.body ??
    option.title;
  if (optionText !== undefined && optionText !== null) return formatOptionValue(optionText);
  return Object.values(option).map(formatOptionValue).filter(Boolean).join(" ").trim();
}

function normalizeOptions(options) {
  if (!options) return [];
  if (Array.isArray(options)) return options.map(formatOptionValue).filter(Boolean);
  if (typeof options === "string") {
    try {
      return normalizeOptions(JSON.parse(options));
    } catch {
      return [];
    }
  }
  if (typeof options === "object") {
    return Object.keys(options)
      .sort()
      .map((key) => formatOptionValue(options[key]))
      .filter(Boolean);
  }
  return [];
}

function normalizeQuestion(raw, index, args) {
  const questionText = String(raw.question || raw.questionHtml || raw.stem || "").trim();
  const correctAnswer = Array.isArray(raw.correctAnswer)
    ? raw.correctAnswer.map(String)
    : String(raw.correctAnswer || raw.correct_answer || "").trim().toUpperCase();
  const questionTypeId = Number(raw.question_type_id || raw.questionTypeId || (Array.isArray(correctAnswer) ? 2 : 1));
  return {
    id: raw.id || `hesi-a2-${slugify(args.source)}-set-${args.setNumber}-q${index + 1}`,
    question: questionText,
    tabs: raw.tabs || null,
    options: normalizeOptions(raw.options),
    correctAnswer,
    correct_answer: correctAnswer,
    solution: String(raw.solution || raw.explanation || "").trim(),
    question_type_id: Number.isFinite(questionTypeId) ? questionTypeId : 1,
    subquestions: Array.isArray(raw.subquestions) ? raw.subquestions : [],
    match_option: raw.match_option || null,
    image_path: raw.image_path || null,
    units: raw.units || null,
    question_slug: slugify(questionText.replace(/<[^>]*>/g, " ").slice(0, 160)) || `question-${index + 1}`,
    subtopic: args.quizTitle,
    subtopic_slug: slugify(args.quizTitle),
    sourceMetadata: {
      sourceFile: args.source,
      setNumber: args.setNumber,
      setLabel: `Set ${args.setNumber}`,
      sourcePages: Array.isArray(raw.sourcePages) ? raw.sourcePages : [],
      answerSource: raw.answerSource || "unknown",
      optionsSource: raw.optionsSource || "unknown",
      explanationSource: raw.explanationSource || "unknown",
      continuationMerged: Boolean(raw.continuationMerged),
      needsReview: Boolean(raw.needsReview),
      reviewNotes: raw.reviewNotes || "",
    },
  };
}

function validateQuestion(question, index) {
  const issues = [];
  const clean = String(question.question || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) issues.push("missing_question_text");
  const optionCount = Object.values(question.options || {}).filter((option) => option && String(option.choice || "").trim()).length;
  if (![6, 7, 9, 10, 11, 12, 13].includes(Number(question.question_type_id)) && optionCount < 2) issues.push("too_few_options");
  if (!question.correctAnswer || (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0)) issues.push("missing_correct_answer");
  if (!question.solution) issues.push("missing_solution");
  if (question.sourceMetadata?.needsReview) issues.push("model_marked_needs_review");
  return issues.map((issue) => ({ questionNumber: index + 1, issue, sourcePages: question.sourceMetadata?.sourcePages || [] }));
}

function buildPrompt(args, imageNames) {
  return `You are converting HESI A2 exam page images into NursingMocks import JSON.\n\nSource folder: ${args.source}\nQuiz title: ${args.quizTitle}\nSet number: ${args.setNumber}\nPages provided in order:\n${imageNames.map((name, index) => `${index + 1}. ${name}`).join("\n")}\n\nCritical extraction rules:\n- Extract every complete question visible across these pages.\n- Some questions continue from one page/image to the next. Merge continuation text/options/answers into one complete question.\n- Some pages may contain only answers or rationales. Match those answers/rationales back to the earlier question when possible.\n- Preserve the source question wording when visible. Do not rewrite visible stems or visible answer choices except to fix OCR punctuation.\n- Preserve lists, tables, formulas, lab values, and multi-line content as simple HTML in the question field.\n- If an answer is visible in the image, use it and set answerSource to "source_visible".\n- If answer choices are missing but the question stem/answer is clear, generate original plausible answer choices suitable for HESI A2 and set optionsSource to "ai_generated".\n- If the correct answer is not visible, infer the best answer from foundational HESI A2 anatomy/physiology knowledge and set answerSource to "ai_inferred".\n- If explanation/rationale is missing, generate a concise original rationale and set explanationSource to "ai_generated".\n- Do not copy from external sites. If source content is incomplete, create original educational choices/rationales from general subject knowledge.\n- Mark needsReview true if the source is unclear, cropped, answer-only matching is uncertain, options were heavily reconstructed, or multiple answers may be defensible.\n- Use question_type_id 1 for single-answer multiple choice, 2 for select-all-that-apply, and 7 for fill-in/numeric.\n\nReturn only valid JSON with this shape:\n{\n  "questions": [\n    {\n      "id": "string",\n      "question": "<p>HTML question stem</p>",\n      "options": ["Option A", "Option B", "Option C", "Option D"],\n      "correctAnswer": "A",\n      "solution": "<p>Concise rationale.</p>",\n      "question_type_id": 1,\n      "sourcePages": [1],\n      "answerSource": "source_visible|ai_inferred|unknown",\n      "optionsSource": "source_visible|ai_generated|mixed|unknown",\n      "explanationSource": "source_visible|ai_generated|mixed|unknown",\n      "continuationMerged": false,\n      "needsReview": false,\n      "reviewNotes": ""\n    }\n  ],\n  "pageNotes": ["brief extraction notes"]\n}`;
}

async function callOpenAI(args, images) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_HESI_A2_TIMEOUT_MS || 180000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const content = [
      { type: "text", text: buildPrompt(args, images.map((image) => path.basename(image))) },
      ...images.map((filePath) => ({
        type: "image_url",
        image_url: {
          url: `data:${mimeTypeForFile(filePath)};base64,${fs.readFileSync(filePath).toString("base64")}`,
          detail: "high",
        },
      })),
    ];
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: args.model,
        messages: [{ role: "user", content }],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
    const text = (body.choices || []).map((choice) => choice.message?.content || "").join("").trim();
    return JSON.parse(stripJsonFence(text));
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv);
  const imageDir = path.join(HESI_ROOT, "images", args.source);
  const outDir = path.join(HESI_ROOT, "converted-json");
  const reportDir = path.join(HESI_ROOT, "review-reports");
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });

  const images = fs.readdirSync(imageDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(imageDir, name));

  if (!images.length) throw new Error(`No images found in ${imageDir}`);
  console.log(`Processing ${images.length} images from ${args.source} with ${args.model}`);
  const extracted = await callOpenAI(args, images);
  const rawQuestions = Array.isArray(extracted.questions) ? extracted.questions : [];
  const questions = rawQuestions.map((question, index) => normalizeQuestion(question, index, args));
  const issues = questions.flatMap((question, index) => validateQuestion(question, index));
  const payload = {
    status: true,
    subtopic: {
      id: `hesi-a2-${slugify(args.source)}-set-${args.setNumber}`,
      name: args.quizTitle,
      slug: slugify(args.quizTitle),
      questionsCount: questions.length,
      sourceFile: args.source,
      setNumber: args.setNumber,
      setLabel: `Set ${args.setNumber}`,
    },
    setNumber: args.setNumber,
    setLabel: `Set ${args.setNumber}`,
    questionsToShow: questions.length,
    totalQuestions: questions.length,
    questions,
  };

  const base = slugify(args.quizTitle);
  const rawPath = path.join(reportDir, `${base}-raw-openai-response.json`);
  const jsonPath = path.join(outDir, `${base}.json`);
  const reportPath = path.join(reportDir, `${base}-review-report.json`);
  fs.writeFileSync(rawPath, JSON.stringify(extracted, null, 2), "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify({
    source: args.source,
    quizTitle: args.quizTitle,
    setNumber: args.setNumber,
    model: args.model,
    imageCount: images.length,
    questionCount: questions.length,
    issueCount: issues.length,
    issues,
    pageNotes: extracted.pageNotes || [],
    generatedAt: new Date().toISOString(),
  }, null, 2), "utf8");

  console.log(JSON.stringify({ jsonPath, reportPath, rawPath, questionCount: questions.length, issueCount: issues.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
