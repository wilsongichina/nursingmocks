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

async function main() {
  loadLocalEnv();
  const db = getDb();
  const pillarId = "nursing-exit-exam";
  const parentsSnapshot = await db.collection(`pillarPages/${pillarId}/subPages`).get();
  const results = [];

  for (const parentDoc of parentsSnapshot.docs) {
    const parent = parentDoc.data();
    const nestedSnapshot = await parentDoc.ref.collection("nestedSubPages").get();
    for (const nestedDoc of nestedSnapshot.docs) {
      const nested = nestedDoc.data();
      const quizzesSnapshot = await nestedDoc.ref.collection("quizzes").get();
      for (const quizDoc of quizzesSnapshot.docs) {
        const quiz = quizDoc.data();
        const questionCount = (await quizDoc.ref.collection("questions").count().get()).data().count;
        results.push({
          parentId: parentDoc.id,
          parentSlug: parent.slug,
          parentName: parent.pageName || parent.title,
          nestedId: nestedDoc.id,
          nestedSlug: nested.slug,
          nestedName: nested.pageName || nested.title,
          quizId: quizDoc.id,
          quizName: quiz.pageName || quiz.quizName || quiz.title,
          slug: quiz.slug,
          sourceFileName: quiz.sourceFileName || null,
          questionCount,
          sampleFields: Object.keys(quiz).sort(),
        });
      }
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
