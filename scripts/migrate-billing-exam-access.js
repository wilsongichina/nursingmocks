const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");

const USERS_COLLECTION = "users";
const BILLING_ENTITLEMENTS_COLLECTION = "billing_entitlements";

const CANONICAL_EXAM_IDS = ["ati_teas_7", "hesi_a2", "nursing_test_bank", "nursing_exit_exams"];

const LEGACY_ENTITLEMENT_MAP = {
  ati_teas: ["ati_teas_7"],
  "exam:ati_teas_7": ["ati_teas_7"],
  "exam:hesi_a2": ["hesi_a2"],
  "bundle:all_access": CANONICAL_EXAM_IDS,
  all_access: CANONICAL_EXAM_IDS,
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

function parseArgs() {
  const apply = process.argv.includes("--apply");
  const limitIndex = process.argv.indexOf("--limit");
  const uidIndex = process.argv.indexOf("--uid");
  const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : null;
  return {
    apply,
    limit: Number.isFinite(limit) && limit > 0 ? limit : null,
    uid: uidIndex >= 0 ? String(process.argv[uidIndex + 1] || "").trim() : "",
  };
}

function canonicalKeysForIdentifiers(values) {
  const canonical = new Set();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = value.trim().toLowerCase();
    if (!normalized) continue;
    if (CANONICAL_EXAM_IDS.includes(normalized)) {
      canonical.add(normalized);
      continue;
    }
    for (const key of LEGACY_ENTITLEMENT_MAP[normalized] || []) {
      canonical.add(key);
    }
    for (const key of CANONICAL_EXAM_IDS) {
      if (normalized.startsWith(`${key}_`)) {
        canonical.add(key);
      }
    }
  }

  return Array.from(canonical);
}

function canonicalUserEntitlements(raw) {
  const next = Object.fromEntries(CANONICAL_EXAM_IDS.map((key) => [key, false]));
  const source = raw && typeof raw === "object" ? raw : {};
  let hasRecognizedKey = false;

  for (const [key, value] of Object.entries(source)) {
    if (value !== true) continue;
    const canonicalKeys = canonicalKeysForIdentifiers([key]);
    if (canonicalKeys.length > 0) hasRecognizedKey = true;
    for (const canonicalKey of canonicalKeys) {
      next[canonicalKey] = true;
    }
  }

  return hasRecognizedKey ? next : null;
}

function changedObject(leftValue, rightValue) {
  const left = leftValue && typeof leftValue === "object" ? leftValue : {};
  const right = rightValue && typeof rightValue === "object" ? rightValue : {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) return true;
  }
  return false;
}

function serialize(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]));
  }
  return value;
}

function entitlementIdentifiers(docId, data) {
  return [
    docId,
    data.entitlementId,
    data.examId,
    data.packageId,
    data.sourcePlanId,
  ].filter((value) => typeof value === "string" && value.trim());
}

