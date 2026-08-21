const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";

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
  return path.extname(filePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
}

function imagePageNumber(filePath) {
  const match = path.basename(filePath).match(/page-(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function stripJsonFence(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseArgs(argv) {
  const args = { id: 1 };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--id") args.id = Number(argv[++index]);
    else if (arg === "--slug") args.slug = argv[++index];
  }
  return args;
}

function loadSection(args) {
  const mapPath = path.join(HESI_ROOT, "review-reports", "hesi-a2-merged-extraction-map-reviewed.json");
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  const sections = Array.isArray(map.sections) ? map.sections : [];
  const section = args.slug
    ? sections.find((item) => item.suggestedSlug === args.slug)
    : sections.find((item) => Number(item.id) === Number(args.id));
  if (!section) throw new Error(`Section not found for ${args.slug || args.id}`);
  if (section.mapStatus !== "ready_for_section_extraction") {
    throw new Error(`Section ${section.id} is marked ${section.mapStatus}; review before extracting.`);
  }
  return section;
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

function normalizeQuestion(raw, index, section) {
  const questionText = String(raw.question || raw.questionHtml || raw.stem || "").trim();
  const correctAnswer = Array.isArray(raw.correctAnswer)
    ? raw.correctAnswer.map(String)
    : String(raw.correctAnswer || raw.correct_answer || "").trim().toUpperCase();
  const questionTypeId = Number(raw.question_type_id || raw.questionTypeId || (Array.isArray(correctAnswer) ? 2 : 1));
  return {
    id: raw.id || `hesi-a2-actual-set-${section.setNumber}-${slugify(section.subject)}-q${index + 1}`,
    question: questionText,
    tabs: null,
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
    subtopic: section.suggestedQuizTitle,
    subtopic_slug: section.suggestedSlug,
    sourceMetadata: {
      sourceFile: SOURCE,
      sourcePages: Array.isArray(raw.sourcePages) ? raw.sourcePages : [],
      setNumber: section.setNumber,
      setLabel: section.setLabel,
      subject: section.subject,
      sectionId: section.id,
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
  const optionCount = Object.values(question.options || {}).filter((option) => option && String(option.choice || "").trim()).length;
  if (!clean) issues.push("missing_question_text");
  if (![6, 7, 9, 10, 11, 12, 13].includes(Number(question.question_type_id)) && optionCount < 2) issues.push("too_few_options");
  if (!question.correctAnswer || (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0)) issues.push("missing_correct_answer");
  if (!question.solution) issues.push("missing_solution");
  if (question.sourceMetadata?.needsReview) issues.push("model_marked_needs_review");
  return issues.map((issue) => ({ questionNumber: index + 1, issue, sourcePages: question.sourceMetadata?.sourcePages || [] }));
}

function validateSection(section, questions) {
  const issues = [];
  const expected = Number(section.expectedQuestions || 0);
  if (expected > 0 && questions.length !== expected) {
    issues.push({
      issue: "question_count_mismatch",
      expectedQuestions: expected,
      actualQuestions: questions.length,
      note: "The extracted question count does not match the reviewed source map. Review the HTML preview/source pages before import.",
    });
  }
  return issues;
}

function buildPrompt(section, pages) {
  return `Convert this HESI A2 merged-document section into NursingMocks import JSON.\n\nTarget quiz: ${section.suggestedQuizTitle}\nTarget subject: ${section.subject}\nTarget exam set: ${section.setLabel}\nExpected question count: ${section.expectedQuestions || "unknown"}\nPages provided: ${pages.join(", ")}\n\nCRITICAL:\n- Extract ONLY ${section.subject} questions for ${section.suggestedQuizTitle}.\n- Some provided pages are transition pages that may also contain another subject. Ignore non-${section.subject} questions.\n- Preserve visible question wording and visible answer choices.\n- Preserve passage text, lists, formulas, and units as simple HTML.\n- Use visible highlighted/correct-answer text when present and set answerSource to "source_visible".\n- If answer choices or rationales are missing, create original educational HESI A2-style choices/rationales from foundational knowledge and mark the relevant source field as ai_generated or ai_inferred.\n- Do not copy from outside websites.\n- Mark needsReview true when a page is unclear, question continues beyond provided pages, answer-only matching is uncertain, or generated repairs are substantial.\n- Use question_type_id 1 for single-answer multiple choice, 2 for select-all-that-apply, and 7 for fill-in/numeric.\n- Return the questions in source order and use sourcePages with actual image page numbers.\n\nReturn only valid JSON:\n{\n  "questions": [\n    {\n      "id": "string",\n      "question": "<p>HTML question stem</p>",\n      "options": ["Option A", "Option B", "Option C", "Option D"],\n      "correctAnswer": "A",\n      "solution": "<p>Concise rationale.</p>",\n      "question_type_id": 1,\n      "sourcePages": [1],\n      "answerSource": "source_visible|ai_inferred|unknown",\n      "optionsSource": "source_visible|ai_generated|mixed|unknown",\n      "explanationSource": "source_visible|ai_generated|mixed|unknown",\n      "continuationMerged": false,\n      "needsReview": false,\n      "reviewNotes": ""\n    }\n  ],\n  "sectionNotes": ["brief notes"]\n}`;
}

async function callOpenAI(section, images, model, apiKey) {
  const pages = images.map(imagePageNumber);
  const content = [
    { type: "text", text: buildPrompt(section, pages) },
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
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
  const text = (body.choices || []).map((choice) => choice.message?.content || "").join("").trim();
  return JSON.parse(stripJsonFence(text));
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv);
  const section = loadSection(args);
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const model = process.env.OPENAI_HESI_A2_IMAGE_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o";
  const imageDir = path.join(HESI_ROOT, "images", SOURCE);
  const allImages = fs.readdirSync(imageDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(imageDir, name));
  const images = allImages.filter((filePath) => {
    const page = imagePageNumber(filePath);
    return page >= Number(section.startPage) && page <= Number(section.endPage);
  });
  if (!images.length) throw new Error(`No images found for section pages ${section.startPage}-${section.endPage}`);
  console.log(`Extracting ${section.suggestedQuizTitle} from pages ${section.startPage}-${section.endPage} (${images.length} images)`);
  const extracted = await callOpenAI(section, images, model, apiKey);
  const rawQuestions = Array.isArray(extracted.questions) ? extracted.questions : [];
  const questions = rawQuestions.map((question, index) => normalizeQuestion(question, index, section));
  const questionIssues = questions.flatMap((question, index) => validateQuestion(question, index));
  const sectionIssues = validateSection(section, questions);
  const issues = [...sectionIssues, ...questionIssues];
  const payload = {
    status: true,
    subtopic: {
      id: `hesi-a2-actual-exam-set-${section.setNumber}-${slugify(section.subject)}`,
      name: section.suggestedQuizTitle,
      slug: section.suggestedSlug,
      questionsCount: questions.length,
      sourceFile: SOURCE,
      setNumber: section.setNumber,
      setLabel: section.setLabel,
      subject: section.subject,
      sourcePages: [section.startPage, section.endPage],
    },
    setNumber: section.setNumber,
    setLabel: section.setLabel,
    subject: section.subject,
    questionsToShow: questions.length,
    totalQuestions: questions.length,
    expectedQuestions: section.expectedQuestions || null,
    questions,
  };
  const outDir = path.join(HESI_ROOT, "converted-json");
  const reportDir = path.join(HESI_ROOT, "review-reports");
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
  const base = section.suggestedSlug;
  const jsonPath = path.join(outDir, `${base}.json`);
  const rawPath = path.join(reportDir, `${base}-raw-openai-response.json`);
  const reportPath = path.join(reportDir, `${base}-review-report.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(rawPath, JSON.stringify(extracted, null, 2), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify({
    section,
    model,
    imageCount: images.length,
    questionCount: questions.length,
    expectedQuestions: section.expectedQuestions || null,
    questionCountMatchesExpected: !(section.expectedQuestions > 0) || questions.length === section.expectedQuestions,
    issueCount: issues.length,
    sectionIssues,
    questionIssues,
    issues,
    sectionNotes: extracted.sectionNotes || [],
    generatedAt: new Date().toISOString(),
  }, null, 2), "utf8");
  console.log(JSON.stringify({ jsonPath, reportPath, rawPath, questionCount: questions.length, expectedQuestions: section.expectedQuestions || null, issueCount: issues.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
