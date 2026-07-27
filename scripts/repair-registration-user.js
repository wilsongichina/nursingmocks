const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldPath, FieldValue, getFirestore } = require("firebase-admin/firestore");

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  throw new Error("Firebase Admin credentials are not configured.");
}

function init() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function cleanText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function inferPrimaryExamId(programType) {
  const value = String(programType || "").toLowerCase();
  if (value.includes("teas") || value.includes("ati")) return "ati_teas_7";
  if (value.includes("hesi")) return "hesi_a2";
  if (value.includes("test bank")) return "nursing_test_bank";
  if (value.includes("exit")) return "nursing_exit_exams";
  return null;
}

function defaultUserEntitlements() {
  return {
    ati_teas_7: false,
    hesi_a2: false,
    nursing_test_bank: false,
    nursing_exit_exams: false,
  };
}

function referralPrefix(value) {
  return (String(value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "USER").slice(0, 4);
}

function randomCodeSuffix(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return output;
}

async function generateReferralCode(db, uid, fullName, email) {
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

function emailJobId(idempotencyKey) {
  return crypto.createHash("sha256").update(idempotencyKey).digest("hex");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function welcomeEmail({ name, siteUrl, supportEmail }) {
  const dashboardUrl = new URL("/dashboard", siteUrl).toString();
  const body = `
    <p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;">Welcome to NursingMocks. Your account is ready, and you can start using your nursing exam practice resources now.</p>
    <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#6a5cff;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;margin:18px 0;">Open Dashboard</a>
    <p style="margin:0;">Use your dashboard to access practice resources, track progress, and continue your preparation.</p>
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Welcome to NursingMocks</title></head><body style="margin:0;background:#f6f7fb;color:#111827;font-family:Arial,Helvetica,sans-serif;line-height:1.55;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;"><tr><td style="background:#6a5cff;padding:24px;color:#ffffff;"><div style="font-size:22px;font-weight:800;">NursingMocks</div></td></tr><tr><td style="padding:28px;"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#111827;">Welcome to NursingMocks</h1>${body}</td></tr><tr><td style="padding:20px 28px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Need help? Contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#6a5cff;">${escapeHtml(supportEmail)}</a>.<br><span style="font-size:12px;">NursingMocks, nursing exam preparation resources.</span></td></tr></table></td></tr></table></body></html>`;
  return {
    subject: "Welcome to NursingMocks - Your account is ready",
    html,
    text: `Hi ${name},\n\nWelcome to NursingMocks. Your account is ready.\n\nOpen your dashboard: ${dashboardUrl}\n\nNeed help? Contact ${supportEmail}.\nNursingMocks`,
  };
}

async function createUserDocumentIfMissing({ db, user, fullName, programType, apply }) {
  const ref = db.collection("users").doc(user.uid);
  const snapshot = await ref.get();
  const name = cleanText(fullName, user.displayName || user.email?.split("@")[0] || user.uid);
  const displayName = cleanText(user.displayName, name.split(/\s+/)[0] || name);
  const focusAreas = programType ? [programType] : [];
  const existingData = snapshot.exists ? snapshot.data() || {} : {};

  if (snapshot.exists) {
    const patch = {};
    if (!existingData.user_id) patch.user_id = user.uid;
    if (!existingData.full_name) patch.full_name = name;
    if (!existingData.email) patch.email = user.email || "";
    if (!("onboardingCompleted" in existingData)) patch.onboardingCompleted = false;
    if (!("primaryExamType" in existingData)) patch.primaryExamType = null;
    if (!("examDate" in existingData)) patch.examDate = null;
    if (!("onboardingCompletedAt" in existingData)) patch.onboardingCompletedAt = null;
    if (!("phone_e164" in existingData)) patch.phone_e164 = null;
    if (!("avatar_url" in existingData)) patch.avatar_url = user.photoURL || null;
    if (!existingData.created_at) patch.created_at = FieldValue.serverTimestamp();
    patch.updated_at = FieldValue.serverTimestamp();

    if (!existingData.profile?.display_name) patch["profile.display_name"] = displayName;
    if (!("bio" in (existingData.profile || {}))) patch["profile.bio"] = null;
    if (!("country" in (existingData.profile || {}))) patch["profile.country"] = null;
    if (!("timezone" in (existingData.profile || {}))) patch["profile.timezone"] = "Europe/London";
    if (!("locale" in (existingData.profile || {}))) patch["profile.locale"] = "en";
    if (!existingData.profile?.primary_exam_id) patch["profile.primary_exam_id"] = inferPrimaryExamId(programType);
    if (!("primary_exam_type" in (existingData.profile || {}))) patch["profile.primary_exam_type"] = null;
    if (!Array.isArray(existingData.profile?.focus_areas)) patch["profile.focus_areas"] = focusAreas;
    if (!Array.isArray(existingData.profile?.dashboard_exam_ids)) patch["profile.dashboard_exam_ids"] = [];
    if (!("onboarding_completed" in (existingData.profile || {}))) patch["profile.onboarding_completed"] = false;
    if (!("onboarding_step" in (existingData.profile || {}))) patch["profile.onboarding_step"] = 1;
    if (!("exam_date" in (existingData.profile || {}))) patch["profile.exam_date"] = null;
    if (!("exam_not_scheduled" in (existingData.profile || {}))) patch["profile.exam_not_scheduled"] = false;
    if (!("onboarding_completed_at" in (existingData.profile || {}))) patch["profile.onboarding_completed_at"] = null;

    if (!existingData.preferences) {
      patch.preferences = {
        dark_mode: false,
        email_marketing_opt_in: false,
        notifications: { email: true, push: false, sms: false },
        defaults: { quiz_mode: "timed", show_explanations: true },
      };
    }
    if (!existingData.access) patch.access = { role: "student", is_admin: false, is_support: false };
    if (!existingData.auth) {
      patch.auth = {
        provider: user.providerData[0]?.providerId === "google.com" ? "google" : "password",
        email_verified: user.emailVerified,
        phone_verified: false,
        mfa_enabled: false,
        disabled: user.disabled,
        disabled_reason: null,
      };
    }
    if (!existingData.billing) {
      patch.billing = {
        subscription_status: null,
        plan_id: null,
        interval: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: null,
        active_provider: null,
        active_subscription_ref: null,
      };
    }
    if (!existingData.billing_providers) {
      patch.billing_providers = {
        stripe: { customer_id: null, subscription_id: null, last_event_at: null },
        paypal: { payer_id: null, subscription_id: null, last_event_at: null },
        authorize_net: { customer_profile_id: null, subscription_id: null, last_event_at: null },
      };
    }
    if (!existingData.entitlements) patch.entitlements = defaultUserEntitlements();
    if (!existingData.referral_summary) {
      patch.referral_summary = {
        referral_code: await generateReferralCode(db, user.uid, name, user.email || ""),
        total_referrals: 0,
        total_converted: 0,
        total_commission_earned: 0,
        total_commission_paid: 0,
      };
    }
    if (!existingData.account_state) patch.account_state = { status: "active", deleted_requested_at: null, deleted_at: null };
    if (!existingData.stats) {
      patch.stats = {
        total_attempts: 0,
        total_questions_answered: 0,
        accuracy_overall: 0,
        streak_days: 0,
        last_attempt_at: null,
      };
    }

    const patchKeys = Object.keys(patch);
    const literalDottedKeys = Object.keys(existingData).filter((key) => key.includes("."));
    if (apply && patchKeys.length > 0) await ref.update(patch);
    if (apply && literalDottedKeys.length > 0) {
      const deleteArgs = literalDottedKeys.flatMap((key) => [
        new FieldPath(key),
        FieldValue.delete(),
      ]);
      await ref.update(...deleteArgs);
    }
    return {
      created: false,
      exists: true,
      repaired: apply && (patchKeys.length > 0 || literalDottedKeys.length > 0),
      missingFields: patchKeys,
      removedLiteralDottedFields: literalDottedKeys,
    };
  }

  if (!apply) {
    return {
      created: false,
      exists: false,
      missingFields: ["users document"],
    };
  }

  const referralCode = await generateReferralCode(db, user.uid, name, user.email || "");

  await ref.create({
    user_id: user.uid,
    full_name: name,
    email: user.email || "",
    onboardingCompleted: false,
    primaryExamType: null,
    examDate: null,
    onboardingCompletedAt: null,
    phone_e164: null,
    avatar_url: user.photoURL || null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    last_login_at: FieldValue.serverTimestamp(),
    last_active_at: FieldValue.serverTimestamp(),
    profile: {
      display_name: displayName,
      bio: null,
      country: null,
      timezone: "Europe/London",
      locale: "en",
      primary_exam_id: inferPrimaryExamId(programType),
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
      notifications: { email: true, push: false, sms: false },
      defaults: { quiz_mode: "timed", show_explanations: true },
    },
    access: { role: "student", is_admin: false, is_support: false },
    auth: {
      provider: user.providerData[0]?.providerId === "google.com" ? "google" : "password",
      email_verified: user.emailVerified,
      phone_verified: false,
      mfa_enabled: false,
      disabled: user.disabled,
      disabled_reason: null,
    },
    login_metrics: {
      total_logins: 0,
      last_session_id: null,
      last_ip_address: null,
      last_user_agent: null,
      last_login_provider: user.providerData[0]?.providerId === "google.com" ? "google" : "password",
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
      stripe: { customer_id: null, subscription_id: null, last_event_at: null },
      paypal: { payer_id: null, subscription_id: null, last_event_at: null },
      authorize_net: { customer_profile_id: null, subscription_id: null, last_event_at: null },
    },
    entitlements: defaultUserEntitlements(),
    referral_summary: {
      referral_code: referralCode,
      total_referrals: 0,
      total_converted: 0,
      total_commission_earned: 0,
      total_commission_paid: 0,
    },
    account_state: { status: "active", deleted_requested_at: null, deleted_at: null },
    stats: {
      total_attempts: 0,
      total_questions_answered: 0,
      accuracy_overall: 0,
      streak_days: 0,
      last_attempt_at: null,
    },
  });

  return { created: true, exists: false };
}

async function sendWelcomeIfNeeded({ db, user, fullName, apply, siteUrl }) {
  const email = user.email;
  if (!email) throw new Error("Auth user has no email.");
  const idempotencyKey = `welcome:${user.uid}`;
  const jobRef = db.collection("emailJobs").doc(emailJobId(idempotencyKey));
  const existing = await jobRef.get();
  if (existing.exists && existing.data()?.status === "sent") {
    return { skipped: true, reason: "welcome job already sent", jobId: jobRef.id };
  }
  if (!apply) {
    return { skipped: true, reason: "dry-run", jobId: jobRef.id };
  }

  const name = cleanText(user.displayName, cleanText(fullName, email.split("@")[0]));
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL;
  const supportEmail = process.env.SUPPORT_EMAIL || replyTo;
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");
  if (!from || !replyTo || !supportEmail) throw new Error("EMAIL_FROM, EMAIL_REPLY_TO, and SUPPORT_EMAIL are required.");

  await jobRef.set(
    {
      templateId: "welcome",
      to: email,
      data: { name },
      status: "processing",
      attempts: FieldValue.increment(1),
      maxAttempts: 5,
      idempotencyKey,
      jobId: jobRef.id,
      createdAt: existing.exists ? existing.data()?.createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const rendered = welcomeEmail({ name, siteUrl, supportEmail });
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send(
      {
        to: email,
        from,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo,
      },
      { idempotencyKey }
    );
    if (result.error) throw new Error(result.error.message);
    await jobRef.set(
      {
        status: "sent",
        provider: "resend",
        providerMessageId: result.data?.id || null,
        templateVersion: 1,
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastErrorCategory: FieldValue.delete(),
        lastErrorMessage: FieldValue.delete(),
      },
      { merge: true }
    );
    return { sent: true, jobId: jobRef.id, providerMessageId: result.data?.id || null };
  } catch (error) {
    await jobRef.set(
      {
        status: "failed",
        lastErrorCategory: "provider_error",
        lastErrorMessage: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    throw error;
  }
}

async function main() {
  init();
  const email = cleanText(argValue("--email"));
  const fullName = cleanText(argValue("--name"));
  const programType = cleanText(argValue("--program"));
  const siteUrl = cleanText(argValue("--site-url"), "https://nursingmocks.com");
  const apply = process.argv.includes("--apply");
  if (!email) throw new Error("Usage: node scripts/repair-registration-user.js --email user@example.com [--name Name] [--program ati_teas_7] [--apply]");

  const auth = getAuth();
  const db = getFirestore();
  const user = await auth.getUserByEmail(email);
  const userDocument = await createUserDocumentIfMissing({ db, user, fullName, programType, apply });
  const welcome = await sendWelcomeIfNeeded({ db, user, fullName, apply, siteUrl });

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        email,
        uid: user.uid,
        userDocument,
        welcome,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
