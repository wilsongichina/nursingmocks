import { NextResponse } from "next/server";
import { scanNaxlexImageFolder } from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as { folderPath?: unknown };
    const folderPath = String(body.folderPath || "").trim();
    if (!folderPath) {
      throw new Error("Folder path is required.");
    }

    const result = await scanNaxlexImageFolder(folderPath);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Naxlex image folder scan failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not scan Naxlex image folder",
      },
      { status: 400 }
    );
  }
}
