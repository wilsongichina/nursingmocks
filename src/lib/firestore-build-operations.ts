import { cache } from "react";
import { getAdminDb } from "@/lib/server/firebase-admin";

type Result<T> = { success: true; data: T; message?: string } | { success: false; data?: T; message: string; slugMap?: Record<string, string> };

type FirestoreRecord = Record<string, any>;

type RouteMappingType = "sub" | "nested" | "topic" | "quiz";

type RouteMappingRecord = FirestoreRecord & {
  id: string;
  slug?: string;
  refPath?: string;
  pillarId?: string;
  type?: RouteMappingType;
  subPageId?: string;
  nestedPageId?: string;
  topicId?: string;
  quizId?: string;
};

type QuestionTypeRecord = FirestoreRecord & {
  id: string;
  questionTypeId?: string;
  questionTypeName?: string;
};

const normalizeSlug = (value: string) => String(value || "").toLowerCase().replace(/\s+/g, "-").trim();
const withId = <T extends FirestoreRecord = FirestoreRecord>(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
): T & { id: string } => ({ id: doc.id, ...((doc.data() || {}) as T) });
const ok = <T>(data: T, message?: string): Result<T> => ({ success: true, data, message });
const fail = <T>(message: string, data?: T): Result<T> => ({ success: false, message, data });

async function getDocByPath(contentPath: string) {
  const normalized = String(contentPath || "").replace(/^\/+|\/+$/g, "");
  if (!normalized) return null;
  const snap = await getAdminDb().doc(normalized).get();
  return snap.exists ? snap : null;
}

