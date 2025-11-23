"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingExitExamQuiz,
  uploadNursingExitExamQuiz,
  getNestedSubPage,
  getNursingExitExamSubPage,
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
    title: string;
  };
}

export default function EditQuiz({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [nestedSlug, setNestedSlug] = useState("");
  const [quizSlug, setQuizSlug] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  } | null>(null);

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

      // Load parent sub-page to get its slug
      const parentResult = await getNursingExitExamSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSlug(parentData.slug || resolvedParams.subPageId);
      } else {
        setParentSlug(resolvedParams.subPageId);
      }

      // Load nested sub-page to get its slug
      const nestedResult = await getNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      const currentNestedSlug =
        nestedResult.success && nestedResult.data
          ? (nestedResult.data as any).slug || resolvedParams.nestedSubPageId
          : resolvedParams.nestedSubPageId;
      setNestedSlug(currentNestedSlug);

      const result = await getNursingExitExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load quiz slug
        setQuizSlug(pageData.slug || resolvedParams.quizId);

        // Get current parent slug for URL construction
        const currentParentSlug = parentSlug || resolvedParams.subPageId;
        const currentNestedSlugFinal = currentNestedSlug || resolvedParams.nestedSubPageId;

        // For exit exam, URL format is: /{nestedSubPageId}-{parentSubPageId}-exit-exam/{quizSlug}
        const canonicalUrl = `https://teasgurus.com/${currentNestedSlugFinal}-${currentParentSlug}-exit-exam/${
          pageData.slug || resolvedParams.quizId
        }`;

        // Ensure all required fields exist with defaults
        const initializedContent: ServiceContent = {
          pageName: pageData.pageName || resolvedParams.quizId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.quizId} | TeasGurus`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/teas-gurus-logo.png",
            canonicalUrl: pageData.meta?.canonicalUrl || canonicalUrl,
          },
          schema: pageData.schema || "",
          hero: {
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.quizId,
          },
        };

        setContent(initializedContent);
      } else {
        // Initialize with default content structure
        const currentParentSlug = parentSlug || resolvedParams.subPageId;
        const currentNestedSlugFinal = currentNestedSlug || resolvedParams.nestedSubPageId;

        const canonicalUrl = `https://teasgurus.com/${currentNestedSlugFinal}-${currentParentSlug}-exit-exam/${
          resolvedParams.quizId
        }`;

        const defaultContent: ServiceContent = {
          pageName: resolvedParams.quizId,
          meta: {
            title: `${resolvedParams.quizId} | TeasGurus`,
            description: `Content for ${resolvedParams.quizId}`,
            keywords: `${resolvedParams.quizId}, ${resolvedParams.nestedSubPageId}, ${resolvedParams.subPageId}, nursing exit exam`,
            ogTitle: `${resolvedParams.quizId} | TeasGurus`,
            ogDescription: `Content for ${resolvedParams.quizId}`,
            ogImage: "/teas-gurus-logo.png",
            canonicalUrl: canonicalUrl,
          },
          schema: "",
          hero: {
            title: resolvedParams.quizId,
          },
        };
        setContent(defaultContent);
      }
    } catch (err) {
      setError("Failed to load content");
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams, parentSlug]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async () => {
    if (!content || !resolvedParams) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Only save the necessary fields to Firebase
      const contentToSave: ServiceContent & { slug: string } = {
        pageName: content.pageName,
        meta: {
          title: content.meta.title,
          description: content.meta.description,
          keywords: content.meta.keywords,
          ogTitle: content.meta.ogTitle,
          ogDescription: content.meta.ogDescription,
          ogImage: content.meta.ogImage,
          canonicalUrl: content.meta.canonicalUrl,
        },
        schema: content.schema,
        hero: {
          title: content.hero.title,
        },
        slug: quizSlug.trim() || resolvedParams.quizId,
      };

      const result = await uploadNursingExitExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        contentToSave
      );

      if (result.success) {
        setSuccess("Quiz updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save content");
      }
    } catch (err) {
      setError("Failed to save content");
      console.error("Error saving content:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path: string, value: string) => {
    if (!content) return;

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev));
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          return prev;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      return newContent;
    });
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
    return null;
  }

  // For exit exam, URL format is: /{nestedSubPageId}-{parentSubPageId}-exit-exam/{quizSlug}
  const parentUrlSlug = parentSlug || resolvedParams.subPageId;
  const nestedUrlSlug = nestedSlug || resolvedParams.nestedSubPageId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Quiz: {content.pageName || resolvedParams.quizId}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Update the content for this quiz
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/manage`}
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
              {resolvedParams && quizSlug && (
                <Link
                  href={`/admin/nursing-exit-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${quizSlug}/manage`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 font-medium"
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
                  <span>Manage Questions</span>
                </Link>
              )}
              {resolvedParams && (
                <Link
                  href={`/${nestedUrlSlug}-${parentUrlSlug}-exit-exam/${quizSlug || resolvedParams.quizId}`}
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
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Quiz Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quiz Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Name
                </label>
                <input
                  type="text"
                  value={content.pageName || ""}
                  onChange={(e) =>
                    setContent({ ...content, pageName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={content.hero.title || ""}
                  onChange={(e) => updateContent("hero.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz ID (Slug URL)
                </label>
                <input
                  type="text"
                  value={quizSlug}
                  onChange={(e) => setQuizSlug(e.target.value)}
                  placeholder={resolvedParams?.quizId || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL slug (editable). The URL will be: /{nestedUrlSlug}-{parentUrlSlug}-exit-exam/{quizSlug || resolvedParams?.quizId || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Meta Data */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meta Data</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={content.meta.title}
                  onChange={(e) => updateContent("meta.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={content.meta.description}
                  onChange={(e) =>
                    updateContent("meta.description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={content.meta.keywords}
                  onChange={(e) => updateContent("meta.keywords", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OG Title
                </label>
                <input
                  type="text"
                  value={content.meta.ogTitle}
                  onChange={(e) => updateContent("meta.ogTitle", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OG Description
                </label>
                <textarea
                  value={content.meta.ogDescription}
                  onChange={(e) =>
                    updateContent("meta.ogDescription", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OG Image URL
                </label>
                <input
                  type="text"
                  value={content.meta.ogImage}
                  onChange={(e) => updateContent("meta.ogImage", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="/teas-gurus-logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={content.meta.canonicalUrl}
                  onChange={(e) =>
                    updateContent("meta.canonicalUrl", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Schema Markup */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Schema Markup
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JSON-LD Schema
              </label>
              <textarea
                value={content.schema}
                onChange={(e) => updateContent("schema", e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-mono text-sm"
                placeholder='{"@context": "https://schema.org", ...}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter valid JSON-LD schema markup for SEO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

