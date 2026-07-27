"use client";

import { useState, type DragEvent } from "react";
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
const PROGRESS_DOTS = Array.from({ length: 32 });

function hasHtmlMarkup(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function plainExplanationParagraphs(value: string) {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) return [];

  const existingParagraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (existingParagraphs.length > 1) return existingParagraphs;

  const sentences =
    normalized
      .match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) || [normalized];

  if (sentences.length <= 3) return [normalized];

  const firstBreak = Math.min(2, sentences.length - 1);
  const secondBreak =
    sentences.length > 5 ? Math.ceil((sentences.length + firstBreak) / 2) : sentences.length;

  return [
    sentences.slice(0, firstBreak).join(" "),
    sentences.slice(firstBreak, secondBreak).join(" "),
    sentences.slice(secondBreak).join(" "),
  ].filter(Boolean);
}

function ExplanationContent({ content }: { content: string }) {
  if (!content) return <p>No explanation available</p>;
  if (hasHtmlMarkup(content)) return <ContentRenderer content={content} />;

  const paragraphs = plainExplanationParagraphs(content);
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

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
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [orderedLabels, setOrderedLabels] = useState<string[]>([]);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const normalizedCorrectAnswers = correctAnswers.map((answer) =>
    String(answer || "").trim().toLowerCase()
  );

  const isOptionCorrect = (label: string, option: string) => {
    const normalizedLabel = label.trim().toLowerCase();
    const normalizedOption = String(option || "").trim().toLowerCase();
    return normalizedCorrectAnswers.some(
      (answer) => answer === normalizedLabel || answer === normalizedOption
    );
  };

  const correctOptionLabels = options
    .map((option, optionIndex) => {
      const label = ANSWER_LABELS[optionIndex] || String(optionIndex + 1);
      return isOptionCorrect(label, option) ? label : "";
    })
    .filter(Boolean);

  const correctAnswerSummary =
    correctOptionLabels.length > 0
      ? correctOptionLabels
          .map((label) => {
            const option = options[ANSWER_LABELS.indexOf(label)];
            return option ? `${label}. ${option}` : label;
          })
          .join("; ")
      : correctAnswers.filter(Boolean).join(", ");

  const orderedCorrect =
    orderedLabels.length === correctAnswers.length &&
    orderedLabels.every((label, orderIndex) => label === correctAnswers[orderIndex]);

  const orderedAnswerSummary = correctAnswers
    .map((label) => {
      const option = options[ANSWER_LABELS.indexOf(label)] || "";
      return option || label;
    })
    .filter(Boolean)
    .join(" -> ");

  const selectedCorrectCount = selectedLabels.filter((label) => {
    const option = options[ANSWER_LABELS.indexOf(label)] || "";
    return isOptionCorrect(label, option);
  }).length;

  const isMultipleSelectCorrect =
    selectedLabels.length === correctOptionLabels.length &&
    selectedCorrectCount === correctOptionLabels.length;

  const normalizeNumericAnswer = (value: string) =>
    value.trim().replace(/\s+/g, "").toLowerCase();

  const numericIsCorrect =
    normalizeNumericAnswer(numericAnswer) !== "" &&
    normalizedCorrectAnswers.some((answer) => {
      const normalizedAnswer = normalizeNumericAnswer(answer);
      return (
        normalizedAnswer === normalizeNumericAnswer(numericAnswer) ||
        Number(normalizedAnswer) === Number(normalizeNumericAnswer(numericAnswer))
      );
    });

  const hasAnswered =
    questionTypeId === 6
      ? orderedLabels.length === options.length && options.length > 0
      : questionTypeId === 7
      ? numericAnswer.trim().length > 0
      : selectedLabels.length > 0;

  const answerIsCorrect =
    questionTypeId === 6
      ? orderedCorrect
      : questionTypeId === 2
      ? isMultipleSelectCorrect
      : questionTypeId === 7
        ? numericIsCorrect
        : selectedLabels.length === 1 &&
          selectedCorrectCount === 1;

  const reviewVisible = checked || showExplanation;

  const handleOptionSelect = (label: string) => {
    if (reviewVisible) return;
    setSelectedLabels((previous) => {
      if (questionTypeId === 2) {
        return previous.includes(label)
          ? previous.filter((selected) => selected !== label)
          : [...previous, label];
      }
      return [label];
    });
  };

  const addOrderedLabel = (label: string) => {
    if (reviewVisible || orderedLabels.includes(label)) return;
    setOrderedLabels((previous) => [...previous, label]);
  };

  const moveOrderedLabel = (fromIndex: number, toIndex: number) => {
    if (reviewVisible || fromIndex === toIndex) return;
    setOrderedLabels((previous) => {
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const dragPayload = (event: DragEvent, label: string, sourceIndex?: number) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ label, sourceIndex })
    );
  };

  const readDragPayload = (event: DragEvent) => {
    try {
      return JSON.parse(event.dataTransfer.getData("application/json")) as {
        label?: string;
        sourceIndex?: number;
      };
    } catch {
      return {};
    }
  };

  const dropOrderedLabel = (event: DragEvent, targetIndex?: number) => {
    event.preventDefault();
    if (reviewVisible) return;
    const payload = readDragPayload(event);
    if (!payload.label) return;
    if (typeof payload.sourceIndex === "number") {
      moveOrderedLabel(payload.sourceIndex, targetIndex ?? orderedLabels.length - 1);
      return;
    }
    if (orderedLabels.includes(payload.label)) return;
    setOrderedLabels((previous) => {
      const next = [...previous];
      next.splice(targetIndex ?? next.length, 0, payload.label!);
      return next;
    });
  };

  const removeOrderedLabel = (label: string) => {
    if (reviewVisible) return;
    setOrderedLabels((previous) => previous.filter((item) => item !== label));
  };

  return (
    <article className="user-card overflow-hidden p-3 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="user-card-title text-sm">
          Question {index + 1} of {totalQuestions}
        </span>
        <span className="user-badge">{questionTypeName}</span>
      </div>

      <div className="mt-4 space-y-5">
        <div className="min-w-0 w-full">
          {question.passage ? (
            <section className="mb-4 rounded-lg border border-[#d9dcec] bg-[#f8fafc] p-3 sm:p-4">
              <div className="user-label mb-2 text-[#4c1d95]">Passage</div>
              <div className="user-body-sm leading-7 text-[#334155] [overflow-wrap:anywhere]">
                <ContentRenderer content={question.passage} />
              </div>
            </section>
          ) : null}
          <div className="user-card-title mb-4 text-[15px] leading-7 sm:text-base [overflow-wrap:anywhere]">
            <ContentRenderer content={question.question || ""} />
          </div>

          <div className="mb-4 flex w-full items-center justify-between gap-1.5 sm:mb-5 sm:gap-2" aria-hidden="true">
            {PROGRESS_DOTS.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full sm:h-1.5 sm:w-1.5 ${
                  dotIndex % 5 === 0
                    ? "bg-cyan-300"
                    : dotIndex % 3 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                }`}
              />
            ))}
          </div>

          <div className="border border-[#d9dcec] bg-white p-3 sm:p-4">
          <p className="mb-3 text-sm font-semibold leading-6 text-[#0f172a]">
            {questionTypeId === 2
              ? "(Select All that Apply.)"
              : questionTypeId === 6
                ? "Move each option into the correct order."
                : questionTypeId === 7
                  ? "Enter the numeric answer."
                  : "Select one answer."}
          </p>

          {questionTypeId === 6 ? (
            <div>
              <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
                <section
                  className="min-h-[160px] border border-gray-300 bg-[#f9fafb] p-3 sm:min-h-[260px] sm:p-4"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const payload = readDragPayload(event);
                    if (payload.label) removeOrderedLabel(payload.label);
                  }}
                >
                  <div className="space-y-2">
                    {options.map((option, optionIndex) => {
                      const label = ANSWER_LABELS[optionIndex] || String(optionIndex + 1);
                      if (orderedLabels.includes(label)) return null;
                      return (
                        <button
                          key={label}
                          type="button"
                          draggable={!reviewVisible}
                          onDragStart={(event) => dragPayload(event, label)}
                          onClick={() => addOrderedLabel(label)}
                          disabled={reviewVisible}
                          className="flex min-h-11 w-full items-center border border-gray-400 bg-white px-3 py-2.5 text-left text-sm leading-6 text-gray-900 transition hover:border-gray-700 hover:bg-gray-50 disabled:cursor-default sm:min-h-12 sm:px-4"
                          style={{ borderRadius: 0 }}
                        >
                          <ContentRenderer content={option} />
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section
                  className="min-h-[160px] border-4 border-dashed border-gray-400 bg-white p-3 sm:min-h-[260px] sm:p-4"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => dropOrderedLabel(event)}
                  style={{ borderRadius: 0 }}
                >
                  <ol className="space-y-2">
                    {orderedLabels.map((label, orderedIndex) => {
                      const option = options[ANSWER_LABELS.indexOf(label)] || label;
                      const expectedLabel = correctAnswers[orderedIndex];
                      const correctPosition = reviewVisible && label === expectedLabel;
                      const wrongPosition = reviewVisible && label !== expectedLabel;
                      return (
                        <li
                          key={`${label}-${orderedIndex}`}
                          draggable={!reviewVisible}
                          onDragStart={(event) => dragPayload(event, label, orderedIndex)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => dropOrderedLabel(event, orderedIndex)}
                          className={`flex min-h-11 items-center border px-3 py-2.5 text-left text-sm leading-6 sm:min-h-12 sm:px-4 ${
                            correctPosition
                              ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                              : wrongPosition
                                ? "border-amber-500 bg-amber-50 text-amber-950"
                                : "border-gray-400 bg-gray-50 text-gray-900"
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          <span className="mr-3 text-xs font-bold text-gray-500">{orderedIndex + 1}</span>
                          <span className="min-w-0 flex-1">
                            <ContentRenderer content={option} />
                          </span>
                          {!reviewVisible ? (
                            <button
                              type="button"
                              onClick={() => removeOrderedLabel(label)}
                              className="ml-3 text-xs font-semibold text-gray-500 hover:text-gray-900"
                            >
                              Remove
                            </button>
                          ) : correctPosition ? (
                            <span className="ml-3 text-xs font-semibold text-emerald-700">Correct</span>
                          ) : (
                            <span className="ml-3 text-xs font-semibold text-amber-700">
                              Expected {expectedLabel || "-"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                    {orderedLabels.length === 0 ? (
                      <li className="flex min-h-20 items-center justify-center px-3 text-center text-sm font-medium text-gray-500">
                        Tap or drag choices here.
                      </li>
                    ) : null}
                  </ol>
                </section>
              </div>
              {reviewVisible && !orderedCorrect && orderedAnswerSummary ? (
                <div className="mt-4 border border-amber-200 bg-amber-50 p-4 text-sm text-gray-900" style={{ borderRadius: 0 }}>
                  <p className="text-xs font-semibold uppercase text-amber-700">Correct order</p>
                  <p className="mt-2">{orderedAnswerSummary}</p>
                </div>
              ) : null}
            </div>
          ) : (
          <ul className="grid list-none gap-3 p-0">
            {questionTypeId === 3
              ? ["True", "False"].map((option, optIndex) => {
                  const optionLabel = ANSWER_LABELS[optIndex];
                  const isSelected = selectedLabels.includes(optionLabel);
                  const isCorrect = isOptionCorrect(optionLabel, option);
                  const showCorrect = reviewVisible && isCorrect;
                  const showWrong = reviewVisible && isSelected && !isCorrect;

                  return (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => handleOptionSelect(optionLabel)}
                        disabled={reviewVisible}
                        className="flex min-h-11 w-full items-center gap-3 bg-transparent px-2 py-2.5 text-left text-sm leading-6 transition hover:bg-gray-50 disabled:cursor-default sm:gap-4 sm:px-4 sm:py-3"
                        style={{ borderRadius: 0 }}
                      >
                        <span
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            showCorrect
                              ? "border-emerald-600 bg-emerald-600"
                              : showWrong
                                ? "border-red-600 bg-red-600"
                                : isSelected
                                  ? "border-gray-700 bg-gray-500"
                                  : "border-gray-400 bg-gray-100"
                          }`}
                          aria-hidden="true"
                        >
                          {(isSelected || showCorrect) && (
                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-gray-800 [overflow-wrap:anywhere]">{option}</span>
                        {reviewVisible && (showCorrect || showWrong) ? (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold ${
                              showCorrect ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {showCorrect ? "Correct" : "Review"}
                          </span>
                      ) : null}
                      </button>
                    </li>
                  );
                })
              : questionTypeId === 7
                ? (
                  <li>
                    <div
                      className={`relative overflow-hidden border px-3 py-4 transition-all sm:px-4 ${
                        reviewVisible
                          ? "border-[#16a34a] bg-[#ecfdf3] shadow-lg"
                          : "border-[#e3e5f0] bg-[#f9fafb]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center ${
                            reviewVisible ? "bg-[#16a34a]" : "bg-[#e3e5f0]"
                          }`}
                        >
                          {reviewVisible ? (
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
                        <div className="min-w-0 flex-1">
                          <div
                            className={`user-label mb-1 ${
                              reviewVisible ? "text-[#16a34a]" : ""
                            }`}
                          >
                            Your Answer
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={numericAnswer}
                              onChange={(event) => setNumericAnswer(event.target.value)}
                              disabled={reviewVisible}
                              className="min-h-11 w-full rounded-lg border border-[#d9dcec] bg-white px-3 py-2 text-base font-semibold text-[#0f172a] outline-none focus:border-[#4c1d95] focus:ring-2 focus:ring-[#ede9fe] disabled:cursor-default disabled:bg-white/70 sm:max-w-[180px]"
                              placeholder="Enter answer"
                            />
                            {question.units ? (
                              <span className="rounded-md bg-white/70 px-2 py-0.5 text-base font-medium text-[#15803d]">
                                {question.units}
                              </span>
                            ) : null}
                          </div>
                          {reviewVisible ? (
                            <div
                              className={`mt-2 text-sm font-semibold ${
                                numericIsCorrect ? "text-[#15803d]" : "text-[#dc2626]"
                              }`}
                            >
                              {numericIsCorrect ? "Correct" : `Correct answer: ${correctAnswers[0] || "N/A"}`}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                )
                : options.map((option, optIndex) => {
                    const optionLabel = ANSWER_LABELS[optIndex] || String(optIndex + 1);
                    const isSelected = selectedLabels.includes(optionLabel);
                    const isCorrect = isOptionCorrect(optionLabel, option);
                    const showCorrect = reviewVisible && isCorrect;
                    const showWrong = reviewVisible && isSelected && !isCorrect;
                    const isMultiSelect = questionTypeId === 2;

                    return (
                      <li key={`${optionLabel}-${optIndex}`}>
                        <button
                          type="button"
                          onClick={() => handleOptionSelect(optionLabel)}
                          disabled={reviewVisible}
                          className={`flex min-h-11 w-full items-center bg-transparent text-left text-sm leading-6 text-gray-800 transition hover:bg-gray-50 disabled:cursor-default ${
                            isMultiSelect ? "gap-3 px-1 py-2" : "gap-3 px-2 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          <span
                            className={`flex flex-shrink-0 items-center justify-center border ${
                              isMultiSelect
                                ? "h-4 w-4"
                                : "h-7 w-7 rounded-full border-2"
                            } ${
                              showCorrect
                                ? "border-emerald-600 bg-emerald-600"
                                : showWrong
                                  ? "border-red-600 bg-red-600"
                                  : isSelected
                                    ? "border-gray-700 bg-gray-500"
                                    : isMultiSelect
                                      ? "border-gray-500 bg-gray-100"
                                      : "border-gray-400 bg-gray-100"
                            }`}
                            aria-hidden="true"
                          >
                            {(isSelected || showCorrect) && (
                              <span
                                className={
                                  isMultiSelect
                                    ? "h-2 w-2 bg-white"
                                    : "h-2.5 w-2.5 rounded-full bg-white"
                                }
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                            <ContentRenderer content={option} />
                          </span>
                          {reviewVisible && (showCorrect || showWrong) ? (
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold ${
                                showCorrect ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {showCorrect ? "Correct" : "Review"}
                            </span>
                        ) : null}
                        </button>
                      </li>
                    );
                  })}
          </ul>
          )}

          <div className="mt-5 flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span className="w-fit border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
              {questionTypeId === 6
                ? `${orderedLabels.length} of ${options.length} placed`
                : questionTypeId === 7
                  ? numericAnswer.trim() ? "Answer entered" : "No answer entered"
                  : `${selectedLabels.length} selected`}
            </span>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => {
                setChecked(true);
                setShowExplanation(true);
              }}
              disabled={!hasAnswered || reviewVisible}
              className="user-button-primary min-h-11 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check Answer
            </button>
            {reviewVisible ? (
              <span
                className={`user-badge col-span-2 justify-center sm:col-span-1 ${
                  answerIsCorrect ? "user-badge-green" : "user-badge-amber"
                }`}
              >
                {answerIsCorrect ? "Correct" : "Review answer"}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setChecked(false);
                setShowExplanation(false);
                setSelectedLabels([]);
                setOrderedLabels([]);
                setNumericAnswer("");
              }}
              className="user-button-secondary min-h-11 px-4 py-2 text-sm"
            >
              Reset
            </button>
            </div>
          </div>

          {reviewVisible && questionTypeId !== 6 && correctAnswerSummary ? (
            <div className="user-badge user-badge-green mt-3 inline-flex whitespace-normal text-left">
              Correct answer: {correctAnswerSummary}
            </div>
          ) : null}

          <section className="mt-5 border-t border-dashed border-[#d9dcec] pt-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="user-card-title text-sm">Explanation</h2>
              <button
                type="button"
                onClick={() => setShowExplanation((visible) => !visible)}
                className="user-button-secondary min-h-10 w-full px-4 py-2 text-sm sm:w-auto"
              >
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
              </button>
            </div>

            {showExplanation ? (
              <div className="user-detail-surface px-3 py-3 text-sm leading-6 [overflow-wrap:anywhere]">
                <ExplanationContent content={question.explanation || ""} />
              </div>
            ) : (
              <div className="user-detail-surface px-3 py-3 text-sm leading-6 text-[#64748b] [overflow-wrap:anywhere]">
                Explanations are hidden until you check the answer or choose Show
                Explanation.
              </div>
            )}
          </section>
          </div>
        </div>
      </div>
    </article>
  );
}
