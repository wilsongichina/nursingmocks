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
            const filteredQuestions = result.data.filter((q: any) => {
              const typeId = q.questionTypeId || q.question_type_id;
              return (
                q.isCopyRight === true &&
                (typeId === 1 || typeId === 2 || typeId === 3 || typeId === 7)
              );
            });

            if (filteredQuestions.length > 0) {
              setAvailableQuestions(filteredQuestions);
              // If we have initial selected question IDs, use them, otherwise select all
              if (initialData?.selectedQuestionIds && Array.isArray(initialData.selectedQuestionIds)) {
                const selectedIds = initialData.selectedQuestionIds;
                setSelectedQuestionIds(new Set(selectedIds));
                const selected = filteredQuestions.filter((q: any) => 
                  selectedIds.includes(q.id || q.questionId)
                );
                setQuestions(selected);
                setStep("quiz");
              } else {
                // Select all by default
                const allIds = new Set(filteredQuestions.map((q: any) => q.id || q.questionId));
                setSelectedQuestionIds(allIds);
                setQuestions(filteredQuestions);
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
        setQuizTitle(selectedQuiz.pageName || selectedQuiz.title || quizId);
      }
    }
  }, [quizId, quizzes]);

  const canContinue =
    pillarId &&
    subPageId &&
    nestedSubPageId &&
    (!isTestBank || topicId) &&
    quizId;

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
        // Filter questions: isCopyRight === true and questionTypeId in [1, 2, 3, 7]
        const filteredQuestions = result.data.filter((q: any) => {
          const typeId = q.questionTypeId || q.question_type_id;
          return (
            q.isCopyRight === true &&
            (typeId === 1 || typeId === 2 || typeId === 3 || typeId === 7)
          );
        });

        if (filteredQuestions.length === 0) {
          setError(
            "No copyright-protected questions found for this quiz. Please ensure questions have isCopyRight set to true and are of type 1, 2, 3, or 7."
          );
          setLoading(false);
          return;
        }

        setAvailableQuestions(filteredQuestions);
        // Select all questions by default
        const allIds = new Set(filteredQuestions.map((q: any) => q.id || q.questionId));
        setSelectedQuestionIds(allIds);
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
      const allIds = new Set(availableQuestions.map((q: any) => q.id || q.questionId));
      setSelectedQuestionIds(allIds);
    }
  };

  const handleConfirmQuestions = () => {
    if (selectedQuestionIds.size === 0) {
      setError("Please select at least one question");
      return;
    }

    const selected = availableQuestions.filter((q: any) =>
      selectedQuestionIds.has(q.id || q.questionId)
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
        quizTitle,
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
        quizTitle={quizTitle}
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
        className="quiz-card-modal border border-gray-300 rounded-lg p-4 bg-white"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Questions
          </h3>
          <p className="text-sm text-gray-600">
            Choose which questions to include in the quiz. {availableQuestions.length} copyright-protected questions available.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedQuestionIds.size} of {availableQuestions.length} selected
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {selectedQuestionIds.size === availableQuestions.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4">
          {availableQuestions.map((question, index) => {
            const questionId = question.id || question.questionId;
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
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleQuestionToggle(questionId)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Question {index + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {getQuestionTypeName(questionTypeId)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">
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
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back
          </button>
          <button
            onClick={handleConfirmQuestions}
            disabled={selectedQuestionIds.size === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
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
      className="quiz-card-modal border border-gray-300 rounded-lg p-4 bg-white"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Quiz
        </h3>
        <p className="text-sm text-gray-600">
          Choose a quiz to embed. Only copyright-protected questions (types 1, 2,
          3, 7) will be displayed.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Pillar Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-4 py-3 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-4 py-3 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6a5cff]"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nested Sub-Page Selection */}
        {pillarId && subPageId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-4 py-3 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6a5cff]"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topic Selection (only for test bank) */}
        {isTestBank && pillarId && subPageId && nestedSubPageId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-4 py-3 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6a5cff]"></div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full rounded-lg border border-[#e2e4f0] bg-[#f9f9ff] px-4 py-3 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6a5cff]"></div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Continue Button */}
        {canContinue && (
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

