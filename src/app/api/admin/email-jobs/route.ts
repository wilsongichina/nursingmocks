import { NextRequest, NextResponse } from "next/server";
import { listAdminEmailJobs } from "@/lib/admin/email-jobs";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "50");
    const jobs = await listAdminEmailJobs({
      limit: Number.isFinite(limit) ? limit : 50,
      templateId: url.searchParams.get("templateId") || undefined,
      status: url.searchParams.get("status") || undefined,
      recipient: url.searchParams.get("recipient") || undefined,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Admin email jobs list failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load email jobs" }, { status: 403 });
  }
}
