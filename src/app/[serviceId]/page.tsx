import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { getServiceContent, getAllServices } from "@/lib/firestore-operations";
import { mathPageContent } from "@/lib/math-page-content";

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
    const result = await getAllServices();

    if (result.success && result.data) {
      const services = result.data;
      const params: Array<{ serviceId: string }> = [];

      // Extract all possible serviceId combinations
      services.forEach((serviceId) => {
        params.push({ serviceId });
      });

      return params;
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  // Return some default services if Firestore is not available during build
  return [{ serviceId: "maths" }, { serviceId: "math" }, { serviceId: "teas" }];
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const result = await getServiceContent(resolvedParams.serviceId);

    if (result.success && result.data) {
      const serviceData = result.data as ServiceContent;

      if (serviceData.meta) {
        return {
          title:
            serviceData.meta.title ||
            `${resolvedParams.serviceId} - TEAS Gurus`,
          description: serviceData.meta.description || "",
          keywords: serviceData.meta.keywords || "",
          openGraph: {
            title:
              serviceData.meta.ogTitle ||
              serviceData.meta.title ||
              `${resolvedParams.serviceId} - TEAS Gurus`,
            description:
              serviceData.meta.ogDescription ||
              serviceData.meta.description ||
              "",
            url:
              serviceData.meta.canonicalUrl ||
              `https://teasgurus.com/${resolvedParams.serviceId}`,
            images: [
              {
                url: serviceData.meta.ogImage || "/teas-gurus-logo.png",
                width: 1200,
                height: 630,
                alt:
                  serviceData.meta.title ||
                  `${resolvedParams.serviceId} - TEAS Gurus`,
              },
            ],
          },
          alternates: {
            canonical:
              serviceData.meta.canonicalUrl || `/${resolvedParams.serviceId}`,
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: `${resolvedParams.serviceId} - TEAS Gurus`,
    description: `Get help with your ${resolvedParams.serviceId} TEAS exam preparation.`,
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
              <p className="text-red-800 font-medium">Content Not Found</p>
            </div>
            <p className="text-gray-600 mb-4">
              Content not found for this service
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
      {content?.schema && (
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
              {content?.hero?.badge || "TEAS Exam Help"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content?.hero?.title ||
                `${resolvedParams.serviceId} - TEAS Gurus`}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              {content?.hero?.subtitle ||
                `Get expert help with your ${resolvedParams.serviceId} TEAS exam preparation.`}
            </p>
            <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              {content?.hero?.description ||
                "Our experienced tutors are here to help you succeed in your TEAS exam."}
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

      {/* Trust Indicators Section */}
      {content?.trustIndicators && content.trustIndicators.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-4xl mb-4">{indicator.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {indicator.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What to Expect Section */}
      {content?.whatToExpect && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                {content.whatToExpect.badge}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.whatToExpect.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.whatToExpect.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.whatToExpect.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3 text-gray-600"
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {content.whatToExpect.footer && (
              <div className="text-center mt-12">
                <p className="text-lg text-gray-600">
                  {content.whatToExpect.footer}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Most Common Questions Section */}
      {content?.mostCommonQuestions && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                {content.mostCommonQuestions.badge}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.mostCommonQuestions.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.mostCommonQuestions.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.mostCommonQuestions.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3 text-gray-600"
                      >
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Study Guide Section */}
      {content?.studyGuide && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                {content.studyGuide.badge}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.studyGuide.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.studyGuide.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.studyGuide.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-6">{section.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Privacy & Pricing Section */}
      {content?.privacyPricing && content.privacyPricing.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.privacyPricing.map((item, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
                >
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {content?.faq && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {content.faq.title}
              </h2>
              <p className="text-xl text-gray-600">{content.faq.subtitle}</p>
            </div>

            <div className="space-y-8">
              {content.faq.questions.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {faq.question}
                  </h3>
                  <div className="space-y-4">
                    {faq.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    {faq.additionalParagraphs && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {faq.additionalParagraphs.map((paragraph, pIndex) => (
                          <p
                            key={pIndex}
                            className="text-gray-600 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Ace Your TEAS Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get expert help with your {resolvedParams.serviceId} preparation and
            achieve your nursing school dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              href="/prices"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
