const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");

const USERS_COLLECTION = "users";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";
const CANONICAL_EXAM_IDS = ["ati_teas_7", "hesi_a2", "nursing_test_bank", "nursing_exit_exams"];

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

function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: getCredential() });
  }
  return getFirestore();
}

function parseArgs() {
  const uidIndex = process.argv.indexOf("--uid");
  const examsIndex = process.argv.indexOf("--exams");
  const uid = uidIndex >= 0 ? String(process.argv[uidIndex + 1] || "").trim() : "";
  const exams = examsIndex >= 0
    ? String(process.argv[examsIndex + 1] || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!uid) throw new Error("Usage: node scripts/set-user-exam-access.js --uid USER_UID --exams ati_teas_7 [--apply]");
  const invalid = exams.filter((examId) => !CANONICAL_EXAM_IDS.includes(examId));
  if (invalid.length > 0) throw new Error(`Invalid exam IDs: ${invalid.join(", ")}`);

  return {
    uid,
    exams,
    apply: process.argv.includes("--apply"),
  };
}

function serialize(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }
  return value;
}

function activeAccessEnd(value) {
  if (!value) return true;
  const date = value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : null;
  if (!date) return true;
  return date.getTime() > Date.now();
}

function examIdForEntitlement(data) {
  const ids = [data.examId, data.packageId, data.sourcePlanId, data.entitlementId].filter((value) => typeof value === "string");
  for (const id of ids) {
    for (const examId of CANONICAL_EXAM_IDS) {
      if (id === examId || id.startsWith(`${examId}_`)) return examId;
    }
    if (id === "all_access" || id.includes("_all_access_") || id.includes("bundle:all_access")) return "all_access";
  }
  return null;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const db = getDb();
  const allowed = new Set(options.exams);
  const nextEntitlements = Object.fromEntries(CANONICAL_EXAM_IDS.map((examId) => [examId, allowed.has(examId)]));

  const userRef = db.collection(USERS_COLLECTION).doc(options.uid);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) throw new Error(`User document not found: ${options.uid}`);

  const entitlementSnapshot = await db
    .collection(BILLING_ENTITLEMENTS_COLLECTION)
    .where("uid", "==", options.uid)
    .get();

  const activeRecords = entitlementSnapshot.docs
    .map((doc) => ({ ref: doc.ref, id: doc.id, data: doc.data(), examId: examIdForEntitlement({ entitlementId: doc.id, ...doc.data() }) }))
    .filter((record) => record.data.status === "active" && activeAccessEnd(record.data.accessEndsAt));

  const recordsToExpire = activeRecords.filter((record) => record.examId === "all_access" || !allowed.has(record.examId));
  const recordsToKeep = activeRecords.filter((record) => allowed.has(record.examId));

  if (options.apply) {
    const batch = db.batch();
    batch.update(userRef, {
      entitlements: nextEntitlements,
      updated_at: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    for (const record of recordsToExpire) {
      batch.update(record.ref, {
        status: "expired",
        revokedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        migrationNotes: FieldValue.arrayUnion(`Expired during targeted access adjustment. Allowed exams: ${options.exams.join(", ") || "none"}.`),
      });
    }

    await batch.commit();
  }

  console.log(JSON.stringify(serialize({
    mode: options.apply ? "apply" : "dry-run",
    uid: options.uid,
    targetEntitlements: nextEntitlements,
    activeRecords: activeRecords.map((record) => ({
      id: record.id,
      examId: record.examId,
      status: record.data.status,
      accessEndsAt: record.data.accessEndsAt ?? null,
    })),
    recordsToKeep: recordsToKeep.map((record) => ({ id: record.id, examId: record.examId })),
    recordsToExpire: recordsToExpire.map((record) => ({ id: record.id, examId: record.examId })),
  }), null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
