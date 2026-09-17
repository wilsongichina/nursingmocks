import { canonicalizePublicPath, isRetiredPublicPath } from "@/lib/public-route-canonicalization";

type PublicRecord = Record<string, unknown>;

export const PUBLIC_SITEMAP_PAGES = [
  "/", "/about", "/contact", "/prices", "/how-it-works", "/faqs", "/blog",
  "/nursing-entrance-exam", "/nursing-test-bank", "/nursing-exit-exam",
] as const;

export function getIndexableMappedPath(route: PublicRecord, content?: PublicRecord): string | null {
  const slug = String(route.slug || "").trim();
  const refPath = String(route.refPath || "");
  // Knowledge-base articles are deliberately noindexed. Do not introduce them
  // into the sitemap when rebuilding it from the content registry.
  if (!content || !slug || /[/?#]/.test(slug) || isRetiredPublicPath(slug) ||
    !/^pillarPages\/[^/]+\/subPages\//.test(refPath) ||
    !["sub", "nested", "topic", "quiz"].includes(String(route.type))) return null;
  if (content.status && String(content.status).toLowerCase() !== "published") return null;
  const meta = content.meta as { robots?: unknown; noindex?: boolean } | undefined;
  if (meta?.noindex || String(meta?.robots || "").toLowerCase().includes("noindex")) return null;
  return canonicalizePublicPath(`/${slug}`);
}

export function getBlogPublicPath(blog: PublicRecord): string | null {
  if (blog.status && String(blog.status).toLowerCase() !== "published") return null;
  // Match the title-derived slug used by the blog listing and detail route.
  const slug = String(blog.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug ? `/blog/${slug}` : null;
}
