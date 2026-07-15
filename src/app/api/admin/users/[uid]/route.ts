import { NextRequest, NextResponse } from "next/server";
import { getAdminUserDetail } from "@/lib/admin/users";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const { uid } = await context.params;

    if (!uid || uid.length > 128) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await getAdminUserDetail(uid);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin user detail failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load user" }, { status: 403 });
  }
}
