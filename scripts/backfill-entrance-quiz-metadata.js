const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const PILLAR_ID = "nursing-entrance-exam";
const EXAM_SUBJECT_CATALOG_COLLECTION = "exam_subject_catalog";

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

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function slugValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/practice test/g, "")
    .replace(/ati|teas|hesi|a2/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function examAccessProductIdFor(...values) {
  const text = values.map((value) => String(value || "").toLowerCase()).join(" ");
  if (text.includes("hesi") || text.includes("hessi")) return "hesi_a2";
  if (text.includes("teas") || text.includes("ati")) return "ati_teas_7";
  return null;
}

function isFullLength(...values) {
  const text = values.map((value) => String(value || "").toLowerCase()).join(" ");
  return text.includes("full-length") || text.includes("full length") || text.includes("full_exam") || text.includes("full exam");
}

function catalogDocId(quizId) {
  return `nursing_entrance_exam_${quizId}`;
}

async function countQuestions(quizRef) {
  const snapshot = await quizRef.collection("questions").get();
  return snapshot.size;
}

function changedFields(current, next) {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => current[key] !== value)
  );
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const subPagesSnapshot = await db.collection("pillarPages").doc(PILLAR_ID).collection("subPages").get();

  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedSubPages: subPagesSnapshot.size,
    scannedNestedPages: 0,
    scannedQuizzes: 0,
    skippedFullLength: 0,
    missingExamAccessProduct: 0,
    updatesNeeded: 0,
    updated: 0,
    catalogUpdatesNeeded: 0,
    catalogUpdated: 0,
    unchanged: 0,
    samples: [],
  };

  let batch = db.batch();
  let batchSize = 0;

  async function commitIfNeeded(force = false) {
    if (batchSize === 0 || (!force && batchSize < 450)) return;
    await batch.commit();
    batch = db.batch();
    batchSize = 0;
  }

  for (const subPageDoc of subPagesSnapshot.docs) {
    const subPage = subPageDoc.data();
    const nestedSnapshot = await subPageDoc.ref.collection("nestedSubPages").get();
    report.scannedNestedPages += nestedSnapshot.size;

    for (const nestedDoc of nestedSnapshot.docs) {
      const nested = nestedDoc.data();
      const quizzesSnapshot = await nestedDoc.ref.collection("quizzes").get();

      for (const quizDoc of quizzesSnapshot.docs) {
        const quiz = quizDoc.data();
        report.scannedQuizzes += 1;

        const subjectName = textValue(quiz.subjectName, nested.pageName, nested.title, nested.heading, nested.slug, nestedDoc.id);
        if (isFullLength(quiz.pageName, quiz.title, quiz.quizName, quiz.slug, subjectName)) {
          report.skippedFullLength += 1;
          continue;
        }

        const examAccessProductId =
          examAccessProductIdFor(quiz.examAccessProductId, nested.examAccessProductId, subPage.examAccessProductId, subPage.slug, subPage.pageName, nested.slug, subjectName) ||
          null;

        if (!examAccessProductId) {
          report.missingExamAccessProduct += 1;
          continue;
        }

        const questionCount = await countQuestions(quizDoc.ref);
        const next = {
          examAccessProductId,
          examFamilyId: "nursing_entrance_exams",
          subjectName,
          subjectId: slugValue(subjectName || quiz.pageName || quiz.slug || quizDoc.id),
          questionCount,
          previewPercentage: typeof quiz.previewPercentage === "number" ? quiz.previewPercentage : 20,
          active: quiz.active !== false,
          metadataBackfilledAt: FieldValue.serverTimestamp(),
        };
        const diff = changedFields(quiz, { ...next, metadataBackfilledAt: quiz.metadataBackfilledAt });
        const contentPath = quiz.contentPath || quizDoc.ref.path;
        const catalogRef = db.collection(EXAM_SUBJECT_CATALOG_COLLECTION).doc(catalogDocId(quizDoc.id));
        const catalogSnapshot = await catalogRef.get();
        const currentCatalog = catalogSnapshot.data() || {};
        const catalogNext = {
          ...next,
          id: quizDoc.id,
          quizId: quizDoc.id,
          slug: textValue(quiz.slug),
          title: textValue(quiz.pageName, quiz.title, quiz.quizName, quiz.slug, quizDoc.id),
          pageName: textValue(quiz.pageName, quiz.title, quiz.quizName, quiz.slug, quizDoc.id),
          quizName: textValue(quiz.quizName, quiz.title, quiz.pageName, quiz.slug, quizDoc.id),
          setNumber: typeof quiz.setNumber === "number" ? quiz.setNumber : null,
          contentPath,
          sourcePillarId: PILLAR_ID,
          sourceUpdatedAt: new Date().toISOString(),
          type: "entrance_quiz_subject",
        };
        const catalogDiff = changedFields(currentCatalog, {
          ...catalogNext,
          metadataBackfilledAt: currentCatalog.metadataBackfilledAt,
          sourceUpdatedAt: currentCatalog.sourceUpdatedAt,
        });

        if (Object.keys(diff).length === 0 && Object.keys(catalogDiff).length === 0) {
          report.unchanged += 1;
          continue;
        }

        if (Object.keys(diff).length > 0) report.updatesNeeded += 1;
        if (Object.keys(catalogDiff).length > 0) report.catalogUpdatesNeeded += 1;
        if (report.samples.length < 20) {
          report.samples.push({
            path: quizDoc.ref.path,
            catalogPath: catalogRef.path,
            title: quiz.pageName || quiz.title || quizDoc.id,
            current: {
              examAccessProductId: quiz.examAccessProductId || null,
              subjectName: quiz.subjectName || null,
              questionCount: quiz.questionCount ?? null,
            },
            next: {
              examAccessProductId,
              subjectName,
              questionCount,
              setNumber: quiz.setNumber ?? null,
            },
          });
        }

        if (apply) {
          if (Object.keys(diff).length > 0) {
            batch.set(quizDoc.ref, next, { merge: true });
            batchSize += 1;
            report.updated += 1;
          }
          if (Object.keys(catalogDiff).length > 0) {
            batch.set(catalogRef, catalogNext, { merge: true });
            batchSize += 1;
            report.catalogUpdated += 1;
          }
          await commitIfNeeded();
        }
      }
    }
  }

  if (apply) await commitIfNeeded(true);

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
