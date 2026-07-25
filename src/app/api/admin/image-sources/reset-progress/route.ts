import { NextResponse } from "next/server";
import { resetNaxlexImageScanProgress } from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const result = await resetNaxlexImageScanProgress();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Naxlex image scan reset failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not reset Naxlex image scan progress",
      },
      { status: 400 }
    );
  }
}
