import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config";

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
  { path: "/teas-english-practice-test-set-1", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/teas-reading-practice-test-set-1", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/teas-science-practice-test-set-1", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/teas-math-practice-test-set-1", changeFrequency: "weekly" as const, priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return INDEXABLE_PAGES.map((page) => ({
    url: page.path === "/" ? baseUrl : `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
