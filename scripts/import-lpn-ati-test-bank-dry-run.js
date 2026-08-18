const fs = require("fs");
const path = require("path");

const DEFAULT_CLEANUP_ROOT =
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\LPN\\ATI";
const GROUP_SLUG = "lpn-ati";
const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "lpn-exams";
const NESTED_SLUG = "ati-lpn-exams";

const TOPIC_SLUGS = {
  "Adult Medical Surgical": "ati-pn-adult-medical-surgical-practice-questions",
  "Anatomy and Physiology": "ati-pn-anatomy-and-physiology-practice-questions",
  "Comprehensive Review": "ati-pn-comprehensive-review-practice-questions",
  "Dosage Calculations": "ati-pn-dosage-calculations-practice-questions",
  "Fundamentals": "ati-pn-fundamentals-practice-questions",
  "Gerontology": "ati-pn-gerontology-practice-questions",
  "Health Assessment": "ati-pn-health-assessment-practice-questions",
  "Management": "ati-pn-management-practice-questions",
  "Maternal Newborn": "ati-pn-maternal-newborn-practice-questions",
  "Mental Health": "ati-pn-mental-health-practice-questions",
  "Microbiology": "ati-pn-microbiology-practice-questions",
  "Nutrition": "ati-pn-nutrition-practice-questions",
  "Pediatric Nursing": "ati-pn-pediatric-nursing-practice-questions",
  "Pharmacology": "ati-pn-pharmacology-practice-questions",
};

const LEGACY_TOPIC_NAMES = new Map(
  Object.keys(TOPIC_SLUGS).map((topicName) => [`PN ${topicName}`, topicName])
);

function normalizeDestinationTopic(topicName) {
  const normalized = String(topicName || "").trim();
  return LEGACY_TOPIC_NAMES.get(normalized) || normalized;
}

function resolveDestinationPath(row, cleanupRoot) {
  if (row.destinationPath && fs.existsSync(row.destinationPath)) return row.destinationPath;
  const topicName = normalizeDestinationTopic(row.destinationTopic);
  return path.join(cleanupRoot, topicName, row.sourceFileName);
}

