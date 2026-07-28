"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNestedSubPage,
  getNursingExitExamQuizzes,
  uploadNursingExitExamQuiz,
  deleteNursingExitExamQuiz,
  getNursingExitExamSubPage,
  getPillarPageContent,
} from "@/lib/firestore-operations";
import Link from "next/link";
import { AdminInlineLoading } from "@/components/admin/AdminUi";

interface Quiz {
  id: string;
  quizId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  hero?: {
    title: string;
  };
}

export default function ManageQuizzes({
  params,
}: {
  params: Promise<{ subPageId: string; nestedSubPageId: string }>;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
  } | null>(null);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizSetNumber, setNewQuizSetNumber] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [nestedSlug, setNestedSlug] = useState("");
  const [nestedSubPageContent, setNestedSubPageContent] = useState<any>(null);
  const [pillarPageContent, setPillarPageContent] = useState<any>(null);
  const [parentSubPageContent, setParentSubPageContent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadQuizzes = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      const result = await getNursingExitExamQuizzes(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (result.success && result.data) {
        setQuizzes(result.data);
      }

      // Load pillar page content
      const pillarResult = await getPillarPageContent("nursing-exit-exam");
      if (pillarResult.success && pillarResult.data) {
        setPillarPageContent(pillarResult.data);
      }

      // Load parent and nested sub-page names for display
      const parentResult = await getNursingExitExamSubPage(
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
      console.error("Error loading quizzes:", err);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!resolvedParams) return;

    if (!confirm(`Are you sure you want to delete the quiz "${quizId}"?`)) {
      return;
    }

    try {
      const result = await deleteNursingExitExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        quizId
      );
      if (result.success) {
        setSuccess("Quiz deleted successfully!");
        loadQuizzes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete quiz");
      }
    } catch (err) {
      setError("Failed to delete quiz");
      console.error("Error deleting:", err);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newQuizId.trim() || !newQuizName.trim()) {
      setValidationError("Quiz ID and Name are required.");
      return;
    }

    if (!resolvedParams) return;

    const normalizedQuizId = newQuizId.toLowerCase().replace(/\s+/g, "-");

    const existingQuiz = quizzes.find(
      (quiz) => quiz.id === normalizedQuizId
    );
    if (existingQuiz) {
      setValidationError(
        `A quiz with ID "${normalizedQuizId}" already exists.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // The backend will use the slug as provided (no prefix)
      const finalSlug = normalizedQuizId;

      const defaultQuizContent = {
        pageName: newQuizName,
        slug: normalizedQuizId, // User-entered slug (no prefix)
        setNumber: newQuizSetNumber ? Number(newQuizSetNumber) : undefined,
        meta: {
          title: `${newQuizName} | NursingMocks`,
          description: `Content for ${newQuizName} under ${
            nestedSubPageName || resolvedParams.nestedSubPageId
          }.`,
          keywords: `${newQuizName}, ${nestedSubPageName}, ${parentSubPageName}, nursing exit exam`,
          ogTitle: `${newQuizName} | NursingMocks`,
          ogDescription: `Content for ${newQuizName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `https://www.nursingmocks.com/${finalSlug}`,
        },
        hero: {
          title: newQuizName,
        },
        schema: "",
      };

      const result = await uploadNursingExitExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        normalizedQuizId,
        defaultQuizContent
      );

      if (result.success) {
        setSuccess(`Quiz "${newQuizName}" created successfully!`);
        setShowCreateQuizModal(false);
        setNewQuizId("");
        setNewQuizName("");
        setNewQuizSetNumber("");
        setValidationError("");
        loadQuizzes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create quiz.");
      }
    } catch (err) {
      setValidationError("Failed to create quiz.");
      console.error("Error creating quiz:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="admin-page flex min-h-screen items-center justify-center px-4 py-6">
        <div className="admin-loading-state">
          <div className="admin-loading-spinner"></div>
          <AdminInlineLoading label="Loading Content" />
        </div>
      </div>
    );
  }

  // Use the nested slug directly for URLs (it already contains the parent prefix)
  const nestedPageUrl = nestedSlug || resolvedParams.nestedSubPageId;

  return (
    <div className="admin-page min-h-screen">
      {/* Header */}
      <div className="admin-card mb-6 p-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="admin-page-title">
                Manage Quizzes: {nestedSubPageName || resolvedParams.nestedSubPageId}
              </h1>
              <p className="admin-body mt-1">
                Edit this nested sub-page and manage its quizzes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/manage`}
                className="admin-button-secondary flex items-center space-x-2"
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
              {resolvedParams && (
                <Link
                  href={`/${nestedPageUrl}`}
                  target="_blank"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>View Page</span>
                </Link>
              )}
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
        <div className="admin-card mb-6 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">
              Pillar Page
            </h2>
            <Link
              href="/admin/nursing-exit-exam/edit"
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
          <div className="admin-info-tile p-4">
            <p className="admin-helper mb-2">
              <strong>Page Name:</strong>{" "}
              {pillarPageContent?.hero?.title || "Nursing Exit Exam"}
            </p>
            <p className="admin-helper">
              <strong>URL:</strong>{" "}
              <a
                href="/nursing-exit-exam"
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /nursing-exit-exam
              </a>
            </p>
          </div>
        </div>

        {/* Sub-Page Section */}
        <div className="admin-card mb-6 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">
              Sub-Page
            </h2>
            <Link
              href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}`}
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
          <div className="admin-info-tile p-4">
            <p className="admin-helper mb-2">
              <strong>Page Name:</strong>{" "}
              {parentSubPageContent?.pageName ||
                parentSubPageName ||
                resolvedParams.subPageId}
            </p>
            <p className="admin-helper mb-2">
              <strong>Title:</strong>{" "}
              {parentSubPageContent?.hero?.title ||
                parentSubPageName ||
                resolvedParams.subPageId}
            </p>
            <p className="admin-helper">
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

        {/* Edit Nested Sub-Page Section */}
        <div className="admin-card mb-6 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">
              Edit Nested Sub-Page
            </h2>
            <Link
              href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}`}
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
              <span>Edit Full Content</span>
            </Link>
          </div>
          <div className="admin-info-tile p-4">
            <p className="admin-helper mb-2">
              <strong>Page Name:</strong>{" "}
              {nestedSubPageContent?.pageName ||
                nestedSubPageName ||
                resolvedParams.nestedSubPageId}
            </p>
            <p className="admin-helper mb-2">
              <strong>Title:</strong>{" "}
              {nestedSubPageContent?.hero?.title ||
                nestedSubPageName ||
                resolvedParams.nestedSubPageId}
            </p>
            <p className="admin-helper">
              <strong>URL:</strong>{" "}
              <a
                href={`/${nestedPageUrl}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{nestedPageUrl}
              </a>
            </p>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="admin-card p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">Quizzes</h2>
            <button
              onClick={() => setShowCreateQuizModal(true)}
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
              <span>Create Quiz</span>
            </button>
          </div>

          {/* Search Bar */}
          {quizzes.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#8a90a8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes by name..."
                  className="admin-field w-full pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-[#8a90a8] hover:text-[#4b5563]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filtered Quizzes */}
          {(() => {
            const filteredQuizzes = quizzes.filter((quiz) => {
              if (!searchQuery.trim()) return true;
              const quizName =
                quiz.pageName || quiz.hero?.title || quiz.id || "";
              return quizName
                .toLowerCase()
                .includes(searchQuery.toLowerCase().trim());
            });

            if (quizzes.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f2ff]">
                    <svg
                      className="h-8 w-8 text-[#8a90a8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="admin-card-title mb-2">
                    No quizzes found
                  </h3>
                  <p className="admin-helper">Create a quiz to get started.</p>
                </div>
              );
            }

            if (filteredQuizzes.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f2ff]">
                    <svg
                      className="h-8 w-8 text-[#8a90a8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="admin-card-title mb-2">
                    No quizzes found
                  </h3>
                  <p className="admin-helper">
                    No quizzes match your search "{searchQuery}".
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => {
                const quizSlug = quiz.slug || quiz.id;
                // Use the quiz slug directly (it already contains the nested page prefix from backend)
                const quizUrl = `/${quizSlug}`;
                return (
                  <div
                    key={quiz.id}
                    className="admin-info-tile bg-white p-5 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="admin-card-title mb-2">
                          {quiz.pageName || quiz.hero?.title || quiz.id}
                        </h3>
                        <p className="admin-helper mb-2">
                          ID: {quiz.id}
                        </p>
                        {quiz.lastUpdated && (
                          <p className="admin-helper">
                            Updated:{" "}
                            {new Date(quiz.lastUpdated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Link
                        href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${quizSlug}/manage`}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-1"
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
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Manage</span>
                      </Link>
                      <Link
                        href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${quizSlug}`}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={quizUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Page →
                      </Link>
                      <p className="admin-helper mt-1">
                        URL: {quizUrl}
                      </p>
                    </div>
                  </div>
                );
              })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateQuizModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal max-w-md">
            <h2 className="admin-modal-title mb-6">
              Create New Quiz
            </h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <div>
                <label className="admin-field-label mb-2 block">
                  Quiz Name *
                </label>
                <input
                  type="text"
                  value={newQuizName}
                  onChange={(e) => setNewQuizName(e.target.value)}
                  className="admin-field"
                  placeholder="e.g., Math Practice Quiz 1"
                  required
                />
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Slug URL *
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className="admin-helper whitespace-nowrap">
                    https://www.nursingmocks.com/
                  </span>
                  <input
                    type="text"
                    value={newQuizId}
                    onChange={(e) =>
                      setNewQuizId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="admin-field min-w-0 flex-1"
                    placeholder="e.g., quiz-1"
                    required
                  />
                </div>
                <p className="admin-helper mt-1 break-words">
                  This will create a quiz at /{newQuizId || "quiz-id"}
                </p>
              </div>
              <div>
                <label className="admin-field-label mb-2 block">
                  Set Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newQuizSetNumber}
                  onChange={(e) => setNewQuizSetNumber(e.target.value)}
                  className="admin-field"
                  placeholder="e.g., 1"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-button-primary flex-1 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Quiz"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateQuizModal(false);
                    setNewQuizId("");
                    setNewQuizName("");
                    setNewQuizSetNumber("");
                    setValidationError("");
                  }}
                  className="admin-button-cancel flex-1"
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



