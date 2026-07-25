import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  getAdminDb,
  requireAdminFromAuthorizationHeader,
} from "@/lib/server/firebase-admin";
import {
  atiFormatForQuestionTypeId,
  type TeasBulkUploadPayload,
  type TeasBulkUploadValidationResult,
  validateTeasBulkUploadPayload,
} from "@/lib/admin/teas-bulk-upload-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION_NAME = "teasScannedQuestions";
const EDITABLE_TEAS_TYPE_IDS = new Set([1, 2, 6, 7, 9]);
const DELETE_BATCH_SIZE = 450;

type ContentBlock = {
  html: string;
  text: string;
};

export function firestoreSafeForTeasScan(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    return value.map((item) => {
      // Firestore does not allow arrays nested directly inside arrays.
      if (Array.isArray(item)) return { values: firestoreSafeForTeasScan(item) };
      return firestoreSafeForTeasScan(item);
    });
  }
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (!key || nestedValue === undefined) return;
      output[key] = firestoreSafeForTeasScan(nestedValue);
    });
    return output;
  }
  return String(value);
}

function reviewMetadata(question: TeasBulkUploadPayload["questions"][number]) {
  const questionTypeId = Number(question.question_type_id || 1);
  const review = question.scanReview && typeof question.scanReview === "object"
    ? (question.scanReview as Record<string, unknown>)
    : {};
  const rawWarnings = Array.isArray(review.warnings)
    ? review.warnings.map((warning) => String(warning)).filter(Boolean)
    : [];
  const warnings = rawWarnings.filter((warning) => !isIgnorableReviewWarning(questionTypeId, warning));
  const explicitReviewWithoutSpecificWarnings = Boolean(review.needsReview) && rawWarnings.length === 0;
  const needsReview = explicitReviewWithoutSpecificWarnings || warnings.length > 0;
  const sourceFileName = String(review.sourceFileName || "");
  return {
    needsReview,
    warnings,
    warningCount: warnings.length,
    issueCount: warnings.length + (needsReview ? 1 : 0),
    questionNumber: String(review.questionNumber || ""),
    questionProgress: String(review.questionProgress || ""),
    examTitle: String(review.examTitle || ""),
    subject: String(review.subject || ""),
    sourceFileName,
    exhibitCount: Number(review.exhibitCount || 0),
    imageExhibitCount: Number(review.imageExhibitCount || 0),
    inlineExhibitCount: Number(review.inlineExhibitCount || 0),
    cropRequiredCount: Number(review.cropRequiredCount || 0),
    hasPassage: Boolean(review.hasPassage),
    sourceImageRequired: Boolean(review.sourceImageRequired),
    selectedAnswer: String(review.selectedAnswer || ""),
    choiceCount: Number(review.choiceCount || 0),
    promptLineCount: Number(review.promptLineCount || 0),
    layoutMode: String(review.layoutMode || ""),
    extractionModel: String(review.extractionModel || ""),
  };
}

function isIgnorableReviewWarning(questionTypeId: number, warning: string) {
  if (questionTypeId === 6) {
    return (
      /\bselected answer is not visually clear\b/i.test(warning) ||
      /\bno single answer is explicitly selected\b/i.test(warning)
    );
  }
  if (questionTypeId === 7) {
    return (
      /\bexpected\s+4\s+choices\b/i.test(warning) ||
      /\bhas no reliable selected answer marker\b/i.test(warning) ||
      /\bselected answer marker is low confidence\b/i.test(warning) ||
      /\bprompt does not include a question mark\b/i.test(warning)
    );
  }
  return false;
}

function textFromHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMetadataParagraphs(html: string) {
  return String(html || "")
    .replace(/<p>\s*(?:<strong>)?\s*Question\s*:?\s*\d+\s+of\s+\d+\s*(?:<\/strong>)?\s*<\/p>/gi, "")
    .replace(/<p>\s*(?:<strong>)?\s*Question\s+\d+\s*(?:<\/strong>)?\s*<\/p>/gi, "")
    .replace(/<p>\s*(?:<strong>)?\s*Subject:\s*(?:<\/strong>)?\s*(Reading|Mathematics|Science|English and Language Usage)?\s*<\/p>/gi, "")
    .replace(/<p>\s*(?:<strong>)?\s*ATI\s+TEAS[^<]*(?:<\/strong>)?\s*<\/p>/gi, "")
    .trim();
}

