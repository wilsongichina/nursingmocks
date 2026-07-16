import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { updateUserLoginSecuritySnapshot } from "@/lib/admin/login-security";
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

function hashIpAddress(ipAddress: string | null) {
  if (!ipAddress) return null;
  const salt = process.env.LOGIN_EVENT_IP_HASH_SALT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nursingmocks-login-event";
  return createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex");
}

function headerText(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value).trim().slice(0, 120) || null;
  } catch {
    return value.trim().slice(0, 120) || null;
  }
}

function requestLocation(request: NextRequest) {
  const country =
    headerText(request.headers.get("x-vercel-ip-country")) ||
    headerText(request.headers.get("cf-ipcountry"));
  const region =
    headerText(request.headers.get("x-vercel-ip-country-region")) ||
    headerText(request.headers.get("x-vercel-ip-region"));
  const city =
    headerText(request.headers.get("x-vercel-ip-city")) ||
    headerText(request.headers.get("cf-ipcity"));

  return {
    country,
    region,
    city,
    source: country || region || city ? "request_headers" : null,
  };
}

function deviceSummary(userAgent: string | null) {
  const value = userAgent || "";
  const lower = value.toLowerCase();
  const deviceType = /mobile|iphone|android/.test(lower)
    ? "mobile"
    : /ipad|tablet/.test(lower)
      ? "tablet"
      : value
        ? "desktop"
        : null;
  const browser = lower.includes("edg/")
    ? "Edge"
    : lower.includes("chrome/")
      ? "Chrome"
      : lower.includes("safari/") && !lower.includes("chrome/")
        ? "Safari"
        : lower.includes("firefox/")
          ? "Firefox"
          : null;
  const os = lower.includes("windows")
    ? "Windows"
    : lower.includes("mac os") || lower.includes("macintosh")
      ? "macOS"
      : lower.includes("android")
        ? "Android"
        : lower.includes("iphone") || lower.includes("ipad")
          ? "iOS"
          : lower.includes("linux")
            ? "Linux"
            : null;

  return { device_type: deviceType, browser, os };
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
    const ipHash = hashIpAddress(ipAddress);
    const userAgent = request.headers.get("user-agent");
    const location = requestLocation(request);
    const device = deviceSummary(userAgent);

    // Keep a compact user snapshot for fast admin review and append full login history separately.
    await db.runTransaction(async (transaction) => {
      transaction.set(eventRef, {
        eventId: eventRef.id,
        uid: decoded.uid,
        email: decoded.email ?? null,
        login_at: FieldValue.serverTimestamp(),
        ip_address: ipAddress,
        ip_hash: ipHash,
        user_agent: userAgent,
        device,
        location,
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
            last_ip_hash: ipHash,
            last_user_agent: userAgent,
            last_device: device,
            last_location: location,
            last_login_provider: provider,
          },
        },
        { merge: true }
      );
    });

    updateUserLoginSecuritySnapshot(decoded.uid).catch((snapshotError) => {
      console.warn("Login security snapshot update failed", {
        uid: decoded.uid,
        message: snapshotError instanceof Error ? snapshotError.message : "Unknown snapshot error",
      });
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
