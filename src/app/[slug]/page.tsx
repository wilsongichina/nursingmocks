import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import QuestionCard from "@/components/quiz/QuestionCard";
import {
  getRouteMappingBySlugOnly,
  getPageByContentPath,
  getNursingEntranceExamQuizQuestions,
  getNursingExitExamQuizQuestions,
  getNursingTestBankQuizQuestions,
  getNestedSubPages,
  getNursingExitExamNestedSubPages,
  getNursingTestBankNestedSubPages,
  getNursingTestBankTopics,
  getNursingTestBankQuizzes,
  getNursingEntranceExamQuizzes,
  getNursingExitExamQuizzes,
  getAllQuestionTypes,
  getRouteMappingSlugsByIds,
  countNestedPageQuestions,
  countTopicQuestions,
  countSubPageQuestions,
  countQuizQuestions,
  countExitEntranceQuizQuestions,
} from "@/lib/firestore-operations";

// Icon components for dashboard-style cards
const LaptopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const MedalIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const FlaskIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const ABCIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.5 17.5L6.5 13.5L7.5 17.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15.5H7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12.5V17.5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 12.5H12C12.7 12.5 13.2 13 13.2 13.6C13.2 14.2 12.7 14.7 12 14.7H10.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 14.7H12C12.7 14.7 13.2 15.2 13.2 15.8C13.2 16.4 12.7 16.9 12 16.9H10.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.5C15.7 12.5 15 13.1 15 13.8V16.2C15 16.9 15.7 17.5 16.5 17.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 12.8C18.1 13 18.2 13.3 18.2 13.6"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 17.2C18.1 17 18.2 16.7 18.2 16.4"
    />
  </svg>
);

interface ServiceContent {
  pageName?: string;
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

// Generate static params for all slugs at build time
export async function generateStaticParams() {
  const params: { slug: string }[] = [];

  // Pillar pages are handled by dedicated route files, exclude them from dynamic route
  const pillarPageSlugs = new Set([
    "nursing-entrance-exam",
    "nursing-exit-exam",
    "nursing-test-bank",
  ]);

  try {
    const { getAllRouteMappings } = await import("@/lib/firestore-operations");
    const result = await getAllRouteMappings();

    if (result.success && result.data) {
      // Extract all unique slugs from route mappings
      const slugs = new Set<string>();
      result.data.forEach((mapping: any) => {
        if (mapping.slug && !pillarPageSlugs.has(mapping.slug)) {
          slugs.add(mapping.slug);
        }
      });

      // Add sub-page slugs from categories (but exclude pillar pages)
      try {
        const { sidebarData } = await import("@/lib/data/sidebar-data");
        if (sidebarData?.pillarCategories) {
          Object.values(sidebarData.pillarCategories).forEach(
            (categories: any) => {
              if (Array.isArray(categories)) {
                categories.forEach((category: any) => {
                  if (category.slug && !pillarPageSlugs.has(category.slug)) {
                    slugs.add(category.slug);
                  } else if (category.id && !pillarPageSlugs.has(category.id)) {
                    slugs.add(category.id);
                  } else if (
                    category.servicePageId &&
                    !pillarPageSlugs.has(category.servicePageId)
                  ) {
                    slugs.add(category.servicePageId);
                  }
                });
              }
            }
          );
        }
      } catch (error) {
        console.warn("[Static Generation] Could not load sidebar data:", error);
      }

      params.push(...Array.from(slugs).map((slug) => ({ slug })));
      console.log(
        `[Static Generation] Generated ${params.length} static params for [slug] route (excluded pillar pages)`
      );
    } else {
      console.warn(
        "[Static Generation] No route mappings found, using empty params"
      );
    }
  } catch (error) {
    console.error(
      "[Static Generation] Error generating static params for [slug]:",
      error
    );
  }

  return params;
}

// Enable static generation at build time
export const dynamicParams = false; // Disable dynamic params - all routes must be pre-generated
export const dynamic = "force-static"; // Force static generation
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Pillar pages are handled by dedicated route files, not this dynamic route
  const pillarPageSlugs = [
    "nursing-entrance-exam",
    "nursing-exit-exam",
    "nursing-test-bank",
  ];

