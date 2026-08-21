const fs = require("fs");
const path = require("path");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";
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
  const args = {
    id: 1,
    chunkSize: 3,
    overlap: 1,
    provider: (process.env.HESI_A2_IMAGE_PROVIDER || "gemini").toLowerCase(),
    model: process.env.HESI_A2_IMAGE_MODEL || process.env.GEMINI_HESI_A2_IMAGE_MODEL || "gemini-3.6-flash",
    dryRun: false,
    force: false,
    skipIfClean: true,
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--id") args.id = Number(argv[++index]);
    else if (arg === "--slug") args.slug = argv[++index];
    else if (arg === "--chunk-size") args.chunkSize = Number(argv[++index]);
    else if (arg === "--overlap") args.overlap = Number(argv[++index]);
    else if (arg === "--provider") args.provider = String(argv[++index] || "").toLowerCase();
    else if (arg === "--model") args.model = argv[++index];
    else if (arg === "--start-page") args.startPage = Number(argv[++index]);
    else if (arg === "--end-page") args.endPage = Number(argv[++index]);
    else if (arg === "--max-chunks") args.maxChunks = Number(argv[++index]);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--no-write") args.noWrite = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--no-skip-clean") args.skipIfClean = false;
  }
  if (args.provider === "openai" && !argv.includes("--model") && !process.env.HESI_A2_IMAGE_MODEL) {
    args.model = process.env.OPENAI_HESI_A2_IMAGE_MODEL || process.env.OPENAI_TEAS_FAILED_IMAGE_MODEL || "gpt-4o-mini";
  }
  return args;
}

function loadSection(args) {
  const mapPath = path.join(HESI_ROOT, "review-reports", "hesi-a2-merged-extraction-map-reviewed.json");
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, ""));
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
  const questionNumberMatch = questionText.replace(/<[^>]*>/g, " ").match(/\bquestion\s+(\d+)\s+of\s+\d+/i);
  const sourceQuestionNumber = Number(raw.sourceQuestionNumber || raw.questionNumber || (questionNumberMatch ? questionNumberMatch[1] : 0)) || null;
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
      sourceQuestionNumber,
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

