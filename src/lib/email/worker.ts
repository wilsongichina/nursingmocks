import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { getEmailConfig } from "@/lib/email/config";
import { classifyEmailError } from "@/lib/email/errors";
import { EMAIL_JOBS_COLLECTION, type EmailJob } from "@/lib/email/jobs";
import type { EmailProvider } from "@/lib/email/provider";
import { ResendEmailProvider } from "@/lib/email/providers/resend-provider";
import { renderEmailTemplate } from "@/lib/email/template-registry";

const RETRY_DELAYS_MS = [0, 60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];
const LEASE_MS = 5 * 60_000;

export type ProcessEmailJobsResult = {
  scanned: number;
  claimed: number;
  sent: number;
  retrying: number;
  failed: number;
  deliveryUncertain: number;
};

export function nextRetryTimestamp(attempts: number) {
  const delay = RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
  return Timestamp.fromMillis(Date.now() + delay);
}

function canClaim(job: EmailJob, now: Timestamp) {
  if (job.status === "pending" || job.status === "retrying") {
    return !job.nextAttemptAt || job.nextAttemptAt.toMillis() <= now.toMillis();
  }
  if (job.status === "processing") {
    return !!job.processingLeaseExpiresAt && job.processingLeaseExpiresAt.toMillis() <= now.toMillis();
  }
  return false;
}

export async function claimEmailJob(jobId: string) {
  const db = getAdminDb();
  const ref = db.collection(EMAIL_JOBS_COLLECTION).doc(jobId);
  const now = Timestamp.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return null;

    const job = snapshot.data() as EmailJob;
    if (!canClaim(job, now)) return null;

    transaction.update(ref, {
      status: "processing",
      attempts: FieldValue.increment(1),
      processingLeaseExpiresAt: Timestamp.fromMillis(Date.now() + LEASE_MS),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ...job,
      attempts: job.attempts + 1,
      jobId,
    };
  });
}

async function finalizeSent(jobId: string, job: EmailJob, result: { provider: string; messageId: string }, templateVersion: number) {
  await getAdminDb().collection(EMAIL_JOBS_COLLECTION).doc(jobId).update({
    status: "sent",
    provider: result.provider,
    providerMessageId: result.messageId,
    templateVersion,
    sentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    processingLeaseExpiresAt: FieldValue.delete(),
    lastErrorCategory: FieldValue.delete(),
    lastErrorMessage: FieldValue.delete(),
  });
}

async function finalizeError(jobId: string, job: EmailJob, error: unknown) {
  const classified = classifyEmailError(error);
  const hasAttemptsLeft = classified.retryable && job.attempts < job.maxAttempts;
  const status = classified.category === "delivery_uncertain"
    ? "delivery_uncertain"
    : hasAttemptsLeft
      ? "retrying"
      : "failed";

  await getAdminDb().collection(EMAIL_JOBS_COLLECTION).doc(jobId).update({
    status,
    nextAttemptAt: hasAttemptsLeft ? nextRetryTimestamp(job.attempts) : FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
    processingLeaseExpiresAt: FieldValue.delete(),
    lastErrorCategory: classified.category,
    lastErrorMessage: classified.message.slice(0, 300),
  });

  return status;
}

export async function processClaimedEmailJob(job: EmailJob, provider: EmailProvider = new ResendEmailProvider()) {
  try {
    const rendered = renderEmailTemplate(job.templateId, job.data, getEmailConfig());
    const result = await provider.send({
      to: job.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      idempotencyKey: job.idempotencyKey,
    });
    await finalizeSent(job.jobId, job, result, rendered.version);
    return "sent" as const;
  } catch (error) {
    return finalizeError(job.jobId, job, error);
  }
}

export async function processDueEmailJobs(options: {
  limit?: number;
  provider?: EmailProvider;
} = {}): Promise<ProcessEmailJobsResult> {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const db = getAdminDb();
  const now = Timestamp.now();
  const result: ProcessEmailJobsResult = {
    scanned: 0,
    claimed: 0,
    sent: 0,
    retrying: 0,
    failed: 0,
    deliveryUncertain: 0,
  };

  const snapshot = await db
    .collection(EMAIL_JOBS_COLLECTION)
    .where("status", "in", ["pending", "retrying", "processing"])
    .limit(limit)
    .get();

  for (const doc of snapshot.docs) {
    result.scanned += 1;
    const existing = doc.data() as EmailJob;
    if (!canClaim(existing, now)) continue;

    const claimed = await claimEmailJob(doc.id);
    if (!claimed) continue;

    result.claimed += 1;
    const status = await processClaimedEmailJob(claimed, options.provider);
    if (status === "sent") result.sent += 1;
    else if (status === "retrying") result.retrying += 1;
    else if (status === "delivery_uncertain") result.deliveryUncertain += 1;
    else result.failed += 1;
  }

  return result;
}
