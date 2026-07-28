const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const APPLY = process.argv.includes("--apply");
const SCAN_ALL_PILLARS = process.argv.includes("--all-pillars");
const PILLAR_IDS = SCAN_ALL_PILLARS
  ? ["nursing-entrance-exam", "nursing-test-bank", "nursing-exit-exam"]
  : ["nursing-test-bank"];

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
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

function cleanString(value) {
  return value
    .replace(/https:\/\/www\.teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/https:\/\/teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/http:\/\/www\.teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/http:\/\/teasgurus\.com/gi, "https://www.nursingmocks.com")
    .replace(/www\.teasgurus\.com/gi, "www.nursingmocks.com")
    .replace(/teasgurus\.com/gi, "nursingmocks.com")
    .replace(/support@teasgurus\.com/gi, "support@nursingmocks.com")
    .replace(/teasgurus@gmail\.com/gi, "support@nursingmocks.com")
    .replace(/\/teas-gurus-logo\.png/gi, "/nursing-mocks-logo.png")
    .replace(/TeasGurus/gi, "NursingMocks")
    .replace(/Teas Gurus/gi, "NursingMocks")
    .replace(/teas-gurus/gi, "nursingmocks")
    .replace(/teasgurus/gi, "nursingmocks");
}

function cleanValue(value) {
  if (typeof value === "string") return cleanString(value);
  if (Array.isArray(value)) return value.map(cleanValue);
  if (!value || typeof value !== "object") return value;
  if (typeof value.toDate === "function") return value;

  const next = {};
  for (const [key, child] of Object.entries(value)) {
    next[key] = cleanValue(child);
  }
  return next;
}

function hasLegacyBranding(value) {
  return /TeasGurus|Teas Gurus|teasgurus|teas-gurus|support@teasgurus|teas-gurus-logo/i.test(
    JSON.stringify(value)
  );
}

function diffTopLevelFields(data) {
  const updates = {};
  for (const [key, value] of Object.entries(data)) {
    if (!hasLegacyBranding(value)) continue;
    const cleaned = cleanValue(value);
    if (JSON.stringify(cleaned) !== JSON.stringify(value)) {
      updates[key] = cleaned;
    }
  }
  return updates;
}

async function scanCollection(collectionRef, stats) {
  const snapshot = await collectionRef.get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = diffTopLevelFields(data);
    const changedFields = Object.keys(updates);

    if (changedFields.length) {
      stats.changedDocs += 1;
      stats.changedFields += changedFields.length;
      console.log(`${APPLY ? "UPDATE" : "DRY"} ${doc.ref.path}: ${changedFields.join(", ")}`);
      if (APPLY) await doc.ref.update(updates);
    }

    const childCollections = await doc.ref.listCollections();
    for (const childCollection of childCollections) {
      await scanCollection(childCollection, stats);
    }
  }
}

async function main() {
  loadLocalEnv();
  const db = getDb();
  const stats = { changedDocs: 0, changedFields: 0 };

  for (const pillarId of PILLAR_IDS) {
    const pillarRef = db.collection("pillarPages").doc(pillarId);
    const pillarSnap = await pillarRef.get();
    if (pillarSnap.exists) {
      const updates = diffTopLevelFields(pillarSnap.data() || {});
      const changedFields = Object.keys(updates);
      if (changedFields.length) {
        stats.changedDocs += 1;
        stats.changedFields += changedFields.length;
        console.log(`${APPLY ? "UPDATE" : "DRY"} ${pillarRef.path}: ${changedFields.join(", ")}`);
        if (APPLY) await pillarRef.update(updates);
      }
    }

    for (const childCollection of await pillarRef.listCollections()) {
      await scanCollection(childCollection, stats);
    }
  }

  console.log(
    `${APPLY ? "Applied" : "Dry run complete"}: ${stats.changedDocs} docs, ${stats.changedFields} top-level fields.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
