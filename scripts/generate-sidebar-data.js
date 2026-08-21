/**
 * Script to generate static sidebar data at build time
 * This prevents loading states when navigating between pages
 */

const { getApps, initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnvironment() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, ".env.local"));
}


loadLocalEnvironment();

function getServiceAccountCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (json) {
    return cert(JSON.parse(json.replace(/\\n/g, "\n")));
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

  return null;
}

function getSidebarAdminDb() {
  const existing = getApps()[0];
  if (existing) {
    return getFirestore(existing);
  }

  const credential = getServiceAccountCredential();
  if (!credential) {
    throw new Error("Firebase Admin is not configured for sidebar generation.");
  }

  return getFirestore(initializeApp({ credential }));
}

function collection(db, ...segments) {
  return db.collection(segments.join("/"));
}

function getDocs(ref) {
  return ref.get();
}


async function getAllPillarPages(db) {
  try {
    const querySnapshot = await getDocs(collection(db, "pillarPages"));
    const pillarPages = [];

    querySnapshot.forEach((doc) => {
      pillarPages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: pillarPages,
    };
  } catch (error) {
    console.error("Error getting all pillar pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pillar pages: ${error.message}`,
    };
  }
}

async function getAllPages(db) {
  try {
    const querySnapshot = await getDocs(collection(db, "pages"));
    const pages = {};

    querySnapshot.forEach((doc) => {
      pages[doc.id] = doc.data();
    });

    return {
      success: true,
      data: pages,
    };
  } catch (error) {
    console.error("Error getting all pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pages: ${error.message}`,
    };
  }
}

async function getAllPillarServicePages(db, pillarPageId) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", pillarPageId, "services")
    );
    const servicePages = [];

    querySnapshot.forEach((doc) => {
      servicePages.push({
        id: doc.id,
        servicePageId: doc.id,
        pillarPageId: pillarPageId,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: servicePages,
    };
  } catch (error) {
    console.error(
      `Error getting all service pages under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve service pages: ${error.message}`,
    };
  }
}

async function getNursingEntranceExamSubPages(db) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-entrance-exam", "subPages")
    );
    const subPages = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        servicePageId: doc.id, // Use the document ID as the slug
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
    };
  } catch (error) {
    console.error("Error getting nursing entrance exam sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${error.message}`,
    };
  }
}

async function getNursingExitExamSubPages(db) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-exit-exam", "subPages")
    );
    const subPages = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        servicePageId: doc.id, // Use the document ID as the slug
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
    };
  } catch (error) {
    console.error("Error getting nursing exit exam sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${error.message}`,
    };
  }
}

async function getNursingTestBankSubPages(db) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-test-bank", "subPages")
    );
    const subPages = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        servicePageId: doc.id, // Use the document ID as the slug
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
    };
  } catch (error) {
    console.error("Error getting nursing test bank sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${error.message}`,
    };
  }
}

async function getAllRouteMappings(db) {
  try {
    const querySnapshot = await getDocs(collection(db, "routeMappings"));
    const byRefPath = {};
    const byNestedKey = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const mapping = { id: doc.id, ...data };

      if (data.refPath) {
        byRefPath[data.refPath] = mapping;
      }

      if (data.type === "nested" && data.pillarId && data.subPageId && data.nestedPageId) {
        byNestedKey[`${data.pillarId}:${data.subPageId}:${data.nestedPageId}`] = mapping;
      }
    });

    return {
      success: true,
      data: { byRefPath, byNestedKey },
    };
  } catch (error) {
    console.error("Error getting route mappings:", error);
    return {
      success: false,
      message: `Failed to retrieve route mappings: ${error.message}`,
      data: { byRefPath: {}, byNestedKey: {} },
    };
  }
}

async function getNestedSubPagesForModal(db, pillarPageId, parentSubPageId) {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        pillarPageId,
        "subPages",
        parentSubPageId,
        "nestedSubPages"
      )
    );
    const nestedSubPages = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
    };
  } catch (error) {
    console.error(
      `Error getting nested modal pages for ${pillarPageId}/${parentSubPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve nested modal pages: ${error.message}`,
      data: [],
    };
  }
}

