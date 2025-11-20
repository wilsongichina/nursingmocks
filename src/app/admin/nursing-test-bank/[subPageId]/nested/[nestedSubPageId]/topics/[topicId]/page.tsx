"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingTestBankTopic,
  uploadNursingTestBankTopic,
  getNursingTestBankNestedSubPage,
  getNursingTestBankSubPage,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
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

export default function EditTopic({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
  }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [nestedSlug, setNestedSlug] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
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
      const parentResult = await getNursingTestBankSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSlug(parentData.slug || resolvedParams.subPageId);
      } else {
        setParentSlug(resolvedParams.subPageId);
      }

      // Load nested sub-page to get its slug
      const nestedResult = await getNursingTestBankNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (nestedResult.success && nestedResult.data) {
        const nestedData = nestedResult.data as any;
        setNestedSlug(nestedData.slug || resolvedParams.nestedSubPageId);
      } else {
        setNestedSlug(resolvedParams.nestedSubPageId);
      }

      const result = await getNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId
      );

      if (result.success && result.data) {
        const pageData = result.data as any;

        // Load topic slug
        setTopicSlug(pageData.slug || resolvedParams.topicId);

        // Ensure all required fields exist with defaults
        const initializedContent: ServiceContent = {
          pageName: pageData.pageName || resolvedParams.topicId,
          meta: {
            title:
              pageData.meta?.title || `${resolvedParams.topicId} | TeasGurus`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            ogTitle: pageData.meta?.ogTitle || "",
            ogDescription: pageData.meta?.ogDescription || "",
            ogImage: pageData.meta?.ogImage || "/teas-gurus-logo.png",
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `https://teasgurus.com/${
                nestedSlug || resolvedParams.nestedSubPageId
              }-${parentSlug || resolvedParams.subPageId}-${
                resolvedParams.topicId
              }`,
          },
          schema: pageData.schema || "",
          hero: {
            badge: pageData.hero?.badge || "",
            title:
              pageData.hero?.title ||
              pageData.pageName ||
              resolvedParams.topicId,
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
        // Initialize with default content structure
        const defaultContent: ServiceContent = {
          pageName: resolvedParams.topicId,
          meta: {
            title: `${resolvedParams.topicId} | TeasGurus`,
            description: `Content for ${resolvedParams.topicId}`,
            keywords: `${resolvedParams.topicId}, ${resolvedParams.nestedSubPageId}, ${resolvedParams.subPageId}, nursing test bank`,
            ogTitle: `${resolvedParams.topicId} | TeasGurus`,
            ogDescription: `Content for ${resolvedParams.topicId}`,
            ogImage: "/teas-gurus-logo.png",
            canonicalUrl: `https://teasgurus.com/${
              nestedSlug || resolvedParams.nestedSubPageId
            }-${parentSlug || resolvedParams.subPageId}-${
              resolvedParams.topicId
            }`,
          },
          schema: "",
          hero: {
            badge: "",
            title: resolvedParams.topicId,
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
      setError("Failed to load content");
      console.error("Error loading content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async () => {
    if (!content || !resolvedParams) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Include slug in the content to be saved
      const contentWithSlug = {
        ...content,
        slug: topicSlug.trim() || resolvedParams.topicId,
      };

      const result = await uploadNursingTestBankTopic(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
        contentWithSlug
      );

      if (result.success) {
        setSuccess("Content updated successfully!");
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

  const updateArrayContent = (path: string, index: number, value: any) => {
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
      if (!current || !Array.isArray(current[lastKey])) {
        return prev;
      }

      current[lastKey][index] = value;
      return newContent;
    });
  };

  const addArrayItem = (path: string, newItem: any) => {
    if (!content) return;

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev));
      let current: any = newContent;

      for (let i = 0; i < keys.length; i++) {
        if (!current || typeof current !== "object") {
          return prev;
        }
        if (i === keys.length - 1) {
          if (!Array.isArray(current[keys[i]])) {
            current[keys[i]] = [];
          }
          current[keys[i]].push(newItem);
        } else {
          current = current[keys[i]];
        }
      }

      return newContent;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
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
      if (!current || !Array.isArray(current[lastKey])) {
        return prev;
      }

      current[lastKey] = current[lastKey].filter(
        (_: any, i: number) => i !== index
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-indigo-600"
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
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Topic: {content.pageName || resolvedParams.topicId}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Update the content for this topic
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/manage`}
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
                  href={`/${nestedSlug || resolvedParams.nestedSubPageId}-${
                    parentSlug || resolvedParams.subPageId
                  }-${topicSlug || resolvedParams.topicId}`}
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
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
          {/* Page Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Page Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Name
                </label>
                <input
                  type="text"
                  value={content.pageName || ""}
                  onChange={(e) =>
                    setContent({ ...content, pageName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic ID (Slug)
                </label>
                <input
                  type="text"
                  value={topicSlug}
                  onChange={(e) => setTopicSlug(e.target.value)}
                  placeholder={resolvedParams?.topicId || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL slug (editable). The URL will be: /
                  {nestedSlug || resolvedParams?.nestedSubPageId || ""}-
                  {parentSlug || resolvedParams?.subPageId || ""}-
                  {topicSlug || resolvedParams?.topicId || ""}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={content.meta.keywords}
                  onChange={(e) =>
                    updateContent("meta.keywords", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  onChange={(e) =>
                    updateContent("meta.ogTitle", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OG Image URL
                </label>
                <input
                  type="text"
                  value={content.meta.ogImage}
                  onChange={(e) =>
                    updateContent("meta.ogImage", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 font-mono text-sm"
                placeholder='{"@context": "https://schema.org", ...}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter valid JSON-LD schema markup for SEO
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Hero Section
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => updateContent("hero.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <RichTextEditor
                  value={content.hero.description}
                  onChange={(value) => updateContent("hero.description", value)}
                />
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Trust Indicators
              </h2>
              <button
                onClick={() =>
                  addArrayItem("trustIndicators", { title: "", icon: "" })
                }
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Indicator
              </button>
            </div>
            <div className="space-y-4">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Indicator {index + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("trustIndicators", index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={indicator.title}
                        onChange={(e) =>
                          updateArrayContent("trustIndicators", index, {
                            ...indicator,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon Name
                      </label>
                      <input
                        type="text"
                        value={indicator.icon}
                        onChange={(e) =>
                          updateArrayContent("trustIndicators", index, {
                            ...indicator,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder="check, shield, clock, star, users, book, lightbulb, trophy"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What to Expect
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.whatToExpect.badge}
                  onChange={(e) =>
                    updateContent("whatToExpect.badge", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.whatToExpect.title}
                  onChange={(e) =>
                    updateContent("whatToExpect.title", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.whatToExpect.subtitle}
                  onChange={(value) =>
                    updateContent("whatToExpect.subtitle", value)
                  }
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Cards
                  </label>
                  <button
                    onClick={() =>
                      addArrayItem("whatToExpect.cards", {
                        title: "",
                        icon: "",
                        content: [],
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Add Card
                  </button>
                </div>
                <div className="space-y-4">
                  {content.whatToExpect.cards.map((card, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Card {index + 1}
                        </h3>
                        <button
                          onClick={() =>
                            removeArrayItem("whatToExpect.cards", index)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) =>
                              updateArrayContent("whatToExpect.cards", index, {
                                ...card,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Icon Name
                          </label>
                          <input
                            type="text"
                            value={card.icon}
                            onChange={(e) =>
                              updateArrayContent("whatToExpect.cards", index, {
                                ...card,
                                icon: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                            placeholder="check, shield, clock, star, users, book, lightbulb, trophy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content Items
                          </label>
                          <div className="space-y-2">
                            {card.content.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <RichTextEditor
                                  value={item}
                                  onChange={(value) => {
                                    const newContent = [...card.content];
                                    newContent[itemIndex] = value;
                                    updateArrayContent(
                                      "whatToExpect.cards",
                                      index,
                                      {
                                        ...card,
                                        content: newContent,
                                      }
                                    );
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newContent = card.content.filter(
                                      (_: string, i: number) => i !== itemIndex
                                    );
                                    updateArrayContent(
                                      "whatToExpect.cards",
                                      index,
                                      {
                                        ...card,
                                        content: newContent,
                                      }
                                    );
                                  }}
                                  className="text-red-600 hover:text-red-800 px-3"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newContent = [...card.content, ""];
                                updateArrayContent(
                                  "whatToExpect.cards",
                                  index,
                                  {
                                    ...card,
                                    content: newContent,
                                  }
                                );
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add Content Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Footer
                </label>
                <RichTextEditor
                  value={content.whatToExpect.footer}
                  onChange={(value) =>
                    updateContent("whatToExpect.footer", value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Most Common Questions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Most Common Questions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.mostCommonQuestions.badge}
                  onChange={(e) =>
                    updateContent("mostCommonQuestions.badge", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.mostCommonQuestions.title}
                  onChange={(e) =>
                    updateContent("mostCommonQuestions.title", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.mostCommonQuestions.subtitle}
                  onChange={(e) =>
                    updateContent(
                      "mostCommonQuestions.subtitle",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Cards
                  </label>
                  <button
                    onClick={() =>
                      addArrayItem("mostCommonQuestions.cards", {
                        title: "",
                        content: [],
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Add Card
                  </button>
                </div>
                <div className="space-y-4">
                  {content.mostCommonQuestions.cards.map((card, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Card {index + 1}
                        </h3>
                        <button
                          onClick={() =>
                            removeArrayItem("mostCommonQuestions.cards", index)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) =>
                              updateArrayContent(
                                "mostCommonQuestions.cards",
                                index,
                                {
                                  ...card,
                                  title: e.target.value,
                                }
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content Items
                          </label>
                          <div className="space-y-2">
                            {card.content.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <RichTextEditor
                                  value={item}
                                  onChange={(value) => {
                                    const newContent = [...card.content];
                                    newContent[itemIndex] = value;
                                    updateArrayContent(
                                      "mostCommonQuestions.cards",
                                      index,
                                      {
                                        ...card,
                                        content: newContent,
                                      }
                                    );
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newContent = card.content.filter(
                                      (_: string, i: number) => i !== itemIndex
                                    );
                                    updateArrayContent(
                                      "mostCommonQuestions.cards",
                                      index,
                                      {
                                        ...card,
                                        content: newContent,
                                      }
                                    );
                                  }}
                                  className="text-red-600 hover:text-red-800 px-3"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newContent = [...card.content, ""];
                                updateArrayContent(
                                  "mostCommonQuestions.cards",
                                  index,
                                  {
                                    ...card,
                                    content: newContent,
                                  }
                                );
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add Content Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Study Guide */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Study Guide
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.studyGuide.badge}
                  onChange={(e) =>
                    updateContent("studyGuide.badge", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.studyGuide.title}
                  onChange={(e) =>
                    updateContent("studyGuide.title", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.studyGuide.subtitle}
                  onChange={(value) =>
                    updateContent("studyGuide.subtitle", value)
                  }
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Sections
                  </label>
                  <button
                    onClick={() =>
                      addArrayItem("studyGuide.sections", {
                        title: "",
                        icon: "",
                        content: "",
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Add Section
                  </button>
                </div>
                <div className="space-y-4">
                  {content.studyGuide.sections.map((section, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Section {index + 1}
                        </h3>
                        <button
                          onClick={() =>
                            removeArrayItem("studyGuide.sections", index)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateArrayContent("studyGuide.sections", index, {
                                ...section,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Icon Name
                          </label>
                          <input
                            type="text"
                            value={section.icon}
                            onChange={(e) =>
                              updateArrayContent("studyGuide.sections", index, {
                                ...section,
                                icon: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                            placeholder="check, shield, clock, star, users, book, lightbulb, trophy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content
                          </label>
                          <RichTextEditor
                            value={section.content}
                            onChange={(value) =>
                              updateArrayContent("studyGuide.sections", index, {
                                ...section,
                                content: value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Pricing */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Privacy & Pricing
              </h2>
              <button
                onClick={() =>
                  addArrayItem("privacyPricing", {
                    title: "",
                    icon: "",
                    content: "",
                  })
                }
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-4">
              {content.privacyPricing.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Item {index + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("privacyPricing", index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateArrayContent("privacyPricing", index, {
                            ...item,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon Name
                      </label>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) =>
                          updateArrayContent("privacyPricing", index, {
                            ...item,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder="check, shield, clock, star, users, book, lightbulb, trophy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content
                      </label>
                      <RichTextEditor
                        value={item.content}
                        onChange={(value) =>
                          updateArrayContent("privacyPricing", index, {
                            ...item,
                            content: value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.faq.title}
                  onChange={(e) => updateContent("faq.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.faq.subtitle}
                  onChange={(value) => updateContent("faq.subtitle", value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Questions
                  </label>
                  <button
                    onClick={() =>
                      addArrayItem("faq.questions", {
                        question: "",
                        paragraphs: [],
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Add Question
                  </button>
                </div>
                <div className="space-y-4">
                  {content.faq.questions.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {index + 1}
                        </h3>
                        <button
                          onClick={() =>
                            removeArrayItem("faq.questions", index)
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateArrayContent("faq.questions", index, {
                                ...faq,
                                question: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Paragraphs
                          </label>
                          <div className="space-y-2">
                            {faq.paragraphs.map((paragraph, pIndex) => (
                              <div key={pIndex} className="flex gap-2">
                                <RichTextEditor
                                  value={paragraph}
                                  onChange={(value) => {
                                    const newParagraphs = [...faq.paragraphs];
                                    newParagraphs[pIndex] = value;
                                    updateArrayContent("faq.questions", index, {
                                      ...faq,
                                      paragraphs: newParagraphs,
                                    });
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newParagraphs = faq.paragraphs.filter(
                                      (_: string, i: number) => i !== pIndex
                                    );
                                    updateArrayContent("faq.questions", index, {
                                      ...faq,
                                      paragraphs: newParagraphs,
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-800 px-3"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newParagraphs = [...faq.paragraphs, ""];
                                updateArrayContent("faq.questions", index, {
                                  ...faq,
                                  paragraphs: newParagraphs,
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add Paragraph
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Paragraphs (Optional)
                          </label>
                          <div className="space-y-2">
                            {faq.additionalParagraphs?.map(
                              (paragraph, pIndex) => (
                                <div key={pIndex} className="flex gap-2">
                                  <RichTextEditor
                                    value={paragraph}
                                    onChange={(value) => {
                                      const newParagraphs = [
                                        ...(faq.additionalParagraphs || []),
                                      ];
                                      newParagraphs[pIndex] = value;
                                      updateArrayContent(
                                        "faq.questions",
                                        index,
                                        {
                                          ...faq,
                                          additionalParagraphs: newParagraphs,
                                        }
                                      );
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const newParagraphs = (
                                        faq.additionalParagraphs || []
                                      ).filter(
                                        (_: string, i: number) => i !== pIndex
                                      );
                                      updateArrayContent(
                                        "faq.questions",
                                        index,
                                        {
                                          ...faq,
                                          additionalParagraphs: newParagraphs,
                                        }
                                      );
                                    }}
                                    className="text-red-600 hover:text-red-800 px-3"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            ) || []}
                            <button
                              onClick={() => {
                                const newParagraphs = [
                                  ...(faq.additionalParagraphs || []),
                                  "",
                                ];
                                updateArrayContent("faq.questions", index, {
                                  ...faq,
                                  additionalParagraphs: newParagraphs,
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add Additional Paragraph
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
