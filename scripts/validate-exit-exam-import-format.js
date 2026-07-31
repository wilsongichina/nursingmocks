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

function hasRequiredQuestionShape(question) {
  return {
    hasQuestion: typeof question.question === "string" && question.question.length > 0,
    optionsIsArray: Array.isArray(question.options),
    hasCorrectAnswer: question.correctAnswer !== undefined,
    hasExplanation: typeof question.explanation === "string",
    hasQuestionTypeId: question.questionTypeId !== undefined,
    hasDisplayOrder: typeof question.displayOrder === "number",
    hasQuestionNumber: typeof question.questionNumber === "number",
    statusPublished: question.status === "published",
  };
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const pillarId = "nursing-exit-exam";
  const parents = await db.collection(`pillarPages/${pillarId}/subPages`).get();
  const groups = [];
  const issues = [];

  for (const parentDoc of parents.docs) {
    const parent = parentDoc.data();
    const nestedSnapshot = await parentDoc.ref.collection("nestedSubPages").get();
    for (const nestedDoc of nestedSnapshot.docs) {
      const nested = nestedDoc.data();
      const quizSnapshot = await nestedDoc.ref.collection("quizzes").get();
      let questionTotal = 0;

      for (const quizDoc of quizSnapshot.docs) {
        const quiz = quizDoc.data();
        const count = (await quizDoc.ref.collection("questions").count().get()).data().count;
        questionTotal += count;

        if (quiz.questionCount !== count) {
          issues.push({
            type: "question-count-mismatch",
            quizName: quiz.quizName || quiz.pageName || quiz.title,
            slug: quiz.slug,
            metadataQuestionCount: quiz.questionCount,
            actualQuestionCount: count,
          });
        }

        const questions = await quizDoc.ref.collection("questions").orderBy("displayOrder").limit(1).get();
        if (questions.empty) {
          issues.push({
            type: "missing-questions",
            quizName: quiz.quizName || quiz.pageName || quiz.title,
            slug: quiz.slug,
          });
          continue;
        }

        const shape = hasRequiredQuestionShape(questions.docs[0].data());
        const failedShape = Object.entries(shape).filter(([, passes]) => !passes).map(([key]) => key);
        if (failedShape.length) {
          issues.push({
            type: "question-shape",
            quizName: quiz.quizName || quiz.pageName || quiz.title,
            slug: quiz.slug,
            failedShape,
          });
        }
      }

      groups.push({
        parentSlug: parent.slug,
        nestedSlug: nested.slug,
        quizCount: quizSnapshot.size,
        questionTotal,
      });
    }
  }

  console.log(JSON.stringify({
    groups,
    issues,
    issueCount: issues.length,
  }, null, 2));

  if (issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
