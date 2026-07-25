import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TEAS_SOURCE_ROOT =
  process.env.TEAS_OCR_SOURCE_ROOT || "C:\\Users\\wilso\\OneDrive\\Desktop\\Sets";

function sourceRoot() {
  return path.resolve(DEFAULT_TEAS_SOURCE_ROOT);
}

function ensureInside(parentPath: string, childPath: string) {
  const parent = path.resolve(parentPath);
  const child = path.resolve(childPath);
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Requested image must be inside the selected TEAS source folder.");
  }
  return child;
}

function contentTypeForImage(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const inputPath = ensureInside(sourceRoot(), url.searchParams.get("inputPath") || "");
    const fileName = path.basename(url.searchParams.get("fileName") || "");
    if (!fileName || !/\.(jpe?g|png|webp)$/i.test(fileName)) {
      return NextResponse.json({ error: "A valid source image fileName is required." }, { status: 400 });
    }

    const imagePath = ensureInside(inputPath, path.join(inputPath, fileName));
    if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
      return NextResponse.json({ error: `Source image not found: ${fileName}` }, { status: 404 });
    }

    const bytes = fs.readFileSync(imagePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentTypeForImage(imagePath),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load TEAS source image" },
      { status: 400 }
    );
  }
}
