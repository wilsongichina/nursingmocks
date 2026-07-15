import { NextRequest, NextResponse } from "next/server";
import { listAdminUsers } from "@/lib/admin/users";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));

    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") || "50");
    const limit = Number.isFinite(rawLimit) ? rawLimit : 50;
    const pageToken = url.searchParams.get("pageToken") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const result = await listAdminUsers({ limit, pageToken, search });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin users list failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load users" }, { status: 403 });
  }
}
