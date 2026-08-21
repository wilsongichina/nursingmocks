const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[key] = value;
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [rawHeaders, ...records] = rows;
  const headers = rawHeaders ? rawHeaders.map((header) => header.replace(/^\uFEFF/, "")) : rawHeaders;
  if (!headers) return [];

  return records
    .filter((record) => record.some((entry) => entry !== ""))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOptions(rawOptions) {
  if (!rawOptions) return { options: [], parseError: "" };

  try {
    const parsed = typeof rawOptions === "string" ? JSON.parse(rawOptions) : rawOptions;
    if (Array.isArray(parsed)) {
      return {
        options: parsed.map((value, index) => ({
          key: String(index + 1),
          choice: String(value || "").trim(),
          reason: "",
        })),
        parseError: "",
      };
    }

    if (parsed && typeof parsed === "object") {
      return {
        options: Object.keys(parsed)
          .sort()
          .map((key) => {
            const value = parsed[key];
            if (value && typeof value === "object") {
              return {
                key,
                choice: String(value.choice || "").trim(),
                reason: String(value.reason || "").trim(),
              };
            }

            return {
              key,
              choice: String(value || "").trim(),
              reason: "",
            };
          }),
        parseError: "",
      };
    }

    return { options: [], parseError: "options_not_object_or_array" };
  } catch (error) {
    return { options: [], parseError: `options_parse_error:${error.message}` };
  }
}

function normalizeCorrectAnswer(question) {
  const value = question.correctAnswer ?? question.correct_answer ?? "";
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  const text = String(value || "").trim();
  if (!text) return [];

  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [text];
    }
  }

  return [text];
}

function hasAnsweredSubquestions(question) {
  if (!Array.isArray(question.subquestions) || question.subquestions.length === 0) {
    return false;
  }

  return question.subquestions.every((subquestion) => {
    const answer = subquestion.answer ?? subquestion.correctAnswer ?? subquestion.correct_answer ?? subquestion.correct_choice ?? "";
    if (Array.isArray(answer)) return answer.length > 0;
    return String(answer || "").trim().length > 0;
  });
}

function auditQuestion({ question, index, row }) {
  const issues = [];
  const questionText = question.question || question.questionText || question.text || question.stem || question.prompt || "";
  const cleanQuestion = stripHtml(questionText);
  const questionTypeId = Number(question.question_type_id || question.questionTypeId || 1);
  const { options, parseError } = parseOptions(question.options);
  const correctAnswer = normalizeCorrectAnswer(question);
  const hasSubquestionAnswers = hasAnsweredSubquestions(question);
  const explanation = question.solution || question.explanation || "";
  const sourceQuestionId = String(question.id || question.questionId || "");

  if (!questionText) issues.push("missing_question_html");
  if (!cleanQuestion) issues.push("missing_clean_question_text");
  if (!Number.isFinite(questionTypeId)) issues.push("invalid_question_type_id");
  if (parseError) issues.push(parseError);
  if (!correctAnswer.length && !hasSubquestionAnswers) issues.push("missing_correct_answer");

  if ([1, 2, 3].includes(questionTypeId)) {
    if (options.length < 2) issues.push("too_few_options");
    if (options.some((option) => !stripHtml(option.choice))) issues.push("empty_option_text");
  }

  if (!explanation || !stripHtml(explanation)) issues.push("missing_explanation");

  return issues.map((issue) => ({
    issue,
    action: row.action,
    destinationTopic: row.destinationTopic,
    sourceFolder: row.sourceFolder,
    sourceFileName: row.sourceFileName,
    questionNumber: index + 1,
    sourceQuestionId,
    questionTypeId,
    questionPreview: cleanQuestion.slice(0, 180),
    destinationPath: row.destinationPath,
  }));
}

