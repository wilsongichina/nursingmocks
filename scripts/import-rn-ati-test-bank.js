const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex cleanup\\Nursing Test Bank\\RN\\ATI";
const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "rn-exams";
const NESTED_SLUG = "ati-rn-exams";
const GROUP_SLUG = "ati-rn-test-bank";
const SITE_ORIGIN = "https://www.nursingmocks.com";
const APPLY = process.argv.includes("--apply");
const AUDIT = process.argv.includes("--audit");
const MISSING_ONLY = process.argv.includes("--missing-only");
const LIMIT_INDEX = process.argv.indexOf("--limit");
const LIMIT = LIMIT_INDEX >= 0 ? Number(process.argv[LIMIT_INDEX + 1]) : null;
const TOPICS_INDEX = process.argv.indexOf("--topics");
const ONLY_TOPICS = TOPICS_INDEX >= 0
  ? new Set(process.argv[TOPICS_INDEX + 1].split(",").map((value) => value.trim()).filter(Boolean))
  : null;

const TOPICS = {
  "Adult Medical Surgical": "ati-med-surg-proctored-exam-practice-questions",
  "Anatomy and Physiology": "ati-rn-anatomy-and-physiology-practice-questions",
  "Capstone": "ati-rn-capstone-practice-questions",
  "Communication": "ati-rn-communication-practice-questions",
  "Community Health": "ati-community-health-test-bank-practice-questions",
  "Comprehensive Review": "ati-rn-comprehensive-predictor-practice-questions",
  "Dosage Calculations": "ati-dosage-calculation-proctored-exam-practice-questions",
  "Fundamentals": "ati-fundamentals-proctored-exam-practice-questions",
  "Gerontology": "ati-rn-gerontology-practice-questions",
  "Health Assessment": "ati-rn-health-assessment-practice-questions",
  "Leadership and Management": "ati-leadership-proctored-exam-practice-questions",
  "Maternal Newborn": "ati-maternal-newborn-test-bank-practice-questions",
  "Mental Health": "ati-mental-health-proctored-exam-practice-questions",
  "Nursing Care of Children": "ati-rn-nursing-care-of-children-practice-questions",
  "Nursing Informatics": "ati-rn-nursing-informatics-practice-questions",
  "Nutrition": "ati-nutrition-practice-questions",
  "Pathophysiology": "ati-rn-pathophysiology-practice-questions",
  "Pharmacology": "ati-pharmacology-proctored-exam-practice-questions",
};

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function credential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  throw new Error("Firebase Admin credentials are not configured.");
}

function db() {
  if (!getApps().length) initializeApp({ credential: credential() });
  return getFirestore();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/#/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleFromFile(file) {
  return path.basename(file, ".json")
    .replace(/^\d+\s*-\s*/, "")
    .replace(/[\u00a0_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bati\b/gi, "ATI")
    .replace(/\brn\b/gi, "RN")
    .replace(/\blpn\b/gi, "LPN")
    .replace(/\bpn\b/gi, "PN");
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function parseOptions(options) {
  if (!options) return [];
  try {
    const parsed = typeof options === "string" ? JSON.parse(options) : options;
    if (Array.isArray(parsed)) return parsed.map((value) => String(value || "").trim());
    return Object.keys(parsed).sort().map((key) => {
      const value = parsed[key];
      if (value && typeof value === "object" && "choice" in value) return String(value.choice || "").trim();
      return String(value || "").trim();
    });
  } catch {
    return [];
  }
}

function correctAnswer(question) {
  const type = Number(question.question_type_id || question.questionTypeId || 1);
  const value = question.correctAnswer || question.correct_answer || "";
  if (type !== 7) return value;
  if (Array.isArray(value)) return value;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [String(value)];
  }
}

function normalizeQuestion(question, index) {
  const html = question.question || question.questionText || question.text || question.stem || "";
  const clean = stripHtml(html);
  const sourceQuestionId = String(question.id || question.questionId || "");
  return {
    question: html,
    passage: question.passage || "",
    options: parseOptions(question.options),
    correctAnswer: correctAnswer(question),
    explanation: question.solution || question.explanation || "",
    questionTypeId: Number(question.question_type_id || question.questionTypeId || 1),
    slug: slugify(clean.slice(0, 180)) || `question-${index + 1}`,
    originalId: sourceQuestionId,
    questionId: sourceQuestionId,
    questionNumber: index + 1,
    displayOrder: index + 1,
    meta: { title: "", description: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "", canonicalUrl: "" },
    schema: "",
    status: "published",
    tabs: question.tabs || null,
    matchOption: question.match_option || null,
    imagePath: question.image_path || null,
    units: question.units || null,
    subquestions: Array.isArray(question.subquestions) ? question.subquestions : [],
    sourceMetadata: { sourceQuestionId, importedFromGroup: GROUP_SLUG },
    version: "1.0",
  };
}

function readQuestions(file) {
  const json = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const questions = Array.isArray(json) ? json : Array.isArray(json.questions) ? json.questions : Array.isArray(json.data) ? json.data : [];
  return { json, questions };
}

function walkJson(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walkJson(full));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) output.push(full);
  }
  return output;
}

