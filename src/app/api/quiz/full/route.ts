import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import {
  getNursingEntranceExamQuizQuestions,
  getNursingExitExamQuizQuestions,
  getNursingTestBankQuizQuestions,
  getPageByContentPath,
  getRouteMappingBySlugOnly,
} from "@/lib/firestore-operations";
import { resolveRequiredExamAccessProduct } from "@/lib/content-access-state";
import { getAdminDb, requireUserFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import {
  entitlementKeysForPackageIds,
  normalizeUserEntitlements,
  USER_ENTITLEMENT_KEYS,
  type UserEntitlementKey,
} from "@/lib/user-entitlements";
import type { UserDocumentEntitlements } from "@/types/user-document";

export const runtime = "nodejs";

const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const USERS_COLLECTION = "users";
const ALLOWED_QUESTION_TYPES = [1, 2, 3, 7];

type QuizRouteMapping = {
  type?: unknown;
  slug?: unknown;
  refPath?: string;
  pillarId?: string;
  subPageId?: string;
  nestedPageId?: string;
  topicId?: string;
  quizId?: string;
  examAccessProductId?: unknown;
};

type QuizQuestion = {
  questionTypeId?: number;
  question_type_id?: number;
};

type QuizQuestionResult = {
  success?: boolean;
  data?: unknown;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return null;
}

function isActiveAccessEnd(value: unknown) {
  const accessEnd = toDate(value);
  return accessEnd === null || accessEnd.getTime() > Date.now();
}

function isUserEntitlementKey(value: string | null): value is UserEntitlementKey {
  return USER_ENTITLEMENT_KEYS.includes(value as UserEntitlementKey);
}

function entitlementKeysForAccessIdentifiers(values: string[]) {
  const canonical = new Set<UserEntitlementKey>(entitlementKeysForPackageIds(values));

  for (const value of values) {
    for (const key of USER_ENTITLEMENT_KEYS) {
      // Fixed-term plan IDs are generated from the exam access product, for example hesi_a2_1_month.
      if (value === key || value.startsWith(`${key}_`)) {
        canonical.add(key);
      }
    }
  }

  return Array.from(canonical);
}

async function hasActiveExamAccess(uid: string, examAccessProductId: string | null) {
  if (!examAccessProductId) return true;
  if (!isUserEntitlementKey(examAccessProductId)) return false;
  const db = getAdminDb();

  const userSnapshot = await db.collection(USERS_COLLECTION).doc(uid).get();
  const userData = userSnapshot.data() ?? {};
  const normalizedEntitlements = normalizeUserEntitlements(
    userData.entitlements && typeof userData.entitlements === "object"
      ? (userData.entitlements as UserDocumentEntitlements)
      : null
  );
  if (normalizedEntitlements[examAccessProductId]) {
    return true;
  }

  const entitlementSnapshot = await db
    .collection(BILLING_ENTITLEMENTS_COLLECTION)
    .where("uid", "==", uid)
    .where("status", "==", "active")
    .limit(25)
    .get();

  return entitlementSnapshot.docs.some((doc) => {
    const data = doc.data();
    const ids = [
      typeof data.entitlementId === "string" ? data.entitlementId : "",
      typeof data.examId === "string" ? data.examId : "",
      typeof data.packageId === "string" ? data.packageId : "",
      typeof data.sourcePlanId === "string" ? data.sourcePlanId : "",
    ].filter(Boolean);
    return entitlementKeysForAccessIdentifiers(ids).includes(examAccessProductId) && isActiveAccessEnd(data.accessEndsAt);
  });
}

async function getQuestionsForMapping(mapping: QuizRouteMapping) {
  let result: QuizQuestionResult | null = null;
  if (mapping.pillarId === "nursing-entrance-exam") {
    if (!mapping.subPageId || !mapping.nestedPageId || !mapping.quizId) return [];
    result = await getNursingEntranceExamQuizQuestions(mapping.subPageId, mapping.nestedPageId, mapping.quizId);
  } else if (mapping.pillarId === "nursing-exit-exam") {
    if (!mapping.subPageId || !mapping.nestedPageId || !mapping.quizId) return [];
    result = await getNursingExitExamQuizQuestions(mapping.subPageId, mapping.nestedPageId, mapping.quizId);
  } else if (mapping.pillarId === "nursing-test-bank") {
    if (!mapping.subPageId || !mapping.nestedPageId || !mapping.topicId || !mapping.quizId) return [];
    result = await getNursingTestBankQuizQuestions(mapping.subPageId, mapping.nestedPageId, mapping.topicId, mapping.quizId);
  }

  const questions = result?.success && Array.isArray(result.data) ? result.data : [];
  return questions.filter((question): question is QuizQuestion => {
    if (typeof question !== "object" || question === null) return false;
    const typedQuestion = question as QuizQuestion;
    const questionTypeId = typedQuestion.questionTypeId || typedQuestion.question_type_id;
    if (typeof questionTypeId !== "number") return false;
    return ALLOWED_QUESTION_TYPES.includes(questionTypeId);
  });
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await requireUserFromAuthorizationHeader(request.headers.get("authorization"));
    const slug = request.nextUrl.searchParams.get("slug")?.trim() ?? "";
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const mappingResult = await getRouteMappingBySlugOnly(slug);
    if (!mappingResult.success || !mappingResult.data) {
      return NextResponse.json({ error: "Quiz was not found" }, { status: 404 });
    }

    const mapping = mappingResult.data as QuizRouteMapping;
    if (mapping.type !== "quiz") {
      return NextResponse.json({ error: "Route is not a quiz" }, { status: 400 });
    }
    if (!mapping.refPath) {
      return NextResponse.json({ error: "Quiz content path is missing" }, { status: 400 });
    }

    const contentResult = await getPageByContentPath(mapping.refPath);
    const pageData = contentResult.success && typeof contentResult.data === "object" && contentResult.data !== null
      ? contentResult.data
      : {};
    const requiredProductId = resolveRequiredExamAccessProduct({ ...mapping, slug }, pageData);
    const active = await hasActiveExamAccess(decoded.uid, requiredProductId);

    if (!active) {
      return NextResponse.json({ status: "preview", requiredProductId, reason: "No active matching access" }, { status: 403 });
    }

    const questions = await getQuestionsForMapping(mapping);
    return NextResponse.json({ status: "full", requiredProductId, questions });
  } catch (error) {
    console.error("Full quiz access failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load full quiz" }, { status: 401 });
  }
}
