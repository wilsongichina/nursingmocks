import { NextRequest, NextResponse } from "next/server";
import { repairEntranceExamCatalogForQuiz } from "@/lib/admin/entrance-exam-catalog-repair";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const result = await repairEntranceExamCatalogForQuiz({
      subPageId: String(body?.subPageId ?? ""),
      nestedSubPageId: String(body?.nestedSubPageId ?? ""),
      quizId: String(body?.quizId ?? ""),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Entrance exam catalog repair failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not repair entrance exam catalog" },
      { status: 400 }
    );
  }
}
