import { spawn } from "child_process";
import { stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { scanNaxlexImageFolder } from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as {
      folderPath?: unknown;
      imageSourceUrl?: unknown;
      fieldPath?: unknown;
    };
    const folderPath = String(body.folderPath || "").trim();
    const imageSourceUrl = String(body.imageSourceUrl || "").trim();
    const fieldPath = String(body.fieldPath || "").trim();
    if (!folderPath || !imageSourceUrl || !fieldPath) {
      throw new Error("Folder path, image source URL, and field path are required.");
    }

    const scan = await scanNaxlexImageFolder(folderPath);
    const image = scan.images.find(
      (candidate) =>
        candidate.imageSourceUrl === imageSourceUrl && candidate.fieldPath === fieldPath
    );
    if (!image) {
      throw new Error("Image source was not found in the selected folder scan.");
    }

    const publicImageRoot = path.resolve(process.cwd(), "public", "naxlex-images");
    const resolvedTarget = path.resolve(image.targetPath);
    const relativeTarget = path.relative(publicImageRoot, resolvedTarget);
    if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
      throw new Error("Resolved image target is outside the image cache folder.");
    }

    const savedFolder = path.dirname(resolvedTarget);
    const savedFolderStats = await stat(savedFolder);
    if (!savedFolderStats.isDirectory()) {
      throw new Error("Saved image folder does not exist yet.");
    }

    const explorer = spawn("explorer.exe", [savedFolder], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    explorer.unref();

    return NextResponse.json({ opened: true, folderPath: savedFolder, targetPath: resolvedTarget });
  } catch (error) {
    console.error("Naxlex saved image folder open failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not open saved image folder",
      },
      { status: 400 }
    );
  }
}
