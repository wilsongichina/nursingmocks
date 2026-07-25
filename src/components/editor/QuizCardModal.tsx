"use client";

import { useState, useEffect } from "react";
import {
  getAllPillarPages,
  getNursingEntranceExamSubPages,
  getNursingTestBankSubPages,
  getNursingExitExamSubPages,
  getNestedSubPages,
  getNursingTestBankNestedSubPages,
  getNursingExitExamNestedSubPages,
  getNursingTestBankTopics,
  getNursingEntranceExamQuizzes,
  getNursingTestBankQuizzes,
  getNursingExitExamQuizzes,
  getNursingEntranceExamQuizQuestions,
  getNursingTestBankQuizQuestions,
  getNursingExitExamQuizQuestions,
} from "@/lib/firestore-operations";
import { QuizCardRenderer } from "./QuizCardRenderer";

const SUPPORTED_QUIZ_CARD_QUESTION_TYPES = new Set([1, 2, 3, 7]);
const DEFAULT_QUIZ_CARD_QUESTION_COUNT = 5;

const isSupportedQuizCardQuestion = (question: any) => {
  const typeId = question.questionTypeId || question.question_type_id;
  return SUPPORTED_QUIZ_CARD_QUESTION_TYPES.has(Number(typeId));
};

const getQuestionId = (question: any) => question.id || question.questionId;

const getDefaultSelectedQuestionIds = (questions: any[]) =>
  new Set(
    questions
      .slice(0, DEFAULT_QUIZ_CARD_QUESTION_COUNT)
      .map(getQuestionId)
      .filter(Boolean)
  );

interface QuizCardModalProps {
  initialData?: {
    pillarId?: string;
    subPageId?: string;
    nestedSubPageId?: string;
    topicId?: string;
    quizId?: string;
    quizTitle?: string;
    selectedQuestionIds?: string[];
  };
  onSave?: (data: {
    pillarId: string;
    subPageId: string;
    nestedSubPageId: string;
    topicId?: string;
    quizId: string;
    quizTitle: string;
    selectedQuestionIds?: string[];
  }) => void;
  onClose?: () => void;
  isEditable?: boolean;
}

