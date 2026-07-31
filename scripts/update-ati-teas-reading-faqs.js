const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUGS = [
  "ati-teas-reading-practice-test",
  "teas-reading-practice-test",
];

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

const readingFaqs = [
  {
    question: "How does NursingMocks organize ATI TEAS Reading practice?",
    answer:
      "NursingMocks organizes ATI TEAS Reading practice around the official Reading areas: Key Ideas and Details, Craft and Structure, and Integration of Knowledge and Ideas. The goal is to help you practise Reading as its own subject instead of mixing it with Math, Science, or English and Language Usage.",
  },
  {
    question: "Can I practise only ATI TEAS Reading on NursingMocks?",
    answer:
      "Yes. The Reading practice page lets you choose Reading-focused sets, so you can work on passages, written directions, evidence, structure, and source-based questions without taking a full mixed-subject practice test.",
  },
  {
    question: "Do NursingMocks Reading sets show answers?",
    answer:
      "NursingMocks Reading practice is built around question practice and answer review. After completing supported questions or sets, use the correct answer and any available explanation to check whether your choice was actually supported by the passage, prompt, chart, table, or other source.",
  },
  {
    question: "Are NursingMocks ATI TEAS Reading questions official ATI questions?",
    answer:
      "No. NursingMocks is an independent practice resource. The questions are not official ATI questions, and NursingMocks does not claim affiliation, authorization, or endorsement from ATI.",
  },
  {
    question: "How should I choose a Reading set on NursingMocks?",
    answer:
      "Start with any available Reading set if you are unsure. After that, use your missed-question pattern to guide the next step. If you keep missing details, inferences, author-purpose questions, or source-comparison questions, choose more Reading practice that helps you work on that weakness.",
  },
  {
    question: "How should I review my NursingMocks Reading results?",
    answer:
      "Do not look only at the score. Check why you missed each question. Common patterns include overlooking a detail, choosing an inference the text does not support, misunderstanding the author's purpose, or failing to connect a passage with a chart or table.",
  },
];

function buildFaqSchema(slug) {
  return {
    "@type": "FAQPage",
    "@id": `https://www.nursingmocks.com/${slug}#faq`,
    mainEntity: readingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    inLanguage: "en-US",
  };
}

function addFaqSchema(existingSchema, slug) {
  if (!existingSchema || typeof existingSchema !== "string") {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [buildFaqSchema(slug)],
    }, null, 2);
  }

  try {
    const parsed = JSON.parse(existingSchema);
    const nextFaqSchema = buildFaqSchema(slug);

    if (Array.isArray(parsed["@graph"])) {
      parsed["@graph"] = [
        ...parsed["@graph"].filter((item) => item?.["@type"] !== "FAQPage"),
        nextFaqSchema,
      ];
      return JSON.stringify(parsed, null, 2);
    }

    if (parsed["@type"] === "FAQPage") {
      return JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [nextFaqSchema],
      }, null, 2);
    }

    return JSON.stringify({
      "@context": parsed["@context"] || "https://schema.org",
      "@graph": [parsed, nextFaqSchema],
    }, null, 2);
  } catch (error) {
    throw new Error(`Existing schema is not valid JSON and was not updated: ${error.message}`);
  }
}

async function findTargetMapping(db) {
  for (const slug of TARGET_SLUGS) {
    const snapshot = await db.collection("routeMappings").where("slug", "==", slug).limit(1).get();
    if (!snapshot.empty) {
      return {
        slug,
        mappingDoc: snapshot.docs[0],
      };
    }
  }

  throw new Error(`No route mapping found for any target slug: ${TARGET_SLUGS.join(", ")}`);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
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
    faqs: readingFaqs,
    schema: addFaqSchema(before.schema, slug),
    displayCopy: {
      ...(before.displayCopy || {}),
      faqTitle: "ATI TEAS Reading Practice Test FAQs",
      faqDescription:
        "Answers to common questions about using NursingMocks for ATI TEAS Reading practice.",
    },
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (apply) {
    await ref.set(update, { merge: true });
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    slug,
    mappingId: mappingDoc.id,
    refPath,
    before: {
      pageName: before.pageName,
      heading: before.heading,
      faqCount: Array.isArray(before.faqs) ? before.faqs.length : 0,
      faqTitle: before.displayCopy?.faqTitle || null,
      faqDescription: before.displayCopy?.faqDescription || null,
      schemaHasFaq: String(before.schema || "").includes("FAQPage"),
    },
    after: {
      faqCount: readingFaqs.length,
      faqTitle: update.displayCopy.faqTitle,
      faqDescription: update.displayCopy.faqDescription,
      schemaHasFaq: update.schema.includes("FAQPage"),
      questions: readingFaqs.map((faq) => faq.question),
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
