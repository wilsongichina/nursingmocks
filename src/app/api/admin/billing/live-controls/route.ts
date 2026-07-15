import { NextRequest, NextResponse } from "next/server";
import { approveBillingLiveCapability, getBillingLiveControls } from "@/lib/server/billing-live-controls";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    return NextResponse.json({ liveControls: await getBillingLiveControls() });
  } catch (error) {
    console.error("Admin billing live controls load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load billing live controls" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as Record<string, unknown>;
    const result = await approveBillingLiveCapability({
      capability: typeof body.capability === "string" ? body.capability : "",
      reason: typeof body.reason === "string" ? body.reason : "",
      adminUid: decoded.uid,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Admin billing live controls update failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update billing live controls" },
      { status: 400 }
    );
  }
}
