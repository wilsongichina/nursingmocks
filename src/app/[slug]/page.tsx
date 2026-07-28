import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ContentRenderer from "@/components/ui/ContentRenderer";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";
import DynamicQuizQuestions from "@/components/quiz/DynamicQuizQuestions";
import FAQAccordion from "@/components/ui/FAQAccordion";
import KbArticleViewer from "@/components/knowledge-base/KbArticleViewer";
import PublicSubPageHero from "@/components/sections/PublicSubPageHero";
import PublicSubPageGuide, {
  PublicSubPageGuideSection,
} from "@/components/sections/PublicSubPageGuide";
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
import {
  buildQuizPreviewState,
  resolveRequiredExamAccessProduct,
} from "@/lib/content-access-state";
import { buildQuizSchemaMarkup } from "@/lib/seo/structured-data";

// Icon components for dashboard-style cards
const _LaptopIcon = ({ className }: { className?: string }) => (
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

const _BookIcon = ({ className }: { className?: string }) => (
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

const _CalculatorIcon = ({ className }: { className?: string }) => (
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

const _FlaskIcon = ({ className }: { className?: string }) => (
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

const _ABCIcon = ({ className }: { className?: string }) => (
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

interface TocItem {
  id: string;
  title: string;
  level: number;
}

type TiptapContentPart =
  | { type: "html"; html: string }
  | { type: "quizCard"; key: string; quizTitle: string; questions: any[] };

const SUPPORTED_QUIZ_CARD_QUESTION_TYPES = new Set([1, 2, 3, 6, 7]);

function toClientSafeValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.seconds === "number" && typeof value.nanoseconds === "number") {
    return new Date(value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000)).toISOString();
  }
  if (Array.isArray(value)) return value.map(toClientSafeValue);

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [key, toClientSafeValue(entryValue)])
  );
}

const decodeHtmlAttribute = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const parseHtmlAttributes = (htmlTag: string) => {
  const attrs: Record<string, string> = {};
  const attrPattern = /([\w-]+)=(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(htmlTag)) !== null) {
    attrs[match[1]] = decodeHtmlAttribute(match[3]);
  }

  return attrs;
};

const isSupportedQuizCardQuestion = (question: any) => {
  const questionTypeId = Number(question.questionTypeId || question.question_type_id);
  return SUPPORTED_QUIZ_CARD_QUESTION_TYPES.has(questionTypeId);
};

const getQuestionId = (question: any) => String(question.id || question.questionId || "");

const loadStaticQuizCardQuestions = async (attrs: Record<string, string>) => {
  const pillarId = attrs["data-pillar-id"];
  const subPageId = attrs["data-sub-page-id"];
  const nestedSubPageId = attrs["data-nested-sub-page-id"];
  const topicId = attrs["data-topic-id"];
  const quizId = attrs["data-quiz-id"];

  if (!pillarId || !subPageId || !nestedSubPageId || !quizId) {
    return [];
  }

  let result: any = null;

  if (pillarId === "nursing-entrance-exam") {
    result = await getNursingEntranceExamQuizQuestions(subPageId, nestedSubPageId, quizId);
  } else if (pillarId === "nursing-exit-exam") {
    result = await getNursingExitExamQuizQuestions(subPageId, nestedSubPageId, quizId);
  } else if (pillarId === "nursing-test-bank" && topicId) {
    result = await getNursingTestBankQuizQuestions(subPageId, nestedSubPageId, topicId, quizId);
  }

  if (!result?.success || !Array.isArray(result.data)) {
    return [];
  }

  let questions = result.data.filter(isSupportedQuizCardQuestion);
  const selectedQuestionIdsValue = attrs["data-selected-question-ids"];

  if (selectedQuestionIdsValue) {
    try {
      const selectedQuestionIds = JSON.parse(selectedQuestionIdsValue).map(String);
      questions = questions.filter((question: any) =>
        selectedQuestionIds.includes(getQuestionId(question))
      );
    } catch {
      questions = [];
    }
  }

  return toClientSafeValue(questions);
};

