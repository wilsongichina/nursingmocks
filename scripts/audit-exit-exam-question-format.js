const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

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

function getDb() {
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

async function findNestedBySlug(db, parentSlug, nestedSlug) {
  const pillarId = "nursing-exit-exam";
  const parents = await db.collection(`pillarPages/${pillarId}/subPages`).where("slug", "==", parentSlug).limit(1).get();
  if (parents.empty) throw new Error(`Parent not found: ${parentSlug}`);
  const parentDoc = parents.docs[0];
  const nested = await parentDoc.ref.collection("nestedSubPages").where("slug", "==", nestedSlug).limit(1).get();
  if (nested.empty) throw new Error(`Nested page not found: ${nestedSlug}`);
  return { parentDoc, nestedDoc: nested.docs[0] };
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const { nestedDoc } = await findNestedBySlug(db, "lpn-exit-exams", "ati-lpn-comprehensive-predictor");
  const quizzes = await nestedDoc.ref.collection("quizzes").limit(1).get();
  if (quizzes.empty) throw new Error("No quizzes found.");
  const quizDoc = quizzes.docs[0];
  const questions = await quizDoc.ref.collection("questions").limit(1).get();
  const questionDoc = questions.empty ? null : questions.docs[0];

  console.log(JSON.stringify({
    quizId: quizDoc.id,
    quiz: quizDoc.data(),
    questionId: questionDoc?.id || null,
    question: questionDoc?.data() || null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
