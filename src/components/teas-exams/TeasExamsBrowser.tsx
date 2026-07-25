"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type PublicTeasExamQuestion,
  type TeasExamSubject,
} from "@/lib/teas-exams/types";

type SubjectFilter = TeasExamSubject | "English";

type TeasExamsBrowserProps = {
  dataUrl: string;
};

type TeasExamPreviewData = {
  generatedAt?: string;
  questionCount?: number;
  questions?: PublicTeasExamQuestion[];
};

const SUBJECT_FILTERS: SubjectFilter[] = ["Reading", "Mathematics", "Science", "English"];

export default function TeasExamsBrowser({ dataUrl }: TeasExamsBrowserProps) {
  const [questions, setQuestions] = useState<PublicTeasExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>("Reading");

  useEffect(() => {
    let cancelled = false;
    async function loadQuestions() {
      setLoading(true);
      try {
        const response = await fetch(dataUrl, { cache: "force-cache" });
        if (!response.ok) throw new Error("Could not load TEAS questions.");
        const payload = (await response.json()) as TeasExamPreviewData;
        if (!cancelled) setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
      } catch (error) {
        console.warn("TEAS Exams static data could not be loaded", error);
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => {
      return (
        question.subject === selectedSubject ||
        (selectedSubject === "English" && question.subject === "English and Language Usage")
      );
    });
  }, [questions, selectedSubject]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-2">
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex min-w-max gap-2">
                {SUBJECT_FILTERS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                      selectedSubject === subject
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-gray-500">
              {selectedSubject} - {visibleQuestions.length} visible question{visibleQuestions.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            Loading TEAS questions.
          </div>
        ) : visibleQuestions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            No visible questions are available for this subject.
          </div>
        ) : (
          <QuestionGroups questions={visibleQuestions} />
        )}
      </main>
    </div>
  );
}

function QuestionGroups({
  questions,
}: {
  questions: PublicTeasExamQuestion[];
}) {
  const grouped = groupQuestions(questions);

  return (
    <div className="space-y-6">
      {grouped.map((subjectGroup) => (
        <section key={subjectGroup.subject} className="space-y-3">
          <h2 className="text-lg font-bold text-gray-950">
            TEAS 7 {subjectGroup.subject}
          </h2>
          <div className="space-y-3">
              {subjectGroup.questions.map((question) => (
                <article
                  key={question.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <h4 className="mb-3 text-sm font-bold text-gray-950">
                    Set {question.setNumber} - Question {question.questionNumber || ""}
                  </h4>
                  {question.passageText && (
                    <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm leading-6 text-gray-800">
                      <p className="mb-1 font-semibold text-purple-800">Passage</p>
                      {question.passageText}
                    </div>
                  )}
                  <p className="text-base leading-7 text-gray-950">
                    {question.questionText}
                  </p>
                  {question.choices.length > 0 && (
                    <ol className="mt-3 space-y-2">
                      {question.choices.map((choice, index) => (
                        <li
                          key={`${question.id}-${choice}-${index}`}
                          className={`rounded-lg border px-3 py-2 text-sm leading-6 ${
                            isCorrectChoice(question, choice, index)
                              ? "border-green-300 bg-green-50 text-green-900"
                              : "border-gray-200 bg-gray-50 text-gray-800"
                          }`}
                        >
                          {choice}
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupQuestions(questions: PublicTeasExamQuestion[]) {
  const subjects = Array.from(new Set(questions.map((question) => question.subject)));
  return subjects.map((subject) => ({
    subject,
    questions: questions.filter((question) => question.subject === subject),
  }));
}

function isCorrectChoice(question: PublicTeasExamQuestion, choice: string, index: number) {
  const label = String.fromCharCode(65 + index);
  if (question.correctAnswerLabels.map((answer) => answer.toUpperCase()).includes(label)) return true;
  return Boolean(question.correctAnswerText) && question.correctAnswerText.trim().toLowerCase() === choice.trim().toLowerCase();
}
