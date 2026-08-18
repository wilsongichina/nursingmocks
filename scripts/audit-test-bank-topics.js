const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const PILLAR_ID = "nursing-test-bank";

function parseArgs(argv) {
  const args = {
    parent: "rn-exams",
    nested: "ati-rn-exams",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--parent") {
      args.parent = argv[index + 1];
      index += 1;
    } else if (arg === "--nested") {
      args.nested = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

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

  throw new Error("Firebase Admin credentials are not configured.");
}

function getDb() {
  if (!getApps().length) initializeApp({ credential: getCredential() });
  return getFirestore();
}

async function findDocBySlug(collectionRef, slug) {
  const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function getRouteByRefPath(db, refPath) {
  const snapshot = await db.collection("routeMappings").where("refPath", "==", refPath).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function main() {
  const args = parseArgs(process.argv);
  loadLocalEnv();
  const db = getDb();

  const parentCollection = db.collection(`pillarPages/${PILLAR_ID}/subPages`);
  const parentDoc = await findDocBySlug(parentCollection, args.parent);
  if (!parentDoc) throw new Error(`Parent not found: ${args.parent}`);

  const nestedCollection = parentDoc.ref.collection("nestedSubPages");
  const nestedDoc = await findDocBySlug(nestedCollection, args.nested);
  if (!nestedDoc) throw new Error(`Nested page not found: ${args.nested}`);

  const topicsSnapshot = await nestedDoc.ref.collection("topics").get();
  const topics = [];

  for (const topicDoc of topicsSnapshot.docs) {
    const data = topicDoc.data();
    const refPath = topicDoc.ref.path;
    const route = await getRouteByRefPath(db, refPath);

    topics.push({
      topicId: topicDoc.id,
      pageName: data.pageName || data.title || data.heading || "",
      slug: data.slug || "",
      status: data.status || "",
      quizCount: Number(data.quizCount || 0),
      questionCount: Number(data.questionCount || 0),
      refPath,
      routeSlug: route?.slug || "",
      routeType: route?.type || "",
      routeMappingId: route?.id || "",
      hasTopicRouteMapping: route?.type === "topic",
    });
  }

  topics.sort((a, b) => a.pageName.localeCompare(b.pageName));

  const summary = {
    parentSlug: args.parent,
    parentId: parentDoc.id,
    nestedSlug: args.nested,
    nestedId: nestedDoc.id,
    nestedPageName: nestedDoc.data().pageName || "",
    topicCount: topics.length,
    topicsWithRouteMapping: topics.filter((topic) => topic.hasTopicRouteMapping).length,
    topicsMissingRouteMapping: topics.filter((topic) => !topic.hasTopicRouteMapping).length,
    topics,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(getApps().map((app) => app.delete()));
  });
