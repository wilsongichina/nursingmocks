import { getCanonicalSiteUrl, getSiteName } from "@/lib/config";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface SchemaBreadcrumbNode {
  name: string;
  slug?: string;
}

export interface SchemaQuestion {
  id?: string;
  question?: string;
}

export interface QuizSchemaInput {
  slug: string;
  quizName: string;
  description?: string;
  examProductName: string;
  subjectName?: string;
  categoryName?: string;
  educationalLevel?: string;
  setNumber?: number | string;
  estimatedMinutes?: number | string;
  questionCount?: number;
  includeAcceptedAnswers?: boolean;
  breadcrumbs: SchemaBreadcrumbNode[];
  questions?: SchemaQuestion[];
}

export interface SchemaListItem {
  name?: string;
  slug?: string;
  description?: string;
}

export interface SchemaFaqItem {
  question?: string;
  answer?: string;
}

export interface PublicPageSchemaInput {
  slug: string;
  pageName: string;
  description?: string;
  categoryName?: string;
  parentName?: string;
  pageType?: "WebPage" | "CollectionPage";
  breadcrumbs: SchemaBreadcrumbNode[];
  childItems?: SchemaListItem[];
  faqs?: SchemaFaqItem[];
}

function cleanText(value: unknown): string {
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
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function absoluteUrl(slug?: string) {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  const cleanSlug = String(slug || "").replace(/^\/+/, "").replace(/\/+$/, "");
  return cleanSlug ? `${siteUrl}/${cleanSlug}` : siteUrl;
}

function compactJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => compactJsonValue(item))
      .filter((item): item is JsonValue => item !== undefined);
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, compactJsonValue(item)] as const)
      .filter((entry): entry is readonly [string, JsonValue] => entry[1] !== undefined);
    return Object.fromEntries(entries) as JsonValue;
  }
  return undefined;
}

function thingList(...values: unknown[]) {
  const names = Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean)));
  return names.map((name) => ({
    "@type": "Thing",
    name,
  }));
}

export function buildQuizSchemaObject(input: QuizSchemaInput): JsonValue {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  const siteName = getSiteName();
  const pageUrl = absoluteUrl(input.slug);
  const quizId = `${pageUrl}#quiz`;
  const visibleQuestions = input.questions || [];
  const cleanQuizName = cleanText(input.quizName);
  const cleanSubjectName = cleanText(input.subjectName);
  const cleanExamProductName = cleanText(input.examProductName);
  const cleanCategoryName = cleanText(input.categoryName);
  const description =
    cleanText(input.description) ||
    `Practice ${cleanSubjectName || cleanQuizName} questions for ${cleanExamProductName || "your nursing exam preparation"}.`;

  const breadcrumbNodes = [
    { name: "Home", slug: "" },
    ...input.breadcrumbs.filter((node) => cleanText(node.name)),
  ];

  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("nursing-mocks-logo.png"),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: cleanQuizName,
      description,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      mainEntity: {
        "@id": quizId,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbNodes.map((node, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cleanText(node.name),
        item: absoluteUrl(node.slug),
      })),
    },
    {
      "@type": ["Quiz", "LearningResource"],
      "@id": quizId,
      name: cleanQuizName,
      description,
      url: pageUrl,
      educationalLevel: cleanText(input.educationalLevel) || "Nursing entrance exam preparation",
      learningResourceType: "Practice quiz",
      teaches: cleanSubjectName || cleanExamProductName,
      about: thingList(cleanExamProductName, cleanSubjectName, cleanCategoryName),
      timeRequired: numericValue(input.estimatedMinutes) ? `PT${numericValue(input.estimatedMinutes)}M` : undefined,
      position: numericValue(input.setNumber),
      hasPart: visibleQuestions.map((question, index) => ({
        "@type": "Question",
        "@id": `${pageUrl}#question-${index + 1}`,
        name: `Question ${index + 1}`,
        text: cleanText(question.question),
      })),
      inLanguage: "en-US",
    },
  ];

  return compactJsonValue({
    "@context": "https://schema.org",
    "@graph": graph,
  }) as JsonValue;
}

export function buildQuizSchemaMarkup(input: QuizSchemaInput): string {
  return JSON.stringify(buildQuizSchemaObject(input), null, 2);
}

export function buildPublicPageSchemaObject(input: PublicPageSchemaInput): JsonValue {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  const siteName = getSiteName();
  const pageUrl = absoluteUrl(input.slug);
  const pageId = `${pageUrl}#webpage`;
  const cleanPageName = cleanText(input.pageName);
  const cleanCategoryName = cleanText(input.categoryName);
  const cleanParentName = cleanText(input.parentName);
  const description =
    cleanText(input.description) ||
    `Review ${cleanPageName} resources for ${cleanCategoryName || "nursing exam preparation"}.`;

  const breadcrumbNodes = [
    { name: "Home", slug: "" },
    ...input.breadcrumbs.filter((node) => cleanText(node.name)),
  ];

  const visibleChildItems = (input.childItems || [])
    .map((item) => ({
      name: cleanText(item.name),
      slug: cleanText(item.slug),
      description: cleanText(item.description),
    }))
    .filter((item) => item.name && item.slug);

  const visibleFaqs = (input.faqs || [])
    .map((item) => ({
      question: cleanText(item.question),
      answer: cleanText(item.answer),
    }))
    .filter((item) => item.question && item.answer);

  const mainEntity =
    visibleChildItems.length > 0
      ? { "@id": `${pageUrl}#content-list` }
      : visibleFaqs.length > 0
        ? { "@id": `${pageUrl}#faq` }
        : undefined;

  const graph: unknown[] = [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("nursing-mocks-logo.png"),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": input.pageType || "WebPage",
      "@id": pageId,
      url: pageUrl,
      name: cleanPageName,
      description,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      about: thingList(cleanCategoryName, cleanParentName, cleanPageName),
      mainEntity,
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbNodes.map((node, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cleanText(node.name),
        item: absoluteUrl(node.slug),
      })),
    },
  ];

  if (visibleChildItems.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#content-list`,
      name: `${cleanPageName} pages`,
      itemListElement: visibleChildItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description || undefined,
        url: absoluteUrl(item.slug),
      })),
    });
  }

  if (visibleFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: visibleFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
      inLanguage: "en-US",
    });
  }

  return compactJsonValue({
    "@context": "https://schema.org",
    "@graph": graph,
  }) as JsonValue;
}

export function buildPublicPageSchemaMarkup(input: PublicPageSchemaInput): string {
  return JSON.stringify(buildPublicPageSchemaObject(input), null, 2);
}

export function buildEntranceQuizSchemaObject(input: QuizSchemaInput): JsonValue {
  return buildQuizSchemaObject(input);
}

export function buildEntranceQuizSchemaMarkup(input: QuizSchemaInput): string {
  return buildQuizSchemaMarkup(input);
}
