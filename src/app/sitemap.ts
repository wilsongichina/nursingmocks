import { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getAtiTeasSitemapPath, getIndexableMappedPath, PUBLIC_SITEMAP_PAGES } from "@/lib/public-sitemap";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getCanonicalSiteUrl();
  const db = getAdminDb();
  const registry = await db.collection("routeMappings").get();
  const routes = registry.docs.map((doc) => doc.data()).filter((route) => getAtiTeasSitemapPath(route));
  const paths = new Set<string>(PUBLIC_SITEMAP_PAGES);
  // Bound each read and fetch only publication metadata, never question bodies.
  for (let offset = 0; offset < routes.length; offset += 200) {
    const batch = routes.slice(offset, offset + 200);
    const documents = await db.getAll(...batch.map((route) => db.doc(route.refPath)), {
      fieldMask: ["status", "meta.robots", "meta.noindex"],
    });
    documents.forEach((doc, index) => {
      const path = getIndexableMappedPath(batch[index], doc.exists ? doc.data() : undefined);
      if (path) paths.add(path);
    });
  }
  return [...paths].sort().map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    }));
}
