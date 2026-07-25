const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const DOC_PATH = "pillarPages/nursing-entrance-exam/subPages/yrdSf0KpOcuybL1SLnw7";

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

const bodyContent = "<p></p>";

const nextData = {
  pageName: "ATI TEAS 7 Practice Test",
  seoLabel: "ATI TEAS Practice Test",
  heading: "ATI TEAS Practice Test",
  description:
    "<p>Practice ATI TEAS 7 subjects with exam-style questions for Reading, Mathematics, Science, and English and Language Usage.</p>",
  bodyContent,
  meta: {
    title: "ATI TEAS Practice Test | NursingMocks",
    description:
      "Practice ATI TEAS 7 subjects with exam-style questions, free preview access, answers, and explanations for Reading, Mathematics, Science, and English and Language Usage.",
    keywords:
      "ATI TEAS practice test, ATI TEAS 7 practice test, TEAS reading practice, TEAS math practice, TEAS science practice, TEAS English practice",
    ogTitle: "ATI TEAS Practice Test | NursingMocks",
    ogDescription:
      "Practice ATI TEAS 7 subjects with exam-style questions, free preview access, answers, and explanations.",
    ogImage: "/nursing-mocks-logo.png",
    canonicalUrl: "https://nursingmocks.com/teas-practice-test",
  },
  faqs: [
    {
      question: "Is this ATI TEAS practice organized by subject?",
      answer:
        "Yes. NursingMocks organizes ATI TEAS practice by subject so students can focus on Reading, Mathematics, Science, and English and Language Usage separately.",
    },
    {
      question: "Can I start with a free preview?",
      answer:
        "Yes. Available preview questions let students try the practice experience before unlocking full access.",
    },
    {
      question: "Are answers and explanations included?",
      answer:
        "Yes. Answers and explanations are used for review so students can understand the reasoning behind each question.",
    },
    {
      question: "Should I practice every subject at once?",
      answer:
        "Most students benefit from choosing one subject first, reviewing results, and then moving to the next area based on their study plan.",
    },
    {
      question: "Is NursingMocks affiliated with ATI?",
      answer:
        "No. NursingMocks is an independent practice resource and is not affiliated with ATI. All trademarks belong to their respective owners.",
    },
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
      pageName: before.pageName,
      seoLabel: before.seoLabel,
      heading: before.heading,
      metaTitle: before.meta?.title,
      metaDescription: before.meta?.description,
      bodyLength: String(before.bodyContent || "").length,
      faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
    },
  after: {
    pageName: nextData.pageName,
    seoLabel: nextData.seoLabel,
    heading: nextData.heading,
    metaTitle: nextData.meta.title,
    metaDescription: nextData.meta.description,
    bodyLength: bodyContent.length,
    bodyStandardized: true,
    faqCount: nextData.faqs.length,
  },
};

  if (apply) {
    await ref.update({
      ...nextData,
      updatedAt: FieldValue.serverTimestamp(),
      publicContentCleanedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