function quizSlug(file, used) {
  const title = titleFromFile(file);
  const number = (path.basename(file).match(/^(\d+)\s*-/) || [])[1];
  let base = slugify(title);
  if (!base.endsWith("practice-questions")) base = `${base}-practice-questions`;
  let candidate = base;
  if (used.has(candidate) && number) candidate = `${base}-set-${number}`;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function buildItems() {
  const used = new Set();
  const items = [];
  const skippedEmpty = [];
  for (const [topic, topicSlug] of Object.entries(TOPICS)) {
    const dir = path.join(ROOT, topic);
    const files = walkJson(dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const file of files) {
      const { json, questions } = readQuestions(file);
      if (!questions.length) {
        skippedEmpty.push(path.relative(ROOT, file));
        continue;
      }
      const normalized = questions.map(normalizeQuestion);
      const title = `${titleFromFile(file)} Practice Questions`;
      items.push({ topic, topicSlug, file, fileName: path.basename(file), sourceJson: json, questions: normalized, title, slug: quizSlug(file, used) });
      if (LIMIT && items.length >= LIMIT) return { items, skippedEmpty };
    }
  }
  return { items, skippedEmpty };
}

async function findBySlug(collectionRef, slug) {
  const snap = await collectionRef.where("slug", "==", slug).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function target(db) {
  const parent = await findBySlug(db.collection(`pillarPages/${PILLAR_ID}/subPages`), PARENT_SLUG);
  if (!parent) throw new Error(`Missing parent ${PARENT_SLUG}`);
  const nested = await findBySlug(parent.ref.collection("nestedSubPages"), NESTED_SLUG);
  if (!nested) throw new Error(`Missing nested ${NESTED_SLUG}`);
  return { parent, nested };
}

function batchWriter(db) {
  let batch = db.batch();
  let writes = 0;
  const commits = [];
  async function rotate() {
    if (writes < 400) return;
    commits.push(batch.commit());
    if (commits.length >= 3) await Promise.all(commits.splice(0));
    batch = db.batch();
    writes = 0;
  }
  return {
    async set(ref, data, options) { options ? batch.set(ref, data, options) : batch.set(ref, data); writes++; await rotate(); },
    async delete(ref) { batch.delete(ref); writes++; await rotate(); },
    async flush() { if (writes) commits.push(batch.commit()); await Promise.all(commits); },
  };
}

function questionId(question, index, used) {
  const base = slugify(question.questionId) || `question-${index + 1}`;
  let id = base;
  let suffix = 2;
  while (used.has(id)) id = `${base}-${suffix++}`;
  used.add(id);
  return id;
}

function quizPayload(item, ids, now) {
  const count = item.questions.length;
  return {
    pageName: item.title,
    quizName: item.title,
    title: item.title,
    heading: item.title,
    slug: item.slug,
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
    topicSlug: item.topicSlug,
    destinationTopic: item.topic,
    questionCount: count,
    questionsToShow: Number(item.sourceJson.questionsToShow || count),
    totalQuestions: Number(item.sourceJson.totalQuestions || count),
    description: `Practice ${item.title.replace(/\s+Practice Questions$/, "")}. Review each answer with explanations when available.`,
    publicDescription: `Practice ${item.title.replace(/\s+Practice Questions$/, "")}. Review each answer with explanations when available.`,
    metaTitle: `${item.title} Questions and Answers`,
    metaDescription: `Practice with ${count} questions from ${item.title}.`,
    meta: { title: `${item.title} | NursingMocks`, description: `Practice with ${count} questions from ${item.title}.`, keywords: `${item.title}, ATI RN practice questions, nursing test bank`, ogTitle: `${item.title} | NursingMocks`, ogDescription: `Practice with ${count} questions from ${item.title}.`, ogImage: "/nursing-mocks-logo.png", canonicalUrl: `${SITE_ORIGIN}/${item.slug}` },
    schema: "",
    sourceMetadata: { groupSlug: GROUP_SLUG, vendor: "ATI", program: "RN", sourceFolder: item.topic, sourceFileName: item.fileName, destinationPath: item.file, importedFrom: "RN ATI cleaned direct import" },
    lastUpdated: now,
    version: "1.0",
  };
}

async function upsertRoute(db, mapping) {
  const payload = { ...mapping, updatedAt: FieldValue.serverTimestamp(), lastUpdated: new Date().toISOString() };
  const byPath = await db.collection("routeMappings").where("refPath", "==", mapping.refPath).limit(1).get();
  if (!byPath.empty) return byPath.docs[0].ref.set(payload, { merge: true });
  const bySlug = await db.collection("routeMappings").where("slug", "==", mapping.slug).limit(1).get();
  if (!bySlug.empty) {
    const data = bySlug.docs[0].data();
    if (data.refPath && data.refPath !== mapping.refPath) throw new Error(`Slug collision for ${mapping.slug}: ${data.refPath}`);
    return bySlug.docs[0].ref.set(payload, { merge: true });
  }
  return db.collection("routeMappings").add({ ...payload, createdAt: FieldValue.serverTimestamp() });
}

async function main() {
  loadEnv();
  const firestore = db();
  const tgt = await target(firestore);
  const { items, skippedEmpty } = buildItems();
  const routeCollisions = [];
  const adjustedSlugs = [];
  const routeSnapshot = await firestore.collection("routeMappings").get();
  const existingRoutesBySlug = new Map();
  routeSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.slug) existingRoutesBySlug.set(data.slug, data.refPath || "");
  });
  const topicDocs = new Map();
  for (const [topic, slug] of Object.entries(TOPICS)) {
    const doc = await findBySlug(tgt.nested.ref.collection("topics"), slug);
    if (!doc) throw new Error(`Missing live topic ${topic}: ${slug}`);
    topicDocs.set(topic, doc);
  }
  const usedFinalSlugs = new Set(existingRoutesBySlug.keys());
  for (const item of items) {
    const originalSlug = item.slug;
    if (usedFinalSlugs.has(item.slug)) {
      const existingRefPath = existingRoutesBySlug.get(item.slug);
      const topicDoc = topicDocs.get(item.topic);
      if (existingRefPath && topicDoc && existingRefPath.includes(`/topics/${topicDoc.id}/quizzes/`)) {
        usedFinalSlugs.add(item.slug);
        continue;
      }
      const number = (item.fileName.match(/^(\\d+)\\s*-/) || [])[1];
      const base = item.slug;
      let candidate = number ? `${base}-set-${number}` : `${base}-ati-rn`;
      let suffix = 2;
      while (usedFinalSlugs.has(candidate)) {
        candidate = number ? `${base}-set-${number}-${suffix}` : `${base}-ati-rn-${suffix}`;
        suffix += 1;
      }
      item.slug = candidate;
      adjustedSlugs.push({ sourceFileName: item.fileName, from: originalSlug, to: item.slug, existingRefPath: existingRoutesBySlug.get(originalSlug) });
    }
    usedFinalSlugs.add(item.slug);
  }
  const activeItems = ONLY_TOPICS ? items.filter((item) => ONLY_TOPICS.has(item.topic)) : items;
  const stats = new Map();
  for (const item of activeItems) {
    const s = stats.get(item.topic) || { quizzes: 0, questions: 0 };
    s.quizzes++;
    s.questions += item.questions.length;
    stats.set(item.topic, s);
  }
  let importItems = items;
  importItems = activeItems;
  const existingStatus = [];
  if (MISSING_ONLY) {
    importItems = [];
    for (const item of activeItems) {
      const topicDoc = topicDocs.get(item.topic);
      const existing = await findBySlug(topicDoc.ref.collection("quizzes"), item.slug);
      if (!existing) {
        importItems.push(item);
        existingStatus.push({ topic: item.topic, slug: item.slug, status: "missing" });
        continue;
      }
      const existingData = existing.data();
      const expectedCount = item.questions.length;
      const storedCount = Number(existingData.questionCount || existingData.totalQuestions || existingData.questionsToShow || 0);
      const actualQuestionCount = (await existing.ref.collection("questions").count().get()).data().count;
      if (storedCount !== expectedCount || actualQuestionCount !== expectedCount) {
        importItems.push(item);
        existingStatus.push({ topic: item.topic, slug: item.slug, status: "incomplete", storedCount, actualQuestionCount, expectedCount });
      }
    }
  }
  const importStats = new Map();
  for (const item of importItems) {
    const s = importStats.get(item.topic) || { quizzes: 0, questions: 0 };
    s.quizzes++;
    s.questions += item.questions.length;
    importStats.set(item.topic, s);
  }
  const summary = { mode: APPLY ? "apply" : AUDIT ? "audit" : "dry-run", missingOnly: MISSING_ONLY, topicFilter: ONLY_TOPICS ? Array.from(ONLY_TOPICS) : null, totalSourceFilesWithQuestions: items.length, sourceFilesWithQuestions: activeItems.length, skippedEmpty, plannedQuestions: activeItems.reduce((sum, item) => sum + item.questions.length, 0), importFiles: importItems.length, importQuestions: importItems.reduce((sum, item) => sum + item.questions.length, 0), routeCollisions: routeCollisions.length, adjustedSlugs, topics: Array.from(stats.entries()).map(([topic, s]) => ({ topic, ...s })), importTopics: Array.from(importStats.entries()).map(([topic, s]) => ({ topic, ...s })), existingStatus: existingStatus.slice(0, 25), imported: [] };
  if (routeCollisions.length) {
    console.error(JSON.stringify({ ...summary, routeCollisions: routeCollisions.slice(0, 30) }, null, 2));
    process.exitCode = 1;
    return;
  }
  if (!APPLY) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  let index = 0;
  for (const item of importItems) {
    index++;
    const now = new Date().toISOString();
    const topicDoc = topicDocs.get(item.topic);
    const existing = await findBySlug(topicDoc.ref.collection("quizzes"), item.slug);
    if (existing) {
      const existingData = existing.data();
      const expectedCount = item.questions.length;
      const storedCount = Number(existingData.questionCount || existingData.totalQuestions || existingData.questionsToShow || 0);
      const actualQuestionCount = (await existing.ref.collection("questions").count().get()).data().count;
      if (storedCount === expectedCount && actualQuestionCount === expectedCount) {
        summary.imported.push({ index, topic: item.topic, slug: item.slug, quizId: existing.id, action: "skipped-complete", questionCount: expectedCount });
        if (index % 10 === 0 || index === items.length) console.log(`Checked ${index}/${items.length}; skipped complete quiz`);
        continue;
      }
    }
    const quizRef = existing ? existing.ref : topicDoc.ref.collection("quizzes").doc();
    const writer = batchWriter(firestore);
    await writer.set(quizRef, { ...quizPayload(item, { parentId: tgt.parent.id, nestedId: tgt.nested.id, topicId: topicDoc.id }, now), contentPath: quizRef.path }, { merge: true });
    if (existing) {
      const oldQuestions = await quizRef.collection("questions").get();
      for (const doc of oldQuestions.docs) await writer.delete(doc.ref);
    }
    const usedQuestionIds = new Set();
    for (let i = 0; i < item.questions.length; i++) {
      const id = questionId(item.questions[i], i, usedQuestionIds);
      await writer.set(quizRef.collection("questions").doc(id), { ...item.questions[i], id, lastUpdated: now });
    }
    await writer.flush();
    await upsertRoute(firestore, { type: "quiz", pillarId: PILLAR_ID, slug: item.slug, subPageId: tgt.parent.id, nestedPageId: tgt.nested.id, topicId: topicDoc.id, quizId: quizRef.id, refPath: quizRef.path, contentPath: quizRef.path, title: item.title, examAccessProductId: "nursing_test_bank" });
    summary.imported.push({ index, topic: item.topic, slug: item.slug, quizId: quizRef.id, questionCount: item.questions.length });
    if (index % 10 === 0 || index === importItems.length) console.log(`Imported ${index}/${importItems.length}`);
  }
  for (const [topic, s] of stats.entries()) await topicDocs.get(topic).ref.set({ quizCount: s.quizzes, questionCount: s.questions, lastUpdated: new Date().toISOString() }, { merge: true });
  const outDir = path.join(ROOT, "import-dry-run");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${GROUP_SLUG}-import-summary.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ...summary, imported: summary.imported.length }, null, 2));
  console.log(`Summary written to ${outPath}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await Promise.all(getApps().map((app) => app.delete())); });





