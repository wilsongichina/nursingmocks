import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutSessionDraftRequest } from "@/lib/billing/checkout-session";
import { createCheckoutSessionDraft } from "@/lib/server/billing-checkout";
import { requireUserFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireUserFromAuthorizationHeader(request.headers.get("authorization"));
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateCheckoutSessionDraftRequest(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.issues.join(" ") }, { status: 400 });
    }

    const result = await createCheckoutSessionDraft(decoded.uid, validation.input);
    return NextResponse.json(result, { status: result.status === "blocked" ? 409 : 200 });
  } catch (error) {
    console.error("Billing checkout session draft failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 401 });
  }
}