function cleanContentTitle(value: unknown) {
  const title = textFromHtml(String(value || ""));
  if (/^ati\s+teas\b/i.test(title)) return "";
  if (/^subject:\s*(Reading|Mathematics|Science|English and Language Usage)?$/i.test(title)) return "";
  if (/^question\s*:?\s*\d+\s+of\s+\d+$/i.test(title)) return "";
  return title;
}

function slugifySetName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function basenameFromPath(value: string) {
  return value.split(/[\\/]+/).filter(Boolean).pop() || "";
}

function setNumberFromText(value: string) {
  const match = String(value || "").match(/\bset\s*(\d+)\b/i);
  return match?.[1] || "";
}

function setNameFromSource(source: unknown) {
  const sourceObject = source && typeof source === "object" ? (source as Record<string, unknown>) : {};
  const explicit = String(sourceObject.setName || sourceObject.setTitle || "").trim();
  if (explicit) return explicit;
  const inputPath = String(sourceObject.inputPath || "");
  const baseName = basenameFromPath(inputPath);
  return baseName.toLowerCase() === "ati-logo-removed"
    ? basenameFromPath(inputPath.replace(/[\\/]+ati-logo-removed[\\/]?$/i, ""))
    : baseName;
}

function setInfoFromSource(source: unknown, fallbackSubject = "") {
  const sourceObject = source && typeof source === "object" ? (source as Record<string, unknown>) : {};
  const name = setNameFromSource(source);
  const explicitSlug = String(sourceObject.setSlug || sourceObject.setId || "").trim();
  const slug = explicitSlug || slugifySetName(name);
  const setNumber = String(sourceObject.setNumber || "").trim() || setNumberFromText(name);
  return {
    name,
    slug,
    number: setNumber,
    subject: fallbackSubject,
  };
}

