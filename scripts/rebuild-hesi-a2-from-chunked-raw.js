const fs = require("fs");
const path = require("path");

const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
const SOURCE = "HESI A2 ACTUAL EXAM - MERGED";

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

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--id") args.id = Number(argv[++index]);
    else if (arg === "--slug") args.slug = argv[++index];
  }
  return args;
}

function loadSection(args) {
  const mapPath = path.join(HESI_ROOT, "review-reports", "hesi-a2-merged-extraction-map-reviewed.json");
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, ""));
  const section = (map.sections || []).find((item) =>
    args.slug ? item.suggestedSlug === args.slug : Number(item.id) === Number(args.id)
  );
  if (!section) throw new Error(`Section not found: ${args.slug || args.id}`);
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
    id: `hesi-a2-actual-set-${section.setNumber}-${slugify(section.subject)}-q${index + 1}`,
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

function dedupeQuestions(questions) {
  const seen = new Set();
  const output = [];
  for (const question of questions) {
    const questionNumberMatch = String(question.question || "")
      .replace(/<[^>]*>/g, " ")
      .match(/\bquestion\s+(\d+)\s+of\s+\d+/i);
    const questionNumber = questionNumberMatch ? Number(questionNumberMatch[1]) : null;
    const optionText = Object.keys(question.options || {})
      .sort()
      .map((label) => `${label}:${question.options[label]?.choice || ""}`)
      .join("|");
    const key = questionNumber
      ? `qnum-${questionNumber}`
      : slugify([
      String(question.question || "").replace(/<[^>]*>/g, " ").slice(0, 260),
      optionText,
    ].join(" "));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(question);
  }
  return output;
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

function main() {
  const args = parseArgs(process.argv);
  const section = loadSection(args);
  const reportDir = path.join(HESI_ROOT, "review-reports");
  const outDir = path.join(HESI_ROOT, "converted-json");
  const base = section.suggestedSlug;
  const rawPath = path.join(reportDir, `${base}-raw-openai-response.json`);
  if (!fs.existsSync(rawPath)) throw new Error(`Raw response not found: ${rawPath}`);
  const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
  if (!raw.chunked || !Array.isArray(raw.rawChunks)) {
    throw new Error(`${base} does not have a chunked raw response to rebuild from.`);
  }
  const rawQuestions = raw.rawChunks.flatMap((chunk) => Array.isArray(chunk.extracted?.questions) ? chunk.extracted.questions : []);
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
      note: "Rebuilt from saved chunked raw response, but count still differs from the reviewed source map.",
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
  fs.writeFileSync(path.join(outDir, `${base}.json`), JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(path.join(reportDir, `${base}-review-report.json`), JSON.stringify({
    section,
    rebuiltFromChunkedRaw: true,
    rawQuestionCount: rawQuestions.length,
    questionCount: questions.length,
    expectedQuestions: section.expectedQuestions || null,
    questionCountMatchesExpected: !(section.expectedQuestions > 0) || questions.length === section.expectedQuestions,
    issueCount: issues.length,
    sectionIssues,
    questionIssues,
    issues,
    generatedAt: new Date().toISOString(),
  }, null, 2), "utf8");
  console.log(JSON.stringify({ slug: base, rawQuestionCount: rawQuestions.length, questionCount: questions.length, expectedQuestions: section.expectedQuestions || null, issueCount: issues.length }, null, 2));
}

main();
