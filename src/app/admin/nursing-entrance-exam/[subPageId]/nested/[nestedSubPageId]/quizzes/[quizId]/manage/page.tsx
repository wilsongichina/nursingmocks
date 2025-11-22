"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingEntranceExamQuizQuestions,
  uploadNursingEntranceExamQuizQuestion,
  deleteNursingEntranceExamQuizQuestion,
  getNursingEntranceExamQuiz,
  getNestedSubPage,
  getNursingEntranceExamSubPage,
  getPillarPageContent,
  getAllQuestionTypes,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface Question {
  id: string;
  questionId?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  lastUpdated?: string;
  questionTypeId?: number;
  question_type_id?: number;
}

interface QuestionType {
  id: string;
  questionTypeId: string;
  questionTypeName: string;
}

export default function ManageQuizQuestions({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  }>;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  } | null>(null);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [newQuestionId, setNewQuestionId] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [nestedSlug, setNestedSlug] = useState("");
  const [quizSlug, setQuizSlug] = useState("");
  const [pillarPageContent, setPillarPageContent] = useState<any>(null);
  const [parentSubPageContent, setParentSubPageContent] = useState<any>(null);
  const [nestedSubPageContent, setNestedSubPageContent] = useState<any>(null);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Generate slug from question text (first 180 characters)
  const generateSlug = (questionText: string): string => {
    if (!questionText) return "";
    const cleanText = stripHtmlTags(questionText);
    const truncated = cleanText.substring(0, 180);
    const slug = truncated
      .toLowerCase()
      .replace(/nbsp/g, "")
      .replace(/&nbsp;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug;
  };

  // Get question type name from ID
  const getQuestionTypeName = (questionTypeId?: number): string => {
    if (!questionTypeId) return "Unknown";
    const type = questionTypes.find(
      (t) => t.questionTypeId === questionTypeId.toString()
    );
    return type?.questionTypeName || `Type ${questionTypeId}`;
  };

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Load question types
  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        const result = await getAllQuestionTypes();
        if (result.success && result.data) {
          setQuestionTypes(result.data);
        }
      } catch (err) {
        console.error("Error loading question types:", err);
      }
    };
    loadQuestionTypes();
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      const result = await getNursingEntranceExamQuizQuestions(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId
      );
      if (result.success && result.data) {
        setQuestions(result.data);
      }

      // Load pillar page content
      const pillarResult = await getPillarPageContent("nursing-entrance-exam");
      if (pillarResult.success && pillarResult.data) {
        setPillarPageContent(pillarResult.data);
      }

      // Load quiz name and slugs for display
      const quizResult = await getNursingEntranceExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId
      );
      if (quizResult.success && quizResult.data) {
        const quizData = quizResult.data as any;
        setQuizName(quizData.pageName || resolvedParams.quizId);
        setQuizSlug(quizData.slug || resolvedParams.quizId);
      }

      // Load parent and nested sub-page content
      const parentResult = await getNursingEntranceExamSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSubPageContent(parentData);
        setParentSubPageName(parentData.pageName || resolvedParams.subPageId);
        setParentSlug(parentData.slug || resolvedParams.subPageId);
      }

      const nestedResult = await getNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (nestedResult.success && nestedResult.data) {
        const nestedData = nestedResult.data as any;
        setNestedSubPageContent(nestedData);
        setNestedSubPageName(
          nestedData.pageName || resolvedParams.nestedSubPageId
        );
        setNestedSlug(nestedData.slug || resolvedParams.nestedSubPageId);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!resolvedParams) return;

    if (
      !confirm(`Are you sure you want to delete the question "${questionId}"?`)
    ) {
      return;
    }

    try {
      const result = await deleteNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        questionId
      );
      if (result.success) {
        setSuccess("Question deleted successfully!");
        setCurrentPage(1); // Reset to first page after deletion
        loadQuestions();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete question");
      }
    } catch (err) {
      setError("Failed to delete question");
      console.error("Error deleting:", err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newQuestionId.trim() || !newQuestion.trim()) {
      setValidationError("Question ID and Question text are required.");
      return;
    }

    if (!newOptions.some((opt) => opt.trim())) {
      setValidationError("At least one option is required.");
      return;
    }

    if (!newCorrectAnswer.trim()) {
      setValidationError("Correct answer is required.");
      return;
    }

    if (!resolvedParams) return;

    const normalizedQuestionId = newQuestionId
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingQuestion = questions.find(
      (q) => q.id === normalizedQuestionId
    );
    if (existingQuestion) {
      setValidationError(
        `A question with ID "${normalizedQuestionId}" already exists.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const questionContent = {
        question: newQuestion,
        options: newOptions.filter((opt) => opt.trim()),
        correctAnswer: newCorrectAnswer,
        explanation: newExplanation || "",
        slug: generateSlug(newQuestion),
      };

      const result = await uploadNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        normalizedQuestionId,
        questionContent
      );

      if (result.success) {
        setSuccess(`Question "${normalizedQuestionId}" created successfully!`);
        setShowCreateQuestionModal(false);
        setNewQuestionId("");
        setNewQuestion("");
        setNewOptions(["", "", "", ""]);
        setNewCorrectAnswer("");
        setNewExplanation("");
        setValidationError("");
        // Calculate the last page and navigate to it to show the new question
        const totalQuestions = questions.length + 1;
        const lastPage = Math.ceil(totalQuestions / questionsPerPage);
        setCurrentPage(lastPage);
        loadQuestions();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create question.");
      }
    } catch (err) {
      setValidationError("Failed to create question.");
      console.error("Error creating question:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Remove -exam suffix from parent slug if present for URL construction
  const parentUrlSlug = (parentSlug || resolvedParams.subPageId).endsWith(
    "-exam"
  )
    ? (parentSlug || resolvedParams.subPageId).slice(0, -5)
    : parentSlug || resolvedParams.subPageId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Questions: {quizName || resolvedParams.quizId}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Add, edit, and delete questions for this quiz
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/manage`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Pillar Page Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Pillar Page
            </h2>
            <Link
              href="/admin/nursing-entrance-exam/edit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Pillar Page</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Page Name:</strong>{" "}
              {pillarPageContent?.hero?.title || "Nursing Entrance Exam"}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href="/nursing-entrance-exam"
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /nursing-entrance-exam
              </a>
            </p>
          </div>
        </div>

        {/* Sub-Page Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sub-Page
            </h2>
            <Link
              href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Sub-Page</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Page Name:</strong>{" "}
              {parentSubPageContent?.pageName ||
                parentSubPageName ||
                resolvedParams.subPageId}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong>{" "}
              {parentSubPageContent?.hero?.title ||
                parentSubPageName ||
                resolvedParams.subPageId}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href={`/${parentSlug || resolvedParams.subPageId}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{parentSlug || resolvedParams.subPageId}
              </a>
            </p>
          </div>
        </div>

        {/* Nested Sub-Page Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nested Sub-Page
            </h2>
            <Link
              href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Nested Sub-Page</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Page Name:</strong>{" "}
              {nestedSubPageContent?.pageName ||
                nestedSubPageName ||
                resolvedParams.nestedSubPageId}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong>{" "}
              {nestedSubPageContent?.hero?.title ||
                nestedSubPageName ||
                resolvedParams.nestedSubPageId}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href={`/${parentUrlSlug}-${
                  nestedSlug || resolvedParams.nestedSubPageId
                }-questions`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{parentUrlSlug}-{nestedSlug || resolvedParams.nestedSubPageId}
                -questions
              </a>
            </p>
          </div>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Quiz
            </h2>
            <Link
              href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Quiz</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Quiz Name:</strong> {quizName || resolvedParams.quizId}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href={`/${parentUrlSlug}-${
                  nestedSlug || resolvedParams.nestedSubPageId
                }-questions/${quizSlug || resolvedParams.quizId}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{parentUrlSlug}-{nestedSlug || resolvedParams.nestedSubPageId}
                -questions/{quizSlug || resolvedParams.quizId}
              </a>
            </p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/bulk-upload`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Bulk Upload</span>
              </Link>
              <button
                onClick={() => setShowCreateQuestionModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600">Add a question to get started.</p>
            </div>
          ) : (
            <>
              {/* Pagination Info */}
              {questions.length > questionsPerPage && (
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * questionsPerPage + 1,
                      questions.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * questionsPerPage,
                      questions.length
                    )}{" "}
                    of {questions.length} questions
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous"
                    >
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of{" "}
                      {Math.ceil(questions.length / questionsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(questions.length / questionsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(questions.length / questionsPerPage)
                      }
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next"
                    >
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3">
                {questions
                  .slice(
                    (currentPage - 1) * questionsPerPage,
                    currentPage * questionsPerPage
                  )
                  .map((question, index) => {
                    const globalIndex =
                      (currentPage - 1) * questionsPerPage + index;
                    return (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-sm font-semibold text-gray-600 min-w-[50px]">
                            Q{globalIndex + 1}
                          </span>
                          <p className="text-sm text-gray-900 flex-1 line-clamp-2">
                            {stripHtmlTags(question.question || "No question text")}
                          </p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium min-w-[120px] text-center">
                            {getQuestionTypeName(
                              question.questionTypeId || question.question_type_id
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {(question.questionTypeId === 1 || 
                            question.questionTypeId === 2 || 
                            question.questionTypeId === 3 || 
                            question.questionTypeId === 7 ||
                            question.question_type_id === 1 || 
                            question.question_type_id === 2 || 
                            question.question_type_id === 3 || 
                            question.question_type_id === 7) && (
                            <Link
                              href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/questions/${question.id}`}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                              Edit
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Pagination Controls at Bottom */}
              {questions.length > questionsPerPage && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First"
                    >
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
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous"
                    >
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {currentPage} of{" "}
                      {Math.ceil(questions.length / questionsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(questions.length / questionsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(questions.length / questionsPerPage)
                      }
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next"
                    >
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.ceil(questions.length / questionsPerPage)
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(questions.length / questionsPerPage)
                      }
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last"
                    >
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
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Question Modal */}
      {showCreateQuestionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add New Question
            </h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question ID *
                </label>
                <input
                  type="text"
                  value={newQuestionId}
                  onChange={(e) =>
                    setNewQuestionId(
                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., question-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter the question text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Options *
                </label>
                {newOptions.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[index] = e.target.value;
                      setNewOptions(updated);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 mb-2"
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ""])}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  + Add Option
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <input
                  type="text"
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter the correct answer (must match one of the options)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter explanation for the correct answer (optional)"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Question"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateQuestionModal(false);
                    setNewQuestionId("");
                    setNewQuestion("");
                    setNewOptions(["", "", "", ""]);
                    setNewCorrectAnswer("");
                    setNewExplanation("");
                    setValidationError("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

