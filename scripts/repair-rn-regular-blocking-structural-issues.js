const fs = require("fs");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\REGULAR";
const MANIFEST_PATH = `${CLEANUP_ROOT}\\rn-regular-cleanup-manifest.json`;
const REPORT_PATH = `${CLEANUP_ROOT}\\rn-regular-structural-repair-report.json`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseOptions(rawOptions) {
  if (!rawOptions) return { parsed: null };
  if (typeof rawOptions !== "string") return { parsed: rawOptions };
  return { parsed: JSON.parse(rawOptions) };
}

function isBlankChoice(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "object" && "choice" in value) {
    return value.choice === null || value.choice === undefined || String(value.choice).trim() === "";
  }
  return false;
}

function removeBlankOptionEntries(rawOptions) {
  const { parsed } = parseOptions(rawOptions);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    return { options: rawOptions, removed: 0, remaining: Array.isArray(parsed) ? parsed.length : 0 };
  }

  const next = {};
  let removed = 0;

  for (const [key, value] of Object.entries(parsed)) {
    if (isBlankChoice(value)) {
      removed += 1;
      continue;
    }

    next[key] = value;
  }

  if (!removed) {
    return { options: rawOptions, removed: 0, remaining: Object.keys(parsed).length };
  }

  return {
    options: JSON.stringify(next),
    removed,
    remaining: Object.keys(next).length,
  };
}

function repairFile(row) {
  const json = readJson(row.destinationPath);
  let removedQuestionOptions = 0;
  let removedSubquestionOptions = 0;
  let changed = false;
  const warnings = [];

  for (const [index, question] of (json.questions || []).entries()) {
    const repaired = removeBlankOptionEntries(question.options);
    if (repaired.removed) {
      question.options = repaired.options;
      removedQuestionOptions += repaired.removed;
      changed = true;

      if (repaired.remaining < 2) {
        warnings.push({
          questionNumber: index + 1,
          sourceQuestionId: question.id || question.questionId || "",
          warning: "question_has_fewer_than_two_options_after_repair",
          remainingOptions: repaired.remaining,
        });
      }
    }

    if (Array.isArray(question.subquestions)) {
      for (const [subIndex, subquestion] of question.subquestions.entries()) {
        const repairedSub = removeBlankOptionEntries(subquestion.choices);
        if (repairedSub.removed) {
          subquestion.choices = repairedSub.options;
          removedSubquestionOptions += repairedSub.removed;
          changed = true;

          if (repairedSub.remaining < 2) {
            warnings.push({
              questionNumber: index + 1,
              subquestionNumber: subIndex + 1,
              sourceQuestionId: question.id || question.questionId || "",
              warning: "subquestion_has_fewer_than_two_options_after_repair",
              remainingOptions: repairedSub.remaining,
            });
          }
        }
      }
    }
  }

  if (changed) {
    writeJson(row.destinationPath, json);
  }

  return {
    action: row.action,
    destinationTopic: row.destinationTopic,
    sourceFileName: row.sourceFileName,
    changed,
    removedQuestionOptions,
    removedSubquestionOptions,
    warnings,
    destinationPath: row.destinationPath,
  };
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const report = manifest
    .filter((row) => row.action === "import")
    .map(repairFile)
    .filter((row) => row.changed || row.warnings.length);

  const summary = {
    repairedFiles: report.filter((row) => row.changed).length,
    removedQuestionOptions: report.reduce((sum, row) => sum + row.removedQuestionOptions, 0),
    removedSubquestionOptions: report.reduce((sum, row) => sum + row.removedSubquestionOptions, 0),
    warningCount: report.reduce((sum, row) => sum + row.warnings.length, 0),
    report,
  };

  writeJson(REPORT_PATH, summary);
  console.log(JSON.stringify(summary, null, 2));
}

main();
