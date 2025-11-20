import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import {
  getNursingEntranceExamSubPage,
  getNursingExitExamSubPage,
  getNursingTestBankSubPage,
  getNestedSubPage,
  getNestedSubPages,
  getNursingExitExamNestedSubPages,
  getNursingExitExamNestedSubPage,
  getNursingTestBankNestedSubPages,
  getNursingTestBankNestedSubPage,
  getNursingTestBankTopic,
  getNursingTestBankTopics,
} from "@/lib/firestore-operations";

// Enable dynamic params for on-demand generation
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subPageId: string }>;
}): Promise<Metadata> {
  const { subPageId } = await params;

  // Check if this is a test bank nested sub-page URL pattern: [nestedSubPageId]-[parentSubPageId]-test-bank
  const testBankNestedMatch = subPageId.match(/^(.+)-(.+)-test-bank$/);

  // Check if this is a test bank topic URL pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
  // Only match if it doesn't end with -test-bank (to avoid conflict with nested sub-pages)
  const testBankTopicMatch =
    !subPageId.endsWith("-test-bank") && subPageId.match(/^(.+)-(.+)-(.+)$/);

  // Check if this is an exit exam nested sub-page URL pattern: [nestedSubPageId]-[parentSubPageId]-exit-exam
  const exitExamNestedMatch = subPageId.match(/^(.+)-(.+)-exit-exam$/);

  // Check if this is an entrance exam nested sub-page URL pattern: [parentSubPageId]-[nestedSubPageId]-questions
  const entranceExamNestedMatch = subPageId.match(/^(.+)-(.+)-questions$/);

  let result: any;
  if (testBankTopicMatch) {
    // This is a test bank topic page
    // Pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
    const nestedSubPageId = testBankTopicMatch[1];
    const parentSubPageId = testBankTopicMatch[2];
    const topicId = testBankTopicMatch[3];

    // Verify parent exists first
    const parentResult = await getNursingTestBankSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      return {
        title: `${subPageId} | TeasGurus`,
        description: `Content for ${subPageId}`,
      };
    }

    // Verify nested sub-page exists
    const nestedResult = await getNursingTestBankNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    if (!nestedResult.success || !nestedResult.data) {
      return {
        title: `${subPageId} | TeasGurus`,
        description: `Content for ${subPageId}`,
      };
    }

    // Get topic
    const topicResult = await getNursingTestBankTopic(
      parentSubPageId,
      nestedSubPageId,
      topicId
    );
    result = topicResult;
  } else if (testBankNestedMatch) {
    // This is a test bank nested sub-page
    const nestedSubPageId = testBankNestedMatch[1];
    const parentSubPageId = testBankNestedMatch[2];

    // Verify parent exists first
    const parentResult = await getNursingTestBankSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      return {
        title: `${subPageId} | TeasGurus`,
        description: `Content for ${subPageId}`,
      };
    }

    // Get nested sub-page
    const nestedResult = await getNursingTestBankNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    result = nestedResult;
  } else if (exitExamNestedMatch) {
    // This is an exit exam nested sub-page
    const nestedSubPageId = exitExamNestedMatch[1];
    const parentSubPageId = exitExamNestedMatch[2];

    // Verify parent exists first
    const parentResult = await getNursingExitExamSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      return {
        title: `${subPageId} | TeasGurus`,
        description: `Content for ${subPageId}`,
      };
    }

    // Get nested sub-page
    const nestedResult = await getNursingExitExamNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    result = nestedResult;
  } else if (entranceExamNestedMatch) {
    // This is an entrance exam nested sub-page
    // Parent ID in nested URLs doesn't have -exam suffix
    const parentSubPageId = entranceExamNestedMatch[1];
    const nestedSubPageId = entranceExamNestedMatch[2];

    // Verify parent exists first
    const parentResult = await getNursingEntranceExamSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      return {
        title: `${subPageId} | TeasGurus`,
        description: `Content for ${subPageId}`,
      };
    }

    // Get nested sub-page
    const nestedResult = await getNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    result = nestedResult;
  } else if (subPageId.endsWith("-test-bank")) {
    // This is a test bank regular sub-page
    const lookupId = subPageId.slice(0, -10); // Remove "-test-bank"
    result = await getNursingTestBankSubPage(lookupId);
  } else {
    // Regular sub-page - strip -exam suffix if present
    let lookupId = subPageId;
    if (subPageId.endsWith("-exam")) {
      lookupId = subPageId.slice(0, -5);
    }
    result = await getNursingEntranceExamSubPage(lookupId);
  }

  if (result.success && result.data) {
    const data = result.data as any;
    if (data.meta) {
      return {
        title: data.meta.title || `${subPageId} | TeasGurus`,
        description: data.meta.description || "",
        keywords: data.meta.keywords || "",
        openGraph: {
          title:
            data.meta.ogTitle || data.meta.title || `${subPageId} | TeasGurus`,
          description: data.meta.ogDescription || data.meta.description || "",
          url: data.meta.canonicalUrl || `https://teasgurus.com/${subPageId}`,
          images: [
            {
              url: data.meta.ogImage || "/teas-gurus-logo.png",
              width: 1200,
              height: 630,
              alt: data.meta.title || subPageId,
            },
          ],
        },
        alternates: {
          canonical: data.meta.canonicalUrl || `/${subPageId}`,
        },
      };
    }
  }

  return {
    title: `${subPageId} | TeasGurus`,
    description: `Content for ${subPageId}`,
  };
}

