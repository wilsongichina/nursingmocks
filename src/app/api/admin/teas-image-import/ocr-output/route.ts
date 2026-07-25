import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import { teasOcrOutputPath } from "@/lib/admin/teas-ocr-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OcrOutputKind = "text" | "structured";

const OUTPUT_PATTERNS: Record<OcrOutputKind, RegExp> = {
  text: /^questions-text-\d+\.txt$/i,
  structured: /^teas-ocr-structured-\d+\.json$/i,
};

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const requestedOutputPath = url.searchParams.get("outputPath");
    const requestedInputPath = url.searchParams.get("inputPath");
    const outputPath = path.resolve(
      requestedOutputPath || (requestedInputPath ? teasOcrOutputPath(requestedInputPath) : "")
    );
    const kind = url.searchParams.get("kind") === "text" ? "text" : "structured";

    if (!fs.existsSync(outputPath) || !fs.statSync(outputPath).isDirectory()) {
      return NextResponse.json({ error: `Output folder not found: ${outputPath}` }, { status: 400 });
    }

    const pattern = OUTPUT_PATTERNS[kind];
    const latest = fs
      .readdirSync(outputPath)
      .filter((fileName) => pattern.test(fileName))
      .map((fileName) => {
        const filePath = path.join(outputPath, fileName);
        return { fileName, filePath, modifiedMs: fs.statSync(filePath).mtimeMs };
      })
      .sort((a, b) => b.modifiedMs - a.modifiedMs)[0];

    if (!latest) {
      return NextResponse.json(
        { error: `No ${kind} OCR output files found in ${outputPath}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      kind,
      fileName: latest.fileName,
      filePath: latest.filePath,
      modifiedMs: latest.modifiedMs,
      content: fs.readFileSync(latest.filePath, "utf8"),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load OCR output" },
      { status: 400 }
    );
  }
}
