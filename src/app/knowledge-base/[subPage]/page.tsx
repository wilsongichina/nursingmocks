import Layout from "@/components/layout/Layout";
import KnowledgeBaseSubPageContent from "./KnowledgeBaseSubPageContent";
import {
  getPageBySlug,
  getNursingEntranceExamKbArticles,
  getNursingTestBankKbArticles,
  getNursingExitExamKbArticles,
} from "@/lib/firestore-operations";

/** Pre-render this route at build time (SSG). Other `[subPage]` slugs still work via `dynamicParams`. */
export async function generateStaticParams() {
  return [{ subPage: "ati-teas-practice-test" }];
}

async function loadKnowledgeBaseSubPageData(subPageSlug: string) {
  const result = await getPageBySlug(subPageSlug);
  if (!result.success || !result.data) {
    return { subPage: null as Record<string, unknown> | null, kbArticles: [] as Record<string, unknown>[] };
  }

  const pagePillarId =
    (result as { pillarId?: string }).pillarId ||
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
        article.parentId === subPageId || article.parentSubPageId === subPageId
    );
  }

  return { subPage: result.data as Record<string, unknown>, kbArticles };
}

export default async function KnowledgeBaseSubPage({
  params,
}: {
  params: Promise<{ subPage: string }>;
}) {
  const { subPage: subPageSlug } = await params;
  const { subPage, kbArticles } = await loadKnowledgeBaseSubPageData(subPageSlug);

  return (
    <Layout>
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
