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

function publicWebhookFields(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    provider: data.provider ?? null,
    gatewayId: data.gatewayId ?? null,
    providerEventId: data.providerEventId ?? null,
    eventType: data.eventType ?? null,
    normalizedEventType: data.normalizedEventType ?? null,
    eventSupported: data.eventSupported ?? null,
    plannedEffects: data.plannedEffects ?? [],
    effectsEnabled: data.effectsEnabled ?? null,
    status: data.status ?? null,
    message: data.message ?? null,
    processed: data.processed ?? null,
    processingStatus: data.processingStatus ?? null,
    processingMessage: data.processingMessage ?? null,
    effectExecutionStatus: data.effectExecutionStatus ?? null,
    effectExecutionMessage: data.effectExecutionMessage ?? null,
    blockedWriteTargets: data.blockedWriteTargets ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });

  const email = process.argv[2] ?? "";
  const db = getFirestore();
  let uid = null;

  if (email) {
    const user = await getAuth().getUserByEmail(email);
    uid = user.uid;
  }

  const webhookSnapshot = await db
    .collection("billing_webhook_events")
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

  const output = {
    inspectedEmail: email || null,
    inspectedUid: uid,
    latestWebhookEvents: webhookSnapshot.docs.map(publicWebhookFields),
    userBilling: null,
    userEntitlements: [],
    userTransactions: [],
  };

  if (uid) {
    const userDoc = await db.collection("users").doc(uid).get();
    output.userBilling = userDoc.exists
      ? {
          billing: userDoc.data()?.billing ?? null,
          entitlements: userDoc.data()?.entitlements ?? null,
        }
      : null;

    const entitlementSnapshot = await db
      .collection("billing_entitlements")
      .where("uid", "==", uid)
      .limit(20)
      .get();
    output.userEntitlements = entitlementSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const transactionSnapshot = await db
      .collection("billing_transactions")
      .where("uid", "==", uid)
      .limit(20)
      .get();
    output.userTransactions = transactionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  console.log(JSON.stringify(serialize(output), null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
