const fs = require("fs");
const path = require("path");
const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const OUTPUT_DIR = path.join(process.cwd(), "reports", "public-route-slug-integrity");

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

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

function getTargetSlug(data) {
  return data.slug || data.seoSlug || data.publicSlug || "";
}

function getTargetType(data, fallbackType) {
  return data.type || data.routeType || fallbackType || "";
}

function expectedTypeFromPath(refPath) {
  const parts = String(refPath || "").split("/");
  if (parts[0] === "knowledgeBase") return "kb";
  if (parts.includes("quizzes")) return "quiz";
  if (parts.includes("topics")) return "topic";
  if (parts.includes("nestedSubPages")) return "nested";
  if (parts.includes("subPages")) return "subPage";
  return "";
}

function routeTypeMatchesTarget(routeType, expectedType, targetType) {
  if (!routeType || !expectedType) return false;
  if (routeType === expectedType) return true;
  if (expectedType === "kb" && (routeType === "kb" || routeType === "kb-article" || targetType === "kb" || targetType === "kb-article")) return true;
  if (routeType === "nested" && expectedType === "nested") return true;
  if (routeType === "subPage" && expectedType === "subPage") return true;
  if (targetType && routeType === targetType) return true;
  return false;
}

async function getDocsByPath(db, refPaths) {
  const result = new Map();
  const uniquePaths = Array.from(new Set(refPaths.filter(Boolean)));
  for (let index = 0; index < uniquePaths.length; index += 300) {
    const chunk = uniquePaths.slice(index, index + 300);
    const refs = chunk.map((refPath) => db.doc(refPath));
    const snaps = await db.getAll(...refs);
    snaps.forEach((snap, snapIndex) => result.set(chunk[snapIndex], snap));
  }
  return result;
}
async function getAllTargetDocs(db) {
  const docs = [];

  const subPages = await db.collectionGroup("subPages").get();
  for (const doc of subPages.docs) {
    const data = doc.data();
    docs.push({
      pillarId: doc.ref.path.split("/")[1] || "",
      type: "subPage",
      path: doc.ref.path,
      id: doc.id,
      slug: getTargetSlug(data),
      title: data.pageName || data.title || data.heading || "",
    });
  }

  const nestedPages = await db.collectionGroup("nestedSubPages").get();
  for (const doc of nestedPages.docs) {
    const data = doc.data();
    docs.push({
      pillarId: doc.ref.path.split("/")[1] || "",
      type: "nested",
      path: doc.ref.path,
      id: doc.id,
      slug: getTargetSlug(data),
      title: data.pageName || data.title || data.heading || "",
    });
  }

  const topics = await db.collectionGroup("topics").get();
  for (const doc of topics.docs) {
    const data = doc.data();
    docs.push({
      pillarId: doc.ref.path.split("/")[1] || "",
      type: "topic",
      path: doc.ref.path,
      id: doc.id,
      slug: getTargetSlug(data),
      title: data.pageName || data.title || data.heading || "",
    });
  }

  const quizzes = await db.collectionGroup("quizzes").get();
  for (const doc of quizzes.docs) {
    const data = doc.data();
    docs.push({
      pillarId: doc.ref.path.split("/")[1] || "",
      type: "quiz",
      path: doc.ref.path,
      id: doc.id,
      slug: getTargetSlug(data),
      title: data.pageName || data.quizName || data.title || data.heading || "",
    });
  }

  return docs;
}
async function main() {
  loadLocalEnv();
  if (!getApps().length) initializeApp({ credential: getCredential() });
  const db = getFirestore();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const routeSnapshot = await db.collection("routeMappings").get();
  const routeDocs = routeSnapshot.docs.map((doc) => ({ doc, data: doc.data() }));
  const targetSnapsByPath = await getDocsByPath(
    db,
    routeDocs.map(({ data }) => data.refPath || data.contentPath || "")
  );
  const routes = [];
  const staleRoutes = [];
  const typeMismatches = [];
  const targetSlugMismatches = [];
  const missingRouteSlugs = [];

  for (const { doc, data } of routeDocs) {
    const refPath = data.refPath || data.contentPath || "";
    const targetSnap = targetSnapsByPath.get(refPath) || null;
    const targetExists = Boolean(targetSnap?.exists);
    const targetData = targetExists ? targetSnap.data() : {};
    const expectedType = expectedTypeFromPath(refPath);
    const targetSlug = targetExists ? getTargetSlug(targetData) : "";
    const targetType = targetExists ? getTargetType(targetData, expectedType) : "";
    const routeType = data.type || "";
    const routeSlug = data.slug || "";
    const normalizedRouteSlug = normalizeSlug(routeSlug);
    const normalizedTargetSlug = normalizeSlug(targetSlug);

    const row = {
      routeMappingId: doc.id,
      routeType,
      routeSlug,
      normalizedRouteSlug,
      routeTitle: data.title || "",
      pillarId: data.pillarId || "",
      subPageId: data.subPageId || "",
      nestedPageId: data.nestedPageId || "",
      topicId: data.topicId || "",
      quizId: data.quizId || "",
      refPath,
      targetExists,
      expectedType,
      targetType,
      targetSlug,
      normalizedTargetSlug,
      targetTitle: targetExists ? targetData.pageName || targetData.quizName || targetData.title || targetData.heading || "" : "",
    };

    routes.push(row);
    if (!normalizedRouteSlug) missingRouteSlugs.push(row);
    if (!targetExists) staleRoutes.push(row);
    else {
      if (!routeTypeMatchesTarget(routeType, expectedType, targetType)) typeMismatches.push(row);
      if (normalizedTargetSlug && normalizedRouteSlug && normalizedTargetSlug !== normalizedRouteSlug) targetSlugMismatches.push(row);
    }
  }

  const routeSlugGroups = new Map();
  for (const route of routes) {
    if (!route.normalizedRouteSlug) continue;
    if (!routeSlugGroups.has(route.normalizedRouteSlug)) routeSlugGroups.set(route.normalizedRouteSlug, []);
    routeSlugGroups.get(route.normalizedRouteSlug).push(route);
  }
  const slugCollisions = Array.from(routeSlugGroups.entries())
    .filter(([, group]) => group.length > 1)
    .flatMap(([slug, group]) => group.map((row) => ({ collisionSlug: slug, collisionCount: group.length, ...row })));

  const targets = await getAllTargetDocs(db);
  const routeByRefPath = new Map(routes.map((route) => [route.refPath, route]));
  const missingRoutes = targets
    .filter((target) => target.slug && !routeByRefPath.has(target.path))
    .map((target) => ({
      targetType: target.type,
      targetSlug: target.slug,
      targetTitle: target.title,
      targetPath: target.path,
      pillarId: target.pillarId,
    }));

  const targetSlugGroups = new Map();
  for (const target of targets) {
    const slug = normalizeSlug(target.slug);
    if (!slug) continue;
    if (!targetSlugGroups.has(slug)) targetSlugGroups.set(slug, []);
    targetSlugGroups.get(slug).push(target);
  }
  const targetSlugCollisions = Array.from(targetSlugGroups.entries())
    .filter(([, group]) => group.length > 1)
    .flatMap(([slug, group]) => group.map((target) => ({ collisionSlug: slug, collisionCount: group.length, ...target })));

  const headers = [
    "routeMappingId",
    "routeType",
    "routeSlug",
    "normalizedRouteSlug",
    "routeTitle",
    "pillarId",
    "subPageId",
    "nestedPageId",
    "topicId",
    "quizId",
    "refPath",
    "targetExists",
    "expectedType",
    "targetType",
    "targetSlug",
    "normalizedTargetSlug",
    "targetTitle",
  ];

  writeCsv(path.join(OUTPUT_DIR, "all-routes.csv"), routes, headers);
  writeCsv(path.join(OUTPUT_DIR, "slug-collisions.csv"), slugCollisions, ["collisionSlug", "collisionCount", ...headers]);
  writeCsv(path.join(OUTPUT_DIR, "stale-routes.csv"), staleRoutes, headers);
  writeCsv(path.join(OUTPUT_DIR, "missing-routes.csv"), missingRoutes, ["targetType", "targetSlug", "targetTitle", "targetPath", "pillarId"]);
  writeCsv(path.join(OUTPUT_DIR, "type-mismatches.csv"), typeMismatches, headers);
  writeCsv(path.join(OUTPUT_DIR, "target-slug-mismatches.csv"), targetSlugMismatches, headers);
  writeCsv(path.join(OUTPUT_DIR, "target-slug-collisions.csv"), targetSlugCollisions, ["collisionSlug", "collisionCount", "pillarId", "type", "id", "slug", "title", "path"]);

  const summary = {
    generatedAt: new Date().toISOString(),
    routeMappings: routes.length,
    targetDocs: targets.length,
    slugCollisionRows: slugCollisions.length,
    slugCollisionGroups: new Set(slugCollisions.map((row) => row.collisionSlug)).size,
    targetSlugCollisionRows: targetSlugCollisions.length,
    targetSlugCollisionGroups: new Set(targetSlugCollisions.map((row) => row.collisionSlug)).size,
    staleRoutes: staleRoutes.length,
    missingRoutes: missingRoutes.length,
    typeMismatches: typeMismatches.length,
    targetSlugMismatches: targetSlugMismatches.length,
    missingRouteSlugs: missingRouteSlugs.length,
    outputDir: OUTPUT_DIR,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



