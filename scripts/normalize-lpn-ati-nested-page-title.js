const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "lpn-exams";
const NESTED_SLUG = "ati-lpn-exams";
const NORMALIZED_TITLE = "ATI LPN Exams";

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
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
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
  if (projectId && clientEmail && privateKey) return cert({ projectId, clientEmail, privateKey });
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();

  throw new Error("Firebase admin credentials were not found.");
}

async function findDocBySlug(collectionRef, slug) {
  const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();

  const parentDoc = await findDocBySlug(
    db.collection(`pillarPages/${PILLAR_ID}/subPages`),
    PARENT_SLUG
  );
  if (!parentDoc) throw new Error(`Parent page not found: ${PARENT_SLUG}`);

  const nestedDoc = await findDocBySlug(parentDoc.ref.collection("nestedSubPages"), NESTED_SLUG);
  if (!nestedDoc) throw new Error(`Nested page not found: ${NESTED_SLUG}`);

  const data = nestedDoc.data();
  const update = {
    pageName: NORMALIZED_TITLE,
    title: NORMALIZED_TITLE,
    heading: NORMALIZED_TITLE,
    seoLabel: NORMALIZED_TITLE,
    hero: {
      ...(data.hero || {}),
      title: NORMALIZED_TITLE,
    },
    lastUpdated: new Date().toISOString(),
  };

  if (APPLY) await nestedDoc.ref.set(update, { merge: true });

  console.log(JSON.stringify({
    apply: APPLY,
    parentSlug: PARENT_SLUG,
    nestedSlug: NESTED_SLUG,
    nestedId: nestedDoc.id,
    before: {
      pageName: data.pageName || null,
      title: data.title || null,
      heading: data.heading || null,
      seoLabel: data.seoLabel || null,
      heroTitle: data.hero?.title || null,
    },
    after: update,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
