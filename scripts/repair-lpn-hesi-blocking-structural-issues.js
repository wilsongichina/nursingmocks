const fs = require("fs");

const CLEANUP_ROOT =
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\LPN\\HESI";
const MANIFEST_PATH = `${CLEANUP_ROOT}\\lpn-hesi-cleanup-manifest.json`;
const REPORT_PATH = `${CLEANUP_ROOT}\\lpn-hesi-structural-repair-report.json`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseOptions(rawOptions) {
  if (!rawOptions) return null;
  if (typeof rawOptions !== "string") return rawOptions;
  return JSON.parse(rawOptions);
}

function normalizeAnswer(value) {
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

function getChoiceText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "choice" in value) return String(value.choice || "");
  return String(value || "");
}

function isBlankChoice(value) {
  return getChoiceText(value).trim() === "";
}

function repairOptions(rawOptions) {
  const parsed = parseOptions(rawOptions);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    return {
      options: rawOptions,
      changed: false,
      removedKeys: [],
      remainingKeys: parsed && typeof parsed === "object" ? Object.keys(parsed) : [],
      remainingCount: 0,
    };
  }

  const next = {};
  const removedKeys = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (isBlankChoice(value)) {
      removedKeys.push(key);
      continue;
    }

    next[key] = value;
  }

  return {
    options: removedKeys.length ? JSON.stringify(next) : rawOptions,
    changed: removedKeys.length > 0,
    removedKeys,
    remainingKeys: Object.keys(next),
    remainingCount: Object.keys(next).length,
  };
}

function repairFile(row) {
  const data = readJson(row.destinationPath);
  const repairs = [];
  const validationIssues = [];
  let changed = false;

  for (const [index, question] of (data.questions || []).entries()) {
    const repaired = repairOptions(question.options);
    if (!repaired.changed) continue;

    const correctAnswers = normalizeAnswer(question.correctAnswer ?? question.correct_answer);
    const removedCorrectAnswerKeys = correctAnswers.filter((answer) =>
      repaired.removedKeys.includes(answer)
    );

    if (repaired.remainingCount < 2) {
      validationIssues.push({
        sourceQuestionId: question.id || question.questionId || "",
        questionNumber: index + 1,
        issue: "too_few_options_after_blank_removal",
        remainingCount: repaired.remainingCount,
      });
    }

    if (removedCorrectAnswerKeys.length) {
      validationIssues.push({
        sourceQuestionId: question.id || question.questionId || "",
        questionNumber: index + 1,
        issue: "correct_answer_removed_with_blank_option",
        removedCorrectAnswerKeys,
      });
    }

    question.options = repaired.options;
    changed = true;
    repairs.push({
      sourceQuestionId: question.id || question.questionId || "",
      questionNumber: index + 1,
      removedBlankOptionKeys: repaired.removedKeys,
      remainingOptionKeys: repaired.remainingKeys,
      remainingOptionCount: repaired.remainingCount,
      correctAnswers,
    });
  }

  if (changed && validationIssues.length === 0) {
    writeJson(row.destinationPath, data);
  }

  return {
    action: row.action,
    destinationTopic: row.destinationTopic,
    sourceFileName: row.sourceFileName,
    changed,
    written: changed && validationIssues.length === 0,
    repairs,
    validationIssues,
    destinationPath: row.destinationPath,
  };
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const fileReports = manifest
    .filter((row) => row.action === "import")
    .map(repairFile)
    .filter((row) => row.changed || row.validationIssues.length);

  const validationIssues = fileReports.flatMap((row) =>
    row.validationIssues.map((issue) => ({
      destinationTopic: row.destinationTopic,
      sourceFileName: row.sourceFileName,
      ...issue,
    }))
  );

  const summary = {
    repairedFiles: fileReports.filter((row) => row.written).length,
    filesWithValidationIssues: fileReports.filter((row) => row.validationIssues.length).length,
    removedQuestionOptions: fileReports.reduce(
      (sum, row) =>
        sum +
        row.repairs.reduce(
          (innerSum, repair) => innerSum + repair.removedBlankOptionKeys.length,
          0
        ),
      0
    ),
    validationIssueCount: validationIssues.length,
    validationIssues,
    fileReports,
  };

  writeJson(REPORT_PATH, summary);
  console.log(JSON.stringify(summary, null, 2));

  if (validationIssues.length) {
    process.exitCode = 1;
  }
}

main();
