const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const PILLAR_ID = "nursing-test-bank";

const PAGES = [
  {
    parentSlug: "rn-exams",
    nestedSlug: "rn-nursing-course-exams",
    pageName: "RN Nursing Course Exams",
    description:
      "Practice RN nursing course exams covering medical-surgical nursing, fundamentals, pharmacology, health assessment, leadership, maternal newborn, pediatrics, mental health, and other course-based nursing topics.",
  },
  {
    parentSlug: "lpn-exams",
    nestedSlug: "lpn-nursing-course-exams",
    pageName: "LPN Nursing Course Exams",
    description:
      "Practice LPN nursing course exams covering fundamentals, medical-surgical nursing, dosage calculations, health assessment, leadership, and other practical nursing course topics.",
  },
];

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

function slugTitle(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function findDocBySlug(collectionRef, slug) {
  const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function upsertRouteMapping(db, mapping) {
  if (!APPLY) return { action: "planned" };

  const routeMappingsRef = db.collection("routeMappings");
  const refPathSnapshot = await routeMappingsRef.where("refPath", "==", mapping.refPath).limit(1).get();
  const payload = {
    ...mapping,
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };

  if (!refPathSnapshot.empty) {
    await refPathSnapshot.docs[0].ref.set(payload, { merge: true });
    return { action: "updated", id: refPathSnapshot.docs[0].id };
  }

  const slugSnapshot = await routeMappingsRef
    .where("pillarId", "==", mapping.pillarId)
    .where("slug", "==", mapping.slug)
    .limit(1)
    .get();

  if (!slugSnapshot.empty) {
    await slugSnapshot.docs[0].ref.set(payload, { merge: true });
    return { action: "updated", id: slugSnapshot.docs[0].id };
  }

  const docRef = await routeMappingsRef.add({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { action: "created", id: docRef.id };
}

function buildNestedPayload(page) {
  const metaTitle = `${page.pageName} | NursingMocks`;
  return {
    pageName: page.pageName,
    title: page.pageName,
    heading: page.pageName,
    slug: page.nestedSlug,
    seoLabel: page.pageName,
    seoSlug: page.nestedSlug,
    description: page.description,
    topicCount: 0,
    quizCount: 0,
    questionCount: 0,
    hero: {
      title: page.pageName,
      description: page.description,
    },
    meta: {
      title: metaTitle,
      description: page.description,
      keywords: `${page.pageName}, nursing course exams, nursing practice questions, ${slugTitle(page.parentSlug)}`,
      ogTitle: metaTitle,
      ogDescription: page.description,
    },
    updatedAt: FieldValue.serverTimestamp(),
    lastUpdated: new Date().toISOString(),
  };
}

async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();

  const parentCollection = db.collection(`pillarPages/${PILLAR_ID}/subPages`);
  const results = [];

  for (const page of PAGES) {
    const parentDoc = await findDocBySlug(parentCollection, page.parentSlug);
    if (!parentDoc) throw new Error(`Parent page not found: ${page.parentSlug}`);

    const nestedCollection = parentDoc.ref.collection("nestedSubPages");
    let nestedDoc = await findDocBySlug(nestedCollection, page.nestedSlug);
    const nestedPayload = buildNestedPayload(page);

    let nestedAction = "planned-create";
    if (APPLY) {
      if (nestedDoc) {
        await nestedDoc.ref.set(nestedPayload, { merge: true });
        nestedAction = "updated";
      } else {
        const createdRef = await nestedCollection.add({
          ...nestedPayload,
          createdAt: FieldValue.serverTimestamp(),
        });
        nestedDoc = await createdRef.get();
        nestedAction = "created";
      }
    }

    const nestedId = nestedDoc?.id || "(new document on apply)";
    const refPath =
      nestedId === "(new document on apply)"
        ? `pillarPages/${PILLAR_ID}/subPages/${parentDoc.id}/nestedSubPages/(new document on apply)`
        : `pillarPages/${PILLAR_ID}/subPages/${parentDoc.id}/nestedSubPages/${nestedId}`;

    const routeResult =
      nestedId === "(new document on apply)"
        ? { action: "planned" }
        : await upsertRouteMapping(db, {
            type: "nested",
            pillarId: PILLAR_ID,
            slug: page.nestedSlug,
            subPageId: parentDoc.id,
            nestedPageId: nestedId,
            topicId: null,
            quizId: null,
            refPath,
            examAccessProductId: "nursing_test_bank",
          });

    results.push({
      parentSlug: page.parentSlug,
      parentId: parentDoc.id,
      nestedSlug: page.nestedSlug,
      nestedId,
      pageName: page.pageName,
      nestedAction,
      routeMapping: routeResult,
    });
  }

  console.log(JSON.stringify({ apply: APPLY, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
