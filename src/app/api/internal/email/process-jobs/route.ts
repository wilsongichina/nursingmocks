import { NextRequest, NextResponse } from "next/server";
import { validateWorkerConfig } from "@/lib/email/config";
import { processDueEmailJobs } from "@/lib/email/worker";
import { bearerToken, constantTimeEqual } from "@/lib/server/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const config = validateWorkerConfig();
    const provided = bearerToken(request.headers.get("authorization"));

    if (!provided || !constantTimeEqual(provided, config.workerSecret || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") || "10");
    const limit = Number.isFinite(rawLimit) ? rawLimit : 10;
    const result = await processDueEmailJobs({ limit });

    return NextResponse.json({
      scanned: result.scanned,
      claimed: result.claimed,
      sent: result.sent,
      retrying: result.retrying,
      failed: result.failed,
      deliveryUncertain: result.deliveryUncertain,
    });
  } catch (error) {
    console.error("Email worker failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Email worker failed" }, { status: 500 });
  }
}
