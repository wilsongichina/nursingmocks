const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const PILLAR_ID = "nursing-test-bank";
const PARENT_SLUG = "rn-exams";
const NESTED_SLUG = "hesi-rn-exams";

const TOPIC_DISPLAY_NAMES = new Map([
  ["hesi-rn-adult-health-practice-questions", "Adult Health"],
  ["hesi-rn-biology-practice-questions", "Biology"],
  ["hesi-rn-capstone-practice-questions", "Capstone"],
  ["hesi-rn-cat-practice-questions", "CAT"],
  ["hesi-rn-community-health-practice-questions", "Community Health"],
  ["hesi-rn-dosage-calculations-practice-questions", "Dosage Calculations"],
  ["hesi-rn-fundamentals-practice-questions", "Fundamentals"],
  ["hesi-rn-health-assessment-practice-questions", "Health Assessment"],
  ["hesi-rn-information-technology-in-nursing-practice-questions", "Information Technology in Nursing"],
  ["hesi-rn-leadership-practice-questions", "Leadership"],
  ["hesi-rn-management-practice-questions", "Management"],
  ["hesi-rn-maternity-practice-questions", "Maternity"],
  ["hesi-rn-medical-surgical-practice-questions", "Medical Surgical"],
  ["hesi-rn-mental-health-practice-questions", "Mental Health"],
  ["hesi-rn-milestones-practice-questions", "Milestones"],
  ["hesi-rn-nursing-research-practice-questions", "Nursing Research"],
  ["hesi-rn-nutrition-practice-questions", "Nutrition"],
  ["hesi-rn-pathophysiology-practice-questions", "Pathophysiology"],
  ["hesi-rn-pediatric-nursing-practice-questions", "Pediatric Nursing"],
  ["hesi-rn-pharmacology-practice-questions", "Pharmacology"],
  ["hesi-rn-specialty-practice-questions", "Specialty"],
]);

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

  const topicsSnapshot = await nestedDoc.ref.collection("topics").get();
  const changes = [];

  for (const topicDoc of topicsSnapshot.docs) {
    const data = topicDoc.data();
    const topicSlug = data.slug || data.seoSlug;
    const displayName = TOPIC_DISPLAY_NAMES.get(topicSlug);
    if (!displayName) {
      changes.push({
        topicId: topicDoc.id,
        slug: topicSlug || "",
        status: "skipped_unknown_slug",
      });
      continue;
    }

    const beforeName = data.pageName || data.title || data.heading || topicDoc.id;
    const update = {
      pageName: displayName,
      title: displayName,
      heading: displayName,
      seoLabel: displayName,
      hero: {
        ...(data.hero || {}),
        title: displayName,
      },
      sourceMetadata: {
        ...(data.sourceMetadata || {}),
        officialName: displayName,
      },
      lastUpdated: new Date().toISOString(),
    };

    if (APPLY) await topicDoc.ref.set(update, { merge: true });

    changes.push({
      topicId: topicDoc.id,
      slug: topicSlug,
      beforeName,
      afterName: displayName,
      status: APPLY ? "updated" : "dry_run",
    });
  }

  console.log(JSON.stringify({
    apply: APPLY,
    parentSlug: PARENT_SLUG,
    nestedSlug: NESTED_SLUG,
    checked: topicsSnapshot.size,
    changed: changes.filter((item) => item.beforeName !== item.afterName).length,
    changes,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