async function getTestBankTopicCountForModal(db, parentSubPageId, nestedSubPageId) {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-test-bank",
        "subPages",
        parentSubPageId,
        "nestedSubPages",
        nestedSubPageId,
        "topics"
      )
    );

    return querySnapshot.size;
  } catch (error) {
    console.error(
      `Error getting test bank topic count for ${parentSubPageId}/${nestedSubPageId}:`,
      error
    );
    return undefined;
  }
}


function hasUsableExistingSidebarData() {
  const jsonOutputPath = path.join(process.cwd(), "public", "data", "sidebar-data.json");
  const tsOutputPath = path.join(process.cwd(), "src", "lib", "data", "sidebar-data.ts");

  if (!fs.existsSync(jsonOutputPath) || !fs.existsSync(tsOutputPath)) {
    return false;
  }

  try {
    const existing = JSON.parse(fs.readFileSync(jsonOutputPath, "utf8"));
    const categories = existing.pillarCategories || {};
    const categoryCount = Object.values(categories).reduce(
      (total, value) => total + (Array.isArray(value) ? value.length : 0),
      0
    );
    return categoryCount > 0;
  } catch {
    return false;
  }
}

function keepExistingSidebarData(reason) {
  if (!hasUsableExistingSidebarData()) {
    return false;
  }

  console.warn("WARNING: " + reason);
  console.warn("Keeping existing generated sidebar data instead of writing placeholders.");
  return true;
}

function getModalCacheKey(pillarPageId, parentSubPageId) {
  return `${pillarPageId}:${parentSubPageId}`;
}

function pickDefined(source, keys) {
  return keys.reduce((output, key) => {
    if (source[key] !== undefined && source[key] !== null) {
      output[key] = source[key];
    }
    return output;
  }, {});
}

function toSidebarPillarPage(page) {
  return pickDefined(page, ["id", "pageName", "title", "slug", "status", "order"]);
}

function toSidebarCategory(page) {
  return pickDefined(page, [
    "id",
    "subPageId",
    "servicePageId",
    "pageName",
    "title",
    "name",
    "slug",
    "status",
    "order",
    "displayOrder",
    "questionCount",
    "quizCount",
    "topicCount",
  ]);
}

function toSidebarNestedPage(page) {
  return pickDefined(page, [
    "id",
    "nestedSubPageId",
    "pageName",
    "title",
    "name",
    "slug",
    "publicSlug",
    "publicUrl",
    "status",
    "order",
    "displayOrder",
    "questionCount",
    "quizCount",
    "topicCount",
  ]);
}

