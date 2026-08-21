const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const DEFAULT_CLEANUP_ROOT =
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\CERTIFICATIONS";
const GROUP_SLUG = "rn-certifications";
const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "rn-exams";
const NESTED_SLUG = "rn-certifications";
const SITE_ORIGIN = "https://www.nursingmocks.com";
const APPLY = process.argv.includes("--apply");
const AUDIT = process.argv.includes("--audit");
const SKIP_COMPLETE = process.argv.includes("--skip-complete");

const PARENT_ID_FALLBACK = "SuT1noZoNGEjKGR1vTbi";
const NESTED_ID_FALLBACK = "Xm9CE6gN7AB8T4YZKMNa";

const TOPICS = {
  "CNA Certification": {
    slug: "rn-certifications-cna-certification-practice-questions",
    pageName: "CNA Certification",
    metaTitle: "CNA Certification Practice Questions | NursingMocks",
    description:
      "Practice CNA certification exam questions for patient care, safety, clinical-assistant tasks, communication, and healthcare support review.",
  },
  "Phlebotomy Certification": {
    slug: "rn-certifications-phlebotomy-certification-practice-questions",
    pageName: "Phlebotomy Certification",
    metaTitle: "Phlebotomy Certification Practice Questions | NursingMocks",
    description:
      "Practice phlebotomy certification exam questions for specimen collection, tubes, safety, patient identification, handling, and lab procedures.",
  },
};
const LEGACY_TOPIC_NAMES = new Map();

function normalizeDestinationTopic(topicName) {
  const normalized = String(topicName || "").trim();
  return LEGACY_TOPIC_NAMES.get(normalized) || normalized;
}

function resolveDestinationPath(row, cleanupRoot) {
  if (row.destinationPath && fs.existsSync(row.destinationPath)) return row.destinationPath;
  const topicName = normalizeDestinationTopic(row.destinationTopic);
  const candidate = path.join(cleanupRoot, topicName, row.sourceFileName);
  return candidate;
}

function parseArgs(argv) {
  const args = { cleanupRoot: DEFAULT_CLEANUP_ROOT, limit: null };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cleanup-root") {
      args.cleanupRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--limit") {
      args.limit = Number(argv[index + 1]);
      index += 1;
    }
  }
  return args;
}

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
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  const [headers, ...body] = rows;
  const cleanHeaders = headers.map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  return body.map((values) => {
    const item = {};
    cleanHeaders.forEach((header, index) => {
      item[header] = String(values[index] || "").replace(/^\uFEFF/, "").trim();
    });
    return item;
  });
}

