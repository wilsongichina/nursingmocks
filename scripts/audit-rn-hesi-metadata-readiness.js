const fs = require("fs");
const path = require("path");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\HESI";
const GROUP_SLUG = "rn-hesi";

const FILES = {
  manifest: path.join(CLEANUP_ROOT, "rn-hesi-cleanup-manifest.json"),
  preview: path.join(CLEANUP_ROOT, "rn-hesi-normalized-name-preview.csv"),
  qualityIssues: path.join(CLEANUP_ROOT, "rn-hesi-question-quality-issues.csv"),
  duplicateSummary: path.join(CLEANUP_ROOT, "rn-hesi-duplicate-audit-summary.csv"),
  readinessSummary: path.join(CLEANUP_ROOT, "rn-hesi-metadata-readiness-summary.json"),
  readinessTopics: path.join(CLEANUP_ROOT, "rn-hesi-metadata-readiness-topics.csv"),
};

const EXPECTED_TOPIC_SLUGS = {
  "Adult Health": "hesi-rn-adult-health-practice-questions",
  Biology: "hesi-rn-biology-practice-questions",
  Capstone: "hesi-rn-capstone-practice-questions",
  CAT: "hesi-rn-cat-practice-questions",
  "Community Health": "hesi-rn-community-health-practice-questions",
  "Dosage Calculations": "hesi-rn-dosage-calculations-practice-questions",
  Fundamentals: "hesi-rn-fundamentals-practice-questions",
  "Health Assessment": "hesi-rn-health-assessment-practice-questions",
  "Information Technology in Nursing": "hesi-rn-information-technology-in-nursing-practice-questions",
  Leadership: "hesi-rn-leadership-practice-questions",
  Management: "hesi-rn-management-practice-questions",
  Maternity: "hesi-rn-maternity-practice-questions",
  "Medical Surgical": "hesi-rn-medical-surgical-practice-questions",
  "Mental Health": "hesi-rn-mental-health-practice-questions",
  Milestones: "hesi-rn-milestones-practice-questions",
  "Nursing Research": "hesi-rn-nursing-research-practice-questions",
  Nutrition: "hesi-rn-nutrition-practice-questions",
  Pathophysiology: "hesi-rn-pathophysiology-practice-questions",
  "Pediatric Nursing": "hesi-rn-pediatric-nursing-practice-questions",
  Pharmacology: "hesi-rn-pharmacology-practice-questions",
  Specialty: "hesi-rn-specialty-practice-questions",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
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

    if (char === '"') quoted = true;
    else if (char === ",") {
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
  const headers = rawHeaders ? rawHeaders.map((header) => header.replace(/^\uFEFF/, "")) : [];
  return records
    .filter((record) => record.some((entry) => entry !== ""))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function groupBy(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function main() {
  const manifest = readJson(FILES.manifest);
  const preview = parseCsv(fs.readFileSync(FILES.preview, "utf8"));
  const qualityIssues = fs.existsSync(FILES.qualityIssues)
    ? parseCsv(fs.readFileSync(FILES.qualityIssues, "utf8"))
    : [];
  const duplicateSummary = parseCsv(fs.readFileSync(FILES.duplicateSummary, "utf8"))[0] || {};

  const importManifest = manifest.filter((row) => row.action === "import");
  const importPreview = preview.filter((row) => row.action === "import");
  const duplicatePreview = preview.filter((row) => row.action === "duplicate");
  const topicGroups = groupBy(importManifest, (row) => row.destinationTopic);

  const topicRows = Array.from(topicGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([topic, rows]) => ({
      topic,
      slug: EXPECTED_TOPIC_SLUGS[topic] || "",
      files: rows.length,
      questions: rows.reduce((sum, row) => sum + Number(row.questionCount || 0), 0),
      hasExpectedSlug: Boolean(EXPECTED_TOPIC_SLUGS[topic]),
    }));

  const importTitleDuplicates = Array.from(groupBy(importPreview, (row) => row.publicQuizTitle).entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([title, rows]) => ({ title, count: rows.length }));

  const importSlugDuplicates = Array.from(groupBy(importPreview, (row) => row.slug).entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([slug, rows]) => ({ slug, count: rows.length }));

  const issueGroups = Array.from(groupBy(qualityIssues.filter((row) => row.action === "import"), (row) => row.issue).entries())
    .map(([issue, rows]) => ({ issue, count: rows.length }))
    .sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue));
  const blockingIssues = issueGroups.filter((row) => row.issue !== "missing_explanation");

  const missingExpectedTopics = Object.keys(EXPECTED_TOPIC_SLUGS).filter((topic) => !topicGroups.has(topic));
  const unexpectedTopics = topicRows.filter((row) => !row.hasExpectedSlug).map((row) => row.topic);

  const checks = [
    { name: "21 expected public topics present", pass: topicRows.length === 21 && missingExpectedTopics.length === 0 && unexpectedTopics.length === 0 },
    { name: "150 import-ready quizzes", pass: importManifest.length === 150 && importPreview.length === 150 },
    { name: "7827 import-ready questions", pass: topicRows.reduce((sum, row) => sum + row.questions, 0) === 7827 },
    { name: "1 duplicate/do-not-import row remains excluded", pass: duplicatePreview.length === 1 && manifest.filter((row) => row.action === "duplicate").length === 1 },
    { name: "No duplicate import slugs", pass: importSlugDuplicates.length === 0 },
    { name: "No duplicate import public titles", pass: importTitleDuplicates.length === 0 },
    { name: "No exact duplicate content groups", pass: Number(duplicateSummary.exactDuplicateGroups || 0) === 0 },
    { name: "No question-signature duplicate groups", pass: Number(duplicateSummary.questionSignatureDuplicateGroups || 0) === 0 },
    { name: "No blocking question issues remain", pass: blockingIssues.length === 0 },
    { name: "Remaining quality issues are explanation-only", pass: issueGroups.length === 0 || issueGroups.every((row) => row.issue === "missing_explanation") },
  ];

  const summary = {
    groupSlug: GROUP_SLUG,
    readyForImportPreparation: checks.every((check) => check.pass),
    topicCount: topicRows.length,
    importReadyQuizzes: importManifest.length,
    importReadyQuestions: topicRows.reduce((sum, row) => sum + row.questions, 0),
    duplicateDoNotImportRows: manifest.filter((row) => row.action === "duplicate").length,
    importTitleDuplicateCount: importTitleDuplicates.length,
    importSlugDuplicateCount: importSlugDuplicates.length,
    qualityIssueTypes: issueGroups,
    duplicateSummary,
    checks,
    missingExpectedTopics,
    unexpectedTopics,
    outputs: {
      readinessSummary: FILES.readinessSummary,
      readinessTopics: FILES.readinessTopics,
    },
  };

  writeCsv(FILES.readinessTopics, topicRows, ["topic", "slug", "files", "questions", "hasExpectedSlug"]);
  fs.writeFileSync(FILES.readinessSummary, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main();
