import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, requireUserFromAuthorizationHeader } from "@/lib/server/firebase-admin";
import type { UserDocumentAuthProvider } from "@/types/user-document";

export const runtime = "nodejs";

const USERS_COLLECTION = "users";
const USER_LOGIN_EVENTS_COLLECTION = "user_login_events";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function requestIpAddress(request: NextRequest) {
  return (
    firstHeaderValue(request.headers.get("x-forwarded-for")) ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

function authProviderFromToken(provider: unknown): UserDocumentAuthProvider | null {
  if (provider === "google.com") return "google";
  if (provider === "apple.com") return "apple";
  if (provider === "password") return "password";
  return null;
}

export async function POST(request: NextRequest) {
  let uid: string | null = null;
  try {
    const decoded = await requireUserFromAuthorizationHeader(request.headers.get("authorization"));
    uid = decoded.uid;
    const db = getAdminDb();
    const eventRef = db.collection(USER_LOGIN_EVENTS_COLLECTION).doc();
    const userRef = db.collection(USERS_COLLECTION).doc(decoded.uid);
    const provider = authProviderFromToken(decoded.firebase?.sign_in_provider);
    const ipAddress = requestIpAddress(request);
    const userAgent = request.headers.get("user-agent");

    // Keep a compact user snapshot for fast admin review and append full login history separately.
    await db.runTransaction(async (transaction) => {
      transaction.set(eventRef, {
        eventId: eventRef.id,
        uid: decoded.uid,
        email: decoded.email ?? null,
        login_at: FieldValue.serverTimestamp(),
        ip_address: ipAddress,
        user_agent: userAgent,
        provider,
        session_id: eventRef.id,
        success: true,
        created_at: FieldValue.serverTimestamp(),
      });

      transaction.set(
        userRef,
        {
          last_login_at: FieldValue.serverTimestamp(),
          last_active_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
          login_metrics: {
            total_logins: FieldValue.increment(1),
            last_session_id: eventRef.id,
            last_ip_address: ipAddress,
            last_user_agent: userAgent,
            last_login_provider: provider,
          },
        },
        { merge: true }
      );
    });

    return NextResponse.json({ ok: true, eventId: eventRef.id });
  } catch (error) {
    if (uid) {
      try {
        await getAdminDb().collection(USERS_COLLECTION).doc(uid).set(
          {
            login_metrics: {
              last_login_event_error: error instanceof Error ? error.message : "Unknown login event error",
            },
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Avoid masking the original API failure.
      }
    }
    console.error("Login event tracking failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not record login event" }, { status: 401 });
  }
}
