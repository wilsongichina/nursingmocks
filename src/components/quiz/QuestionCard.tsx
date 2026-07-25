"use client";

import { useState } from "react";
import ContentRenderer from "@/components/ui/ContentRenderer";

interface QuestionCardProps {
  question: any;
  index: number;
  questionTypeId: number;
  options: string[];
  correctAnswers: string[];
  questionTypeName: string;
  totalQuestions: number;
}

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function QuestionCard({
  question,
  index,
  questionTypeId,
  options,
  correctAnswers,
  questionTypeName,
  totalQuestions,
}: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const correctOptionIndex =
    questionTypeId === 1 || questionTypeId === 2
      ? ANSWER_LABELS.indexOf(correctAnswers[0])
      : -1;

  const optionClass = (isCorrect: boolean) =>
    `flex items-start gap-3 rounded-xl border px-3 py-3 transition-all ${
      showExplanation && isCorrect
        ? "border-[#16a34a] bg-[#ecfdf3] shadow-[0_0_0_1px_rgba(22,163,74,0.08)]"
        : "border-[#e3e5f0] bg-[#f9fafb]"
    }`;

  const optionLabelClass = (isCorrect: boolean) =>
    `flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
      showExplanation && isCorrect
        ? "border-[#16a34a] bg-[#16a34a] text-white"
        : "border-[#cfd3e6] bg-white text-[#6b7280]"
    }`;

  const checkIcon = (
    <svg
      className="h-5 w-5 flex-shrink-0 text-[#16a34a]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  return (
    <article className="user-card p-4 sm:p-5">
      <input
        type="checkbox"
        id={`q${index + 1}-toggle`}
        className="absolute opacity-0 pointer-events-none"
        checked={showExplanation}
        onChange={(event) => setShowExplanation(event.target.checked)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="user-card-title text-sm">
          Question {index + 1} of {totalQuestions}
        </span>
        <span className="user-badge">{questionTypeName}</span>
      </div>

      <div className="mt-4 flex flex-col items-start gap-5 lg:flex-row">
        <div className="min-w-0 w-full lg:flex-[0_0_55%] lg:max-w-[55%]">
          <div className="user-card-title mb-4 text-base leading-7">
            <ContentRenderer content={question.question || ""} />
          </div>

          <ul className="grid list-none gap-2.5 p-0">
            {questionTypeId === 3
              ? ["True", "False"].map((option, optIndex) => {
                  const optionLabel = ANSWER_LABELS[optIndex];
                  const isCorrect = correctAnswers.includes(option);

                  return (
                    <li key={option} className={optionClass(isCorrect)}>
                      <span className={optionLabelClass(isCorrect)}>
                        {optionLabel}
                      </span>
                      <span className="user-body-sm flex-1">{option}</span>
                      {showExplanation && isCorrect ? checkIcon : null}
                    </li>
                  );
                })
              : questionTypeId === 7
                ? (
                  <li>
                    <div
                      className={`relative overflow-hidden rounded-xl border px-4 py-4 transition-all ${
                        showExplanation
                          ? "border-[#16a34a] bg-[#ecfdf3] shadow-lg"
                          : "border-[#e3e5f0] bg-[#f9fafb]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                            showExplanation ? "bg-[#16a34a]" : "bg-[#e3e5f0]"
                          }`}
                        >
                          {showExplanation ? (
                            <svg
                              className="h-7 w-7 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm font-semibold text-[#6b7280]">
                              ?
                            </span>
                          )}
                        </div>
                        <div
                          className={`min-w-0 flex-1 ${
                            showExplanation ? "" : "blur-sm opacity-50 pointer-events-none"
                          }`}
                        >
                          <div
                            className={`user-label mb-1 ${
                              showExplanation ? "text-[#16a34a]" : ""
                            }`}
                          >
                            Correct Answer
                          </div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span
                              className={`text-2xl font-bold ${
                                showExplanation ? "text-[#16a34a]" : "text-[#6b7280]"
                              }`}
                            >
                              {showExplanation ? correctAnswers[0] || "N/A" : "Hidden"}
                            </span>
                            {question.units ? (
                              <span className="rounded-md bg-white/70 px-2 py-0.5 text-base font-medium text-[#15803d]">
                                {question.units}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
                : options.map((option, optIndex) => {
                    const optionLabel = ANSWER_LABELS[optIndex] || String(optIndex + 1);
                    const isCorrect = correctAnswers.includes(optionLabel);

                    return (
                      <li key={`${optionLabel}-${optIndex}`} className={optionClass(isCorrect)}>
                        <span className={optionLabelClass(isCorrect)}>
                          {optionLabel}
                        </span>
                        <span className="user-body-sm flex-1">
                          <ContentRenderer content={option} />
                        </span>
                        {showExplanation && isCorrect ? checkIcon : null}
                      </li>
                    );
                  })}
          </ul>

          {showExplanation && correctOptionIndex >= 0 ? (
            <div className="user-badge user-badge-green mt-3 inline-flex">
              Correct answer: {ANSWER_LABELS[correctOptionIndex]}
            </div>
          ) : null}
        </div>

        <aside className="min-w-0 w-full border-t border-dashed border-[#d9dcec] pt-4 lg:flex-[0_0_43%] lg:max-w-[43%] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="user-card-title text-sm">Explanation</h2>
            <div className="grid w-full grid-cols-2 rounded-full border border-[#d9dcec] bg-[#f5f6fb] p-1 sm:inline-flex sm:w-auto">
              <label
                htmlFor={`q${index + 1}-toggle`}
                className={`cursor-pointer rounded-full px-3 py-1 text-center text-xs font-semibold transition-all ${
                  showExplanation
                    ? "bg-white text-[#4c1d95] shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                    : "bg-transparent text-[#6b7280]"
                }`}
              >
                Hide Explanation
              </label>
              <label
                htmlFor={`q${index + 1}-toggle`}
                className={`cursor-pointer rounded-full px-3 py-1 text-center text-xs font-semibold transition-all ${
                  !showExplanation
                    ? "bg-white text-[#4c1d95] shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                    : "bg-transparent text-[#6b7280]"
                }`}
              >
                Show Explanation
              </label>
            </div>
          </div>

          <div
            className={`user-detail-surface px-3 py-3 text-sm leading-6 transition-all ${
              showExplanation ? "" : "blur-[4px] opacity-50 pointer-events-none"
            }`}
          >
            {question.explanation ? (
              <ContentRenderer content={question.explanation} />
            ) : (
              <p>No explanation available</p>
            )}
          </div>

          <p className="user-helper mt-2 text-xs">
            Explanations are hidden until you choose <strong>Show Explanation</strong>.
            When visible, the correct answer is highlighted on the left.
          </p>
        </aside>
      </div>
    </article>
  );
}
