import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import ContactForm from "@/components/ui/ContactForm";
import {
  getAllSupportPages,
  isPillarPage,
  getPillarServicePageContent,
  getAllPillarPages,
  getServiceContent,
} from "@/lib/firestore-operations";
import { notFound } from "next/navigation";

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

interface PageProps {
  params: Promise<{ segments: string[] }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  try {
    const { getAllPillarPages, getAllPillarServicePages } = await import(
      "@/lib/firestore-operations"
    );

    const [supportPagesResult, pillarPagesResult] = await Promise.all([
      getAllSupportPages(),
      getAllPillarPages(),
    ]);

    const params: Array<{ segments: string[] }> = [];
    let supportPageCount = 0;
    let pillarServiceCount = 0;

    // Generate support pages
    if (supportPagesResult.success && supportPagesResult.data) {
      const pages = supportPagesResult.data;
      Object.keys(pages).forEach((serviceId) => {
        const servicePages = pages[serviceId];
        if (servicePages && typeof servicePages === "object") {
          Object.keys(servicePages).forEach((pageId) => {
            // Convert serviceId to segments array
            const serviceIdSegments = serviceId.includes("/")
              ? serviceId.split("/")
              : [serviceId];
            // Combine serviceId segments with pageId
            params.push({ segments: [...serviceIdSegments, pageId] });
            supportPageCount++;
          });
        }
      });
    }

    // Generate pillar service pages (e.g., /nclex/writing)
    if (pillarPagesResult.success && pillarPagesResult.data) {
      for (const pillarPage of pillarPagesResult.data) {
        const pillarServicesResult = await getAllPillarServicePages(
          pillarPage.id
        );
        if (pillarServicesResult.success && pillarServicesResult.data) {
          pillarServicesResult.data.forEach((service: any) => {
            params.push({ segments: [pillarPage.id, service.servicePageId] });
            pillarServiceCount++;
          });
        }
      }
    }

    console.log(
      `✓ Generated ${supportPageCount} Support Pages and ${pillarServiceCount} Pillar Service Pages`
    );
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  // Return some default pages if Firestore is not available during build
  return [
    { segments: ["teas", "math"] },
    { segments: ["teas", "science"] },
    { segments: ["teas", "reading"] },
    { segments: ["teas", "english"] },
  ];
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const segments = resolvedParams.segments;

  if (segments.length < 2) {
    return {
      title: "Page Not Found | TEAS Gurus",
      description: "The requested page could not be found.",
    };
  }

  // Last segment is pageId, all others form serviceId
  const pageId = segments[segments.length - 1];
  const serviceId = segments.slice(0, -1).join("/");

  // First check if serviceId is a pillar page
  const isPillar = await isPillarPage(serviceId);

  if (isPillar) {
    // This is a pillar service page
    try {
      const result = await getPillarServicePageContent(serviceId, pageId);

      if (result.success && result.data) {
        const serviceData = result.data as any;

        if (serviceData.meta) {
          return {
            title:
              serviceData.meta.title || `${pageId} - ${serviceId} | TeasGurus`,
            description: serviceData.meta.description || "",
            keywords: serviceData.meta.keywords || "",
            openGraph: {
              title:
                serviceData.meta.ogTitle ||
                serviceData.meta.title ||
                `${pageId} - ${serviceId}`,
              description:
                serviceData.meta.ogDescription ||
                serviceData.meta.description ||
                "",
              url:
                serviceData.meta.canonicalUrl ||
                `https://teasgurus.com/${serviceId}/${pageId}`,
              images: [
                {
                  url: serviceData.meta.ogImage || "/teas-gurus-logo.png",
                  width: 1200,
                  height: 630,
                  alt: serviceData.meta.title || `${pageId} - ${serviceId}`,
                },
              ],
            },
            alternates: {
              canonical:
                serviceData.meta.canonicalUrl || `/${serviceId}/${pageId}`,
            },
          };
        }
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
    }
  } else {
    // Support page metadata
    try {
      const result = await getAllSupportPages();

      if (result.success && result.data) {
        const pages = result.data;
        const pageData = pages[serviceId]?.[pageId];

        if (pageData) {
          return {
            title: pageData.meta?.title || `${pageId} - TEAS Gurus`,
            description: pageData.meta?.description || "",
            keywords: pageData.meta?.keywords || "",
            openGraph: {
              title:
                pageData.meta?.ogTitle ||
                pageData.meta?.title ||
                `${pageId} - TEAS Gurus`,
              description:
                pageData.meta?.ogDescription ||
                pageData.meta?.description ||
                "",
              url:
                pageData.meta?.canonicalUrl ||
                `https://teasgurus.com/${serviceId}/${pageId}`,
              images: [
                {
                  url: pageData.meta?.ogImage || "/teas-gurus-logo.png",
                  width: 1200,
                  height: 630,
                  alt: pageData.meta?.title || `${pageId} - TEAS Gurus`,
                },
              ],
            },
            alternates: {
              canonical:
                pageData.meta?.canonicalUrl || `/${serviceId}/${pageId}`,
            },
          };
        }
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
    }
  }

  // Fallback metadata
  return {
    title: `${pageId} - ${serviceId} | TEAS Gurus`,
    description: `Get help with your ${pageId} ${serviceId} exam preparation.`,
    alternates: {
      canonical: `/${serviceId}/${pageId}`,
    },
  };
}

export default async function SupportPage({ params }: PageProps) {
  const resolvedParams = await params;
  const segments = resolvedParams.segments;

  if (segments.length < 2) {
    notFound();
  }

  // Last segment is pageId, all others form serviceId
  const pageId = segments[segments.length - 1];
  const serviceId = segments.slice(0, -1).join("/");

  // First, check if serviceId is a pillar page
  const isPillar = await isPillarPage(serviceId);

  if (isPillar) {
    // This is a pillar service page (e.g., /nclex/wrtting)
    // Render with the same structure as regular service pages
    let serviceContent: any = null;

    try {
      const serviceResult = await getPillarServicePageContent(
        serviceId,
        pageId
      );
      if (serviceResult.success && serviceResult.data) {
        serviceContent = serviceResult.data;
      }
    } catch (error) {
      console.error("Error loading pillar service page content:", error);
    }

    if (!serviceContent) {
      notFound();
    }

    // Import the icon component function from the regular service page
    const getIconComponent = (iconName: string) => {
      const iconMap: { [key: string]: React.ReactNode } = {
        check: (
          <svg
            className="w-12 h-12 text-green-500 mx-auto"
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
        ),
        shield: (
          <svg
            className="w-12 h-12 text-blue-500 mx-auto"
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
        ),
        star: (
          <svg
            className="w-12 h-12 text-yellow-500 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
        "check-circle": (
          <svg
            className="w-12 h-12 text-green-500 mx-auto"
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
        ),
      };

      return iconMap[iconName] || iconMap.check;
    };

    // Render with the same structure as regular service pages
    return (
      <Layout>
        {/* Schema Script */}
        {serviceContent?.schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serviceContent.schema }}
          />
        )}

        {/* Hero Section */}
        <section className="gradient-bg text-white py-[1.25rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Breadcrumb
                items={await (async () => {
                  const breadcrumbItems: Array<{
                    label: string;
                    href?: string;
                  }> = [{ label: "Home", href: "/" }];

                  // This is a pillar service page: Home > [PillarPage] > [Service Page]
                  const pillarPageId = serviceId;

                  // Get pillar page name
                  let pillarPageName =
                    pillarPageId.charAt(0).toUpperCase() +
                    pillarPageId.slice(1).replace(/-/g, " ");
                  try {
                    const pillarPagesResult = await getAllPillarPages();
                    if (pillarPagesResult.success && pillarPagesResult.data) {
                      const pillarPage = pillarPagesResult.data.find(
                        (p: any) => p.id === pillarPageId
                      );
                      if (pillarPage?.pageName) {
                        pillarPageName = pillarPage.pageName;
                      }
                    }
                  } catch (error) {
                    console.error("Error loading pillar pages:", error);
                  }

                  breadcrumbItems.push({
                    label: pillarPageName,
                    href: `/${pillarPageId}`,
                  });

                  // Get service page title (just the service name, not including pillar page name)
                  let servicePageTitle =
                    pageId.charAt(0).toUpperCase() +
                    pageId.slice(1).replace(/-/g, " ");
                  if (serviceContent?.hero?.title) {
                    const heroTitle = serviceContent.hero.title;
                    if (
                      heroTitle
                        .toLowerCase()
                        .startsWith(pillarPageName.toLowerCase())
                    ) {
                      servicePageTitle = heroTitle
                        .substring(pillarPageName.length)
                        .trim();
                      servicePageTitle = servicePageTitle.replace(
                        /^[\s\-–—]+/,
                        ""
                      );
                    } else {
                      servicePageTitle = heroTitle;
                    }
                  }

                  breadcrumbItems.push({
                    label: servicePageTitle,
                  });

                  return breadcrumbItems;
                })()}
                className="text-white"
              />
            </div>

            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                {serviceContent?.hero?.badge || "TEAS Exam Help"}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {serviceContent?.hero?.title || `${pageId} - TEAS Gurus`}
              </h1>
              <div className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto leading-relaxed">
                <ContentRenderer
                  content={serviceContent?.hero?.subtitle || ""}
                  textColor="white"
                />
              </div>
              <div className="text-lg mb-4 max-w-4xl mx-auto leading-relaxed opacity-90">
                <ContentRenderer
                  content={serviceContent?.hero?.description || ""}
                  textColor="white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/hesi-a2"
                  className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-[2rem] font-bold hover:bg-yellow-400 transition-colors"
                >
                  Take Test
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        {serviceContent?.trustIndicators &&
          serviceContent.trustIndicators.length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {serviceContent.trustIndicators.map(
                    (indicator: any, index: number) => (
                      <div
                        key={index}
                        className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="mb-4">
                          {getIconComponent(indicator.icon)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {indicator.title}
                        </h3>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

        {/* What to Expect Section */}
        {serviceContent?.whatToExpect && (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                {serviceContent.whatToExpect.badge && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {serviceContent.whatToExpect.badge}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {serviceContent.whatToExpect.title}
                </h2>
                {serviceContent.whatToExpect.subtitle && (
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {serviceContent.whatToExpect.subtitle}
                  </p>
                )}
              </div>

              <div
                className={`grid gap-8 ${
                  serviceContent.whatToExpect.cards.length === 1
                    ? "grid-cols-1"
                    : serviceContent.whatToExpect.cards.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {serviceContent.whatToExpect.cards.map(
                  (card: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="mb-6">{getIconComponent(card.icon)}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {card.title}
                      </h3>
                      <ul className="space-y-3">
                        {card.content.map((item: string, itemIndex: number) => (
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
                  )
                )}
              </div>

              {serviceContent.whatToExpect.footer && (
                <div className="text-center mt-12">
                  <div className="text-lg text-gray-600">
                    <ContentRenderer
                      content={serviceContent.whatToExpect.footer}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Most Common Questions Section */}
        {serviceContent?.mostCommonQuestions && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                {serviceContent.mostCommonQuestions.badge && (
                  <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {serviceContent.mostCommonQuestions.badge}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {serviceContent.mostCommonQuestions.title}
                </h2>
                {serviceContent.mostCommonQuestions.subtitle && (
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {serviceContent.mostCommonQuestions.subtitle}
                  </p>
                )}
              </div>

              <div
                className={`grid gap-8 ${
                  serviceContent.mostCommonQuestions.cards.length === 1
                    ? "grid-cols-1"
                    : serviceContent.mostCommonQuestions.cards.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {serviceContent.mostCommonQuestions.cards.map(
                  (card: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {card.title}
                      </h3>
                      <ul className="space-y-3">
                        {card.content.map((item: string, itemIndex: number) => (
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
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* Study Guide Section */}
        {serviceContent?.studyGuide && (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                {serviceContent.studyGuide.badge && (
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {serviceContent.studyGuide.badge}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {serviceContent.studyGuide.title}
                </h2>
                {serviceContent.studyGuide.subtitle && (
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {serviceContent.studyGuide.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {serviceContent.studyGuide.sections.map(
                  (section: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="mb-6">
                        {getIconComponent(section.icon)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {section.title}
                      </h3>
                      <div className="text-gray-600 leading-relaxed">
                        <ContentRenderer content={section.content} />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* Privacy & Pricing Section */}
        {serviceContent?.privacyPricing &&
          serviceContent.privacyPricing.length > 0 && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`grid gap-8 ${
                    serviceContent.privacyPricing.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 md:grid-cols-2"
                  }`}
                >
                  {serviceContent.privacyPricing.map(
                    (card: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                      >
                        <div className="mb-6">
                          {getIconComponent(card.icon)}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                          {card.title}
                        </h3>
                        <div className="text-gray-600 leading-relaxed">
                          <ContentRenderer content={card.content} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

        {/* FAQ Section */}
        {serviceContent?.faq && serviceContent.faq.questions && (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {serviceContent.faq.title || "Frequently Asked Questions"}
                </h2>
                {serviceContent.faq.subtitle && (
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {serviceContent.faq.subtitle}
                  </p>
                )}
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  {serviceContent.faq.questions.map(
                    (faq: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-8 shadow-lg"
                      >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                          {faq.question}
                        </h3>
                        <div className="space-y-4">
                          {faq.paragraphs.map(
                            (paragraph: string, pIndex: number) => (
                              <div
                                key={pIndex}
                                className="text-gray-600 leading-relaxed"
                              >
                                <ContentRenderer content={paragraph} />
                              </div>
                            )
                          )}
                          {faq.additionalParagraphs && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              {faq.additionalParagraphs.map(
                                (paragraph: string, pIndex: number) => (
                                  <div
                                    key={pIndex}
                                    className="text-gray-600 leading-relaxed"
                                  >
                                    <ContentRenderer content={paragraph} />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Form Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactForm />
          </div>
        </section>
      </Layout>
    );
  }

  // Support page content
  let content: SupportPageContent | null = null;

  try {
    const result = await getAllSupportPages();

    if (result.success && result.data) {
      const pages = result.data;
      const pageData = pages[serviceId]?.[pageId];
      if (pageData) {
        content = pageData as SupportPageContent;
      }
    }
  } catch (error) {
    console.error("Error loading support page content:", error);
  }

  if (!content) {
    notFound();
  }

  return (
    <Layout>
      {/* Schema Script */}
      {content.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: content.schema }}
        />
      )}

      {/* Hero Section */}
      <section className="gradient-bg text-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={await (async () => {
                const breadcrumbItems: Array<{ label: string; href?: string }> =
                  [{ label: "Home", href: "/" }];

                // Check if serviceId is a pillar service (contains "/")
                if (serviceId.includes("/")) {
                  // Pillar service: Home > [PillarPage] > [Service Page] > [Support Page]
                  const [pillarPageId, ...servicePageParts] =
                    serviceId.split("/");
                  const servicePageId = servicePageParts.join("/");

                  // Get pillar page name
                  let pillarPageName =
                    pillarPageId.charAt(0).toUpperCase() +
                    pillarPageId.slice(1).replace(/-/g, " ");
                  try {
                    const pillarPagesResult = await getAllPillarPages();
                    if (pillarPagesResult.success && pillarPagesResult.data) {
                      const pillarPage = pillarPagesResult.data.find(
                        (p: any) => p.id === pillarPageId
                      );
                      if (pillarPage?.pageName) {
                        pillarPageName = pillarPage.pageName;
                      }
                    }
                  } catch (error) {
                    console.error("Error loading pillar pages:", error);
                  }

                  breadcrumbItems.push({
                    label: pillarPageName,
                    href: `/${pillarPageId}`,
                  });

                  // Get service page title (just the service name, not including pillar page name)
                  let servicePageTitle =
                    servicePageId.charAt(0).toUpperCase() +
                    servicePageId.slice(1).replace(/-/g, " ");
                  try {
                    const serviceResult = await getPillarServicePageContent(
                      pillarPageId,
                      servicePageId
                    );
                    if (
                      serviceResult.success &&
                      serviceResult.data?.hero?.title
                    ) {
                      // Use the hero title, but if it contains the pillar page name, extract just the service part
                      const heroTitle = serviceResult.data.hero.title;
                      // Check if title starts with pillar page name and remove it
                      if (
                        heroTitle
                          .toLowerCase()
                          .startsWith(pillarPageName.toLowerCase())
                      ) {
                        // Remove the pillar page name prefix
                        servicePageTitle = heroTitle
                          .substring(pillarPageName.length)
                          .trim();
                        // Remove any leading " - " or similar separators
                        servicePageTitle = servicePageTitle.replace(
                          /^[\s\-–—]+/,
                          ""
                        );
                      } else {
                        servicePageTitle = heroTitle;
                      }
                    }
                  } catch (error) {
                    console.error("Error loading service page:", error);
                  }

                  breadcrumbItems.push({
                    label: servicePageTitle,
                    href: `/${serviceId}`,
                  });
                } else {
                  // TEAS service: Home > [Service Page] > [Support Page]
                  // Get service page title
                  let servicePageTitle =
                    serviceId.charAt(0).toUpperCase() +
                    serviceId.slice(1).replace(/-/g, " ");
                  try {
                    const serviceResult = await getServiceContent(serviceId);
                    if (
                      serviceResult.success &&
                      serviceResult.data?.hero?.title
                    ) {
                      servicePageTitle = serviceResult.data.hero.title;
                    }
                  } catch (error) {
                    console.error("Error loading service page:", error);
                  }

                  breadcrumbItems.push({
                    label: servicePageTitle,
                    href: `/${serviceId}`,
                  });
                }

                // Add support page as last item
                breadcrumbItems.push({
                  label:
                    content?.hero?.title ||
                    pageId.charAt(0).toUpperCase() +
                      pageId.slice(1).replace(/-/g, " "),
                });

                return breadcrumbItems;
              })()}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content?.hero?.badge || "TEAS Exam Help"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {content?.hero?.title || `${pageId} - TEAS Gurus`}
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto leading-relaxed">
              {content?.hero?.subtitle ||
                `Get expert help with your ${pageId} TEAS exam preparation.`}
            </p>
            <div className="text-lg mb-4 max-w-4xl mx-auto leading-relaxed opacity-90">
              <ContentRenderer
                content={
                  content?.hero?.description ||
                  "Our experienced tutors are here to help you succeed in your TEAS exam."
                }
                textColor="white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hesi-a2"
                className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-[2rem] font-bold hover:bg-yellow-400 transition-colors"
              >
                Take Test
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
                <ContentRenderer
                  content={content?.content || ""}
                  className="prose prose-lg max-w-none text-gray-900"
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
                  href="https://buy.stripe.com/4gw5mn0nm0mTfUk3e9?success_url=https://teasgurus.com/teas/thank-you&cancel_url=https://teasgurus.com/teas"
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
