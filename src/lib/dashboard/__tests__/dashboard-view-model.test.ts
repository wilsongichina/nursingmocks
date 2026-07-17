import { describe, expect, it } from "vitest";
import type { User } from "firebase/auth";
import { buildDashboardViewModel } from "@/lib/dashboard/dashboard-view-model";
import type { UserDocument } from "@/types/user-document";

function authUser(overrides: Partial<User> = {}): User {
  return {
    uid: "user-123",
    email: "ada@example.com",
    displayName: "Ada Lovelace",
    emailVerified: true,
    providerData: [],
    ...overrides,
  } as User;
}

function timestamp(date: string) {
  return {
    toDate: () => new Date(date),
  };
}

function userDoc(overrides: Partial<UserDocument> = {}): UserDocument {
  return {
    user_id: "user-123",
    full_name: "Ada Firestore",
    email: "ada.firestore@example.com",
    phone_e164: null,
    avatar_url: null,
    created_at: timestamp("2026-01-01T00:00:00Z") as UserDocument["created_at"],
    updated_at: timestamp("2026-01-01T00:00:00Z") as UserDocument["updated_at"],
    last_login_at: timestamp("2026-01-01T00:00:00Z") as UserDocument["last_login_at"],
    last_active_at: timestamp("2026-01-01T00:00:00Z") as UserDocument["last_active_at"],
    profile: {
      display_name: "Ada Profile",
      bio: null,
      country: null,
      timezone: "America/New_York",
      locale: "en",
      primary_exam_id: "ati_teas_7",
      focus_areas: ["ati_teas"],
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
      provider: "password",
      email_verified: true,
      phone_verified: false,
      mfa_enabled: false,
      disabled: false,
      disabled_reason: null,
    },
    login_metrics: {
      total_logins: 1,
      last_session_id: null,
      last_ip_address: null,
      last_user_agent: null,
      last_login_provider: "password",
    },
    billing: {
      subscription_status: "active",
      plan_id: "all_access_monthly",
      interval: "monthly",
      current_period_start: timestamp("2026-01-01T00:00:00Z") as UserDocument["billing"]["current_period_start"],
      current_period_end: timestamp("2099-01-01T00:00:00Z") as UserDocument["billing"]["current_period_end"],
      cancel_at_period_end: false,
      active_provider: "stripe",
      active_subscription_ref: "hidden-provider-ref",
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
      ati_teas_7: true,
      hesi_a2: false,
      nursing_test_bank: false,
      nursing_exit_exams: false,
    },
    referral_summary: {
      referral_code: "ADA123",
      total_referrals: 2,
      total_converted: 1,
      total_commission_earned: 25,
      total_commission_paid: 10,
    },
    account_state: {
      status: "active",
      deleted_requested_at: null,
      deleted_at: null,
    },
    stats: {
      total_attempts: 3,
      total_questions_answered: 120,
      accuracy_overall: 82.4,
      streak_days: 5,
      last_attempt_at: timestamp("2026-07-01T00:00:00Z") as UserDocument["stats"]["last_attempt_at"],
    },
    ...overrides,
  };
}

