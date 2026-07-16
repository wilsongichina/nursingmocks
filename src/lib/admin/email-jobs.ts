import type { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";

const EMAIL_JOBS_COLLECTION = "emailJobs";

export type AdminEmailJobRecord = {
  jobId: string;
  templateId: string;
  to: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  provider: string | null;
  providerMessageId: string | null;
  idempotencyKey: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sentAt: string | null;
  nextAttemptAt: string | null;
  lastErrorCategory: string | null;
  lastErrorMessage: string | null;
  templateVersion: number | null;
  dataKeys: string[];
};

export type AdminEmailJobListInput = {
  limit?: number;
  templateId?: string;
  status?: string;
  recipient?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function identifier(value: unknown) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function timestampToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

function recipientText(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean).join(", ");
  return text(value);
}

export async function listAdminEmailJobs(input: AdminEmailJobListInput = {}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const snapshot = await getAdminDb()
    .collection(EMAIL_JOBS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const templateId = identifier(input.templateId);
  const status = identifier(input.status);
  const recipient = text(input.recipient).toLowerCase();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const templateData = data.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? data.data as Record<string, unknown>
      : {};

    return {
      jobId: text(data.jobId) || doc.id,
      templateId: text(data.templateId) || "unknown",
      to: recipientText(data.to) || "Not available",
      status: text(data.status) || "unknown",
      attempts: numberOrNull(data.attempts) ?? 0,
      maxAttempts: numberOrNull(data.maxAttempts) ?? 0,
      provider: text(data.provider) || null,
      providerMessageId: text(data.providerMessageId) || null,
      idempotencyKey: text(data.idempotencyKey) || null,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
      sentAt: timestampToIso(data.sentAt),
      nextAttemptAt: timestampToIso(data.nextAttemptAt),
      lastErrorCategory: text(data.lastErrorCategory) || null,
      lastErrorMessage: text(data.lastErrorMessage) || null,
      templateVersion: numberOrNull(data.templateVersion),
      dataKeys: Object.keys(templateData).sort(),
    } satisfies AdminEmailJobRecord;
  }).filter((record) => {
    if (templateId && record.templateId !== templateId) return false;
    if (status && record.status !== status) return false;
    if (recipient && !record.to.toLowerCase().includes(recipient)) return false;
    return true;
  });
}
