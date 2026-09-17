import { canonicalizePublicPath, getAtiTeasPathParts } from "@/lib/public-route-canonicalization";

type PublicRecord = Record<string, unknown>;

export const PUBLIC_SITEMAP_PAGES = [
  "/", "/about", "/contact", "/prices", "/how-it-works", "/faqs",
  "/privacy-policy", "/terms-and-conditions",
] as const;

export function getAtiTeasSitemapPath(route: PublicRecord): string | null {
  const slug = String(route.slug || "").trim();
  const refPath = String(route.refPath || "");
  // Only the public ATI TEAS practice catalog is submitted in the sitemap.
  // Other public routes remain available through their existing links.
  if (!slug || /[/?#]/.test(slug) ||
    !/^pillarPages\/nursing-entrance-exam\/subPages\//.test(refPath)) return null;
  const path = canonicalizePublicPath(`/${slug}`);
  const parts = getAtiTeasPathParts(path);
  if (!parts) return null;
  const expectedType = parts.kind === "parent" ? "sub" : parts.setNumber ? "quiz" : "nested";
  return route.type === expectedType ? path : null;
}

export function getIndexableMappedPath(route: PublicRecord, content?: PublicRecord): string | null {
  const path = getAtiTeasSitemapPath(route);
  if (!content || !path) return null;
  const status = String(content.status || "published").toLowerCase();
  // Match the public hub's legacy subject-page rule: a saved public mapping
  // keeps Draft subjects visible. Draft quizzes and archived pages stay out.
  if (status !== "published" && !(status === "draft" && route.type === "nested")) return null;
  const meta = content.meta as { robots?: unknown; noindex?: boolean } | undefined;
  if (meta?.noindex || String(meta?.robots || "").toLowerCase().includes("noindex")) return null;
  return path;
}

export function getBlogPublicPath(blog: PublicRecord): string | null {
  if (blog.status && String(blog.status).toLowerCase() !== "published") return null;
  // Match the title-derived slug used by the blog listing and detail route.
  const slug = String(blog.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug ? `/blog/${slug}` : null;
}
