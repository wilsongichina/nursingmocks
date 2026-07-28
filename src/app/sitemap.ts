import { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";

const INDEXABLE_PAGES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/guarantees", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/prices", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/money-back-guarantee", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/terms-and-conditions", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/cookie-policy", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/register", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/forgot-password", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/reset-password", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/onboarding", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/thank-you", changeFrequency: "monthly" as const, priority: 0.3 },
];

const ATI_TEAS_INDEXABLE_SETS = [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const ATI_TEAS_SUBJECT_SLUGS = ["english", "reading", "science", "math"];

const ATI_TEAS_QUIZ_PAGES = ATI_TEAS_SUBJECT_SLUGS.flatMap((subject) =>
  ATI_TEAS_INDEXABLE_SETS.map((setNumber) => ({
    path: `/teas-${subject}-practice-test-set-${setNumber}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))
);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getCanonicalSiteUrl();

  return [...INDEXABLE_PAGES, ...ATI_TEAS_QUIZ_PAGES].map((page) => ({
    url: page.path === "/" ? baseUrl : `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
