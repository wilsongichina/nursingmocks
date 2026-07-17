import { getAdminDb } from "@/lib/server/firebase-admin";
import { normalizeContentExamAccessProductId } from "@/lib/content-access-products";

const PILLAR_ID = "nursing-entrance-exam";
const EXAM_SUBJECT_CATALOG_COLLECTION = "exam_subject_catalog";

function textValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function slugValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/practice test/g, "")
    .replace(/ati|teas|hesi|a2/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isFullLength(...values: unknown[]) {
  const text = values.map((value) => String(value ?? "").toLowerCase()).join(" ");
  return text.includes("full-length") || text.includes("full length") || text.includes("full_exam") || text.includes("full exam");
}

async function resolveDocBySlugOrId(
  collectionRef: FirebaseFirestore.CollectionReference,
  value: string
) {
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  const slugSnapshot = await collectionRef.where("slug", "==", normalized).limit(1).get();
  if (!slugSnapshot.empty) return slugSnapshot.docs[0];

  const directSnapshot = await collectionRef.doc(value).get();
  if (directSnapshot.exists) return directSnapshot;

  return null;
}

export async function repairEntranceExamCatalogForQuiz(input: {
  subPageId: string;
  nestedSubPageId: string;
  quizId: string;
}) {
  const db = getAdminDb();
  const subPageId = textValue(input.subPageId);
  const nestedSubPageId = textValue(input.nestedSubPageId);
  const quizId = textValue(input.quizId);

  if (!subPageId || !nestedSubPageId || !quizId) {
    throw new Error("Sub page, nested page, and quiz are required.");
  }

  const subPagesRef = db.collection("pillarPages").doc(PILLAR_ID).collection("subPages");
  const subPageDoc = await resolveDocBySlugOrId(subPagesRef, subPageId);
  if (!subPageDoc) throw new Error(`Parent sub-page ${subPageId} was not found.`);

  const nestedRef = subPageDoc.ref.collection("nestedSubPages");
  const nestedDoc = await resolveDocBySlugOrId(nestedRef, nestedSubPageId);
  if (!nestedDoc) throw new Error(`Nested sub-page ${nestedSubPageId} was not found.`);

  const quizzesRef = nestedDoc.ref.collection("quizzes");
  const quizDoc = await resolveDocBySlugOrId(quizzesRef, quizId);
  if (!quizDoc) throw new Error(`Quiz ${quizId} was not found.`);

  const [parentData, nestedData, quizData, questionsSnapshot] = await Promise.all([
    Promise.resolve(subPageDoc.data() ?? {}),
    Promise.resolve(nestedDoc.data() ?? {}),
    Promise.resolve(quizDoc.data() ?? {}),
    quizDoc.ref.collection("questions").get(),
  ]);

  const subjectName = textValue(
    quizData.subjectName,
    nestedData.pageName,
    nestedData.title,
    nestedData.heading,
    nestedData.slug,
    quizData.pageName,
    quizData.title,
    quizData.slug
  );
  const examAccessProductId = normalizeContentExamAccessProductId(
    PILLAR_ID,
    quizData.examAccessProductId,
    [
      nestedData.examAccessProductId,
      parentData.examAccessProductId,
      quizData.pageName,
      quizData.title,
      quizData.quizName,
      quizData.slug,
      nestedData.pageName,
      nestedData.title,
      nestedData.slug,
      parentData.pageName,
      parentData.title,
      parentData.slug,
    ].join(" ")
  );
  const questionCount = questionsSnapshot.size;
  const slug = textValue(quizData.slug, quizDoc.id);
  const title = textValue(quizData.pageName, quizData.title, quizData.quizName, slug, quizDoc.id);
  const contentPath =
    textValue(quizData.contentPath) ||
    `pillarPages/${PILLAR_ID}/subPages/${subPageDoc.id}/nestedSubPages/${nestedDoc.id}/quizzes/${quizDoc.id}`;

  const metadata = {
    examAccessProductId,
    examFamilyId: "nursing_entrance_exams",
    subjectName,
    subjectId: slugValue(subjectName || slug || title),
    questionCount,
    previewPercentage: numberValue(quizData.previewPercentage, 20),
    active: quizData.active !== false,
  };

  await quizDoc.ref.set(
    {
      ...metadata,
      contentPath,
      lastQuestionCountUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  const catalogRef = db.collection(EXAM_SUBJECT_CATALOG_COLLECTION).doc(`nursing_entrance_exam_${quizDoc.id}`);

  if (!examAccessProductId || isFullLength(title, subjectName, slug)) {
    await catalogRef.delete();
    return {
      repaired: true,
      catalogUpdated: false,
      removedFromCatalog: true,
      quizId: quizDoc.id,
      questionCount,
      examAccessProductId,
    };
  }

  await catalogRef.set(
    {
      ...metadata,
      id: quizDoc.id,
      quizId: quizDoc.id,
      slug,
      title,
      pageName: textValue(quizData.pageName, title),
      quizName: textValue(quizData.quizName, title),
      setNumber: numberValue(quizData.setNumber) || null,
      contentPath,
      sourcePillarId: PILLAR_ID,
      sourceUpdatedAt: new Date().toISOString(),
      type: "entrance_quiz_subject",
    },
    { merge: true }
  );

  return {
    repaired: true,
    catalogUpdated: true,
    removedFromCatalog: false,
    quizId: quizDoc.id,
    questionCount,
    examAccessProductId,
  };
}
