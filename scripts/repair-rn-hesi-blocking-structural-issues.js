const fs = require("fs");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\HESI";
const MANIFEST_PATH = `${CLEANUP_ROOT}\\rn-hesi-cleanup-manifest.json`;
const REPORT_PATH = `${CLEANUP_ROOT}\\rn-hesi-structural-repair-report.json`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseOptions(rawOptions) {
  if (!rawOptions) return { parsed: null, changed: false };
  if (typeof rawOptions !== "string") return { parsed: rawOptions, changed: false };
  return { parsed: JSON.parse(rawOptions), changed: false };
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
    return { options: rawOptions, removed: 0 };
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
    return { options: rawOptions, removed: 0 };
  }

  return { options: JSON.stringify(next), removed };
}

function repairFile(row) {
  const json = readJson(row.destinationPath);
  let removedQuestionOptions = 0;
  let removedSubquestionOptions = 0;
  let changed = false;

  for (const question of json.questions || []) {
    const repaired = removeBlankOptionEntries(question.options);
    if (repaired.removed) {
      question.options = repaired.options;
      removedQuestionOptions += repaired.removed;
      changed = true;
    }

    if (Array.isArray(question.subquestions)) {
      for (const subquestion of question.subquestions) {
        const repairedSub = removeBlankOptionEntries(subquestion.choices);
        if (repairedSub.removed) {
          subquestion.choices = repairedSub.options;
          removedSubquestionOptions += repairedSub.removed;
          changed = true;
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
    destinationPath: row.destinationPath,
  };
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const report = manifest
    .filter((row) => row.action === "import")
    .map(repairFile)
    .filter((row) => row.changed);

  const summary = {
    repairedFiles: report.length,
    removedQuestionOptions: report.reduce((sum, row) => sum + row.removedQuestionOptions, 0),
    removedSubquestionOptions: report.reduce((sum, row) => sum + row.removedSubquestionOptions, 0),
    report,
  };

  writeJson(REPORT_PATH, summary);
  console.log(JSON.stringify(summary, null, 2));
}

main();
