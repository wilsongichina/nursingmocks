import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const SUBJECTS = ["Reading", "Mathematics", "Science", "English and Language Usage"];
const SETS = Array.from({ length: 16 }, (_, index) => index + 1);
const OUTPUT_PATH = path.join(projectRoot, "public", "data", "teas-exams-preview.json");
const PER_SUBJECT_QUERY_LIMIT = Number(process.env.TEAS_EXAMS_STATIC_SUBJECT_LIMIT || 800);

function getServiceAccountCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (json) return cert(JSON.parse(json.replace(/\\n/g, "\n")));

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  throw new Error("Firebase Admin is not configured.");
}

function getDb() {
  if (!getApps().length) initializeApp({ credential: getServiceAccountCredential() });
  return getFirestore();
}

function text(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function choicesFromRecord(data) {
  if (Array.isArray(data.choices)) return data.choices.map(text).filter(Boolean);
  if (!data.options || typeof data.options !== "object" || Array.isArray(data.options)) return [];
  return Object.entries(data.options)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object" && "choice" in value) return text(value.choice);
      return "";
    })
    .filter(Boolean);
}

function correctAnswerLabelsFromRecord(data) {
  const raw = data.correctAnswer;
  if (Array.isArray(raw)) return raw.map(text).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(text).filter(Boolean);
    } catch {
      return raw ? [raw.trim()] : [];
    }
  }
  const answerText = text(data.correctAnswerText);
  const choices = choicesFromRecord(data);
  const index = choices.findIndex((choice) => text(choice).toLowerCase() === answerText.toLowerCase());
  return index >= 0 ? [String.fromCharCode(65 + index)] : [];
}

function normalizeQuestion(id, data) {
  const subject = text(data.subject);
  const setNumber = Number(data.setNumber || data.set?.number || 0);
  const questionText = text(data.questionText || data.questionContent?.text);
  if (!SUBJECTS.includes(subject) || !SETS.includes(setNumber) || !questionText) return null;

  return {
    id: `scan:${id}`,
    subject,
    setNumber,
    questionNumber: text(data.questionNumber) || String(Number(data.scanOrder || 0) || ""),
    passageText: text(data.passage?.text),
    questionText,
    choices: choicesFromRecord(data),
    correctAnswerLabels: correctAnswerLabelsFromRecord(data),
    correctAnswerText: text(data.correctAnswerText),
    sourceCloseness: Number.isFinite(Number(data.sourceCloseness)) ? Number(data.sourceCloseness) : null,
    scanOrder: Number(data.scanOrder || 0),
  };
}

function applyPreviewLimit(questions) {
  return questions.map(({ scanOrder: _scanOrder, ...question }) => question);
}

async function main() {
  const db = getDb();
  const snapshots = await Promise.all(
    SUBJECTS.map((subject) =>
      db
        .collection("teasScannedQuestions")
        .where("status", "==", "scanned_ready")
        .where("subject", "==", subject)
        .limit(PER_SUBJECT_QUERY_LIMIT)
        .get()
    )
  );

  const allQuestions = snapshots
    .flatMap((snapshot) => snapshot.docs.map((doc) => normalizeQuestion(doc.id, doc.data())))
    .filter(Boolean)
    .sort(
      (left, right) =>
        left.subject.localeCompare(right.subject) ||
        left.setNumber - right.setNumber ||
        left.scanOrder - right.scanOrder ||
        Number(left.questionNumber || 0) - Number(right.questionNumber || 0)
    );
  const questions = applyPreviewLimit(allQuestions);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "teasScannedQuestions",
        previewPercentage: 100,
        includesNeedsReview: true,
        questionCount: questions.length,
        subjects: SUBJECTS,
        questions,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Wrote ${questions.length} preview questions to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
