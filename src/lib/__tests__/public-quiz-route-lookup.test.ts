import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ATI_TEAS_SET_NUMBERS } from "@/lib/public-route-canonicalization";
import { shouldDeferAuthForPublicPath, shouldLazyLoadAuthForPublicPath } from "@/lib/public-route-performance";

const store = vi.hoisted(() => ({ records: new Map<string, Record<string, unknown>>() }));

function snapshot(slug: string) {
  const data = store.records.get(slug);
  return { empty: !data, docs: data ? [{ id: `route-${slug}`, data: () => data }] : [] };
}

vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      where: (_field: string, _operator: string, slug: string) => ({
        limit: () => ({ get: async () => snapshot(slug) }),
      }),
    }),
  }),
}));
vi.mock("@/lib/firebase", () => ({ db: {}, storage: {} }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal<typeof import("firebase/firestore")>(),
  collection: () => ({}),
  where: (_field: string, _operator: string, slug: string) => slug,
  query: (_collection: unknown, slug: string) => slug,
  getDocs: async (slug: string) => snapshot(slug),
}));

import { getRouteMappingBySlugOnly as buildLookup } from "@/lib/firestore-build-operations";
import { getRouteMappingBySlugOnly as fullQuizLookup } from "@/lib/firestore-operations";
import { middleware } from "@/middleware";

beforeEach(() => store.records.clear());

describe.each([
  ["public page", buildLookup],
  ["full-quiz API", fullQuizLookup],
] as const)("%s route lookup", (_label, lookup) => {
  it.each(["reading", "math", "science", "english"])(
    "resolves every published %s set to its exact stored quiz",
    async (subject) => {
      for (const set of ATI_TEAS_SET_NUMBERS) {
        const legacy = `teas-${subject}-practice-test-set-${set}`;
        const refPath = `pillarPages/nursing-entrance-exam/subPages/teas/nestedSubPages/${subject}/quizzes/set-${set}`;
        store.records.set(legacy, { slug: legacy, type: "quiz", quizId: `set-${set}`, refPath });
        const result = await lookup(`ati-${legacy}`);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({ type: "quiz", quizId: `set-${set}`, refPath });
      }
    }
  );

  it("prefers a saved canonical mapping after migration", async () => {
    const canonical = "ati-teas-reading-practice-test-set-16";
    store.records.set(canonical, { type: "quiz", quizId: "canonical-quiz" });
    store.records.set("teas-reading-practice-test-set-16", { type: "quiz", quizId: "legacy-quiz" });
    expect((await lookup(canonical)).data).toMatchObject({ quizId: "canonical-quiz" });
    expect((await lookup("teas-reading-practice-test-set-16")).data).toMatchObject({ quizId: "canonical-quiz" });
  });

  it("does not substitute a subject page or another set when the quiz is missing", async () => {
    store.records.set("ati-teas-reading-practice-test", { type: "nested" });
    store.records.set("teas-reading-practice-test-set-15", { type: "quiz", quizId: "set-15" });
    expect((await lookup("ati-teas-reading-practice-test-set-16")).success).toBe(false);
  });

  it("keeps unrelated quiz routes working", async () => {
    store.records.set("hesi-a2-math-practice-test-set-1", { type: "quiz", quizId: "hesi-math-1" });
    expect((await lookup("hesi-a2-math-practice-test-set-1")).data).toMatchObject({ quizId: "hesi-math-1" });
  });
});

it("retains mode and other query parameters when redirecting a legacy set URL", () => {
  const response = middleware(new NextRequest("https://www.nursingmocks.com/teas-reading-practice-test-set-16?mode=review&source=my-exams"));
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe("https://www.nursingmocks.com/ati-teas-reading-practice-test-set-16?mode=review&source=my-exams");
});

it.each(["reading", "math", "science", "english"])(
  "renders the public %s question list before loading authentication for full access",
  (subject) => {
    for (const prefix of ["teas", "ati-teas"]) {
      const path = `/${prefix}-${subject}-practice-test-set-16`;
      expect(shouldLazyLoadAuthForPublicPath(path)).toBe(true);
      // Authentication still loads after the preview; paid users can fetch the full quiz.
      expect(shouldDeferAuthForPublicPath(path)).toBe(false);
    }
  }
);
