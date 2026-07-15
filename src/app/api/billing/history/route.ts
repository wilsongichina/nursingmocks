import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { requireUserFromAuthorizationHeader, getAdminDb } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

const BILLING_TRANSACTIONS_COLLECTION = "billing_transactions";
const BILLING_SUBSCRIPTIONS_COLLECTION = "billing_subscriptions";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";

function toDateOrNull(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function serializeDates<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      toDateOrNull(entry)?.toISOString() ?? entry,
    ])
  );
}

async function listUserBillingRecords(collectionName: string, uid: string) {
  const snapshot = await getAdminDb().collection(collectionName).where("uid", "==", uid).get();
  return snapshot.docs
    .map((doc) => serializeDates({ ...doc.data(), id: doc.id }))
    .sort((left, right) => {
      const leftTime = Date.parse(String(left.createdAt ?? left.updatedAt ?? left.grantedAt ?? ""));
      const rightTime = Date.parse(String(right.createdAt ?? right.updatedAt ?? right.grantedAt ?? ""));
      return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
    });
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await requireUserFromAuthorizationHeader(request.headers.get("authorization"));
    const [transactions, subscriptions, entitlements] = await Promise.all([
      listUserBillingRecords(BILLING_TRANSACTIONS_COLLECTION, decoded.uid),
      listUserBillingRecords(BILLING_SUBSCRIPTIONS_COLLECTION, decoded.uid),
      listUserBillingRecords(BILLING_ENTITLEMENTS_COLLECTION, decoded.uid),
    ]);

    return NextResponse.json({ transactions, subscriptions, entitlements });
  } catch (error) {
    console.error("Billing history load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load billing history" }, { status: 401 });
  }
}
