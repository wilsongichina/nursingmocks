"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingTestBankNestedSubPage,
  getNursingTestBankTopics,
  uploadNursingTestBankTopic,
  deleteNursingTestBankTopic,
  getNursingTestBankSubPage,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface Topic {
  id: string;
  topicId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  hero?: {
    title: string;
  };
}

export default function ManageTopics({
  params,
}: {
  params: Promise<{ subPageId: string; nestedSubPageId: string }>;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
  } | null>(null);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [newTopicId, setNewTopicId] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  // const [parentSlug, setParentSlug] = useState("");
  const [nestedSlug, setNestedSlug] = useState("");
  const [nestedSubPageContent, setNestedSubPageContent] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadTopics = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      const result = await getNursingTestBankTopics(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (result.success && result.data) {
        setTopics(result.data);
      }

      // Load parent and nested sub-page names for display
      const parentResult = await getNursingTestBankSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSubPageName(parentData.pageName || resolvedParams.subPageId);
        // setParentSlug(parentData.slug || resolvedParams.subPageId);
      }

      const nestedResult = await getNursingTestBankNestedSubPage(
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
      console.error("Error loading topics:", err);
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleDeleteTopic = async (topicId: string) => {
    if (!resolvedParams) return;

    if (!confirm(`Are you sure you want to delete the topic "${topicId}"?`)) {
      return;
    }

    try {
      const result = await deleteNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        topicId
      );
      if (result.success) {
        setSuccess("Topic deleted successfully!");
        loadTopics();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete topic");
      }
    } catch (err) {
      setError("Failed to delete topic");
      console.error("Error deleting:", err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newTopicId.trim() || !newTopicName.trim()) {
      setValidationError("Topic ID and Name are required.");
      return;
    }

    if (!resolvedParams) return;

    const normalizedTopicId = newTopicId.toLowerCase().replace(/\s+/g, "-");

    const existingTopic = topics.find(
      (topic) => topic.id === normalizedTopicId
    );
    if (existingTopic) {
      setValidationError(
        `A topic with ID "${normalizedTopicId}" already exists.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // The backend will use the slug as provided (no prefix)
      const finalSlug = normalizedTopicId;

      const defaultTopicContent = {
        pageName: newTopicName,
        slug: normalizedTopicId, // User-entered slug (no prefix)
        meta: {
          title: `${newTopicName} | TeasGurus`,
          description: `Content for ${newTopicName} under ${
            nestedSubPageName || resolvedParams.nestedSubPageId
          }.`,
          keywords: `${newTopicName}, ${nestedSubPageName}, ${parentSubPageName}, nursing test bank`,
          ogTitle: `${newTopicName} | TeasGurus`,
          ogDescription: `Content for ${newTopicName}`,
          ogImage: "/teas-gurus-logo.png",
          canonicalUrl: `https://teasgurus.com/${finalSlug}`,
        },
        hero: {
          badge: nestedSubPageName || resolvedParams.nestedSubPageId,
          title: newTopicName,
          subtitle: `Detailed information about ${newTopicName}.`,
          description: "",
        },
        schema: "",
        trustIndicators: [],
        whatToExpect: {
          badge: "",
          title: "",
          subtitle: "",
          cards: [],
          footer: "",
        },
        mostCommonQuestions: {
          badge: "",
          title: "",
          subtitle: "",
          cards: [],
        },
        studyGuide: {
          badge: "",
          title: "",
          subtitle: "",
          sections: [],
        },
        privacyPricing: [],
        faq: {
          title: "",
          subtitle: "",
          questions: [],
        },
      };

      const result = await uploadNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        normalizedTopicId,
        defaultTopicContent
      );

      if (result.success) {
        setSuccess(`Topic "${newTopicName}" created successfully!`);
        setShowCreateTopicModal(false);
        setNewTopicId("");
        setNewTopicName("");
        setValidationError("");
        loadTopics();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create topic.");
      }
    } catch (err) {
      setValidationError("Failed to create topic.");
      console.error("Error creating topic:", err);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage: {nestedSubPageName || resolvedParams.nestedSubPageId}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Edit this nested sub-page and manage its topics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/manage`}
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
                  href={`/${nestedSlug || resolvedParams.nestedSubPageId}`}
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

        {/* Edit Nested Sub-Page Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Nested Sub-Page
            </h2>
            <Link
              href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}`}
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
                href={`/${nestedSlug || resolvedParams.nestedSubPageId}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{nestedSlug || resolvedParams.nestedSubPageId}
              </a>
            </p>
          </div>
        </div>

        {/* Topics Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
            <button
              onClick={() => setShowCreateTopicModal(true)}
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
              <span>Create Topic</span>
            </button>
          </div>

          {topics.length === 0 ? (
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No topics found
              </h3>
              <p className="text-gray-600">Create a topic to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                const topicSlug = topic.slug || topic.id;
                // Use the topic slug directly (it already contains the nested page prefix from backend)
                const topicUrl = `/${topicSlug}`;
                return (
                  <div
                    key={topic.id}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {topic.pageName || topic.hero?.title || topic.id}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          ID: {topic.id}
                        </p>
                        {topic.lastUpdated && (
                          <p className="text-sm text-gray-500">
                            Updated:{" "}
                            {new Date(topic.lastUpdated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Link
                        href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${topic.id}/manage`}
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Manage Quizzes</span>
                      </Link>
                      <Link
                        href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${topic.id}`}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={topicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Page →
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        URL: {topicUrl}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopicModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Topic
            </h2>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Anatomy & Physiology"
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
                    value={newTopicId}
                    onChange={(e) =>
                      setNewTopicId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., topic-name"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  This will create a page at /{newTopicId || "topic-id"}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Topic"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTopicModal(false);
                    setNewTopicId("");
                    setNewTopicName("");
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
