import { NextResponse } from "next/server";
import { getPublicSerializableBillingCatalog } from "@/lib/server/billing-readiness";

export const runtime = "nodejs";

export async function GET() {
  try {
    const catalog = await getPublicSerializableBillingCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Billing catalog load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load billing catalog" }, { status: 500 });
  }
}
