const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PILLAR_ID = "nursing-entrance-exam";
const HESI_A2_SUBPAGE_ID = "rdYGUZ9DzFvAmo6EsrVe";

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

function optionKind(options) {
  if (Array.isArray(options)) return "array";
  if (options === null || options === undefined) return "missing";
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return `string:${Array.isArray(parsed) ? "array" : typeof parsed}`;
    } catch {
      return "string:plain";
    }
  }
  return typeof options;
}

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();
  const parentRef = db.collection("pillarPages").doc(PILLAR_ID).collection("subPages").doc(HESI_A2_SUBPAGE_ID);
  const nestedSnap = await parentRef.collection("nestedSubPages").get();
  const report = { totalQuestions: 0, byKind: {}, samples: [] };

  for (const nestedDoc of nestedSnap.docs) {
    const nested = nestedDoc.data();
    const quizSnap = await nestedDoc.ref.collection("quizzes").get();
    for (const quizDoc of quizSnap.docs) {
      const quiz = quizDoc.data();
      const questionSnap = await quizDoc.ref.collection("questions").get();
      for (const questionDoc of questionSnap.docs) {
        const question = questionDoc.data();
        const kind = optionKind(question.options);
        report.totalQuestions += 1;
        report.byKind[kind] = (report.byKind[kind] || 0) + 1;
        if (kind !== "array" && report.samples.length < 15) {
          report.samples.push({
            nested: nested.pageName || nested.title || nested.slug || nestedDoc.id,
            quiz: quiz.title || quiz.pageName || quiz.slug || quizDoc.id,
            questionId: questionDoc.id,
            kind,
            options: question.options,
          });
        }
      }
    }
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
