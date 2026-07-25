const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLARS = [
  {
    id: "nursing-entrance-exam",
    fallback: "Practice entrance exam concepts, question formats, and explanations for focused nursing school preparation.",
  },
  {
    id: "nursing-test-bank",
    fallback: "Practice nursing concepts, question formats, and explanations for focused test-bank review.",
  },
  {
    id: "nursing-exit-exam",
    fallback: "Practice exit exam concepts, question formats, and explanations for focused nursing review.",
  },
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

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseWords(value) {
  return stripHtml(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (["ATI", "TEAS", "HESI", "A2", "RN", "LPN"].includes(upperWord)) return upperWord;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function isGeneratedPlaceholder(value) {
  return /^content for\b.+\bunder\b/i.test(stripHtml(value));
}

function isUsableCardDescription(value) {
  const cleanValue = stripHtml(value);
  return cleanValue.length >= 30 && cleanValue.length <= 180 && !isGeneratedPlaceholder(cleanValue);
}

function subjectFromTitle(title) {
  const lower = title.toLowerCase();
  const subjectMap = [
    ["biology", "biology concepts"],
    ["math", "math concepts"],
    ["mathematics", "mathematics concepts"],
    ["reading", "reading comprehension"],
    ["science", "science concepts"],
    ["english", "grammar, punctuation, and language usage"],
    ["language usage", "grammar, punctuation, and language usage"],
    ["vocabulary", "vocabulary and meaning"],
    ["grammar", "grammar and sentence structure"],
    ["anatomy", "anatomy and physiology concepts"],
    ["physiology", "anatomy and physiology concepts"],
    ["fundamentals", "nursing fundamentals"],
    ["pharmacology", "pharmacology concepts"],
    ["medical surgical", "medical-surgical nursing concepts"],
    ["med surg", "medical-surgical nursing concepts"],
    ["maternal", "maternal newborn nursing concepts"],
    ["pediatric", "pediatric nursing concepts"],
    ["mental health", "mental health nursing concepts"],
  ];

  const match = subjectMap.find(([needle]) => lower.includes(needle));
  return match?.[1] || "";
}

function descriptionForPage(page, pillarFallback) {
  const title = titleCaseWords(
    page.seoLabel || page.pageName || page.heading || page.title || page.slug || page.id
  );
  const subject = subjectFromTitle(title);

  if (title.includes("HESI A2")) {
    return subject
      ? `Practice ${subject}, question formats, and explanations for HESI A2 preparation.`
      : "Practice question formats and explanations for HESI A2 preparation.";
  }

  if (title.includes("ATI TEAS") || title.includes("TEAS")) {
    return subject
      ? `Practice ${subject}, question formats, and explanations for ATI TEAS preparation.`
      : "Practice question formats and explanations for ATI TEAS preparation.";
  }

  if (title.includes("RN")) {
    return subject
      ? `Practice ${subject}, clinical judgment, and explanations for RN nursing review.`
      : "Practice nursing concepts, clinical judgment, and explanations for RN review.";
  }

  if (title.includes("LPN")) {
    return subject
      ? `Practice ${subject}, clinical judgment, and explanations for LPN nursing review.`
      : "Practice nursing concepts, clinical judgment, and explanations for LPN review.";
  }

  return pillarFallback;
}

function needsUpdate(page) {
  return !isUsableCardDescription(page.cardDescription);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedSubPages: 0,
    scannedNestedPages: 0,
    updatesNeeded: 0,
    updated: 0,
    unchanged: 0,
    samples: [],
  };

  let batch = db.batch();
  let batchSize = 0;

  async function commitIfNeeded(force = false) {
    if (batchSize === 0 || (!force && batchSize < 450)) return;
    if (apply) await batch.commit();
    report.updated += apply ? batchSize : 0;
    batch = db.batch();
    batchSize = 0;
  }

  for (const pillar of PILLARS) {
    const subPagesSnapshot = await db.collection("pillarPages").doc(pillar.id).collection("subPages").get();
    report.scannedSubPages += subPagesSnapshot.size;

    for (const subPageDoc of subPagesSnapshot.docs) {
      const nestedSnapshot = await subPageDoc.ref.collection("nestedSubPages").get();
      report.scannedNestedPages += nestedSnapshot.size;

      for (const nestedDoc of nestedSnapshot.docs) {
        const data = { id: nestedDoc.id, ...nestedDoc.data() };

        if (!needsUpdate(data)) {
          report.unchanged += 1;
          continue;
        }

        const cardDescription = descriptionForPage(data, pillar.fallback);
        report.updatesNeeded += 1;
        if (report.samples.length < 15) {
          report.samples.push({
            path: nestedDoc.ref.path,
            title: data.seoLabel || data.pageName || data.heading || nestedDoc.id,
            before: data.cardDescription || "",
            after: cardDescription,
          });
        }

        if (apply) {
          batch.update(nestedDoc.ref, {
            cardDescription,
            cardDescriptionBackfilledAt: FieldValue.serverTimestamp(),
          });
          batchSize += 1;
          await commitIfNeeded();
        }
      }
    }
  }

  await commitIfNeeded(true);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
