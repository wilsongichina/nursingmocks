"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingTestBankTopic,
  getNursingTestBankQuizzes,
  uploadNursingTestBankQuiz,
  deleteNursingTestBankQuiz,
  getNursingTestBankSubPage,
  getNursingTestBankNestedSubPage,
} from "@/lib/firestore-operations";
import Link from "next/link";

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
  params: Promise<{ subPageId: string; nestedSubPageId: string; topicId: string }>;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
  } | null>(null);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizSetNumber, setNewQuizSetNumber] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  const [topicName, setTopicName] = useState("");
  // const [parentSlug, setParentSlug] = useState("");
  // const [nestedSlug, setNestedSlug] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [topicContent, setTopicContent] = useState<any>(null);
  // const [pillarPageContent, setPillarPageContent] = useState<any>(null);
  // const [parentSubPageContent, setParentSubPageContent] = useState<any>(null);
  // const [nestedSubPageContent, setNestedSubPageContent] = useState<any>(null);
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
      const result = await getNursingTestBankQuizzes(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId
      );
      if (result.success && result.data) {
        setQuizzes(result.data);
      }

      // Load pillar page content
      // const pillarResult = await getPillarPageContent("nursing-test-bank");
      // if (pillarResult.success && pillarResult.data) {
      //   setPillarPageContent(pillarResult.data);
      // }

      // Load parent sub-page
      const parentResult = await getNursingTestBankSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        // setParentSubPageContent(parentData);
        setParentSubPageName(parentData.pageName || resolvedParams.subPageId);
        // setParentSlug(parentData.slug || resolvedParams.subPageId);
      }

      // Load nested sub-page
      const nestedResult = await getNursingTestBankNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (nestedResult.success && nestedResult.data) {
        const nestedData = nestedResult.data as any;
        // setNestedSubPageContent(nestedData);
        setNestedSubPageName(
          nestedData.pageName || resolvedParams.nestedSubPageId
        );
        // setNestedSlug(nestedData.slug || resolvedParams.nestedSubPageId);
      }

      // Load topic
      const topicResult = await getNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId
      );
      if (topicResult.success && topicResult.data) {
        const topicData = topicResult.data as any;
        setTopicContent(topicData);
        setTopicName(topicData.pageName || resolvedParams.topicId);
        setTopicSlug(topicData.slug || resolvedParams.topicId);
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
      const result = await deleteNursingTestBankQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
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
          title: `${newQuizName} | TeasGurus`,
          description: `Content for ${newQuizName} under ${
            topicName || resolvedParams.topicId
          }.`,
          keywords: `${newQuizName}, ${topicName}, ${nestedSubPageName}, ${parentSubPageName}, nursing test bank`,
          ogTitle: `${newQuizName} | TeasGurus`,
          ogDescription: `Content for ${newQuizName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `https://teasgurus.com/${finalSlug}`,
        },
        hero: {
          title: newQuizName,
        },
        schema: "",
      };

      const result = await uploadNursingTestBankQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Use the topic slug directly for URLs (it already contains the nested and parent prefix)
  const topicPageUrl = topicSlug || resolvedParams.topicId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Quizzes: {topicName || resolvedParams.topicId}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage quizzes for this topic
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}`}
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
              {resolvedParams && (
                <Link
                  href={`/${topicPageUrl}`}
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
                  <span>View Topic Page</span>
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

        {/* Topic Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Topic</h2>
            <Link
              href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}`}
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
              <span>Edit Topic</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Page Name:</strong>{" "}
              {topicContent?.pageName || topicName || resolvedParams.topicId}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong>{" "}
              {topicContent?.hero?.title || topicName || resolvedParams.topicId}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href={`/${topicPageUrl}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{topicPageUrl}
              </a>
            </p>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
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
                    className="h-5 w-5 text-gray-400"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No quizzes found
                  </h3>
                  <p className="text-gray-600">Create a quiz to get started.</p>
                </div>
              );
            }

            if (filteredQuizzes.length === 0) {
              return (
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No quizzes found
                  </h3>
                  <p className="text-gray-600">
                    No quizzes match your search "{searchQuery}".
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => {
                const quizSlug = quiz.slug || quiz.id;
                // Use the quiz slug directly (it already contains the topic prefix from backend)
                const quizUrl = `/${quizSlug}`;
                return (
                  <div
                    key={quiz.id}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {quiz.pageName || quiz.hero?.title || quiz.id}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          ID: {quiz.id}
                        </p>
                        {quiz.lastUpdated && (
                          <p className="text-sm text-gray-500">
                            Updated:{" "}
                            {new Date(quiz.lastUpdated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Link
                        href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${quizSlug}/manage`}
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
                        href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${quizSlug}`}
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
                      <p className="text-xs text-gray-500 mt-1">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Quiz
            </h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Name *
                </label>
                <input
                  type="text"
                  value={newQuizName}
                  onChange={(e) => setNewQuizName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Practice Quiz 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug URL *
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    https://teasgurus.com/
                  </span>
                  <input
                    type="text"
                    value={newQuizId}
                    onChange={(e) =>
                      setNewQuizId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., quiz-1"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  This will create a quiz at /{newQuizId || "quiz-id"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Set Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newQuizSetNumber}
                  onChange={(e) => setNewQuizSetNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 1"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
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