async function queryFirst(collectionPath: string, field: string, value: unknown) {
  const snap = await getAdminDb().collection(collectionPath).where(field, "==", value).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function resolveDocIdBySlugOrId(collectionPath: string, value: string) {
  const normalized = normalizeSlug(value);
  const slugDoc = await queryFirst(collectionPath, "slug", normalized);
  if (slugDoc) return slugDoc.id;
  const direct = await getAdminDb().collection(collectionPath).doc(value).get();
  return direct.exists ? direct.id : null;
}

export const getAllRouteMappings = cache(async (): Promise<Result<RouteMappingRecord[]>> => {
  try {
    const snapshot = await getAdminDb().collection("routeMappings").get();
    return ok(snapshot.docs.map((doc) => withId<RouteMappingRecord>(doc)));
  } catch (error) {
    return fail(`Failed to retrieve all route mappings: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

export const getRouteMappingBySlugOnly = cache(async (slug: string) => {
  try {
    const snap = await getAdminDb().collection("routeMappings").where("slug", "==", normalizeSlug(slug)).limit(1).get();
    if (snap.empty) return fail(`No route mapping found for slug: ${slug}`);
    return ok(withId(snap.docs[0]));
  } catch (error) {
    return fail(`Failed to retrieve route mapping: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

export const getPageByContentPath = cache(async (contentPath: string) => {
  try {
    const snap = await getDocByPath(contentPath);
    if (!snap) return fail(`No content found at contentPath: ${contentPath}`);
    return ok(withId(snap));
  } catch (error) {
    return fail(`Failed to retrieve content by path: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

export const getRouteMappingById = cache(async (params: {
  pillarId: string;
  type: RouteMappingType;
  id: string;
  subPageId?: string | null;
  nestedPageId?: string | null;
}) => {
  try {
    const snapshot = await getAdminDb()
      .collection("routeMappings")
      .where("pillarId", "==", params.pillarId)
      .where("type", "==", params.type)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let matches = false;
      if (params.type === "sub") {
        matches = data.refPath?.endsWith(`/subPages/${params.id}`) || data.refPath?.includes(`/subPages/${params.id}/`) || data.subPageId === params.id;
      } else if (params.type === "nested") {
        matches = data.nestedPageId === params.id && (!params.subPageId || data.subPageId === params.subPageId);
      } else if (params.type === "topic") {
        matches = data.topicId === params.id && (!params.nestedPageId || data.nestedPageId === params.nestedPageId) && (!params.subPageId || data.subPageId === params.subPageId);
      } else if (params.type === "quiz") {
        matches = data.quizId === params.id && (!params.nestedPageId || data.nestedPageId === params.nestedPageId) && (!params.subPageId || data.subPageId === params.subPageId);
      }
      if (matches) return ok({ id: doc.id, ...data });
    }
    return fail(`No route mapping found for ${params.type} with id: ${params.id}`);
  } catch (error) {
    return fail(`Failed to retrieve route mapping: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

export const getRouteMappingSlugsByIds = cache(async (params: {
  pillarId: string;
  type: "nested" | "topic" | "quiz";
  ids: string[];
  subPageId?: string | null;
  nestedPageId?: string | null;
  topicId?: string | null;
}) => {
  try {
    const snapshot = await getAdminDb()
      .collection("routeMappings")
      .where("pillarId", "==", params.pillarId)
      .where("type", "==", params.type)
      .get();
    const slugMap: Record<string, string> = {};
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const id = params.type === "nested" ? data.nestedPageId : params.type === "topic" ? data.topicId : data.quizId;
      if (!id || !params.ids.includes(id)) continue;
      if (params.subPageId && data.subPageId !== params.subPageId) continue;
      if (params.nestedPageId && data.nestedPageId !== params.nestedPageId) continue;
      if (params.topicId && data.topicId !== params.topicId) continue;
      slugMap[id] = data.slug;
    }
    return { success: true, slugMap };
  } catch (error) {
    return { success: false, message: `Failed to get route mapping slugs: ${error instanceof Error ? error.message : "Unknown error"}`, slugMap: {} };
  }
});

async function getCollectionDocs<T extends FirestoreRecord = FirestoreRecord>(collectionPath: string): Promise<Array<T & { id: string }>> {
  const snap = await getAdminDb().collection(collectionPath).get();
  return snap.docs.map((doc) => withId<T>(doc));
}

export const getNestedSubPages = cache(async (parentSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-entrance-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages`));
  } catch (error) {
    return fail(`Failed to retrieve nested sub-pages: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingExitExamNestedSubPages = cache(async (parentSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-exit-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages`));
  } catch (error) {
    return fail(`Failed to retrieve nested sub-pages: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingTestBankNestedSubPages = cache(async (parentSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-test-bank/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages`));
  } catch (error) {
    return fail(`Failed to retrieve nested sub-pages: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingTestBankTopics = cache(async (parentSubPageId: string, nestedSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-test-bank/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics`));
  } catch (error) {
    return fail(`Failed to retrieve topics: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingTestBankQuizzes = cache(async (parentSubPageId: string, nestedSubPageId: string, topicId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-test-bank/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    const topic = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics`, topicId);
    if (!topic) return fail("Topic not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics/${topic}/quizzes`));
  } catch (error) {
    return fail(`Failed to retrieve quizzes: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingEntranceExamQuizzes = cache(async (parentSubPageId: string, nestedSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-entrance-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes`));
  } catch (error) {
    return fail(`Failed to retrieve quizzes: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingExitExamQuizzes = cache(async (parentSubPageId: string, nestedSubPageId: string) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-exit-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    return ok(await getCollectionDocs(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes`));
  } catch (error) {
    return fail(`Failed to retrieve quizzes: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

async function getQuestions(collectionPath: string, limitCount?: number) {
  let ref: FirebaseFirestore.Query = getAdminDb().collection(collectionPath);
  if (limitCount && limitCount > 0) ref = ref.limit(limitCount);
  const snap = await ref.get();
  return snap.docs.map(withId);
}

export const getNursingTestBankQuizQuestions = cache(async (parentSubPageId: string, nestedSubPageId: string, topicId: string, quizId: string, options: { limitCount?: number } = {}) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-test-bank/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    const topic = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics`, topicId);
    if (!topic) return fail("Topic not found", []);
    const quiz = await resolveDocIdBySlugOrId(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics/${topic}/quizzes`, quizId);
    if (!quiz) return fail("Quiz not found", []);
    return ok(await getQuestions(`pillarPages/nursing-test-bank/subPages/${parent}/nestedSubPages/${nested}/topics/${topic}/quizzes/${quiz}/questions`, options.limitCount));
  } catch (error) {
    return fail(`Failed to retrieve questions: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingEntranceExamQuizQuestions = cache(async (parentSubPageId: string, nestedSubPageId: string, quizId: string, options: { limitCount?: number } = {}) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-entrance-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    const quiz = await resolveDocIdBySlugOrId(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes`, quizId);
    if (!quiz) return fail("Quiz not found", []);
    return ok(await getQuestions(`pillarPages/nursing-entrance-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes/${quiz}/questions`, options.limitCount));
  } catch (error) {
    return fail(`Failed to retrieve questions: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getNursingExitExamQuizQuestions = cache(async (parentSubPageId: string, nestedSubPageId: string, quizId: string, options: { limitCount?: number } = {}) => {
  try {
    const parent = await resolveDocIdBySlugOrId("pillarPages/nursing-exit-exam/subPages", parentSubPageId);
    if (!parent) return fail("Parent sub-page not found", []);
    const nested = await resolveDocIdBySlugOrId(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages`, nestedSubPageId);
    if (!nested) return fail("Nested sub-page not found", []);
    const quiz = await resolveDocIdBySlugOrId(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes`, quizId);
    if (!quiz) return fail("Quiz not found", []);
    return ok(await getQuestions(`pillarPages/nursing-exit-exam/subPages/${parent}/nestedSubPages/${nested}/quizzes/${quiz}/questions`, options.limitCount));
  } catch (error) {
    return fail(`Failed to retrieve questions: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});

export const getAllQuestionTypes = cache(async (): Promise<Result<QuestionTypeRecord[]>> => {
  try {
    return ok(await getCollectionDocs<QuestionTypeRecord>("questionTypes"));
  } catch (error) {
    return fail(`Failed to retrieve question types: ${error instanceof Error ? error.message : "Unknown error"}`, []);
  }
});


