const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUGS = [
  "ati-teas-science-practice-test",
  "teas-science-practice-test",
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

const scienceFaqs = [
  {
    question: "How do NursingMocks ATI TEAS Science practice sets work?",
    answer:
      "Choose a Science set, answer the questions, and review your results after the set. The page is built for Science-only practice, so you can focus on Human Anatomy and Physiology, Biology, Chemistry, and Scientific Reasoning without moving through the other TEAS subjects.",
  },
  {
    question: "What Science topics can I practice on NursingMocks?",
    answer:
      "NursingMocks Science practice is organized around the ATI TEAS Science areas: Human Anatomy and Physiology, Biology, Chemistry, and Scientific Reasoning. Use the sets to see which area is causing the most missed questions.",
  },
  {
    question: "Are NursingMocks Science questions official ATI questions?",
    answer:
      "No. NursingMocks is an independent practice resource. It does not provide official ATI questions and does not claim affiliation, authorization, or endorsement from ATI.",
  },
  {
    question: "Can I use NursingMocks Science practice to review missed questions?",
    answer:
      "Yes. After completing a set, use your missed answers to find the pattern behind the score. The issue may be a knowledge gap, a relationship error, a prompt interpretation error, or an evidence error.",
  },
  {
    question: "Should I start with Anatomy and Physiology or a full Science set?",
    answer:
      "Start with a full Science set if you are not sure where the weakness is. If your results show repeated misses in body systems, then move more attention to Human Anatomy and Physiology.",
  },
  {
    question: "How should I choose my next NursingMocks Science set?",
    answer:
      "Choose the next set based on what your last review showed. If you missed chart or experiment questions, practise more Scientific Reasoning. If you missed body-system questions, spend more time with Human Anatomy and Physiology.",
  },
];

function buildFaqSchema(slug) {
  return {
    "@type": "FAQPage",
    "@id": `https://www.nursingmocks.com/${slug}#faq`,
    mainEntity: scienceFaqs.map((faq) => ({
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
    faqs: scienceFaqs,
    schema: addFaqSchema(before.schema, slug),
    displayCopy: {
      ...(before.displayCopy || {}),
      faqTitle: "ATI TEAS Science Practice Test FAQs",
      faqDescription:
        "Answers to common questions about using NursingMocks for ATI TEAS Science practice.",
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
      faqCount: scienceFaqs.length,
      faqTitle: update.displayCopy.faqTitle,
      faqDescription: update.displayCopy.faqDescription,
      schemaHasFaq: update.schema.includes("FAQPage"),
      questions: scienceFaqs.map((faq) => faq.question),
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
