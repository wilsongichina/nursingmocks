import Layout from "@/components/layout/Layout";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/config";
import { isPublicKnowledgeBaseArticle } from "@/lib/public-route-canonicalization";
import KnowledgeBaseSubPageContent, { stripHtmlTags } from "./KnowledgeBaseSubPageContent";
import {
  getNursingEntranceExamKbArticles,
  getNursingTestBankKbArticles,
  getNursingExitExamKbArticles,
} from "@/lib/firestore-operations";
import { getRouteMappingBySlugOnly, getPageByContentPath } from "@/lib/firestore-build-operations";

/** Pre-render this route at build time (SSG). Other `[subPage]` slugs still work via `dynamicParams`. */
export async function generateStaticParams() {
  return [{ subPage: "ati-teas-practice-test" }];
}

const loadKnowledgeBaseSubPageData = cache(async (subPageSlug: string) => {
  // A KB category must be a real top-level exam page, never a quiz or article
  // that happens to share a slug. Use the registry instead of scanning all quizzes.
  const route = await getRouteMappingBySlugOnly(subPageSlug);
  const mapping = route.data as { refPath?: string; pillarId?: string } | undefined;
  if (!route.success || !mapping?.refPath || !/^pillarPages\/[^/]+\/subPages\/[^/]+$/.test(mapping.refPath)) {
    if (!route.success && route.message.startsWith("Failed")) throw new Error("Unable to load knowledge-base category");
    return { subPage: null, kbArticles: [] };
  }
  const result = await getPageByContentPath(mapping.refPath);
  if (!result.success || !result.data) {
    if (!result.success && result.message.startsWith("Failed")) throw new Error("Unable to load knowledge-base category");
    return { subPage: null as Record<string, unknown> | null, kbArticles: [] as Record<string, unknown>[] };
  }

  const pagePillarId =
    mapping.pillarId ||
    ((result.data as { pillarId?: string }).pillarId ?? "nursing-entrance-exam");

  let articlesResult;
  if (pagePillarId === "nursing-entrance-exam") {
    articlesResult = await getNursingEntranceExamKbArticles();
  } else if (pagePillarId === "nursing-test-bank") {
    articlesResult = await getNursingTestBankKbArticles();
  } else if (pagePillarId === "nursing-exit-exam") {
    articlesResult = await getNursingExitExamKbArticles();
  } else {
    articlesResult = await getNursingEntranceExamKbArticles();
  }

  let kbArticles: Record<string, unknown>[] = [];
  if (articlesResult.success && articlesResult.data) {
    const subPageId = (result.data as { id: string }).id;
    kbArticles = articlesResult.data.filter(
      (article: { parentId?: string; parentSubPageId?: string }) =>
        (article.parentId === subPageId || article.parentSubPageId === subPageId) && isPublicKnowledgeBaseArticle(article as Record<string, unknown>)
    );
  }

  return { subPage: result.data as Record<string, unknown>, kbArticles };
});

export async function generateMetadata({ params }: { params: Promise<{ subPage: string }> }): Promise<Metadata> {
  const { subPage: slug } = await params;
  const { subPage } = await loadKnowledgeBaseSubPageData(slug);
  if (!subPage) notFound();
  return {
    title: `${stripHtmlTags(String(subPage.pageName || subPage.title || slug))} Knowledge Base`,
    alternates: { canonical: `${getCanonicalSiteUrl()}/knowledge-base/${slug}` },
    robots: { index: false, follow: false },
  };
}

export default async function KnowledgeBaseSubPage({
  params,
}: {
  params: Promise<{ subPage: string }>;
}) {
  const { subPage: subPageSlug } = await params;
  const { subPage, kbArticles } = await loadKnowledgeBaseSubPageData(subPageSlug);
  if (!subPage) notFound();

  return (
    <Layout initialBreadcrumbItems={[
      { name: "Home", url: "/" },
      { name: "Knowledge Base", url: "/knowledge-base" },
      { name: stripHtmlTags(String(subPage.pageName || subPage.title || subPageSlug)) },
    ]}>
      <div className="min-h-screen bg-gradient-to-br from-[#f4f2ff] via-[#f5f6fb] to-[#f5f6fb]">
        <div className="w-full px-5 py-6 pb-10 md:px-5 md:py-6 md:pb-10 sm:px-[14px] sm:py-[18px] sm:pb-[30px]">
          <KnowledgeBaseSubPageContent
            subPageSlug={subPageSlug}
            subPage={subPage}
            kbArticles={kbArticles}
          />
        </div>
      </div>
    </Layout>
  );
}