function migrationEntitlementId(uid, examId, sourceId) {
  return `${uid}_${examId}_${sourceId}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

async function scanUsers(db, options, batchState, report) {
  let query = db.collection(USERS_COLLECTION);
  if (options.uid) query = query.where("__name__", "==", options.uid);
  const snapshot = await query.get();
  const docs = options.limit ? snapshot.docs.slice(0, options.limit) : snapshot.docs;

  report.users.scanned = docs.length;

  for (const doc of docs) {
    const data = doc.data();
    const nextEntitlements = canonicalUserEntitlements(data.entitlements);
    if (!nextEntitlements || !changedObject(data.entitlements, nextEntitlements)) continue;

    report.users.changed += 1;
    if (report.samples.users.length < 10) {
      report.samples.users.push({
        uid: doc.id,
        before: data.entitlements || null,
        after: nextEntitlements,
      });
    }

    if (options.apply) {
      batchState.batch.update(doc.ref, {
        entitlements: nextEntitlements,
        updated_at: FieldValue.serverTimestamp(),
      });
      await flushIfNeeded(db, batchState);
    }
  }
}

async function scanBillingEntitlements(db, options, batchState, report) {
  let query = db.collection(BILLING_ENTITLEMENTS_COLLECTION);
  if (options.uid) query = query.where("uid", "==", options.uid);
  const snapshot = await query.get();
  const docs = options.limit ? snapshot.docs.slice(0, options.limit) : snapshot.docs;

  report.billingEntitlements.scanned = docs.length;

  for (const doc of docs) {
    const data = doc.data();
    const uid = typeof data.uid === "string" ? data.uid : "";
    const status = typeof data.status === "string" ? data.status : "";
    const sourceId = typeof data.sourcePlanId === "string" && data.sourcePlanId
      ? data.sourcePlanId
      : doc.id;
    const canonicalKeys = canonicalKeysForIdentifiers(entitlementIdentifiers(doc.id, data));

    if (canonicalKeys.length === 0) {
      report.billingEntitlements.unmapped += 1;
      if (report.samples.unmappedEntitlements.length < 10) {
        report.samples.unmappedEntitlements.push({ id: doc.id, uid, packageId: data.packageId ?? null, examId: data.examId ?? null, sourcePlanId: data.sourcePlanId ?? null });
      }
      continue;
    }

    if (canonicalKeys.length === 1 && data.examId !== canonicalKeys[0]) {
      report.billingEntitlements.examIdBackfills += 1;
      if (report.samples.examIdBackfills.length < 10) {
        report.samples.examIdBackfills.push({ id: doc.id, uid, beforeExamId: data.examId ?? null, afterExamId: canonicalKeys[0] });
      }
      if (options.apply) {
        batchState.batch.update(doc.ref, {
          examId: canonicalKeys[0],
          updatedAt: FieldValue.serverTimestamp(),
          migrationNotes: FieldValue.arrayUnion("Backfilled examId from legacy package/plan identifier."),
        });
        await flushIfNeeded(db, batchState);
      }
    }

    if (canonicalKeys.length > 1 && uid && status === "active") {
      const missingExamIds = [];
      for (const examId of canonicalKeys) {
        const migrationRef = db
          .collection(BILLING_ENTITLEMENTS_COLLECTION)
          .doc(migrationEntitlementId(uid, examId, sourceId));
        const migrationSnapshot = await migrationRef.get();
        if (!migrationSnapshot.exists) missingExamIds.push(examId);
      }

      if (missingExamIds.length === 0) {
        report.billingEntitlements.alreadyExpanded += canonicalKeys.length;
        continue;
      }

      report.billingEntitlements.allAccessExpansions += missingExamIds.length;
      if (report.samples.allAccessExpansions.length < 10) {
        report.samples.allAccessExpansions.push({ id: doc.id, uid, expandsTo: missingExamIds });
      }

      if (options.apply) {
        for (const examId of missingExamIds) {
          const migrationRef = db
            .collection(BILLING_ENTITLEMENTS_COLLECTION)
            .doc(migrationEntitlementId(uid, examId, sourceId));
          batchState.batch.set(
            migrationRef,
            {
              ...data,
              entitlementId: migrationRef.id,
              examId,
              packageId: examId,
              migratedFromEntitlementId: doc.id,
              migrationType: "all_access_to_exam_access",
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          await flushIfNeeded(db, batchState);
        }
        batchState.batch.update(doc.ref, {
          migrationNotes: FieldValue.arrayUnion("Expanded active All Access grant into individual exam access grants."),
          updatedAt: FieldValue.serverTimestamp(),
        });
        await flushIfNeeded(db, batchState);
      }
    }
  }
}

async function flushIfNeeded(db, batchState) {
  batchState.pending += 1;
  if (batchState.pending < 400) return;
  await batchState.batch.commit();
  batchState.batch = db.batch();
  batchState.pending = 0;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const db = getDb();
  const batchState = { batch: db.batch(), pending: 0 };
  const report = {
    mode: options.apply ? "apply" : "dry-run",
    uid: options.uid || null,
    limit: options.limit,
    users: {
      scanned: 0,
      changed: 0,
    },
    billingEntitlements: {
      scanned: 0,
      examIdBackfills: 0,
      allAccessExpansions: 0,
      alreadyExpanded: 0,
      unmapped: 0,
    },
    samples: {
      users: [],
      examIdBackfills: [],
      allAccessExpansions: [],
      unmappedEntitlements: [],
    },
  };

  await scanUsers(db, options, batchState, report);
  await scanBillingEntitlements(db, options, batchState, report);

  if (options.apply && batchState.pending > 0) {
    await batchState.batch.commit();
  }

  console.log(JSON.stringify(serialize(report), null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
