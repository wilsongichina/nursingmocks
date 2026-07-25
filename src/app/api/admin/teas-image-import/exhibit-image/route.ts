import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extensionForFile(file: File) {
  const nameExtension = path.extname(file.name || "").toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(nameExtension)) return nameExtension === ".jpeg" ? ".jpg" : nameExtension;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/jpeg") return ".jpg";
  return "";
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload an image file." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be between 1 byte and 8 MB." }, { status: 400 });
    }

    const extension = extensionForFile(file);
    if (!extension) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
    }

    const setSlug = slugify(String(formData.get("setSlug") || "unassigned-set")) || "unassigned-set";
    const scanId = slugify(String(formData.get("scanId") || "scan")) || "scan";
    const exhibitId = slugify(String(formData.get("exhibitId") || "exhibit")) || "exhibit";
    const sourceFileName = slugify(String(formData.get("sourceFileName") || "")) || "source";
    const publicDir = path.join(process.cwd(), "public", "teas-exhibits", setSlug);
    fs.mkdirSync(publicDir, { recursive: true });

    const fileName = `${sourceFileName}-${scanId}-${exhibitId}${extension}`;
    const targetPath = path.join(publicDir, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, bytes);

    return NextResponse.json({
      imagePath: `/teas-exhibits/${setSlug}/${fileName}`,
      fileName,
      bytes: bytes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload exhibit image" },
      { status: 400 }
    );
  }
}
