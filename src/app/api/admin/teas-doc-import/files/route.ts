import path from "path";
import { NextResponse } from "next/server";
import { allowedTeasDocxFiles, TEAS_DOC_IMPORT_ROOT } from "@/lib/admin/teas-doc-import-paths";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const root = path.resolve(TEAS_DOC_IMPORT_ROOT);
    const files = allowedTeasDocxFiles();

    return NextResponse.json({ root, files, truncated: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not list TEAS DOCX files." },
      { status: 400 }
    );
  }
}