const buildStaticTiptapContentParts = async (
  htmlContent: string
): Promise<TiptapContentPart[]> => {
  const quizCardPattern =
    /<div\b(?=[^>]*\bdata-type=(["'])quiz-card\1)[^>]*><\/div>/gi;
  const parts: TiptapContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let quizCardIndex = 0;

  while ((match = quizCardPattern.exec(htmlContent)) !== null) {
    const htmlBefore = htmlContent.slice(lastIndex, match.index);
    if (htmlBefore.trim()) {
      parts.push({ type: "html", html: htmlBefore });
    }

    const attrs = parseHtmlAttributes(match[0]);
    const questions = await loadStaticQuizCardQuestions(attrs);
    parts.push({
      type: "quizCard",
      key: `quiz-card-${quizCardIndex}`,
      quizTitle: attrs["data-quiz-title"] || "Practice Questions",
      questions,
    });

    lastIndex = match.index + match[0].length;
    quizCardIndex += 1;
  }

  const htmlAfter = htmlContent.slice(lastIndex);
  if (htmlAfter.trim()) {
    parts.push({ type: "html", html: htmlAfter });
  }

  return parts;
};

const createHeadingId = (text: string, index: number) => {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `section-${index + 1}`;
};

const stripHtml = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const titleCaseWords = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (["ATI", "TEAS", "HESI", "A2", "RN", "LPN"].includes(upperWord)) {
        return upperWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

const getPublicPillarLabel = (pillarId: string) => {
  switch (pillarId) {
    case "nursing-entrance-exam":
      return "Nursing Entrance Exams";
    case "nursing-test-bank":
      return "Nursing Test Bank";
    case "nursing-exit-exam":
      return "Nursing Exit Exams";
    default:
      return "NursingMocks";
  }
};

const getPublicPillarBreadcrumbLabel = (pillarId: string) => {
  switch (pillarId) {
    case "nursing-entrance-exam":
      return "Nursing Entrance Exam";
    case "nursing-test-bank":
      return "Nursing Test Bank";
    case "nursing-exit-exam":
      return "Nursing Exit Exam";
    default:
      return titleCaseWords(pillarId);
  }
};

type PublicBreadcrumbItem = {
  name: string;
  url?: string;
};

const getPublicContentLabel = (pageData: any, fallback: string) =>
  titleCaseWords(
    stripHtml(
      pageData?.seoLabel ||
        pageData?.pageName ||
        pageData?.heading ||
        pageData?.hero?.title ||
        pageData?.title ||
        fallback
    )
  );

const getRouteSlugByContentId = async ({
  pillarId,
  type,
  id,
  subPageId,
  nestedPageId,
}: {
  pillarId: string;
  type: "sub" | "nested" | "topic" | "quiz";
  id: string;
  subPageId?: string;
  nestedPageId?: string;
}) => {
  const result = await getRouteMappingById({
    pillarId,
    type,
    id,
    subPageId,
    nestedPageId,
  });

  if (result.success && result.data) {
    return (result.data as any).slug || id;
  }

  return id;
};

const buildGeneratedPageBreadcrumbItems = async ({
  slug,
  mapping,
  pageData,
}: {
  slug: string;
  mapping: any;
  pageData: any;
}): Promise<PublicBreadcrumbItem[]> => {
  const pillarId = String(mapping?.pillarId || pageData?.pillarId || "nursing-entrance-exam");
  const items: PublicBreadcrumbItem[] = [
    { name: "Home", url: "/" },
    {
      name: getPublicPillarBreadcrumbLabel(pillarId),
      url: `/${pillarId}`,
    },
  ];

  if (mapping?.subPageId && mapping.type !== "sub") {
    const parentRefPath = `pillarPages/${pillarId}/subPages/${mapping.subPageId}`;
    const parentResult = await getPageByContentPath(parentRefPath);
    const parentData = parentResult.success ? parentResult.data : null;
    const parentSlug = await getRouteSlugByContentId({
      pillarId,
      type: "sub",
      id: mapping.subPageId,
    });

    items.push({
      name: getPublicContentLabel(parentData, mapping.subPageId),
      url: `/${parentSlug}`,
    });
  }

  if (mapping?.nestedPageId && mapping.type !== "nested") {
    const nestedRefPath = `pillarPages/${pillarId}/subPages/${mapping.subPageId}/nestedSubPages/${mapping.nestedPageId}`;
    const nestedResult = await getPageByContentPath(nestedRefPath);
    const nestedData = nestedResult.success ? nestedResult.data : null;
    const nestedSlug = await getRouteSlugByContentId({
      pillarId,
      type: "nested",
      id: mapping.nestedPageId,
      subPageId: mapping.subPageId,
    });

    items.push({
      name: getPublicContentLabel(nestedData, mapping.nestedPageId),
      url: `/${nestedSlug}`,
    });
  }

  if (mapping?.topicId && mapping.type !== "topic") {
    const topicRefPath = `pillarPages/${pillarId}/subPages/${mapping.subPageId}/nestedSubPages/${mapping.nestedPageId}/topics/${mapping.topicId}`;
    const topicResult = await getPageByContentPath(topicRefPath);
    const topicData = topicResult.success ? topicResult.data : null;
    const topicSlug = await getRouteSlugByContentId({
      pillarId,
      type: "topic",
      id: mapping.topicId,
      subPageId: mapping.subPageId,
      nestedPageId: mapping.nestedPageId,
    });

    items.push({
      name: getPublicContentLabel(topicData, mapping.topicId),
      url: `/${topicSlug}`,
    });
  }

  items.push({
    name: getPublicContentLabel(pageData, slug),
  });

  return items;
};

const getExamBadgeLabel = (pageData: any, contentName: string) => {
  const productId = String(pageData?.examAccessProductId || "").toLowerCase();
  const source = `${contentName} ${pageData?.pageName || ""} ${pageData?.seoLabel || ""}`.toLowerCase();

  if (productId === "ati_teas_7" || source.includes("teas")) return "ATI TEAS 7";
  if (productId === "hesi_a2" || source.includes("hesi")) return "HESI A2";
  if (productId === "nursing_test_bank" || source.includes("test bank")) return "Nursing Test Bank";
  if (productId === "nursing_exit_exams" || source.includes("exit")) return "Nursing Exit Exams";

  return titleCaseWords(contentName || "NursingMocks");
};

const getSubPageActionLabels = (examBadge: string) => {
  const examName = examBadge || "Nursing Exam";
  return {
    primary: `Start ${examName} Practice`,
    secondary: `View ${examName} Subjects`,
    sectionTitle: `${examName} Practice Subjects`,
  };
};

const getDisplayCopyOverride = (displayCopy: any, key: string) => {
  const value = displayCopy?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
};

const isGeneratedPlaceholderDescription = (value: string) =>
  /^content for\b.+\bunder\b/i.test(value.trim());

const getPublicCardDescription = (page: any, title: string) => {
  const candidates = [
    page.cardDescription,
    page.shortDescription,
    page.description,
    page.hero?.description,
    page.meta?.description,
  ];

  for (const candidate of candidates) {
    const cleanValue = stripHtml(candidate);

    if (!cleanValue || isGeneratedPlaceholderDescription(cleanValue)) {
      continue;
    }

    const firstSentence =
      cleanValue.match(/^(.+?[.!?])(?:\s|$)/)?.[1] || cleanValue;

    return firstSentence.length > 155
      ? `${firstSentence.slice(0, 152).trim()}...`
      : firstSentence;
  }

  return `Practice ${title} with subject-focused questions and review support.`;
};

const buildTocAndBodyContent = (
  htmlContent: string
): { tocItems: TocItem[]; contentWithHeadingIds: string } => {
  if (!htmlContent) {
    return { tocItems: [], contentWithHeadingIds: htmlContent };
  }

  const tocItems: TocItem[] = [];
  let headingIndex = 0;

  const contentWithHeadingIds = htmlContent.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (fullMatch, level, attrs, innerHtml) => {
      const title = innerHtml.replace(/<[^>]*>/g, "").trim();
      if (!title) {
        return fullMatch;
      }

      // Body content is managed in Tiptap, but public pages must keep one H1.
      const safeLevel = level === "1" ? "2" : level;

      if (level === "1") {
        return `<h2${attrs} data-toc-ignore="true">${innerHtml}</h2>`;
      }

      if (safeLevel !== "2") {
        return fullMatch;
      }

      const existingIdMatch = attrs.match(/\sid=(["'])(.*?)\1/i);
      const id = existingIdMatch?.[2] || createHeadingId(title, headingIndex);

      tocItems.push({
        id,
        title,
        level: parseInt(safeLevel, 10),
      });

      headingIndex += 1;

      if (existingIdMatch) {
        return `<h${safeLevel}${attrs}>${innerHtml}</h${safeLevel}>`;
      }

      return `<h${safeLevel}${attrs} id="${id}">${innerHtml}</h${safeLevel}>`;
    }
  );

  return { tocItems, contentWithHeadingIds };
};

const buildGuideSections = async (
  htmlContent: string,
  tocItems: TocItem[],
  fallbackTitle: string
): Promise<PublicSubPageGuideSection[]> => {
  if (!htmlContent) {
    return [];
  }

  const headingMatches = Array.from(
    htmlContent.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi)
  ).filter((match) => !/\sdata-toc-ignore=(["'])true\1/i.test(match[1]));

  if (headingMatches.length === 0) {
    return [
      {
        id: "overview",
        title: fallbackTitle,
        content: htmlContent,
        contentParts: await buildStaticTiptapContentParts(htmlContent),
      },
    ];
  }

  const introContent = htmlContent.slice(0, headingMatches[0].index || 0).trim();
  const sections: PublicSubPageGuideSection[] = [];

  for (const [index, match] of headingMatches.entries()) {
    const headingStart = match.index || 0;
    const contentStart = headingStart + match[0].length;
    const nextHeadingStart =
      headingMatches[index + 1]?.index ?? htmlContent.length;
    const headingTitle =
      tocItems[index]?.title ||
      match[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ||
      `${fallbackTitle} ${index + 1}`;
    const body = htmlContent.slice(contentStart, nextHeadingStart).trim();
    const sectionContent =
      index === 0 && introContent ? `${introContent}${body}` : body;

    sections.push({
      id: tocItems[index]?.id || createHeadingId(headingTitle, index),
      title: headingTitle,
      content: sectionContent || "<p>Content will appear here once it is published.</p>",
      contentParts: await buildStaticTiptapContentParts(
        sectionContent || "<p>Content will appear here once it is published.</p>"
      ),
    });
  }

  return sections;
};

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

// Admin-created content can add new route mappings after a build has already
// happened, so dynamic slugs must be allowed to resolve through Firestore.
export const dynamicParams = true;
export const dynamic = "force-static"; // Force static generation
export const revalidate = 60; // Keep public content fast while allowing admin copy edits to refresh quickly.

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
      title: `${slug} | NursingMocks`,
      description: `Content for ${slug}`,
    };
  }

  const routeMappingResult = await getRouteMappingBySlugOnly(slug);
  if (!routeMappingResult.success || !routeMappingResult.data) {
    return {
      title: `${slug} | NursingMocks`,
      description: `Content for ${slug}`,
    };
  }

  const mapping = routeMappingResult.data as any;
  const contentResult = await getPageByContentPath(mapping.refPath);

  if (contentResult.success && contentResult.data) {
    const data = contentResult.data as any;
    if (data.meta) {
      return {
        title: data.meta.title || `${slug} | NursingMocks`,
        description: data.meta.description || "",
        keywords: data.meta.keywords || "",
        openGraph: {
          title: data.meta.ogTitle || data.meta.title || `${slug} | NursingMocks`,
          description: data.meta.ogDescription || data.meta.description || "",
          url:
            data.meta.canonicalUrl ||
            `${getSiteUrl()}/${slug}`,
          images: [
            {
              url: data.meta.ogImage ? getImageUrl(data.meta.ogImage) : getImageUrl("/nursing-mocks-logo.png"),
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
    title: `${slug} | NursingMocks`,
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
      const initialBreadcrumbItems: PublicBreadcrumbItem[] = [
        { name: "Home", url: "/" },
        {
          name: getPublicPillarBreadcrumbLabel(pillarId),
          url: `/${pillarId}`,
        },
        {
          name: getPublicContentLabel(pageData, slug),
        },
      ];
      
      return (
        <Layout showSidebar={true} initialBreadcrumbItems={initialBreadcrumbItems}>
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
  const initialBreadcrumbItems = await buildGeneratedPageBreadcrumbItems({
    slug,
    mapping,
    pageData,
  });

  // Handle knowledge base articles
  if (mapping.refPath && mapping.refPath.startsWith("knowledgeBase/")) {
    return (
      <Layout showSidebar={true} initialBreadcrumbItems={initialBreadcrumbItems}>
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

    // Filter questions to only show types 1, 2, 3, and 7
    const allowedQuestionTypes = [1, 2, 3, 6, 7];
    const allQuestions =
      questionsResult && questionsResult.success && questionsResult.data
        ? questionsResult.data
        : [];

    const filteredQuestions = allQuestions.filter((question: any) => {
      const questionTypeId =
        question.questionTypeId || question.question_type_id;
      return allowedQuestionTypes.includes(questionTypeId);
    });

    const requiredProductId = resolveRequiredExamAccessProduct({ ...mapping, slug }, pageData);
    const previewState = buildQuizPreviewState(filteredQuestions.length, requiredProductId);
    // Public dynamic quiz pages are statically generated, so they render the configured free preview.
    // Full paid access is loaded after hydration through the authenticated quiz API.
    const questions = previewState.previewEnabled
      ? filteredQuestions.slice(0, previewState.previewLimit)
      : [];
    const clientQuestions = toClientSafeValue(questions);

    // Get nested page slug for back button
    let parentPageSlug = "";
    if (mapping.subPageId) {
      const parentPageMappingResult = await getRouteMappingById({
        pillarId,
        type: "sub",
        id: mapping.subPageId,
      });
      if (parentPageMappingResult.success && parentPageMappingResult.data) {
        const parentPageData = parentPageMappingResult.data as any;
        parentPageSlug = parentPageData.slug || "";
      }
    }

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

    // Public quiz pages are statically generated, so related quiz links must be
    // derived from Firestore here instead of client auth state for indexing.
    const publicRelatedQuizzes = relatedQuizzes
      .filter((quiz: any) => {
        const status = String(quiz.status || "").toLowerCase();
        return quiz.active !== false && status !== "archived";
      })
      .sort((first: any, second: any) => {
        const firstSet = Number(first.setNumber || Number.MAX_SAFE_INTEGER);
        const secondSet = Number(second.setNumber || Number.MAX_SAFE_INTEGER);
        if (firstSet !== secondSet) return firstSet - secondSet;
        const firstName = String(first.pageName || first.title || first.quizName || first.id);
        const secondName = String(second.pageName || second.title || second.quizName || second.id);
        return firstName.localeCompare(secondName);
      })
      .slice(0, 12);

    const examProductLabel =
      pageData.examAccessProductId === "hesi_a2"
        ? "HESI A2"
        : pageData.examAccessProductId === "ati_teas_7"
          ? "ATI TEAS 7"
          : previewState.productLabel;
    const subjectLabel =
      pageData.subjectName ||
      pageData.subject ||
      pageData.hero?.title ||
      pageData.pageName ||
      "Practice Set";
    const setLabel = pageData.setNumber ? `Set ${pageData.setNumber}` : "Practice Set";
    const quizTitle = pageData.pageName || pageData.quizName || subjectLabel;
    const rawQuizDescription =
      pageData.description ||
      pageData.hero?.description ||
      pageData.meta?.description ||
      `Practice ${subjectLabel} questions and review explanations at your own pace.`;
    const quizDescription =
      typeof rawQuizDescription === "string" &&
      /^content for\b/i.test(rawQuizDescription.trim())
        ? `Practice questions for ${setLabel}. Review each answer with explanations when you are ready.`
        : rawQuizDescription;
    const totalAvailableQuestions = filteredQuestions.length;
    const previewQuestionCount = questions.length;
    const lockedQuestionCount = previewState.hiddenQuestionCount;
    const relatedSectionTitle = `More ${subjectLabel} Practice Sets`;
    const relatedSectionIntro = `Continue with other ${subjectLabel} sets when you are ready for more practice.`;
    const categoryLabel =
      pillarId === "nursing-test-bank"
        ? "Nursing Test Bank"
        : pillarId === "nursing-exit-exam"
          ? "Nursing Exit Exam"
          : "Nursing Entrance Exam";
    const educationalLevel =
      pillarId === "nursing-test-bank"
        ? "Nursing school test bank practice"
        : pillarId === "nursing-exit-exam"
          ? "Nursing exit exam preparation"
          : "Nursing entrance exam preparation";
    const publicQuizSchema = buildQuizSchemaMarkup({
      slug,
      quizName: quizTitle,
      description: quizDescription,
      examProductName: examProductLabel,
      subjectName: subjectLabel,
      categoryName: categoryLabel,
      educationalLevel,
      setNumber: pageData.setNumber,
      estimatedMinutes: pageData.estimatedMinutes,
      questionCount: totalAvailableQuestions > 0 ? totalAvailableQuestions : undefined,
      breadcrumbs: [
        { name: categoryLabel, slug: pillarId },
        ...(parentPageSlug ? [{ name: examProductLabel, slug: parentPageSlug }] : []),
        ...(nestedPageSlug ? [{ name: subjectLabel, slug: nestedPageSlug }] : []),
        { name: quizTitle, slug },
      ],
      questions: clientQuestions.map((question: any) => ({
        id: question.id,
        question: question.question,
      })),
    });

    return (
      <Layout initialBreadcrumbItems={initialBreadcrumbItems}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: publicQuizSchema,
          }}
        />

        <main className="user-page">
          <div className="user-page-container">
            <header className="user-page-header">
              <div className="user-page-header-row">
                <div className="user-page-header-copy">
                  <div className="mb-4 flex flex-col items-start gap-3">
                    {nestedPageSlug && (
                      <Link
                        href={`/${nestedPageSlug}`}
                        className="user-button-secondary min-h-[34px] w-fit px-3 py-1.5 text-sm"
                      >
                        Back to {subjectLabel}
                      </Link>
                    )}
                    <p className="user-eyebrow m-0 inline-flex items-center gap-2">
                      <span className="user-accent-dot shrink-0" />
                      {examProductLabel} Practice
                    </p>
                  </div>
                  <h1 className="user-page-title mt-2">{quizTitle}</h1>
                  <p className="user-body-sm mt-3">{quizDescription}</p>
                  <div className="user-page-header-meta mt-4">
                    <span className="user-pill user-pill-purple">{examProductLabel}</span>
                    <span className="user-pill">{subjectLabel}</span>
                    <span className="user-badge user-badge-green">
                      {totalAvailableQuestions} {totalAvailableQuestions === 1 ? "question" : "questions"}
                    </span>
                    {!previewState.previewEnabled ? (
                      <span className="user-badge user-badge-amber">Access required</span>
                    ) : previewState.hiddenQuestionCount > 0 ? (
                      <span className="user-badge user-badge-amber">
                        {previewQuestionCount} question preview
                      </span>
                    ) : (
                      <span className="user-badge user-badge-green">Full set available</span>
                    )}
                  </div>
                </div>
                <div className="user-page-header-actions w-full sm:w-auto">
                  <button type="button" className="user-button-secondary w-full sm:w-auto" disabled>
                    Go To Exam Mode
                  </button>
                </div>
              </div>
            </header>

            <section className="user-card mb-4 p-3 sm:mb-5 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="user-pill">{setLabel}</span>
                  <span className="user-badge">{previewQuestionCount} visible</span>
                  {lockedQuestionCount > 0 ? (
                    <span className="user-badge user-badge-amber">
                      {lockedQuestionCount} locked
                    </span>
                  ) : (
                    <span className="user-badge user-badge-green">No locked questions</span>
                  )}
                  <span className="user-pill user-pill-purple">Review Mode</span>
                </div>
                <p className="user-helper max-w-2xl text-sm">
                  Review Mode lets you answer first, then reveal explanations when you are ready.
                </p>
              </div>
            </section>

            <section id="questions-start" className="space-y-3 sm:space-y-4">
              <DynamicQuizQuestions
                slug={slug}
                previewQuestions={clientQuestions}
                totalQuestionCount={filteredQuestions.length}
                hiddenQuestionCount={previewState.hiddenQuestionCount}
                productLabel={previewState.productLabel}
                questionTypes={questionTypes}
              />
            </section>

            {publicRelatedQuizzes.length > 0 && (
              <section className="user-card mt-6 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="user-section-title">{relatedSectionTitle}</h2>
                    <p className="user-helper mt-1">{relatedSectionIntro}</p>
                  </div>
                  <span className="user-badge user-badge-purple">
                    {publicRelatedQuizzes.length} available
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {publicRelatedQuizzes.slice(0, 9).map((quiz: any) => {
                    const quizSlug = quizSlugMap[quiz.id] || quiz.slug || quiz.id;
                    const quizName =
                      quiz.pageName || quiz.title || quiz.quizName || quiz.id;
                    const questionCount = Number(quiz.questionCount || 0);

                    return (
                      <article key={quiz.id} className="user-feature-surface flex min-h-[190px] flex-col p-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="user-pill user-pill-purple">
                            {quiz.setNumber ? `Set ${quiz.setNumber}` : "Practice Set"}
                          </span>
                          <span className="user-badge">
                            {questionCount > 0
                              ? `${questionCount} ${questionCount === 1 ? "question" : "questions"}`
                            : "Questions"}
                          </span>
                        </div>
                        <h3 className="mt-4">
                          <Link
                            href={`/${quizSlug}`}
                            className="group inline-flex break-words rounded-lg text-[#0f172a] no-underline transition-colors hover:text-[#4338ca] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(79,70,229,0.22)]"
                          >
                            <span className="user-card-title underline decoration-[#c7d2fe] decoration-2 underline-offset-4 group-hover:decoration-[#4338ca]">
                              {quizName}
                            </span>
                            <ArrowUpRight
                              className="ml-2 mt-0.5 h-4 w-4 shrink-0 text-[#4338ca] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        </h3>
                        <p className="user-helper mt-2 flex-1">
                          Continue with another {subjectLabel} practice set and review explanations at your own pace.
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
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
  let _quizSlugMap: Record<string, string> = {};

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
          _quizSlugMap = slugMapResult.slugMap;
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
          _quizSlugMap = slugMapResult.slugMap;
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
        _quizSlugMap = slugMapResult.slugMap;
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
    pageName: pageData.pageName || pageData.seoLabel || slug,
    meta: pageData.meta || {
      title: `${slug} | NursingMocks`,
      description: `Content for ${slug}`,
      keywords: `${slug}`,
      ogTitle: `${slug} | NursingMocks`,
      ogDescription: `Content for ${slug}`,
      ogImage: getImageUrl("/nursing-mocks-logo.png"),
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
  const { tocItems, contentWithHeadingIds } = buildTocAndBodyContent(bodyContent);
  const isPublicSubPage = pageType === "sub" || pageType === "nested";
  const pillarLabel = getPublicPillarLabel(pillarId);
  const pageName = titleCaseWords(stripHtml(content.pageName || pageHeading || slug));
  const examBadge = getExamBadgeLabel(pageData, pageName);
  const actionLabels = getSubPageActionLabels(examBadge);
  const displayCopy = pageData.displayCopy || {};
  const childItemLabel =
    pageType === "nested"
      ? pillarId === "nursing-test-bank"
        ? "Topic"
        : "Exam"
      : "Subject";
  const childItemPlural =
    childItemLabel === "Topic"
      ? "topics"
      : childItemLabel === "Exam"
        ? "exams"
        : "subjects";
  const childSummaryLabel =
    childItemPlural.charAt(0).toUpperCase() + childItemPlural.slice(1);
  const childSectionEyebrow =
    getDisplayCopyOverride(displayCopy, "practiceEyebrow") ||
    (childItemLabel === "Subject"
      ? "Start By Subject"
      : `Start By ${childItemLabel}`);
  const childSectionTitle =
    getDisplayCopyOverride(displayCopy, "practiceTitle") ||
    (childItemLabel === "Subject"
      ? actionLabels.sectionTitle
      : `${examBadge} Practice ${childItemPlural.charAt(0).toUpperCase()}${childItemPlural.slice(1)}`);
  const childSectionDescription =
    getDisplayCopyOverride(displayCopy, "practiceDescription") ||
    `Pick the ${childItemLabel.toLowerCase()} that matches your study plan. Each link opens the exact practice page for that ${childItemLabel.toLowerCase()}.`;
  const guideSectionTitle =
    getDisplayCopyOverride(displayCopy, "guideTitle") || `${pageName} Guide`;
  const guideSectionDescription =
    getDisplayCopyOverride(displayCopy, "guideDescription") ||
    "Use the guide navigation to move through the full saved content without scrolling through one long article.";
  const faqSectionTitle =
    getDisplayCopyOverride(displayCopy, "faqTitle") || `${pageName} Questions`;
  const faqSectionDescription =
    getDisplayCopyOverride(displayCopy, "faqDescription") ||
    `Answers to common questions students ask before starting ${examBadge} practice on NursingMocks.`;
  const primaryChildAction =
    getDisplayCopyOverride(displayCopy, "primaryCtaLabel") ||
    (childItemLabel === "Subject"
      ? actionLabels.primary
      : `Start ${examBadge} Practice`);
  const secondaryChildAction =
    getDisplayCopyOverride(displayCopy, "secondaryCtaLabel") ||
    (childItemLabel === "Subject"
      ? actionLabels.secondary
      : `View ${examBadge} ${childItemPlural.charAt(0).toUpperCase()}${childItemPlural.slice(1)}`);
  const effectiveActionLabels = {
    ...actionLabels,
    primary: primaryChildAction,
    secondary: secondaryChildAction,
  };
  const publishedNestedPages = nestedPages.filter((nestedPage: any) => {
    const status = String(nestedPage?.status || "Published").toLowerCase();
    const hasPublicRoute = Boolean(_nestedPageSlugMap[nestedPage.id]);

    if (status === "archived") {
      return false;
    }

    // Some legacy nested pages were left as Draft even after public route
    // mappings were created. The route mapping is the stronger signal that the
    // child page is crawlable and should be listed from the public parent hub.
    if (status === "draft") {
      return hasPublicRoute;
    }

    return true;
  });
  const publishedTopics = topics.filter((topic: any) => {
    const status = String(topic?.status || "Published").toLowerCase();
    return topic.active !== false && status !== "archived";
  });
  const publishedQuizzes = quizzes.filter((quiz: any) => {
    const status = String(quiz?.status || "Published").toLowerCase();
    return quiz.active !== false && status !== "archived";
  });
  const childSource =
    pageType === "nested"
      ? pillarId === "nursing-test-bank"
        ? publishedTopics
        : publishedQuizzes
      : publishedNestedPages;
  const childCards = childSource.map((child: any) => {
    const rawName =
      child.seoLabel ||
      child.pageName ||
      child.heading ||
      child.title ||
      child.quizName ||
      child.topicName ||
      child.slug ||
      child.id;
    const title = titleCaseWords(stripHtml(rawName));
    const slugValue =
      pageType === "nested" && pillarId === "nursing-test-bank"
        ? _topicSlugMap[child.id] || child.slug || child.seoSlug || child.id
        : pageType === "nested"
          ? _quizSlugMap[child.id] || child.slug || child.seoSlug || child.id
          : _nestedPageSlugMap[child.id] || child.slug || child.seoSlug || child.id;
    const questionCount = typeof child.questionCount === "number" ? child.questionCount : null;
    const description = getPublicCardDescription(child, title);

    return {
      id: child.id || slugValue,
      title,
      href: `/${String(slugValue).replace(/^\/+/, "")}`,
      questionCount,
      description,
    };
  });
  const firstChildHref = childCards[0]?.href || "#content";
  const totalChildQuestions = childCards.reduce(
    (total, card) => total + (card.questionCount ?? 0),
    0
  );
  const guideSections = await buildGuideSections(
    contentWithHeadingIds,
    tocItems,
    `${pageName} Guide`
  );

  if (isPublicSubPage) {
    return (
      <Layout initialBreadcrumbItems={initialBreadcrumbItems}>
        {content.schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: content.schema,
            }}
          />
        )}

        <main className="user-page">
          <div className="user-page-container">
            <PublicSubPageHero
              pillarHref={`/${pillarId}`}
              pillarLabel={pillarLabel}
              examBadge={examBadge}
              pageHeading={pageHeading}
              pageDescription={pageDescription}
              childCards={childCards}
              childSummaryLabel={childSummaryLabel}
              firstChildHref={firstChildHref}
              actionLabels={effectiveActionLabels}
              totalChildQuestions={totalChildQuestions}
            />

            <div className="public-hero-body-divider" aria-hidden="true" />

            {childCards.length > 0 && (
              <section id="practice-paths" className="mb-5">
                <div className="mx-auto mb-5 flex max-w-3xl flex-col items-center gap-3 text-center">
                  <div>
                    <p className="user-eyebrow m-0">{childSectionEyebrow}</p>
                    <h2 className="user-section-title public-section-heading mt-2">
                      {childSectionTitle}
                    </h2>
                  </div>
                  <p className="user-helper max-w-2xl">
                    {childSectionDescription}
                  </p>
                </div>

                <div className="user-card p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {childCards.map((card) => (
                      <article key={card.id} className="user-card flex min-h-[210px] flex-col p-4 shadow-none">
                        <div className="mb-4">
                          <span className="user-pill user-pill-purple">{childItemLabel}</span>
                          {card.questionCount !== null && (
                            <span className="mt-3 block text-base font-bold leading-6 text-[#0f766e]">
                              {card.questionCount} questions
                            </span>
                          )}
                        </div>
                        <h3 className="user-card-title">{card.title}</h3>
                        <p className="user-helper public-card-description mt-2 flex-1">
                          {card.description}
                        </p>
                        <Link
                          href={card.href}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#5548e0] no-underline"
                        >
                          {card.title}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-5">
              {bodyContent && guideSections.length > 0 && (
                <PublicSubPageGuide
                  title={guideSectionTitle}
                  description={guideSectionDescription}
                  sections={guideSections}
                />
              )}

              {Array.isArray(pageData.faqs) && pageData.faqs.length > 0 && (
                <section className="public-faq-section">
                  <div className="public-faq-inner">
                    <div className="public-faq-heading">
                      <h2>{faqSectionTitle}</h2>
                      <p>{faqSectionDescription}</p>
                    </div>

                    <div className="public-faq-list">
                      {pageData.faqs.map(
                        (faq: any, idx: number) =>
                          faq?.question &&
                          faq?.answer && (
                            <details key={`${idx}-${faq.question}`} open={idx === 0}>
                              <summary>
                                <span>{String(faq.question)}</span>
                                <span className="public-faq-toggle" aria-hidden="true">
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </span>
                              </summary>
                              <div className="public-faq-answer">
                                <p>{String(faq.answer)}</p>
                              </div>
                            </details>
                          )
                      )}
                    </div>
                  </div>
                </section>
              )}
            </section>
          </div>
        </main>
      </Layout>
    );
  }

  // Render content page (sub, nested, or topic)
  return (
    <Layout initialBreadcrumbItems={initialBreadcrumbItems}>
      {/* Schema Script */}
      {content.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: content.schema,
          }}
        />
      )}

      <main className="user-page">
        <div className="user-page-container">
        <header className="user-page-header">
          <div className="user-page-header-row">
            <div className="user-page-header-copy">
              <div className="mb-4 flex flex-col items-start gap-3">
                <Link
                  href={`/${pillarId}`}
                  className="user-button-secondary min-h-[34px] w-fit px-3 py-1.5 text-sm"
                >
                  Back to {pillarLabel}
                </Link>
                <p className="user-eyebrow m-0 inline-flex items-center gap-2">
                  <span className="user-accent-dot shrink-0" />
                  {examBadge} Practice
                </p>
              </div>
              <h1 className="user-page-title mt-2">
                <ContentRenderer content={pageHeading} />
              </h1>
              <div className="user-body-sm mt-3 max-w-[88ch] [&_.rich-text-content_p]:mb-0 [&_.rich-text-content_p:last-child]:mb-0 [&_.pb-25]:!pb-0 [&_div.pb-25]:!pb-0">
                <ContentRenderer content={pageDescription} />
              </div>
              <div className="user-page-header-meta mt-4">
                <span className="user-pill user-pill-purple">{examBadge}</span>
                <span className="user-pill">{pillarLabel}</span>
                <span className="user-badge user-badge-green">Free preview available</span>
                {childCards.length > 0 && (
                  <span className="user-badge">
                    {childCards.length} {childCards.length === 1 ? childItemLabel.toLowerCase() : childItemPlural}
                  </span>
                )}
              </div>
            </div>
            <div className="user-page-header-actions w-full sm:w-auto">
              <a href={firstChildHref} className="user-button-primary w-full sm:w-auto">
                {primaryChildAction}
              </a>
              <a href="#practice-paths" className="user-button-secondary w-full sm:w-auto">
                {secondaryChildAction}
              </a>
            </div>
          </div>
        </header>

        {false && (
        <>
        {/* Hero Section */}
        <section className="mb-7">
          {/* Hero Wrapper */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/80 p-5 sm:p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] gap-8 items-center bg-gradient-to-br from-white via-[#f4f2ff] to-[#eaf7ff] shadow-[0_24px_70px_rgba(69,56,154,0.18)]">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 border border-[#d9d7ff] backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-[#5548e0] mb-[14px] shadow-sm">
                <span className="w-[7px] h-[7px] rounded-full bg-[#2dd4bf]" />
                <span>{examBadge} - {childItemLabel}-Based Practice Hub</span>
                {false && (
                <span>
                  {pageData.badge ||
                    `${
                      pageData.seoLabel || content.pageName
                    } Practice`}
                </span>
                )}
              </div>

              {/* Hero Title */}
              <h1 className="text-[34px] sm:text-[44px] lg:text-[54px] leading-[1.06] font-extrabold mb-4 text-[#202437] max-w-[760px]">
                <ContentRenderer content={pageHeading} />
              </h1>

              {/* Hero Description */}
              <div className="text-base sm:text-lg leading-8 text-[#3b4058] max-w-[720px] mb-6 [&_.rich-text-content_p]:mb-0 [&_.rich-text-content_p:last-child]:mb-0 [&_.pb-25]:!pb-0 [&_div.pb-25]:!pb-0">
                <ContentRenderer content={pageDescription} />
              </div>

              {/* Hero Chip Row */}
              <div className="flex flex-wrap gap-2 mb-[18px]">
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  {examBadge}
                </div>
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  {pillarLabel}
                </div>
                <div className="inline-flex items-center gap-[6px] px-[11px] py-1 rounded-full bg-[rgba(255,255,255,0.98)] border border-dotted border-[rgba(188,195,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  Free preview available
                </div>
              </div>

              {/* Hero Actions */}
              <div className="flex flex-wrap gap-[10px] items-center mb-2">
                <a
                  href={firstChildHref}
                  className="inline-flex items-center justify-center gap-2 px-[22px] py-[10px] rounded-full bg-gradient-to-r from-[#6a5cff] to-[#8b5cf6] text-white font-semibold text-sm border-none shadow-[0_20px_42px_rgba(90,78,255,0.6)] cursor-pointer no-underline whitespace-nowrap hover:brightness-[1.03]"
                >
                  <span className="hidden">
                    ▶
                  </span>
                  {primaryChildAction}
                </a>
                <a
                  href="#practice-paths"
                  className="inline-flex items-center justify-center gap-[6px] px-4 py-[9px] rounded-full border border-dashed border-[rgba(106,92,255,0.32)] bg-[rgba(255,255,255,0.96)] text-[13px] font-medium text-[#202437] no-underline shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:bg-[#f3f4ff]"
                >
                  {secondaryChildAction}
                </a>
              </div>

              {/* Hero Footnote */}
              <p className="text-[11.5px] text-[#7a819c] max-w-[520px] mt-[2px]">
                Choose a {childItemLabel.toLowerCase()}, start with the available preview, and continue deeper practice when your access is active.
              </p>
            </div>

            {/* KB Articles Header Card */}
            <div className="relative z-10 pl-3 mt-3 items-end hidden lg:flex sm:max-w-[420px] sm:mx-auto sm:mt-1">
              <div className="max-w-[420px] w-full bg-white rounded-[22px] p-4 pb-[18px] shadow-[0_16px_40px_rgba(15,23,42,0.16)] border border-[rgba(148,163,184,0.45)]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#4b5563]">
                    Practice Paths
                  </div>
                  <div className="text-[11px] py-1 px-2.5 rounded-full bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] whitespace-nowrap">
                    {childCards.length || "New"} {childCards.length === 1 ? childItemLabel : `${childItemLabel}s`}
                  </div>
                </div>

                <div className="space-y-3 mb-3">
                  {childCards.slice(0, 4).map((card) => (
                    <Link
                      key={card.id}
                      href={card.href}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#e3e6f3] bg-[#fbfcff] p-3 text-left no-underline transition hover:border-[#6a5cff] hover:bg-white hover:shadow-md"
                    >
                      <span>
                        <span className="block text-sm font-bold text-[#202437] group-hover:text-[#4338ca]">
                          {card.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#747b96]">
                          {card.questionCount !== null
                            ? `${card.questionCount} questions`
                            : "Practice sets available"}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#6a5cff] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  ))}
                  {childCards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#d8d7f7] bg-[#fbfcff] p-4 text-sm text-[#5f6680]">
                      Practice paths will appear here once child pages have public routes.
                    </div>
                  )}
                </div>

                {false && (
                <>
                <div className="hidden grid-cols-2 gap-2.5 gap-x-3 mb-3">
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

                <div className="hidden text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
                  Knowledge Base coverage for your plan
                </div>
                <div className="hidden w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[72%] bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] rounded-full" />
                </div>
                </>
                )}
              </div>
            </div>
          </div>
        </section>
        </>
        )}

        {isPublicSubPage && childCards.length > 0 && (
          <section id="practice-paths" className="mb-9">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase text-[#6a5cff]">
                  {childSectionEyebrow}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#202437] sm:text-3xl">
                  {childSectionTitle}
                </h2>
              </div>
              <p className="max-w-[520px] text-sm leading-6 text-[#68708a]">
                Pick the {childItemLabel.toLowerCase()} that matches your study plan. Each link opens the exact practice page for that {childItemLabel.toLowerCase()}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {childCards.map((card) => (
                <article
                  key={card.id}
                  className="group flex min-h-[210px] flex-col rounded-[22px] border border-[#e1e5f2] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#beb9ff] hover:shadow-[0_18px_44px_rgba(79,70,229,0.15)]"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#f1efff] px-3 py-1 text-xs font-bold text-[#5548e0]">
                      {childItemLabel}
                    </span>
                    {card.questionCount !== null && (
                      <span className="rounded-full bg-[#ecfeff] px-3 py-1 text-xs font-bold text-[#0f766e]">
                        {card.questionCount} questions
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-extrabold leading-snug text-[#202437]">
                    {card.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-6 text-[#68708a]">
                    {card.description}
                  </p>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#5548e0] no-underline"
                  >
                    Start {card.title}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}


        {/* MOBILE-ONLY KB HERO CARD - removed from mobile view */}

        {/* MOBILE ONLY: On this page card */}
        {tocItems.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-[16px] border border-[rgba(148,163,184,0.5)] shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-[12px_14px] text-[13px] w-full">
              <div className="text-sm font-semibold mb-1 text-[#202437]">
                On this page
              </div>
              <div className="text-xs text-[#6b7280] mb-2">
                Jump to any section of the article.
              </div>
              <ul className="list-none p-0 m-0 text-[13px]">
                {tocItems.map((item, index) => (
                  <li
                    key={item.id}
                    className="py-1"
                    style={{ paddingLeft: `${Math.max(0, item.level - 1) * 8}px` }}
                  >
                    <a
                      href={`#${item.id}`}
                      className="text-[#5548e0] no-underline hover:underline break-words"
                    >
                      {index + 1}. {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <section id="content" className="mt-5 sm:mt-8">

          <div className="grid grid-cols-1 gap-6 items-start w-full">
            {/* LEFT COLUMN: Article + FAQ */}
            <div className="flex flex-col gap-8 w-full">
              <article className="bg-white rounded-[24px] border border-[#e1e5f2] shadow-[0_18px_48px_rgba(15,23,42,0.08)] p-5 sm:p-7 lg:p-8 w-full overflow-hidden">
                {bodyContent && (
                  <div className="public-tiptap-content">
                    <TiptapContentRenderer content={contentWithHeadingIds} />
                  </div>
                )}
              </article>

              {/* FAQ */}
              {Array.isArray(pageData.faqs) && pageData.faqs.length > 0 && (
                <section className="text-left">
                  <div className="text-center mb-10">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                      {content.pageName} Questions
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 text-slate-900">
                      {content.pageName} Practice Test FAQ
                    </h2>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                      Frequently asked questions for this page.
                    </p>
                  </div>

                  <div className="max-w-[800px] mx-auto">
                    <div className="space-y-3">
                      {pageData.faqs.map(
                        (faq: any, idx: number) =>
                          faq?.question &&
                          faq?.answer && (
                            <FAQAccordion
                              key={`${idx}-${faq.question}`}
                              question={String(faq.question)}
                              answer={String(faq.answer)}
                              defaultOpen={idx === 0}
                            />
                          )
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: sidebar (hidden on mobile) */}
            <aside className="hidden flex-col gap-3 w-full lg:sticky lg:top-24">
              {tocItems.length > 0 && (
                <div className="bg-white rounded-[16px] border border-[rgba(148,163,184,0.5)] shadow-[0_16px_40px_rgba(15,23,42,0.10)] p-[12px_14px] text-[13px] w-full">
                  <div className="text-sm font-semibold mb-1 text-[#202437]">
                    On this page
                  </div>
                  <div className="text-xs text-[#6b7280] mb-2">
                    Jump to any section of the article.
                  </div>
                  <ul className="list-none p-0 m-0 text-[13px]">
                    {tocItems.map((item, index) => (
                      <li
                        key={item.id}
                        className="py-1"
                        style={{ paddingLeft: `${Math.max(0, item.level - 1) * 8}px` }}
                      >
                        <a
                          href={`#${item.id}`}
                          className="text-[#5548e0] no-underline hover:underline break-words"
                        >
                          {index + 1}. {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </aside>
          </div>
        </section>
        </div>
      </main>
    </Layout>
  );
}
