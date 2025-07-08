"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { getSupportPageContent } from "@/lib/firestore-operations";

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

export default function SupportPage({
  params,
}: {
  params: Promise<{ serviceId: string; pageId: string }>;
}) {
  const [content, setContent] = useState<SupportPageContent | null>(null);
  const [loading, setLoading] = useState(true);
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
      const result = await getSupportPageContent(
        resolvedParams.serviceId,
        resolvedParams.pageId
      );

      if (result.success && result.data) {
        setContent(result.data as SupportPageContent);

        // Update page metadata
        const pageData = result.data as SupportPageContent;
        document.title =
          pageData.meta?.title || `${resolvedParams.pageId} - TEAS Gurus`;

        // Update meta description
        let metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (!metaDescription) {
          metaDescription = document.createElement("meta");
          metaDescription.setAttribute("name", "description");
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute(
          "content",
          pageData.meta?.description || ""
        );

        // Update meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement("meta");
          metaKeywords.setAttribute("name", "keywords");
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute("content", pageData.meta?.keywords || "");

        // Update Open Graph tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
          ogTitle = document.createElement("meta");
          ogTitle.setAttribute("property", "og:title");
          document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute("content", pageData.meta?.ogTitle || "");

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
          pageData.meta?.ogDescription || ""
        );

        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement("meta");
          ogImage.setAttribute("property", "og:image");
          document.head.appendChild(ogImage);
        }
        ogImage.setAttribute(
          "content",
          pageData.meta?.ogImage || "/teas-gurus-logo.png"
        );

        // Update canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement("link");
          canonicalLink.setAttribute("rel", "canonical");
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute(
          "href",
          pageData.meta?.canonicalUrl ||
            `https://teasgurus.com/${resolvedParams.serviceId}/${resolvedParams.pageId}`
        );
      }
    } catch (err) {
      console.error("Error loading support page content:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    if (resolvedParams) {
      loadSupportPageContent();
    }
  }, [resolvedParams, loadSupportPageContent]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The requested support page could not be found.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
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
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
            <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              {content.hero.description}
            </p>
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

      {/* Main Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content with Left Border */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600 ">
                <div
                  className="prose prose-lg max-w-none text-gray-900"
                  style={{
                    color: "#111827",
                  }}
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            </div>

            {/* Right Side CTA */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-lg text-white sticky top-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Excel?</h3>
                  <p className="text-green-100 mb-6 leading-relaxed">
                    Get expert help with your TEAS preparation. Our specialists
                    are here to guide you to success.
                  </p>
                  <Link
                    href="/contact"
                    className="block w-full bg-yellow-400 text-green-900 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors text-center"
                  >
                    Get a Free Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Master Your TEAS Exam?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Get expert help with your TEAS preparation. Our specialists are
                here to guide you to success and ensure you achieve your nursing
                school goals. Join thousands of successful students who have
                achieved their dreams with TEAS Gurus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Today
                </Link>
                <Link
                  href="https://buy.stripe.com/4gw5mn0nm0mTfUk3e9"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Exact Teas - $99
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
