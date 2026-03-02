import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizCTACard from "@/components/quiz/QuizCTACard";
import FAQAccordion from "@/components/ui/FAQAccordion";
import KbArticleViewer from "@/components/knowledge-base/KbArticleViewer";
import { getSiteUrl, getImageUrl } from "@/lib/config";
import {
  getRouteMappingBySlugOnly,
  getPageByContentPath,
  getKbArticleBySlug,
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
  getRouteMappingById,
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

const _MedalIcon = ({ className }: { className?: string }) => (
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

const _getIconComponent = (iconName: string) => {
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
          url:
            data.meta.canonicalUrl ||
            `${getSiteUrl()}/${slug}`,
          images: [
            {
              url: data.meta.ogImage ? getImageUrl(data.meta.ogImage) : getImageUrl("/teas-gurus-logo.png"),
              width: 1200,
              height: 630,
              alt: data.meta.title || slug,
            },
          ],
        },
        alternates: {
          canonical: data.meta.canonicalUrl || `${getSiteUrl()}/${slug}`,
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
  
  // If no route mapping found, try to find KB article directly by slug
  if (!routeMappingResult.success || !routeMappingResult.data) {
    // Fallback: Check if it's a KB article by searching knowledgeBase collection
    const kbArticleResult = await getKbArticleBySlug(slug);
    
    if (kbArticleResult.success && kbArticleResult.data) {
      const pageData = kbArticleResult.data;
      const pillarId = (pageData as any).pillarId || "nursing-entrance-exam";
      
      return (
        <Layout showSidebar={true}>
          <KbArticleViewer article={pageData} pillarId={pillarId} />
        </Layout>
      );
    }
    
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

  // Handle knowledge base articles
  if (mapping.refPath && mapping.refPath.startsWith("knowledgeBase/")) {
    return (
      <Layout showSidebar={true}>
        <KbArticleViewer article={pageData} pillarId={pillarId} />
      </Layout>
    );
  }

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

    const filteredQuestions = allQuestions.filter((question: any) => {
      const questionTypeId =
        question.questionTypeId || question.question_type_id;
      return allowedQuestionTypes.includes(questionTypeId);
    });

    // Only show the last 10 questions
    const questions = filteredQuestions.slice(-10);

    // Get nested page slug for back button
    let nestedPageSlug = "";
    if (mapping.nestedPageId) {
      const nestedPageMappingResult = await getRouteMappingById({
        pillarId,
        type: "nested",
        id: mapping.nestedPageId,
        subPageId: mapping.subPageId,
      });
      if (nestedPageMappingResult.success && nestedPageMappingResult.data) {
        const nestedPageData = nestedPageMappingResult.data as any;
        nestedPageSlug = nestedPageData.slug || "";
      }
    }

    // Load related quizzes from the same parent
    let relatedQuizzes: any[] = [];
    let quizSlugMap: Record<string, string> = {};

    if (pillarId === "nursing-entrance-exam" && mapping.nestedPageId) {
      const quizzesResult = await getNursingEntranceExamQuizzes(
        mapping.subPageId!,
        mapping.nestedPageId
      );
      if (quizzesResult.success && quizzesResult.data) {
        relatedQuizzes = quizzesResult.data.filter(
          (quiz: any) => quiz.id !== mapping.quizId
        );
        // Get slug mappings for related quizzes
        const quizIds = relatedQuizzes.map((q: any) => q.id);
        if (quizIds.length > 0) {
          const slugMappingResult = await getRouteMappingSlugsByIds({
            pillarId,
            type: "quiz",
            ids: quizIds,
            subPageId: mapping.subPageId,
            nestedPageId: mapping.nestedPageId,
          });
          if (slugMappingResult.success && slugMappingResult.slugMap) {
            quizSlugMap = slugMappingResult.slugMap;
          }
        }
      }
    } else if (pillarId === "nursing-exit-exam" && mapping.nestedPageId) {
      const quizzesResult = await getNursingExitExamQuizzes(
        mapping.subPageId!,
        mapping.nestedPageId
      );
      if (quizzesResult.success && quizzesResult.data) {
        relatedQuizzes = quizzesResult.data.filter(
          (quiz: any) => quiz.id !== mapping.quizId
        );
        // Get slug mappings for related quizzes
        const quizIds = relatedQuizzes.map((q: any) => q.id);
        if (quizIds.length > 0) {
          const slugMappingResult = await getRouteMappingSlugsByIds({
            pillarId,
            type: "quiz",
            ids: quizIds,
            subPageId: mapping.subPageId,
            nestedPageId: mapping.nestedPageId,
          });
          if (slugMappingResult.success && slugMappingResult.slugMap) {
            quizSlugMap = slugMappingResult.slugMap;
          }
        }
      }
    } else if (pillarId === "nursing-test-bank" && mapping.topicId) {
      const quizzesResult = await getNursingTestBankQuizzes(
        mapping.subPageId!,
        mapping.nestedPageId!,
        mapping.topicId
      );
      if (quizzesResult.success && quizzesResult.data) {
        relatedQuizzes = quizzesResult.data.filter(
          (quiz: any) => quiz.id !== mapping.quizId
        );
        // Get slug mappings for related quizzes
        const quizIds = relatedQuizzes.map((q: any) => q.id);
        if (quizIds.length > 0) {
          const slugMappingResult = await getRouteMappingSlugsByIds({
            pillarId,
            type: "quiz",
            ids: quizIds,
            subPageId: mapping.subPageId,
            nestedPageId: mapping.nestedPageId,
            topicId: mapping.topicId,
          });
          if (slugMappingResult.success && slugMappingResult.slugMap) {
            quizSlugMap = slugMappingResult.slugMap;
          }
        }
      }
    }

    // Limit to 12 related quizzes
    relatedQuizzes = relatedQuizzes.slice(0, 12);

    // Helper function to get card icon and colors (same as used in header)
    const _getCardIcon = (name: string, index: number) => {
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
        <section className="mb-7">
          <div className="px-5 py-6 md:px-5 md:py-10 sm:px-[14px] sm:py-[18px]">
            {/* Back Link */}
            {nestedPageSlug && (
              <a
                href={`/${nestedPageSlug}`}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#4f46e5] no-underline mb-3 hover:underline"
              >
                <span className="text-base">←</span>
                <span>Back to ATI TEAS English Questions</span>
              </a>
            )}

            {/* Hero Card */}
            <div className="relative flex flex-col lg:flex-row items-stretch gap-5 lg:gap-5.5 p-6 md:p-7 lg:p-6 rounded-[26px] md:rounded-[20px] border border-[rgba(226,229,249,0.9)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-gradient-to-br from-[#f5f1ff] to-[#e5efff] overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(106,92,255,0.22),transparent_60%)] -top-20 -right-10 pointer-events-none" />
              <div className="absolute w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.2),transparent_60%)] -bottom-20 right-[60px] pointer-events-none" />

              {/* Main Content */}
              <div className="relative z-10 flex-1 min-w-0 lg:flex-[1_1_60%]">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(106,92,255,0.12)] text-[#4338ca] text-[11px] font-semibold tracking-[0.12em] uppercase mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>ATI TEAS ENGLISH · QUESTION SET</span>
                </div>

                <h1 className="mt-0 mb-2.5 text-[32px] md:text-[26px] lg:text-[24px] font-extrabold tracking-[-0.03em] text-[#0f172a]">
                  Master <span className="text-[#4f46e5]">ATI TEAS English</span> Question Set 1
                </h1>

                <p className="text-[15px] text-[#7a819c] max-w-[620px] my-0 mb-3.5 leading-relaxed">
                  Practice TEAS-style English questions that strengthen punctuation, capitalization,
                  sentence clarity, and grammar. Explanations stay blurred until you reveal them, so you
                  can test yourself first and review like an instructor later.
                </p>

                <div className="flex flex-wrap gap-2 mb-3.5">
                  <div className="px-3 py-1.5 rounded-full bg-white/96 border border-[rgba(219,222,247,0.9)] text-xs text-[#a0a5bf] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(106,92,255,0.85)]" />
                    <span>{questions.length} TEAS-style English questions</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/96 border border-[rgba(219,222,247,0.9)] text-xs text-[#a0a5bf] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(106,92,255,0.85)]" />
                    <span>Single-select multiple choice</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/96 border border-[rgba(219,222,247,0.9)] text-xs text-[#a0a5bf] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(106,92,255,0.85)]" />
                    <span>Review & exam-style practice</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center mb-2">
                  <a
                    href="#questions-start"
                    className="inline-flex items-center justify-center gap-1.5 px-5.5 py-2.75 rounded-full border-none text-sm font-semibold text-white bg-gradient-to-br from-[#6a5cff] to-[#4f46e5] no-underline shadow-[0_12px_26px_rgba(80,72,220,0.55)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(80,72,220,0.6)] whitespace-nowrap"
                  >
                    <span>Start English Set 1</span>
                    <span>›</span>
                  </a>
                  <a
                    href="#"
                    className="text-[13px] text-black no-underline inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Browse all English sets</span>
                    <span className="text-[15px]">↗</span>
                  </a>
                </div>

                <div className="text-xs text-[#a0a5bf] mb-2">
                  No sign-up required to start. Create a free NursingMocks account to save your progress and unlock more sets.
                </div>

                <div className="flex flex-wrap gap-2.5 mt-1 text-[11px] text-[#a0a5bf]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.25 rounded-full bg-white/95 border border-dashed border-[rgba(210,213,247,0.9)]">
                    <span className="text-[13px]">⭐</span>
                    <span>4.8/5 average student rating</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.25 rounded-full bg-white/95 border border-dashed border-[rgba(210,213,247,0.9)]">
                    <span className="text-[13px]">👩‍⚕️</span>
                    <span>Used by thousands of aspiring nurses</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.25 rounded-full bg-white/95 border border-dashed border-[rgba(210,213,247,0.9)]">
                    <span className="text-[13px]">📈</span>
                    <span>Designed around ATI TEAS 7 English skills</span>
                  </div>
                </div>
              </div>

              {/* Set Overview Card */}
              <aside className="relative z-10 w-full lg:w-auto lg:flex-[0_0_38%] lg:max-w-[38%] sm:max-w-[420px] sm:mx-auto sm:mt-1">
                <div className="max-w-[420px] w-full bg-white rounded-[22px] p-4 pb-[18px] shadow-[0_16px_40px_rgba(15,23,42,0.16)] border border-[rgba(148,163,184,0.45)]">
                  <div className="mb-3">
                    <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#4b5563] mb-1">
                      Set overview
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      Student view
                    </div>
                  </div>

                  <div className="space-y-2.5 text-[13px] text-[#4b5563] leading-relaxed">
                    <p>
                      {questions.length} TEAS-style English questions focused on ATI TEAS 7 exam skills.
                    </p>
                    <p>
                      Targets punctuation, capitalization, sentence structure, and usage.
                    </p>
                    <p>
                      Correct answers and full explanations stay blurred until you click Show.
                    </p>
                    <p>
                      Perfect warm-up before taking a full-length ATI TEAS English practice test.
                    </p>
                    <p className="pt-1 border-t border-[#e5e7eb]">
                      <strong className="text-[#4b5563]">Tip:</strong> Answer each question on your own first, then reveal the explanation and note why the correct option works.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Progress / Info Bar */}
        {questions.length > 0 && (
          <section className="mt-4.5 mb-3.5 py-2.5 rounded-2xl bg-white/96 border border-dashed border-[rgba(206,210,244,0.95)] flex flex-wrap items-center justify-between gap-2.5 px-5 sm:px-[14px]">
            <div className="text-[13px] text-[#7a819c] flex items-center gap-2">
              <span>Set 1 · {questions.length} Questions</span>
              <span className="px-2.5 py-1 rounded-full bg-[#eef0ff] border border-[rgba(187,192,234,0.9)] text-[11px] text-[#a0a5bf]">
                Practice at your own pace
              </span>
            </div>
            <div className="relative flex-1 min-w-[140px] h-2 rounded-full bg-[#e5e7f5] overflow-hidden">
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full bg-gradient-to-r from-[#6a5cff] to-[#22c55e]"
                style={{ width: "18%" }}
              />
            </div>
            <div className="text-[11px] text-[#a0a5bf] min-w-[120px] text-right">
              Example: 7 / {questions.length} questions completed · Upgrade your account later to track real progress.
            </div>
          </section>
        )}

        {/* Questions */}
        <main id="questions-start" className="mt-2.5 px-5 sm:px-[14px]">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
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
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No questions available
              </h3>
              <p className="text-slate-600">
                Questions for this quiz are not available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4.5">
              {questions.map((question: any, index: number) => {
                const questionTypeId =
                  question.questionTypeId || question.question_type_id || 1;

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
                  <div key={question.id || index}>
                    <QuestionCard
                      question={question}
                      index={index}
                      questionTypeId={questionTypeId}
                      options={options}
                      correctAnswers={correctAnswers}
                      questionTypeName={getQuestionTypeName(questionTypeId)}
                      totalQuestions={questions.length}
                    />
                    {/* CTA Band after question 2 */}
                    {index === 1 && questions.length > 2 && <QuizCTACard />}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Related Sets Section */}
        {relatedQuizzes.length > 0 && (
          <section className="mt-6 py-4.5 rounded-[20px] bg-white border border-[#e0e3f5] shadow-[0_10px_30px_rgba(15,23,42,0.06)] px-5 sm:px-[14px]">
            <div className="flex justify-between items-center gap-2.5 mb-2">
              <div className="text-[15px] font-bold">Next ATI TEAS English Question Sets</div>
              <span className="px-2.25 py-0.75 rounded-full bg-[#f3f4ff] border border-dashed border-[rgba(177,181,233,0.9)] text-[11px] text-[#4f46e5]">
                Keep building English mastery
              </span>
            </div>
            <p className="text-[13px] text-[#7a819c] mb-3">
              When you finish Set 1, continue your practice with more TEAS-style English sets and focused skill drills.
              Each set builds on what you just practiced so you can walk into test day confident.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {relatedQuizzes.slice(0, 3).map((quiz: any, index: number) => {
                const quizSlug = quizSlugMap[quiz.id] || quiz.slug || quiz.id;
                const quizName =
                  quiz.pageName || quiz.title || quiz.quizName || quiz.id;
                const questionCount = (quiz.questionCount || 0).toLocaleString();

                return (
                  <article
                    key={quiz.id}
                    className="rounded-[14px] p-2.25 bg-[#f8f7ff] border border-dashed border-[rgba(190,195,239,0.9)] text-xs flex flex-col gap-1"
                  >
                    <div className="font-medium text-[#202437]">{quizName}</div>
                    <div className="text-[11px] text-[#a0a5bf]">{questionCount} questions · Mixed grammar & clarity</div>
                    <Link
                      href={`/${quizSlug}`}
                      className="mt-1 text-[11px] text-[#4f46e5] no-underline hover:underline"
                    >
                      Open Set {index + 2} →
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-0.5 pt-2 border-t border-dashed border-[rgba(215,218,245,0.9)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a0a5bf]">
              <span>Want to follow a full English study path instead of picking sets manually?</span>
              <Link
                href="#"
                className="text-xs text-[#4f46e5] no-underline font-medium hover:underline"
              >
                View TEAS English study path →
              </Link>
            </div>
          </section>
        )}
      </Layout>
    );
  }

  // Handle other page types (sub, nested, topic)
  // Load nested pages, topics, or quizzes based on type
  let nestedPages: any[] = [];
  let topics: any[] = [];
  let quizzes: any[] = [];
  let _nestedPageSlugMap: Record<string, string> = {};
  let _topicSlugMap: Record<string, string> = {};
  const _quizSlugMap: Record<string, string> = {};

  if (pageType === "nested") {
    // Fetch question count for the nested page
    if (
      pillarId === "nursing-entrance-exam" ||
      pillarId === "nursing-exit-exam"
    ) {
      const _nestedPageQuestionCount = await countNestedPageQuestions(
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
          const _quizSlugMap = slugMapResult.slugMap;
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
          const _quizSlugMap = slugMapResult.slugMap;
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
        const _nestedPageQuestionCount = totalNestedCount;
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
          _topicSlugMap = slugMapResult.slugMap;
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
    const _topicQuestionCount = await countTopicQuestions(
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
        const _quizSlugMap = slugMapResult.slugMap;
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
    const _subPageQuestionCount = await countSubPageQuestions(
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
          _nestedPageSlugMap = slugMapResult.slugMap;
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
          _nestedPageSlugMap = slugMapResult.slugMap;
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
          _nestedPageSlugMap = slugMapResult.slugMap;
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
    pageName: pageData.seoLabel || pageData.pageName || slug,
    meta: pageData.meta || {
      title: `${slug} | TeasGurus`,
      description: `Content for ${slug}`,
      keywords: `${slug}`,
      ogTitle: `${slug} | TeasGurus`,
      ogDescription: `Content for ${slug}`,
      ogImage: getImageUrl("/teas-gurus-logo.png"),
      canonicalUrl: `${getSiteUrl()}/${slug}`,
    },
    schema: pageData.schema || "",
    hero: {
      badge: "",
      title: pageData.heading || pageData.pageName || slug,
      subtitle: "",
      description: pageData.description || pageData.content || "",
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

  // Get heading and description from Firebase
  const pageHeading = pageData.heading || pageData.pageName || slug;
  const pageDescription = pageData.description || pageData.content || "";
  const bodyContent = pageData.bodyContent || "";

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

      <div className="px-5 pt-8 pb-12 md:px-5 sm:px-[14px] sm:pt-6 sm:pb-10">
        {/* Hero Section */}
        <section className="mb-7">
          {/* Hero Wrapper */}
          <div className="relative overflow-hidden rounded-[26px] p-[26px_40px_30px] grid grid-cols-1 lg:grid-cols-[1.4fr_1.1fr] gap-8 items-start bg-gradient-to-br from-[#f0f9ff] via-[#e7e5ff] to-[#fdfbff] shadow-[0_26px_70px_rgba(88,28,135,0.22)]">
            {/* Decorative background circle */}
            <div
              className="absolute w-[420px] h-[420px] rounded-full -right-[140px] -top-[160px] opacity-90 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(106, 92, 255, 0.26), transparent 70%)",
              }}
            />

            {/* Hero Left */}
            <div className="relative z-10 flex flex-col pr-2">
              {/* Hero Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(32,36,55,0.06)] backdrop-blur-sm text-[11px] uppercase tracking-wider text-[#202437] mb-[14px]">
                <span className="w-[7px] h-[7px] rounded-full bg-[#4ade80]" />
                <span>
                  {pageData.badge ||
                    `${
                      pageData.seoLabel || content.pageName
                    } Practice · Full Exam`}
                </span>
              </div>

              {/* Hero Title */}
              <h1 className="text-[30px] leading-[1.16] font-extrabold mb-[10px] text-[#202437]">
                <ContentRenderer content={pageHeading} />
              </h1>

              {/* Hero Description */}
              <div className="text-sm leading-[1.7] text-[#202437] max-w-[540px] mb-4 [&_.rich-text-content_p]:mb-0 [&_.rich-text-content_p:last-child]:mb-0 [&_.pb-25]:!pb-0 [&_div.pb-25]:!pb-0">
                <ContentRenderer content={pageDescription} />
              </div>

              {/* Hero Chip Row */}
              <div className="flex flex-wrap gap-2 mb-[18px]">
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  Updated for {pageData.seoLabel || content.pageName} blueprint
                </div>
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  Review & Exam modes for every subject
                </div>
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  Skill analytics in your dashboard
                </div>
              </div>

              {/* Hero Actions */}
              <div className="flex flex-wrap gap-[10px] items-center mb-2">
                <a
                  href="#question-sets"
                  className="inline-flex items-center justify-center gap-2 px-[22px] py-[10px] rounded-full bg-gradient-to-r from-[#6a5cff] to-[#8b5cf6] text-white font-semibold text-sm border-none shadow-[0_20px_42px_rgba(90,78,255,0.6)] cursor-pointer no-underline whitespace-nowrap hover:brightness-[1.03]"
                >
                  <span className="w-[18px] h-[18px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center text-[11px]">
                    ▶
                  </span>
                  Start {content.pageName} Practice Now
                </a>
                <a
                  href="#question-sets"
                  className="inline-flex items-center justify-center gap-[6px] px-4 py-[9px] rounded-full border border-dashed border-[rgba(106,92,255,0.32)] bg-[rgba(255,255,255,0.96)] text-[13px] font-medium text-[#202437] no-underline shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:bg-[#f3f4ff]"
                >
                  View All {content.pageName} Question Sets
                </a>
              </div>

              {/* Hero Footnote */}
              <p className="text-[11.5px] text-[#7a819c] max-w-[520px] mt-[2px]">
                One login. Your {content.pageName} mastery updates whenever you
                answer a linked {content.pageName} practice question.
              </p>
            </div>

            {/* KB Articles Header Card */}
            <div className="relative z-10 pl-3 mt-3 items-end hidden lg:flex sm:max-w-[420px] sm:mx-auto sm:mt-1">
              <div className="max-w-[420px] w-full bg-white rounded-[22px] p-4 pb-[18px] shadow-[0_16px_40px_rgba(15,23,42,0.16)] border border-[rgba(148,163,184,0.45)]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#4b5563]">
                    {content.pageName || pageData?.pageName || pageData?.seoLabel || "Page"} KB Snapshot
                  </div>
                  <div className="text-[11px] py-1 px-2.5 rounded-full bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] whitespace-nowrap">
                    Active Learning
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 gap-x-3 mb-3">
                  <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                      Articles Read
                    </div>
                    <div className="text-base font-bold mb-0.5">7</div>
                    <div className="text-[11.5px] text-[#6b7280]">Last 7 days</div>
                  </div>
                  <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                      Most Viewed
                    </div>
                    <div className="text-base font-bold mb-0.5">Basics</div>
                    <div className="text-[11.5px] text-[#6b7280]">Getting Started</div>
                  </div>
                  <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                      Practice Started
                    </div>
                    <div className="text-base font-bold mb-0.5">5</div>
                    <div className="text-[11.5px] text-[#6b7280]">From KB articles</div>
                  </div>
                  <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                      Your Focus
                    </div>
                    <div className="text-base font-bold mb-0.5">Study</div>
                    <div className="text-[11.5px] text-[#6b7280]">Preparation guides</div>
                  </div>
                </div>

                <div className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
                  Knowledge Base coverage for your plan
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[72%] bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* MOBILE-ONLY KB HERO CARD - removed from mobile view */}

        {/* MOBILE ONLY: On this page card */}
        <div className="mt-8 sm:hidden">
          <div className="bg-white rounded-[16px] border border-[rgba(148,163,184,0.5)] shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-[12px_14px] text-[13px] w-full">
            <div className="text-sm font-semibold mb-1 text-[#202437]">
              On this page
            </div>
            <div className="text-xs text-[#6b7280] mb-2">
              Jump to any section of the article.
            </div>
            <ul className="list-none p-0 m-0 text-[13px]">
              <li className="py-1">
                <a
                  href="#what-is-teas-7"
                  className="text-[#5548e0] no-underline hover:underline break-words"
                >
                  1. Quick Overview – {content.pageName} Practice at a Glance
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#section-breakdown"
                  className="text-[#5548e0] no-underline hover:underline break-words"
                >
                  2. {content.pageName} Practice Questions by Subject
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#how-to-use-this-page"
                  className="text-[#5548e0] no-underline hover:underline break-words"
                >
                  3. How to Use This {content.pageName} Practice Page
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#weekly-plan"
                  className="text-[#5548e0] no-underline hover:underline break-words"
                >
                  4. Sample 1–2 Week {content.pageName} Practice Plan
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#review-vs-exam-mode"
                  className="text-[#5548e0] no-underline hover:underline break-words"
                >
                  5. Review Mode vs Exam Mode
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* CONTENT AREA */}
        <section className="mt-5 sm:mt-8">

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)] gap-5 items-start w-full">
            {/* LEFT COLUMN: Article + FAQ */}
            <div className="flex flex-col gap-8 w-full">
              <article className="bg-white rounded-[18px] border border-[rgba(148,163,184,0.55)] shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-[16px_18px_18px] w-full">
                <h2
                  id="what-is-teas-7"
                  className="text-center text-xl font-bold my-[22px_18px] pb-[10px] relative after:content-[''] after:block after:h-[1px] after:border-t after:border-dotted after:border-[#d4d7f0] after:w-full after:mt-[10px] text-[#202437]"
                >
                  Quick Overview – {content.pageName} Practice at a Glance
                </h2>

                {bodyContent && (
                  <div className="text-sm leading-[1.7] text-[#202437]">
                    <TiptapContentRenderer content={bodyContent} />
                  </div>
                )}
              </article>

              {/* FAQ */}
              <section className="text-left">
                <div className="text-center mb-10">
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                    {content.pageName} Questions
                  </div>
                  <h2 className="text-2xl font-semibold mb-3 text-slate-900">
                    {content.pageName} Practice Test FAQ
                  </h2>
                  <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                    These short answers cover how the {content.pageName}{" "}
                    practice questions work and how to use them effectively for
                    exam preparation.
                  </p>
                </div>

                <div className="max-w-[800px] mx-auto">
                  <div className="space-y-3">
                    <FAQAccordion
                      question={`How many questions are in each ${content.pageName} practice test?`}
                      answer={`Our ${content.pageName} practice sets are built to feel like mini-exams. Each set usually ranges from 20–40 questions, and full-length practice tests mirror the real ${content.pageName} structure as closely as possible. You'll see separate sets for Reading, Math, Science, and English, as well as mixed "all subjects" practice for realistic exam days.`}
                      defaultOpen={true}
                    />
                    <FAQAccordion
                      question={`Are your ${content.pageName} practice questions similar to the real exam?`}
                      answer={`Yes. Every question is written to match the current ${content.pageName} blueprint in both difficulty and style. We focus on the same skills you'll see on test day—passage reading, applied math, core science concepts, and English grammar—so your practice time directly prepares you for the real exam, not just a generic quiz.`}
                    />
                    <FAQAccordion
                      question={`How often should I take a full-length ${content.pageName} practice test?`}
                      answer={`If your exam is more than a month away, taking a full-length practice test every 1–2 weeks is usually enough. In the final two weeks, many students like to add an extra full test to check timing and stamina. Between those full runs, use shorter, focused sessions in Review Mode to fix your weak spots.`}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: sidebar (hidden on mobile) */}
            <aside className="hidden sm:flex flex-col gap-3 w-full">
              <div className="bg-white rounded-[16px] border border-[rgba(148,163,184,0.5)] shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-[12px_14px] text-[13px] w-full">
                <div className="text-sm font-semibold mb-1 text-[#202437]">
                  On this page
                </div>
                <div className="text-xs text-[#6b7280] mb-2">
                  Jump to any section of the article.
                </div>
                <ul className="list-none p-0 m-0 text-[13px]">
                  <li className="py-1">
                    <a
                      href="#what-is-teas-7"
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      1. Quick Overview – {content.pageName} Practice at a
                      Glance
                    </a>
                  </li>
                  <li className="py-1">
                    <a
                      href="#section-breakdown"
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      2. {content.pageName} Practice Questions by Subject
                    </a>
                  </li>
                  <li className="py-1">
                    <a
                      href="#how-to-use-this-page"
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      3. How to Use This {content.pageName} Practice Page
                    </a>
                  </li>
                  <li className="py-1">
                    <a
                      href="#weekly-plan"
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      4. Sample 1–2 Week {content.pageName} Practice Plan
                    </a>
                  </li>
                  <li className="py-1">
                    <a
                      href="#review-vs-exam-mode"
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      5. Review Mode vs Exam Mode
                    </a>
                  </li>
                </ul>
              </div>

            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
}
