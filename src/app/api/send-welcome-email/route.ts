import { NextRequest, NextResponse } from "next/server";
import { createWelcomeEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { assertValidEmailAddress } from "@/lib/email/validation";
import { bearerToken } from "@/lib/server/security";
import { verifyFirebaseIdToken } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyFirebaseIdToken(bearerToken(request.headers.get("authorization")));
    const email = decoded.email;
    if (!email) {
      return NextResponse.json(
        { error: "An account email is required" },
        { status: 400 }
      );
    }
    assertValidEmailAddress(email, "account email");

    const name =
      typeof decoded.name === "string" && decoded.name.trim()
        ? decoded.name.trim()
        : email.split("@")[0];

    const job = await createWelcomeEmailJob({
      uid: decoded.uid,
      email,
      name,
    });

    await processDueEmailJobs({ limit: 3 });

    return NextResponse.json(
      { success: true, jobCreated: job.created },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error queueing welcome email:", {
      message: error?.message || "Unknown error",
    });
    return NextResponse.json({ error: "Failed to queue welcome email" }, { status: 500 });
  }
}

