import type { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/server/firebase-admin";
import { listAdminAuditLogs } from "@/lib/admin/audit";
import { listAdminEmailJobs } from "@/lib/admin/email-jobs";
import { listLoginSecurityOverview } from "@/lib/admin/login-security";

const USERS_COLLECTION = "users";
const BILLING_TRANSACTIONS_COLLECTION = "billing_transactions";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";

export type AdminDashboardSummary = {
  generatedAt: string;
  users: {
    total: number;
    disabled: number;
    emailVerified: number;
    activeLast30Days: number;
  };
  billing: {
    transactions: number;
    paidTransactions: number;
    revenue: number;
    currency: string;
    activeAccessGrants: number;
  };
  security: {
    highAttentionAccounts: number;
    reviewAccounts: number;
    watchAccounts: number;
  };
  email: {
    failedJobs: number;
    pendingJobs: number;
  };
  audit: {
    recentFailures: number;
  };
  recent: {
    payments: Array<{
      id: string;
      userId: string | null;
      planName: string | null;
      amount: number | null;
      currency: string | null;
      status: string | null;
      createdAt: string | null;
    }>;
    auditFailures: Array<{
      id: string;
      action: string;
      actorEmail: string | null;
      targetEmail: string | null;
      createdAt: string | null;
      errorMessage: string | null;
    }>;
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

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function countAuthUsers() {
  const auth = getAdminAuth();
  let pageToken: string | undefined;
  let total = 0;
  let disabled = 0;
  let emailVerified = 0;

  do {
    const page = await auth.listUsers(1000, pageToken);
    total += page.users.length;
    disabled += page.users.filter((user) => user.disabled).length;
    emailVerified += page.users.filter((user) => user.emailVerified).length;
    pageToken = page.pageToken;
  } while (pageToken);

  return { total, disabled, emailVerified };
}

async function countActiveUsersLast30Days() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const snapshot = await getAdminDb()
    .collection(USERS_COLLECTION)
    .where("last_active_at", ">=", cutoff)
    .select()
    .get();
  return snapshot.size;
}

async function readBillingSummary() {
  const db = getAdminDb();
  const [transactionsSnapshot, entitlementsSnapshot] = await Promise.all([
    db.collection(BILLING_TRANSACTIONS_COLLECTION).limit(500).get(),
    db.collection(BILLING_ENTITLEMENTS_COLLECTION).where("status", "==", "active").limit(500).get().catch(() => null),
  ]);

  let paidTransactions = 0;
  let revenue = 0;
  let currency = "USD";

  const payments = transactionsSnapshot.docs.map((doc) => {
    const data = doc.data();
    const amount = numberOrNull(data.amount);
    const status = text(data.status);
    const transactionCurrency = text(data.currency);

    if (status === "paid") {
      paidTransactions += 1;
      revenue += amount ?? 0;
      currency = transactionCurrency ?? currency;
    }

    return {
      id: text(data.transactionId) || doc.id,
      userId: text(data.uid),
      planName: text(data.planNameSnapshot),
      amount,
      currency: transactionCurrency,
      status,
      createdAt: timestampToIso(data.createdAt),
    };
  }).sort((first, second) => {
    const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
    const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
    return secondTime - firstTime;
  });

  return {
    transactions: transactionsSnapshot.size,
    paidTransactions,
    revenue,
    currency,
    activeAccessGrants: entitlementsSnapshot?.size ?? 0,
    recentPayments: payments.slice(0, 5),
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [authUsers, activeLast30Days, billing, loginSecurityUsers, emailJobs, auditLogs] = await Promise.all([
    countAuthUsers(),
    countActiveUsersLast30Days().catch(() => 0),
    readBillingSummary().catch(() => ({
      transactions: 0,
      paidTransactions: 0,
      revenue: 0,
      currency: "USD",
      activeAccessGrants: 0,
      recentPayments: [],
    })),
    listLoginSecurityOverview().catch(() => []),
    listAdminEmailJobs({ limit: 50 }).catch(() => []),
    listAdminAuditLogs({ limit: 50 }).catch(() => []),
  ]);

  const auditFailures = auditLogs.filter((log) => log.status === "failure");

  return {
    generatedAt: new Date().toISOString(),
    users: {
      ...authUsers,
      activeLast30Days,
    },
    billing: {
      transactions: billing.transactions,
      paidTransactions: billing.paidTransactions,
      revenue: billing.revenue,
      currency: billing.currency,
      activeAccessGrants: billing.activeAccessGrants,
    },
    security: {
      highAttentionAccounts: loginSecurityUsers.filter((user) => user.status === "high_attention").length,
      reviewAccounts: loginSecurityUsers.filter((user) => user.status === "review").length,
      watchAccounts: loginSecurityUsers.filter((user) => user.status === "watch").length,
    },
    email: {
      failedJobs: emailJobs.filter((job) => job.status === "failed" || job.status === "delivery_uncertain").length,
      pendingJobs: emailJobs.filter((job) => job.status === "pending" || job.status === "processing" || job.status === "retrying").length,
    },
    audit: {
      recentFailures: auditFailures.length,
    },
    recent: {
      payments: billing.recentPayments,
      auditFailures: auditFailures.slice(0, 5).map((log) => ({
        id: log.auditLogId,
        action: log.action,
        actorEmail: log.actorEmail,
        targetEmail: log.targetEmail,
        createdAt: log.createdAt,
        errorMessage: log.errorMessage,
      })),
    },
  };
}
