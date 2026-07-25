import { NextResponse } from "next/server";
import { getAdminExamAccessProducts } from "@/lib/admin/exam-access";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await getAdminExamAccessProducts();
    return NextResponse.json({
      products: products
        .filter((product) => product.active !== false)
        .map((product) => ({
          examId: product.examId,
          name: product.name,
          category: product.category,
          active: product.active,
          previewEnabled: product.previewEnabled,
          previewPercentage: product.previewPercentage,
        })),
    });
  } catch (error) {
    console.error("Exam access catalog load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load exam access catalog" }, { status: 500 });
  }
}
