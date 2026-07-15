import { NextRequest, NextResponse } from "next/server";
import { createAdminPaymentGateway, getAdminBillingConfig } from "@/lib/admin/billing";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const config = await getAdminBillingConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Admin billing config load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load billing configuration" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();

    if (body?.type !== "gateway") {
      return NextResponse.json({ error: "Unsupported billing configuration type" }, { status: 400 });
    }

    const result = await createAdminPaymentGateway(body.gateway ?? {}, decoded.uid);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Admin billing config update failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update billing configuration" },
      { status: 400 }
    );
  }
}
