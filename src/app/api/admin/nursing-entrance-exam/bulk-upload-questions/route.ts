import { NextResponse } from "next/server";
import { getAdminDb, requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PILLAR_ID = "nursing-entrance-exam";

function normalizeSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function stripHtmlTags(value: string) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function generateQuestionSlug(value: string) {
  return stripHtmlTags(value)
    .slice(0, 180)
    .toLowerCase()
    .replace(/nbsp/g, "")
    .replace(/&nbsp;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatOptionValue(option: unknown): string {
  if (option === null || option === undefined) return "";
  if (typeof option !== "object") return String(option).trim();
  if (Array.isArray(option)) return option.map(formatOptionValue).filter(Boolean).join(" ");
  const record = option as Record<string, unknown>;
  const optionText =
    record.choice ??
    record.text ??
    record.label ??
    record.answer ??
    record.value ??
    record.option ??
    record.content ??
    record.html ??
    record.body ??
    record.title;
  if (optionText !== undefined && optionText !== null) return formatOptionValue(optionText);
  return Object.values(record).map(formatOptionValue).filter(Boolean).join(" ");
}

function optionsArrayFromQuestionOptions(options: unknown) {
  if (!options) return [];
  if (Array.isArray(options)) return options.map(formatOptionValue);
  if (typeof options === "string") {
    try {
      return optionsArrayFromQuestionOptions(JSON.parse(options));
    } catch {
      return [];
    }
  }
  if (typeof options === "object") {
    return Object.keys(options as Record<string, unknown>)
      .sort()
      .map((key) => formatOptionValue((options as Record<string, unknown>)[key]));
  }
  return [];
}

function correctAnswerForSave(question: Record<string, unknown>) {
  const questionTypeId = Number(question.question_type_id || question.questionTypeId || 1);
  let correctAnswer = question.correctAnswer ?? question.correct_answer ?? "";
  if (questionTypeId === 7) {
    if (typeof correctAnswer === "string") {
      try {
        const parsed = JSON.parse(correctAnswer);
        correctAnswer = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        correctAnswer = [correctAnswer];
      }
    } else if (!Array.isArray(correctAnswer)) {
      correctAnswer = [String(correctAnswer ?? "")];
    }
  }
  return correctAnswer;
}

async function resolveDocBySlugOrId(
  collectionRef: FirebaseFirestore.CollectionReference,
  value: string
) {
  const normalized = normalizeSlug(value);
  const slugSnapshot = await collectionRef.where("slug", "==", normalized).limit(1).get();
  if (!slugSnapshot.empty) return slugSnapshot.docs[0];
  const docSnapshot = await collectionRef.doc(value).get();
  return docSnapshot.exists ? docSnapshot : null;
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const subPageId = String(body.subPageId || "").trim();
    const nestedSubPageId = String(body.nestedSubPageId || "").trim();
    const quizId = String(body.quizId || "").trim();
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!subPageId || !nestedSubPageId || !quizId) {
      return NextResponse.json({ error: "Missing quiz route identifiers." }, { status: 400 });
    }
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions were provided." }, { status: 400 });
    }

    const db = getAdminDb();
    const subPagesRef = db.collection("pillarPages").doc(PILLAR_ID).collection("subPages");
    const parentDoc = await resolveDocBySlugOrId(subPagesRef, subPageId);
    if (!parentDoc) {
      return NextResponse.json({ error: `Parent sub-page ${subPageId} not found.` }, { status: 404 });
    }

    const nestedRef = parentDoc.ref.collection("nestedSubPages");
    const nestedDoc = await resolveDocBySlugOrId(nestedRef, nestedSubPageId);
    if (!nestedDoc) {
      return NextResponse.json({ error: `Nested sub-page ${nestedSubPageId} not found.` }, { status: 404 });
    }

    const quizzesRef = nestedDoc.ref.collection("quizzes");
    const quizDoc = await resolveDocBySlugOrId(quizzesRef, quizId);
    if (!quizDoc) {
      return NextResponse.json({ error: `Quiz ${quizId} not found.` }, { status: 404 });
    }

    const successful: Array<{ questionId: string; originalId: string | number | null; success: true }> = [];
    const failed: Array<{ questionId: string; error: string }> = [];

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index] as Record<string, unknown>;
      try {
        const questionText = String(question.question || "");
        const questionDocId =
          String(question.id || question.questionId || "").trim() ||
          `question-${Date.now()}-${index}`;
        const questionTypeId = Number(question.question_type_id || question.questionTypeId || 1);
        const questionContent = {
          question: questionText,
          passage: String(question.passage || ""),
          options: optionsArrayFromQuestionOptions(question.options),
          correctAnswer: correctAnswerForSave(question),
          explanation: String(question.solution || question.explanation || ""),
          questionTypeId,
          slug: generateQuestionSlug(questionText) || questionDocId,
          originalId: String(question.id || ""),
          questionId: questionDocId,
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
          importReview: question.importReview || null,
          sourceScanId:
            (question.importReview as Record<string, unknown> | undefined)?.scanId ||
            question.sourceScanId ||
            null,
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        };

        await quizDoc.ref.collection("questions").doc(questionDocId).set(questionContent);
        successful.push({ questionId: questionDocId, originalId: question.id as string | number | null, success: true });
      } catch (error) {
        failed.push({
          questionId: String(question.id || `question-${index + 1}`),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const questionCountSnapshot = await quizDoc.ref.collection("questions").count().get();
    await quizDoc.ref.set(
      {
        questionCount: questionCountSnapshot.data().count,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: failed.length === 0,
      message: `Uploaded ${successful.length} questions successfully${failed.length > 0 ? `, ${failed.length} failed` : ""}`,
      data: {
        successful,
        failed,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk upload questions." },
      { status: 400 }
    );
  }
}
