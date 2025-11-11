import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import ContactForm from "@/components/ui/ContactForm";
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
    const { getAllPillarPages } = await import("@/lib/firestore-operations");
    
    // Get both regular services and pillar pages
    const [servicesResult, pillarPagesResult] = await Promise.all([
      getAllServices(),
      getAllPillarPages(),
    ]);

    const params: Array<{ serviceId: string }> = [];
    let serviceCount = 0;
    let pillarCount = 0;

    // Add regular services
    if (servicesResult.success && servicesResult.data) {
      servicesResult.data.forEach((serviceId) => {
        params.push({ serviceId });
        serviceCount++;
      });
    }

    // Add pillar pages
    if (pillarPagesResult.success && pillarPagesResult.data) {
      pillarPagesResult.data.forEach((pillarPage: any) => {
        if (pillarPage.id && !params.find((p) => p.serviceId === pillarPage.id)) {
          params.push({ serviceId: pillarPage.id });
          pillarCount++;
        }
      });
    }

    console.log(`✓ Generated ${serviceCount} Service Pages and ${pillarCount} Pillar Pages`);
    return params;
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
    // First check if this is a pillar page
    const { isPillarPage, getPillarPageContent } = await import(
      "@/lib/firestore-operations"
    );
    const isPillar = await isPillarPage(resolvedParams.serviceId);

    if (isPillar) {
      // This is a pillar page - use pillar page metadata
      const pillarResult = await getPillarPageContent(resolvedParams.serviceId);
      if (pillarResult.success && pillarResult.data) {
        const pillarData = pillarResult.data as any;
        if (pillarData.meta) {
          return {
            title:
              pillarData.meta.title ||
              `${resolvedParams.serviceId} - TeasGurus`,
            description: pillarData.meta.description || "",
            keywords: pillarData.meta.keywords || "",
            openGraph: {
              title:
                pillarData.meta.ogTitle ||
                pillarData.meta.title ||
                `${resolvedParams.serviceId} - TeasGurus`,
              description:
                pillarData.meta.ogDescription ||
                pillarData.meta.description ||
                "",
              url:
                pillarData.meta.canonicalUrl ||
                `https://teasgurus.com/${resolvedParams.serviceId}`,
              images: [
                {
                  url: pillarData.meta.ogImage || "/teas-gurus-logo.png",
                  width: 1200,
                  height: 630,
                  alt:
                    pillarData.meta.title ||
                    `${resolvedParams.serviceId} - TeasGurus`,
                },
              ],
            },
            alternates: {
              canonical:
                pillarData.meta.canonicalUrl || `/${resolvedParams.serviceId}`,
            },
          };
        }
      }
    } else {
      // Regular service page
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

// Helper functions for icons
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    check: (
      <svg
        className="w-10 h-10 mx-auto text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    shield: (
      <svg
        className="w-10 h-10 mx-auto text-green-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    star: (
      <svg
        className="w-10 h-10 mx-auto text-yellow-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    "check-circle": (
      <svg
        className="w-10 h-10 mx-auto text-red-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    "currency-dollar": (
      <svg
        className="w-10 h-10 mx-auto text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4" />
        <path d="M12 2v2m0 16v2m-6-6h12" />
      </svg>
    ),
    "credit-card": (
      <svg
        className="w-10 h-10 mx-auto text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    dollar: (
      <svg
        className="w-10 h-10 mx-auto text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4" />
        <path d="M12 2v2m0 16v2m-6-6h12" />
      </svg>
    ),
  };
  return iconMap[iconName] || iconMap.check;
};

