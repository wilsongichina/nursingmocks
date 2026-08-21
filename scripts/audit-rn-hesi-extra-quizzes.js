const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\HESI";
const PREVIEW_PATH = path.join(CLEANUP_ROOT, "rn-hesi-normalized-name-preview.csv");
const OUTPUT_PATH = path.join(CLEANUP_ROOT, "rn-hesi-extra-live-quizzes.json");
const TOPICS_PATH = path.join(CLEANUP_ROOT, "rn-hesi-metadata-readiness-topics.csv");
const PARENT_ID = "SuT1noZoNGEjKGR1vTbi";
const NESTED_ID = "iT55qp9NAFOvZLBAiQzC";
const PILLAR_ID = "nursing-test-bank";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function getDb() {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
      });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getFirestore();
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
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, ""));
  return records
    .filter((record) => record.some((entry) => entry !== ""))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const expectedRows = parseCsv(fs.readFileSync(PREVIEW_PATH, "utf8")).filter((row) => row.action === "import");
  const topicRows = parseCsv(fs.readFileSync(TOPICS_PATH, "utf8"));
  const expectedByTopic = new Map();
  const topicNameBySlug = new Map(topicRows.map((row) => [row.slug, row.topic]));

  for (const row of expectedRows) {
    const topicSlug = topicRows.find((topicRow) => topicRow.topic === row.destinationTopic)?.slug;
    if (!topicSlug) continue;
    if (!expectedByTopic.has(topicSlug)) expectedByTopic.set(topicSlug, new Set());
    expectedByTopic.get(topicSlug).add(row.slug);
  }

  const nestedRef = db
    .collection("pillarPages")
    .doc(PILLAR_ID)
    .collection("subPages")
    .doc(PARENT_ID)
    .collection("nestedSubPages")
    .doc(NESTED_ID);
  const topicsSnapshot = await nestedRef.collection("topics").get();
  const extras = [];

  for (const topicDoc of topicsSnapshot.docs) {
    const topic = topicDoc.data();
    const topicSlug = topic.slug || topic.seoSlug || "";
    if (!expectedByTopic.has(topicSlug)) continue;
    const topicName = topicNameBySlug.get(topicSlug) || topic.pageName || topic.title || topic.name || topicSlug;

    const expectedSlugs = expectedByTopic.get(topicSlug);
    const quizzesSnapshot = await topicDoc.ref.collection("quizzes").get();
    for (const quizDoc of quizzesSnapshot.docs) {
      const quiz = quizDoc.data();
      const slug = quiz.slug || quiz.seoSlug || "";
      if (expectedSlugs.has(slug)) continue;
      const countSnapshot = await quizDoc.ref.collection("questions").count().get();
      extras.push({
        topicName,
        topicId: topicDoc.id,
        quizId: quizDoc.id,
        slug,
        title: quiz.title || quiz.pageName || "",
        questionCount: countSnapshot.data().count,
        refPath: quizDoc.ref.path,
      });
    }
  }

  const summary = {
    extraQuizCount: extras.length,
    extraQuestionCount: extras.reduce((sum, row) => sum + row.questionCount, 0),
    extras,
  };
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(getApps().map((app) => app.delete()));
  });
