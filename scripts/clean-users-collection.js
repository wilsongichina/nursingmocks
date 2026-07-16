const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const USERS_COLLECTION = "users";
const CANONICAL_KEYS = ["ati_teas_7", "hesi_a2", "nursing_test_bank", "nursing_exit_exams"];

const LEGACY_KEY_MAP = {
  "exam:ati_teas_7": ["ati_teas_7"],
  "exam:hesi_a2": ["hesi_a2"],
  "bundle:all_access": CANONICAL_KEYS,
  all_access: CANONICAL_KEYS,
  "test_bank:rn": ["nursing_test_bank"],
  "test_bank:lpn": ["nursing_test_bank"],
  nursing_test_bank_rn: ["nursing_test_bank"],
  nursing_test_bank_lpn: ["nursing_test_bank"],
  "exit_exam:rn": ["nursing_exit_exams"],
  "exit_exam:lpn": ["nursing_exit_exams"],
  nursing_exit_exam_rn: ["nursing_exit_exams"],
  nursing_exit_exam_lpn: ["nursing_exit_exams"],
};

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

function canonicalEntitlements(raw) {
  const next = Object.fromEntries(CANONICAL_KEYS.map((key) => [key, false]));
  const source = raw && typeof raw === "object" ? raw : {};

  for (const [key, value] of Object.entries(source)) {
    if (value !== true) continue;
    if (CANONICAL_KEYS.includes(key)) {
      next[key] = true;
      continue;
    }
    for (const canonicalKey of LEGACY_KEY_MAP[key] || []) {
      next[canonicalKey] = true;
    }
  }

  return next;
}

function objectChanged(before, after) {
  const left = before && typeof before === "object" ? before : {};
  const right = after && typeof after === "object" ? after : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) return true;
  }
  return false;
}

function loginMetricsPatch(existing) {
  const metrics = existing && typeof existing === "object" ? existing : {};
  return {
    total_logins: typeof metrics.total_logins === "number" ? metrics.total_logins : 0,
    last_session_id: typeof metrics.last_session_id === "string" ? metrics.last_session_id : null,
    last_ip_address: typeof metrics.last_ip_address === "string" ? metrics.last_ip_address : null,
    last_user_agent: typeof metrics.last_user_agent === "string" ? metrics.last_user_agent : null,
    last_login_provider:
      metrics.last_login_provider === "password" || metrics.last_login_provider === "google" || metrics.last_login_provider === "apple"
        ? metrics.last_login_provider
        : null,
  };
}

function parseArgs() {
  const apply = process.argv.includes("--apply");
  const limitIndex = process.argv.indexOf("--limit");
  const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : null;
  return {
    apply,
    limit: Number.isFinite(limit) && limit > 0 ? limit : null,
  };
}

async function main() {
  loadLocalEnv();
  const { apply, limit } = parseArgs();
  const db = getDb();
  const snapshot = await db.collection(USERS_COLLECTION).get();
  const docs = limit ? snapshot.docs.slice(0, limit) : snapshot.docs;

  let scanned = 0;
  let changed = 0;
  let batch = db.batch();
  let pendingWrites = 0;
  const samples = [];

  for (const doc of docs) {
    scanned += 1;
    const data = doc.data();
    const nextEntitlements = canonicalEntitlements(data.entitlements);
    const nextLoginMetrics = loginMetricsPatch(data.login_metrics);
    const entitlementChanged = objectChanged(data.entitlements, nextEntitlements);
    const loginMetricsChanged = objectChanged(data.login_metrics, nextLoginMetrics);

    if (!entitlementChanged && !loginMetricsChanged) continue;

    changed += 1;
    if (samples.length < 10) {
      samples.push({
        uid: doc.id,
        beforeEntitlements: data.entitlements || null,
        afterEntitlements: nextEntitlements,
        beforeLoginMetrics: data.login_metrics || null,
        afterLoginMetrics: nextLoginMetrics,
      });
    }

    if (apply) {
      batch.update(
        doc.ref,
        {
          entitlements: nextEntitlements,
          login_metrics: nextLoginMetrics,
          updated_at: FieldValue.serverTimestamp(),
        }
      );
      pendingWrites += 1;

      if (pendingWrites === 400) {
        await batch.commit();
        batch = db.batch();
        pendingWrites = 0;
      }
    }
  }

  if (apply && pendingWrites > 0) {
    await batch.commit();
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        scanned,
        changed,
        samples,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
