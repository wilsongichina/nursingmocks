"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSupportPageContent,
  uploadSupportPageContent,
} from "@/lib/firestore-operations";
import Link from "next/link";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface SupportPageContent {
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
  content: string;
}

export default function EditSupportPage({
  params,
}: {
  params: Promise<{ serviceId: string; pageId: string }>;
}) {
  const [content, setContent] = useState<SupportPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    serviceId: string;
    pageId: string;
  } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadSupportPageContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      const result = await getSupportPageContent(
        resolvedParams.serviceId,
        resolvedParams.pageId
      );

      if (result.success && result.data) {
        const pageData = result.data as SupportPageContent;
        const initializedContent = {
          ...pageData,
          meta: {
            title:
              pageData.meta?.title ||
              `${resolvedParams.pageId} - Complete Guide | TEAS Gurus`,
            description:
              pageData.meta?.description ||
              `Learn everything about ${resolvedParams.pageId.toLowerCase()}. Get expert guidance, tips, and comprehensive information for your TEAS exam preparation.`,
            keywords:
              pageData.meta?.keywords ||
              `${resolvedParams.pageId.toLowerCase()}, TEAS exam, nursing school, study guide, practice test`,
            ogTitle:
              pageData.meta?.ogTitle ||
              `${resolvedParams.pageId} - Complete Guide`,
            ogDescription:
              pageData.meta?.ogDescription ||
              `Learn everything about ${resolvedParams.pageId.toLowerCase()}. Get expert guidance and comprehensive information.`,
            ogImage: pageData.meta?.ogImage || `/teas-gurus-logo.png`,
            canonicalUrl:
              pageData.meta?.canonicalUrl ||
              `https://teasgurus.com/${resolvedParams.serviceId}/${resolvedParams.pageId}`,
          },
          schema:
            pageData.schema ||
            `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${resolvedParams.pageId} - Complete Guide",
  "description": "Learn everything about ${resolvedParams.pageId.toLowerCase()}. Get expert guidance, tips, and comprehensive information for your TEAS exam preparation.",
  "image": "https://teasgurus.com/teas-gurus-logo.png",
  "author": {
    "@type": "Organization",
    "name": "TEAS Gurus"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TEAS Gurus",
    "logo": {
      "@type": "ImageObject",
      "url": "https://teasgurus.com/teas-gurus-logo.png"
    }
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://teasgurus.com/${resolvedParams.serviceId}/${
              resolvedParams.pageId
            }"
  }
}`,
          hero: {
            badge: pageData.hero?.badge || `${resolvedParams.pageId} Guide`,
            title: pageData.hero?.title || resolvedParams.pageId,
            subtitle:
              pageData.hero?.subtitle ||
              `Complete Guide to ${resolvedParams.pageId}`,
            description:
              pageData.hero?.description ||
              `Learn everything you need to know about ${resolvedParams.pageId.toLowerCase()}. This comprehensive guide provides expert insights, practical tips, and detailed information to help you succeed in your TEAS exam preparation.`,
          },
          content:
            pageData.content ||
            `<h2>Introduction to ${resolvedParams.pageId}</h2>
<p>Welcome to our comprehensive guide on ${resolvedParams.pageId.toLowerCase()}. This page provides detailed information, expert tips, and practical advice to help you understand and master this important topic.</p>

<h2>Key Points About ${resolvedParams.pageId}</h2>
<ul>
<li>Important aspect 1</li>
<li>Important aspect 2</li>
<li>Important aspect 3</li>
</ul>

<h2>How to Prepare for ${resolvedParams.pageId}</h2>
<p>Effective preparation for ${resolvedParams.pageId.toLowerCase()} involves understanding the core concepts, practicing regularly, and using the right study materials. Here are some key strategies:</p>

<h3>Study Strategies</h3>
<p>Develop a systematic approach to studying ${resolvedParams.pageId.toLowerCase()}. Focus on understanding the fundamentals before moving to more complex topics.</p>

<h2>Conclusion</h2>
<p>Mastering ${resolvedParams.pageId.toLowerCase()} is essential for TEAS exam success. With proper preparation and the right resources, you can achieve your goals and excel in your nursing school journey.</p>`,
        };
        setContent(initializedContent);
      } else {
        setError("Support page not found");
      }
    } catch (err) {
      setError("Failed to load support page content");
      console.error("Error loading support page content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadSupportPageContent();
  }, [loadSupportPageContent]);

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await uploadSupportPageContent(
        resolvedParams!.serviceId,
        resolvedParams!.pageId,
        content
      );

      if (result.success) {
        setSuccess("Support page updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save support page");
      }
    } catch (err) {
      setError("Failed to save support page");
      console.error("Error saving support page:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path: string, value: string) => {
    if (!content) return;

    const keys = path.split(".");
    setContent((prev) => {
      if (!prev) return prev;
      const newContent = { ...prev };
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support page content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Support page not found</p>
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
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Support Page
                </h1>
                <p className="text-sm text-gray-600">
                  {resolvedParams?.serviceId} / {resolvedParams?.pageId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/supportpages"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Support Pages
              </Link>
              <Link
                href={`/${resolvedParams?.serviceId}/${resolvedParams?.pageId}`}
                target="_blank"
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                View Page
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Content */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Hero Section
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge}
                    onChange={(e) =>
                      updateContent("hero.badge", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Study Guide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) =>
                      updateContent("hero.title", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={content.hero.subtitle}
                    onChange={(e) =>
                      updateContent("hero.subtitle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Page subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={content.hero.description}
                    onChange={(e) =>
                      updateContent("hero.description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Page description"
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Main Content
              </h2>
              <RichTextEditor
                value={content.content}
                onChange={(value) => updateContent("content", value)}
                placeholder="Start typing your content..."
                className="min-h-[400px]"
              />
            </div>
          </div>

          {/* Right Column - Meta & Schema */}
          <div className="space-y-6">
            {/* Meta Data */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Meta Data
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={content.meta.title}
                    onChange={(e) =>
                      updateContent("meta.title", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="SEO page title"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="SEO meta description"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="SEO keywords"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Open Graph title"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Open Graph description"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Canonical URL"
                  />
                </div>
              </div>
            </div>

            {/* Schema */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Schema Markup
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JSON-LD Schema
                </label>
                <textarea
                  value={content.schema}
                  onChange={(e) => updateContent("schema", e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 font-mono text-sm"
                  placeholder="Paste your JSON-LD schema here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
