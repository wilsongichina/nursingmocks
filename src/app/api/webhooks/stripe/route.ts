import { NextRequest, NextResponse } from "next/server";
import { processBillingWebhookEvent } from "@/lib/server/billing-webhook-processing";
import { intakeBillingWebhook } from "@/lib/server/billing-webhooks";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const gatewayId = request.nextUrl.searchParams.get("gatewayId") ?? "";
    const signatureHeader = request.headers.get("stripe-signature");
    const rawBody = await request.text();
    const result = await intakeBillingWebhook({
      provider: "stripe",
      gatewayId,
      rawBody,
      signatureHeader,
    });

    const statusCode =
      result.status === "rejected" ? 400 : result.status === "duplicate" ? 200 : 202;

    if (result.status === "recorded" && result.eventRecordId) {
      const processing = await processBillingWebhookEvent(result.eventRecordId);
      return NextResponse.json({ ...result, processing }, { status: statusCode });
    }

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Stripe webhook intake failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not record webhook event" }, { status: 500 });
  }
}
