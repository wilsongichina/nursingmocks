import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccountCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (json) {
    return cert(JSON.parse(json.replace(/\\n/g, "\n")));
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  return null;
}

export function getFirebaseAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const credential = getServiceAccountCredential();
  if (!credential) {
    throw new Error("Firebase Admin is not configured");
  }

  return initializeApp({ credential });
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

export async function verifyFirebaseIdToken(idToken: string) {
  if (!idToken) {
    throw new Error("Missing Firebase ID token");
  }
  return getAdminAuth().verifyIdToken(idToken);
}

export async function requireAdminFromAuthorizationHeader(authorization: string | null) {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const decoded = await verifyFirebaseIdToken(token);
  if (decoded.admin !== true) {
    throw new Error("Admin claim required");
  }
  return decoded;
}
