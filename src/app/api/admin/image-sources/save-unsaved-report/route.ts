import { NextResponse } from "next/server";
import {
  writeUnsavedImageReport,
  type UnsavedImageFailure,
} from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as {
      folderPath?: unknown;
      failures?: unknown;
    };
    const folderPath = String(body.folderPath || "").trim();
    if (!folderPath) {
      throw new Error("Folder path is required.");
    }

    const failures = Array.isArray(body.failures)
      ? (body.failures as UnsavedImageFailure[])
      : [];
    const report = await writeUnsavedImageReport(folderPath, failures);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Naxlex unsaved image report failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save unsaved image report",
      },
      { status: 400 }
    );
  }
}
