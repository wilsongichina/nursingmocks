import { describe, expect, it } from "vitest";

import { pageNumberFromImageName } from "@/lib/admin/google-gemini-teas-image-extract";

describe("Google Gemini TEAS image extraction helpers", () => {
  it("detects page numbers from current TEAS image filename formats", () => {
    expect(pageNumberFromImageName("TEAS Version 7 - Set 6_page-0001.jpg")).toBe(1);
    expect(pageNumberFromImageName("1.jpg")).toBe(1);
    expect(pageNumberFromImageName("99_no-ati-logo.jpg")).toBe(99);
    expect(pageNumberFromImageName("176-no-ati-logo.png")).toBe(176);
    expect(pageNumberFromImageName("ATI TEAS Version 7 - Update 1 - Del-images-0.jpg")).toBe(1);
    expect(pageNumberFromImageName("ATI TEAS Version 7 - Update 1 - Del-images-337.jpg")).toBe(338);
  });

  it("ignores non-page image names", () => {
    expect(pageNumberFromImageName("cover.jpg")).toBeNull();
    expect(pageNumberFromImageName("ati-logo-paddle-report-1784037489684.json")).toBeNull();
  });
});