describe("buildDashboardViewModel", () => {
  it("uses the expected name fallback order and primary exam labels", () => {
    const view = buildDashboardViewModel(userDoc(), authUser());

    expect(view.user.firstName).toBe("Ada");
    expect(view.user.fullName).toBe("Ada Profile");
    expect(view.user.primaryExamName).toBe("ATI TEAS 7");
    expect(view.user.email).toBe("ada.firestore@example.com");
  });

  it("derives active access and sorts active packages first", () => {
    const view = buildDashboardViewModel(userDoc(), authUser());

    expect(view.access.status).toBe("active");
    expect(view.access.planName).toBe("All Access Monthly");
    expect(view.packages[0].status).toBe("active");
    expect(view.packages[0].family).toBe("Nursing Entrance Exams");
    expect(view.packages[0].name).toBe("ATI TEAS 7");
  });

  it("uses the approved package families and sidebar package names", () => {
    const view = buildDashboardViewModel(userDoc(), authUser());

    expect(view.packages.map((pkg) => `${pkg.family}: ${pkg.name}`)).toEqual([
      "Nursing Entrance Exams: ATI TEAS 7",
      "Nursing Entrance Exams: HESI A2",
      "Nursing Exit Exams: LPN Exam",
      "Nursing Exit Exams: RN Exams",
      "Nursing Test Bank: LPN Exams",
      "Nursing Test Bank: RN Exams",
    ]);
  });

  it("offers free preview across all package families for non-subscribed users", () => {
    const view = buildDashboardViewModel(
      userDoc({
        billing: {
          ...userDoc().billing,
          subscription_status: null,
          plan_id: null,
          current_period_end: null,
        },
        entitlements: {
          ati_teas_7: false,
          hesi_a2: false,
          nursing_test_bank: false,
          nursing_exit_exams: false,
        },
      }),
      authUser()
    );

    expect(new Set(view.packages.map((pkg) => pkg.family))).toEqual(
      new Set(["Nursing Entrance Exams", "Nursing Test Bank", "Nursing Exit Exams"])
    );
    expect(view.packages.every((pkg) => pkg.status === "free")).toBe(true);
    expect(view.packages.every((pkg) => pkg.actionLabel === "Start Preview")).toBe(true);
  });

  it("uses active billing entitlement records when the user billing snapshot has not caught up", () => {
    const view = buildDashboardViewModel(
      userDoc({
        billing: {
          ...userDoc().billing,
          subscription_status: null,
          plan_id: null,
          current_period_start: null,
          current_period_end: null,
        },
        entitlements: {
          ati_teas_7: false,
          hesi_a2: false,
          nursing_test_bank: false,
          nursing_exit_exams: false,
        },
      }),
      authUser(),
      {
        entitlements: [
          {
            packageId: "hesi_a2",
            status: "active",
            sourcePlanId: "hesi_a2_one_time",
            accessEndsAt: null,
          },
        ],
      }
    );

    expect(view.access.status).toBe("active");
    expect(view.access.planName).toBe("Hesi A2 One Time");
    expect(view.packages.find((pkg) => pkg.id === "hesi_a2")?.status).toBe("active");
  });

  it("expands all access billing entitlement records into active dashboard exam cards", () => {
    const view = buildDashboardViewModel(
      userDoc({
        billing: {
          ...userDoc().billing,
          subscription_status: null,
          plan_id: null,
          current_period_start: null,
          current_period_end: null,
        },
        entitlements: {
          ati_teas_7: false,
          hesi_a2: false,
          nursing_test_bank: false,
          nursing_exit_exams: false,
        },
      }),
      authUser(),
      {
        entitlements: [
          {
            packageId: "all_access",
            status: "active",
            sourcePlanId: "all_access_one_time",
            accessEndsAt: null,
          },
        ],
      }
    );

    expect(view.packages.find((pkg) => pkg.id === "ati_teas")?.status).toBe("active");
    expect(view.packages.find((pkg) => pkg.id === "hesi_a2")?.status).toBe("active");
    expect(view.packages.find((pkg) => pkg.id === "nursing_test_bank_rn")?.status).toBe("active");
    expect(view.packages.find((pkg) => pkg.id === "nursing_exit_exam_rn")?.status).toBe("active");
  });

  it("shows honest empty attempt sections when no attempt collection is connected", () => {
    const view = buildDashboardViewModel(userDoc(), authUser());

    expect(view.recentActivity).toEqual([]);
    expect(view.completedExams).toEqual([]);
  });

  it("does not show zero accuracy as a real score before any attempt activity", () => {
    const view = buildDashboardViewModel(
      userDoc({
        stats: {
          ...userDoc().stats,
          total_attempts: 0,
          total_questions_answered: 0,
          accuracy_overall: 0,
          streak_days: 0,
          last_attempt_at: null,
        },
      }),
      authUser()
    );

    expect(view.performance.accuracy).toBeNull();
    expect(view.performance.hasStats).toBe(false);
  });

  it("builds profile tasks for missing profile and unverified email", () => {
    const view = buildDashboardViewModel(null, authUser({ emailVerified: false, displayName: null }));

    expect(view.user.firstName).toBe("ada");
    expect(view.user.userDocumentExists).toBe(false);
    const tasksById = new Map(view.profileTasks.map((task) => [task.id, task]));
    expect(tasksById.has("verify-email")).toBe(true);
    expect(tasksById.get("exam-focus")?.href).toBe("/profile?tab=account");
    expect(view.recommendations.find((item) => item.id === "choose-focus")?.href).toBe("/profile?tab=account");
  });

  it("hides email verification tasks when Firebase Auth is verified but Firestore is stale", () => {
    const view = buildDashboardViewModel(
      userDoc({
        auth: {
          ...userDoc().auth,
          email_verified: false,
        },
      }),
      authUser({ emailVerified: true })
    );

    expect(view.user.emailVerified).toBe(true);
    expect(view.profileTasks.some((task) => task.id === "verify-email")).toBe(false);
  });

  it("handles cancelling subscriptions with future access", () => {
    const view = buildDashboardViewModel(
      userDoc({
        billing: {
          ...userDoc().billing,
          subscription_status: "canceled",
          cancel_at_period_end: true,
          current_period_end: timestamp("2099-01-01T00:00:00Z") as UserDocument["billing"]["current_period_end"],
        },
      }),
      authUser()
    );

    expect(view.access.status).toBe("cancelling");
    expect(view.access.cancelAtPeriodEnd).toBe(true);
  });
});
