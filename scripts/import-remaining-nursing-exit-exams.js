const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const SOURCE_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex\\Nursing Exit Exams";
const PILLAR_ID = "nursing-exit-exam";
const SITE_ORIGIN = "https://www.nursingmocks.com";
const APPLY = process.argv.includes("--apply");

const FOLDER_MAPPINGS = [
  {
    folder: path.join(SOURCE_ROOT, "LPN", "ATI"),
    importLabel: "LPN ATI",
    parentSlug: "lpn-exit-exams",
    nestedSlug: "ati-lpn-comprehensive-predictor",
    alreadyImportedSourceNumbers: new Set([1, 2, 3, 4]),
  },
  {
    folder: path.join(SOURCE_ROOT, "LPN", "HESI"),
    importLabel: "LPN HESI",
    parentSlug: "lpn-exit-exams",
    nestedSlug: "hesi-lpn-exit-exam",
    alreadyImportedSourceNumbers: new Set([1, 2, 3, 4]),
  },
  {
    folder: path.join(SOURCE_ROOT, "RN", "ATI"),
    importLabel: "RN ATI",
    parentSlug: "rn-exit-exams",
    nestedSlug: "ati-rn-comprehensive-predictor",
    alreadyImportedSourceNumbers: new Set([1, 2, 3, 4]),
  },
  {
    folder: path.join(SOURCE_ROOT, "RN", "HESI"),
    importLabel: "RN HESI",
    parentSlug: "rn-exit-exams",
    nestedSlug: "hesi-rn-exit-exam",
    alreadyImportedSourceNumbers: new Set([1, 2, 3, 4]),
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

  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  throw new Error("Firebase Admin credentials are not configured.");
}

function getDb() {
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

function getSourceNumber(filename) {
  const match = filename.match(/^(\d+)\s*[-–]\s*/);
  return match ? Number(match[1]) : null;
}

function cleanSourceBase(filename) {
  return path.basename(filename, ".json")
    .replace(/\u00a0/g, " ")
    .replace(/^\d+\s*[-–]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toDisplayTitle(value) {
  const acronyms = new Set(["ati", "rn", "lpn", "pn", "hesi", "vati", "ngn", "ca", "u"]);
  const romanNumerals = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"]);
  return value
    .split(" ")
    .map((word) => {
      const parts = word.split(/([()/-])/);
      return parts
        .map((part) => {
          const lower = part.toLowerCase();
          if (!part || /[()/-]/.test(part)) return part;
          if (acronyms.has(lower) || romanNumerals.has(lower)) return lower.toUpperCase();
          if (/^\d+$/.test(part)) return part;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function stripHtmlTags(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, "").trim();
}

function generateQuestionSlug(questionText) {
  const cleanText = stripHtmlTags(questionText).substring(0, 180);
  return slugify(cleanText.replace(/nbsp/g, "").replace(/&nbsp;/g, ""));
}

function parseOptions(question) {
  if (!question.options) return [];
  const optionsString = typeof question.options === "string" ? question.options : JSON.stringify(question.options);
  const optionsObject = JSON.parse(optionsString);
  return Object.keys(optionsObject)
    .sort()
    .map((key) => {
      const option = optionsObject[key];
      let optionText = "";
      if (typeof option === "object" && option !== null && option.choice) {
        optionText = String(option.choice).trim();
      } else if (typeof option === "string") {
        optionText = option.trim();
      } else {
        optionText = String(option || "").trim();
      }

      let cleaned = optionText;
      let changed = true;
      const quoteChars = ['"', "'", "\u201C", "\u201D", "\u2018", "\u2019"];
      while (changed && cleaned.length >= 2) {
        changed = false;
        for (const quote of quoteChars) {
          if (cleaned.startsWith(quote) && cleaned.endsWith(quote)) {
            cleaned = cleaned.slice(1, -1).trim();
            changed = true;
            break;
          }
        }
      }
      return cleaned;
    });
}

function normalizeCorrectAnswer(question) {
  const questionTypeId = question.question_type_id || 1;
  let correctAnswer = question.correctAnswer || question.correct_answer || "";
  if (questionTypeId !== 7) return correctAnswer;

  if (typeof correctAnswer === "string") {
    try {
      const parsed = JSON.parse(correctAnswer);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [correctAnswer];
    }
  }

  return Array.isArray(correctAnswer) ? correctAnswer : [String(correctAnswer)];
}

function buildQuestionContent(question, index) {
  const questionTypeId = question.question_type_id || 1;
  return {
    question: question.question || "",
    passage: question.passage || "",
    options: parseOptions(question),
    correctAnswer: normalizeCorrectAnswer(question),
    explanation: question.solution || question.explanation || "",
    questionTypeId,
    slug: generateQuestionSlug(question.question || ""),
    originalId: question.id?.toString() || "",
    questionId: question.id?.toString() || question.questionId?.toString() || "",
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
    subquestions: question.subquestions || [],
    lastUpdated: new Date().toISOString(),
    version: "1.0",
  };
}

function makeUniqueTitle(baseTitle, usedTitles) {
  if (!usedTitles.has(baseTitle.toLowerCase())) {
    usedTitles.add(baseTitle.toLowerCase());
    return baseTitle;
  }

  let suffix = 2;
  let candidate = `${baseTitle} Form ${suffix}`;
  while (usedTitles.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${baseTitle} Form ${suffix}`;
  }
  usedTitles.add(candidate.toLowerCase());
  return candidate;
}

function makeUniqueSlug(baseSlug, usedSlugs) {
  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-form-${suffix}`;
  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-form-${suffix}`;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function buildMeta({ title, slug, questionCount }) {
  const description = `${title} practice questions and answers for Nursing Exit Exam review.`;
  const publicDescription = `${description} Use this quiz to review exit-style nursing concepts and track readiness.`;
  return {
    quizName: title,
    pageName: title,
    title,
    description: publicDescription,
    publicDescription,
    metaTitle: `${title} Questions and Answers`,
    metaDescription: description,
    questionCount,
    meta: {
      title: `${title} | NursingMocks`,
      description,
      keywords: "",
      ogTitle: `${title} | NursingMocks`,
      ogDescription: description,
      ogImage: "/nursing-mocks-logo.png",
      canonicalUrl: `${SITE_ORIGIN}/${slug}`,
    },
  };
}

async function findTarget(db, mapping) {
  const parents = await db.collection(`pillarPages/${PILLAR_ID}/subPages`).where("slug", "==", mapping.parentSlug).limit(1).get();
  if (parents.empty) throw new Error(`Parent not found: ${mapping.parentSlug}`);
  const parentDoc = parents.docs[0];
  const parent = parentDoc.data();
  const nested = await parentDoc.ref.collection("nestedSubPages").where("slug", "==", mapping.nestedSlug).limit(1).get();
  if (nested.empty) throw new Error(`Nested page not found: ${mapping.nestedSlug}`);
  const nestedDoc = nested.docs[0];
  const nestedData = nestedDoc.data();
  return { parentDoc, parent, nestedDoc, nested: nestedData };
}

async function loadExistingIdentity(db, nestedDoc) {
  const quizzes = await nestedDoc.ref.collection("quizzes").get();
  const usedTitles = new Set();
  const usedSlugs = new Set();
  const sourceFiles = new Set();
  quizzes.forEach((doc) => {
    const data = doc.data();
    if (data.quizName || data.pageName || data.title) usedTitles.add(String(data.quizName || data.pageName || data.title).toLowerCase());
    if (data.slug) usedSlugs.add(String(data.slug));
    if (data.source?.sourceFile) sourceFiles.add(path.normalize(data.source.sourceFile));
  });
  return { usedTitles, usedSlugs, sourceFiles };
}

function readSourceFile(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(raw.questions)) {
    throw new Error("Source JSON does not contain a questions array.");
  }

  const optionErrors = [];
  raw.questions.forEach((question, index) => {
    try {
      parseOptions(question);
    } catch (error) {
      optionErrors.push({ questionIndex: index + 1, id: question.id, error: error.message });
    }
  });

  return { raw, optionErrors };
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
    async flush() {
      if (writes > 0) commits.push(batch.commit());
      await Promise.all(commits);
    },
  };
}

async function writeQuiz(db, target, item) {
  const quizRef = target.nestedDoc.ref.collection("quizzes").doc();
  const firestorePath = `${target.nestedDoc.ref.path}/quizzes/${quizRef.id}`;
  const publicPath = `${target.parent.slug}/${target.nested.slug}/${item.slug}`;
  const now = new Date().toISOString();
  const meta = buildMeta({ title: item.title, slug: item.slug, questionCount: item.questions.length });

  const quizContent = {
    ...meta,
    slug: item.slug,
    type: "quiz",
    status: "Published",
    parentId: target.parentDoc.id,
    parentSubPageId: target.parentDoc.id,
    parentSubPageDocId: target.parentDoc.id,
    parentSubPageName: target.parent.pageName || target.parent.title || "",
    nestedSubPageId: target.nestedDoc.id,
    nestedSubPageDocId: target.nestedDoc.id,
    nestedSubPageName: target.nested.pageName || target.nested.title || "",
    pillarId: PILLAR_ID,
    source: {
      provider: "Naxlex",
      sourceFile: item.filePath,
      importedAt: now,
      importLabel: item.importLabel,
      namingRule: "filename",
    },
    schema: "",
    version: "1.0",
    lastUpdated: now,
    contentPath: publicPath,
  };

  const routeRef = db.collection("routeMappings").doc();
  const routeMapping = {
    type: "quiz",
    pillarId: PILLAR_ID,
    slug: item.slug,
    subPageId: target.parentDoc.id,
    nestedPageId: target.nestedDoc.id,
    topicId: null,
    quizId: quizRef.id,
    refPath: firestorePath,
    contentPath: publicPath,
    title: item.title,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: now,
  };

  const writer = createBatchWriter(db);
  writer.set(quizRef, quizContent);
  writer.set(routeRef, routeMapping);
  item.questions.forEach((question, index) => {
    const questionDocId = question.id?.toString() || `question-${index + 1}`;
    writer.set(quizRef.collection("questions").doc(questionDocId), buildQuestionContent(question, index));
  });
  await writer.flush();

  return { quizId: quizRef.id, routeMappingId: routeRef.id, publicPath };
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const summary = [];

  for (const mapping of FOLDER_MAPPINGS) {
    const target = await findTarget(db, mapping);
    const identity = await loadExistingIdentity(db, target.nestedDoc);
    const files = fs.readdirSync(mapping.folder)
      .filter((filename) => filename.toLowerCase().endsWith(".json"))
      .sort((a, b) => (getSourceNumber(a) || 0) - (getSourceNumber(b) || 0));

    const planned = [];
    for (const filename of files) {
      const sourceNumber = getSourceNumber(filename);
      const filePath = path.join(mapping.folder, filename);
      const normalizedSourcePath = path.normalize(filePath);
      if (mapping.alreadyImportedSourceNumbers.has(sourceNumber)) {
        planned.push({ sourceNumber, filename, action: "skip-existing-initial-batch" });
        continue;
      }
      if (identity.sourceFiles.has(normalizedSourcePath)) {
        planned.push({ sourceNumber, filename, action: "skip-source-already-imported" });
        continue;
      }

      const { raw, optionErrors } = readSourceFile(filePath);
      const baseTitle = toDisplayTitle(cleanSourceBase(filename));
      const title = makeUniqueTitle(baseTitle, identity.usedTitles);
      const slug = makeUniqueSlug(slugify(title), identity.usedSlugs);
      const countMismatch = raw.totalQuestions && Number(raw.totalQuestions) !== raw.questions.length;

      const item = {
        action: optionErrors.length || countMismatch ? "needs-review" : "import",
        sourceNumber,
        filename,
        title,
        slug,
        questionCount: raw.questions.length,
        declaredTotalQuestions: raw.totalQuestions || null,
        countMismatch: !!countMismatch,
        optionErrors,
        filePath,
        questions: raw.questions,
        importLabel: mapping.importLabel,
      };
      planned.push(item);

      if (APPLY && item.action === "import") {
        const result = await writeQuiz(db, target, item);
        item.quizId = result.quizId;
        item.routeMappingId = result.routeMappingId;
        item.publicPath = result.publicPath;
        item.action = "imported";
      }
    }

    summary.push({
      importLabel: mapping.importLabel,
      parentSlug: mapping.parentSlug,
      nestedSlug: mapping.nestedSlug,
      target: {
        parentId: target.parentDoc.id,
        parentName: target.parent.pageName || target.parent.title,
        nestedId: target.nestedDoc.id,
        nestedName: target.nested.pageName || target.nested.title,
      },
      planned,
    });
  }

  const totals = summary.flatMap((group) => group.planned);
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    totals: {
      imported: totals.filter((item) => item.action === "imported").length,
      importable: totals.filter((item) => item.action === "import").length,
      needsReview: totals.filter((item) => item.action === "needs-review").length,
      skipped: totals.filter((item) => item.action.startsWith("skip")).length,
      questionsToImport: totals
        .filter((item) => item.action === "import" || item.action === "imported")
        .reduce((sum, item) => sum + (item.questionCount || 0), 0),
    },
    summary: summary.map((group) => ({
      ...group,
      planned: group.planned.map(({ questions, filePath, ...item }) => item),
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