function buildPrompt(section, pages) {
  return `Extract every visible ${section.subject} question from this small page chunk.

Target full quiz: ${section.suggestedQuizTitle}
Target subject: ${section.subject}
Target exam set: ${section.setLabel}
Chunk pages provided: ${pages.join(", ")}

Rules:
- Extract ONLY ${section.subject} questions visible on these pages.
- Do not limit the output to 10 questions. Return every visible question in the chunk.
- Transition pages may include another subject. Ignore non-${section.subject} questions.
- If a question begins in this chunk and continues onto a provided later page, merge it.
- If a question clearly started before this chunk and is incomplete here, include it only if enough stem/options/answer are visible; otherwise skip it to avoid duplicates.
- Preserve visible wording and choices.
- Preserve the visible source question number in sourceQuestionNumber, for example "Question 46 of 50" becomes 46.
- If answer/rationale/options are missing, create original educational HESI A2-style repairs and mark ai_inferred or ai_generated.
- Do not copy from outside websites.

Return only valid JSON:
{
  "questions": [
    {
      "question": "<p>HTML question stem</p>",
      "sourceQuestionNumber": 1,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "solution": "<p>Concise rationale.</p>",
      "question_type_id": 1,
      "sourcePages": [217],
      "answerSource": "source_visible|ai_inferred|unknown",
      "optionsSource": "source_visible|ai_generated|mixed|unknown",
      "explanationSource": "source_visible|ai_generated|mixed|unknown",
      "continuationMerged": false,
      "needsReview": false,
      "reviewNotes": ""
    }
  ],
  "chunkNotes": ["brief notes"]
}`;
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

async function callGemini(section, images, model, apiKey) {
  const pages = images.map(imagePageNumber);
  const parts = [
    { text: buildPrompt(section, pages) },
    ...images.map((filePath) => ({
      inline_data: {
        mime_type: mimeTypeForFile(filePath),
        data: fs.readFileSync(filePath).toString("base64"),
      },
    })),
  ];
  const url = `${GEMINI_GENERATE_CONTENT_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || JSON.stringify(body));
  const responseText = (body.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
  if (!responseText) {
    throw new Error(`Gemini returned no text content: ${JSON.stringify(body).slice(0, 4000)}`);
  }
  return JSON.parse(stripJsonFence(responseText));
}

async function callModel(section, images, args) {
  if (args.provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY missing");
    return callGemini(section, images, args.model, apiKey);
  }
  if (args.provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    return callOpenAI(section, images, args.model, apiKey);
  }
  throw new Error(`Unsupported provider: ${args.provider}. Use gemini or openai.`);
}

function existingCleanReport(section) {
  const reportPath = path.join(HESI_ROOT, "review-reports", `${section.suggestedSlug}-review-report.json`);
  if (!fs.existsSync(reportPath)) return false;
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8").replace(/^\uFEFF/, ""));
    const expected = Number(section.expectedQuestions || 0);
    const actual = Number(report.questionCount || report.actualQuestions || 0);
    return expected > 0 && actual === expected && Number(report.issueCount || 0) === 0;
  } catch {
    return false;
  }
}

function chunkImages(images, chunkSize, overlap) {
  const chunks = [];
  const step = Math.max(1, chunkSize - overlap);
  for (let start = 0; start < images.length; start += step) {
    const chunk = images.slice(start, start + chunkSize);
    if (chunk.length) chunks.push(chunk);
    if (start + chunkSize >= images.length) break;
  }
  return chunks;
}

function dedupeQuestions(questions) {
  const seen = new Set();
  const output = [];
  for (const question of questions) {
    const questionNumber = Number(question.sourceMetadata?.sourceQuestionNumber || 0) || null;
    const optionText = Object.keys(question.options || {})
      .sort()
      .map((label) => `${label}:${question.options[label]?.choice || ""}`)
      .join("|");
    const key = questionNumber
      ? `qnum-${questionNumber}`
      : slugify([String(question.question || "").replace(/<[^>]*>/g, " ").slice(0, 260), optionText].join(" "));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(question);
  }
  return output;
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv);
  const section = loadSection(args);
  if (args.skipIfClean && !args.force && existingCleanReport(section)) {
    console.log(`Skipping clean section ${section.id}: ${section.suggestedQuizTitle}. Use --force to overwrite.`);
    return;
  }
  const imageDir = path.join(HESI_ROOT, "images", SOURCE);
  const allImages = fs.readdirSync(imageDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(imageDir, name));
  const startPage = Number.isFinite(args.startPage) ? args.startPage : Number(section.startPage);
  const endPage = Number.isFinite(args.endPage) ? args.endPage : Number(section.endPage);
  const images = allImages.filter((filePath) => {
    const page = imagePageNumber(filePath);
    return page >= startPage && page <= endPage;
  });
  let chunks = chunkImages(images, Math.max(1, args.chunkSize), Math.max(0, args.overlap));
  if (Number.isFinite(args.maxChunks) && args.maxChunks > 0) chunks = chunks.slice(0, args.maxChunks);
  const selectedPages = images.map(imagePageNumber);
  if (args.dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      provider: args.provider,
      model: args.model,
      sectionId: section.id,
      title: section.suggestedQuizTitle,
      mapPages: [section.startPage, section.endPage],
      selectedPages,
      imageCount: images.length,
      chunkCount: chunks.length,
      chunks: chunks.map((chunk, index) => ({ index: index + 1, pages: chunk.map(imagePageNumber) })),
    }, null, 2));
    return;
  }
  const outDir = path.join(HESI_ROOT, "converted-json");
  const reportDir = path.join(HESI_ROOT, "review-reports");
  const base = section.suggestedSlug;
  if (!args.force && fs.existsSync(path.join(outDir, `${base}.json`)) && !existingCleanReport(section)) {
    throw new Error(`Existing non-clean output found for ${base}. Review it first or rerun with --force.`);
  }
  const rawChunks = [];
  const rawQuestions = [];
  console.log(`Chunk extracting ${section.suggestedQuizTitle}: ${images.length} images, ${chunks.length} chunks using ${args.provider}/${args.model}`);
  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const pages = chunk.map(imagePageNumber);
    console.log(`Chunk ${index + 1}/${chunks.length}: pages ${pages.join(", ")}`);
    const extracted = await callModel(section, chunk, args);
    rawChunks.push({ index: index + 1, pages, extracted, provider: args.provider, model: args.model });
    for (const question of Array.isArray(extracted.questions) ? extracted.questions : []) rawQuestions.push(question);
  }
  const questions = dedupeQuestions(rawQuestions.map((question, index) => normalizeQuestion(question, index, section)))
    .map((question, index) => ({ ...question, id: `hesi-a2-actual-set-${section.setNumber}-${slugify(section.subject)}-q${index + 1}` }));
  const questionIssues = questions.flatMap((question, index) => validateQuestion(question, index));
  const sectionIssues = [];
  const expected = Number(section.expectedQuestions || 0);
  if (expected > 0 && questions.length !== expected) {
    sectionIssues.push({
      issue: "question_count_mismatch",
      expectedQuestions: expected,
      actualQuestions: questions.length,
      note: "Chunk extraction completed but count still differs from the reviewed source map.",
    });
  }
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
      sourcePages: [startPage, endPage],
    },
    setNumber: section.setNumber,
    setLabel: section.setLabel,
    subject: section.subject,
    questionsToShow: questions.length,
    totalQuestions: questions.length,
    expectedQuestions: section.expectedQuestions || null,
    questions,
  };
  if (args.noWrite) {
    console.log(JSON.stringify({
      noWrite: true,
      provider: args.provider,
      model: args.model,
      questionCount: questions.length,
      expectedQuestions: section.expectedQuestions || null,
      issueCount: issues.length,
      sectionIssues,
      questionIssues,
    }, null, 2));
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
  const providerLabel = args.provider === "openai" ? "openai" : "gemini";
  const jsonPath = path.join(outDir, `${base}.json`);
  const rawPath = path.join(reportDir, `${base}-raw-${providerLabel}-response.json`);
  const reportPath = path.join(reportDir, `${base}-review-report.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(rawPath, JSON.stringify({ chunked: true, rawChunks, provider: args.provider, model: args.model }, null, 2), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify({
    section: { ...section, startPage, endPage, pageCount: selectedPages.length },
    provider: args.provider,
    model: args.model,
    chunked: true,
    chunkSize: args.chunkSize,
    overlap: args.overlap,
    imageCount: images.length,
    chunkCount: chunks.length,
    questionCount: questions.length,
    expectedQuestions: section.expectedQuestions || null,
    questionCountMatchesExpected: !(section.expectedQuestions > 0) || questions.length === section.expectedQuestions,
    issueCount: issues.length,
    sectionIssues,
    questionIssues,
    issues,
    generatedAt: new Date().toISOString(),
  }, null, 2), "utf8");
  console.log(JSON.stringify({ jsonPath, reportPath, rawPath, provider: args.provider, model: args.model, questionCount: questions.length, expectedQuestions: section.expectedQuestions || null, issueCount: issues.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
