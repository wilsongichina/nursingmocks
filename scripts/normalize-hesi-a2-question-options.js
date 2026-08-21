const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLAR_ID = "nursing-entrance-exam";
const HESI_A2_SUBPAGE_ID = "rdYGUZ9DzFvAmo6EsrVe";
const APPLY = process.argv.includes("--apply");
const BATCH_LIMIT = 450;

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
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
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
  throw new Error("Firebase Admin credentials are not configured.");
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

function sameArray(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]);
}

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();
  const parentRef = db.collection("pillarPages").doc(PILLAR_ID).collection("subPages").doc(HESI_A2_SUBPAGE_ID);
  const nestedSnap = await parentRef.collection("nestedSubPages").get();

  let batch = db.batch();
  let pending = 0;
  const report = {
    mode: APPLY ? "apply" : "dry-run",
    totalQuestions: 0,
    alreadyArray: 0,
    converted: 0,
    skippedNoOptions: 0,
    skippedTooFewOptions: 0,
    byNestedPage: {},
    samples: [],
  };

  async function commitIfNeeded(force = false) {
    if (!APPLY || pending === 0) return;
    if (!force && pending < BATCH_LIMIT) return;
    await batch.commit();
    batch = db.batch();
    pending = 0;
  }

  for (const nestedDoc of nestedSnap.docs) {
    const nested = nestedDoc.data();
    const nestedName = nested.pageName || nested.title || nested.slug || nestedDoc.id;
    const quizSnap = await nestedDoc.ref.collection("quizzes").get();
    for (const quizDoc of quizSnap.docs) {
      const quiz = quizDoc.data();
      const quizName = quiz.title || quiz.pageName || quiz.slug || quizDoc.id;
      const questionSnap = await quizDoc.ref.collection("questions").get();
      for (const questionDoc of questionSnap.docs) {
        const question = questionDoc.data();
        report.totalQuestions += 1;
        report.byNestedPage[nestedName] = report.byNestedPage[nestedName] || { total: 0, converted: 0, skipped: 0 };
        report.byNestedPage[nestedName].total += 1;

        const normalized = normalizeOptions(question.options);
        if (sameArray(question.options, normalized)) {
          report.alreadyArray += 1;
          continue;
        }
        if (!question.options) {
          report.skippedNoOptions += 1;
          report.byNestedPage[nestedName].skipped += 1;
          continue;
        }
        if (normalized.length < 2 && Number(question.questionTypeId || question.question_type_id || 1) === 1) {
          report.skippedTooFewOptions += 1;
          report.byNestedPage[nestedName].skipped += 1;
          continue;
        }

        report.converted += 1;
        report.byNestedPage[nestedName].converted += 1;
        if (report.samples.length < 10) {
          report.samples.push({ nested: nestedName, quiz: quizName, questionId: questionDoc.id, beforeType: Array.isArray(question.options) ? "array" : typeof question.options, after: normalized });
        }

        if (APPLY) {
          batch.update(questionDoc.ref, {
            options: normalized,
            lastUpdated: new Date().toISOString(),
            migrationNotes: FieldValue.arrayUnion("Normalized HESI A2 options to the standard string-array quiz format."),
          });
          pending += 1;
          await commitIfNeeded();
        }
      }
    }
  }

  await commitIfNeeded(true);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
