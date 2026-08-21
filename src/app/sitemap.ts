import { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";
import { getAllRouteMappings } from "@/lib/firestore-operations";

const STATIC_INDEXABLE_PAGES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/change-log", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/knowledge-base", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/guarantees", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/prices", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
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
  { path: "/nursing-entrance-exam", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/nursing-test-bank", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/nursing-exit-exam", changeFrequency: "weekly" as const, priority: 0.9 },
];

const normalizePath = (path: string) => {
  const normalized = `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return normalized === "/" ? "/" : normalized;
};

const getRoutePriority = (type?: string) => {
  switch (type) {
    case "sub":
      return 0.9;
    case "nested":
      return 0.85;
    case "topic":
      return 0.8;
    case "quiz":
      return 0.7;
    default:
      return 0.7;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getCanonicalSiteUrl();
  const now = new Date();
  const pages = new Map(
    STATIC_INDEXABLE_PAGES.map((page) => [normalizePath(page.path), page])
  );

  const routeMappingsResult = await getAllRouteMappings();

  if (routeMappingsResult.success && Array.isArray(routeMappingsResult.data)) {
    for (const route of routeMappingsResult.data as any[]) {
      const slug = String(route.slug || "").trim();
      const refPath = String(route.refPath || "");

      if (!slug || refPath.startsWith("knowledgeBase/")) {
        continue;
      }

      const path = normalizePath(slug);
      if (!pages.has(path)) {
        pages.set(path, {
          path,
          changeFrequency: "weekly" as const,
          priority: getRoutePriority(route.type),
        });
      }
    }
  }

  return Array.from(pages.values())
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((page) => ({
      url: page.path === "/" ? baseUrl : `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));
}
