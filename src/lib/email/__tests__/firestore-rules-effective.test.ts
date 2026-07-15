import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

type AuthState = "anonymous" | "user" | "admin";

const rules = readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");
const publicTopLevelCollections = new Set([
  "pages",
  "blogs",
  "blogCategories",
  "pillarPages",
  "knowledgeBase",
  "questions",
  "questionTypes",
  "questionCategories",
  "services",
  "routeMappings",
]);

function canRead(pathValue: string, auth: AuthState) {
  const [collection, documentId] = pathValue.split("/");
  if (!collection || !documentId) return false;

  if (collection === "users") {
    return auth === "admin" || (auth === "user" && documentId === "current-user");
  }

  return publicTopLevelCollections.has(collection);
}

describe("effective Firestore email security rules", () => {
  it("does not retain a recursive global public-read rule", () => {
    expect(rules).not.toMatch(/match\s+\/\{document=\*\*\}\s*\{[\s\S]*allow read:\s*if true;/);
    expect(rules).toMatch(/match\s+\/\{document=\*\*\}\s*\{[\s\S]*allow read, write:\s*if false;/);
  });

  it.each([
    ["emailJobs/job-1", "anonymous"],
    ["emailJobs/job-1", "user"],
    ["contactSubmissions/submission-1", "anonymous"],
    ["contactSubmissions/submission-1", "user"],
    ["emailTemplates/welcome", "anonymous"],
    ["emailTemplates/welcome", "user"],
    ["emailRateLimits/rate-1", "anonymous"],
    ["emailRateLimits/rate-1", "user"],
    ["unknownCollection/doc-1", "anonymous"],
  ] as Array<[string, AuthState]>)("denies %s to %s clients", (pathValue, auth) => {
    expect(canRead(pathValue, auth)).toBe(false);
  });

  it.each([
    "pages/math",
    "blogs/blog-1",
    "blogCategories/category-1",
    "pillarPages/nursing-test-bank",
    "pillarPages/nursing-test-bank/subPages/sub-1",
    "knowledgeBase/article-1",
    "questions/question-1",
    "questionTypes/type-1",
    "questionCategories/category-1",
    "services/service-1",
    "routeMappings/mapping-1",
  ])("allows anonymous read of approved public content: %s", (pathValue) => {
    expect(canRead(pathValue, "anonymous")).toBe(true);
  });
});
