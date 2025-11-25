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

// Firebase configuration - matches src/lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBiOzwO78kUWMbqHxaCPJXECLMt_EPOUmM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "teas-gurus.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "teas-gurus",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "teas-gurus.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "412483199536",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:412483199536:web:877940027db1dff26243f5",
};

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
    console.log("🚀 Starting sidebar data generation...");

    // Initialize Firebase
    let app, db;
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (firebaseError) {
      console.error("❌ Failed to initialize Firebase:", firebaseError);
      console.log("⚠️  Skipping sidebar data generation. Sidebar will use Firestore fallback.");
      return null;
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
    console.error("❌ Error generating sidebar data:", error);
    console.log("⚠️  Sidebar will use Firestore fallback at runtime.");
    // Don't exit with error - allow build to continue with fallback
    return null;
  }
}

// Run the script
if (require.main === module) {
  generateSidebarData()
    .then(() => {
      console.log("✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      console.log("⚠️  Build will continue, but sidebar will use Firestore fallback.");
      // Exit with 0 to allow build to continue
      process.exit(0);
    });
}

module.exports = { generateSidebarData };

