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

  // Determine correct option index for highlighting
  const getCorrectOptionIndex = () => {
    if (questionTypeId === 1 || questionTypeId === 2) {
      const correctLabel = correctAnswers[0];
      return ANSWER_LABELS.indexOf(correctLabel);
    }
    return -1;
  };

  const correctOptionIndex = getCorrectOptionIndex();

  return (
    <article className="relative mb-4.5 px-4 sm:px-4.5 py-4 sm:py-4.5 rounded-[18px] bg-white border border-[#e0e3f5] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <input
        type="checkbox"
        id={`q${index + 1}-toggle`}
        className="absolute opacity-0 pointer-events-none"
        checked={showExplanation}
        onChange={(e) => setShowExplanation(e.target.checked)}
      />

      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5 text-[13px] font-semibold">
          <span className="text-black">Question {index + 1} of {totalQuestions}</span>
          <span className="px-2.5 py-1 rounded-full bg-[#eef0ff] border border-dashed border-[rgba(159,163,232,0.9)] text-[11px] text-[#a0a5bf]">
            {questionTypeName}
          </span>
        </div>
        <div className="px-3 py-1.25 rounded-full bg-[#eef2ff] border border-[rgba(165,180,252,0.95)] text-[11px] text-[#3730a3] whitespace-nowrap">
          Single-Select Multiple Choice
        </div>
      </div>

      {/* Question Body */}
      <div className="flex flex-col lg:flex-row items-start gap-5 mt-3">
        {/* Left: Question and Options */}
        <div className="w-full lg:flex-[0_0_55%] lg:max-w-[55%] min-w-0">
          {/* Question Text */}
          <div className="text-base font-semibold mb-3">
            <ContentRenderer content={question.question || ""} />
          </div>

          {/* Options List */}
          <ul className="list-none m-0 p-0 grid gap-2.5">
            {questionTypeId === 3 ? (
              // True/False
              ["True", "False"].map((option, optIndex) => {
                const optionLabel = ANSWER_LABELS[optIndex];
                const isCorrect = correctAnswers.includes(option);
                const shouldHighlight = showExplanation && isCorrect;

                return (
                  <li
                    key={optIndex}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                      shouldHighlight
                        ? "border-[#16a34a] bg-[#ecfdf3] shadow-[0_0_0_1px_rgba(22,163,74,0.08)]"
                        : "border-[#e0e3f5] bg-[#f9fafb]"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                        shouldHighlight
                          ? "border-[#16a34a] bg-[#16a34a] text-white"
                          : "border-[#c5c9ee] bg-white text-[#a0a5bf]"
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="text-sm text-[#202437] flex-1">{option}</span>
                    {shouldHighlight && (
                      <svg
                        className="w-5 h-5 text-[#16a34a] flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : questionTypeId === 7 ? (
              // Numeric/Fill-in - Creative Design (shows/hides with toggle)
              <li className="relative overflow-hidden">
                <div className={`px-4 py-4 rounded-xl border-2 transition-all ${
                  showExplanation 
                    ? "border-[#16a34a] bg-gradient-to-br from-[#ecfdf3] via-[#d1fae5] to-[#ecfdf3] shadow-lg" 
                    : "border-[#e0e3f5] bg-[#f9fafb]"
                }`}>
                  {showExplanation ? (
                    <div className="flex items-center gap-3">
                      {/* Checkmark Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#16a34a] flex items-center justify-center shadow-md">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      
                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-[#16a34a] uppercase tracking-wide mb-1">
                          Correct Answer
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#16a34a]">
                            {correctAnswers[0] || "N/A"}
                          </span>
                          {question.units && (
                            <span className="text-base font-medium text-[#15803d] bg-white/60 px-2 py-0.5 rounded-md">
                              {question.units}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Decorative Element */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#16a34a]/10 rounded-full -mr-10 -mt-10" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Placeholder Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e0e3f5] flex items-center justify-center">
                        <svg
                          className="w-7 h-7 text-[#a0a5bf]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      
                      {/* Blurred Answer Content */}
                      <div className="flex-1 blur-sm opacity-50 pointer-events-none">
                        <div className="text-xs font-semibold text-[#7a819c] uppercase tracking-wide mb-1">
                          Correct Answer
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#7a819c]">
                            ••••
                          </span>
                          {question.units && (
                            <span className="text-base font-medium text-[#7a819c] bg-white/60 px-2 py-0.5 rounded-md">
                              {question.units}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ) : (
              // Type 1 and 2: Multiple choice options
              options.length > 0 &&
              options.map((option: string, optIndex: number) => {
                const optionLabel = ANSWER_LABELS[optIndex] || String(optIndex + 1);
                const isCorrect = correctAnswers.includes(optionLabel);
                const shouldHighlight = showExplanation && isCorrect;

                return (
                  <li
                    key={optIndex}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                      shouldHighlight
                        ? "border-[#16a34a] bg-[#ecfdf3] shadow-[0_0_0_1px_rgba(22,163,74,0.08)]"
                        : "border-[#e0e3f5] bg-[#f9fafb]"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                        shouldHighlight
                          ? "border-[#16a34a] bg-[#16a34a] text-white"
                          : "border-[#c5c9ee] bg-white text-[#a0a5bf]"
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="text-sm text-[#202437] flex-1">
                      <ContentRenderer content={option} />
                    </span>
                    {shouldHighlight && (
                      <svg
                        className="w-5 h-5 text-[#16a34a] flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Correct Tag */}
          {showExplanation && correctOptionIndex >= 0 && (
            <div className="mt-2 text-xs text-[#16a34a] inline-flex items-center gap-1.5 px-2.25 py-1 rounded-full bg-[#ecfdf3] border border-dashed border-[rgba(134,239,172,0.9)]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              <span><strong>Correct answer:</strong> {ANSWER_LABELS[correctOptionIndex]}</span>
            </div>
          )}
        </div>

        {/* Right: Explanation */}
        <aside className="w-full lg:flex-[0_0_43%] lg:max-w-[43%] min-w-0 pl-0 lg:pl-4.5 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-dashed border-[rgba(202,206,240,0.9)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <div className="text-[13px] font-semibold text-[#202437]">Explanation</div>
            <div className="inline-flex rounded-full p-0.5 bg-[#f3f4ff] border border-[rgba(191,194,244,0.9)] gap-0.5">
              <label
                htmlFor={`q${index + 1}-toggle`}
                className={`rounded-full border-none text-[11px] px-2 py-1 cursor-pointer transition-all whitespace-nowrap ${
                  showExplanation
                    ? "bg-white text-[#4c1d95] shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                    : "bg-transparent text-[#a0a5bf]"
                }`}
              >
                Hide
              </label>
              <label
                htmlFor={`q${index + 1}-toggle`}
                className={`rounded-full border-none text-[11px] px-2 py-1 cursor-pointer transition-all whitespace-nowrap ${
                  !showExplanation
                    ? "bg-white text-[#4c1d95] shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                    : "bg-transparent text-[#a0a5bf]"
                }`}
              >
                Show
              </label>
            </div>
          </div>

          <div
            className={`rounded-[14px] bg-[#f8f7ff] border border-dashed border-[rgba(190,195,239,0.9)] px-2.75 py-2.5 text-[13px] text-[#7a819c] leading-relaxed transition-all ${
              !showExplanation ? "blur-[4px] opacity-50 pointer-events-none" : ""
            }`}
          >
            {question.explanation ? (
              <ContentRenderer content={question.explanation} />
            ) : (
              <p>No explanation available</p>
            )}
          </div>

          <div className={`mt-1.5 text-[11px] transition-colors ${!showExplanation ? "text-[#a0a5bf]" : "text-[#7a819c]"}`}>
            Explanations are blurred until you click <strong>Show</strong>. When visible, the
            correct answer is highlighted on the left.
          </div>
        </aside>
      </div>
    </article>
  );
}
