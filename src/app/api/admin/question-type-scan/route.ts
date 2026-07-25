import { NextResponse } from "next/server";
import { scanNaxlexNursingExitQuestionTypes } from "@/lib/admin/naxlex-question-type-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const result = await scanNaxlexNursingExitQuestionTypes();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Naxlex question type scan failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not scan Naxlex question types",
      },
      { status: 400 }
    );
  }
}
