import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import { getPillarPageContent, getNursingExitExamSubPages, countSubPageQuestions, countPillarPageQuestions } from "@/lib/firestore-operations";

// Force dynamic rendering to avoid build-time timeouts with Firestore queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Icon components for dashboard-style cards
const LaptopIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const MedalIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

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

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    check: (
      <svg
        className="w-12 h-12 text-green-500"
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
    shield: (
      <svg
        className="w-12 h-12 text-blue-500"
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
    clock: (
      <svg
        className="w-12 h-12 text-purple-500"
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
    ),
    star: (
      <svg
        className="w-12 h-12 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-12 h-12 text-indigo-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    book: (
      <svg
        className="w-12 h-12 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    lightbulb: (
      <svg
        className="w-12 h-12 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    trophy: (
      <svg
        className="w-12 h-12 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  };

  return iconMap[iconName] || iconMap.check;
};

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPillarPageContent("nursing-exit-exam");
  
  if (result.success && result.data) {
    const data = result.data as any;
    if (data.meta) {
      return {
        title: data.meta.title || "Nursing Exit Exam | TeasGurus",
        description: data.meta.description || "",
        keywords: data.meta.keywords || "",
        openGraph: {
          title: data.meta.ogTitle || data.meta.title || "Nursing Exit Exam | TeasGurus",
          description: data.meta.ogDescription || data.meta.description || "",
          url: data.meta.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/nursing-exit-exam`,
          images: [
            {
              url: data.meta.ogImage || "/teas-gurus-logo.png",
              width: 1200,
              height: 630,
              alt: data.meta.title || "Nursing Exit Exam",
            },
          ],
        },
        alternates: {
          canonical: data.meta.canonicalUrl || "/nursing-exit-exam",
        },
      };
    }
  }

  return {
    title: "Nursing Exit Exam | TeasGurus",
    description: "Comprehensive guide to nursing exit exams",
  };
}

export default async function NursingExitExamPage() {
  const result = await getPillarPageContent("nursing-exit-exam");
  const subPagesResult = await getNursingExitExamSubPages();

  // Provide default content structure if not found in Firebase
  const pageData = result.success && result.data ? result.data as any : null;
  const subPages = subPagesResult.success && subPagesResult.data ? subPagesResult.data as any[] : [];
  
  // Fetch question counts for sub-pages
  const subPagesWithCounts = await Promise.all(
    subPages.slice(0, 2).map(async (subPage: any) => {
      const pageSlug = subPage.slug || subPage.id || subPage.subPageId;
      const questionCount = await countSubPageQuestions("nursing-exit-exam", pageSlug);
      return {
        ...subPage,
        questionCount,
      };
    })
  );
  
  // Fetch total question count for the pillar page
  const pillarPageQuestionCount = await countPillarPageQuestions("nursing-exit-exam");
  
  const content: ServiceContent = pageData ? {
    meta: pageData.meta || {
      title: "Nursing Exit Exam | TeasGurus",
      description: "Comprehensive guide to nursing exit exams",
      keywords: "nursing exit exam, nursing school, exam preparation",
      ogTitle: "Nursing Exit Exam | TeasGurus",
      ogDescription: "Comprehensive guide to nursing exit exams",
      ogImage: "/teas-gurus-logo.png",
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/nursing-exit-exam`,
    },
    schema: pageData.schema || "",
    hero: pageData.hero || {
      badge: "We are Teas Gurus",
      title: "Nursing Exit Exam",
      subtitle: "Comprehensive guide to help you succeed in your nursing exit exam.",
      description: "",
    },
    trustIndicators: pageData.trustIndicators || [],
    whatToExpect: pageData.whatToExpect || {
      badge: "",
      title: "",
      subtitle: "",
      cards: [],
      footer: "",
    },
    mostCommonQuestions: pageData.mostCommonQuestions || {
      badge: "",
      title: "",
      subtitle: "",
      cards: [],
    },
    studyGuide: pageData.studyGuide || {
      badge: "",
      title: "",
      subtitle: "",
      sections: [],
    },
    privacyPricing: pageData.privacyPricing || [],
    faq: pageData.faq || {
      title: "",
      subtitle: "",
      questions: [],
    },
  } : {
    meta: {
      title: "Nursing Exit Exam | TeasGurus",
      description: "Comprehensive guide to nursing exit exams",
      keywords: "nursing exit exam, nursing school, exam preparation",
      ogTitle: "Nursing Exit Exam | TeasGurus",
      ogDescription: "Comprehensive guide to nursing exit exams",
      ogImage: "/teas-gurus-logo.png",
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/nursing-exit-exam`,
    },
    schema: "",
    hero: {
      badge: "We are Teas Gurus",
      title: "Nursing Exit Exam",
      subtitle: "Comprehensive guide to help you succeed in your nursing exit exam.",
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
      <section className="bg-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {content.hero.title || "Nursing Exit Exam - TEAS Gurus"}
            </h1>
            <div className="text-gray-600 text-base leading-relaxed">
              <ContentRenderer
                content={content.hero.description || ""}
              />
            </div>
          </div>

          {/* Sub-Pages Cards - Dashboard Style */}
          {subPages.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-4">
                {/* First 2 cards - Dynamic sub-pages */}
                {subPagesWithCounts.map((subPage: any, index: number) => {
                  const pageName = subPage.pageName || subPage.hero?.title || subPage.title || subPage.id;
                  const pageId = subPage.id || subPage.subPageId;
                  
                  // Get dynamic question count
                  const formattedCount = (subPage.questionCount || 0).toLocaleString();
                  
                  // Card configuration based on index
                  const cardConfigs = [
                    {
                      iconBg: "bg-teal-500",
                      iconColor: "text-white",
                      numberColor: "text-teal-600",
                      icon: <LaptopIcon className="w-6 h-6 text-white" />,
                      number: formattedCount,
                      caption: "Total Questions",
                    },
                    {
                      iconBg: "bg-blue-500",
                      iconColor: "text-white",
                      numberColor: "text-blue-600",
                      icon: <LightbulbIcon className="w-6 h-6 text-white" />,
                      number: formattedCount,
                      caption: "Total Questions",
                    },
                  ];
                  
                  const config = cardConfigs[index] || cardConfigs[0];
                  
                  // Get the slug for URL generation - use slug directly (no prefix for subpages)
                  const pageSlug = subPage.slug || pageId;
                  
                  return (
                    <Link
                      key={pageId}
                      href={`/${pageSlug}`}
                      {...({ name: pageName } as any)}
                      className="bg-white rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {pageName}
                          </p>
                          <p className={`text-3xl font-bold ${config.numberColor}`}>
                            {config.number}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {config.caption}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                
                {/* Third card - Always show pillar page name */}
                <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MedalIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {content.hero?.title || "Nursing Exit Exam"}
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {pillarPageQuestionCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Questions Available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators Section */}
      {content.trustIndicators && content.trustIndicators.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-xs"
                >
                  <div className="mb-4 flex justify-center items-center">{getIconComponent(indicator.icon)}</div>
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
      {content.whatToExpect && (
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
                  <div className="mb-6 flex justify-center items-center">{getIconComponent(card.icon)}</div>
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
      {content.mostCommonQuestions && (
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
      {content.studyGuide && (
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

            <div className={`grid grid-cols-1 gap-8 ${
              content.studyGuide.sections.length === 1 
                ? 'md:grid-cols-1' 
                : content.studyGuide.sections.length === 2 
                ? 'md:grid-cols-2' 
                : content.studyGuide.sections.length === 3 
                ? 'md:grid-cols-3' 
                : 'md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {content.studyGuide.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="mb-6 flex justify-center items-center">{getIconComponent(section.icon)}</div>
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
      {content.privacyPricing && content.privacyPricing.length > 0 && (
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
                  <div className="mb-6 flex justify-center items-center">{getIconComponent(item.icon)}</div>
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
      {content.faq && (
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
            Ready to Ace Your Nursing Exit Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get expert help with your nursing exit exam preparation and achieve your
            nursing career goals.
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

