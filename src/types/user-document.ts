import type { Timestamp } from "firebase/firestore";

/** Stored at Firestore `users/{uid}` — field names match snake_case in DB */
export type UserDocumentAuthProvider = "password" | "google" | "apple";

export interface UserDocumentProfile {
  display_name: string;
  bio: string | null;
  country: string | null;
  timezone: string;
  locale: string;
  primary_exam_id: string | null;
  focus_areas: string[];
  dashboard_exam_ids?: string[];
}

export interface UserDocumentPreferences {
  dark_mode: boolean;
  email_marketing_opt_in: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  defaults: {
    quiz_mode: "timed" | "tutor";
    show_explanations: boolean;
  };
}

export interface UserDocumentAccess {
  role: "student" | "admin" | "support" | "affiliate";
  is_admin: boolean;
  is_support: boolean;
}

export interface UserDocumentAuth {
  provider: UserDocumentAuthProvider;
  email_verified: boolean;
  phone_verified: boolean;
  mfa_enabled: boolean;
  disabled: boolean;
  disabled_reason: string | null;
}

export interface UserDocumentLoginMetrics {
  total_logins: number;
  last_session_id: string | null;
  last_ip_address: string | null;
  last_ip_hash?: string | null;
  last_user_agent: string | null;
  last_device?: {
    device_type: string | null;
    browser: string | null;
    os: string | null;
  } | null;
  last_location?: {
    country: string | null;
    region: string | null;
    city: string | null;
    source: string | null;
  } | null;
  last_login_provider: UserDocumentAuthProvider | null;
  last_login_event_error?: string | null;
}

export interface UserDocumentLoginSecurity {
  status: "normal" | "watch" | "review" | "high_attention";
  unique_ip_hashes_24h: number;
  unique_ip_hashes_7d: number;
  unique_ip_hashes_30d: number;
  unique_devices_24h: number;
  unique_devices_7d: number;
  unique_devices_30d: number;
  unique_locations_30d: number;
  unique_countries_30d: number;
  recent_ip_switches_24h: number;
  recent_device_switches_24h: number;
  last_switch_at: string | null;
  reasons: string[];
  recommendation: string;
  last_evaluated_at: Timestamp;
}

export interface UserDocumentBilling {
  subscription_status: "active" | "canceled" | "past_due" | null;
  plan_id: string | null;
  interval: "monthly" | "yearly" | null;
  current_period_start: Timestamp | null;
  current_period_end: Timestamp | null;
  cancel_at_period_end: boolean | null;
  active_provider: "stripe" | "paypal" | "authorize_net" | null;
  active_subscription_ref: string | null;
}

export interface UserDocumentBillingProviders {
  stripe: {
    customer_id: string | null;
    subscription_id: string | null;
    last_event_at: Timestamp | null;
  };
  paypal: {
    payer_id: string | null;
    subscription_id: string | null;
    last_event_at: Timestamp | null;
  };
  authorize_net: {
    customer_profile_id: string | null;
    subscription_id: string | null;
    last_event_at: Timestamp | null;
  };
}

export type UserDocumentEntitlements = Record<string, boolean>;

export interface UserDocumentReferralSummary {
  referral_code: string | null;
  total_referrals: number;
  total_converted: number;
  total_commission_earned: number;
  total_commission_paid: number;
}

export interface UserDocumentAccountState {
  status: "active" | "locked" | "deleted_requested" | "deleted";
  deleted_requested_at: Timestamp | null;
  deleted_at: Timestamp | null;
}

export interface UserDocumentStats {
  total_attempts: number;
  total_questions_answered: number;
  accuracy_overall: number;
  streak_days: number;
  last_attempt_at: Timestamp | null;
}

export interface UserDocument {
  user_id: string;
  full_name: string;
  email: string;
  phone_e164: string | null;
  avatar_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login_at: Timestamp;
  last_active_at: Timestamp;
  profile: UserDocumentProfile;
  preferences: UserDocumentPreferences;
  access: UserDocumentAccess;
  auth: UserDocumentAuth;
  login_metrics: UserDocumentLoginMetrics;
  login_security?: UserDocumentLoginSecurity;
  billing: UserDocumentBilling;
  billing_providers: UserDocumentBillingProviders;
  entitlements: UserDocumentEntitlements;
  referral_summary: UserDocumentReferralSummary;
  account_state: UserDocumentAccountState;
  stats: UserDocumentStats;
}