function safeHtmlLines(value: unknown) {
  return Array.isArray(value)
    ? value.map((line) => String(line || "").trim()).filter(Boolean)
    : [];
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlFromLines(htmlLines: unknown, plainLines: unknown) {
  const savedHtmlLines = safeHtmlLines(htmlLines);
  if (savedHtmlLines.length > 0) {
    return savedHtmlLines.map((line) => `<p>${line}</p>`).join("");
  }
  return safeHtmlLines(plainLines).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function prependTitleHtml(html: string, title: string) {
  const cleanTitle = cleanContentTitle(title);
  if (!cleanTitle) return html;
  return `<p><strong>${escapeHtml(cleanTitle)}</strong></p>${html}`;
}

function parseMetadataFromQuestionHtml(html: string) {
  const text = textFromHtml(html);
  const progressMatch = text.match(/\bQuestion\s*:?\s*(\d+\s+of\s+\d+)\b/i);
  const subjectMatch = text.match(/\bSubject:\s*(Reading|Mathematics|Science|English and Language Usage)\b/i);
  const examMatch = text.match(/\bATI\s+TEAS\s+Version\s+\d+\s*-\s*(Reading|Mathematics|Science|English and Language Usage)\b/i);
  const questionNumberMatch = progressMatch?.[1]?.match(/^(\d+)\s+of\s+\d+$/);
  return {
    questionProgress: progressMatch?.[1] || "",
    questionNumber: questionNumberMatch?.[1] || "",
    subject: subjectMatch?.[1] || examMatch?.[1] || "",
    examTitle: examMatch?.[0] || "",
  };
}

function questionColumnFromScanLayout(question: TeasBulkUploadPayload["questions"][number]) {
  const layout = question.scanLayout;
  if (!layout || typeof layout !== "object") return {};
  const column = (layout as Record<string, unknown>).questionColumn;
  return column && typeof column === "object" ? (column as Record<string, unknown>) : {};
}

function sourceRecord(source: unknown, review: ReturnType<typeof reviewMetadata>, page: unknown) {
  const sourceObject = source && typeof source === "object" ? (source as Record<string, unknown>) : {};
  const set = setInfoFromSource(source, review.subject);
  return {
    fileName: review.sourceFileName,
    inputPath: String(sourceObject.inputPath || ""),
    outputPath: String(sourceObject.outputPath || ""),
    ocrJobId: sourceObject.ocrJobId ? String(sourceObject.ocrJobId) : null,
    page: Number.isFinite(Number(page)) ? Number(page) : null,
    setName: set.name,
    setSlug: set.slug,
    setNumber: set.number,
  };
}

function validationForQuestion(
  validation: TeasBulkUploadValidationResult,
  questionIndex: number
) {
  const pathPrefix = `$.questions[${questionIndex}]`;
  const errors = validation.errors.filter((issue) => issue.path === pathPrefix || issue.path.startsWith(`${pathPrefix}.`));
  const warnings = validation.warnings.filter((issue) => issue.path === pathPrefix || issue.path.startsWith(`${pathPrefix}.`));
  return { errors, warnings };
}

function modularQuestionParts(question: TeasBulkUploadPayload["questions"][number], review: ReturnType<typeof reviewMetadata>) {
  const parsed = parseMetadataFromQuestionHtml(String(question.question || ""));
  const column = questionColumnFromScanLayout(question);
  const metadata = {
    questionNumber: review.questionNumber || parsed.questionNumber,
    questionProgress: review.questionProgress || parsed.questionProgress,
    examTitle: review.examTitle || parsed.examTitle,
    subject: review.subject || parsed.subject,
  };
  const bodyHtml = stripMetadataParagraphs(String(question.question || ""));
  const passageHtml = prependTitleHtml(
    stripMetadataParagraphs(htmlFromLines(column.passageHtmlLines, column.passageLines)),
    cleanContentTitle(column.passageTitle || (review as unknown as Record<string, unknown>).passageTitle)
  );
  const promptHtml = prependTitleHtml(
    stripMetadataParagraphs(htmlFromLines(column.promptHtmlLines, column.promptLines)),
    cleanContentTitle(column.questionTitle || (review as unknown as Record<string, unknown>).questionTitle)
  );
  const questionHtml = promptHtml || (passageHtml ? "" : bodyHtml);
  return {
    metadata,
    headerLines: firestoreSafeForTeasScan(column.headerLines || []),
    passageLines: firestoreSafeForTeasScan(column.passageLines || []),
    passageHtmlLines: firestoreSafeForTeasScan(column.passageHtmlLines || []),
    promptLines: firestoreSafeForTeasScan(column.promptLines || []),
    promptHtmlLines: firestoreSafeForTeasScan(column.promptHtmlLines || []),
    exhibits: firestoreSafeForTeasScan(column.exhibits || []),
    passageHtml,
    passageText: textFromHtml(passageHtml),
    questionHtml,
    questionText: textFromHtml(questionHtml),
    bodyHtml,
  };
}

function contentBlocksFromQuestionParts(questionParts: ReturnType<typeof modularQuestionParts>) {
  const passage: ContentBlock | null = questionParts.passageText
    ? {
        html: questionParts.passageHtml,
        text: questionParts.passageText,
      }
    : null;
  const questionBlock: ContentBlock = {
    html: questionParts.questionHtml,
    text: questionParts.questionText,
  };
  return { passage, questionBlock };
}

function simplifiedQuestionParts(questionParts: ReturnType<typeof modularQuestionParts>) {
  return {
    headerLines: questionParts.headerLines,
    passageLines: questionParts.passageLines,
    passageHtmlLines: questionParts.passageHtmlLines,
    promptLines: questionParts.promptLines,
    promptHtmlLines: questionParts.promptHtmlLines,
  };
}

function questionDocument(
  question: TeasBulkUploadPayload["questions"][number],
  source: unknown,
  validationWarningCount: number,
  validationErrorCount: number
) {
  const questionTypeId = Number(question.question_type_id || 1);
  const review = reviewMetadata(question);
  const questionParts = modularQuestionParts(question, review);
  const { passage, questionBlock } = contentBlocksFromQuestionParts(questionParts);
  const layout = question.scanLayout && typeof question.scanLayout === "object"
    ? (question.scanLayout as Record<string, unknown>)
    : {};
  const page = layout.page;
  const metadata = questionParts.metadata;
  const set = setInfoFromSource(source, metadata.subject);
  return {
    passage,
    questionContent: questionBlock,
    question: questionBlock,
    questionHtml: questionBlock.html,
    questionText: questionBlock.text,
    combinedHtml: [passage?.html, questionBlock.html].filter(Boolean).join(""),
    questionParts: simplifiedQuestionParts(questionParts),
    exhibits: questionParts.exhibits,
    options: firestoreSafeForTeasScan(question.options || {}),
    correctAnswer: firestoreSafeForTeasScan(question.correctAnswer ?? ""),
    explanation: question.solution || "",
    questionTypeId,
    atiFormat: question.ati_format || null,
    originalId: question.id?.toString() || "",
    tabs: firestoreSafeForTeasScan(question.tabs || null),
    matchOption: firestoreSafeForTeasScan(question.match_option || null),
    imagePath: question.image_path || null,
    units: question.units || null,
    subquestions: firestoreSafeForTeasScan(question.subquestions || []),
    review,
    debug: {
      scanLayout: firestoreSafeForTeasScan(question.scanLayout || null),
      scanReview: firestoreSafeForTeasScan(question.scanReview || null),
    },
    needsReview: review.needsReview,
    issueCount: review.issueCount,
    warningCount: review.warningCount,
    validationWarningCount,
    validationErrorCount,
    questionNumber: metadata.questionNumber,
    questionProgress: metadata.questionProgress,
    examTitle: metadata.examTitle,
    subject: metadata.subject,
    set,
    setName: set.name,
    setSlug: set.slug,
    setNumber: set.number,
    sourceFileName: review.sourceFileName,
    sourceImageRequired: review.sourceImageRequired,
    exhibitCount: review.exhibitCount,
    imageExhibitCount: review.imageExhibitCount,
    inlineExhibitCount: review.inlineExhibitCount,
    cropRequiredCount: review.cropRequiredCount,
    source: firestoreSafeForTeasScan(sourceRecord(source, review, page)),
    sourceType: "ati_teas_ocr",
    status: validationErrorCount > 0 || review.needsReview ? "scanned_review" : "scanned_ready",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    version: "2.0",
  };
}

function scanSortValue(record: Record<string, unknown> & { id: string }) {
  const questionNumber = Number(record.questionNumber || 0);
  const scanOrder = Number(record.scanOrder || 0);
  const sourceFileName = String(record.sourceFileName || "");
  const source = record.source && typeof record.source === "object" ? (record.source as Record<string, unknown>) : {};
  return {
    inputPath: String(source.inputPath || ""),
    ocrJobId: String(source.ocrJobId || ""),
    scanOrder: Number.isFinite(scanOrder) && scanOrder > 0 ? scanOrder : Number.MAX_SAFE_INTEGER,
    questionNumber: Number.isFinite(questionNumber) && questionNumber > 0 ? questionNumber : Number.MAX_SAFE_INTEGER,
    sourceFileName,
    id: record.id,
  };
}

function sortScansByExtractionOrder(
  records: Array<Record<string, unknown> & { id: string }>
) {
  return [...records].sort((a, b) => {
    const left = scanSortValue(a);
    const right = scanSortValue(b);
    const inputPathCompare = left.inputPath.localeCompare(right.inputPath, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (inputPathCompare !== 0) return inputPathCompare;
    const jobCompare = left.ocrJobId.localeCompare(right.ocrJobId, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (jobCompare !== 0) return jobCompare;
    if (left.scanOrder !== right.scanOrder) return left.scanOrder - right.scanOrder;
    if (left.questionNumber !== right.questionNumber) return left.questionNumber - right.questionNumber;
    const sourceCompare = left.sourceFileName.localeCompare(right.sourceFileName, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (sourceCompare !== 0) return sourceCompare;
    return left.id.localeCompare(right.id);
  });
}

function sortScansByQuestionOrder(
  records: Array<Record<string, unknown> & { id: string }>
) {
  return [...records].sort((a, b) => {
    const left = scanSortValue(a);
    const right = scanSortValue(b);
    if (left.questionNumber !== right.questionNumber) return left.questionNumber - right.questionNumber;
    if (left.scanOrder !== right.scanOrder) return left.scanOrder - right.scanOrder;
    const sourceCompare = left.sourceFileName.localeCompare(right.sourceFileName, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (sourceCompare !== 0) return sourceCompare;
    return left.id.localeCompare(right.id);
  });
}

function summarizeScanSets(records: Array<Record<string, unknown> & { id: string }>) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      slug: string;
      setName: string;
      setNumber: string;
      total: number;
      ready: number;
      review: number;
      visual: number;
      issues: number;
      subjects: Set<string>;
    }
  >();

  records.forEach((record) => {
    const set = record.set && typeof record.set === "object" ? (record.set as Record<string, unknown>) : {};
    const setName = String(record.setName || set.name || "No set");
    const slug = String(record.setSlug || set.slug || "");
    const setNumber = String(record.setNumber || set.number || "").trim() || setNumberFromText(setName);
    const key = slug || setName.toLowerCase() || "no-set";
    const existing =
      groups.get(key) ||
      {
        key,
        label: setNumber ? `Set ${setNumber} - ${setName}` : setName,
        slug,
        setName,
        setNumber,
        total: 0,
        ready: 0,
        review: 0,
        visual: 0,
        issues: 0,
        subjects: new Set<string>(),
      };
    existing.total += 1;
    if (record.status === "scanned_ready" && !record.needsReview) existing.ready += 1;
    if (record.needsReview || record.status === "scanned_review") existing.review += 1;
    if (record.sourceImageRequired) existing.visual += 1;
    existing.issues += Number(record.issueCount || 0);
    const subject = String(record.subject || set.subject || "").trim();
    if (subject) existing.subjects.add(subject);
    groups.set(key, existing);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      subjects: Array.from(group.subjects).sort(),
    }))
    .sort((a, b) => {
      const leftNumber = Number(a.setNumber || Number.MAX_SAFE_INTEGER);
      const rightNumber = Number(b.setNumber || Number.MAX_SAFE_INTEGER);
      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
        return leftNumber - rightNumber;
      }
      return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" });
    });
}

async function deleteExistingSetScans(setSlug: string, setName: string) {
  const db = getAdminDb();
  const refs = new Map<string, FirebaseFirestore.DocumentReference>();
  const addSnapshotRefs = (snapshot: FirebaseFirestore.QuerySnapshot) => {
    snapshot.docs.forEach((doc) => refs.set(doc.id, doc.ref));
  };

  if (setSlug) {
    addSnapshotRefs(await db.collection(COLLECTION_NAME).where("setSlug", "==", setSlug).get());
  }
  if (setName) {
    addSnapshotRefs(await db.collection(COLLECTION_NAME).where("setName", "==", setName).get());
  }

  const existingRefs = Array.from(refs.values());
  for (let index = 0; index < existingRefs.length; index += DELETE_BATCH_SIZE) {
    const batch = db.batch();
    existingRefs.slice(index, index + DELETE_BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return existingRefs.length;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const payload = body.payload as TeasBulkUploadPayload;
    const validation = validateTeasBulkUploadPayload(payload);

    const questions = Array.isArray(payload?.questions) ? payload.questions : [];
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No scanned questions to save." },
        { status: 400 }
      );
    }

    const saveableQuestions = questions
      .map((question, originalIndex) => ({ question, originalIndex }))
      .filter(({ question }) => String(question?.question || "").trim());
    if (saveableQuestions.length === 0) {
      return NextResponse.json({ error: "No scanned questions had question text to save." }, { status: 400 });
    }

    const db = getAdminDb();
    const replacementSet = setInfoFromSource(body.source || {}, "");
    const replacedCount = await deleteExistingSetScans(replacementSet.slug, replacementSet.name);
    const batch = db.batch();
    const savedIds: string[] = [];
    saveableQuestions.forEach(({ question, originalIndex }, index) => {
      const ref = db.collection(COLLECTION_NAME).doc();
      const questionValidation = validationForQuestion(validation, originalIndex);
      savedIds.push(ref.id);
      batch.set(ref, {
        ...questionDocument(question, body.source || {}, questionValidation.warnings.length, questionValidation.errors.length),
        saveValidationErrors: firestoreSafeForTeasScan(questionValidation.errors),
        saveValidationWarnings: firestoreSafeForTeasScan(questionValidation.warnings),
        scanOrder: index + 1,
        savedByUid: admin.uid,
      });
    });

    await batch.commit();

    return NextResponse.json({
      collection: COLLECTION_NAME,
      savedCount: savedIds.length,
      replacedCount,
      savedIds,
      savedWithValidationErrors: validation.errors.length > 0,
      skippedCount: questions.length - saveableQuestions.length,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("TEAS scanned question save failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save scanned questions" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all";
    const sort = url.searchParams.get("sort") || "extractionOrder";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 500), 1), 2500);
    const id = url.searchParams.get("id") || "";
    const summaryOnly = url.searchParams.get("summaryOnly") === "true";
    const setSlug = String(url.searchParams.get("setSlug") || "").trim();
    const setName = String(url.searchParams.get("setName") || "").trim();

    if (id) {
      const doc = await getAdminDb().collection(COLLECTION_NAME).doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Saved scan not found." }, { status: 404 });
      }
      const data = doc.data() || {};
      const navigationSnapshot = await getAdminDb()
        .collection(COLLECTION_NAME)
        .orderBy("createdAt", "desc")
        .limit(500)
        .get();
      const orderedRecords = sortScansByQuestionOrder(
        navigationSnapshot.docs.map((navigationDoc) => ({
          id: navigationDoc.id,
          ...(navigationDoc.data() || {}),
        }))
      );
      const currentIndex = orderedRecords.findIndex((record) => record.id === doc.id);
      const nextRecord = currentIndex >= 0 ? orderedRecords[currentIndex + 1] : null;
      return NextResponse.json({
        collection: COLLECTION_NAME,
        navigation: {
          currentIndex: currentIndex >= 0 ? currentIndex : null,
          total: orderedRecords.length,
          nextRecordId: nextRecord?.id || null,
        },
        record: {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
          manuallyEditedAt: data.manuallyEditedAt?.toDate?.()?.toISOString?.() || null,
        },
      });
    }

    if (summaryOnly) {
      const snapshot = await getAdminDb().collection(COLLECTION_NAME).get();
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() || {}),
      }));
      const sets = summarizeScanSets(records);
      return NextResponse.json({
        collection: COLLECTION_NAME,
        records: [],
        summary: {
          total: records.length,
          review: sets.reduce((total, set) => total + set.review, 0),
          visual: sets.reduce((total, set) => total + set.visual, 0),
          issues: sets.reduce((total, set) => total + set.issues, 0),
          sets,
        },
      });
    }

    let query: FirebaseFirestore.Query = getAdminDb().collection(COLLECTION_NAME);
    if (setSlug) {
      query = query.where("setSlug", "==", setSlug);
    } else if (setName) {
      query = query.where("setName", "==", setName);
    }

    const snapshot = await query.limit(limit).get();

    let records: Array<Record<string, unknown> & { id: string }> = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
      };
    });

    if (filter === "review") records = records.filter((record) => Boolean(record.needsReview));
    if (filter === "visual") records = records.filter((record) => Boolean(record.sourceImageRequired));
    if (filter === "clean") records = records.filter((record) => !record.needsReview);

    if (sort === "issues") {
      records.sort((a, b) => Number(b.issueCount || 0) - Number(a.issueCount || 0));
    } else if (sort === "extractionOrder") {
      records = sortScansByExtractionOrder(records);
    } else if (sort === "questionNumber") {
      records = sortScansByQuestionOrder(records);
    }

    const summary = records.reduce(
      (total, record) => {
        total.review += record.needsReview ? 1 : 0;
        total.visual += record.sourceImageRequired ? 1 : 0;
        total.issues += Number(record.issueCount || 0);
        return total;
      },
      { review: 0, visual: 0, issues: 0 }
    );

    return NextResponse.json({
      collection: COLLECTION_NAME,
      records,
      summary: {
        total: records.length,
        ...summary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load scanned questions" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const db = getAdminDb();
    const url = new URL(request.url);
    const id = String(url.searchParams.get("id") || "").trim();

    if (id) {
      const ref = db.collection(COLLECTION_NAME).doc(id);
      const doc = await ref.get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Saved scan not found." }, { status: 404 });
      }
      await ref.delete();
      return NextResponse.json({
        collection: COLLECTION_NAME,
        deletedCount: 1,
        deletedId: id,
        deletedByUid: admin.uid,
      });
    }

    let deletedCount = 0;

    while (true) {
      const snapshot = await db.collection(COLLECTION_NAME).limit(DELETE_BATCH_SIZE).get();
      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedCount += snapshot.size;
    }

    return NextResponse.json({
      collection: COLLECTION_NAME,
      deletedCount,
      deletedByUid: admin.uid,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not clear scanned questions" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "Saved scan id is required." }, { status: 400 });
    }

    const requestedStatus = String(body.status || "scanned_review");
    if (!["scanned_review", "scanned_ready"].includes(requestedStatus)) {
      return NextResponse.json({ error: "Status must be scanned_review or scanned_ready." }, { status: 400 });
    }

    const passageHtml = stripMetadataParagraphs(String(body.passageHtml ?? "").trim());
    const questionHtml = stripMetadataParagraphs(String(body.questionHtml ?? body.questionBodyHtml ?? body.question ?? "").trim());
    const passageText = textFromHtml(passageHtml);
    const questionText = textFromHtml(questionHtml);
    const passage = passageText
      ? {
          html: passageHtml,
          text: passageText,
        }
      : null;
    const questionBlock = {
      html: questionHtml,
      text: questionText,
    };
    if (!questionBlock.html) {
      return NextResponse.json({ error: "Question text is required." }, { status: 400 });
    }

    const manualReviewNotes = String(body.manualReviewNotes || "").trim();
    const questionNumber = String(body.questionNumber || "").trim();
    const questionProgress = String(body.questionProgress || "").trim();
    const examTitle = String(body.examTitle || "").trim();
    const subject = String(body.subject || "").trim();
    const setName = String(body.setName || "").trim();
    const setSlug = slugifySetName(String(body.setSlug || setName).trim());
    const setNumber = String(body.setNumber || "").trim() || setNumberFromText(setName);
    const set = {
      name: setName,
      slug: setSlug,
      number: setNumber,
      subject,
    };
    const questionTypeId = Number(body.questionTypeId ?? body.question_type_id ?? 1);
    if (!EDITABLE_TEAS_TYPE_IDS.has(questionTypeId)) {
      return NextResponse.json({ error: "Question type must be one of the supported ATI TEAS types." }, { status: 400 });
    }
    const atiFormat = String(body.atiFormat ?? body.ati_format ?? atiFormatForQuestionTypeId(questionTypeId) ?? "").trim();
    const exhibits = Array.isArray(body.exhibits) ? body.exhibits : [];
    const imageExhibitCount = exhibits.filter((exhibit: Record<string, unknown>) => {
      const type = String(exhibit?.type || "").toLowerCase();
      return type === "image" || type === "chart";
    }).length;
    const cropRequiredCount = exhibits.filter((exhibit: Record<string, unknown>) => Boolean(exhibit?.requiresCrop)).length;
    const sourceImageRequired = exhibits.some((exhibit: Record<string, unknown>) => {
      const type = String(exhibit?.type || "").toLowerCase();
      const hasStructuredTable = type === "table" && (Array.isArray(exhibit?.headers) || Array.isArray(exhibit?.rows));
      return !hasStructuredTable && (type === "image" || type === "chart" || Boolean(exhibit?.requiresCrop)) && !String(exhibit?.imagePath || "").trim();
    });
    const resolvedStatus = sourceImageRequired ? "scanned_review" : "scanned_ready";
    await getAdminDb()
      .collection(COLLECTION_NAME)
      .doc(id)
      .set(
        {
          passage,
          question: questionBlock,
          questionContent: questionBlock,
          questionHtml: questionBlock.html,
          questionText: questionBlock.text,
          combinedHtml: [passage?.html, questionBlock.html].filter(Boolean).join(""),
          exhibits: firestoreSafeForTeasScan(exhibits),
          "questionParts.exhibits": firestoreSafeForTeasScan(exhibits),
          questionNumber,
          questionProgress,
          examTitle,
          subject,
          set,
          setName,
          setSlug,
          setNumber,
          options: firestoreSafeForTeasScan(body.options || {}),
          correctAnswer: firestoreSafeForTeasScan(body.correctAnswer ?? ""),
          questionTypeId,
          atiFormat: atiFormat || null,
          status: resolvedStatus,
          sourceImageRequired,
          exhibitCount: exhibits.length,
          imageExhibitCount,
          cropRequiredCount,
          issueCount: sourceImageRequired ? 1 : 0,
          warningCount: 0,
          validationWarningCount: 0,
          validationErrorCount: 0,
          saveValidationErrors: [],
          saveValidationWarnings: [],
          needsReview: resolvedStatus !== "scanned_ready",
          manualReviewNotes,
          manuallyEdited: true,
          manuallyEditedByUid: admin.uid,
          manuallyEditedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          version: "2.0",
        },
        { merge: true }
      );

    return NextResponse.json({ saved: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update scanned question" },
      { status: 400 }
    );
  }
}
