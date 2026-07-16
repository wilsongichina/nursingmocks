import { createHash, randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminDb } from "@/lib/server/firebase-admin";

const ADMIN_AUDIT_LOGS_COLLECTION = "adminAuditLogs";

export type AdminAuditAction =
  | "user.detail.view"
  | "user.search"
  | "user.account.disable"
  | "user.account.enable"
  | "user.password_reset.send"
  | "user.email_verification.send"
  | "user.tokens.revoke"
  | "user.profile.update"
  | "user.entitlement.grant"
  | "user.entitlement.revoke"
  | "admin.audit.view";

export type AdminAuditLogRecord = {
  auditLogId: string;
  action: string;
  actorUid: string;
  actorEmail: string | null;
  targetUid: string | null;
  targetEmail: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  requestId: string;
  createdAt: string | null;
  ipHash: string | null;
  userAgent: string | null;
  status: "success" | "failure";
  errorMessage: string | null;
};

export type AdminAuditWriteInput = {
  action: AdminAuditAction | string;
  actor: Pick<DecodedIdToken, "uid" | "email">;
  targetUid?: string | null;
  targetEmail?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  requestId?: string;
  ipHash?: string | null;
  userAgent?: string | null;
  status?: "success" | "failure";
  errorMessage?: string | null;
};

export type AdminAuditListInput = {
  limit?: number;
  action?: string;
  targetUid?: string;
  actorUid?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function timestampToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return null;
}

export function createAdminAuditRequestId(prefix = "admin") {
  return `${prefix}_${Date.now()}_${randomUUID()}`;
}

export function readRequestMetadata(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ipSalt = process.env.ADMIN_AUDIT_IP_HASH_SALT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nursingmocks-admin-audit";
  return {
    // Store a hash instead of the raw IP so the audit trail can identify repeated sources without exposing addresses.
    ipHash: forwardedFor ? createHash("sha256").update(`${ipSalt}:${forwardedFor}`).digest("hex") : null,
    userAgent: headers.get("user-agent") || null,
  };
}

export async function writeAdminAuditLog(input: AdminAuditWriteInput) {
  const db = getAdminDb();
  const ref = db.collection(ADMIN_AUDIT_LOGS_COLLECTION).doc();
  const requestId = normalizeText(input.requestId) || createAdminAuditRequestId();

  await ref.set({
    auditLogId: ref.id,
    action: input.action,
    actorUid: input.actor.uid,
    actorEmail: input.actor.email ?? null,
    targetUid: input.targetUid ?? null,
    targetEmail: input.targetEmail ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    reason: normalizeText(input.reason) || null,
    requestId,
    createdAt: FieldValue.serverTimestamp(),
    ipHash: input.ipHash ?? null,
    userAgent: input.userAgent ?? null,
    status: input.status ?? "success",
    errorMessage: input.errorMessage ?? null,
  });

  return { auditLogId: ref.id, requestId };
}

export async function listAdminAuditLogs(input: AdminAuditListInput = {}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const query = getAdminDb()
    .collection(ADMIN_AUDIT_LOGS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit);

  const snapshot = await query.get();
  const action = normalizeText(input.action);
  const targetUid = normalizeText(input.targetUid);
  const actorUid = normalizeText(input.actorUid);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      auditLogId: normalizeText(data.auditLogId) || doc.id,
      action: normalizeText(data.action) || "unknown",
      actorUid: normalizeText(data.actorUid) || "unknown",
      actorEmail: normalizeText(data.actorEmail) || null,
      targetUid: normalizeText(data.targetUid) || null,
      targetEmail: normalizeText(data.targetEmail) || null,
      before: data.before && typeof data.before === "object" && !Array.isArray(data.before) ? data.before : null,
      after: data.after && typeof data.after === "object" && !Array.isArray(data.after) ? data.after : null,
      reason: normalizeText(data.reason) || null,
      requestId: normalizeText(data.requestId) || "unknown",
      createdAt: timestampToIso(data.createdAt),
      ipHash: normalizeText(data.ipHash) || null,
      userAgent: normalizeText(data.userAgent) || null,
      status: data.status === "failure" ? "failure" : "success",
      errorMessage: normalizeText(data.errorMessage) || null,
    } satisfies AdminAuditLogRecord;
  }).filter((record) => {
    if (action && record.action !== action) return false;
    if (targetUid && record.targetUid !== targetUid) return false;
    if (actorUid && record.actorUid !== actorUid) return false;
    return true;
  });
}