  if (pillarPageSlugs.includes(slug)) {
    return {
      title: `${slug} | TeasGurus`,
      description: `Content for ${slug}`,
    };
  }

  const routeMappingResult = await getRouteMappingBySlugOnly(slug);
  if (!routeMappingResult.success || !routeMappingResult.data) {
    return {
      title: `${slug} | TeasGurus`,
      description: `Content for ${slug}`,
    };
  }

  const mapping = routeMappingResult.data as any;
  const contentResult = await getPageByContentPath(mapping.refPath);

  if (contentResult.success && contentResult.data) {
    const data = contentResult.data as any;
    if (data.meta) {
      return {
        title: data.meta.title || `${slug} | TeasGurus`,
        description: data.meta.description || "",
        keywords: data.meta.keywords || "",
        openGraph: {
          title: data.meta.ogTitle || data.meta.title || `${slug} | TeasGurus`,
          description: data.meta.ogDescription || data.meta.description || "",
          url: data.meta.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${slug}`,
          images: [
            {
              url: data.meta.ogImage || "/teas-gurus-logo.png",
              width: 1200,
              height: 630,
              alt: data.meta.title || slug,
            },
          ],
        },
        alternates: {
          canonical: data.meta.canonicalUrl || `/${slug}`,
        },
      };
    }
  }

  return {
    title: `${slug} | TeasGurus`,
    description: `Content for ${slug}`,
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Pillar pages are handled by dedicated route files, not this dynamic route
  const pillarPageSlugs = [
    "nursing-entrance-exam",
    "nursing-exit-exam",
    "nursing-test-bank",
  ];

  if (pillarPageSlugs.includes(slug)) {
    notFound(); // Let Next.js fall back to the dedicated route files
  }

  // Get route mapping
  const routeMappingResult = await getRouteMappingBySlugOnly(slug);
  if (!routeMappingResult.success || !routeMappingResult.data) {
    notFound();
  }

  const mapping = routeMappingResult.data as any;

  // Load content using refPath
  const contentResult = await getPageByContentPath(mapping.refPath);
  if (!contentResult.success || !contentResult.data) {
    notFound();
  }

  const pageData = contentResult.data as any;
  const pageType = mapping.type;
  const pillarId = mapping.pillarId;

  // Handle quiz pages separately
  if (pageType === "quiz") {
    // Load quiz questions
    let questionsResult: any = null;
    if (pillarId === "nursing-entrance-exam") {
      questionsResult = await getNursingEntranceExamQuizQuestions(
        mapping.subPageId!,
        mapping.nestedPageId!,
        mapping.quizId!
      );
    } else if (pillarId === "nursing-exit-exam") {
      questionsResult = await getNursingExitExamQuizQuestions(
        mapping.subPageId!,
        mapping.nestedPageId!,
        mapping.quizId!
      );
    } else if (pillarId === "nursing-test-bank") {
      questionsResult = await getNursingTestBankQuizQuestions(
        mapping.subPageId!,
        mapping.nestedPageId!,
        mapping.topicId!,
        mapping.quizId!
      );
    }

    // Load question types
    const questionTypesResult = await getAllQuestionTypes();
    const questionTypes =
      questionTypesResult.success && questionTypesResult.data
        ? questionTypesResult.data
        : [];

    const getQuestionTypeName = (questionTypeId: number) => {
      if (!questionTypeId) return "Unknown";
      const type = questionTypes.find(
        (t: any) => t.questionTypeId === questionTypeId.toString()
      );
      return type?.questionTypeName || `Type ${questionTypeId}`;
    };

    // Filter questions to only show types 1, 2, 3, and 7
    const allowedQuestionTypes = [1, 2, 3, 7];
    const allQuestions =
      questionsResult && questionsResult.success && questionsResult.data
        ? questionsResult.data
        : [];

    const questions = allQuestions.filter((question: any) => {
      const questionTypeId =
        question.questionTypeId || question.question_type_id;
      return allowedQuestionTypes.includes(questionTypeId);
    });

    return (
      <Layout>
        {/* Schema Script */}
        {pageData.schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: pageData.schema,
            }}
          />
        )}

        {/* Hero Section */}
        <section className="bg-white py-[1.25rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Centered Title */}
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {pageData.hero?.title || pageData.pageName || slug}
              </h1>
            </div>

            {/* Text Above Button */}
            {pageData.hero?.textAboveButton && (
              <div className="mb-6 text-center">
                <p className="text-gray-600 text-base leading-relaxed">
                  {pageData.hero.textAboveButton}
                </p>
              </div>
            )}

            {/* Start Test button */}
            {questions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a
                  href="#quiz-questions"
                  className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-base font-bold hover:bg-yellow-400 transition-colors text-center"
                >
                  Start Test
                </a>
              </div>
            )}

            {/* Text Below Button */}
            {pageData.hero?.textBelowButton && (
              <div className="text-center">
                <div className="text-gray-600 text-base leading-relaxed">
                  <ContentRenderer content={pageData.hero.textBelowButton || ""} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quiz Content */}
        <section id="quiz-questions" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No questions available
                </h3>
                <p className="text-gray-600">
                  Questions for this quiz are not available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {questions.map((question: any, index: number) => {
                  const questionTypeId =
                    question.questionTypeId || question.question_type_id || 1;

                  // Parse options - handle both array and stringified array
                  let options: string[] = [];
                  if (question.options) {
                    if (Array.isArray(question.options)) {
                      options = question.options;
                    } else if (typeof question.options === "string") {
                      try {
                        const parsed = JSON.parse(question.options);
                        options = Array.isArray(parsed) ? parsed : [parsed];
                      } catch {
                        options = [question.options];
                      }
                    }
                  }

                  const correctAnswer = question.correctAnswer || "";

                  // Parse correct answer based on question type
                  let correctAnswers: string[] = [];
                  if (questionTypeId === 2) {
                    try {
                      const parsed =
                        typeof correctAnswer === "string"
                          ? JSON.parse(correctAnswer)
                          : correctAnswer;
                      correctAnswers = Array.isArray(parsed) ? parsed : [];
                    } catch {
                      correctAnswers = [];
                    }
                  } else if (questionTypeId === 7) {
                    correctAnswers = Array.isArray(correctAnswer)
                      ? correctAnswer
                      : [correctAnswer];
                  } else {
                    correctAnswers = [correctAnswer];
                  }

                  return (
                    <QuestionCard
                      key={question.id || index}
                      question={question}
                      index={index}
                      questionTypeId={questionTypeId}
                      options={options}
                      correctAnswers={correctAnswers}
                      questionTypeName={getQuestionTypeName(questionTypeId)}
                      totalQuestions={questions.length}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  // Handle other page types (sub, nested, topic)
  // Load nested pages, topics, or quizzes based on type
  let nestedPages: any[] = [];
  let topics: any[] = [];
  let quizzes: any[] = [];
  let nestedPageSlugMap: Record<string, string> = {};
  let topicSlugMap: Record<string, string> = {};
  let quizSlugMap: Record<string, string> = {};
  let subPageQuestionCount = 0;
  let topicQuestionCount = 0;
  let nestedPageQuestionCount = 0;

  if (pageType === "nested") {
    // Fetch question count for the nested page
    if (pillarId === "nursing-entrance-exam" || pillarId === "nursing-exit-exam") {
      nestedPageQuestionCount = await countNestedPageQuestions(
        pillarId as "nursing-exit-exam" | "nursing-entrance-exam",
        mapping.subPageId!,
        mapping.nestedPageId!
      );
    }
    
    // Load quizzes for nested pages (entrance and exit exams)
    if (pillarId === "nursing-entrance-exam") {
      const quizzesResult = await getNursingEntranceExamQuizzes(
        mapping.subPageId!,
        mapping.nestedPageId!
      );
      if (quizzesResult.success && quizzesResult.data) {
        quizzes = quizzesResult.data;
        // Get route mapping slugs for quizzes
        const quizIds = quizzes.map((q: any) => q.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "quiz",
          ids: quizIds,
          subPageId: mapping.subPageId,
          nestedPageId: mapping.nestedPageId,
        });
        if (slugMapResult.success) {
          quizSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for quizzes
        quizzes = await Promise.all(
          quizzes.map(async (quiz: any) => {
            const quizSlug = quiz.slug || quiz.id;
            const questionCount = await countExitEntranceQuizQuestions(
              pillarId as "nursing-entrance-exam",
              mapping.subPageId!,
              mapping.nestedPageId!,
              quizSlug
            );
            return {
              ...quiz,
              questionCount,
            };
          })
        );
      }
    } else if (pillarId === "nursing-exit-exam") {
      const quizzesResult = await getNursingExitExamQuizzes(
        mapping.subPageId!,
        mapping.nestedPageId!
      );
      if (quizzesResult.success && quizzesResult.data) {
        quizzes = quizzesResult.data;
        // Get route mapping slugs for quizzes
        const quizIds = quizzes.map((q: any) => q.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "quiz",
          ids: quizIds,
          subPageId: mapping.subPageId,
          nestedPageId: mapping.nestedPageId,
        });
        if (slugMapResult.success) {
          quizSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for quizzes
        quizzes = await Promise.all(
          quizzes.map(async (quiz: any) => {
            const quizSlug = quiz.slug || quiz.id;
            const questionCount = await countExitEntranceQuizQuestions(
              pillarId as "nursing-exit-exam",
              mapping.subPageId!,
              mapping.nestedPageId!,
              quizSlug
            );
            return {
              ...quiz,
              questionCount,
            };
          })
        );
      }
    } else if (pillarId === "nursing-test-bank") {
      // Fetch question count for the nested page (sum of all topics)
      let totalNestedCount = 0;
      const topicsResult = await getNursingTestBankTopics(
        mapping.subPageId!,
        mapping.nestedPageId!
      );
      if (topicsResult.success && topicsResult.data) {
        for (const topic of topicsResult.data) {
          const topicSlug = topic.slug || topic.id;
          const count = await countTopicQuestions(
            mapping.subPageId!,
            mapping.nestedPageId!,
            topicSlug
          );
          totalNestedCount += count;
        }
        nestedPageQuestionCount = totalNestedCount;
      }
      
      // Load topics for test bank nested pages
      if (topicsResult.success && topicsResult.data) {
        topics = topicsResult.data;
        // Get route mapping slugs for topics
        const topicIds = topics.map((t: any) => t.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "topic",
          ids: topicIds,
          subPageId: mapping.subPageId,
          nestedPageId: mapping.nestedPageId,
        });
        if (slugMapResult.success) {
          topicSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for topics
        topics = await Promise.all(
          topics.map(async (topic: any) => {
            const topicSlug = topic.slug || topic.id;
            const questionCount = await countTopicQuestions(
              mapping.subPageId!,
              mapping.nestedPageId!,
              topicSlug
            );
            return {
              ...topic,
              questionCount,
            };
          })
        );
      }
    }
  } else if (pageType === "topic" && pillarId === "nursing-test-bank") {
    // Fetch question count for the topic
    topicQuestionCount = await countTopicQuestions(
      mapping.subPageId!,
      mapping.nestedPageId!,
      mapping.topicId!
    );
    
    // Load quizzes for test bank topic pages
    const quizzesResult = await getNursingTestBankQuizzes(
      mapping.subPageId!,
      mapping.nestedPageId!,
      mapping.topicId!
    );
    if (quizzesResult.success && quizzesResult.data) {
      quizzes = quizzesResult.data;
      // Get route mapping slugs for quizzes
      const quizIds = quizzes.map((q: any) => q.id);
      const slugMapResult = await getRouteMappingSlugsByIds({
        pillarId,
        type: "quiz",
        ids: quizIds,
        subPageId: mapping.subPageId,
        nestedPageId: mapping.nestedPageId,
        topicId: mapping.topicId,
      });
      if (slugMapResult.success) {
        quizSlugMap = slugMapResult.slugMap;
      }
      // Fetch question counts for quizzes
      quizzes = await Promise.all(
        quizzes.map(async (quiz: any) => {
          const quizSlug = quiz.slug || quiz.id;
          const questionCount = await countQuizQuestions(
            mapping.subPageId!,
            mapping.nestedPageId!,
            mapping.topicId!,
            quizSlug
          );
          return {
            ...quiz,
            questionCount,
          };
        })
      );
    }
  } else if (pageType === "sub") {
    // Fetch question count for the sub-page
    subPageQuestionCount = await countSubPageQuestions(
      pillarId,
      mapping.subPageId!
    );
    
    // Load nested sub-pages
    if (pillarId === "nursing-entrance-exam") {
      const nestedResult = await getNestedSubPages(mapping.subPageId!);
      if (nestedResult.success && nestedResult.data) {
        nestedPages = nestedResult.data;
        // Get route mapping slugs for nested pages
        const nestedIds = nestedPages.map((n: any) => n.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "nested",
          ids: nestedIds,
          subPageId: mapping.subPageId,
        });
        if (slugMapResult.success) {
          nestedPageSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for nested pages
        nestedPages = await Promise.all(
          nestedPages.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            const questionCount = await countNestedPageQuestions(
              pillarId as "nursing-entrance-exam",
              mapping.subPageId!,
              nestedPageSlug
            );
            return {
              ...nestedPage,
              questionCount,
            };
          })
        );
      }
    } else if (pillarId === "nursing-exit-exam") {
      const nestedResult = await getNursingExitExamNestedSubPages(
        mapping.subPageId!
      );
      if (nestedResult.success && nestedResult.data) {
        nestedPages = nestedResult.data;
        // Get route mapping slugs for nested pages
        const nestedIds = nestedPages.map((n: any) => n.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "nested",
          ids: nestedIds,
          subPageId: mapping.subPageId,
        });
        if (slugMapResult.success) {
          nestedPageSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for nested pages
        nestedPages = await Promise.all(
          nestedPages.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            const questionCount = await countNestedPageQuestions(
              pillarId as "nursing-exit-exam",
              mapping.subPageId!,
              nestedPageSlug
            );
            return {
              ...nestedPage,
              questionCount,
            };
          })
        );
      }
    } else if (pillarId === "nursing-test-bank") {
      const nestedResult = await getNursingTestBankNestedSubPages(
        mapping.subPageId!
      );
      if (nestedResult.success && nestedResult.data) {
        nestedPages = nestedResult.data;
        // Get route mapping slugs for nested pages
        const nestedIds = nestedPages.map((n: any) => n.id);
        const slugMapResult = await getRouteMappingSlugsByIds({
          pillarId,
          type: "nested",
          ids: nestedIds,
          subPageId: mapping.subPageId,
        });
        if (slugMapResult.success) {
          nestedPageSlugMap = slugMapResult.slugMap;
        }
        // Fetch question counts for nested pages (test bank nested pages have topics, so count through topics)
        nestedPages = await Promise.all(
          nestedPages.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            // For test bank, we need to count questions through topics
            // Get all topics for this nested page
            const topicsResult = await getNursingTestBankTopics(
              mapping.subPageId!,
              nestedPageSlug
            );
            let totalCount = 0;
            if (topicsResult.success && topicsResult.data) {
              for (const topic of topicsResult.data) {
                const topicSlug = topic.slug || topic.id;
                const count = await countTopicQuestions(
                  mapping.subPageId!,
                  nestedPageSlug,
                  topicSlug
                );
                totalCount += count;
              }
            }
            return {
              ...nestedPage,
              questionCount: totalCount,
            };
          })
        );
      }
    }
  }

  // Prepare content structure
  const content: ServiceContent = {
    pageName: pageData.pageName || slug,
    meta: pageData.meta || {
      title: `${slug} | TeasGurus`,
      description: `Content for ${slug}`,
      keywords: `${slug}`,
      ogTitle: `${slug} | TeasGurus`,
      ogDescription: `Content for ${slug}`,
      ogImage: "/teas-gurus-logo.png",
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/${slug}`,
    },
    schema: pageData.schema || "",
    hero: pageData.hero || {
      badge: "",
      title: pageData.pageName || slug,
      subtitle: "",
      description: pageData.content || "",
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
  };

  // Helper function to get card icon and colors
  const getCardIcon = (name: string, index: number) => {
    const nameLower = name.toLowerCase();
    const colorVariants = [
      { iconBg: "bg-purple-500", numberColor: "text-purple-600" },
      { iconBg: "bg-blue-500", numberColor: "text-blue-600" },
      { iconBg: "bg-orange-500", numberColor: "text-orange-600" },
      { iconBg: "bg-green-500", numberColor: "text-green-600" },
      { iconBg: "bg-teal-500", numberColor: "text-teal-600" },
      { iconBg: "bg-indigo-500", numberColor: "text-indigo-600" },
      { iconBg: "bg-pink-500", numberColor: "text-pink-600" },
      { iconBg: "bg-cyan-500", numberColor: "text-cyan-600" },
    ];

    if (nameLower.includes("reading")) {
      return {
        icon: <BookIcon className="w-6 h-6 text-white" />,
        iconBg: "bg-purple-500",
        numberColor: "text-purple-600",
      };
    } else if (nameLower.includes("math")) {
      return {
        icon: <CalculatorIcon className="w-6 h-6 text-white" />,
        iconBg: "bg-blue-500",
        numberColor: "text-blue-600",
      };
    } else if (nameLower.includes("science")) {
      return {
        icon: <FlaskIcon className="w-6 h-6 text-white" />,
        iconBg: "bg-orange-500",
        numberColor: "text-orange-600",
      };
    } else if (nameLower.includes("english")) {
      return {
        icon: <ABCIcon className="w-6 h-6 text-white" />,
        iconBg: "bg-green-500",
        numberColor: "text-green-600",
      };
    }
    const colorVariant = colorVariants[index % colorVariants.length];
    return {
      icon: <LaptopIcon className="w-6 h-6 text-white" />,
      iconBg: colorVariant.iconBg,
      numberColor: colorVariant.numberColor,
    };
  };

  // Render content page (sub, nested, or topic)
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
              {content.hero.title || content.pageName || slug}
            </h1>
            <div className="text-gray-600 text-base leading-relaxed">
              <ContentRenderer
                content={content.hero.description || pageData.content || ""}
              />
            </div>
          </div>

          {/* Quiz Cards (for topic pages - show first) */}
          {pageType === "topic" &&
            pillarId === "nursing-test-bank" && (
              <div id="quiz-cards" className="mt-6 mb-8">
                <div className="flex flex-wrap justify-center gap-4">
                  {quizzes.map((quiz: any, index: number) => {
                    // Use route mapping slug if available, otherwise fall back to document slug or id
                    const quizSlug =
                      quizSlugMap[quiz.id] || quiz.slug || quiz.id;
                    const quizName =
                      quiz.pageName ||
                      quiz.hero?.title ||
                      quiz.title ||
                      quiz.quizName ||
                      quiz.id;
                    const config = getCardIcon(quizName, index);
                    const questionCount = (quiz.questionCount || 0).toLocaleString();

                    return (
                      <Link
                        key={quiz.id}
                        href={`/${quizSlug}`}
                        {...({ name: quizName } as any)}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm block"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {quizName}
                            </p>
                            <p
                              className={`text-3xl font-bold ${config.numberColor}`}
                            >
                              {questionCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Questions Available
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
                  
                  {/* Page question count card (for topic pages) */}
                  {pageType === "topic" && (
                    <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MedalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {content.pageName || content.hero.title || slug}
                          </p>
                          <p className="text-3xl font-bold text-orange-600">
                            {topicQuestionCount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Questions Available
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Start Test Button (for topic pages with quizzes) */}
          {pageType === "topic" &&
            pillarId === "nursing-test-bank" &&
            quizzes.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a
                  href={`/${
                    quizSlugMap[quizzes[0]?.id] ||
                    quizzes[0]?.slug ||
                    quizzes[0]?.id
                  }`}
                  className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-[2rem] font-bold hover:bg-yellow-400 transition-colors text-center"
                >
                  Start Test
                </a>
              </div>
            )}

          {/* Nested Sub-Pages Cards */}
          {nestedPages.length > 0 && (
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                {nestedPages.map((nestedPage: any, index: number) => {
                  // Use route mapping slug if available, otherwise fall back to document slug or id
                  const nestedSlug =
                    nestedPageSlugMap[nestedPage.id] ||
                    nestedPage.slug ||
                    nestedPage.id;
                  const pageName =
                    nestedPage.pageName ||
                    nestedPage.hero?.title ||
                    nestedPage.id;
                  const config = getCardIcon(pageName, index);
                  const questionCount = (nestedPage.questionCount || 0).toLocaleString();

                  return (
                    <Link
                      key={nestedPage.id}
                      href={`/${nestedSlug}`}
                      {...({ name: pageName } as any)}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm block"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {pageName}
                          </p>
                          <p
                            className={`text-3xl font-bold ${config.numberColor}`}
                          >
                            {questionCount}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Questions Available
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

                {/* Third card - Always show sub-page name */}
                {nestedPages.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MedalIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {content.pageName || content.hero.title || slug}
                        </p>
                        <p className="text-3xl font-bold text-orange-600">
                          {subPageQuestionCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Questions Available
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Topics Cards (for test bank nested pages) */}
          {topics.length > 0 && (
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                {topics.map((topic: any, index: number) => {
                  // Use route mapping slug if available, otherwise fall back to document slug or id
                  const topicSlug =
                    topicSlugMap[topic.id] || topic.slug || topic.id;
                  const topicName =
                    topic.pageName || topic.hero?.title || topic.id;
                  const config = getCardIcon(topicName, index);
                  const questionCount = (topic.questionCount || 0).toLocaleString();

                  return (
                    <Link
                      key={topic.id}
                      href={`/${topicSlug}`}
                      {...({ name: topicName } as any)}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm block"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {topicName}
                          </p>
                          <p
                            className={`text-3xl font-bold ${config.numberColor}`}
                          >
                            {questionCount}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Questions Available
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
                
                {/* Page question count card (for nested pages) */}
                {pageType === "nested" && (
                  <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MedalIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {content.pageName || content.hero.title || slug}
                        </p>
                        <p className="text-3xl font-bold text-orange-600">
                          {nestedPageQuestionCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Questions Available
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quiz Cards (for nested pages only - topic pages handled above) */}
          {quizzes.length > 0 &&
            !(pageType === "topic" && pillarId === "nursing-test-bank") && (
              <div id="quiz-cards" className="mt-6 mb-8">
                <div className="flex flex-wrap justify-center gap-4">
                  {quizzes.map((quiz: any, index: number) => {
                    // Use route mapping slug if available, otherwise fall back to document slug or id
                    const quizSlug =
                      quizSlugMap[quiz.id] || quiz.slug || quiz.id;
                    const quizName =
                      quiz.pageName ||
                      quiz.hero?.title ||
                      quiz.title ||
                      quiz.quizName ||
                      quiz.id;
                    const config = getCardIcon(quizName, index);
                    const questionCount = (quiz.questionCount || 0).toLocaleString();

                    return (
                      <Link
                        key={quiz.id}
                        href={`/${quizSlug}`}
                        {...({ name: quizName } as any)}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm block"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {quizName}
                            </p>
                            <p
                              className={`text-3xl font-bold ${config.numberColor}`}
                            >
                              {questionCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Questions Available
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
                  
                  {/* Page question count card (for nested pages) */}
                  {pageType === "nested" && (
                    <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MedalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {content.pageName || content.hero.title || slug}
                          </p>
                          <p className="text-3xl font-bold text-orange-600">
                            {nestedPageQuestionCount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Questions Available
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="mb-4 flex justify-center items-center">
                    {getIconComponent(indicator.icon)}
                  </div>
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
                  <div className="mb-6 flex justify-center items-center">
                    {getIconComponent(card.icon)}
                  </div>
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
                  <div className="mb-6 flex justify-center items-center">
                    {getIconComponent(section.icon)}
                  </div>
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
                  <div className="mb-6 flex justify-center items-center">
                    {getIconComponent(item.icon)}
                  </div>
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
            Ready to Ace Your Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get expert help with your exam preparation and achieve your goals.
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
