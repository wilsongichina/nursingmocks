import { getAllBlogs } from "@/lib/firestore-operations";
import ClientPage from "./ClientPage";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { getBlogPublicPath } from "@/lib/public-sitemap";
import { getCanonicalSiteUrl } from "@/lib/config";

const loadBlog = cache(async (blogSlug: string) => {
  const result = await getAllBlogs();
  if (!result.success || !result.data) throw new Error("Unable to load blog articles");
  const foundBlog = result.data.find((blog: any) => getBlogPublicPath(blog) === `/blog/${blogSlug}`);
  if (!foundBlog) notFound();
  return foundBlog;
});

export async function generateMetadata({ params }: { params: Promise<{ blogSlug: string }> }): Promise<Metadata> {
  const { blogSlug } = await params;
  const blog = await loadBlog(blogSlug);
  return { title: blog.title, alternates: { canonical: `${getCanonicalSiteUrl()}/blog/${blogSlug}` } };
}

export default async function BlogPage({ params }: { params: Promise<{ blogSlug: string }> }) {
  const { blogSlug } = await params;
  const foundBlog = await loadBlog(blogSlug);
  return <ClientPage blog={foundBlog} />;
}
