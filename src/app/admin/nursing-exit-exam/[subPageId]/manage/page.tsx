"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingExitExamSubPage,
  getNursingExitExamNestedSubPages,
  uploadNursingExitExamNestedSubPage,
  deleteNursingExitExamNestedSubPage,
} from "@/lib/firestore-operations";
import Link from "next/link";
import { AdminInlineLoading } from "@/components/admin/AdminUi";

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

      const result = await getNursingExitExamSubPage(resolvedParams.subPageId);

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load slug from pageData or use subPageId as default
        setSlug(pageData.slug || resolvedParams.subPageId);

        const initializedContent: ServiceContent = {
          pageName: pageData.pageName || resolvedParams.subPageId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.subPageId} | NursingMocks`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/nursing-mocks-logo.png",
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com"
              }/nursing-exit-exam/${resolvedParams.subPageId}`,
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
            title: `${resolvedParams.subPageId} | NursingMocks`,
            description: `Content for ${resolvedParams.subPageId}`,
            keywords: `${resolvedParams.subPageId}, nursing exit exam`,
            ogTitle: `${resolvedParams.subPageId} | NursingMocks`,
            ogDescription: `Content for ${resolvedParams.subPageId}`,
            ogImage: "/nursing-mocks-logo.png",
            canonicalUrl: `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com"
            }/${resolvedParams.subPageId}`,
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
      const result = await getNursingExitExamNestedSubPages(
        resolvedParams.subPageId
      );
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
        status: "Draft",
        heading: "",
        description: "",
        seoLabel: newNestedSubPageName,
        seoSlug: normalizedNestedSubPageId,
        createdAt: new Date().toISOString(),
        bodyContent: "",
        meta: {
          title: `${newNestedSubPageName} | NursingMocks`,
          description: `Content for ${newNestedSubPageName} under ${
            content?.pageName || resolvedParams.subPageId
          }.`,
          keywords: `${newNestedSubPageName}, ${resolvedParams.subPageId}, nursing exit exam`,
          ogTitle: `${newNestedSubPageName} | NursingMocks`,
          ogDescription: `Content for ${newNestedSubPageName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://www.nursingmocks.com"
          }/${normalizedNestedSubPageId}`,
        },
        schema: "",
        hero: {
          title: "",
          description: "",
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
      <div className="admin-page flex min-h-screen items-center justify-center px-4 py-6">
        <div className="admin-loading-state">
          <div className="admin-loading-spinner"></div>
          <AdminInlineLoading label="Loading Content" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="admin-page flex min-h-screen items-center justify-center px-4 py-6">
        <div className="admin-loading-state">
          <p className="text-red-600">Failed to load sub-page content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen">
      {/* Header */}
      <div className="admin-card mb-6 p-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="admin-page-title">
                Manage: {content.pageName || resolvedParams.subPageId}
              </h1>
              <p className="admin-body mt-1">
                Edit this sub-page and manage its nested sub-pages
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/nursing-exit-exam"
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
        <div className="admin-card mb-6 p-5">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="admin-card-title mb-2">
                Nursing Exit Exam Main Page
              </h3>
              <p className="admin-helper mb-2">
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
        <div className="admin-card mb-6 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">Edit Sub-Page</h2>
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
          <div className="admin-info-tile p-4">
            <p className="admin-helper mb-2">
              <strong>Page Name:</strong>{" "}
              {content.pageName || resolvedParams.subPageId}
            </p>
            <p className="admin-helper mb-2">
              <strong>Title:</strong> {content.hero.title}
            </p>
            <p className="admin-helper">
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
        <div className="admin-card p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="admin-section-title">
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
            <div className="py-12 text-center">
              <AdminInlineLoading label="Loading Nested Sub Pages" />
            </div>
          ) : nestedSubPages.length === 0 ? (
            <div className="text-center py-12">
              <p className="admin-helper">
                No nested sub-pages found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nestedSubPages.map((nestedSubPage) => (
                <div
                  key={nestedSubPage.id}
                  className="admin-info-tile bg-white p-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="admin-card-title mb-2">
                        {nestedSubPage.pageName ||
                          nestedSubPage.hero?.title ||
                          nestedSubPage.title ||
                          nestedSubPage.id}
                      </h3>
                      <p className="admin-helper mb-2">
                        ID: {nestedSubPage.id}
                      </p>
                      {nestedSubPage.lastUpdated && (
                        <p className="admin-helper">
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
                      href={`/admin/nursing-exit-exam/${
                        resolvedParams.subPageId
                      }/nested/${nestedSubPage.slug || nestedSubPage.id}`}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center space-x-1"
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
                      <span>Edit</span>
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
                    <p className="admin-helper mt-1">
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
        <div className="admin-modal-backdrop">
          <div className="admin-modal max-w-md">
            <h2 className="admin-modal-title mb-6">
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
                <label className="admin-field-label mb-2 block">
                  Nested Sub-page Name *
                </label>
                <input
                  type="text"
                  value={newNestedSubPageName}
                  onChange={(e) => setNewNestedSubPageName(e.target.value)}
                  className="admin-field"
                  placeholder="e.g., Math Practice, Reading Guide"
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
                    value={newNestedSubPageId}
                    onChange={(e) =>
                      setNewNestedSubPageId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="admin-field min-w-0 flex-1"
                    placeholder="e.g., reading-guide"
                    required
                  />
                </div>
                <p className="admin-helper mt-1 break-words">
                  This will create a page at /
                  {newNestedSubPageId || "nested-sub-page-id"}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={savingNested}
                  className="admin-button-primary flex-1 disabled:opacity-50"
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


