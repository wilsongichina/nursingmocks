import {
  getNursingEntranceExamSubPages,
  getNursingTestBankSubPages,
  getNursingExitExamSubPages,
  getNestedSubPages,
  getNursingTestBankNestedSubPages,
  getNursingExitExamNestedSubPages,
  getNursingEntranceExamKbArticles,
  getNursingTestBankKbArticles,
  getNursingExitExamKbArticles,
} from "@/lib/firestore-operations";

export interface KnowledgeHubSubPage {
  id: string;
  subPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  description?: string;
  heading?: string;
  hero?: {
    title?: string;
    description?: string;
  };
  pillarId?: string;
  nestedSubPages?: Array<{
    id: string;
    pageName?: string;
    title?: string;
    heading?: string;
  }>;
  kbArticles?: Array<{
    id: string;
    pageName?: string;
    title?: string;
    heading?: string;
    slug?: string;
  }>;
  kbArticlesCount?: number;
}

/** Loads hub cards for /knowledge-base (Firestore). Call from Server Components; JSON-safe for client props. */
export async function loadKnowledgeBaseHubSubPages(): Promise<KnowledgeHubSubPage[]> {
  const allSubPages: KnowledgeHubSubPage[] = [];

  try {
    const [
      entranceResult,
      testBankResult,
      exitResult,
      entranceKbResult,
      testBankKbResult,
      exitKbResult,
    ] = await Promise.all([
      getNursingEntranceExamSubPages(),
      getNursingTestBankSubPages(),
      getNursingExitExamSubPages(),
      getNursingEntranceExamKbArticles(),
      getNursingTestBankKbArticles(),
      getNursingExitExamKbArticles(),
    ]);

    const entranceKbArticles =
      entranceKbResult.success && entranceKbResult.data ? entranceKbResult.data : [];
    const testBankKbArticles =
      testBankKbResult.success && testBankKbResult.data ? testBankKbResult.data : [];
    const exitKbArticles =
      exitKbResult.success && exitKbResult.data ? exitKbResult.data : [];

    if (entranceResult.success && entranceResult.data) {
      for (const subPage of entranceResult.data) {
        const nestedResult = await getNestedSubPages(subPage.id);
        const nestedSubPages =
          nestedResult.success && nestedResult.data
            ? nestedResult.data.slice(0, 3)
            : [];

        const allSubPageKbArticles = entranceKbArticles.filter(
          (kb: { parentId?: string }) => kb.parentId === subPage.id
        );
        const subPageKbArticles = allSubPageKbArticles.slice(0, 4).map(
          (kb: {
            id: string;
            pageName?: string;
            title?: string;
            heading?: string;
            slug?: string;
          }) => ({
            id: kb.id,
            pageName: kb.pageName,
            title: kb.title,
            heading: kb.heading,
            slug: kb.slug,
          })
        );

        allSubPages.push({
          ...subPage,
          pillarId: "nursing-entrance-exam",
          nestedSubPages,
          kbArticles: subPageKbArticles,
          kbArticlesCount: allSubPageKbArticles.length,
        });
      }
    }

    if (testBankResult.success && testBankResult.data) {
      for (const subPage of testBankResult.data) {
        const nestedResult = await getNursingTestBankNestedSubPages(subPage.id);
        const nestedSubPages =
          nestedResult.success && nestedResult.data
            ? nestedResult.data.slice(0, 3)
            : [];

        const allSubPageKbArticles = testBankKbArticles.filter(
          (kb: { parentId?: string }) => kb.parentId === subPage.id
        );
        const subPageKbArticles = allSubPageKbArticles.slice(0, 4).map(
          (kb: {
            id: string;
            pageName?: string;
            title?: string;
            heading?: string;
            slug?: string;
          }) => ({
            id: kb.id,
            pageName: kb.pageName,
            title: kb.title,
            heading: kb.heading,
            slug: kb.slug,
          })
        );

        allSubPages.push({
          ...subPage,
          pillarId: "nursing-test-bank",
          nestedSubPages,
          kbArticles: subPageKbArticles,
          kbArticlesCount: allSubPageKbArticles.length,
        });
      }
    }

    if (exitResult.success && exitResult.data) {
      for (const subPage of exitResult.data) {
        const nestedResult = await getNursingExitExamNestedSubPages(subPage.id);
        const nestedSubPages =
          nestedResult.success && nestedResult.data
            ? nestedResult.data.slice(0, 3)
            : [];

        const allSubPageKbArticles = exitKbArticles.filter(
          (kb: { parentId?: string }) => kb.parentId === subPage.id
        );
        const subPageKbArticles = allSubPageKbArticles.slice(0, 4).map(
          (kb: {
            id: string;
            pageName?: string;
            title?: string;
            heading?: string;
            slug?: string;
          }) => ({
            id: kb.id,
            pageName: kb.pageName,
            title: kb.title,
            heading: kb.heading,
            slug: kb.slug,
          })
        );

        allSubPages.push({
          ...subPage,
          pillarId: "nursing-exit-exam",
          nestedSubPages,
          kbArticles: subPageKbArticles,
          kbArticlesCount: allSubPageKbArticles.length,
        });
      }
    }
  } catch (error) {
    console.error("Error loading knowledge base hub sub-pages:", error);
  }

  return JSON.parse(JSON.stringify(allSubPages)) as KnowledgeHubSubPage[];
}
