import Layout from "@/components/layout/Layout";
import KnowledgeBasePageClient from "./KnowledgeBasePageClient";
import { loadKnowledgeBaseHubSubPages } from "./loadKnowledgeBaseHubSubPages";

export const dynamic = "force-static";

export default async function KnowledgeBaseHubPage() {
  const subPages = await loadKnowledgeBaseHubSubPages();

  return (
    <Layout>
      <KnowledgeBasePageClient subPages={subPages} />
    </Layout>
  );
}
