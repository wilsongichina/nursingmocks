import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { getPublicRouteLookupSlugs, isPublicKnowledgeBaseArticle } from "@/lib/public-route-canonicalization";
import { getIndexableMappedPath, getBlogPublicPath } from "@/lib/public-sitemap";
import fs from "node:fs";
import ts from "typescript";
import { canonicalizePublicPath } from "@/lib/public-route-canonicalization";
import { shouldDeferAuthForPublicPath, shouldLazyLoadAuthForPublicPath, shouldSkipChatForPublicPath } from "@/lib/public-route-performance";

describe("repaired navigation", () => {
  it("renders public article and not-found screens before loading Firebase auth", () => {
    expect(shouldDeferAuthForPublicPath("/ati-teas")).toBe(true);
    expect(shouldLazyLoadAuthForPublicPath("/blog/missing-article")).toBe(true);
    expect(shouldLazyLoadAuthForPublicPath("/knowledge-base/missing-category")).toBe(true);
    expect(shouldLazyLoadAuthForPublicPath("/admin/users")).toBe(false);
    expect(shouldLazyLoadAuthForPublicPath("/dashboard")).toBe(false);
    expect(shouldSkipChatForPublicPath("/blog/study-guide")).toBe(false);
    expect(shouldSkipChatForPublicPath("/knowledge-base/ati-teas-practice-test")).toBe(false);
  });
  it.each([
    ["/hesi-a2", "/hesi-a2-practice-test"],
    ["/nursing", "/nursing-test-bank"],
    ["/nursing-exit-exam/rn-exit-exams-exit-exam", "/rn-exit-exams"],
    ["/nursing-exit-exam/lpn-exit-exams-exit-exam", "/lpn-exit-exams"],
    ["/nursing-exit-exam/rn-exit-exams", "/rn-exit-exams"],
    ["/nursing-exit-exam/lpn-exit-exams", "/lpn-exit-exams"],
  ])("redirects %s to its intended page without losing parameters", (from, to) => {
    const response = middleware(new NextRequest(`https://www.nursingmocks.com${from}?mode=review&source=email`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://www.nursingmocks.com${to}?mode=review&source=email`);
  });

  it("retires /ati-teas while preserving the real practice-test hub", () => {
    expect(getPublicRouteLookupSlugs("ati-teas")).toEqual([]);
    expect(getPublicRouteLookupSlugs("ati-teas-practice-test")).toEqual(["ati-teas-practice-test"]);
    expect(isPublicKnowledgeBaseArticle({ slug: "ati-teas", status: "Published" })).toBe(false);
    expect(isPublicKnowledgeBaseArticle({ slug: "", status: "Draft" })).toBe(false);
    expect(isPublicKnowledgeBaseArticle({ slug: "study-guide", status: "Published" })).toBe(true);
    expect(isPublicKnowledgeBaseArticle({ slug: "study-guide", status: "Draft" })).toBe(false);
  });
});

describe("published sitemap coverage", () => {
  const route = { type: "quiz", slug: "teas-reading-practice-test-set-16", refPath: "pillarPages/nursing-entrance-exam/subPages/teas/nestedSubPages/reading/quizzes/set16" };
  it("uses the canonical quiz URL and permits legacy records without a status field", () => {
    expect(getIndexableMappedPath(route, { status: "Published" })).toBe("/ati-teas-reading-practice-test-set-16");
    expect(getIndexableMappedPath(route, {})).toBe("/ati-teas-reading-practice-test-set-16");
  });
  it("excludes missing, draft, private, retired and intentionally noindexed content", () => {
    expect(getIndexableMappedPath(route)).toBeNull();
    expect(getIndexableMappedPath(route, { status: "Draft" })).toBeNull();
    expect(getIndexableMappedPath(route, { meta: { robots: "noindex, follow" } })).toBeNull();
    expect(getIndexableMappedPath({ ...route, refPath: "knowledgeBase/article" }, {})).toBeNull();
    expect(getIndexableMappedPath({ ...route, refPath: "users/private" }, {})).toBeNull();
    expect(getIndexableMappedPath({ ...route, slug: "ati-teas" }, {})).toBeNull();
  });
  it("matches the title-derived blog URL", () => {
    expect(getBlogPublicPath({ title: "ATI TEAS: Study Guide!" })).toBe("/blog/ati-teas-study-guide");
    expect(getBlogPublicPath({ title: "Private draft", status: "Draft" })).toBeNull();
  });
});

// Exercise the actual server-page helpers with isolated data sources. Importing
// the entire page would initialise unrelated client components and Firebase.
function pageHelpers(dependencies: Record<string, unknown>) {
  const source = fs.readFileSync("src/app/[slug]/page.tsx", "utf8");
  const ast = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ["stripHtml", "titleCaseWords", "getPublicPillarBreadcrumbLabel", "getPublicContentLabel", "getRouteSlugByContentId", "buildGeneratedPageBreadcrumbItems", "getCanonicalUrlForSlug", "noindexMetadata"];
  const selected = ast.statements.filter(statement =>
    ts.isVariableStatement(statement) && statement.declarationList.declarations.some(declaration => names.includes(declaration.name.getText(ast)))
  );
  expect(selected).toHaveLength(names.length);
  const code = ts.transpileModule(selected.map(statement => statement.getText(ast)).join("\n") + "\nreturn { buildGeneratedPageBreadcrumbItems, getCanonicalUrlForSlug, noindexMetadata };", {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const scope = { canonicalizePublicPath, getCanonicalSiteUrl: () => "https://www.nursingmocks.com", ...dependencies };
  return new Function(...Object.keys(scope), code)(...Object.values(scope));
}

describe("knowledge-base breadcrumbs and canonical metadata", () => {
  it("uses the article's real parent, not the mapping's article ID", async () => {
    const helpers = pageHelpers({
      getPageByContentPath: async (path: string) => {
        expect(path).toBe("pillarPages/nursing-entrance-exam/subPages/parent");
        return { success: true, data: { pageName: "ATI TEAS Practice Test" } };
      },
      getRouteMappingById: async ({ id }: { id: string }) => {
        expect(id).toBe("parent");
        return { success: true, data: { slug: "ati-teas-practice-test" } };
      },
    });
    const crumbs = await helpers.buildGeneratedPageBreadcrumbItems({ slug: "guide", mapping: { refPath: "knowledgeBase/article", subPageId: "article", type: "kb" }, pageData: { parentId: "parent", pageName: "Study Guide" } });
    expect(crumbs).toEqual([
      { name: "Home", url: "/" },
      { name: "Nursing Entrance Exam", url: "/nursing-entrance-exam" },
      { name: "ATI TEAS Practice Test", url: "/ati-teas-practice-test" },
      { name: "Study Guide" },
    ]);
  });
  it("never exposes raw IDs or broken links for a missing KB parent", async () => {
    const helpers = pageHelpers({ getPageByContentPath: async () => ({ success: false }), getRouteMappingById: async () => ({ success: false }) });
    const crumbs = await helpers.buildGeneratedPageBreadcrumbItems({ slug: "guide", mapping: { refPath: "knowledgeBase/article", subPageId: "article" }, pageData: { parentId: "deleted-id", pageName: "Guide" } });
    expect(crumbs).toHaveLength(3);
    expect(JSON.stringify(crumbs)).not.toContain("deleted-id");
  });
  it("sets a page-specific canonical without changing KB noindex", () => {
    const helpers = pageHelpers({});
    expect(helpers.getCanonicalUrlForSlug("hesi-a2-math-practice-test-set-1")).toBe("https://www.nursingmocks.com/hesi-a2-math-practice-test-set-1");
    expect(helpers.getCanonicalUrlForSlug("teas-reading-practice-test-set-16")).toBe("https://www.nursingmocks.com/ati-teas-reading-practice-test-set-16");
    expect(helpers.noindexMetadata("study-guide")).toMatchObject({ alternates: { canonical: "https://www.nursingmocks.com/study-guide" }, robots: { index: false, follow: false } });
  });
});
