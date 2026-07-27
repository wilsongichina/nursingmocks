const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLAR_ID = "nursing-entrance-exam";
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

function wasGeneratedByExplanationTool(question) {
  return (
    typeof question.explanationGeneratedBy === "string" ||
    typeof question.explanationStatus === "string" ||
    typeof question.atiClassificationGeneratedBy === "string" ||
    question.atiClassificationGeneratedAt !== undefined
  );
}

function cleanupPatch(question) {
  const patch = {
    explanationStatus: FieldValue.delete(),
    explanationGeneratedBy: FieldValue.delete(),
    explanationGeneratedAt: FieldValue.delete(),
    explanationError: FieldValue.delete(),
    answerReviewReason: FieldValue.delete(),
    modelSuggestedAnswer: FieldValue.delete(),
    atiSubject: FieldValue.delete(),
    atiSection: FieldValue.delete(),
    atiClassificationReason: FieldValue.delete(),
    atiClassificationGeneratedBy: FieldValue.delete(),
    atiClassificationGeneratedAt: FieldValue.delete(),
    lastUpdated: new Date().toISOString(),
  };

  // Only remove the explanation body when it was created by the new explanation generator.
  if (question.explanationGeneratedBy || question.explanationStatus === "ai_generated") {
    patch.explanation = FieldValue.delete();
  }

  return patch;
}

async function getQuestionRefs(db) {
  const refs = [];
  const subPages = await db.collection("pillarPages").doc(PILLAR_ID).collection("subPages").get();
  for (const subPage of subPages.docs) {
    const nestedSubPages = await subPage.ref.collection("nestedSubPages").get();
    for (const nestedSubPage of nestedSubPages.docs) {
      const quizzes = await nestedSubPage.ref.collection("quizzes").get();
      for (const quiz of quizzes.docs) {
        const questions = await quiz.ref.collection("questions").get();
        for (const question of questions.docs) {
          refs.push({ ref: question.ref, data: question.data() });
        }
      }
    }
  }
  return refs;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const questionRefs = await getQuestionRefs(db);
  const targets = questionRefs.filter(({ data }) => wasGeneratedByExplanationTool(data));

  if (apply) {
    for (let index = 0; index < targets.length; index += BATCH_LIMIT) {
      const batch = db.batch();
      targets.slice(index, index + BATCH_LIMIT).forEach(({ ref, data }) => {
        batch.set(ref, cleanupPatch(data), { merge: true });
      });
      await batch.commit();
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        scannedQuestions: questionRefs.length,
        targetedQuestions: targets.length,
        clearedQuestions: apply ? targets.length : 0,
        removedFields: [
          "explanation",
          "explanationStatus",
          "explanationGeneratedBy",
          "explanationGeneratedAt",
          "explanationError",
          "answerReviewReason",
          "modelSuggestedAnswer",
          "atiSubject",
          "atiSection",
          "atiClassificationReason",
          "atiClassificationGeneratedBy",
          "atiClassificationGeneratedAt",
        ],
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
