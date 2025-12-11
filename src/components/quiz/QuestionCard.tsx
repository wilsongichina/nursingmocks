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
  const [isBlurred, setIsBlurred] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-10 shadow-md hover:shadow-lg transition-all duration-300 relative">
      {/* Question Type Badge - Mobile: Top Left, Desktop: Top Right */}
      <div className="absolute top-4 left-4 lg:left-auto lg:right-6 lg:top-6 z-10">
        <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200 shadow-sm">
          {questionTypeName}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 pt-8 sm:pt-10 lg:pt-0">
        {/* Left Column: Question and Options */}
        <div className="lg:col-span-2">
          {/* Question Number and Text */}
          <div className="mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <div className="text-gray-700 text-sm sm:text-base font-semibold">
                Question {index + 1} of {totalQuestions}
              </div>
            </div>
            <div className="text-gray-900 text-base sm:text-lg leading-relaxed font-medium">
              <ContentRenderer content={question.question || ""} />
            </div>
          </div>

          {/* Options - Different display based on question type */}
          {questionTypeId === 3 ? (
            // True/False
            <div className="space-y-3 sm:space-y-4">
              {["True", "False"].map((option, optIndex) => {
                const optionLabel = ANSWER_LABELS[optIndex];
                const isCorrect = correctAnswers.includes(option);

                return (
                  <div
                    key={optIndex}
                    className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCorrect
                        ? "bg-green-50 border-green-300 shadow-sm"
                        : "bg-gray-50 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shadow-sm ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <div className="flex-1 text-gray-800 font-medium text-sm sm:text-base pt-1">
                      {option}
                    </div>
                    {isCorrect && (
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1"
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
                  </div>
                );
              })}
            </div>
          ) : questionTypeId === 7 ? (
            // Numeric/Fill-in
            <div>
              <div className="p-4 sm:p-5 bg-green-50 border-2 border-green-300 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                    ✓
                  </span>
                  <div className="flex-1">
                    <div className="text-gray-900 font-bold text-sm sm:text-base">
                      Correct Answer: {correctAnswers[0] || "N/A"}
                      {question.units && (
                        <span className="text-gray-600 font-normal ml-2">
                          {question.units}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0"
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
                </div>
              </div>
            </div>
          ) : (
            // Type 1 and 2: Multiple choice options
            options.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {options.map((option: string, optIndex: number) => {
                  const optionLabel = ANSWER_LABELS[optIndex] || String(optIndex + 1);
                  const isCorrect = correctAnswers.includes(optionLabel);

                  return (
                    <div
                      key={optIndex}
                      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                        isCorrect
                          ? "bg-green-50 border-green-300 shadow-sm"
                          : "bg-gray-50 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shadow-sm ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <div className="flex-1 text-gray-800 text-sm sm:text-base leading-relaxed pt-1">
                        <ContentRenderer content={option} />
                      </div>
                      {isCorrect && (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1"
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
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Right Column: Rational/Explanation */}
        <div className="lg:col-span-3">
          {question.explanation ? (
            <div className="lg:sticky lg:top-8 relative">
              {/* Mobile: Show Explanation Button at Top */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsBlurred(!isBlurred)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-400 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-md"
                  title={isBlurred ? "Show Rational/Explanation" : "Hide Rational/Explanation"}
                >
                  {isBlurred ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>Show Explanation</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <span>Hide Explanation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rational/Explanation Heading - Aligned with question text */}
              <div className="flex items-start gap-3 mb-4 lg:mt-[2.75rem]">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="font-bold text-blue-900 text-base sm:text-lg">Rational/Explanation:</h4>
              </div>

              {/* Desktop: Blur Toggle Button */}
              <div className="hidden lg:block absolute top-0 right-0 z-20">
                <button
                  onClick={() => setIsBlurred(!isBlurred)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-md"
                  title={isBlurred ? "Show Rational/Explanation" : "Hide Rational/Explanation"}
                >
                  {isBlurred ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>Show Explanation</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <span>Hide Explanation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rational/Explanation Content with Blur */}
              <div
                className={`p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md transition-all duration-300 ${
                  isBlurred ? "blur-sm select-none pointer-events-none" : ""
                }`}
              >
                <div className="text-blue-900 leading-relaxed text-sm sm:text-base">
                  <ContentRenderer content={question.explanation} />
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:sticky lg:top-8 p-4 sm:p-6 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-gray-500 text-sm sm:text-base">
              No explanation available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

