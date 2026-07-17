"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizCTACard from "@/components/quiz/QuizCTACard";
import { useAuth } from "@/contexts/AuthContext";

type DynamicQuizQuestionsProps = {
  slug: string;
  previewQuestions: QuizQuestion[];
  totalQuestionCount: number;
  hiddenQuestionCount: number;
  productLabel: string;
  questionTypes: QuestionType[];
};

type QuizQuestion = {
  id?: string;
  options?: unknown;
  correctAnswer?: unknown;
  questionTypeId?: number;
  question_type_id?: number;
};

type QuestionType = {
  questionTypeId?: string;
  questionTypeName?: string;
};

type FullQuizResponse = {
  status?: string;
  questions?: QuizQuestion[];
};

function optionsFor(question: QuizQuestion) {
  if (!question.options) return [];
  if (Array.isArray(question.options)) return question.options;
  if (typeof question.options !== "string") return [];
  try {
    const parsed = JSON.parse(question.options);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [question.options];
  }
}

function correctAnswersFor(question: QuizQuestion, questionTypeId: number) {
  const correctAnswer = question.correctAnswer || "";
  if (questionTypeId === 2) {
    try {
      const parsed = typeof correctAnswer === "string" ? JSON.parse(correctAnswer) : correctAnswer;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (questionTypeId === 7) {
    return Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  }
  return [correctAnswer];
}

export default function DynamicQuizQuestions({
  slug,
  previewQuestions,
  totalQuestionCount,
  hiddenQuestionCount,
  productLabel,
  questionTypes,
}: DynamicQuizQuestionsProps) {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>(previewQuestions);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFullQuiz() {
      try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const response = await fetch(`/api/quiz/full?slug=${encodeURIComponent(slug)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = (await response.json().catch(() => null)) as FullQuizResponse | null;
        if (!response.ok) {
          console.warn("Full quiz access remained in preview mode", {
            slug,
            status: response.status,
            result,
          });
          return;
        }
        if (!cancelled && result?.status === "full" && Array.isArray(result.questions)) {
          setQuestions(result.questions);
          setHasFullAccess(true);
        }
      } catch (error) {
        console.warn("Full quiz access could not be loaded", error);
      }
    }

    void loadFullQuiz();
    return () => {
      cancelled = true;
    };
  }, [currentUser, slug]);

  const visibleHiddenCount = hasFullAccess ? 0 : Math.max(0, totalQuestionCount - questions.length || hiddenQuestionCount);

  const getQuestionTypeName = useMemo(() => {
    return (questionTypeId: number) => {
      if (!questionTypeId) return "Unknown";
      const type = questionTypes.find((item) => item.questionTypeId === questionTypeId.toString());
      return type?.questionTypeName || `Type ${questionTypeId}`;
    };
  }, [questionTypes]);

  if (questions.length === 0) {
    return visibleHiddenCount > 0 ? (
      <QuizCTACard
        productLabel={productLabel}
        previewQuestionCount={0}
        totalQuestionCount={totalQuestionCount}
        hiddenQuestionCount={visibleHiddenCount}
        showForAuthenticated
      />
    ) : (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">No questions available</h3>
        <p className="text-slate-600">Questions for this quiz are not available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4.5">
      {questions.map((question, index: number) => {
        const questionTypeId = question.questionTypeId || question.question_type_id || 1;

        return (
          <div key={question.id || index}>
            <QuestionCard
              question={question}
              index={index}
              questionTypeId={questionTypeId}
              options={optionsFor(question).map(String)}
              correctAnswers={correctAnswersFor(question, questionTypeId).map(String)}
              questionTypeName={getQuestionTypeName(questionTypeId)}
              totalQuestions={questions.length}
            />
            {index === 1 && questions.length > 2 && visibleHiddenCount > 0 && (
              <QuizCTACard
                productLabel={productLabel}
                previewQuestionCount={questions.length}
                totalQuestionCount={totalQuestionCount}
                hiddenQuestionCount={visibleHiddenCount}
                showForAuthenticated
              />
            )}
          </div>
        );
      })}
      {visibleHiddenCount > 0 && questions.length <= 2 && (
        <QuizCTACard
          productLabel={productLabel}
          previewQuestionCount={questions.length}
          totalQuestionCount={totalQuestionCount}
          hiddenQuestionCount={visibleHiddenCount}
          showForAuthenticated
        />
      )}
    </div>
  );
}
