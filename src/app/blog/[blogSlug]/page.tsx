import { getAllBlogs } from "@/lib/firestore-operations";
import ClientPage from "./ClientPage";

// Generate static params for blog pages so they build at build time
export async function generateStaticParams() {
  const result = await getAllBlogs();
  if (!result.success || !result.data) {
    console.log("✓ Generated 0 Blog Pages");
    return [];
  }
  const params = result.data.map((b: any) => {
    const blogSlugFromTitle = (b.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return { blogSlug: blogSlugFromTitle };
  });
  console.log(`✓ Generated ${params.length} Blog Pages`);
  return params;
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ blogSlug: string }>;
}) {
  const { blogSlug } = await params;
  const result = await getAllBlogs();
  if (!result.success || !result.data) return null;
  const foundBlog = result.data.find((b: any) => {
    const blogSlugFromTitle = (b.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return blogSlugFromTitle === blogSlug;
  });
  if (!foundBlog) return null;
  return <ClientPage blog={foundBlog} />;
}
