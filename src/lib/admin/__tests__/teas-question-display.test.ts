import { describe, expect, it } from "vitest";

import { normalizeTeasDisplayHtml } from "@/lib/admin/teas-question-display";

describe("TEAS question display helpers", () => {
  it("inserts a visible blank row-label header when table body rows have one extra cell", () => {
    const html = normalizeTeasDisplayHtml(
      '<table class="teas-scan-table"><thead><tr><th>Male</th><th>Female</th></tr></thead><tbody><tr><td>Green</td><td>5</td><td>3</td></tr></tbody></table>'
    );

    expect(html).toContain('class="teas-scan-empty-header"');
    expect(html).toContain('aria-label="Row labels"');
    expect(html.indexOf("teas-scan-empty-header")).toBeLessThan(html.indexOf("<th>Male</th>"));
  });

  it("keeps already aligned table headers unchanged", () => {
    const input =
      '<table class="teas-scan-table"><thead><tr><th>State</th><th>Percent</th></tr></thead><tbody><tr><td>Maine</td><td>1.1</td></tr></tbody></table>';

    expect(normalizeTeasDisplayHtml(input)).toBe(input);
  });

  it("renders saved exhibit image paths instead of leaving an image-required notice", () => {
    const html = normalizeTeasDisplayHtml(
      '<div class="teas-scan-exhibit" data-exhibit-id="exhibit_1"><p><strong>Image:</strong></p><p class="teas-scan-image-notice"><strong>Image required:</strong> Review source.</p><p><strong>Image path:</strong> /teas-exhibits/set-9/page-1.png</p><p><strong>Alt:</strong> Scale diagram</p></div>'
    );

    expect(html).toContain('<img src="/teas-exhibits/set-9/page-1.png" alt="Scale diagram"');
    expect(html).not.toContain("Image required:");
  });
});
