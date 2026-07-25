const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const DOC_PATH = "pillarPages/nursing-entrance-exam";

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

const nextFields = {
  hero: {
    title: "Nursing Entrance Exam for ATI TEAS 7 and HESI A2",
    badge: "Nursing Entrance Exams",
    description:
      "Prepare for the Nursing Entrance Exam with ATI TEAS 7 and HESI A2 practice resources.",
    subtitle:
      "Prepare for ATI TEAS 7 and HESI A2 with subject-based practice, clear explanations, and realistic nursing entrance exam questions.",
  },
  meta: {
    title: "Nursing Entrance Exam Practice for ATI TEAS 7 and HESI A2 | NursingMocks",
    description:
      "Prepare for nursing entrance exams with ATI TEAS 7 and HESI A2 practice questions, subject-based review, free previews, and answer explanations.",
    keywords:
      "nursing entrance exam, ATI TEAS practice, ATI TEAS 7 practice, HESI A2 practice, nursing school entrance exam",
    ogTitle: "Nursing Entrance Exam Practice for ATI TEAS 7 and HESI A2",
    ogDescription:
      "Practice ATI TEAS 7 and HESI A2 entrance exam questions by subject with free previews and clear explanations.",
    ogImage: "/nursing-mocks-logo.png",
    canonicalUrl: "https://nursingmocks.com/nursing-entrance-exam",
  },
  trustIndicators: [
    { icon: "check", title: "ATI TEAS 7 and HESI A2 Practice" },
    { icon: "shield", title: "Clear Answer Explanations" },
    { icon: "star", title: "Subject-Based Review" },
    { icon: "check", title: "Free Preview Available" },
  ],
};

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const ref = db.doc(DOC_PATH);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error(`Document not found: ${DOC_PATH}`);

  const before = snapshot.data();
  const report = {
    mode: apply ? "apply" : "dry-run",
    path: DOC_PATH,
    before: {
      hero: before.hero,
      meta: before.meta,
      trustIndicators: before.trustIndicators,
    },
    after: nextFields,
  };

  if (apply) {
    await ref.update({
      ...nextFields,
      updatedAt: FieldValue.serverTimestamp(),
      publicSafeFieldsCleanedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
