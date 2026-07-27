const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const COLLECTION_NAME = "exam_subject_catalog";
const DELETE_BATCH_SIZE = 450;

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

function questionCount(data) {
  for (const value of [data.questionCount, data.questionsCount, data.totalQuestions, data.question_count]) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  }
  return 0;
}

function displayName(data, fallback) {
  for (const value of [data.pageName, data.title, data.quizName, data.subjectName, data.slug]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

async function contentPathMissing(db, data) {
  if (typeof data.contentPath !== "string" || !data.contentPath.trim()) return false;
  const snapshot = await db.doc(data.contentPath.trim()).get();
  return !snapshot.exists;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("examFamilyId", "==", "nursing_entrance_exams")
    .get();

  const candidates = [];

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const reasons = [];
    const count = questionCount(data);

    if (data.active === false) reasons.push("inactive");
    if (count <= 0) reasons.push("zero-question catalog row");
    if (await contentPathMissing(db, data)) reasons.push("source quiz contentPath missing");

    if (reasons.length > 0) {
      candidates.push({
        docId: docSnapshot.id,
        quizId: data.quizId || data.id || null,
        title: displayName(data, docSnapshot.id),
        slug: data.slug || null,
        examAccessProductId: data.examAccessProductId || null,
        setNumber: data.setNumber || null,
        questionCount: count,
        contentPath: data.contentPath || null,
        reasons,
        ref: docSnapshot.ref,
      });
    }
  }

  let deletedCount = 0;
  if (apply && candidates.length > 0) {
    for (let index = 0; index < candidates.length; index += DELETE_BATCH_SIZE) {
      const batch = db.batch();
      for (const candidate of candidates.slice(index, index + DELETE_BATCH_SIZE)) {
        batch.delete(candidate.ref);
      }
      await batch.commit();
      deletedCount += candidates.slice(index, index + DELETE_BATCH_SIZE).length;
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        collection: COLLECTION_NAME,
        scannedEntranceCatalogRows: snapshot.size,
        candidates: candidates.map(({ ref, ...candidate }) => candidate),
        deletedCount,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
