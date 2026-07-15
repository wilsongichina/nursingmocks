import { NextRequest, NextResponse } from "next/server";
import {
  createAdminBillingPlan,
  createAdminPaymentGateway,
  createAdminProviderPriceMapping,
  getAdminBillingConfig,
  updateAdminBillingConfig,
} from "@/lib/admin/billing";
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

    if (body?.type === "gateway") {
      const result = await createAdminPaymentGateway(body.gateway ?? {}, decoded.uid);
      return NextResponse.json(result, { status: 201 });
    }

    if (body?.type === "plan") {
      const result = await createAdminBillingPlan(body.plan ?? {}, decoded.uid);
      return NextResponse.json(result, { status: 201 });
    }

    if (body?.type === "providerPriceMapping") {
      const result = await createAdminProviderPriceMapping(body.providerPriceMapping ?? {}, decoded.uid);
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported billing configuration type" }, { status: 400 });
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

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();

    const result = await updateAdminBillingConfig(
      body?.type,
      body?.id,
      body?.patch ?? {},
      decoded.uid
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin billing config patch failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update billing configuration" },
      { status: 400 }
    );
  }
}
