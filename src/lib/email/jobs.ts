import {
  FieldValue,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { createEmailJobId } from "@/lib/email/idempotency";
import { assertValidEmailAddress } from "@/lib/email/validation";
import { isEmailTemplateId, type EmailTemplateId } from "@/lib/email/template-registry";

export type EmailJobStatus =
  | "pending"
  | "processing"
  | "sent"
  | "retrying"
  | "failed"
  | "delivery_uncertain";

export type EmailJob = {
  templateId: EmailTemplateId;
  to: string | string[];
  data: Record<string, unknown>;
  status: EmailJobStatus;
  attempts: number;
  maxAttempts: number;
  provider?: string;
  providerMessageId?: string;
  idempotencyKey: string;
  jobId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp;
  nextAttemptAt?: Timestamp;
  processingLeaseExpiresAt?: Timestamp;
  lastErrorCategory?: string;
  lastErrorMessage?: string;
  templateVersion?: number;
};

export type CreateEmailJobInput = {
  templateId: EmailTemplateId;
  to: string | string[];
  data: Record<string, unknown>;
  idempotencyKey: string;
  maxAttempts?: number;
};

export const EMAIL_JOBS_COLLECTION = "emailJobs";

function validateRecipients(to: string | string[]) {
  const recipients = Array.isArray(to) ? to : [to];
  if (!recipients.length) throw new Error("Email job requires at least one recipient");
  recipients.forEach((recipient) => assertValidEmailAddress(recipient, "recipient email"));
}

export function emailJobRef(idempotencyKey: string): DocumentReference {
  const db = getAdminDb();
  return db.collection(EMAIL_JOBS_COLLECTION).doc(createEmailJobId(idempotencyKey));
}

export async function createEmailJob(input: CreateEmailJobInput) {
  if (!isEmailTemplateId(input.templateId)) {
    throw new Error("Unsupported email template");
  }
  validateRecipients(input.to);

  const ref = emailJobRef(input.idempotencyKey);
  const jobId = ref.id;

  return getAdminDb().runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      return { jobId, created: false };
    }

    transaction.create(ref, {
      templateId: input.templateId,
      to: input.to,
      data: input.data,
      status: "pending",
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 5,
      idempotencyKey: input.idempotencyKey,
      jobId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      nextAttemptAt: FieldValue.serverTimestamp(),
    });

    return { jobId, created: true };
  });
}

export async function createWelcomeEmailJob(input: {
  uid: string;
  email: string;
  name: string;
}) {
  return createEmailJob({
    templateId: "welcome",
    to: input.email,
    data: { name: input.name },
    idempotencyKey: `welcome:${input.uid}`,
  });
}

export async function createPasswordResetEmailJob(input: {
  email: string;
  resetUrl: string;
  requestId: string;
}) {
  return createEmailJob({
    templateId: "password_reset",
    to: input.email,
    data: { resetUrl: input.resetUrl },
    idempotencyKey: `password_reset:${input.requestId}`,
    maxAttempts: 3,
  });
}

export async function createEmailVerificationJob(input: {
  email: string;
  verificationUrl: string;
  requestId: string;
}) {
  return createEmailJob({
    templateId: "email_verification",
    to: input.email,
    data: { verificationUrl: input.verificationUrl },
    idempotencyKey: `email_verification:${input.requestId}`,
    maxAttempts: 3,
  });
}

export async function createAccountDisabledEmailJob(input: {
  email: string;
  message: string;
  requestId: string;
}) {
  return createEmailJob({
    templateId: "account_disabled",
    to: input.email,
    data: { message: input.message },
    idempotencyKey: `account_disabled:${input.requestId}`,
    maxAttempts: 3,
  });
}

export async function createContactEmailJobs(input: {
  submissionId: string;
  name: string;
  email: string;
  topic?: string;
  urgency?: string;
  message: string;
  internalRecipient: string;
}) {
  const acknowledgement = await createEmailJob({
    templateId: "contact_acknowledgement",
    to: input.email,
    data: { name: input.name },
    idempotencyKey: `contact_acknowledgement:${input.submissionId}`,
  });

  const notification = await createEmailJob({
    templateId: "contact_notification",
    to: input.internalRecipient,
    data: {
      name: input.name,
      email: input.email,
      topic: input.topic,
      urgency: input.urgency,
      message: input.message,
    },
    idempotencyKey: `contact_notification:${input.submissionId}`,
  });

  return { acknowledgement, notification };
}

export async function createPurchaseConfirmationEmailJob(input: {
  verifiedPaymentEventId: string;
  to: string;
  productName: string;
}) {
  return createEmailJob({
    templateId: "purchase_confirmation",
    to: input.to,
    data: { productName: input.productName },
    idempotencyKey: `purchase_confirmation:${input.verifiedPaymentEventId}`,
  });
}

export async function createAccessGrantedEmailJob(input: {
  entitlementId: string;
  to: string;
  accessName: string;
}) {
  return createEmailJob({
    templateId: "access_granted",
    to: input.to,
    data: { accessName: input.accessName },
    idempotencyKey: `access_granted:${input.entitlementId}`,
  });
}

export async function createPaymentFailedEmailJob(input: {
  verifiedInvoiceId: string;
  to: string;
}) {
  return createEmailJob({
    templateId: "payment_failed",
    to: input.to,
    data: {},
    idempotencyKey: `payment_failed:${input.verifiedInvoiceId}`,
  });
}

export async function createSubscriptionCancelledEmailJob(input: {
  verifiedSubscriptionEventId: string;
  to: string;
}) {
  return createEmailJob({
    templateId: "subscription_cancelled",
    to: input.to,
    data: {},
    idempotencyKey: `subscription_cancelled:${input.verifiedSubscriptionEventId}`,
  });
}
