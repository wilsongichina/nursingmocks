import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  routes: [] as Record<string, unknown>[],
  content: new Map<string, Record<string, unknown>>(),
  requestedPaths: [] as string[],
}));

vi.mock("@/lib/config", () => ({ getCanonicalSiteUrl: () => "https://www.nursingmocks.com" }));
vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: (name: string) => {
      if (name !== "routeMappings") throw new Error(`Unexpected sitemap collection: ${name}`);
      return { get: async () => ({ docs: store.routes.map(route => ({ data: () => route })) }) };
    },
    doc: (path: string) => path,
    getAll: async (...args: unknown[]) => {
      const paths = args.slice(0, -1) as string[];
      store.requestedPaths.push(...paths);
      return paths.map(path => ({ exists: store.content.has(path), data: () => store.content.get(path) }));
    },
  }),
}));

import sitemap from "@/app/sitemap";

function addRoute(slug: string, type: string, content: Record<string, unknown> | null = {}, pillar = "nursing-entrance-exam") {
  const refPath = `pillarPages/${pillar}/subPages/${slug}`;
  store.routes.push({ slug, type, refPath });
  if (content) store.content.set(refPath, content);
  return refPath;
}

beforeEach(() => {
  store.routes = [];
  store.content.clear();
  store.requestedPaths = [];
});

describe("restricted public sitemap", () => {
  it("submits only core pages and published ATI TEAS catalog URLs, canonicalizing and deduplicating legacy routes", async () => {
    addRoute("ati-teas-practice-test", "sub", { status: "Published" });
    // Real legacy subject records remain Draft but are publicly linked/rendered.
    addRoute("ati-teas-reading-practice-test", "nested", { status: "Draft" });
    addRoute("teas-reading-practice-test-set-1", "quiz");
    addRoute("ati-teas-reading-practice-test-set-1", "quiz");
    const excluded = [
      addRoute("hesi-a2-practice-test", "sub"),
      addRoute("kaplan-admission-test", "sub"),
      addRoute("rn-exams", "sub", {}, "nursing-test-bank"),
      addRoute("rn-exit-exams", "sub", {}, "nursing-exit-exam"),
      addRoute("ati-teas-study-guide", "kb"),
      addRoute("ati-teas", "sub"),
      addRoute("ati-teas-science-practice-test-set-99", "quiz"),
      addRoute("ati-teas-math-practice-test", "nested", {}, "nursing-test-bank"),
      addRoute("ati-teas-english-practice-test", "kb"),
    ];
    const paths = (await sitemap()).map(entry => new URL(entry.url).pathname);
    expect(paths).toEqual([
      "/", "/about", "/ati-teas-practice-test", "/ati-teas-reading-practice-test",
      "/ati-teas-reading-practice-test-set-1", "/contact", "/faqs", "/how-it-works",
      "/prices", "/privacy-policy", "/terms-and-conditions",
    ]);
    expect(store.requestedPaths.filter(path => excluded.includes(path))).toEqual([]);
  });

  it("omits missing, draft and noindexed ATI TEAS records", async () => {
    addRoute("ati-teas-reading-practice-test-set-1", "quiz", null);
    addRoute("ati-teas-reading-practice-test-set-2", "quiz", { status: "Draft" });
    addRoute("ati-teas-reading-practice-test-set-3", "quiz", { meta: { noindex: true } });
    addRoute("ati-teas-reading-practice-test-set-6", "quiz", { meta: { robots: "NOINDEX, follow" } });
    addRoute("ati-teas-reading-practice-test", "nested", { status: "Archived" });
    addRoute("ati-teas-math-practice-test", "nested", { status: "Draft", meta: { noindex: true } });
    const entries = await sitemap();
    expect(entries).toHaveLength(8);
    expect(entries.some(entry => entry.url.includes("ati-teas"))).toBe(false);
  });
});
