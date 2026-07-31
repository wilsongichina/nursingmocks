const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUGS = ["ati-teas-english-practice-test", "teas-english-practice-test"];
const MARKDOWN_PATH = path.join(
  process.cwd(),
  "Documentation",
  "public-sub-pages",
  "ATI TEAS English Practice Test humanized.md",
);

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

function parseFaqsFromMarkdown() {
  if (!fs.existsSync(MARKDOWN_PATH)) {
    throw new Error(`Markdown source not found: ${MARKDOWN_PATH}`);
  }

  const markdown = fs.readFileSync(MARKDOWN_PATH, "utf8");
  const faqStart = markdown.indexOf("## ATI TEAS English Practice Test FAQs");
  if (faqStart < 0) {
    throw new Error("FAQ heading not found in English Markdown source.");
  }

  const faqBlock = markdown.slice(faqStart).split(/\r?\n/);
  const faqs = [];
  let current = null;

  for (const rawLine of faqBlock) {
    const line = rawLine.trim();
    if (!line || line.startsWith("## ATI TEAS English Practice Test FAQs")) continue;

    if (line.startsWith("### ")) {
      if (current?.question && current.answerParts.length > 0) {
        faqs.push({
          question: current.question,
          answer: current.answerParts.join(" ").replace(/\s+/g, " ").trim(),
        });
      }
      current = { question: line.slice(4).trim(), answerParts: [] };
      continue;
    }

    if (current) current.answerParts.push(line.replace(/\*\*/g, ""));
  }

  if (current?.question && current.answerParts.length > 0) {
    faqs.push({
      question: current.question,
      answer: current.answerParts.join(" ").replace(/\s+/g, " ").trim(),
    });
  }

  if (faqs.length === 0) {
    throw new Error("No FAQ items parsed from English Markdown source.");
  }

  return faqs;
}

async function findTargetMapping(db) {
  for (const slug of TARGET_SLUGS) {
    const snapshot = await db.collection("routeMappings").where("slug", "==", slug).limit(1).get();
    if (!snapshot.empty) return { slug, mappingDoc: snapshot.docs[0] };
  }

  throw new Error(`No route mapping found for any target slug: ${TARGET_SLUGS.join(", ")}`);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const faqs = parseFaqsFromMarkdown();
  const db = getDb();
  const { slug, mappingDoc } = await findTargetMapping(db);
  const mapping = mappingDoc.data();
  const refPath = mapping.refPath || mapping.contentPath;

  if (!refPath) {
    throw new Error(`Route mapping ${mappingDoc.id} for ${slug} has no refPath/contentPath.`);
  }

  const ref = db.doc(refPath);
  const beforeSnapshot = await ref.get();
  if (!beforeSnapshot.exists) {
    throw new Error(`Target document does not exist: ${refPath}`);
  }

  const before = beforeSnapshot.data();
  const update = {
    faqs,
    displayCopy: {
      ...(before.displayCopy || {}),
      faqTitle: "ATI TEAS English Practice Test FAQs",
      faqDescription: "Answers to common questions about using NursingMocks for ATI TEAS English practice.",
    },
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (apply) {
    await ref.set(update, { merge: true });
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        slug,
        mappingId: mappingDoc.id,
        refPath,
        before: {
          faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
          faqTitle: before.displayCopy?.faqTitle || null,
        },
        after: {
          faqCount: faqs.length,
          faqTitle: update.displayCopy.faqTitle,
          faqDescription: update.displayCopy.faqDescription,
          questions: faqs.map((faq) => faq.question),
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
