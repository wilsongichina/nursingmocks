/**
 * Writes `users/{uid}` on first sign-up. In Firebase Console → Firestore → Rules,
 * merge in (do not replace your whole rules file): allow read, write on
 * `users/{userId}` only when `request.auth.uid == userId`.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import type {
  UserDocument,
  UserDocumentAuthProvider,
} from "@/types/user-document";
import { inferPrimaryExamIdFromProgramType } from "@/lib/program-type";

const USERS_COLLECTION = "users";

function mapAuthProvider(user: User): UserDocumentAuthProvider {
  const providerId = user.providerData[0]?.providerId;
  if (providerId === "google.com") return "google";
  if (providerId === "apple.com") return "apple";
  return "password";
}

function inferPrimaryExamId(focusAreas: string[] | undefined): string | null {
  return inferPrimaryExamIdFromProgramType(focusAreas?.[0]);
}

function buildInitialUserPayload(
  user: User,
  opts: {
    fullName: string;
    providerOverride?: UserDocumentAuthProvider;
    focusAreas?: string[];
    referralCode: string;
  }
) {
  const fullName =
    opts.fullName.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "";
  const displayName =
    user.displayName?.trim() ||
    fullName.split(/\s+/)[0] ||
    fullName;

  const provider = opts.providerOverride ?? mapAuthProvider(user);

  return {
    user_id: user.uid,
    full_name: fullName,
    email: user.email ?? "",
    phone_e164: null,
    avatar_url: user.photoURL ?? null,

    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    last_login_at: serverTimestamp(),
    last_active_at: serverTimestamp(),

    profile: {
      display_name: displayName,
      bio: null,
      country: null,
      timezone: "Europe/London",
      locale: "en",
      primary_exam_id: inferPrimaryExamId(opts.focusAreas),
      focus_areas: opts.focusAreas ?? [],
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
        quiz_mode: "timed" as const,
        show_explanations: true,
      },
    },

    access: {
      role: "student" as const,
      is_admin: false,
      is_support: false,
    },

    auth: {
      provider,
      email_verified: user.emailVerified,
      phone_verified: false,
      mfa_enabled: false,
      disabled: false,
      disabled_reason: null,
    },

    login_metrics: {
      total_logins: 1,
      last_session_id: null,
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

    entitlements: {
      "exam:ati_teas_7": false,
      "exam:hesi_a2": false,
      "bundle:all_access": false,
      "feature:analytics": false,
      "feature:review_mode": false,
      "feature:timed_mode": false,
    },

    referral_summary: {
      referral_code: opts.referralCode,
      total_referrals: 0,
      total_converted: 0,
      total_commission_earned: 0,
      total_commission_paid: 0,
    },

    account_state: {
      status: "active" as const,
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
  };
}

function sanitizeReferralPrefix(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (cleaned || "USER").slice(0, 4);
}

function randomCodeSuffix(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

async function isReferralCodeTaken(code: string): Promise<boolean> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    where("referral_summary.referral_code", "==", code),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function generateUniqueReferralCode(user: User, fullName: string): Promise<string> {
  const prefixSource = fullName || user.displayName || user.email?.split("@")[0] || "USER";
  const prefix = sanitizeReferralPrefix(prefixSource);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `${prefix}${randomCodeSuffix(6)}`;
    if (!(await isReferralCodeTaken(code))) {
      return code;
    }
  }

  return `${prefix}${user.uid.slice(0, 6).toUpperCase()}`;
}

/**
 * Creates `users/{uid}` with the full default schema when missing (registration or first OAuth sign-in).
 */
export async function ensureUserDocumentOnRegister(
  user: User,
  opts: {
    fullName: string;
    providerOverride?: UserDocumentAuthProvider;
    focusAreas?: string[];
  }
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return;
  }

  const referralCode = await generateUniqueReferralCode(user, opts.fullName);
  const payload = buildInitialUserPayload(user, {
    ...opts,
    referralCode,
  });
  await setDoc(ref, payload);
}

/** Live `users/{uid}` for the profile dashboard. */
export function subscribeUserDocument(
  uid: string,
  onNext: (data: UserDocument | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onNext(null);
        return;
      }
      onNext(snap.data() as UserDocument);
    },
    (err) => {
      onError?.(err as Error);
    }
  );
}

export async function updateUserProfileContact(
  uid: string,
  data: {
    full_name: string;
    display_name: string;
    phone_e164: string | null;
    timezone: string | null;
    country?: string | null;
    locale?: string | null;
    bio?: string | null;
    /** Stored as `profile.focus_areas` (single entry) */
    program_type?: string;
  }
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const updates: DocumentData = {
    full_name: data.full_name,
    phone_e164: data.phone_e164,
    "profile.display_name": data.display_name,
    "profile.timezone": data.timezone,
    updated_at: serverTimestamp(),
  };
  if (data.country !== undefined) {
    updates["profile.country"] = data.country;
  }
  if (data.locale !== undefined) {
    updates["profile.locale"] = data.locale;
  }
  if (data.bio !== undefined) {
    updates["profile.bio"] = data.bio;
  }
  if (data.program_type !== undefined) {
    updates["profile.focus_areas"] = [data.program_type];
  }
  await updateDoc(ref, updates);
}

export async function updateUserPreferenceFields(
  uid: string,
  patch: {
    dark_mode?: boolean;
    email_marketing_opt_in?: boolean;
    notif_email?: boolean;
    notif_push?: boolean;
    notif_sms?: boolean;
    show_explanations?: boolean;
    quiz_mode?: "timed" | "tutor";
  }
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const updates: DocumentData = { updated_at: serverTimestamp() };
  if (patch.dark_mode !== undefined) {
    updates["preferences.dark_mode"] = patch.dark_mode;
  }
  if (patch.email_marketing_opt_in !== undefined) {
    updates["preferences.email_marketing_opt_in"] = patch.email_marketing_opt_in;
  }
  if (patch.notif_email !== undefined) {
    updates["preferences.notifications.email"] = patch.notif_email;
  }
  if (patch.notif_push !== undefined) {
    updates["preferences.notifications.push"] = patch.notif_push;
  }
  if (patch.notif_sms !== undefined) {
    updates["preferences.notifications.sms"] = patch.notif_sms;
  }
  if (patch.show_explanations !== undefined) {
    updates["preferences.defaults.show_explanations"] = patch.show_explanations;
  }
  if (patch.quiz_mode !== undefined) {
    updates["preferences.defaults.quiz_mode"] = patch.quiz_mode;
  }
  await updateDoc(ref, updates);
}
