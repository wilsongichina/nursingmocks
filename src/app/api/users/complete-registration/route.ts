import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { createWelcomeEmailJob } from "@/lib/email/jobs";
import { processDueEmailJobs } from "@/lib/email/worker";
import { defaultUserEntitlements } from "@/lib/user-entitlements";
import { inferPrimaryExamIdFromProgramType } from "@/lib/program-type";
import { getAdminDb, requireUserFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function authProviderFromSignInProvider(value: unknown) {
  if (value === "google.com") return "google";
  if (value === "apple.com") return "apple";
  return "password";
}

function referralPrefix(value: string) {
  return (value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "USER").slice(0, 4);
}

function randomCodeSuffix(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return output;
}

async function generateReferralCode(uid: string, fullName: string, email: string) {
  const db = getAdminDb();
  const prefix = referralPrefix(fullName || email.split("@")[0] || uid);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `${prefix}${randomCodeSuffix(6)}`;
    const existing = await db
      .collection("users")
      .where("referral_summary.referral_code", "==", code)
      .limit(1)
      .get();
    if (existing.empty) return code;
  }

  return `${prefix}${uid.slice(0, 6).toUpperCase()}`;
}

async function ensureServerUserDocument(input: {
  uid: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  displayName: string;
  programType: string;
  signInProvider: unknown;
  photoUrl?: string | null;
}) {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(input.uid);
  const existing = await userRef.get();
  if (existing.exists) return { created: false };

  const focusAreas = input.programType ? [input.programType] : [];
  const provider = authProviderFromSignInProvider(input.signInProvider);
  const referralCode = await generateReferralCode(input.uid, input.fullName, input.email);

  await userRef.create({
    user_id: input.uid,
    full_name: input.fullName,
    email: input.email,
    onboardingCompleted: false,
    primaryExamType: null,
    examDate: null,
    onboardingCompletedAt: null,
    phone_e164: null,
    avatar_url: input.photoUrl || null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    last_login_at: FieldValue.serverTimestamp(),
    last_active_at: FieldValue.serverTimestamp(),
    profile: {
      display_name: input.displayName,
      bio: null,
      country: null,
      timezone: "Europe/London",
      locale: "en",
      primary_exam_id: inferPrimaryExamIdFromProgramType(input.programType),
      primary_exam_type: null,
      focus_areas: focusAreas,
      dashboard_exam_ids: [],
      onboarding_completed: false,
      onboarding_step: 1,
      exam_date: null,
      exam_not_scheduled: false,
      onboarding_completed_at: null,
    },
    preferences: {
      dark_mode: false,
      email_marketing_opt_in: false,
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      defaults: {
        quiz_mode: "timed",
        show_explanations: true,
      },
    },
    access: {
      role: "student",
      is_admin: false,
      is_support: false,
    },
    auth: {
      provider,
      email_verified: input.emailVerified,
      phone_verified: false,
      mfa_enabled: false,
      disabled: false,
      disabled_reason: null,
    },
    login_metrics: {
      total_logins: 0,
      last_session_id: null,
      last_ip_address: null,
      last_user_agent: null,
      last_login_provider: provider,
    },
    billing: {
      subscription_status: null,
      plan_id: null,
      interval: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: null,
      active_provider: null,
      active_subscription_ref: null,
    },
    billing_providers: {
      stripe: {
        customer_id: null,
        subscription_id: null,
        last_event_at: null,
      },
      paypal: {
        payer_id: null,
        subscription_id: null,
        last_event_at: null,
      },
      authorize_net: {
        customer_profile_id: null,
        subscription_id: null,
        last_event_at: null,
      },
    },
    entitlements: defaultUserEntitlements(),
    referral_summary: {
      referral_code: referralCode,
      total_referrals: 0,
      total_converted: 0,
      total_commission_earned: 0,
      total_commission_paid: 0,
    },
    account_state: {
      status: "active",
      deleted_requested_at: null,
      deleted_at: null,
    },
    stats: {
      total_attempts: 0,
      total_questions_answered: 0,
      accuracy_overall: 0,
      streak_days: 0,
      last_attempt_at: null,
    },
  });

  return { created: true };
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireUserFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json().catch(() => ({}));
    const email = textValue(decoded.email);

    if (!email) {
      return NextResponse.json({ error: "An account email is required" }, { status: 400 });
    }

    const fullName = textValue(body?.fullName, textValue(decoded.name, email.split("@")[0]));
    const displayName = textValue(decoded.name, fullName.split(/\s+/)[0] || fullName);
    const programType = textValue(body?.programType);

    const userDocument = await ensureServerUserDocument({
      uid: decoded.uid,
      email,
      emailVerified: decoded.email_verified === true,
      fullName,
      displayName,
      programType,
      signInProvider: decoded.firebase?.sign_in_provider,
      photoUrl: textValue(decoded.picture) || null,
    });

    const welcomeJob = await createWelcomeEmailJob({
      uid: decoded.uid,
      email,
      name: displayName,
    });
    const worker = await processDueEmailJobs({ limit: 3 });

    return NextResponse.json({
      success: true,
      userDocumentCreated: userDocument.created,
      welcomeJobCreated: welcomeJob.created,
      emailWorker: worker,
    });
  } catch (error) {
    console.error("Registration completion failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Registration completion failed" }, { status: 500 });
  }
}
