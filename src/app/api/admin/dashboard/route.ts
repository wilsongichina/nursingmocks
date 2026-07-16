import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardSummary } from "@/lib/admin/dashboard";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const summary = await getAdminDashboardSummary();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Admin dashboard summary failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load admin dashboard summary" }, { status: 403 });
  }
}
