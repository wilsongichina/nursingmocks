"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { getServiceContent } from "@/lib/firestore-operations";
import { mathPageContent } from "@/lib/math-page-content";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

interface ServiceContent {
  meta?: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  schema?: string;
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

export default function ServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const loadContent = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getServiceContent(resolvedParams.serviceId);

      if (result.success && result.data) {
        setContent(result.data as ServiceContent);
      } else {
        // Fallback to default content for math/maths
        if (
          resolvedParams.serviceId === "maths" ||
          resolvedParams.serviceId === "math"
        ) {
          setContent(mathPageContent);
        } else {
          setError("Content not found for this service");
        }
      }
    } catch (err) {
      console.error("Error loading service content:", err);
      setError("Failed to load content");

      // Fallback to default content for math/maths
      if (
        resolvedParams.serviceId === "maths" ||
        resolvedParams.serviceId === "math"
      ) {
        setContent(mathPageContent);
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    if (resolvedParams) {
      loadContent();
    }
  }, [resolvedParams, loadContent]);

  // Update page metadata when content changes
  useEffect(() => {
    if (content?.meta) {
      // Update document title
      if (content.meta.title) {
        document.title = content.meta.title;
      }

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", content.meta.description || "");

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", content.meta.keywords || "");

      // Update Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute(
        "content",
        content.meta.ogTitle || content.meta.title || ""
      );

      let ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (!ogDescription) {
        ogDescription = document.createElement("meta");
        ogDescription.setAttribute("property", "og:description");
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute(
        "content",
        content.meta.ogDescription || content.meta.description || ""
      );

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", content.meta.ogImage || "");

      // Update canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute(
        "href",
        content.meta.canonicalUrl || window.location.href
      );
    }
  }, [content]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content from Firestore...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !content) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-lg mb-4">
              <svg
                className="w-8 h-8 text-red-600 mx-auto mb-2"
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
              <p className="text-red-800 font-medium">Error Loading Content</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Service not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Schema Script */}
      {content.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: content.schema,
          }}
        />
      )}

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content.hero.badge}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content.hero.title}
            </h1>
            <div className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-white">
              <RichTextRenderer
                content={content.hero.subtitle}
                className="text-white"
              />
            </div>
            <div className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90 text-white">
              <RichTextRenderer
                content={content.hero.description}
                className="text-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hesi-a2"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Our Services
              </Link>
              <Link
                href="/prices"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {content.trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div
                  className={`w-20 h-20 ${getIconColor(
                    indicator.icon
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(indicator.icon)} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {indicator.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content.whatToExpect.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.whatToExpect.title}
            </h2>
            <div className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <RichTextRenderer content={content.whatToExpect.subtitle} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(content?.whatToExpect?.cards ?? []).map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${getIconColor(
                    card?.icon || "check"
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(card?.icon || "check")} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {card?.title || "Card Title"}
                </h3>
                {(card?.content ?? []).map((paragraph, pIndex) => (
                  <div
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < (card?.content ?? []).length - 1 ? "mb-4" : ""
                    }`}
                  >
                    <RichTextRenderer content={paragraph} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              <RichTextRenderer content={content?.whatToExpect?.footer || ""} />
            </div>
          </div>
        </div>
      </section>

      {/* Most Common Questions Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              {content?.mostCommonQuestions?.badge || "Most Common Questions"}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content?.mostCommonQuestions?.title || "Most Common Questions"}
            </h2>
            <div className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <RichTextRenderer
                content={content?.mostCommonQuestions?.subtitle || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(content?.mostCommonQuestions?.cards ?? []).map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {card?.title || "Card Title"}
                </h3>
                {(card?.content ?? []).map((paragraph, pIndex) => (
                  <div
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < (card?.content ?? []).length - 1 ? "mb-4" : ""
                    }`}
                  >
                    <RichTextRenderer content={paragraph} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Guide Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
              {content?.studyGuide?.badge || "Study Guide"}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content?.studyGuide?.title || "Study Guide"}
            </h2>
            <div className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <RichTextRenderer content={content?.studyGuide?.subtitle || ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(content?.studyGuide?.sections ?? []).map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${getIconColor(
                    section?.icon || "check"
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(section?.icon || "check")} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {section?.title || "Section Title"}
                </h3>
                <div className="text-gray-600 leading-relaxed text-sm">
                  <RichTextRenderer content={section?.content || ""} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(content?.privacyPricing ?? []).map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${getIconColor(
                    item?.icon || "check"
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(item?.icon || "check")} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {item?.title || "Item Title"}
                </h3>
                <div className="text-gray-600 leading-relaxed">
                  <RichTextRenderer content={item?.content || ""} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content?.faq?.title || "Frequently Asked Questions"}
            </h2>
            <div className="text-xl text-gray-600 max-w-3xl mx-auto">
              <RichTextRenderer content={content?.faq?.subtitle || ""} />
            </div>
          </div>

          <div className="space-y-6">
            {(content?.faq?.questions ?? []).map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {faq?.question || "Question"}
                </h3>

                {/* Render paragraphs */}
                {(faq?.paragraphs ?? []).map((paragraph, pIndex) => (
                  <div
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < (faq?.paragraphs ?? []).length - 1 ? "mb-4" : ""
                    }`}
                  >
                    <RichTextRenderer content={paragraph} />
                  </div>
                ))}

                {/* Render additional paragraphs if they exist */}
                {(faq?.additionalParagraphs ?? []).map((paragraph, pIndex) => (
                  <div
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < (faq?.additionalParagraphs ?? []).length - 1
                        ? "mb-4"
                        : ""
                    }`}
                  >
                    <RichTextRenderer content={paragraph} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Master TEAS{" "}
                {resolvedParams?.serviceId
                  ? resolvedParams.serviceId.charAt(0).toUpperCase() +
                    resolvedParams.serviceId.slice(1)
                  : "Exam"}
                ?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join thousands of successful students who have achieved their
                nursing school dreams with TEAS Gurus. Get started today and pay
                only after you pass.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/hesi-a2"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Our Services
                </Link>
                <Link
                  href="/prices"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Helper functions for icons
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: string } = {
    check:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    shield:
      "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    "check-circle": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return iconMap[iconName] || iconMap.check;
};

const getIconColor = (iconName: string) => {
  const colorMap: { [key: string]: string } = {
    check: "bg-blue-600",
    shield: "bg-green-600",
    star: "bg-yellow-500",
    "check-circle": "bg-red-500",
  };

  return colorMap[iconName] || "bg-blue-600";
};
