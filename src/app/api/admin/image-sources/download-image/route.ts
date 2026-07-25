import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { scanNaxlexImageFolder } from "@/lib/admin/naxlex-image-folder-scan";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImageDownloadResult = {
  buffer: Buffer;
  provider: "Zyte";
};

function normalizeSourceUrl(value: string) {
  return value
    .trim()
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

async function localEnvValue(name: string) {
  try {
    const contents = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    const line = contents
      .split(/\r?\n/)
      .find((item) => item.trim().startsWith(`${name}=`));
    if (!line) return "";
    return line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
  } catch {
    return "";
  }
}

function looksLikeImage(buffer: Buffer) {
  if (buffer.length < 4) return false;
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8) ||
    (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) ||
    (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) ||
    buffer.subarray(0, 4).toString("ascii") === "RIFF" ||
    buffer.subarray(0, 4).toString("utf8") === "<svg"
  );
}

async function readFailureBody(response: Response) {
  try {
    const text = await response.text();
    return text.replace(/\s+/g, " ").trim().slice(0, 260);
  } catch {
    return "";
  }
}

async function downloadImageWithZyte(sourceUrl: string, apiKey: string) {
  const response = await fetch("https://api.zyte.com/v1/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      url: normalizeSourceUrl(sourceUrl),
      httpResponseBody: true,
    }),
  });

  if (!response.ok) {
    const body = await readFailureBody(response);
    throw new Error(`Zyte returned HTTP ${response.status}${body ? ` (${body})` : ""}`);
  }

  const parsed = (await response.json()) as { httpResponseBody?: unknown };
  if (typeof parsed.httpResponseBody !== "string") {
    throw new Error("Zyte response did not include httpResponseBody.");
  }

  const buffer = Buffer.from(parsed.httpResponseBody, "base64");
  if (!looksLikeImage(buffer)) {
    throw new Error("Zyte response did not look like an image.");
  }

  return buffer;
}

async function downloadImageFromConfiguredProvider(sourceUrl: string): Promise<ImageDownloadResult> {
  const zyteApiKey =
    process.env.ZYTE_API_KEY ||
    (await localEnvValue("ZYTE_API_KEY")) ||
    process.env.ZYTE_KEY ||
    (await localEnvValue("ZYTE_KEY")) ||
    "";
  if (!zyteApiKey) {
    throw new Error("Set ZYTE_API_KEY in .env.local before downloading images.");
  }

  return {
    buffer: await downloadImageWithZyte(sourceUrl, zyteApiKey),
    provider: "Zyte",
  };
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as {
      folderPath?: unknown;
      imageSourceUrl?: unknown;
      fieldPath?: unknown;
    };
    const folderPath = String(body.folderPath || "").trim();
    const imageSourceUrl = normalizeSourceUrl(String(body.imageSourceUrl || ""));
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

    const download = await downloadImageFromConfiguredProvider(image.imageSourceUrl);
    await mkdir(path.dirname(resolvedTarget), { recursive: true });
    await writeFile(resolvedTarget, download.buffer);

    return NextResponse.json({
      downloaded: true,
      bytes: download.buffer.length,
      provider: download.provider,
      targetPath: resolvedTarget,
      publicPath: image.publicPath,
    });
  } catch (error) {
    console.error("Naxlex image download failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not download Naxlex image",
      },
      { status: 400 }
    );
  }
}
