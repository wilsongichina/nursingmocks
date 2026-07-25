import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { resolveAllowedTeasDocxPath, TEAS_DOC_IMPORT_ROOT } from "@/lib/admin/teas-doc-import-paths";
import { parseTeasDocxFile } from "@/lib/admin/teas-docx-import";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function providerStatus() {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY),
    chatgpt: Boolean(process.env.OPENAI_API_KEY),
  };
}

export async function POST(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const root = path.resolve(TEAS_DOC_IMPORT_ROOT);
    const resolved = resolveAllowedTeasDocxPath(String(body.docxPath || ""));
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return NextResponse.json({ error: `DOCX file not found: ${resolved}` }, { status: 400 });
    }
    if (path.extname(resolved).toLowerCase() !== ".docx") {
      return NextResponse.json({ error: "Select a .docx file." }, { status: 400 });
    }

    const parsed = parseTeasDocxFile(resolved);
    return NextResponse.json({
      root,
      providerStatus: providerStatus(),
      parsed,
      llmConfirmation: {
        gemini: providerStatus().gemini
          ? "Gemini is configured and can be used to repair missing question prompts."
          : "Gemini key is not configured.",
        chatgpt: providerStatus().chatgpt
          ? "ChatGPT/OpenAI is configured and can be used to repair missing question prompts."
          : "OpenAI key is not configured.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse DOCX file" },
      { status: 400 }
    );
  }
}
