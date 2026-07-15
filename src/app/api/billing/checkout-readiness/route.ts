import { NextRequest, NextResponse } from "next/server";
import type { BillingEnvironment } from "@/lib/billing/models";
import { resolveSerializableCheckoutReadiness } from "@/lib/server/billing-readiness";

export const runtime = "nodejs";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function environment(value: unknown): BillingEnvironment | null {
  const normalized = text(value);
  if (normalized === "test" || normalized === "live") return normalized;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const planId = text(body?.planId);

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const result = await resolveSerializableCheckoutReadiness({
      planId,
      gatewayId: text(body?.gatewayId) || null,
      country: text(body?.country) || null,
      currency: text(body?.currency) || null,
      environment: environment(body?.environment),
    });

    return NextResponse.json({
      ...result,
      message: result.ready
        ? "Checkout configuration is ready, but live checkout remains disabled for this billing stage."
        : "Checkout configuration is not ready.",
    });
  } catch (error) {
    console.error("Billing checkout readiness failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not validate checkout readiness" }, { status: 500 });
  }
}
