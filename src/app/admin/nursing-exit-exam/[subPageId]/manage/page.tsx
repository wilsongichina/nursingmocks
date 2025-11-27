"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingExitExamSubPage,
  getNursingExitExamNestedSubPages,
  uploadNursingExitExamNestedSubPage,
  deleteNursingExitExamNestedSubPage,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface ServiceContent {
  pageName?: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  schema: string;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  trustIndicators: Array<{
    title: string;
    icon: string;
  }>;
  whatToExpect: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      icon: string;
      content: string[];
    }>;
    footer: string;
  };
  mostCommonQuestions: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      content: string[];
    }>;
  };
  studyGuide: {
    badge: string;
    title: string;
    subtitle: string;
    sections: Array<{
      title: string;
      icon: string;
      content: string;
    }>;
  };
  privacyPricing: Array<{
    title: string;
    icon: string;
    content: string;
  }>;
  faq: {
    title: string;
    subtitle: string;
    questions: Array<{
      question: string;
      paragraphs: string[];
      additionalParagraphs?: string[];
    }>;
  };
}

interface NestedSubPage {
  id: string;
  nestedSubPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  hero?: {
    title: string;
  };
}

export default function ManageSubPage({
  params,
}: {
  params: Promise<{ subPageId: string }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [nestedSubPages, setNestedSubPages] = useState<NestedSubPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [nestedLoading, setNestedLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
  } | null>(null);
  const [showCreateNestedModal, setShowCreateNestedModal] = useState(false);
  const [newNestedSubPageId, setNewNestedSubPageId] = useState("");
  const [newNestedSubPageName, setNewNestedSubPageName] = useState("");
  const [nestedValidationError, setNestedValidationError] = useState("");
  const [savingNested, setSavingNested] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      const result = await getNursingExitExamSubPage(
        resolvedParams.subPageId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;
        
        // Load slug from pageData or use subPageId as default
        setSlug(pageData.slug || resolvedParams.subPageId);

        const initializedContent: ServiceContent = {
          pageName: pageData.pageName || resolvedParams.subPageId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.subPageId} | TeasGurus`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/teas-gurus-logo.png",
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/nursing-exit-exam/${resolvedParams.subPageId}`,
          },
          schema: pageData.schema || "",
          hero: {
            badge: pageData.hero?.badge || "",
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.subPageId,
            subtitle: pageData.hero?.subtitle || "",
            description: pageData.hero?.description || "",
          },
          trustIndicators: pageData.trustIndicators || [],
          whatToExpect: {
            badge: pageData.whatToExpect?.badge || "",
            title: pageData.whatToExpect?.title || "",
            subtitle: pageData.whatToExpect?.subtitle || "",
            cards: pageData.whatToExpect?.cards || [],
            footer: pageData.whatToExpect?.footer || "",
          },
          mostCommonQuestions: {
            badge: pageData.mostCommonQuestions?.badge || "",
            title: pageData.mostCommonQuestions?.title || "",
            subtitle: pageData.mostCommonQuestions?.subtitle || "",
            cards: pageData.mostCommonQuestions?.cards || [],
          },
          studyGuide: {
            badge: pageData.studyGuide?.badge || "",
            title: pageData.studyGuide?.title || "",
            subtitle: pageData.studyGuide?.subtitle || "",
            sections: pageData.studyGuide?.sections || [],
          },
          privacyPricing: pageData.privacyPricing || [],
          faq: {
            title: pageData.faq?.title || "",
            subtitle: pageData.faq?.subtitle || "",
            questions: pageData.faq?.questions || [],
          },
        };

        setContent(initializedContent);
      } else {
        const defaultContent: ServiceContent = {
          pageName: resolvedParams.subPageId,
          meta: {
            title: `${resolvedParams.subPageId} | TeasGurus`,
            description: `Content for ${resolvedParams.subPageId}`,
            keywords: `${resolvedParams.subPageId}, nursing exit exam`,
            ogTitle: `${resolvedParams.subPageId} | TeasGurus`,
            ogDescription: `Content for ${resolvedParams.subPageId}`,
            ogImage: "/teas-gurus-logo.png",
            canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${resolvedParams.subPageId}`,
          },
          schema: "",
          hero: {
            badge: "Nursing Exit Exam",
            title: resolvedParams.subPageId,
            subtitle: "",
            description: "",
          },
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
        setContent(defaultContent);
      }
    } catch (err) {
      setError("Failed to load sub-page content");
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  const loadNestedSubPages = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setNestedLoading(true);
      const result = await getNursingExitExamNestedSubPages(resolvedParams.subPageId);
      if (result.success && result.data) {
        setNestedSubPages(result.data);
      }
    } catch (err) {
      console.error("Error loading nested sub-pages:", err);
    } finally {
      setNestedLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadContent();
    loadNestedSubPages();
  }, [loadContent, loadNestedSubPages]);

  const handleDeleteNestedSubPage = async (nestedSubPageId: string) => {
    if (!resolvedParams) return;

    if (
      !confirm(
        `Are you sure you want to delete the nested sub-page "${nestedSubPageId}"?`
      )
    ) {
      return;
    }

    try {
      const result = await deleteNursingExitExamNestedSubPage(
        resolvedParams.subPageId,
        nestedSubPageId
      );
      if (result.success) {
        setSuccess("Nested sub-page deleted successfully!");
        loadNestedSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete nested sub-page");
      }
    } catch (err) {
      setError("Failed to delete nested sub-page");
      console.error("Error deleting:", err);
    }
  };

  const handleCreateNestedSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setNestedValidationError("");

    if (!newNestedSubPageId.trim() || !newNestedSubPageName.trim()) {
      setNestedValidationError("Nested sub-page ID and Name are required.");
      return;
    }

    if (!resolvedParams) return;

    const normalizedNestedSubPageId = newNestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingNestedSubPage = nestedSubPages.find(
      (page) => page.id === normalizedNestedSubPageId
    );
    if (existingNestedSubPage) {
      setNestedValidationError(
        `A nested sub-page with ID "${normalizedNestedSubPageId}" already exists.`
      );
      return;
    }

    try {
      setSavingNested(true);
      setError("");
      setSuccess("");

      const defaultNestedSubPageContent = {
        pageName: newNestedSubPageName,
        meta: {
          title: `${newNestedSubPageName} | TeasGurus`,
          description: `Content for ${newNestedSubPageName} under ${
            content?.pageName || resolvedParams.subPageId
          }.`,
          keywords: `${newNestedSubPageName}, ${resolvedParams.subPageId}, nursing exit exam`,
          ogTitle: `${newNestedSubPageName} | TeasGurus`,
          ogDescription: `Content for ${newNestedSubPageName}`,
          ogImage: "/teas-gurus-logo.png",
          canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${slug || resolvedParams.subPageId}-${normalizedNestedSubPageId}`,
        },
        hero: {
          badge: content?.pageName || resolvedParams.subPageId,
          title: newNestedSubPageName,
          subtitle: `Detailed information about ${newNestedSubPageName}.`,
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

      const result = await uploadNursingExitExamNestedSubPage(
        resolvedParams.subPageId,
        normalizedNestedSubPageId,
        defaultNestedSubPageContent
      );

      if (result.success) {
        setSuccess(
          `Nested sub-page "${newNestedSubPageName}" created successfully!`
        );
        setShowCreateNestedModal(false);
        setNewNestedSubPageId("");
        setNewNestedSubPageName("");
        setNestedValidationError("");
        loadNestedSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setNestedValidationError(
          result.message || "Failed to create nested sub-page."
        );
      }
    } catch (err) {
      setNestedValidationError("Failed to create nested sub-page.");
      console.error("Error creating nested sub-page:", err);
    } finally {
      setSavingNested(false);
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

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load sub-page content</p>
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
                Manage: {content.pageName || resolvedParams.subPageId}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Edit this sub-page and manage its nested sub-pages
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/nursing-exit-exam"
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
              <Link
                href={`/${slug || resolvedParams.subPageId}`}
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

        {/* Main Page Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nursing Exit Exam Main Page
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Parent page for this sub-page
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/nursing-exit-exam/edit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Edit Main Page
              </Link>
              <Link
                href="/nursing-exit-exam"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View Page →
              </Link>
            </div>
          </div>
        </div>

        {/* Edit Sub-Page Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Sub-Page</h2>
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
              <span>Edit Full Content</span>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              <strong>Page Name:</strong>{" "}
              {content.pageName || resolvedParams.subPageId}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong> {content.hero.title}
            </p>
            <p className="text-gray-600">
              <strong>URL:</strong>{" "}
              <a
                href={`/${slug || resolvedParams.subPageId}`}
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                /{slug || resolvedParams.subPageId}
              </a>
            </p>
          </div>
        </div>

        {/* Nested Sub-Pages Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nested Sub-Pages
            </h2>
            <button
              onClick={() => setShowCreateNestedModal(true)}
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
              <span>Create Nested Sub-page</span>
            </button>
          </div>

          {nestedLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nested sub-pages...</p>
            </div>
          ) : nestedSubPages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No nested sub-pages found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nestedSubPages.map((nestedSubPage) => (
                <div
                  key={nestedSubPage.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {nestedSubPage.pageName ||
                          nestedSubPage.hero?.title ||
                          nestedSubPage.title ||
                          nestedSubPage.id}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        ID: {nestedSubPage.id}
                      </p>
                      {nestedSubPage.lastUpdated && (
                        <p className="text-sm text-gray-500">
                          Updated:{" "}
                          {new Date(
                            nestedSubPage.lastUpdated
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <Link
                      href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${nestedSubPage.slug || nestedSubPage.id}/manage`}
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
                      <span>Manage</span>
                    </Link>
                    <Link
                      href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${nestedSubPage.slug || nestedSubPage.id}`}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        handleDeleteNestedSubPage(nestedSubPage.id)
                      }
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/${nestedSubPage.slug || nestedSubPage.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Page →
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /{nestedSubPage.slug || nestedSubPage.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Nested Sub-page Modal */}
      {showCreateNestedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Nested Sub-page
            </h2>
            <form onSubmit={handleCreateNestedSubPage} className="space-y-4">
              {nestedValidationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    {nestedValidationError}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nested Sub-page Name *
                </label>
                <input
                  type="text"
                  value={newNestedSubPageName}
                  onChange={(e) => setNewNestedSubPageName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Math Practice, Reading Guide"
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
                    value={newNestedSubPageId}
                    onChange={(e) =>
                      setNewNestedSubPageId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., reading-guide"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  This will create a page at /{newNestedSubPageId || "nested-sub-page-id"}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={savingNested}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {savingNested ? "Creating..." : "Create Nested Sub-page"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateNestedModal(false);
                    setNewNestedSubPageId("");
                    setNewNestedSubPageName("");
                    setNestedValidationError("");
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