export function QuizCardModal({
  initialData,
  onSave,
  onClose: _onClose,
  isEditable = true,
}: QuizCardModalProps) {
  const [step, setStep] = useState<"select" | "chooseQuestions" | "quiz">("select");
  const [pillarId, setPillarId] = useState(initialData?.pillarId || "");
  const [subPageId, setSubPageId] = useState(initialData?.subPageId || "");
  const [nestedSubPageId, setNestedSubPageId] = useState(
    initialData?.nestedSubPageId || ""
  );
  const [topicId, setTopicId] = useState(initialData?.topicId || "");
  const [quizId, setQuizId] = useState(initialData?.quizId || "");
  const [quizTitle, setQuizTitle] = useState(initialData?.quizTitle || "");

  const [pillars, setPillars] = useState<any[]>([]);
  const [subPages, setSubPages] = useState<any[]>([]);
  const [nestedSubPages, setNestedSubPages] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingSubPages, setLoadingSubPages] = useState(false);
  const [loadingNestedSubPages, setLoadingNestedSubPages] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState("");

  const isTestBank = pillarId === "nursing-test-bank";

  // Auto-load questions if initialData has all required fields
  useEffect(() => {
    const loadInitialQuestions = async () => {
      if (
        initialData?.pillarId &&
        initialData?.subPageId &&
        initialData?.nestedSubPageId &&
        initialData?.quizId &&
        (initialData.pillarId !== "nursing-test-bank" || initialData?.topicId)
      ) {
        setPillarId(initialData.pillarId);
        setSubPageId(initialData.subPageId);
        setNestedSubPageId(initialData.nestedSubPageId);
        if (initialData.topicId) setTopicId(initialData.topicId);
        setQuizId(initialData.quizId);
        if (initialData.quizTitle) setQuizTitle(initialData.quizTitle);

        // Load questions
        setLoading(true);
        try {
          let result;

          if (initialData.pillarId === "nursing-entrance-exam") {
            result = await getNursingEntranceExamQuizQuestions(
              initialData.subPageId,
              initialData.nestedSubPageId,
              initialData.quizId
            );
          } else if (initialData.pillarId === "nursing-test-bank") {
            result = await getNursingTestBankQuizQuestions(
              initialData.subPageId,
              initialData.nestedSubPageId,
              initialData.topicId!,
              initialData.quizId
            );
          } else if (initialData.pillarId === "nursing-exit-exam") {
            result = await getNursingExitExamQuizQuestions(
              initialData.subPageId,
              initialData.nestedSubPageId,
              initialData.quizId
            );
          } else {
            setLoading(false);
            return;
          }

          if (result.success && result.data) {
            const filteredQuestions = result.data.filter(isSupportedQuizCardQuestion);

            if (filteredQuestions.length > 0) {
              setAvailableQuestions(filteredQuestions);
              // If we have initial selected question IDs, use them, otherwise select all
              if (initialData?.selectedQuestionIds && Array.isArray(initialData.selectedQuestionIds)) {
                const selectedIds = initialData.selectedQuestionIds;
                setSelectedQuestionIds(new Set(selectedIds));
                const selected = filteredQuestions.filter((q: any) =>
                  selectedIds.includes(getQuestionId(q))
                );
                setQuestions(selected);
                setStep("quiz");
              } else {
                // Quiz cards are previews, so start with a small curated set.
                const defaultIds = getDefaultSelectedQuestionIds(filteredQuestions);
                const selected = filteredQuestions.filter((q: any) =>
                  defaultIds.has(getQuestionId(q))
                );
                setSelectedQuestionIds(defaultIds);
                setQuestions(selected);
                setStep("quiz");
              }
            }
          }
        } catch (err) {
          console.error("Error loading initial questions:", err);
        }
        setLoading(false);
      }
    };

    loadInitialQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load pillars on mount
  useEffect(() => {
    const loadPillars = async () => {
      const result = await getAllPillarPages();
      if (result.success && result.data) {
        setPillars(result.data);
      }
    };
    loadPillars();
  }, []);

  // Load sub-pages when pillar changes
  useEffect(() => {
    if (!pillarId) {
      setSubPages([]);
      setSubPageId("");
      return;
    }

    const loadSubPages = async () => {
      setLoadingSubPages(true);
      setError("");
      let result;

      if (pillarId === "nursing-entrance-exam") {
        result = await getNursingEntranceExamSubPages();
      } else if (pillarId === "nursing-test-bank") {
        result = await getNursingTestBankSubPages();
      } else if (pillarId === "nursing-exit-exam") {
        result = await getNursingExitExamSubPages();
      } else {
        setSubPages([]);
        setLoadingSubPages(false);
        return;
      }

      if (result.success && result.data) {
        setSubPages(result.data);
      } else {
        setError(result.message || "Failed to load sub-pages");
      }
      setLoadingSubPages(false);
    };

    loadSubPages();
    setNestedSubPageId("");
    setTopicId("");
    setQuizId("");
  }, [pillarId]);

  // Load nested sub-pages when sub-page changes
  useEffect(() => {
    if (!pillarId || !subPageId) {
      setNestedSubPages([]);
      setNestedSubPageId("");
      return;
    }

    const loadNestedSubPages = async () => {
      setLoadingNestedSubPages(true);
      setError("");
      let result;

      if (pillarId === "nursing-entrance-exam") {
        result = await getNestedSubPages(subPageId);
      } else if (pillarId === "nursing-test-bank") {
        result = await getNursingTestBankNestedSubPages(subPageId);
      } else if (pillarId === "nursing-exit-exam") {
        result = await getNursingExitExamNestedSubPages(subPageId);
      } else {
        setNestedSubPages([]);
        setLoadingNestedSubPages(false);
        return;
      }

      if (result.success && result.data) {
        setNestedSubPages(result.data);
      } else {
        setError(result.message || "Failed to load nested sub-pages");
      }
      setLoadingNestedSubPages(false);
    };

    loadNestedSubPages();
    setTopicId("");
    setQuizId("");
  }, [pillarId, subPageId]);

  // Load topics when nested sub-page changes (only for test bank)
  useEffect(() => {
    if (!isTestBank || !pillarId || !subPageId || !nestedSubPageId) {
      setTopics([]);
      setTopicId("");
      return;
    }

    const loadTopics = async () => {
      setLoadingTopics(true);
      setError("");
      const result = await getNursingTestBankTopics(subPageId, nestedSubPageId);

      if (result.success && result.data) {
        setTopics(result.data);
      } else {
        setError(result.message || "Failed to load topics");
      }
      setLoadingTopics(false);
    };

    loadTopics();
    setQuizId("");
  }, [pillarId, subPageId, nestedSubPageId, isTestBank]);

  // Load quizzes when all required fields are selected
  useEffect(() => {
    if (!pillarId || !subPageId || !nestedSubPageId) {
      setQuizzes([]);
      setQuizId("");
      return;
    }

    if (isTestBank && !topicId) {
      setQuizzes([]);
      setQuizId("");
      return;
    }

    const loadQuizzes = async () => {
      setLoadingQuizzes(true);
      setError("");
      let result;

      if (pillarId === "nursing-entrance-exam") {
        result = await getNursingEntranceExamQuizzes(subPageId, nestedSubPageId);
      } else if (pillarId === "nursing-test-bank") {
        result = await getNursingTestBankQuizzes(
          subPageId,
          nestedSubPageId,
          topicId
        );
      } else if (pillarId === "nursing-exit-exam") {
        result = await getNursingExitExamQuizzes(subPageId, nestedSubPageId);
      } else {
        setQuizzes([]);
        setLoadingQuizzes(false);
        return;
      }

      if (result.success && result.data) {
        setQuizzes(result.data);
      } else {
        setError(result.message || "Failed to load quizzes");
      }
      setLoadingQuizzes(false);
    };

    loadQuizzes();
  }, [pillarId, subPageId, nestedSubPageId, topicId, isTestBank]);

  // Update quiz title when quiz is selected
  useEffect(() => {
    if (quizId && quizzes.length > 0) {
      const selectedQuiz = quizzes.find(
        (q) => q.id === quizId || q.slug === quizId
      );
      if (selectedQuiz) {
        const nextTitle = selectedQuiz.pageName || selectedQuiz.title || quizId;
        setQuizTitle((currentTitle) => currentTitle || nextTitle);
      }
    }
  }, [quizId, quizzes]);

  const canContinue =
    pillarId &&
    subPageId &&
    nestedSubPageId &&
    (!isTestBank || topicId) &&
    quizId;

  const getFinalQuizTitle = () => {
    const trimmedTitle = quizTitle.trim();
    return trimmedTitle || "Practice Questions";
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    setError("");

    try {
      let result;

      if (pillarId === "nursing-entrance-exam") {
        result = await getNursingEntranceExamQuizQuestions(
          subPageId,
          nestedSubPageId,
          quizId
        );
      } else if (pillarId === "nursing-test-bank") {
        result = await getNursingTestBankQuizQuestions(
          subPageId,
          nestedSubPageId,
          topicId,
          quizId
        );
      } else if (pillarId === "nursing-exit-exam") {
        result = await getNursingExitExamQuizQuestions(
          subPageId,
          nestedSubPageId,
          quizId
        );
      } else {
        setError("Invalid pillar selected");
        setLoading(false);
        return;
      }

      if (result.success && result.data) {
        const filteredQuestions = result.data.filter(isSupportedQuizCardQuestion);

        if (filteredQuestions.length === 0) {
          setError(
            "No supported questions found for this quiz. Quiz cards can display question types 1, 2, 3, and 7."
          );
          setLoading(false);
          return;
        }

        setAvailableQuestions(filteredQuestions);
        setSelectedQuestionIds(getDefaultSelectedQuestionIds(filteredQuestions));
        setStep("chooseQuestions");
      } else {
        setError(result.message || "Failed to load questions");
      }
    } catch (err) {
      setError("An error occurred while loading questions");
      console.error(err);
    }

    setLoading(false);
  };

  const handleQuestionToggle = (questionId: string) => {
    const newSelected = new Set(selectedQuestionIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === availableQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      const allIds = new Set(availableQuestions.map(getQuestionId).filter(Boolean));
      setSelectedQuestionIds(allIds);
    }
  };

  const handleConfirmQuestions = () => {
    if (selectedQuestionIds.size === 0) {
      setError("Please select at least one question");
      return;
    }

    const selected = availableQuestions.filter((q: any) =>
      selectedQuestionIds.has(getQuestionId(q))
    );
    setQuestions(selected);

    // Save the selection
    if (onSave) {
      onSave({
        pillarId,
        subPageId,
        nestedSubPageId,
        topicId: isTestBank ? topicId : undefined,
        quizId,
        quizTitle: getFinalQuizTitle(),
        selectedQuestionIds: Array.from(selectedQuestionIds),
      });
    }

    setStep("quiz");
  };

  // If we have questions, show the quiz renderer
  if (step === "quiz" && questions.length > 0) {
    return (
      <QuizCardRenderer
        questions={questions}
        quizTitle={getFinalQuizTitle()}
        isEditable={isEditable}
        onEdit={() => setStep("select")}
      />
    );
  }

  // Show question selection step
  if (step === "chooseQuestions") {
    const stripHtmlTags = (html: string): string => {
      if (!html) return "";
      if (typeof window === "undefined") {
        return html.replace(/<[^>]*>/g, "").trim();
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      return (tempDiv.textContent || tempDiv.innerText || html).trim();
    };

    return (
      <div 
        className="quiz-card-modal admin-card p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="admin-card-title mb-2 text-lg">
            Select Questions
          </h3>
          <p className="admin-helper max-w-2xl">
            Name the embedded quiz card and choose the questions students should see. The first {DEFAULT_QUIZ_CARD_QUESTION_COUNT} supported questions are selected by default.
          </p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error mb-4 p-3">
            <p className="admin-helper">{error}</p>
          </div>
        )}

        <label className="admin-control mb-4 block">
          <span className="admin-field-label mb-2 block">Quiz Card Title</span>
          <input
            type="text"
            value={quizTitle}
            onChange={(event) => setQuizTitle(event.target.value)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="admin-field"
            placeholder="Example: TEAS Math Quick Practice"
          />
          <span className="admin-helper mt-1 block">
            This title appears at the top of the embedded quiz card.
          </span>
        </label>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="admin-helper">
            {selectedQuestionIds.size} of {availableQuestions.length} selected
          </div>
          <button
            onClick={handleSelectAll}
            className="admin-button-secondary min-h-[34px] px-3 py-1.5 text-xs"
          >
            {selectedQuestionIds.size === availableQuestions.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4">
          {availableQuestions.map((question, index) => {
            const questionId = getQuestionId(question);
            const isSelected = selectedQuestionIds.has(questionId);
            const questionText = stripHtmlTags(question.question || "");
            const questionTypeId = question.questionTypeId || question.question_type_id || 1;

            const getQuestionTypeName = (typeId: number) => {
              switch (typeId) {
                case 1:
                  return "Multiple Choice";
                case 2:
                  return "Multiple Select";
                case 3:
                  return "True/False";
                case 7:
                  return "Numeric";
                default:
                  return "Multiple Choice";
              }
            };

            return (
              <label
                key={questionId}
                className={`admin-info-tile flex cursor-pointer items-start gap-3 p-3 transition ${
                  isSelected ? "border-[rgba(79,70,229,0.42)] bg-[rgba(79,70,229,0.08)]" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleQuestionToggle(questionId)}
                  className="mt-1 h-4 w-4 rounded border-[#e3e5f0] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="admin-helper text-xs font-medium">
                      Question {index + 1}
                    </span>
                    <span className="admin-status-badge admin-status-badge-gray px-2 py-0.5 text-xs">
                      {getQuestionTypeName(questionTypeId)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-[var(--admin-text)]">
                    {questionText || "No question text"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setStep("select")}
            className="admin-button-cancel"
          >
            Back
          </button>
          <button
            onClick={handleConfirmQuestions}
            disabled={selectedQuestionIds.size === 0 || !getFinalQuizTitle()}
            className="admin-button-primary"
          >
            Confirm Selection ({selectedQuestionIds.size})
          </button>
        </div>
      </div>
    );
  }

  // Show selection form
  return (
    <div 
      className="quiz-card-modal admin-card p-4"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="admin-card-title mb-2 text-lg">
          Select Quiz
        </h3>
        <p className="admin-helper max-w-2xl">
          Choose a quiz to embed. Question types 1, 2, 3, and 7 will be displayed.
          You can name the card and choose the exact questions before saving it.
        </p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error mb-4 p-3">
          <p className="admin-helper">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Pillar Selection */}
        <div>
          <label className="admin-field-label mb-2 block">
            Pillar Page *
          </label>
              <select
                value={pillarId}
                onChange={(e) => {
                  e.stopPropagation();
                  setPillarId(e.target.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="admin-field"
              >
            <option value="">Select pillar page</option>
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.pageName || pillar.id}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Page Selection */}
        {pillarId && (
          <div>
            <label className="admin-field-label mb-2 block">
              Sub-Page *
            </label>
            <div className="relative">
              <select
                value={subPageId}
                onChange={(e) => {
                  e.stopPropagation();
                  setSubPageId(e.target.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="admin-field"
                disabled={loadingSubPages}
              >
                <option value="">
                  {loadingSubPages ? "Loading..." : "Select sub-page"}
                </option>
                {subPages.map((subPage) => (
                  <option key={subPage.id} value={subPage.id}>
                    {subPage.pageName || subPage.id}
                  </option>
                ))}
              </select>
              {loadingSubPages && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="admin-loading-spinner h-5 w-5"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nested Sub-Page Selection */}
        {pillarId && subPageId && (
          <div>
            <label className="admin-field-label mb-2 block">
              Nested Sub-Page *
            </label>
            <div className="relative">
              <select
                value={nestedSubPageId}
                onChange={(e) => {
                  e.stopPropagation();
                  setNestedSubPageId(e.target.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="admin-field"
                disabled={loadingNestedSubPages}
              >
                <option value="">
                  {loadingNestedSubPages ? "Loading..." : "Select nested sub-page"}
                </option>
                {nestedSubPages.map((nested) => (
                  <option key={nested.id} value={nested.id}>
                    {nested.pageName || nested.id}
                  </option>
                ))}
              </select>
              {loadingNestedSubPages && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="admin-loading-spinner h-5 w-5"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topic Selection (only for test bank) */}
        {isTestBank && pillarId && subPageId && nestedSubPageId && (
          <div>
            <label className="admin-field-label mb-2 block">
              Topic *
            </label>
            <div className="relative">
              <select
                value={topicId}
                onChange={(e) => {
                  e.stopPropagation();
                  setTopicId(e.target.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="admin-field"
                disabled={loadingTopics}
              >
                <option value="">
                  {loadingTopics ? "Loading..." : "Select topic"}
                </option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.pageName || topic.id}
                  </option>
                ))}
              </select>
              {loadingTopics && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="admin-loading-spinner h-5 w-5"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz Selection */}
        {pillarId &&
          subPageId &&
          nestedSubPageId &&
          (!isTestBank || topicId) && (
            <div>
              <label className="admin-field-label mb-2 block">
                Quiz *
              </label>
              <div className="relative">
                <select
                  value={quizId}
                  onChange={(e) => {
                    e.stopPropagation();
                    setQuizId(e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="admin-field"
                  disabled={loadingQuizzes}
                >
                  <option value="">
                    {loadingQuizzes ? "Loading..." : "Select quiz"}
                  </option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.pageName || quiz.title || quiz.id}
                    </option>
                  ))}
                </select>
                {loadingQuizzes && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="admin-loading-spinner h-5 w-5"></div>
                  </div>
                )}
              </div>
            </div>
          )}

        {quizId && (
          <label className="admin-control block">
            <span className="admin-field-label mb-2 block">Quiz Card Title</span>
            <input
              type="text"
              value={quizTitle}
              onChange={(event) => {
                event.stopPropagation();
                setQuizTitle(event.target.value);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className="admin-field"
              placeholder="Example: Quick Practice Questions"
            />
            <span className="admin-helper mt-1 block">
              Use a short, student-facing title for the embedded quiz card.
            </span>
          </label>
        )}

        {/* Continue Button */}
        {canContinue && (
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="admin-button-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


