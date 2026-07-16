const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.replace(/\\n/g, "\n")));
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

  throw new Error("Firebase Admin credentials are not configured.");
}

function serialize(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }
  return value;
}

async function main() {
  loadLocalEnv();
  const email = process.argv[2];
  if (!email) throw new Error("Usage: node scripts/check-user-record.js <email>");

  if (!getApps().length) initializeApp({ credential: getCredential() });

  const auth = getAuth();
  const db = getFirestore();
  const user = await auth.getUserByEmail(email);
  const userSnapshot = await db.collection("users").doc(user.uid).get();
  const loginEventsSnapshot = await db
    .collection("user_login_events")
    .where("uid", "==", user.uid)
    .get();
  const loginEvents = loginEventsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((left, right) => {
      const leftDate = left.created_at instanceof Timestamp ? left.created_at.toMillis() : 0;
      const rightDate = right.created_at instanceof Timestamp ? right.created_at.toMillis() : 0;
      return rightDate - leftDate;
    })
    .slice(0, 5);

  console.log(JSON.stringify(
    serialize({
      auth: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        providerData: user.providerData.map((provider) => provider.providerId),
      },
      userDocExists: userSnapshot.exists,
      userDoc: userSnapshot.exists ? userSnapshot.data() : null,
      recentLoginEvents: loginEvents,
    }),
    null,
    2
  ));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
