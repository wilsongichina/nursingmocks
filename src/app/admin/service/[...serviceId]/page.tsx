"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getServiceContent,
  uploadServiceContent,
  getPillarServicePageContent,
  uploadPillarServicePageContent,
} from "@/lib/firestore-operations";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Link from "next/link";

interface ServiceContent {
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

export default function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string[] }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    serviceId: string;
    isPillar: boolean;
    pillarPageId?: string;
    servicePageId?: string;
  } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      // serviceId is an array for catch-all routes, join it back
      const serviceIdArray = resolved.serviceId;
      const serviceIdString = serviceIdArray.join("/");
      
      // Check if serviceId contains multiple parts indicating it's a pillar service
      const isPillar = serviceIdArray.length > 1;
      let pillarPageId: string | undefined;
      let servicePageId: string | undefined;
      
      if (isPillar) {
        pillarPageId = serviceIdArray[0];
        servicePageId = serviceIdArray.slice(1).join("/");
      }
      
      setResolvedParams({
        serviceId: serviceIdString,
        isPillar,
        pillarPageId,
        servicePageId,
      });
    };
    resolveParams();
  }, [params]);

  const loadServiceContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      let result;
      
      if (resolvedParams.isPillar && resolvedParams.pillarPageId && resolvedParams.servicePageId) {
        result = await getPillarServicePageContent(
          resolvedParams.pillarPageId,
          resolvedParams.servicePageId
        );
      } else {
        result = await getServiceContent(resolvedParams.serviceId);
      }

      if (result.success && result.data) {
        const serviceData = result.data as ServiceContent;
        
        // Ensure all required fields exist with defaults
        const initializedContent: ServiceContent = {
          meta: {
            title: serviceData.meta?.title || "",
            description: serviceData.meta?.description || "",
            keywords: serviceData.meta?.keywords || "",
            ogTitle: serviceData.meta?.ogTitle || "",
            ogDescription: serviceData.meta?.ogDescription || "",
            ogImage: serviceData.meta?.ogImage || "",
            canonicalUrl: serviceData.meta?.canonicalUrl || "",
          },
          schema: serviceData.schema || "",
          hero: {
            badge: serviceData.hero?.badge || "",
            title: serviceData.hero?.title || "",
            subtitle: serviceData.hero?.subtitle || "",
            description: serviceData.hero?.description || "",
          },
          trustIndicators: serviceData.trustIndicators || [],
          whatToExpect: {
            badge: serviceData.whatToExpect?.badge || "",
            title: serviceData.whatToExpect?.title || "",
            subtitle: serviceData.whatToExpect?.subtitle || "",
            cards: serviceData.whatToExpect?.cards || [],
            footer: serviceData.whatToExpect?.footer || "",
          },
          mostCommonQuestions: {
            badge: serviceData.mostCommonQuestions?.badge || "",
            title: serviceData.mostCommonQuestions?.title || "",
            subtitle: serviceData.mostCommonQuestions?.subtitle || "",
            cards: serviceData.mostCommonQuestions?.cards || [],
          },
          studyGuide: {
            badge: serviceData.studyGuide?.badge || "",
            title: serviceData.studyGuide?.title || "",
            subtitle: serviceData.studyGuide?.subtitle || "",
            sections: serviceData.studyGuide?.sections || [],
          },
          privacyPricing: serviceData.privacyPricing || [],
          faq: {
            title: serviceData.faq?.title || "",
            subtitle: serviceData.faq?.subtitle || "",
            questions: serviceData.faq?.questions || [],
          },
        };
        
        setContent(initializedContent);
      } else {
        setError("Service not found");
      }
    } catch (err) {
      setError("Failed to load service content");
      console.error("Error loading service content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadServiceContent();
  }, [loadServiceContent]);

  const handleSave = async () => {
    if (!content || !resolvedParams) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let result;
      
      if (resolvedParams.isPillar && resolvedParams.pillarPageId && resolvedParams.servicePageId) {
        result = await uploadPillarServicePageContent(
          resolvedParams.pillarPageId,
          resolvedParams.servicePageId,
          {
            ...content,
            lastUpdated: new Date().toISOString(),
          }
        );
      } else {
        result = await uploadServiceContent(
          resolvedParams.serviceId,
          content
        );
      }

      if (result.success) {
        setSuccess("Service updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save service");
      }
    } catch (err) {
      setError("Failed to save service");
      console.error("Error saving service:", err);
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

      current[lastKey].push(newItem);
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

      current[lastKey].splice(index, 1);
      return newContent;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl mb-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Service
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
          <Link
            href="/admin/service"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold inline-flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
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
            <span>Back to Services</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const displayServiceName = resolvedParams?.isPillar 
    ? resolvedParams.servicePageId 
    : resolvedParams?.serviceId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                  Edit Service: {displayServiceName || ""}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Update the content for the {displayServiceName || ""} service page
                {resolvedParams?.isPillar && resolvedParams.pillarPageId 
                  ? ` (Pillar: ${resolvedParams.pillarPageId})` 
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/service"
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
                <span>Back to Services</span>
              </Link>
              <Link
                href={resolvedParams?.isPillar && resolvedParams.pillarPageId && resolvedParams.servicePageId
                  ? `/${resolvedParams.pillarPageId}/${resolvedParams.servicePageId}`
                  : `/${resolvedParams?.serviceId || ""}`}
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
          {/* SEO & Meta Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO & Meta Information</h2>
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
                  onChange={(e) => updateContent("meta.description", e.target.value)}
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
                  onChange={(e) => updateContent("meta.ogDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OG Image
                </label>
                <input
                  type="text"
                  value={content.meta.ogImage}
                  onChange={(e) => updateContent("meta.ogImage", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={content.meta.canonicalUrl}
                  onChange={(e) => updateContent("meta.canonicalUrl", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Schema Markup */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Schema Markup</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JSON-LD Schema
              </label>
              <textarea
                value={content.schema}
                onChange={(e) => updateContent("schema", e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-mono text-sm"
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) => updateContent("hero.badge", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => updateContent("hero.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.hero.subtitle}
                  onChange={(value) => updateContent("hero.subtitle", value)}
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
              <h2 className="text-2xl font-bold text-gray-900">Trust Indicators</h2>
              <button
                onClick={() =>
                  addArrayItem("trustIndicators", { title: "", icon: "" })
                }
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
                <span>Add Indicator</span>
              </button>
            </div>
            <div className="space-y-4">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Indicator {index + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("trustIndicators", index)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
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
                        value={indicator.title}
                        onChange={(e) =>
                          updateArrayContent("trustIndicators", index, {
                            ...indicator,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        placeholder="e.g., check, shield, star"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to Expect Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h2>
            <div className="space-y-4 mb-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cards</h3>
              <button
                onClick={() =>
                  addArrayItem("whatToExpect.cards", {
                    title: "",
                    icon: "",
                    content: [""],
                  })
                }
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
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.whatToExpect.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("whatToExpect.cards", cardIndex)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Card
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
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={card.icon}
                        onChange={(e) =>
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content
                      </label>
                      {card.content.map((contentItem, contentIndex) => (
                        <div key={contentIndex} className="mb-4">
                          <RichTextEditor
                            value={contentItem}
                            onChange={(value) => {
                              const newContent = [...card.content];
                              newContent[contentIndex] = value;
                              updateArrayContent("whatToExpect.cards", cardIndex, {
                                ...card,
                                content: newContent,
                              });
                            }}
                          />
                          <button
                            onClick={() => {
                              const newContent = card.content.filter(
                                (_, i) => i !== contentIndex
                              );
                              updateArrayContent("whatToExpect.cards", cardIndex, {
                                ...card,
                                content: newContent,
                              });
                            }}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Remove Content
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newContent = [...card.content, ""];
                          updateArrayContent("whatToExpect.cards", cardIndex, {
                            ...card,
                            content: newContent,
                          });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Content Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
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

          {/* Most Common Questions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Most Common Questions
            </h2>
            <div className="space-y-4 mb-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <RichTextEditor
                  value={content.mostCommonQuestions.subtitle}
                  onChange={(value) =>
                    updateContent("mostCommonQuestions.subtitle", value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cards</h3>
              <button
                onClick={() =>
                  addArrayItem("mostCommonQuestions.cards", {
                    title: "",
                    content: [""],
                  })
                }
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
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.mostCommonQuestions.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("mostCommonQuestions.cards", cardIndex)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Card
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
                            cardIndex,
                            {
                              ...card,
                              title: e.target.value,
                            }
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content
                      </label>
                      {card.content.map((contentItem, contentIndex) => (
                        <div key={contentIndex} className="mb-4">
                          <RichTextEditor
                            value={contentItem}
                            onChange={(value) => {
                              const newContent = [...card.content];
                              newContent[contentIndex] = value;
                              updateArrayContent(
                                "mostCommonQuestions.cards",
                                cardIndex,
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
                                (_, i) => i !== contentIndex
                              );
                              updateArrayContent(
                                "mostCommonQuestions.cards",
                                cardIndex,
                                {
                                  ...card,
                                  content: newContent,
                                }
                              );
                            }}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Remove Content
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newContent = [...card.content, ""];
                          updateArrayContent(
                            "mostCommonQuestions.cards",
                            cardIndex,
                            {
                              ...card,
                              content: newContent,
                            }
                          );
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Content Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Guide */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Guide</h2>
            <div className="space-y-4 mb-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Sections</h3>
              <button
                onClick={() =>
                  addArrayItem("studyGuide.sections", {
                    title: "",
                    icon: "",
                    content: "",
                  })
                }
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
                <span>Add Section</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.studyGuide.sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Section {sectionIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("studyGuide.sections", sectionIndex)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Section
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
                          updateArrayContent("studyGuide.sections", sectionIndex, {
                            ...section,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={section.icon}
                        onChange={(e) =>
                          updateArrayContent("studyGuide.sections", sectionIndex, {
                            ...section,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content
                      </label>
                      <RichTextEditor
                        value={section.content}
                        onChange={(value) =>
                          updateArrayContent("studyGuide.sections", sectionIndex, {
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
                <span>Add Card</span>
              </button>
            </div>
            <div className="space-y-6">
              {content.privacyPricing.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Card {cardIndex + 1}
                    </h3>
                    <button
                      onClick={() =>
                        removeArrayItem("privacyPricing", cardIndex)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Card
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
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={card.icon}
                        onChange={(e) =>
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content
                      </label>
                      <RichTextEditor
                        value={card.content}
                        onChange={(value) =>
                          updateArrayContent("privacyPricing", cardIndex, {
                            ...card,
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

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ Section</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={content.faq.title}
                  onChange={(e) => updateContent("faq.title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Questions</h3>
              <button
                onClick={() =>
                  addArrayItem("faq.questions", {
                    question: "",
                    paragraphs: [""],
                    additionalParagraphs: [],
                  })
                }
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
            <div className="space-y-6">
              {content.faq.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Question {questionIndex + 1}
                    </h3>
                    <button
                      onClick={() => removeArrayItem("faq.questions", questionIndex)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Question
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) =>
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            question: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Paragraphs
                      </label>
                      {question.paragraphs.map((paragraph, paraIndex) => (
                        <div key={paraIndex} className="mb-4">
                          <RichTextEditor
                            value={paragraph}
                            onChange={(value) => {
                              const newParagraphs = [...question.paragraphs];
                              newParagraphs[paraIndex] = value;
                              updateArrayContent("faq.questions", questionIndex, {
                                ...question,
                                paragraphs: newParagraphs,
                              });
                            }}
                          />
                          <button
                            onClick={() => {
                              const newParagraphs = question.paragraphs.filter(
                                (_, i) => i !== paraIndex
                              );
                              updateArrayContent("faq.questions", questionIndex, {
                                ...question,
                                paragraphs: newParagraphs,
                              });
                            }}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Remove Paragraph
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newParagraphs = [...question.paragraphs, ""];
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            paragraphs: newParagraphs,
                          });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Paragraph
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

