const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const CLEANUP_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\HESI";
const EXTRA_REPORT = path.join(CLEANUP_ROOT, "rn-hesi-extra-live-quizzes.json");
const DELETE_REPORT = path.join(CLEANUP_ROOT, "rn-hesi-extra-live-quizzes-delete-report.json");
const APPLY = process.argv.includes("--apply");

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
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getFirestore();
}

async function deleteCollection(collectionRef, batchSize = 400) {
  let deleted = 0;
  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = collectionRef.firestore.batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      deleted += 1;
    }
    await batch.commit();
  }
  return deleted;
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const report = JSON.parse(fs.readFileSync(EXTRA_REPORT, "utf8"));
  const results = [];

  for (const extra of report.extras || []) {
    const quizRef = db.doc(extra.refPath);
    const doc = await quizRef.get();
    const existsBefore = doc.exists;
    let deletedQuestions = 0;
    let deletedQuiz = false;

    if (APPLY && existsBefore) {
      deletedQuestions = await deleteCollection(quizRef.collection("questions"));
      await quizRef.delete();
      deletedQuiz = true;
    }

    results.push({
      topicName: extra.topicName,
      quizId: extra.quizId,
      slug: extra.slug,
      title: extra.title,
      expectedQuestionCount: extra.questionCount,
      existsBefore,
      deletedQuestions,
      deletedQuiz,
      refPath: extra.refPath,
    });
  }

  const summary = {
    mode: APPLY ? "apply" : "dry-run",
    plannedDeletes: results.length,
    deletedQuizzes: results.filter((row) => row.deletedQuiz).length,
    deletedQuestions: results.reduce((sum, row) => sum + row.deletedQuestions, 0),
    results,
  };
  fs.writeFileSync(DELETE_REPORT, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
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
