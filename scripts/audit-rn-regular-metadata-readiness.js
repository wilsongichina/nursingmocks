const fs = require("fs");
const path = require("path");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\REGULAR";
const PROJECT_ROOT = process.cwd();
const GROUP_SLUG = "rn-regular";
const NESTED_PAGE_SLUG = "rn-nursing-course-exams";
const NESTED_PAGE_NAME = "RN Nursing Course Exams";

const FILES = {
  manifest: path.join(CLEANUP_ROOT, "rn-regular-cleanup-manifest.json"),
  preview: path.join(CLEANUP_ROOT, "rn-regular-normalized-name-preview.csv"),
  qualityIssues: path.join(CLEANUP_ROOT, "rn-regular-question-quality-issues.csv"),
  duplicateSummary: path.join(CLEANUP_ROOT, "rn-regular-duplicate-audit-summary.csv"),
  exactDuplicates: path.join(CLEANUP_ROOT, "rn-regular-exact-content-duplicates.csv"),
  signatureDuplicates: path.join(CLEANUP_ROOT, "rn-regular-question-signature-duplicates.csv"),
  sidebarData: path.join(PROJECT_ROOT, "public", "data", "sidebar-data.json"),
  readinessSummary: path.join(CLEANUP_ROOT, "rn-regular-metadata-readiness-summary.json"),
  readinessTopics: path.join(CLEANUP_ROOT, "rn-regular-metadata-readiness-topics.csv"),
};

const EXPECTED_TOPIC_SLUGS = {
  "Adult Health": "rn-nursing-course-adult-health-practice-questions",
  "Anatomy and Physiology": "rn-nursing-course-anatomy-and-physiology-practice-questions",
  "Community Health": "rn-nursing-course-community-health-practice-questions",
  "Critical Care": "rn-nursing-course-critical-care-practice-questions",
  "Dimensions of Nursing Practice": "rn-nursing-course-dimensions-of-nursing-practice-questions",
  "Dosage Calculations": "rn-nursing-course-dosage-calculations-practice-questions",
  Endocrinology: "rn-nursing-course-endocrinology-practice-questions",
  Fundamentals: "rn-nursing-course-fundamentals-practice-questions",
  "Gastrointestinal System": "rn-nursing-course-gastrointestinal-system-practice-questions",
  "Growth and Development": "rn-nursing-course-growth-and-development-practice-questions",
  "Health Assessment": "rn-nursing-course-health-assessment-practice-questions",
  Leadership: "rn-nursing-course-leadership-practice-questions",
  "Maternal Newborn": "rn-nursing-course-maternal-newborn-practice-questions",
  "Medical Surgical": "rn-nursing-course-medical-surgical-practice-questions",
  "Mental Health": "rn-nursing-course-mental-health-practice-questions",
  Microbiology: "rn-nursing-course-microbiology-practice-questions",
  "Multidimensional Care": "rn-nursing-course-multidimensional-care-practice-questions",
  "Nursing Specialty": "rn-nursing-course-nursing-specialty-practice-questions",
  Nutrition: "rn-nursing-course-nutrition-practice-questions",
  Pathophysiology: "rn-nursing-course-pathophysiology-practice-questions",
  Pediatrics: "rn-nursing-course-pediatrics-practice-questions",
  Perfusion: "rn-nursing-course-perfusion-practice-questions",
  Pharmacology: "rn-nursing-course-pharmacology-practice-questions",
};

const EXPECTED_TOPIC_COUNT = 23;
const EXPECTED_IMPORT_QUIZZES = 334;
const EXPECTED_IMPORT_QUESTIONS = 17837;

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
      } else if (char === '"') quoted = false;
      else value += char;
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
    } else if (char !== "\r") value += char;
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

function readCsvIfExists(filePath) {
  return fs.existsSync(filePath) ? parseCsv(fs.readFileSync(filePath, "utf8")) : [];
}

function findNestedPage(sidebarData) {
  for (const entries of Object.values(sidebarData.modalNestedPages || {})) {
    const match = entries.find((entry) => entry.slug === NESTED_PAGE_SLUG);
    if (match) return match;
  }
  return null;
}

function hasImportDuplicateGroup(rows) {
  const groups = groupBy(rows, (row) => row.duplicateKey);
  return Array.from(groups.values()).some(
    (group) =>
      group.filter(
        (row) => row.destinationTopic && !row.destinationTopic.startsWith("Duplicate Source - Do Not Import")
      ).length > 1
  );
}

