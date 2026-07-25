import { spawn } from "child_process";
import { stat } from "fs/promises";
import { NextResponse } from "next/server";
import { ensureFolderInsideSourceRoots } from "@/lib/admin/naxlex-image-folder-scan";
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

    const { resolvedFolder } = ensureFolderInsideSourceRoots(folderPath);
    const folderStats = await stat(resolvedFolder);
    if (!folderStats.isDirectory()) {
      throw new Error("Folder path must point to a directory.");
    }

    const explorer = spawn("explorer.exe", [resolvedFolder], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    explorer.unref();

    return NextResponse.json({ opened: true, folderPath: resolvedFolder });
  } catch (error) {
    console.error("Naxlex image folder open failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not open Naxlex image folder",
      },
      { status: 400 }
    );
  }
}
