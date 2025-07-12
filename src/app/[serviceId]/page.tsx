import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { getServiceContent, getAllPages } from "@/lib/static-data";
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

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  try {
    const result = await getAllPages();

    if (result.success && result.data) {
      const pages = result.data;
      return Object.keys(pages).map((serviceId) => ({ serviceId }));
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  // Return default service IDs if static data is not available during build
  return [
    { serviceId: "math" },
    { serviceId: "maths" },
    { serviceId: "teas" },
    { serviceId: "hesi" },
  ];
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const result = await getServiceContent(resolvedParams.serviceId);

    if (result.success && result.data) {
      const content = result.data as ServiceContent;
      return {
        title:
          content.meta?.title || `${resolvedParams.serviceId} - TEAS Gurus`,
        description: content.meta?.description || "",
        keywords: content.meta?.keywords || "",
        openGraph: {
          title:
            content.meta?.ogTitle ||
            content.meta?.title ||
            `${resolvedParams.serviceId} - TEAS Gurus`,
          description:
            content.meta?.ogDescription || content.meta?.description || "",
          url:
            content.meta?.canonicalUrl ||
            `https://teasgurus.com/${resolvedParams.serviceId}`,
          images: [
            {
              url: content.meta?.ogImage || "/teas-gurus-logo.png",
              width: 1200,
              height: 630,
              alt:
                content.meta?.title ||
                `${resolvedParams.serviceId} - TEAS Gurus`,
            },
          ],
        },
        alternates: {
          canonical:
            content.meta?.canonicalUrl || `/${resolvedParams.serviceId}`,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: `${resolvedParams.serviceId} - TEAS Gurus`,
    description: `Get help with your ${resolvedParams.serviceId} exam preparation.`,
    alternates: {
      canonical: `/${resolvedParams.serviceId}`,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const resolvedParams = await params;
  let content: ServiceContent | null = null;

  try {
    const result = await getServiceContent(resolvedParams.serviceId);

    if (result.success && result.data) {
      content = result.data as ServiceContent;
    } else {
      // Fallback to default content for math/maths
      if (
        resolvedParams.serviceId === "maths" ||
        resolvedParams.serviceId === "math"
      ) {
        content = mathPageContent;
      }
    }
  } catch (error) {
    console.error("Error loading service content:", error);
    // Fallback to default content for math/maths
    if (
      resolvedParams.serviceId === "maths" ||
      resolvedParams.serviceId === "math"
    ) {
      content = mathPageContent;
    }
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

          <div
            className={`grid gap-8 ${
              (content?.whatToExpect?.cards ?? []).length === 1
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
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

          <div
            className={`grid gap-8 ${
              (content?.mostCommonQuestions?.cards ?? []).length === 1
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
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