export default async function ServicePage({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  // First, check if this is a pillar page
  const { isPillarPage, getPillarPageContent } = await import(
    "@/lib/firestore-operations"
  );
  const isPillar = await isPillarPage(serviceId);

  if (isPillar) {
    // This is a pillar page - render pillar page content
    const pillarResult = await getPillarPageContent(serviceId);
    if (pillarResult.success && pillarResult.data) {
      const pillarContent = pillarResult.data;

      // Render pillar page using the same structure as the deleted [pillarPage]/page.tsx
      return (
        <Layout>
          {/* Schema Script */}
          {(pillarContent as any).schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: (pillarContent as any).schema,
              }}
            />
          )}

          {/* Hero Section */}
          <section className="gradient-bg text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <div className="mb-8">
                <Breadcrumb
                  items={[
                    { label: "Home", href: "/" },
                    { label: serviceId.toUpperCase() },
                  ]}
                  className="text-white"
                />
              </div>

              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  {(pillarContent as any).hero?.badge || "We are Teas Gurus"}
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  {(pillarContent as any).hero?.title ||
                    `${serviceId.toUpperCase()} Services`}
                </h1>
                <div className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                  <ContentRenderer
                    content={
                      (pillarContent as any).hero?.subtitle ||
                      `Comprehensive ${serviceId.toUpperCase()} exam services designed to help you succeed. From full exam taking to targeted practice tests, we have everything you need to achieve your goals.`
                    }
                    textColor="white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    Get Started
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

          {/* Services Grid */}
          {(pillarContent as any).services &&
            (pillarContent as any).services.length > 0 && (
              <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      {(pillarContent as any).servicesHeading ||
                        `Our Comprehensive ${serviceId.toUpperCase()} Services`}
                    </h2>
                    <div className="text-xl text-gray-600 max-w-3xl mx-auto">
                      <ContentRenderer
                        content={
                          (pillarContent as any).servicesSubHeading ||
                          "Choose the service that best fits your learning style and timeline. All services include our proven strategies and expert support."
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {(pillarContent as any).services.map(
                      (service: any, index: number) => {
                        const serviceSlug = service.title
                          .toLowerCase()
                          .includes("math")
                          ? "math"
                          : service.title.toLowerCase().includes("reading")
                          ? "reading"
                          : service.title.toLowerCase().includes("science")
                          ? "science"
                          : service.title.toLowerCase().includes("english")
                          ? "english"
                          : "math";

                        return (
                          <div
                            key={index}
                            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-start space-x-4 mb-6">
                              <div className="text-4xl">{service.icon}</div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                  {service.title}
                                </h3>
                                <div className="text-gray-600 mb-6 leading-relaxed">
                                  <ContentRenderer content={service.description} />
                                </div>
                              </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                              {service.features?.map(
                                (feature: string, featureIndex: number) => (
                                  <li
                                    key={featureIndex}
                                    className="flex items-start text-gray-700"
                                  >
                                    <svg
                                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div className="flex-1">
                                      <ContentRenderer content={feature} />
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>

                            {service.callToAction && (
                              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <div className="text-lg font-semibold text-blue-900">
                                  <ContentRenderer content={service.callToAction} />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                              <Link
                                href={`/${serviceId}/${serviceSlug}`}
                                className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-center"
                              >
                                Learn More
                              </Link>
                              <Link
                                href="/contact"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                              >
                                Get a Quote
                              </Link>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </section>
            )}

          {/* Contact Form Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-600">
                  Contact us today to discuss your {serviceId.toUpperCase()}{" "}
                  exam needs and get personalized support.
                </p>
              </div>
              <ContactForm
                title={`Get Your ${serviceId.toUpperCase()} Support`}
              />
            </div>
          </section>
        </Layout>
      );
    } else {
      // Pillar page not found
      return (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Pillar Page Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The requested pillar page could not be found.
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
  }

  // If not a pillar page, treat it as a TEAS support page (in pages collection)
  let content: ServiceContent | null = null;

  try {
    const result = await getServiceContent(serviceId);

    if (result.success && result.data) {
      content = result.data as ServiceContent;
    } else {
      // Fallback to default content for math/maths
      if (serviceId === "maths" || serviceId === "math") {
        content = mathPageContent;
      }
    }
  } catch (error) {
    console.error("Error loading service content:", error);

    // Fallback to default content for math/maths
    if (serviceId === "maths" || serviceId === "math") {
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
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                {
                  label:
                    serviceId.charAt(0).toUpperCase() +
                    serviceId.slice(1).replace(/-/g, " "),
                },
              ]}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content?.hero?.badge || "TEAS Exam Help"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content?.hero?.title || `${serviceId} - TEAS Gurus`}
            </h1>
            <div className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              <ContentRenderer
                content={content?.hero?.subtitle || ""}
                textColor="white"
              />
            </div>
            <div className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              <ContentRenderer
                content={content?.hero?.description || ""}
                textColor="white"
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
      {content?.trustIndicators && content.trustIndicators.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="mb-4">{getIconComponent(indicator.icon)}</div>
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
              <div className="text-xl text-gray-600 max-w-3xl mx-auto">
                <ContentRenderer
                  content={content.whatToExpect.subtitle || ""}
                />
              </div>
            </div>

            <div
              className={`grid gap-8 ${
                content.whatToExpect.cards.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {content.whatToExpect.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="mb-6">{getIconComponent(card.icon)}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3 text-gray-600"
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <ContentRenderer content={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {content.whatToExpect.footer && (
              <div className="text-center mt-12">
                <div className="text-lg text-gray-600">
                  <ContentRenderer content={content.whatToExpect.footer} />
                </div>
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

            <div
              className={`grid gap-8 ${
                content.mostCommonQuestions.cards.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {content.mostCommonQuestions.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3 text-gray-600"
                      >
                        <span className="text-purple-500 mt-1">•</span>
                        <ContentRenderer content={item} />
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
              <div className="text-xl text-gray-600 max-w-3xl mx-auto">
                <ContentRenderer content={content.studyGuide.subtitle || ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {content.studyGuide.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="mb-6">{getIconComponent(section.icon)}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {section.title}
                  </h3>
                  <div className="text-gray-600 leading-relaxed">
                    <ContentRenderer content={section.content} />
                  </div>
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
            <div
              className={`grid gap-8 ${
                content.privacyPricing.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {content.privacyPricing.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="mb-6">{getIconComponent(item.icon)}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {item.title}
                  </h3>
                  <div className="text-gray-600 leading-relaxed">
                    <ContentRenderer content={item.content} />
                  </div>
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
              <div className="text-xl text-gray-600">
                <ContentRenderer content={content.faq.subtitle || ""} />
              </div>
            </div>

            <div className="space-y-8">
              {content.faq.questions.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {faq.question}
                  </h3>
                  <div className="space-y-4">
                    {faq.paragraphs.map((paragraph, pIndex) => (
                      <div
                        key={pIndex}
                        className="text-gray-600 leading-relaxed"
                      >
                        <ContentRenderer content={paragraph} />
                      </div>
                    ))}
                    {faq.additionalParagraphs && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {faq.additionalParagraphs.map((paragraph, pIndex) => (
                          <div
                            key={pIndex}
                            className="text-gray-600 leading-relaxed"
                          >
                            <ContentRenderer content={paragraph} />
                          </div>
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
            Get expert help with your {serviceId} preparation and achieve your
            nursing school dreams.
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
