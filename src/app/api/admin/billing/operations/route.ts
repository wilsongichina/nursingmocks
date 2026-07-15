import { NextRequest, NextResponse } from "next/server";
import { runAdminBillingOperation } from "@/lib/admin/billing-operations";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const result = await runAdminBillingOperation(body ?? {}, decoded.uid);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Admin billing operation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not run billing operation" },
      { status: 400 }
    );
  }
}