function main() {
  const manifest = readJson(FILES.manifest);
  const preview = parseCsv(fs.readFileSync(FILES.preview, "utf8"));
  const qualityIssues = readCsvIfExists(FILES.qualityIssues);
  const duplicateSummary = readCsvIfExists(FILES.duplicateSummary)[0] || {};
  const exactDuplicates = readCsvIfExists(FILES.exactDuplicates);
  const signatureDuplicates = readCsvIfExists(FILES.signatureDuplicates);
  const sidebarData = readJson(FILES.sidebarData);

  const importManifest = manifest.filter((row) => row.action === "import");
  const importPreview = preview.filter((row) => row.action === "import");
  const topicGroups = groupBy(importManifest, (row) => row.destinationTopic);

  const topicRows = Array.from(topicGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([topic, rows]) => ({
      topic,
      slug: EXPECTED_TOPIC_SLUGS[topic] || "",
      files: rows.length,
      questions: rows.reduce((sum, row) => sum + Number(row.questionCount || 0), 0),
      hasExpectedSlug: Boolean(EXPECTED_TOPIC_SLUGS[topic]),
      pageName: topic,
      title: `${topic} Practice Questions`,
      parentNestedPage: NESTED_PAGE_NAME,
      parentNestedSlug: NESTED_PAGE_SLUG,
    }));

  const importTitleDuplicates = Array.from(groupBy(importPreview, (row) => row.publicQuizTitle).entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([title, rows]) => ({ title, count: rows.length }));

  const importSlugDuplicates = Array.from(groupBy(importPreview, (row) => row.slug).entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([slug, rows]) => ({ slug, count: rows.length }));

  const issueGroups = Array.from(
    groupBy(
      qualityIssues.filter((row) => row.action === "import"),
      (row) => row.issue
    ).entries()
  )
    .map(([issue, rows]) => ({ issue, count: rows.length }))
    .sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue));
  const blockingIssues = issueGroups.filter((row) => row.issue !== "missing_explanation");

  const missingExpectedTopics = Object.keys(EXPECTED_TOPIC_SLUGS).filter((topic) => !topicGroups.has(topic));
  const unexpectedTopics = topicRows.filter((row) => !row.hasExpectedSlug).map((row) => row.topic);
  const importReadyQuestions = topicRows.reduce((sum, row) => sum + row.questions, 0);
  const nestedPage = findNestedPage(sidebarData);
  const exactImportDuplicateRows = exactDuplicates.filter((row) => !String(row.destinationTopic || "").startsWith("Duplicate Source - Do Not Import"));
  const signatureImportDuplicateRows = signatureDuplicates.filter((row) => !String(row.destinationTopic || "").startsWith("Duplicate Source - Do Not Import"));

  const checks = [
    {
      name: "23 expected RN Nursing Course Exam topics present",
      pass:
        topicRows.length === EXPECTED_TOPIC_COUNT &&
        missingExpectedTopics.length === 0 &&
        unexpectedTopics.length === 0,
    },
    {
      name: "334 import-ready quizzes",
      pass: importManifest.length === EXPECTED_IMPORT_QUIZZES && importPreview.length === EXPECTED_IMPORT_QUIZZES,
    },
    {
      name: "17837 import-ready questions",
      pass: importReadyQuestions === EXPECTED_IMPORT_QUESTIONS,
    },
    { name: "No duplicate import slugs", pass: importSlugDuplicates.length === 0 },
    { name: "No duplicate import public titles", pass: importTitleDuplicates.length === 0 },
    {
      name: "No exact duplicate content inside import set",
      pass: !hasImportDuplicateGroup(exactDuplicates),
    },
    {
      name: "No question-signature duplicates inside import set",
      pass: !hasImportDuplicateGroup(signatureDuplicates),
    },
    { name: "No blocking question issues remain", pass: blockingIssues.length === 0 },
    {
      name: "Remaining quality issues are explanation-only",
      pass: issueGroups.length === 0 || issueGroups.every((row) => row.issue === "missing_explanation"),
    },
    {
      name: "RN Nursing Course Exams nested page exists locally",
      pass: Boolean(nestedPage && nestedPage.slug === NESTED_PAGE_SLUG && nestedPage.pageName === NESTED_PAGE_NAME),
    },
  ];

  const warnings = [];
  if (nestedPage) {
    if (Number(nestedPage.topicCount || 0) !== EXPECTED_TOPIC_COUNT) {
      warnings.push(`Local sidebar topicCount is ${nestedPage.topicCount || 0}; expected ${EXPECTED_TOPIC_COUNT} after import/backfill.`);
    }
    if (Number(nestedPage.quizCount || 0) !== EXPECTED_IMPORT_QUIZZES) {
      warnings.push(`Local sidebar quizCount is ${nestedPage.quizCount || 0}; expected ${EXPECTED_IMPORT_QUIZZES} after import/backfill.`);
    }
    if (Number(nestedPage.questionCount || 0) !== EXPECTED_IMPORT_QUESTIONS) {
      warnings.push(`Local sidebar questionCount is ${nestedPage.questionCount || 0}; expected ${EXPECTED_IMPORT_QUESTIONS} after import/backfill.`);
    }
  }

  const summary = {
    groupSlug: GROUP_SLUG,
    nestedPageSlug: NESTED_PAGE_SLUG,
    nestedPageName: NESTED_PAGE_NAME,
    readyForImportPreparation: checks.every((check) => check.pass),
    topicCount: topicRows.length,
    importReadyQuizzes: importManifest.length,
    importReadyQuestions,
    importTitleDuplicateCount: importTitleDuplicates.length,
    importSlugDuplicateCount: importSlugDuplicates.length,
    exactDuplicateGroups: Number(duplicateSummary.exactDuplicateGroups || 0),
    questionSignatureDuplicateGroups: Number(duplicateSummary.questionSignatureDuplicateGroups || 0),
    exactImportDuplicateRows: exactImportDuplicateRows.length,
    signatureImportDuplicateRows: signatureImportDuplicateRows.length,
    qualityIssueTypes: issueGroups,
    checks,
    warnings,
    missingExpectedTopics,
    unexpectedTopics,
    localNestedPage: nestedPage,
    outputs: {
      readinessSummary: FILES.readinessSummary,
      readinessTopics: FILES.readinessTopics,
    },
  };

  writeCsv(FILES.readinessTopics, topicRows, [
    "topic",
    "slug",
    "files",
    "questions",
    "hasExpectedSlug",
    "pageName",
    "title",
    "parentNestedPage",
    "parentNestedSlug",
  ]);
  fs.writeFileSync(FILES.readinessSummary, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main();