export default async function SubPage({
  params,
}: {
  params: Promise<{ subPageId: string }>;
}) {
  const { subPageId } = await params;

  // Check if this is a test bank nested sub-page URL pattern: [nestedSubPageId]-[parentSubPageId]-test-bank
  const testBankNestedMatch = subPageId.match(/^(.+)-(.+)-test-bank$/);

  // Check if this is a test bank topic URL pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
  // Only match if it doesn't end with -test-bank (to avoid conflict with nested sub-pages)
  const testBankTopicMatch =
    !subPageId.endsWith("-test-bank") && subPageId.match(/^(.+)-(.+)-(.+)$/);

  // Check if this is an exit exam nested sub-page URL pattern: [nestedSubPageId]-[parentSubPageId]-exit-exam
  const exitExamNestedMatch = subPageId.match(/^(.+)-(.+)-exit-exam$/);

  // Check if this is an entrance exam nested sub-page URL pattern: [parentSubPageId]-[nestedSubPageId]-questions
  const entranceExamNestedMatch = subPageId.match(/^(.+)-(.+)-questions$/);

  let pageData: any;
  let parentSubPageData: any = null; // Store parent sub-page data for URL generation
  let isNestedSubPage = false;
  let isTopic = false;
  let isExitExam = false;
  let isTestBank = false;
  let parentSubPageId: string | null = null;
  let nestedSubPageId: string | null = null;
  let topicId: string | null = null;
  let lookupId: string = subPageId;

  if (testBankTopicMatch) {
    // This is a test bank topic page
    // Pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
    nestedSubPageId = testBankTopicMatch[1];
    parentSubPageId = testBankTopicMatch[2];
    topicId = testBankTopicMatch[3];

    // First verify the parent sub-page exists
    const parentResult = await getNursingTestBankSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      notFound();
    }

    // Verify nested sub-page exists
    const nestedResult = await getNursingTestBankNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    if (!nestedResult.success || !nestedResult.data) {
      notFound();
    }

    // Get the topic
    const topicResult = await getNursingTestBankTopic(
      parentSubPageId,
      nestedSubPageId,
      topicId
    );
    if (!topicResult.success || !topicResult.data) {
      notFound();
    }

    pageData = topicResult.data;
    isTopic = true;
    isTestBank = true;
  } else if (testBankNestedMatch) {
    // This is a test bank nested sub-page
    nestedSubPageId = testBankNestedMatch[1];
    parentSubPageId = testBankNestedMatch[2];

    // First verify the parent sub-page exists
    const parentResult = await getNursingTestBankSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      notFound();
    }
    parentSubPageData = parentResult.data; // Store parent data for URL generation

    // Get the nested sub-page
    const nestedResult = await getNursingTestBankNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    if (!nestedResult.success || !nestedResult.data) {
      notFound();
    }

    pageData = nestedResult.data;
    isNestedSubPage = true;
    isTestBank = true;
  } else if (exitExamNestedMatch) {
    // This is an exit exam nested sub-page
    nestedSubPageId = exitExamNestedMatch[1];
    parentSubPageId = exitExamNestedMatch[2];

    // First verify the parent sub-page exists
    const parentResult = await getNursingExitExamSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      notFound();
    }

    // Get the nested sub-page
    const nestedResult = await getNursingExitExamNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    if (!nestedResult.success || !nestedResult.data) {
      notFound();
    }

    pageData = nestedResult.data;
    isNestedSubPage = true;
    isExitExam = true;
  } else if (entranceExamNestedMatch) {
    // This is an entrance exam nested sub-page
    // Parent ID in nested URLs doesn't have -exam suffix
    parentSubPageId = entranceExamNestedMatch[1];
    nestedSubPageId = entranceExamNestedMatch[2];

    // First verify the parent sub-page exists
    const parentResult = await getNursingEntranceExamSubPage(parentSubPageId);
    if (!parentResult.success || !parentResult.data) {
      notFound();
    }

    // Get the nested sub-page
    const nestedResult = await getNestedSubPage(
      parentSubPageId,
      nestedSubPageId
    );
    if (!nestedResult.success || !nestedResult.data) {
      notFound();
    }

    pageData = nestedResult.data;
    isNestedSubPage = true;
  } else if (subPageId.endsWith("-test-bank")) {
    // This is a test bank regular sub-page
    lookupId = subPageId.slice(0, -10); // Remove "-test-bank"
    const result = await getNursingTestBankSubPage(lookupId);

    if (!result.success || !result.data) {
      notFound();
    }

    pageData = result.data;
    isTestBank = true;
  } else {
    // This is a regular sub-page - strip -exam suffix if present
    if (subPageId.endsWith("-exam")) {
      lookupId = subPageId.slice(0, -5);
    }

    const result = await getNursingEntranceExamSubPage(lookupId);

    if (!result.success || !result.data) {
      notFound();
    }

    pageData = result.data;
  }

  // Fetch nested sub-pages if this is a regular sub-page (not a nested sub-page or topic itself)
  let nestedSubPages: any[] = [];
  if (!isNestedSubPage && !isTopic) {
    if (isTestBank) {
      // Fetch test bank nested sub-pages
      const nestedSubPagesResult = await getNursingTestBankNestedSubPages(
        lookupId
      );
      if (nestedSubPagesResult.success && nestedSubPagesResult.data) {
        nestedSubPages = nestedSubPagesResult.data;
      }
    } else if (isExitExam) {
      // Fetch exit exam nested sub-pages
      const nestedSubPagesResult = await getNursingExitExamNestedSubPages(
        lookupId
      );
      if (nestedSubPagesResult.success && nestedSubPagesResult.data) {
        nestedSubPages = nestedSubPagesResult.data;
      }
    } else {
      // Use the lookup ID (without -exam) for fetching nested sub-pages
      const nestedSubPagesResult = await getNestedSubPages(lookupId);
      if (nestedSubPagesResult.success && nestedSubPagesResult.data) {
        nestedSubPages = nestedSubPagesResult.data;
      }
    }
  }

  // Fetch topics if this is a nested sub-page of the test bank
  let topics: any[] = [];
  if (isNestedSubPage && isTestBank && parentSubPageId && nestedSubPageId) {
    const topicsResult = await getNursingTestBankTopics(
      parentSubPageId,
      nestedSubPageId
    );
    if (topicsResult.success && topicsResult.data) {
      topics = topicsResult.data;
    }
  }

  const content: ServiceContent = {
    pageName:
      pageData.pageName || (isNestedSubPage ? nestedSubPageId : subPageId),
    meta: pageData.meta || {
      title: `${subPageId} | TeasGurus`,
      description: `Content for ${subPageId}`,
      keywords: `${subPageId}, ${
        isExitExam ? "nursing exit exam" : "nursing entrance exam"
      }`,
      ogTitle: `${subPageId} | TeasGurus`,
      ogDescription: `Content for ${subPageId}`,
      ogImage: "/teas-gurus-logo.png",
      canonicalUrl: `https://teasgurus.com/${subPageId}`,
    },
    schema: pageData.schema || "",
    hero: pageData.hero || {
      badge: isTestBank
        ? "Nursing Test Bank"
        : isExitExam
        ? "Nursing Exit Exam"
        : "Nursing Entrance Exam",
      title: pageData.pageName || subPageId,
      subtitle: "",
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
              {content.hero.title || content.pageName || subPageId}
            </h1>
            <div className="text-gray-600 text-base leading-relaxed">
              <ContentRenderer content={content.hero.description || ""} />
            </div>
          </div>

          {/* Topics Cards - Dashboard Style (for nested sub-pages) */}
          {isNestedSubPage && isTestBank && topics.length > 0 && (
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                {/* All topics */}
                {topics.map((topic: any, index: number) => {
                  const pageName =
                    topic.pageName ||
                    topic.hero?.title ||
                    topic.title ||
                    topic.id;
                  const topicPageId = topic.id || topic.topicId;

                  // Get icon and colors based on page name (similar to nested sub-pages)
                  const getCardIcon = (pageName: string, index: number) => {
                    const nameLower = pageName.toLowerCase();
                    const colorVariants = [
                      {
                        iconBg: "bg-purple-500",
                        numberColor: "text-purple-600",
                      },
                      { iconBg: "bg-blue-500", numberColor: "text-blue-600" },
                      {
                        iconBg: "bg-orange-500",
                        numberColor: "text-orange-600",
                      },
                      { iconBg: "bg-green-500", numberColor: "text-green-600" },
                      { iconBg: "bg-teal-500", numberColor: "text-teal-600" },
                      {
                        iconBg: "bg-indigo-500",
                        numberColor: "text-indigo-600",
                      },
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
                    // Default fallback - use index-based color rotation for icon and text
                    const colorVariant =
                      colorVariants[index % colorVariants.length];
                    return {
                      icon: <LaptopIcon className="w-6 h-6 text-white" />,
                      iconBg: colorVariant.iconBg,
                      numberColor: colorVariant.numberColor,
                    };
                  };

                  const config = getCardIcon(pageName, index);
                  // Default question count - can be made dynamic later
                  const questionCount = topic.questionCount || "0";

                  // Get the slugs for URL generation
                  const nestedSlug = pageData?.slug || nestedSubPageId || "";
                  const parentSlug =
                    parentSubPageData?.slug || parentSubPageId || "";
                  const topicSlug = topic.slug || topicPageId;
                  const topicUrl = `/${nestedSlug}-${parentSlug}-${topicSlug}`;

                  return (
                    <Link
                      key={topicPageId}
                      href={topicUrl}
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
              </div>
            </div>
          )}

          {/* Show Take Test button only for nested sub-pages */}
          {isNestedSubPage && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-[2rem] font-bold hover:bg-yellow-400 transition-colors"
              >
                Take Test
              </Link>
            </div>
          )}

          {/* Nested Sub-Pages Cards - Dashboard Style */}
          {!isNestedSubPage && nestedSubPages.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-4">
                {/* All nested sub-pages */}
                {nestedSubPages.map((nestedSubPage: any, index: number) => {
                  const pageName =
                    nestedSubPage.pageName ||
                    nestedSubPage.hero?.title ||
                    nestedSubPage.title ||
                    nestedSubPage.id;
                  const nestedPageId =
                    nestedSubPage.id || nestedSubPage.nestedSubPageId;

                  // Get icon and colors based on page name (similar to popup modal)
                  const getCardIcon = (pageName: string, index: number) => {
                    const nameLower = pageName.toLowerCase();
                    const colorVariants = [
                      {
                        iconBg: "bg-purple-500",
                        numberColor: "text-purple-600",
                      },
                      { iconBg: "bg-blue-500", numberColor: "text-blue-600" },
                      {
                        iconBg: "bg-orange-500",
                        numberColor: "text-orange-600",
                      },
                      { iconBg: "bg-green-500", numberColor: "text-green-600" },
                      { iconBg: "bg-teal-500", numberColor: "text-teal-600" },
                      {
                        iconBg: "bg-indigo-500",
                        numberColor: "text-indigo-600",
                      },
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
                    // Default fallback - use index-based color rotation for icon and text
                    const colorVariant =
                      colorVariants[index % colorVariants.length];
                    return {
                      icon: <LaptopIcon className="w-6 h-6 text-white" />,
                      iconBg: colorVariant.iconBg,
                      numberColor: colorVariant.numberColor,
                    };
                  };

                  const config = getCardIcon(pageName, index);
                  // Default question count - can be made dynamic later
                  const questionCount = nestedSubPage.questionCount || "0";

                  // Get the slug for URL generation
                  // Use lookupId as the base, or fallback to pageData.slug/subPageId
                  let baseSlug = lookupId;
                  if (!baseSlug) {
                    baseSlug = pageData?.slug || subPageId;
                  }
                  // Remove -exam or -test-bank suffix if present (safety check)
                  let parentUrlSlug = baseSlug;
                  if (baseSlug.endsWith("-exam")) {
                    parentUrlSlug = baseSlug.slice(0, -5);
                  } else if (baseSlug.endsWith("-test-bank")) {
                    parentUrlSlug = baseSlug.slice(0, -10);
                  }

                  let nestedSubPageUrl: string;
                  if (isTestBank) {
                    nestedSubPageUrl = `/${nestedPageId}-${parentUrlSlug}-test-bank`;
                  } else if (isExitExam) {
                    nestedSubPageUrl = `/${nestedPageId}-${parentUrlSlug}-exit-exam`;
                  } else {
                    nestedSubPageUrl = `/${parentUrlSlug}-${nestedPageId}-questions`;
                  }

                  return (
                    <Link
                      key={nestedPageId}
                      href={nestedSubPageUrl}
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
                <div className="bg-white rounded-lg shadow-sm p-6 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MedalIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {content.pageName || content.hero.title || subPageId}
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        2,230
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            Ready to Ace Your{" "}
            {isTestBank
              ? "Nursing Exams"
              : `Nursing ${isExitExam ? "Exit" : "Entrance"} Exam`}
            ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get expert help with your{" "}
            {isTestBank
              ? "nursing exam preparation"
              : `nursing ${
                  isExitExam ? "exit" : "entrance"
                } exam preparation`}{" "}
            and achieve your nursing{" "}
            {isTestBank
              ? "career goals"
              : isExitExam
              ? "career goals"
              : "school dreams"}
            .
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