function main() {
  const args = parseArgs(process.argv);
  const cleanupRoot = args.cleanupRoot;
  const manifestPath = args.manifestPath;
  const groupSlug = args.groupSlug;

  if (!cleanupRoot || !manifestPath || !groupSlug) {
    throw new Error("Usage: node scripts/audit-nursing-test-bank-question-quality.js --cleanupRoot <path> --manifestPath <path> --groupSlug <slug>");
  }

  const manifest = manifestPath.toLowerCase().endsWith(".json")
    ? readJson(manifestPath)
    : parseCsv(fs.readFileSync(manifestPath, "utf8"));
  const issues = [];
  const fileRows = [];

  for (const row of manifest) {
    if (row.action === "exclude") continue;

    const filePath = row.destinationPath;
    let json;
    let parseStatus = "ok";
    let questions = [];
    let declaredTotal = Number(row.questionCount || 0);

    try {
      json = readJson(filePath);
      questions = Array.isArray(json.questions) ? json.questions : [];
      declaredTotal = Number(json.totalQuestions || json.questionsToShow || row.questionCount || 0);
    } catch (error) {
      parseStatus = `parse_error:${error.message}`;
      issues.push({
        issue: parseStatus,
        action: row.action,
        destinationTopic: row.destinationTopic,
        sourceFolder: row.sourceFolder,
        sourceFileName: row.sourceFileName,
        questionNumber: "",
        sourceQuestionId: "",
        questionTypeId: "",
        questionPreview: "",
        destinationPath: filePath,
      });
    }

    if (parseStatus === "ok") {
      if (!Array.isArray(json.questions)) {
        issues.push({
          issue: "missing_questions_array",
          action: row.action,
          destinationTopic: row.destinationTopic,
          sourceFolder: row.sourceFolder,
          sourceFileName: row.sourceFileName,
          questionNumber: "",
          sourceQuestionId: "",
          questionTypeId: "",
          questionPreview: "",
          destinationPath: filePath,
        });
      }

      if (Number.isFinite(declaredTotal) && declaredTotal !== questions.length) {
        issues.push({
          issue: `declared_count_mismatch:${declaredTotal}_vs_${questions.length}`,
          action: row.action,
          destinationTopic: row.destinationTopic,
          sourceFolder: row.sourceFolder,
          sourceFileName: row.sourceFileName,
          questionNumber: "",
          sourceQuestionId: "",
          questionTypeId: "",
          questionPreview: "",
          destinationPath: filePath,
        });
      }

      questions.forEach((question, index) => {
        issues.push(...auditQuestion({ question, index, row }));
      });
    }

    fileRows.push({
      action: row.action,
      destinationTopic: row.destinationTopic,
      sourceFileName: row.sourceFileName,
      parseStatus,
      declaredQuestionCount: declaredTotal,
      actualQuestionCount: questions.length,
      fileIssueCount: issues.filter((issue) => issue.sourceFileName === row.sourceFileName && issue.destinationPath === filePath).length,
      destinationPath: filePath,
    });
  }

  const issueCounts = new Map();
  for (const issue of issues) {
    const current = issueCounts.get(issue.issue) || { issue: issue.issue, count: 0 };
    current.count += 1;
    issueCounts.set(issue.issue, current);
  }

  const summaryRows = Array.from(issueCounts.values()).sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue));
  const importReadyIssues = issues.filter((issue) => issue.action === "import");

  const outputIssues = path.join(cleanupRoot, `${groupSlug}-question-quality-issues.csv`);
  const outputFileSummary = path.join(cleanupRoot, `${groupSlug}-question-quality-file-summary.csv`);
  const outputSummary = path.join(cleanupRoot, `${groupSlug}-question-quality-summary.csv`);

  writeCsv(outputIssues, issues, [
    "issue",
    "action",
    "destinationTopic",
    "sourceFolder",
    "sourceFileName",
    "questionNumber",
    "sourceQuestionId",
    "questionTypeId",
    "questionPreview",
    "destinationPath",
  ]);

  writeCsv(outputFileSummary, fileRows, [
    "action",
    "destinationTopic",
    "sourceFileName",
    "parseStatus",
    "declaredQuestionCount",
    "actualQuestionCount",
    "fileIssueCount",
    "destinationPath",
  ]);

  writeCsv(outputSummary, [
    {
      groupSlug,
      auditedFiles: fileRows.length,
      importReadyFiles: fileRows.filter((row) => row.action === "import").length,
      auditedQuestions: fileRows.reduce((sum, row) => sum + Number(row.actualQuestionCount || 0), 0),
      importReadyIssues: importReadyIssues.length,
      totalIssues: issues.length,
      issueTypes: summaryRows.map((row) => `${row.issue}:${row.count}`).join("; "),
    },
  ], [
    "groupSlug",
    "auditedFiles",
    "importReadyFiles",
    "auditedQuestions",
    "importReadyIssues",
    "totalIssues",
    "issueTypes",
  ]);

  console.log(JSON.stringify({
    groupSlug,
    auditedFiles: fileRows.length,
    importReadyFiles: fileRows.filter((row) => row.action === "import").length,
    auditedQuestions: fileRows.reduce((sum, row) => sum + Number(row.actualQuestionCount || 0), 0),
    importReadyIssues: importReadyIssues.length,
    totalIssues: issues.length,
    outputIssues,
    outputFileSummary,
    outputSummary,
    issueTypes: summaryRows,
  }, null, 2));
}

main();