function parseArgs(argv) {
  const args = { cleanupRoot: DEFAULT_CLEANUP_ROOT };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cleanup-root") {
      args.cleanupRoot = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  const [headers, ...body] = rows;
  const cleanHeaders = headers.map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  return body.map((values) => {
    const item = {};
    cleanHeaders.forEach((header, index) => {
      item[header] = String(values[index] || "").replace(/^\uFEFF/, "").trim();
    });
    return item;
  });
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOptions(options) {
  if (!options) return [];
  try {
    const object = typeof options === "string" ? JSON.parse(options) : options;
    if (Array.isArray(object)) return object.map((value) => String(value || ""));
    return Object.keys(object)
      .sort()
      .map((key) => {
        const value = object[key];
        if (value && typeof value === "object" && "choice" in value) return String(value.choice || "");
        return String(value || "");
      });
  } catch {
    return [];
  }
}

function normalizeQuestion(question, index) {
  const questionText = question.question || question.questionText || question.text || question.stem || "";
  const options = parseOptions(question.options);
  const cleanQuestion = stripHtml(questionText);
  const questionSlug = slugify(cleanQuestion.slice(0, 180)) || `question-${index + 1}`;

  return {
    sourceQuestionId: question.id || question.questionId || "",
    question: questionText,
    cleanQuestion,
    options,
    correctAnswer: question.correctAnswer || question.correct_answer || "",
    explanation: question.solution || question.explanation || "",
    questionTypeId: Number(question.question_type_id || question.questionTypeId || 1),
    subquestions: Array.isArray(question.subquestions) ? question.subquestions : [],
    units: question.units || null,
    questionSlug,
  };
}

function validateQuestion(normalized, context) {
  const issues = [];
  if (!normalized.question) issues.push("missing_question_html");
  if (!normalized.cleanQuestion) issues.push("missing_clean_question");
  if (!normalized.correctAnswer) issues.push("missing_correct_answer");
  if (!normalized.explanation) issues.push("missing_explanation");
  if (!Number.isFinite(normalized.questionTypeId)) issues.push("invalid_question_type_id");
  if (normalized.questionTypeId === 1 && normalized.options.length < 2) issues.push("too_few_options");

  return issues.map((issue) => ({
    issue,
    sourceFileName: context.sourceFileName,
    destinationTopic: context.destinationTopic,
    questionIndex: context.questionIndex,
    sourceQuestionId: normalized.sourceQuestionId,
    questionPreview: normalized.cleanQuestion.slice(0, 160),
  }));
}

function buildQuizPayload(row, sourceJson, questions) {
  const topicSlug = TOPIC_SLUGS[row.destinationTopic] || slugify(row.destinationTopic);
  const questionCount = questions.length;
  const nowPlaceholder = "IMPORT_TIME";
  return {
    pageName: row.publicQuizTitle,
    quizName: row.publicQuizTitle,
    title: row.publicQuizTitle,
    heading: row.publicQuizTitle,
    slug: row.slug,
    status: "Published",
    type: "quiz",
    pillarId: PILLAR_ID,
    parentSlug: PARENT_SLUG,
    nestedSlug: NESTED_SLUG,
    topicSlug,
    destinationTopic: row.destinationTopic,
    questionCount,
    questionsToShow: Number(sourceJson.questionsToShow || questionCount),
    totalQuestions: Number(sourceJson.totalQuestions || questionCount),
    cardLabel: row.cardLabel,
    description: `Practice ${row.publicQuizTitle.replace(/\s+-\s+Set\s+\d+$/, "")}.`,
    meta: {
      title: `${row.publicQuizTitle} | NursingMocks`,
      description: `Practice with ${questionCount} questions from ${row.publicQuizTitle}.`,
      canonicalUrl: `https://www.nursingmocks.com/${row.slug}`,
    },
    sourceMetadata: {
      groupSlug: GROUP_SLUG,
      vendor: row.vendor,
      program: row.program,
      publicProgramLabel: row.publicProgramLabel,
      sourceFolder: row.sourceFolder,
      sourceFileName: row.sourceFileName,
      sourceFileNumber: row.sourceFileNumber,
      sourceSubtopic: row.sourceSubtopic,
      sourceSubtopicSlug: row.sourceSubtopicSlug,
      sourceTopicId: row.sourceTopicId,
      destinationPath: row.destinationPath,
      normalizationNotes: row.normalizationNotes,
      importedFromPreview: `${GROUP_SLUG}-normalized-name-preview.csv`,
    },
    lastUpdated: nowPlaceholder,
    version: "1.0",
  };
}

function main() {
  const args = parseArgs(process.argv);
  const cleanupRoot = args.cleanupRoot;
  const previewPath = path.join(cleanupRoot, `${GROUP_SLUG}-normalized-name-preview.csv`);
  const manifestPath = path.join(cleanupRoot, `${GROUP_SLUG}-cleanup-manifest.csv`);
  const outputDir = path.join(cleanupRoot, "import-dry-run");

  if (!fs.existsSync(previewPath)) throw new Error(`Preview CSV not found: ${previewPath}`);
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest CSV not found: ${manifestPath}`);

  fs.mkdirSync(outputDir, { recursive: true });

  const previewRows = parseCsv(fs.readFileSync(previewPath, "utf8"));
  const manifestRows = parseCsv(fs.readFileSync(manifestPath, "utf8"));
  const manifestByKey = new Map(
    manifestRows.map((row) => [`${row.sourceFolder}|${row.sourceFileName}`, row])
  );

  const importRows = previewRows
    .filter((row) => {
      const manifest = manifestByKey.get(`${row.sourceFolder}|${row.sourceFileName}`);
      return manifest && manifest.action === "import";
    })
    .map((row) => ({
      ...row,
      destinationTopic: normalizeDestinationTopic(row.destinationTopic),
      destinationPath: resolveDestinationPath(row, cleanupRoot),
    }));
  const excludedRows = manifestRows.filter((row) => row.action === "exclude");

  const quizRows = [];
  const questionIssueRows = [];
  const missingRows = [];
  const topicSummary = new Map();
  const plannedPayloads = [];

  for (const row of importRows) {
    const sourcePath = row.destinationPath || manifestByKey.get(`${row.sourceFolder}|${row.sourceFileName}`)?.destinationPath;
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      missingRows.push({
        sourceFileName: row.sourceFileName,
        destinationTopic: row.destinationTopic,
        issue: "missing_destination_json",
        path: sourcePath || "",
      });
      continue;
    }

    let sourceJson;
    try {
      sourceJson = readJson(sourcePath);
    } catch (error) {
      missingRows.push({
        sourceFileName: row.sourceFileName,
        destinationTopic: row.destinationTopic,
        issue: "json_parse_error",
        path: sourcePath,
        message: error.message,
      });
      continue;
    }

    const questions = Array.isArray(sourceJson.questions) ? sourceJson.questions : [];
    const normalizedQuestions = questions.map(normalizeQuestion);
    normalizedQuestions.forEach((question, index) => {
      questionIssueRows.push(
        ...validateQuestion(question, {
          sourceFileName: row.sourceFileName,
          destinationTopic: row.destinationTopic,
          questionIndex: index + 1,
        })
      );
    });

    const expectedCount = Number(row.questionCount || sourceJson.totalQuestions || 0);
    const countMatches = expectedCount === questions.length;
    const topicSlug = TOPIC_SLUGS[row.destinationTopic] || slugify(row.destinationTopic);
    const targetPathTemplate = `pillarPages/${PILLAR_ID}/subPages/{${PARENT_SLUG}}/nestedSubPages/{${NESTED_SLUG}}/topics/{${topicSlug}}/quizzes/{autoId}`;
    const quizPayload = buildQuizPayload(row, sourceJson, normalizedQuestions);

    quizRows.push({
      sourceFileName: row.sourceFileName,
      destinationTopic: row.destinationTopic,
      topicSlug,
      publicQuizTitle: row.publicQuizTitle,
      slug: row.slug,
      sourceQuestionCount: questions.length,
      expectedQuestionCount: expectedCount,
      countMatches,
      targetPathTemplate,
      destinationPath: sourcePath,
    });

    plannedPayloads.push({
      quiz: quizPayload,
      questionCount: normalizedQuestions.length,
      sampleQuestions: normalizedQuestions.slice(0, 3).map((question, index) => ({
        displayOrder: index + 1,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        questionTypeId: question.questionTypeId,
        sourceQuestionId: question.sourceQuestionId,
        questionSlug: question.questionSlug,
      })),
    });

    const current = topicSummary.get(row.destinationTopic) || {
      destinationTopic: row.destinationTopic,
      topicSlug,
      quizzes: 0,
      questions: 0,
    };
    current.quizzes += 1;
    current.questions += questions.length;
    topicSummary.set(row.destinationTopic, current);
  }

  const duplicateSlugCount = importRows.length - new Set(importRows.map((row) => row.slug)).size;
  const duplicateTitleCount =
    importRows.length - new Set(importRows.map((row) => row.publicQuizTitle)).size;

  const summary = {
    groupSlug: GROUP_SLUG,
    cleanupRoot,
    previewRows: previewRows.length,
    manifestRows: manifestRows.length,
    plannedImportRows: importRows.length,
    excludedRows: excludedRows.length,
    missingOrParseErrorRows: missingRows.length,
    questionIssueRows: questionIssueRows.length,
    duplicateSlugCount,
    duplicateTitleCount,
    totalQuestions: quizRows.reduce((sum, row) => sum + Number(row.sourceQuestionCount || 0), 0),
    outputDir,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-quizzes.csv`), toCsv(quizRows));
  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-topic-summary.csv`), toCsv(Array.from(topicSummary.values()).sort((a, b) => a.destinationTopic.localeCompare(b.destinationTopic))));
  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-question-issues.csv`), toCsv(questionIssueRows));
  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-missing.csv`), toCsv(missingRows));
  fs.writeFileSync(path.join(outputDir, `${GROUP_SLUG}-import-dry-run-payload-samples.json`), JSON.stringify(plannedPayloads.slice(0, 10), null, 2));

  console.log(JSON.stringify(summary, null, 2));

  if (missingRows.length || duplicateSlugCount || duplicateTitleCount) {
    process.exitCode = 1;
  }
}

main();