async function generateSidebarData() {
  try {
    console.log("Starting sidebar data generation.");

    // Initialize trusted Admin SDK access for build-time Firestore reads.
    let db;
    try {
      db = getSidebarAdminDb();
    } catch (firebaseError) {
      console.error("Failed to initialize Firebase Admin for sidebar generation.");
      console.error(firebaseError?.message || firebaseError);
      throw firebaseError;
    }

    // Fetch all pillar pages, categories, and route mappings used by cached modal links.
    const [pillarPagesResult, allPagesResult, routeMappingsResult] = await Promise.all([
      getAllPillarPages(db),
      getAllPages(db),
      getAllRouteMappings(db),
    ]);

    if (!pillarPagesResult.success || !allPagesResult.success) {
      console.error("Failed to load sidebar data from Firestore.");
      if (keepExistingSidebarData("Firestore sidebar query failed.")) {
        return;
      }
      throw new Error("Sidebar generation failed because Firestore could not be read and no usable existing sidebar cache exists.");
    }

    const routeMappings =
      routeMappingsResult.success && routeMappingsResult.data
        ? routeMappingsResult.data
        : { byRefPath: {}, byNestedKey: {} };

    let allPillarPages = pillarPagesResult.data || [];

    if (allPillarPages.length === 0) {
      if (keepExistingSidebarData("Firestore returned zero pillar pages.")) {
        return;
      }
      throw new Error("Sidebar generation refused to write placeholder pillar pages because Firestore returned zero pillar pages.");
    }
    
    // Ensure all 3 required pillar pages are included
    // Order: 1. Entrance Exam, 2. Test Bank, 3. Exit Exam
    const requiredPillarPageIds = [
      "nursing-entrance-exam",
      "nursing-test-bank",
      "nursing-exit-exam"
    ];
    
    const existingPillarPageIds = new Set(allPillarPages.map(p => p.id));
    
    // Add missing pillar pages with minimal structure
    for (const requiredId of requiredPillarPageIds) {
      if (!existingPillarPageIds.has(requiredId)) {
        console.log(`⚠️  Pillar page '${requiredId}' not found in Firestore, adding placeholder...`);
        allPillarPages.push({
          id: requiredId,
          pageName: requiredId.split("-").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(" "),
        });
      }
    }
    
    // Sort to ensure consistent order
    allPillarPages.sort((a, b) => {
      const order = requiredPillarPageIds.indexOf(a.id) - requiredPillarPageIds.indexOf(b.id);
      return order !== -1 ? order : a.id.localeCompare(b.id);
    });

    // Get all categories that belong to pillar pages
    const categoriesByPillar = {};

    // Fetch categories for each pillar page
    for (const pillarPage of allPillarPages) {
      // For nursing-entrance-exam, use the special function to get sub-pages
      if (pillarPage.id === "nursing-entrance-exam") {
        const result = await getNursingEntranceExamSubPages(db);
        if (result.success && result.data) {
          const categories = result.data.map((subPage) =>
            toSidebarCategory({
              ...subPage,
              id: subPage.id || subPage.subPageId,
              subPageId: subPage.subPageId || subPage.id,
              servicePageId: subPage.id || subPage.subPageId,
              slug: subPage.slug || subPage.id || subPage.subPageId,
            })
          );
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else if (pillarPage.id === "nursing-exit-exam") {
        // For nursing-exit-exam, use the special function to get sub-pages
        const result = await getNursingExitExamSubPages(db);
        if (result.success && result.data) {
          const categories = result.data.map((subPage) =>
            toSidebarCategory({
              ...subPage,
              id: subPage.id || subPage.subPageId,
              subPageId: subPage.subPageId || subPage.id,
              servicePageId: subPage.id || subPage.subPageId,
              slug: subPage.slug || subPage.id || subPage.subPageId,
            })
          );
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else if (pillarPage.id === "nursing-test-bank") {
        // For nursing-test-bank, use the special function to get sub-pages
        const result = await getNursingTestBankSubPages(db);
        if (result.success && result.data) {
          const categories = result.data.map((subPage) =>
            toSidebarCategory({
              ...subPage,
              id: subPage.id || subPage.subPageId,
              subPageId: subPage.subPageId || subPage.id,
              servicePageId: subPage.id || subPage.subPageId,
              slug: subPage.slug || subPage.id || subPage.subPageId,
            })
          );
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else {
        // For other pillar pages, use the services collection
        const result = await getAllPillarServicePages(db, pillarPage.id);
        if (result.success && result.data) {
          const categories = result.data.map((service) =>
            toSidebarCategory({
              ...service,
              id: service.servicePageId || service.id,
              servicePageId: service.servicePageId || service.id,
              slug: service.slug || service.servicePageId || service.id,
            })
          );
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          // Initialize empty array for pillar pages without categories
          categoriesByPillar[pillarPage.id] = [];
        }
      }
    }

    const modalNestedPages = {};
    for (const pillarPage of allPillarPages) {
      const categories = categoriesByPillar[pillarPage.id] || [];
      for (const category of categories) {
        const categoryId = category.id || category.subPageId || category.servicePageId;
        if (!categoryId) {
          continue;
        }

        const result = await getNestedSubPagesForModal(
          db,
          pillarPage.id,
          categoryId
        );
        let modalPages = result.success && result.data ? result.data : [];

        modalPages = modalPages.map((nestedPage) => {
          const nestedPageId = nestedPage.id || nestedPage.nestedSubPageId;
          const refPath = nestedPageId
            ? `pillarPages/${pillarPage.id}/subPages/${categoryId}/nestedSubPages/${nestedPageId}`
            : "";
          const mapping =
            routeMappings.byRefPath[refPath] ||
            routeMappings.byNestedKey[`${pillarPage.id}:${categoryId}:${nestedPageId}`];

          return mapping?.slug
            ? {
                ...nestedPage,
                publicSlug: mapping.slug,
                publicUrl: `/${String(mapping.slug).replace(/^\/+/, "")}`,
              }
            : nestedPage;
        });

        if (pillarPage.id === "nursing-test-bank" && modalPages.length > 0) {
          modalPages = await Promise.all(
            modalPages.map(async (nestedPage) => {
              const nestedPageId = nestedPage.id || nestedPage.nestedSubPageId;
              if (!nestedPageId) {
                return nestedPage;
              }

              const topicCount = await getTestBankTopicCountForModal(
                db,
                categoryId,
                nestedPageId
              );

              return typeof topicCount === "number"
                ? { ...nestedPage, topicCount }
                : nestedPage;
            })
          );
        }

        modalNestedPages[getModalCacheKey(pillarPage.id, categoryId)] =
          modalPages.map(toSidebarNestedPage);
      }
    }

    // Keep the public sidebar payload menu-only. Full body content, schema, and
    // SEO fields belong to page rendering, not the client navigation cache.
    const sidebarData = {
      pillarPages: allPillarPages.map(toSidebarPillarPage),
      pillarCategories: categoriesByPillar,
      modalNestedPages,
      generatedAt: new Date().toISOString(),
    };

    const totalCategoryCount = Object.values(categoriesByPillar).reduce(
      (total, value) => total + (Array.isArray(value) ? value.length : 0),
      0
    );

    if (totalCategoryCount === 0) {
      if (keepExistingSidebarData("Generated sidebar data contains zero sub-pages.")) {
        return;
      }
      throw new Error("Sidebar generation refused to write empty category data.");
    }

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), "public", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the data to a JSON file (for fallback)
    const jsonOutputPath = path.join(dataDir, "sidebar-data.json");
    fs.writeFileSync(jsonOutputPath, JSON.stringify(sidebarData, null, 2));

    // Also generate a TypeScript file that can be imported directly (no async loading)
    const libDataDir = path.join(process.cwd(), "src", "lib", "data");
    if (!fs.existsSync(libDataDir)) {
      fs.mkdirSync(libDataDir, { recursive: true });
    }

    const tsOutputPath = path.join(libDataDir, "sidebar-data.ts");
    const tsContent = `// This file is auto-generated at build time. Do not edit manually.
// Generated at: ${new Date().toISOString()}

export const sidebarData = ${JSON.stringify(sidebarData, null, 2)} as const;

export type SidebarData = typeof sidebarData;
`;

    fs.writeFileSync(tsOutputPath, tsContent);

    console.log("✅ Sidebar data generated successfully!");
    console.log(`   - ${allPillarPages.length} pillar pages`);
    console.log(`   - ${Object.keys(categoriesByPillar).length} pillar pages with categories`);
    
    // Log sub-pages count for each pillar page
    for (const pillarPage of allPillarPages) {
      const subPagesCount = categoriesByPillar[pillarPage.id]?.length || 0;
      console.log(`   - ${pillarPage.id}: ${subPagesCount} sub-pages`);
    }
    console.log(`   - ${Object.keys(modalNestedPages).length} modal nested page groups`);
    
    console.log(`   - JSON Output: ${jsonOutputPath}`);
    console.log(`   - TypeScript Output: ${tsOutputPath}`);

    return sidebarData;
  } catch (error) {
    console.error("Error generating sidebar data.");
    console.error(error?.message || error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateSidebarData()
    .then(() => {
      console.log("Done.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal sidebar generation error.");
      console.error(error?.message || error);
      process.exit(1);
    });
}

module.exports = { generateSidebarData };




