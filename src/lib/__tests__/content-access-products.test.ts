import { describe, expect, it } from "vitest";
import { normalizeContentExamAccessProductId } from "@/lib/content-access-products";

describe("normalizeContentExamAccessProductId", () => {
  it("keeps exact entrance exam access product IDs", () => {
    expect(normalizeContentExamAccessProductId("nursing-entrance-exam", "ati_teas_7")).toBe("ati_teas_7");
    expect(normalizeContentExamAccessProductId("nursing-entrance-exam", "hesi_a2")).toBe("hesi_a2");
  });

  it("infers ATI TEAS 7 from entrance quiz names when the exact ID is missing", () => {
    expect(
      normalizeContentExamAccessProductId(
        "nursing-entrance-exam",
        null,
        "TEAS Math Practice Test Set 7"
      )
    ).toBe("ati_teas_7");
  });

  it("infers HESI A2 from entrance quiz names when the exact ID is missing", () => {
    expect(
      normalizeContentExamAccessProductId(
        "nursing-entrance-exam",
        "",
        "HESI A2 Math Practice Test Set 1"
      )
    ).toBe("hesi_a2");
  });

  it("does not infer unsupported entrance products from unrelated text", () => {
    expect(normalizeContentExamAccessProductId("nursing-entrance-exam", "", "General entrance exam")).toBeNull();
  });
});