function slugify(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function parseOptions(options) {
  if (!options) return [];
  const parsed = typeof options === "string" ? JSON.parse(options) : options;
  if (Array.isArray(parsed)) return parsed.map((value) => String(value || "").trim());
  return Object.keys(parsed)
    .sort()
    .map((key) => {
      const value = parsed[key];
      if (value && typeof value === "object" && "choice" in value) return String(value.choice || "").trim();
      return String(value || "").trim();
    });
}

function normalizeCorrectAnswer(question) {
  const questionTypeId = Number(question.question_type_id || question.questionTypeId || 1);
  const correctAnswer = question.correctAnswer || question.correct_answer || "";
  if (questionTypeId !== 7) return correctAnswer;
  if (Array.isArray(correctAnswer)) return correctAnswer;
  try {
    const parsed = typeof correctAnswer === "string" ? JSON.parse(correctAnswer) : correctAnswer;
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [String(correctAnswer)];
  }
}

function normalizeQuestion(question, index) {
  const questionText = question.question || question.questionText || question.text || question.stem || "";
  const cleanQuestion = stripHtml(questionText);
  const sourceQuestionId = String(question.id || question.questionId || "");
  return {
    question: questionText,
    passage: question.passage || "",
    options: parseOptions(question.options),
    correctAnswer: normalizeCorrectAnswer(question),
    explanation: question.solution || question.explanation || "",
    questionTypeId: Number(question.question_type_id || question.questionTypeId || 1),
    slug: slugify(cleanQuestion.slice(0, 180)) || `question-${index + 1}`,
    originalId: sourceQuestionId,
    questionId: sourceQuestionId,
    questionNumber: index + 1,
    displayOrder: index + 1,
    meta: {
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
    schema: "",
    status: "published",
    tabs: question.tabs || null,
    matchOption: question.match_option || null,
    imagePath: question.image_path || null,
    units: question.units || null,
    subquestions: Array.isArray(question.subquestions) ? question.subquestions : [],
    sourceMetadata: {
      sourceQuestionId,
      importedFromGroup: GROUP_SLUG,
    },
    version: "1.0",
  };
}

function validateQuestion(question, row) {
  const issues = [];
  if (!question.question) issues.push("missing_question_html");
  if (!stripHtml(question.question)) issues.push("missing_clean_question");
  if (!question.correctAnswer) issues.push("missing_correct_answer");
  if (!question.explanation || !stripHtml(question.explanation)) issues.push("missing_explanation");
  if (!Number.isFinite(question.questionTypeId)) issues.push("invalid_question_type_id");
  if (question.questionTypeId === 1 && question.options.length < 2) issues.push("too_few_options");
  return issues.map((issue) => ({
    issue,
    sourceFileName: row.sourceFileName,
    destinationTopic: row.destinationTopic,
    sourceQuestionId: question.sourceMetadata.sourceQuestionId,
    questionNumber: question.questionNumber,
  }));
}

function buildTopicPayload(topicName, stats, now) {
  const topic = TOPICS[topicName];
  const canonicalUrl = `${SITE_ORIGIN}/${topic.slug}`;
  return {
    pageName: topic.pageName,
    title: topic.pageName,
    heading: topic.pageName,
    description: topic.description,
    cardDescription: topic.description,
    seoLabel: topic.pageName,
    seoSlug: topic.slug,
    slug: topic.slug,
    status: "Published",
    type: "topic",
    pillarId: PILLAR_ID,
    quizCount: stats.quizCount,
    questionCount: stats.questionCount,
    bodyContent: "",
    meta: {
      title: topic.metaTitle,
      description: topic.description,
      keywords: `${topic.pageName}, RN certification practice questions, nursing test bank`,
      ogTitle: topic.metaTitle,
      ogDescription: topic.description,
      ogImage: "/nursing-mocks-logo.png",
      canonicalUrl,
    },
    schema: "",
    hero: {
      title: topic.pageName,
      description: topic.description,
    },
    sourceMetadata: {
      importedFrom: `${GROUP_SLUG}-normalized-name-preview.csv`,
      groupSlug: GROUP_SLUG,
      officialName: topicName,
      plannedQuizCount: stats.quizCount,
      plannedQuestionCount: stats.questionCount,
    },
    lastUpdated: now,
    version: "1.0",
  };
}

function buildQuizPayload(row, sourceJson, questions, ids, now) {
  const baseTitle = row.publicQuizTitle.replace(/\s+-\s+Set\s+\d+$/, "");
  const cleanRowValue = (value) => (value === undefined || value === null ? "" : value);
  return {
    pageName: row.publicQuizTitle,
    quizName: row.publicQuizTitle,
    title: row.publicQuizTitle,
    heading: row.publicQuizTitle,
    slug: row.slug,
    type: "quiz",
    status: "Published",
    pillarId: PILLAR_ID,
    parentId: ids.parentId,
    parentSubPageId: ids.parentId,
    parentSubPageDocId: ids.parentId,
    nestedSubPageId: ids.nestedId,
    nestedSubPageDocId: ids.nestedId,
    topicId: ids.topicId,
    parentSlug: PARENT_SLUG,
    nestedSlug: NESTED_SLUG,
    topicSlug: ids.topicSlug,
    destinationTopic: row.destinationTopic,
    questionCount: questions.length,
    questionsToShow: Number(sourceJson.questionsToShow || questions.length),
    totalQuestions: Number(sourceJson.totalQuestions || questions.length),
    cardLabel: row.cardLabel,
    description: `Practice ${baseTitle}. Review each answer with explanations when available.`,
    publicDescription: `Practice ${baseTitle}. Review each answer with explanations when available.`,
    metaTitle: `${row.publicQuizTitle} Questions and Answers`,
    metaDescription: `Practice with ${questions.length} questions from ${row.publicQuizTitle}.`,
    meta: {
      title: `${row.publicQuizTitle} | NursingMocks`,
      description: `Practice with ${questions.length} questions from ${row.publicQuizTitle}.`,
      keywords: `${row.publicQuizTitle}, RN certification practice questions, nursing test bank`,
      ogTitle: `${row.publicQuizTitle} | NursingMocks`,
      ogDescription: `Practice with ${questions.length} questions from ${row.publicQuizTitle}.`,
      ogImage: "/nursing-mocks-logo.png",
      canonicalUrl: `${SITE_ORIGIN}/${row.slug}`,
    },
    schema: "",
    sourceMetadata: {
      groupSlug: GROUP_SLUG,
      vendor: cleanRowValue(row.vendor),
      program: cleanRowValue(row.program),
      publicProgramLabel: cleanRowValue(row.publicProgramLabel),
      sourceFolder: cleanRowValue(row.sourceFolder),
      sourceFileName: cleanRowValue(row.sourceFileName),
      sourceFileNumber: cleanRowValue(row.sourceFileNumber),
      sourceSubtopic: cleanRowValue(row.sourceSubtopic),
      sourceSubtopicSlug: cleanRowValue(row.sourceSubtopicSlug),
      sourceTopicId: cleanRowValue(row.sourceTopicId),
      destinationPath: cleanRowValue(row.destinationPath),
      normalizationNotes: cleanRowValue(row.normalizationNotes),
      importedFromPreview: `${GROUP_SLUG}-normalized-name-preview.csv`,
    },
    lastUpdated: now,
    version: "1.0",
  };
}

function createBatchWriter(db) {
  let batch = db.batch();
  let writes = 0;
  const commits = [];
  return {
    set(ref, data, options) {
      if (options) batch.set(ref, data, options);
      else batch.set(ref, data);
      writes += 1;
      if (writes >= 400) {
        commits.push(batch.commit());
        batch = db.batch();
        writes = 0;
      }
    },
    delete(ref) {
      batch.delete(ref);
      writes += 1;
      if (writes >= 400) {
        commits.push(batch.commit());
        batch = db.batch();
        writes = 0;
      }
    },
    async flush() {
      if (writes > 0) commits.push(batch.commit());
      await Promise.all(commits);
    },
  };
}

async function findDocBySlug(collectionRef, slug) {
  const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function upsertRouteMapping(db, mapping, dryRun) {
  if (dryRun) return { action: "planned" };
  const refByPath = await db.collection("routeMappings").where("refPath", "==", mapping.refPath).limit(1).get();
  const payload = {
    ...mapping,
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };
  if (!refByPath.empty) {
    await refByPath.docs[0].ref.set(payload, { merge: true });
    return { action: "updated", id: refByPath.docs[0].id };
  }

  const refBySlug = await db
    .collection("routeMappings")
    .where("pillarId", "==", mapping.pillarId)
    .where("slug", "==", mapping.slug)
    .limit(1)
    .get();
  if (!refBySlug.empty) {
    await refBySlug.docs[0].ref.set(payload, { merge: true });
    return { action: "updated", id: refBySlug.docs[0].id };
  }

  const ref = await db.collection("routeMappings").add({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { action: "created", id: ref.id };
}

async function resolveTarget(db) {
  const parentCollection = db.collection(`pillarPages/${PILLAR_ID}/subPages`);
  const parentDoc = (await findDocBySlug(parentCollection, PARENT_SLUG)) || (await parentCollection.doc(PARENT_ID_FALLBACK).get());
  if (!parentDoc.exists) throw new Error(`Parent page not found: ${PARENT_SLUG}`);

  const nestedCollection = parentDoc.ref.collection("nestedSubPages");
  const nestedDoc = (await findDocBySlug(nestedCollection, NESTED_SLUG)) || (await nestedCollection.doc(NESTED_ID_FALLBACK).get());
  if (!nestedDoc.exists) throw new Error(`Nested page not found: ${NESTED_SLUG}`);
  return { parentDoc, nestedDoc };
}

function loadPlan(cleanupRoot) {
  const previewPath = path.join(cleanupRoot, `${GROUP_SLUG}-normalized-name-preview.csv`);
  const manifestPath = path.join(cleanupRoot, `${GROUP_SLUG}-cleaned-manifest.csv`);
  if (!fs.existsSync(previewPath)) throw new Error(`Preview CSV not found: ${previewPath}`);
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest CSV not found: ${manifestPath}`);

  const previewRows = parseCsv(fs.readFileSync(previewPath, "utf8"));
  const manifestRows = parseCsv(fs.readFileSync(manifestPath, "utf8"));
  const manifestByKey = new Map(manifestRows.map((row) => [`${row.sourceFolder}|${row.sourceFileName}`, row]));
  return previewRows
    .filter((row) => manifestByKey.get(`${row.sourceFolder}|${row.sourceFileName}`)?.action === "import")
    .map((row) => ({
      ...row,
      destinationTopic: normalizeDestinationTopic(row.destinationTopic),
      destinationPath: resolveDestinationPath(row, cleanupRoot),
    }));
}

function buildImportItems(rows, limit) {
  const items = [];
  const questionIssues = [];
  const topicStats = new Map();

  for (const row of rows) {
    if (limit && items.length >= limit) break;
    if (!TOPICS[row.destinationTopic]) throw new Error(`Missing topic configuration: ${row.destinationTopic}`);
    if (!row.destinationPath || !fs.existsSync(row.destinationPath)) {
      throw new Error(`Destination JSON not found for ${row.sourceFileName}: ${row.destinationPath}`);
    }

    const sourceJson = readJson(row.destinationPath);
    const sourceQuestions = Array.isArray(sourceJson.questions) ? sourceJson.questions : [];
    const questions = sourceQuestions.map(normalizeQuestion);
    questions.forEach((question) => questionIssues.push(...validateQuestion(question, row)));

    const stats = topicStats.get(row.destinationTopic) || { quizCount: 0, questionCount: 0 };
    stats.quizCount += 1;
    stats.questionCount += questions.length;
    topicStats.set(row.destinationTopic, stats);

    items.push({ row, sourceJson, questions });
  }

  return { items, questionIssues, topicStats };
}

async function ensureTopics(db, target, topicStats, dryRun) {
  const now = new Date().toISOString();
  const topicsCollection = target.nestedDoc.ref.collection("topics");
  const results = new Map();

  for (const [topicName, stats] of topicStats.entries()) {
    const topic = TOPICS[topicName];
    const existingDoc = await findDocBySlug(topicsCollection, topic.slug);
    const topicRef = existingDoc ? existingDoc.ref : topicsCollection.doc();
    const refPath = topicRef.path;
    const payload = {
      ...buildTopicPayload(topicName, stats, now),
      parentId: target.parentDoc.id,
      nestedSubPageId: target.nestedDoc.id,
      contentPath: refPath,
    };

    if (!dryRun) {
      await topicRef.set(payload, { merge: true });
      await upsertRouteMapping(
        db,
        {
          type: "topic",
          pillarId: PILLAR_ID,
          slug: topic.slug,
          subPageId: target.parentDoc.id,
          nestedPageId: target.nestedDoc.id,
          topicId: topicRef.id,
          quizId: null,
          refPath,
          contentPath: refPath,
          title: topic.pageName,
          examAccessProductId: "nursing_test_bank",
        },
        dryRun
      );
    }

    results.set(topicName, {
      topicId: topicRef.id,
      topicSlug: topic.slug,
      action: existingDoc ? "update" : "create",
      quizCount: stats.quizCount,
      questionCount: stats.questionCount,
    });
  }

  return results;
}

function uniqueQuestionDocId(question, index, usedIds) {
  const base = slugify(question.questionId) || `question-${index + 1}`;
  let candidate = base;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

async function writeQuiz(db, target, topicInfo, item) {
  const now = new Date().toISOString();
  const quizzesCollection = target.nestedDoc.ref.collection("topics").doc(topicInfo.topicId).collection("quizzes");
  const existingDoc = await findDocBySlug(quizzesCollection, item.row.slug);
  const quizRef = existingDoc ? existingDoc.ref : quizzesCollection.doc();
  const refPath = quizRef.path;
  const quizPayload = {
    ...buildQuizPayload(
      item.row,
      item.sourceJson,
      item.questions,
      {
        parentId: target.parentDoc.id,
        nestedId: target.nestedDoc.id,
        topicId: topicInfo.topicId,
        topicSlug: topicInfo.topicSlug,
      },
      now
    ),
    contentPath: refPath,
  };

  const writer = createBatchWriter(db);
  writer.set(quizRef, quizPayload, { merge: true });

  if (existingDoc) {
    const existingQuestions = await quizRef.collection("questions").get();
    existingQuestions.docs.forEach((doc) => writer.delete(doc.ref));
  }

  const usedQuestionIds = new Set();
  item.questions.forEach((question, index) => {
    const questionDocId = uniqueQuestionDocId(question, index, usedQuestionIds);
    writer.set(quizRef.collection("questions").doc(questionDocId), {
      ...question,
      id: questionDocId,
      lastUpdated: now,
    });
  });

  await writer.flush();

  await upsertRouteMapping(db, {
    type: "quiz",
    pillarId: PILLAR_ID,
    slug: item.row.slug,
    subPageId: target.parentDoc.id,
    nestedPageId: target.nestedDoc.id,
    topicId: topicInfo.topicId,
    quizId: quizRef.id,
    refPath,
    contentPath: refPath,
    title: item.row.publicQuizTitle,
    examAccessProductId: "nursing_test_bank",
  });

  return { quizId: quizRef.id, action: existingDoc ? "updated" : "created", questionCount: item.questions.length };
}

async function getExistingQuizState(target, topicInfo, item) {
  const quizzesCollection = target.nestedDoc.ref.collection("topics").doc(topicInfo.topicId).collection("quizzes");
  const existingDoc = await findDocBySlug(quizzesCollection, item.row.slug);
  if (!existingDoc) return null;
  const questionCount = (await existingDoc.ref.collection("questions").count().get()).data().count;
  return {
    quizId: existingDoc.id,
    questionCount,
    complete: questionCount === item.questions.length,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const rows = loadPlan(args.cleanupRoot);
  const { items, questionIssues, topicStats } = buildImportItems(rows, args.limit);
  const blockingIssues = questionIssues.filter((row) => row.issue !== "missing_explanation");

  if (blockingIssues.length) {
    console.error(`Blocking question issues found: ${blockingIssues.length}`);
    console.error(blockingIssues.slice(0, 10));
    process.exitCode = 1;
    return;
  }

  loadLocalEnv();
  const db = getDb();
  const target = await resolveTarget(db);

  if (AUDIT) {
    const topicsCollection = target.nestedDoc.ref.collection("topics");
    const auditRows = [];
    for (const [topicName, expected] of topicStats.entries()) {
      const topic = TOPICS[topicName];
      const topicDoc = await findDocBySlug(topicsCollection, topic.slug);
      if (!topicDoc) {
        auditRows.push({
          topicName,
          topicSlug: topic.slug,
          exists: false,
          expectedQuizzes: expected.quizCount,
          actualQuizzes: 0,
          expectedQuestions: expected.questionCount,
          actualQuestions: 0,
        });
        continue;
      }

      const quizzes = await topicDoc.ref.collection("quizzes").get();
      let actualQuestions = 0;
      for (const quizDoc of quizzes.docs) {
        const countSnapshot = await quizDoc.ref.collection("questions").count().get();
        actualQuestions += countSnapshot.data().count;
      }
      auditRows.push({
        topicName,
        topicSlug: topic.slug,
        topicId: topicDoc.id,
        exists: true,
        expectedQuizzes: expected.quizCount,
        actualQuizzes: quizzes.size,
        expectedQuestions: expected.questionCount,
        actualQuestions,
      });
    }

    const summary = {
      mode: "audit",
      parentId: target.parentDoc.id,
      nestedId: target.nestedDoc.id,
      expectedQuizzes: items.length,
      actualQuizzes: auditRows.reduce((sum, row) => sum + row.actualQuizzes, 0),
      expectedQuestions: items.reduce((sum, item) => sum + item.questions.length, 0),
      actualQuestions: auditRows.reduce((sum, row) => sum + row.actualQuestions, 0),
      topics: auditRows,
    };
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const topicResults = await ensureTopics(db, target, topicStats, !APPLY);

  const summary = {
    mode: APPLY ? "apply" : "dry-run",
    cleanupRoot: args.cleanupRoot,
    parentId: target.parentDoc.id,
    nestedId: target.nestedDoc.id,
    plannedQuizzes: items.length,
    plannedQuestions: items.reduce((sum, item) => sum + item.questions.length, 0),
    missingExplanationRows: questionIssues.filter((row) => row.issue === "missing_explanation").length,
    blockingQuestionIssues: blockingIssues.length,
    topics: Array.from(topicResults.entries()).map(([topicName, result]) => ({ topicName, ...result })),
    imported: [],
  };

  if (APPLY) {
    let index = 0;
    for (const item of items) {
      index += 1;
      const topicInfo = topicResults.get(item.row.destinationTopic);
      if (SKIP_COMPLETE) {
        const existing = await getExistingQuizState(target, topicInfo, item);
        if (existing?.complete) {
          summary.imported.push({
            index,
            sourceFileName: item.row.sourceFileName,
            destinationTopic: item.row.destinationTopic,
            slug: item.row.slug,
            quizId: existing.quizId,
            action: "skipped-complete",
            questionCount: existing.questionCount,
          });
          console.log(`SKIPPED COMPLETE ${index}/${items.length}: ${item.row.publicQuizTitle}`);
          continue;
        }
      }
      const result = await writeQuiz(db, target, topicInfo, item);
      summary.imported.push({
        index,
        sourceFileName: item.row.sourceFileName,
        destinationTopic: item.row.destinationTopic,
        slug: item.row.slug,
        ...result,
      });
      console.log(`${result.action.toUpperCase()} ${index}/${items.length}: ${item.row.publicQuizTitle}`);
    }
  }

  const outputDir = path.join(args.cleanupRoot, "import-dry-run");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${GROUP_SLUG}-real-import-${APPLY ? "apply" : "dry-run"}-summary.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Summary written to ${outputPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(getApps().map((app) => app.delete()));
  });


