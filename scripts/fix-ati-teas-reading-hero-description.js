const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const TARGET_SLUG = "ati-teas-reading-practice-test";

const CLEAN_DESCRIPTION =
  "Practice ATI TEAS Reading on NursingMocks with questions covering Key Ideas and Details, Craft and Structure, and Integration of Knowledge and Ideas. You'll work with passages, directions, and source-based prompts, then choose the answer the text can actually support.";

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

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const db = getDb();
  const mappingSnapshot = await db
    .collection("routeMappings")
    .where("slug", "==", TARGET_SLUG)
    .limit(1)
    .get();

  if (mappingSnapshot.empty) {
    throw new Error(`Route mapping not found for ${TARGET_SLUG}`);
  }

  const mappingDoc = mappingSnapshot.docs[0];
  const mapping = mappingDoc.data();
  const refPath = mapping.refPath || mapping.contentPath;
  if (!refPath) throw new Error(`Route mapping ${mappingDoc.id} has no refPath/contentPath.`);

  const ref = db.doc(refPath);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error(`Target document does not exist: ${refPath}`);
  const before = snapshot.data();

  const update = {
    description: CLEAN_DESCRIPTION,
    content: CLEAN_DESCRIPTION,
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (apply) {
    await ref.set(update, { merge: true });
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    slug: TARGET_SLUG,
    refPath,
    before: {
      descriptionLength: String(before.description || "").length,
      hasWordHtml: String(before.description || "").includes("WordDocument"),
      hasJustify: String(before.description || "").includes("text-align:justify"),
      updatedAt: before.updatedAt?.toDate?.()?.toISOString?.() || before.updatedAt || null,
      lastUpdated: before.lastUpdated || null,
    },
    after: {
      description: CLEAN_DESCRIPTION,
      descriptionLength: CLEAN_DESCRIPTION.length,
      hasWordHtml: false,
      hasJustify: false,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
