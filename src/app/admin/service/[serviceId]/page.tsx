"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getServiceContent,
  uploadServiceContent,
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
  params: Promise<{ serviceId: string }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    serviceId: string;
  } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  const loadServiceContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      const result = await getServiceContent(resolvedParams.serviceId);

      if (result.success && result.data) {
        // Ensure meta and schema objects are properly initialized with default values if missing
        const serviceData = result.data as ServiceContent;

        // Default cards for What to Expect section
        const defaultWhatToExpectCards = [
          {
            title: "Professional Service",
            icon: "star",
            content: [
              "Our experienced team ensures your exam is handled professionally and confidentially.",
            ],
          },
          {
            title: "Guaranteed Results",
            icon: "check-circle",
            content: [
              "We provide a money-back guarantee if you're not satisfied with our service.",
            ],
          },
        ];

        // Default cards for Most Common Questions section
        const defaultMostCommonCards = [
          {
            title: "How does the process work?",
            content: [
              "We handle your exam from start to finish, ensuring confidentiality and quality results.",
            ],
          },
          {
            title: "What if I'm not satisfied?",
            content: [
              "We offer a money-back guarantee to ensure your complete satisfaction.",
            ],
          },
        ];

        // Default sections for Best Way section
        const defaultStudyGuideSections = [
          {
            title: "Expert Preparation",
            icon: "academic-cap",
            content:
              "Our team prepares thoroughly for your specific exam requirements.",
          },
          {
            title: "Secure Process",
            icon: "shield-check",
            content:
              "Your information and exam process are kept completely confidential and secure.",
          },
          {
            title: "Proven Methods",
            icon: "chart-bar",
            content:
              "We use tested strategies and proven methods to ensure your success.",
          },
          {
            title: "24/7 Support",
            icon: "phone",
            content:
              "Round-the-clock support available to answer your questions and concerns.",
          },
        ];

        // Default cards for Privacy & Pricing section
        const defaultPrivacyPricingCards = [
          {
            title: "Competitive Pricing",
            icon: "currency-dollar",
            content:
              "Competitive pricing with transparent costs and no hidden fees.",
          },
          {
            title: "Flexible Payment",
            icon: "credit-card",
            content: "Flexible payment options available to suit your needs.",
          },
        ];

        // Default FAQ questions
        const defaultFAQQuestions = [
          {
            question: "How does the exam process work?",
            paragraphs: [
              "Our process is simple and secure. We handle your exam from start to finish, ensuring confidentiality and quality results. Our experienced team takes care of everything while you focus on your other responsibilities.",
            ],
            additionalParagraphs: [],
          },
          {
            question: "Is this service legitimate and safe?",
            paragraphs: [
              "Yes, our service is completely legitimate and safe. We maintain strict confidentiality protocols and use secure methods to protect your information. We have helped thousands of students successfully achieve their goals.",
            ],
            additionalParagraphs: [],
          },
          {
            question: "What if I'm not satisfied with the results?",
            paragraphs: [
              "We offer a comprehensive money-back guarantee. If you're not completely satisfied with our service or results, we will refund your payment. Your satisfaction is our top priority.",
            ],
            additionalParagraphs: [],
          },
          {
            question: "How quickly can you complete my exam?",
            paragraphs: [
              "We offer flexible timing options to meet your needs. Standard completion is within 24-48 hours, but we can accommodate urgent requests. Contact us to discuss your specific timeline requirements.",
            ],
            additionalParagraphs: [],
          },
        ];

        const initializedContent = {
          ...serviceData,
          meta: {
            ...serviceData.meta,
          },
          schema: serviceData.schema ?? "",
          hero: {
            ...serviceData.hero,
          },
          trustIndicators: serviceData.trustIndicators ?? [],
          whatToExpect: {
            ...serviceData.whatToExpect,
            cards:
              serviceData.whatToExpect?.cards?.length > 0
                ? serviceData.whatToExpect.cards
                : defaultWhatToExpectCards,
          },
          mostCommonQuestions: {
            ...serviceData.mostCommonQuestions,
            cards:
              serviceData.mostCommonQuestions?.cards?.length > 0
                ? serviceData.mostCommonQuestions.cards
                : defaultMostCommonCards,
          },
          studyGuide: {
            ...serviceData.studyGuide,
            sections: (() => {
              const existing = serviceData.studyGuide?.sections ?? [];
              if (existing.length >= 4) return existing;
              // Fill up to 4 with defaults
              return [
                ...existing,
                ...defaultStudyGuideSections.slice(existing.length, 4),
              ];
            })(),
          },
          privacyPricing:
            serviceData.privacyPricing?.length > 0
              ? serviceData.privacyPricing
              : defaultPrivacyPricingCards,
          faq: {
            ...serviceData.faq,
            questions:
              serviceData.faq?.questions?.length > 0
                ? serviceData.faq.questions
                : defaultFAQQuestions,
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
    if (!content) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await uploadServiceContent(
        resolvedParams!.serviceId,
        content
      );

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
    console.log("updateContent called - path:", path, "value:", value);

    if (!content) {
      console.log("updateContent - no content available");
      return;
    }

    const keys = path.split(".");
    console.log("updateContent - keys:", keys);

    setContent((prev) => {
      if (!prev) {
        console.log("updateContent - prev is null");
        return prev;
      }

      const newContent = { ...prev };
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      console.log(
        "updateContent - setting",
        keys[keys.length - 1],
        "to",
        value
      );
      current[keys[keys.length - 1]] = value;

      console.log("updateContent - new content:", newContent);
      return newContent;
    });
  };

  const updateArrayContent = (path: string, index: number, value: any) => {
    if (!content) {
      console.log("❌ No content available for update");
      return;
    }

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          console.error(
            `Path ${keys.slice(0, i + 1).join(".")} is not an object`
          );
          return prev;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (!current || !Array.isArray(current[lastKey])) {
        console.error(`Path ${path} is not an array`);
        return prev;
      }

      // Update the item at the specified index
      current[lastKey][index] = value;
      console.log("✅ Updated", path, "at index", index);
      return newContent;
    });
  };

  const addArrayItem = (path: string, newItem: any) => {
    if (!content) return;

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          console.error(
            `Path ${keys.slice(0, i + 1).join(".")} is not an object`
          );
          return prev;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (!current || !Array.isArray(current[lastKey])) {
        console.error(`Path ${path} is not an array`);
        return prev;
      }

      // Add the new item to the array
      current[lastKey].push(newItem);
      return newContent;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    if (!content) return;

    setContent((prev) => {
      if (!prev) return prev;

      const keys = path.split(".");
      const newContent = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current || typeof current !== "object") {
          console.error(
            `Path ${keys.slice(0, i + 1).join(".")} is not an object`
          );
          return prev;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (!current || !Array.isArray(current[lastKey])) {
        console.error(`Path ${path} is not an array`);
        return prev;
      }

      // Create a new array without the item at the specified index
      const newArray = current[lastKey].filter(
        (_: any, i: number) => i !== index
      );
      current[lastKey] = newArray;

      return newContent;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading service content...</p>
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
            href="/admin"
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
            <span>Back to Admin</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Service not found
          </h3>
          <p className="text-gray-600 mb-6">
            The service you're looking for doesn't exist.
          </p>
          <Link
            href="/admin"
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
            <span>Back to Admin</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
                Edit Service: {resolvedParams?.serviceId}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Update the content for the {resolvedParams?.serviceId} service
              page
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
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
              <span>Back to Admin</span>
            </Link>
            <Link
              href={`/${resolvedParams?.serviceId}`}
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
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

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-3"
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
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-3"
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
            {success}
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Meta Details Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Meta Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={content.meta.title}
                onChange={(e) => updateContent("meta.title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter page title for SEO"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={content.meta.description}
                onChange={(e) =>
                  updateContent("meta.description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                placeholder="Enter meta description for search engines"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={content.meta.keywords}
                onChange={(e) => updateContent("meta.keywords", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter keywords separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Open Graph Title
              </label>
              <input
                type="text"
                value={content.meta.ogTitle}
                onChange={(e) => updateContent("meta.ogTitle", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter OG title for social sharing"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Open Graph Image URL
              </label>
              <input
                type="text"
                value={content.meta.ogImage}
                onChange={(e) => updateContent("meta.ogImage", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter OG image URL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Open Graph Description
              </label>
              <textarea
                value={content.meta.ogDescription}
                onChange={(e) =>
                  updateContent("meta.ogDescription", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                placeholder="Enter OG description for social sharing"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="text"
                value={content.meta.canonicalUrl}
                onChange={(e) =>
                  updateContent("meta.canonicalUrl", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter canonical URL"
              />
            </div>
          </div>
        </div>

        {/* Schema Markup Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-indigo-600"
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
            <h2 className="text-2xl font-bold text-gray-900">Schema Markup</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Schema Script
            </label>
            <textarea
              value={content.schema}
              onChange={(e) => updateContent("schema", e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500 font-mono text-sm"
              placeholder="Paste your pre-prepared schema script here (JSON-LD format)..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Paste your complete schema markup script here. This will be
              included in the page head for SEO purposes.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hero Section</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Badge
              </label>
              <input
                type="text"
                value={content.hero.badge}
                onChange={(e) => updateContent("hero.badge", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter badge text"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter main title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <RichTextEditor
                value={content.hero.subtitle}
                onChange={(value) => updateContent("hero.subtitle", value)}
                placeholder="Enter subtitle with rich formatting..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <RichTextEditor
                value={content.hero.description}
                onChange={(value) => updateContent("hero.description", value)}
                placeholder="Enter detailed description with rich formatting..."
              />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Trust Indicators
              </h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("trustIndicators", {
                  title: "New Indicator",
                  icon: "star",
                })
              }
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Indicator</span>
            </button>
          </div>
          <div className="space-y-4">
            {content.trustIndicators.map((indicator, index) => (
              <div
                key={`trust-indicator-${index}`}
                className="flex gap-4 items-center p-6 border border-gray-200 rounded-xl bg-gray-50"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={indicator.title}
                    onChange={(e) =>
                      updateArrayContent("trustIndicators", index, {
                        ...indicator,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Indicator title"
                  />
                </div>
                <div className="w-40">
                  <input
                    type="text"
                    value={indicator.icon}
                    onChange={(e) =>
                      updateArrayContent("trustIndicators", index, {
                        ...indicator,
                        icon: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Icon name"
                  />
                </div>
                <button
                  onClick={() => removeArrayItem("trustIndicators", index)}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                What to Expect
              </h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("whatToExpect.cards", {
                  title: "New Card",
                  icon: "star",
                  content: ["New content"],
                })
              }
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Badge"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <RichTextEditor
                value={content.whatToExpect.subtitle}
                onChange={(value) =>
                  updateContent("whatToExpect.subtitle", value)
                }
                placeholder="Enter subtitle with rich formatting..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Footer
              </label>
              <RichTextEditor
                value={content.whatToExpect.footer}
                onChange={(value) =>
                  updateContent("whatToExpect.footer", value)
                }
                placeholder="Enter footer content with rich formatting..."
              />
            </div>
          </div>
          <div className="space-y-4">
            {content.whatToExpect.cards.map((card, cardIndex) => (
              <div
                key={`what-to-expect-card-${cardIndex}`}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 mb-2"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) =>
                        updateArrayContent("whatToExpect.cards", cardIndex, {
                          ...card,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Card title"
                    />
                  </div>
                  <div className="w-40">
                    <input
                      type="text"
                      value={card.icon}
                      onChange={(e) =>
                        updateArrayContent("whatToExpect.cards", cardIndex, {
                          ...card,
                          icon: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Icon name"
                    />
                  </div>
                  <button
                    onClick={() =>
                      removeArrayItem("whatToExpect.cards", cardIndex)
                    }
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {card.content.map((contentItem, contentIndex) => (
                    <div
                      key={`content-item-${cardIndex}-${contentIndex}`}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content Item {contentIndex + 1}
                      </label>
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
                        placeholder="Enter content with rich formatting..."
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
                        className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newContent = [...card.content, "New content"];
                      updateArrayContent("whatToExpect.cards", cardIndex, {
                        ...card,
                        content: newContent,
                      });
                    }}
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 01-8 0"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Most Common</h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("mostCommonQuestions.cards", {
                  title: "New Card",
                  content: ["New content"],
                })
              }
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2 font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Badge"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <RichTextEditor
                value={content.mostCommonQuestions.subtitle}
                onChange={(value) =>
                  updateContent("mostCommonQuestions.subtitle", value)
                }
                placeholder="Enter subtitle with rich formatting..."
              />
            </div>
          </div>
          <div className="space-y-4">
            {content.mostCommonQuestions.cards.map((card, cardIndex) => (
              <div
                key={`most-common-card-${cardIndex}`}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 mb-2"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) =>
                        updateArrayContent(
                          "mostCommonQuestions.cards",
                          cardIndex,
                          { ...card, title: e.target.value }
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Card title"
                    />
                  </div>
                  <button
                    onClick={() =>
                      removeArrayItem("mostCommonQuestions.cards", cardIndex)
                    }
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {card.content.map((contentItem, contentIndex) => (
                    <div
                      key={`most-common-content-${cardIndex}-${contentIndex}`}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content Item {contentIndex + 1}
                      </label>
                      <RichTextEditor
                        value={contentItem}
                        onChange={(value) => {
                          const newContent = [...card.content];
                          newContent[contentIndex] = value;
                          updateArrayContent(
                            "mostCommonQuestions.cards",
                            cardIndex,
                            { ...card, content: newContent }
                          );
                        }}
                        placeholder="Enter content with rich formatting..."
                      />
                      <button
                        onClick={() => {
                          const newContent = card.content.filter(
                            (_, i) => i !== contentIndex
                          );
                          updateArrayContent(
                            "mostCommonQuestions.cards",
                            cardIndex,
                            { ...card, content: newContent }
                          );
                        }}
                        className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newContent = [...card.content, "New content"];
                      updateArrayContent(
                        "mostCommonQuestions.cards",
                        cardIndex,
                        { ...card, content: newContent }
                      );
                    }}
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Content</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Way Section (studyGuide) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Best Way</h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("studyGuide.sections", {
                  title: "New Section",
                  icon: "book",
                  content: "Section content",
                })
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Badge"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Title"
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
                placeholder="Enter subtitle with rich formatting..."
              />
            </div>
          </div>
          <div className="space-y-4">
            {content.studyGuide.sections.map((section, sectionIndex) => (
              <div
                key={`study-guide-section-${sectionIndex}`}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 mb-2"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateArrayContent(
                          "studyGuide.sections",
                          sectionIndex,
                          { ...section, title: e.target.value }
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Section title"
                    />
                  </div>
                  <div className="w-40">
                    <input
                      type="text"
                      value={section.icon}
                      onChange={(e) =>
                        updateArrayContent(
                          "studyGuide.sections",
                          sectionIndex,
                          { ...section, icon: e.target.value }
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Icon name"
                    />
                  </div>
                  <button
                    onClick={() =>
                      removeArrayItem("studyGuide.sections", sectionIndex)
                    }
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Section Content
                  </label>
                  <RichTextEditor
                    value={section.content}
                    onChange={(value) =>
                      updateArrayContent("studyGuide.sections", sectionIndex, {
                        ...section,
                        content: value,
                      })
                    }
                    placeholder="Enter section content with rich formatting..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Pricing Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Privacy & Pricing
              </h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("privacyPricing", {
                  title: "New Pricing Item",
                  icon: "dollar",
                  content: "Pricing content",
                })
              }
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Card</span>
            </button>
          </div>
          <div className="space-y-4">
            {(content.privacyPricing ?? []).map((card, cardIndex) => (
              <div
                key={`privacy-pricing-card-${cardIndex}`}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 mb-2"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) =>
                        updateArrayContent("privacyPricing", cardIndex, {
                          ...card,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Card title"
                    />
                  </div>
                  <div className="w-40">
                    <input
                      type="text"
                      value={card.icon}
                      onChange={(e) =>
                        updateArrayContent("privacyPricing", cardIndex, {
                          ...card,
                          icon: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Icon name"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem("privacyPricing", cardIndex)}
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Content
                  </label>
                  <RichTextEditor
                    value={card.content}
                    onChange={(value) =>
                      updateArrayContent("privacyPricing", cardIndex, {
                        ...card,
                        content: value,
                      })
                    }
                    placeholder="Enter pricing content with rich formatting..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600"
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
              <h2 className="text-2xl font-bold text-gray-900">FAQ Section</h2>
            </div>
            <button
              onClick={() =>
                addArrayItem("faq.questions", {
                  question: "New Question?",
                  paragraphs: ["New answer"],
                  additionalParagraphs: [],
                })
              }
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add Question</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={content.faq.title}
                onChange={(e) => updateContent("faq.title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="FAQ section title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Subtitle
              </label>
              <RichTextEditor
                value={content.faq.subtitle}
                onChange={(value) => updateContent("faq.subtitle", value)}
                placeholder="Enter FAQ subtitle with rich formatting..."
              />
            </div>
          </div>

          <div className="space-y-6">
            {content.faq.questions.map((question, questionIndex) => (
              <div
                key={`faq-question-${questionIndex}`}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50"
              >
                <div className="flex gap-4 items-start mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        updateArrayContent("faq.questions", questionIndex, {
                          ...question,
                          question: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-semibold text-gray-900 placeholder-gray-500"
                      placeholder="Enter question"
                    />
                  </div>
                  <button
                    onClick={() =>
                      removeArrayItem("faq.questions", questionIndex)
                    }
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-600"
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
                    Answer Paragraphs:
                  </h4>
                  {question.paragraphs.map((paragraph, paragraphIndex) => (
                    <div
                      key={`faq-paragraph-${questionIndex}-${paragraphIndex}`}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Answer Paragraph {paragraphIndex + 1}
                      </label>
                      <RichTextEditor
                        value={paragraph}
                        onChange={(value) => {
                          const newParagraphs = [...question.paragraphs];
                          newParagraphs[paragraphIndex] = value;
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            paragraphs: newParagraphs,
                          });
                        }}
                        placeholder="Enter answer paragraph with rich formatting..."
                      />
                      <button
                        onClick={() => {
                          const newParagraphs = question.paragraphs.filter(
                            (_, i) => i !== paragraphIndex
                          );
                          updateArrayContent("faq.questions", questionIndex, {
                            ...question,
                            paragraphs: newParagraphs,
                          });
                        }}
                        className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newParagraphs = [
                        ...question.paragraphs,
                        "New paragraph",
                      ];
                      updateArrayContent("faq.questions", questionIndex, {
                        ...question,
                        paragraphs: newParagraphs,
                      });
                    }}
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Paragraph</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
