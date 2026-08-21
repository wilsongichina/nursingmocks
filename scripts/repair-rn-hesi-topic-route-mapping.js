const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "rn-exams";
const NESTED_SLUG = "hesi-rn-exams";
const TOPIC_SLUG = "hesi-rn-fundamentals-practice-questions";
const TOPIC_TITLE = "Fundamentals";

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

  const topicDoc = await findDocBySlug(nestedDoc.ref.collection("topics"), TOPIC_SLUG);
  if (!topicDoc) throw new Error(`Topic not found: ${TOPIC_SLUG}`);

  const refPath = topicDoc.ref.path;
  const payload = {
    type: "topic",
    pillarId: PILLAR_ID,
    slug: TOPIC_SLUG,
    subPageId: parentDoc.id,
    nestedPageId: nestedDoc.id,
    topicId: topicDoc.id,
    quizId: null,
    refPath,
    contentPath: refPath,
    title: TOPIC_TITLE,
    examAccessProductId: "nursing_test_bank",
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  const byRefPath = await db.collection("routeMappings").where("refPath", "==", refPath).limit(1).get();
  if (!byRefPath.empty) {
    await byRefPath.docs[0].ref.set(payload, { merge: true });
    console.log(JSON.stringify({ action: "updated_by_refPath", routeMappingId: byRefPath.docs[0].id, ...payload }, null, 2));
    return;
  }

  const bySlug = await db
    .collection("routeMappings")
    .where("pillarId", "==", PILLAR_ID)
    .where("slug", "==", TOPIC_SLUG)
    .limit(1)
    .get();
  if (!bySlug.empty) {
    await bySlug.docs[0].ref.set(payload, { merge: true });
    console.log(JSON.stringify({ action: "updated_by_slug", routeMappingId: bySlug.docs[0].id, ...payload }, null, 2));
    return;
  }

  const created = await db.collection("routeMappings").add({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log(JSON.stringify({ action: "created", routeMappingId: created.id, ...payload }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(getApps().map((app) => app.delete()));
  });
