/**
 * Script to generate static sidebar data at build time
 * This prevents loading states when navigating between pages
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
} = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const REQUIRED_FIREBASE_ENV = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

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

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }
  return value;
}

function validateFirebaseEnvironment() {
  const missingFirebaseEnv = REQUIRED_FIREBASE_ENV.filter(
    (key) => !process.env[key] || !process.env[key].trim()
  );
  if (missingFirebaseEnv.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingFirebaseEnv.join(", ")}`
    );
  }
}

loadLocalEnvironment();

// Firebase configuration - matches src/lib/firebase.ts.
// Values must come from the NursingMocks environment. Do not add
// project-specific fallbacks here; stale defaults can connect builds to the
// wrong Firebase project.
function getFirebaseConfig() {
  validateFirebaseEnvironment();
  return {
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
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

async function generateSidebarData() {
  try {
    const firebaseConfig = getFirebaseConfig();
    console.log("Starting sidebar data generation.");

    // Initialize Firebase
    let app, db;
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (firebaseError) {
      console.error("Failed to initialize Firebase for sidebar generation.");
      console.error(firebaseError?.message || firebaseError);
      throw firebaseError;
    }

    // Fetch all pillar pages and all pages (categories)
    const [pillarPagesResult, allPagesResult] = await Promise.all([
      getAllPillarPages(db),
      getAllPages(db),
    ]);

    if (!pillarPagesResult.success || !allPagesResult.success) {
      console.error("❌ Failed to load data from Firestore");
      process.exit(1);
    }

    let allPillarPages = pillarPagesResult.data || [];
    
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
          const categories = result.data.map((subPage) => ({
            id: subPage.id || subPage.subPageId,
            servicePageId: subPage.id || subPage.subPageId, // Use the document ID as the slug
            slug: subPage.slug || subPage.id || subPage.subPageId, // Include slug if available
            ...subPage,
          }));
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else if (pillarPage.id === "nursing-exit-exam") {
        // For nursing-exit-exam, use the special function to get sub-pages
        const result = await getNursingExitExamSubPages(db);
        if (result.success && result.data) {
          const categories = result.data.map((subPage) => ({
            id: subPage.id || subPage.subPageId,
            servicePageId: subPage.id || subPage.subPageId, // Use the document ID as the slug
            slug: subPage.slug || subPage.id || subPage.subPageId, // Include slug if available
            ...subPage,
          }));
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else if (pillarPage.id === "nursing-test-bank") {
        // For nursing-test-bank, use the special function to get sub-pages
        const result = await getNursingTestBankSubPages(db);
        if (result.success && result.data) {
          const categories = result.data.map((subPage) => ({
            id: subPage.id || subPage.subPageId,
            servicePageId: subPage.id || subPage.subPageId, // Use the document ID as the slug
            slug: subPage.slug || subPage.id || subPage.subPageId, // Include slug if available
            ...subPage,
          }));
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          categoriesByPillar[pillarPage.id] = [];
        }
      } else {
        // For other pillar pages, use the services collection
        const result = await getAllPillarServicePages(db, pillarPage.id);
        if (result.success && result.data) {
          const categories = result.data.map((service) => ({
            id: service.servicePageId || service.id,
            servicePageId: service.servicePageId || service.id,
            slug: service.slug || service.servicePageId || service.id, // Include slug if available
            ...service,
          }));
          categoriesByPillar[pillarPage.id] = categories;
        } else {
          // Initialize empty array for pillar pages without categories
          categoriesByPillar[pillarPage.id] = [];
        }
      }
    }

    // Prepare the sidebar data structure - only pillar pages, no TEAS categories
    const sidebarData = {
      pillarPages: allPillarPages,
      pillarCategories: categoriesByPillar,
      generatedAt: new Date().toISOString(),
    };

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

