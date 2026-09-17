import { describe, expect, it } from "vitest";
import {
  canonicalizePublicPath,
  isCanonicalPublicPath,
} from "@/lib/public-route-canonicalization";

describe("public route canonicalization", () => {
  it("maps legacy TEAS hubs and published set URLs to ati-teas paths", () => {
    expect(canonicalizePublicPath("/teas-7-practice")).toBe(
      "/ati-teas-practice-test"
    );
    expect(canonicalizePublicPath("/teas-practice-test")).toBe(
      "/ati-teas-practice-test"
    );
    expect(canonicalizePublicPath("/teas-reading-practice-test")).toBe(
      "/ati-teas-reading-practice-test"
    );
    expect(canonicalizePublicPath("/teas-math-practice-test-set-16")).toBe(
      "/ati-teas-math-practice-test-set-16"
    );
  });

  it("leaves nonexistent TEAS sets and unrelated paths unchanged", () => {
    expect(canonicalizePublicPath("/teas-science-practice-test-set-4")).toBe(
      "/teas-science-practice-test-set-4"
    );
    expect(canonicalizePublicPath("/nursing-test-bank")).toBe(
      "/nursing-test-bank"
    );
    expect(isCanonicalPublicPath("/ati-teas-practice-test")).toBe(true);
  });
});
