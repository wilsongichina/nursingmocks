import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import { teasOcrImageInputPath } from "@/lib/admin/teas-ocr-paths";
import { pageNumberFromImageName } from "@/lib/admin/google-gemini-teas-image-extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TEAS_SOURCE_ROOT =
  process.env.TEAS_OCR_SOURCE_ROOT || "C:\\Users\\wilso\\OneDrive\\Desktop\\Sets";

const NATURAL_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function sourceRoot() {
  return path.resolve(DEFAULT_TEAS_SOURCE_ROOT);
}

function ensureInsideRoot(folderPath: string) {
  const root = sourceRoot();
  const resolved = path.resolve(folderPath || root);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Folder must be inside the configured TEAS source root.");
  }
  return { root, resolved };
}

function imagePageNumber(fileName: string) {
  return pageNumberFromImageName(fileName);
}

function folderImageInfo(folderPath: string) {
  const imageFolderPath = teasOcrImageInputPath(folderPath);
  const imageFiles = fs
    .readdirSync(imageFolderPath)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .map((name) => ({ name, page: imagePageNumber(name) }))
    .filter((file): file is { name: string; page: number } => Boolean(file.page))
    .sort((a, b) => a.page - b.page);
  const pages = [
    ...new Set(
      imageFiles.map((file) => file.page)
    ),
  ].sort((a, b) => a - b);
  const firstImage = imageFiles[0] || null;
  const lastImage = imageFiles[imageFiles.length - 1] || null;

  return {
    scanPath: imageFolderPath,
    imageCount: pages.length,
    minPage: pages[0] || null,
    maxPage: pages[pages.length - 1] || null,
    firstImageName: firstImage?.name || "",
    lastImageName: lastImage?.name || "",
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const { root, resolved } = ensureInsideRoot(url.searchParams.get("path") || sourceRoot());

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      return NextResponse.json({ error: `Folder not found: ${resolved}` }, { status: 400 });
    }

    const dirs = fs
      .readdirSync(resolved, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => NATURAL_COLLATOR.compare(a.name, b.name))
      .map((entry) => {
        const folderPath = path.join(resolved, entry.name);
        return {
          name: entry.name,
          path: folderPath,
          ...folderImageInfo(folderPath),
        };
      });

    return NextResponse.json({
      root,
      current: resolved,
      parent: resolved === root ? null : path.dirname(resolved),
      ...folderImageInfo(resolved),
      dirs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not list TEAS folders" },
      { status: 400 }
    );
  }
}
