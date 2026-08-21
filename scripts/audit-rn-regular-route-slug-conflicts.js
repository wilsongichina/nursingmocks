const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\REGULAR";
const PREVIEW_PATH = path.join(CLEANUP_ROOT, "rn-regular-normalized-name-preview.csv");
const TOPICS_PATH = path.join(CLEANUP_ROOT, "rn-regular-metadata-readiness-topics.csv");
const OUTPUT_PATH = path.join(CLEANUP_ROOT, "rn-regular-route-slug-conflicts.csv");
const SUMMARY_PATH = path.join(CLEANUP_ROOT, "rn-regular-route-slug-conflicts-summary.json");

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

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();

  throw new Error("Firebase admin credentials were not found.");
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

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();

  const previewRows = parseCsv(fs.readFileSync(PREVIEW_PATH, "utf8")).filter((row) => row.action === "import");
  const topicRows = parseCsv(fs.readFileSync(TOPICS_PATH, "utf8"));
  const plannedRows = [
    ...topicRows.map((row) => ({
      plannedType: "topic",
      plannedName: row.topic,
      plannedSlug: row.slug,
    })),
    ...previewRows.map((row) => ({
      plannedType: "quiz",
      plannedName: row.publicQuizTitle,
      plannedSlug: row.slug,
    })),
  ];

  const routeMappingsSnapshot = await db.collection("routeMappings").get();
  const mappingsBySlug = new Map();

  for (const doc of routeMappingsSnapshot.docs) {
    const mapping = { id: doc.id, ...doc.data() };
    const slug = String(mapping.slug || "");
    if (!slug) continue;
    if (!mappingsBySlug.has(slug)) mappingsBySlug.set(slug, []);
    mappingsBySlug.get(slug).push(mapping);
  }

  const conflicts = [];
  for (const planned of plannedRows) {
    const mappings = mappingsBySlug.get(planned.plannedSlug) || [];
    for (const mapping of mappings) {
      conflicts.push({
        ...planned,
        existingRouteMappingId: mapping.id,
        existingType: mapping.type || "",
        existingPillarId: mapping.pillarId || "",
        existingSubPageId: mapping.subPageId || "",
        existingNestedPageId: mapping.nestedPageId || "",
        existingTopicId: mapping.topicId || "",
        existingQuizId: mapping.quizId || "",
        existingRefPath: mapping.refPath || mapping.contentPath || "",
      });
    }
  }

  writeCsv(OUTPUT_PATH, conflicts, [
    "plannedType",
    "plannedName",
    "plannedSlug",
    "existingRouteMappingId",
    "existingType",
    "existingPillarId",
    "existingSubPageId",
    "existingNestedPageId",
    "existingTopicId",
    "existingQuizId",
    "existingRefPath",
  ]);

  const summary = {
    plannedTopicSlugs: topicRows.length,
    plannedQuizSlugs: previewRows.length,
    plannedTotalSlugs: plannedRows.length,
    existingRouteMappingsChecked: routeMappingsSnapshot.size,
    conflictRows: conflicts.length,
    topicConflictRows: conflicts.filter((row) => row.plannedType === "topic").length,
    quizConflictRows: conflicts.filter((row) => row.plannedType === "quiz").length,
    outputPath: OUTPUT_PATH,
  };
  fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));

  if (conflicts.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
