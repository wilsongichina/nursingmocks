import { NextResponse } from "next/server";
import {
  DEFAULT_NAXLEX_SOURCE_ROOT,
  getAdjacentNaxlexJsonFolder,
} from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as {
      folderPath?: unknown;
      direction?: unknown;
      skipCompleted?: unknown;
    };
    const folderPath = String(body.folderPath || "").trim();
    const requestedDirection = String(body.direction || "next");
    const direction =
      requestedDirection === "first" || requestedDirection === "previous"
        ? requestedDirection
        : "next";
    const skipCompleted = body.skipCompleted !== false;
    if (!folderPath && direction !== "first") {
      throw new Error("Folder path is required.");
    }

    const result = await getAdjacentNaxlexJsonFolder(
      folderPath || DEFAULT_NAXLEX_SOURCE_ROOT,
      direction,
      skipCompleted
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Naxlex image folder navigation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not navigate Naxlex image folders",
      },
      { status: 400 }
    );
  }
}
