import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/server/firebase-admin";

export type AdminUserSummary = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
  providerIds: string[];
  adminClaim: boolean;
  firestoreProfile: {
    fullName: string | null;
    role: string | null;
    isAdminFlag: boolean;
    accountStatus: string | null;
    subscriptionStatus: string | null;
    planId: string | null;
    primaryExamId: string | null;
    totalAttempts: number | null;
    lastActiveAt: string | null;
  } | null;
};

export type AdminUserDetail = AdminUserSummary & {
  phoneNumber: string | null;
  photoURL: string | null;
  customClaims: Record<string, unknown>;
  firestoreDocument: {
    exists: boolean;
    email: string | null;
    phoneE164: string | null;
    avatarUrl: string | null;
    auth: Record<string, unknown> | null;
    access: Record<string, unknown> | null;
    billing: Record<string, unknown> | null;
    entitlements: Record<string, unknown> | null;
    referralSummary: Record<string, unknown> | null;
    accountState: Record<string, unknown> | null;
    stats: Record<string, unknown> | null;
    createdAt: string | null;
    updatedAt: string | null;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
  };
};

function timestampToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getNestedObject(data: DocumentData | undefined, key: string): Record<string, unknown> | null {
  if (!data) return null;
  return objectOrNull(data[key]);
}

function getNestedString(data: DocumentData | undefined, path: string[]): string | null {
  let current: unknown = data;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return nullableString(current);
}

function getNestedBoolean(data: DocumentData | undefined, path: string[]): boolean {
  let current: unknown = data;
  for (const key of path) {
    if (!current || typeof current !== "object") return false;
    current = (current as Record<string, unknown>)[key];
  }
  return current === true;
}

function getNestedNumber(data: DocumentData | undefined, path: string[]): number | null {
  let current: unknown = data;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return nullableNumber(current);
}

function providerIds(user: UserRecord) {
  return user.providerData.map((provider) => provider.providerId).filter(Boolean);
}

function mapSummary(user: UserRecord, firestoreData?: DocumentData): AdminUserSummary {
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? nullableString(firestoreData?.full_name),
    emailVerified: user.emailVerified,
    disabled: user.disabled,
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : null,
    lastSignInAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toISOString() : null,
    providerIds: providerIds(user),
    adminClaim: user.customClaims?.admin === true,
    firestoreProfile: firestoreData
      ? {
          fullName: nullableString(firestoreData.full_name),
          role: getNestedString(firestoreData, ["access", "role"]),
          isAdminFlag: getNestedBoolean(firestoreData, ["access", "is_admin"]),
          accountStatus: getNestedString(firestoreData, ["account_state", "status"]),
          subscriptionStatus: getNestedString(firestoreData, ["billing", "subscription_status"]),
          planId: getNestedString(firestoreData, ["billing", "plan_id"]),
          primaryExamId: getNestedString(firestoreData, ["profile", "primary_exam_id"]),
          totalAttempts: getNestedNumber(firestoreData, ["stats", "total_attempts"]),
          lastActiveAt: timestampToIso(firestoreData.last_active_at),
        }
      : null,
  };
}

export async function listAdminUsers(options: { limit?: number; pageToken?: string; search?: string }) {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const search = options.search?.trim().toLowerCase() || "";
  const auth = getAdminAuth();
  const db = getAdminDb();

  if (search && search.includes("@")) {
    try {
      const user = await auth.getUserByEmail(search);
      const doc = await db.collection("users").doc(user.uid).get();
      return {
        users: [mapSummary(user, doc.exists ? doc.data() : undefined)],
        nextPageToken: undefined,
      };
    } catch {
      // While admins type an email, keep partial values useful by falling back to current-page filtering.
    }
  }

  const result = await auth.listUsers(limit, options.pageToken);
  const userDocs = await db.getAll(...result.users.map((user) => db.collection("users").doc(user.uid)));
  const users = result.users.map((user, index) => mapSummary(user, userDocs[index]?.exists ? userDocs[index].data() : undefined));

  return {
    users: search
      ? users.filter((user) => {
          const values = [
            user.email,
            user.displayName,
            user.uid,
            user.firestoreProfile?.fullName,
            user.firestoreProfile?.role,
            user.firestoreProfile?.subscriptionStatus,
          ];
          return values.some((value) => value?.toLowerCase().includes(search));
        })
      : users,
    nextPageToken: result.pageToken,
  };
}

export async function getAdminUserDetail(uid: string): Promise<AdminUserDetail> {
  const auth = getAdminAuth();
  const db = getAdminDb();
  const user = await auth.getUser(uid);
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.exists ? doc.data() : undefined;
  const summary = mapSummary(user, data);

  return {
    ...summary,
    phoneNumber: user.phoneNumber ?? null,
    photoURL: user.photoURL ?? null,
    customClaims: user.customClaims ?? {},
    firestoreDocument: {
      exists: doc.exists,
      email: nullableString(data?.email),
      phoneE164: nullableString(data?.phone_e164),
      avatarUrl: nullableString(data?.avatar_url),
      auth: getNestedObject(data, "auth"),
      access: getNestedObject(data, "access"),
      billing: getNestedObject(data, "billing"),
      entitlements: getNestedObject(data, "entitlements"),
      referralSummary: getNestedObject(data, "referral_summary"),
      accountState: getNestedObject(data, "account_state"),
      stats: getNestedObject(data, "stats"),
      createdAt: timestampToIso(data?.created_at),
      updatedAt: timestampToIso(data?.updated_at),
      lastLoginAt: timestampToIso(data?.last_login_at),
      lastActiveAt: timestampToIso(data?.last_active_at),
    },
  };
}

export function assertAdminUserManager(decoded: DecodedIdToken) {
  if (decoded.admin !== true) {
    throw new Error("Admin claim required");
  }
}
