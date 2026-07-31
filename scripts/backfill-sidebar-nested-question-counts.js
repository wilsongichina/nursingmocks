const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLAR_IDS = [
  "nursing-entrance-exam",
  "nursing-exit-exam",
  "nursing-test-bank",
];

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

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  throw new Error("Firebase Admin credentials are not configured.");
}

function getDb() {
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

async function collectionSize(collectionRef) {
  const snapshot = await collectionRef.get();
  return snapshot.size;
}

async function countQuizQuestions(quizRef) {
  return collectionSize(quizRef.collection("questions"));
}

async function countEntranceOrExitNestedQuestions(nestedRef) {
  const quizzesSnapshot = await nestedRef.collection("quizzes").get();
  let questionCount = 0;

  for (const quizDoc of quizzesSnapshot.docs) {
    questionCount += await countQuizQuestions(quizDoc.ref);
  }

  return {
    quizCount: quizzesSnapshot.size,
    questionCount,
  };
}

async function countTestBankNestedQuestions(nestedRef) {
  const topicsSnapshot = await nestedRef.collection("topics").get();
  let quizCount = 0;
  let questionCount = 0;

  for (const topicDoc of topicsSnapshot.docs) {
    const quizzesSnapshot = await topicDoc.ref.collection("quizzes").get();
    quizCount += quizzesSnapshot.size;

    for (const quizDoc of quizzesSnapshot.docs) {
      questionCount += await countQuizQuestions(quizDoc.ref);
    }
  }

  return {
    topicCount: topicsSnapshot.size,
    quizCount,
    questionCount,
  };
}

function changedFields(current, next) {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => current[key] !== value)
  );
}

async function main() {
  loadLocalEnv();

  const apply = process.argv.includes("--apply");
  const db = getDb();
  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedPillars: 0,
    scannedSubPages: 0,
    scannedNestedPages: 0,
    updatesNeeded: 0,
    updated: 0,
    unchanged: 0,
    samples: [],
  };

  let batch = db.batch();
  let batchSize = 0;

  async function commitIfNeeded(force = false) {
    if (batchSize === 0 || (!force && batchSize < 450)) return;
    await batch.commit();
    report.updated += batchSize;
    batch = db.batch();
    batchSize = 0;
  }

  for (const pillarId of PILLAR_IDS) {
    report.scannedPillars += 1;
    const subPagesSnapshot = await db
      .collection("pillarPages")
      .doc(pillarId)
      .collection("subPages")
      .get();

    report.scannedSubPages += subPagesSnapshot.size;

    for (const subPageDoc of subPagesSnapshot.docs) {
      const nestedSnapshot = await subPageDoc.ref.collection("nestedSubPages").get();
      report.scannedNestedPages += nestedSnapshot.size;

      for (const nestedDoc of nestedSnapshot.docs) {
        const current = nestedDoc.data();
        const counts =
          pillarId === "nursing-test-bank"
            ? await countTestBankNestedQuestions(nestedDoc.ref)
            : await countEntranceOrExitNestedQuestions(nestedDoc.ref);

        const next = {
          ...counts,
          sidebarCountBackfilledAt: FieldValue.serverTimestamp(),
        };
        const changed = changedFields(current, counts);

        if (Object.keys(changed).length === 0) {
          report.unchanged += 1;
          continue;
        }

        report.updatesNeeded += 1;
        if (report.samples.length < 12) {
          report.samples.push({
            pillarId,
            subPageId: subPageDoc.id,
            nestedSubPageId: nestedDoc.id,
            pageName: current.pageName || current.heading || current.slug || nestedDoc.id,
            current: {
              questionCount: current.questionCount,
              quizCount: current.quizCount,
              topicCount: current.topicCount,
            },
            next: counts,
          });
        }

        if (apply) {
          batch.update(nestedDoc.ref, next);
          batchSize += 1;
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
