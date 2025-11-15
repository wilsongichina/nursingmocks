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

    const allPillarPages = pillarPagesResult.data || [];
    const allCategories = Object.keys(allPagesResult.data || {});

    // Get all categories that belong to pillar pages
    const pillarPageCategoryIds = new Set();
    const categoriesByPillar = {};

    // Fetch categories for each pillar page
    for (const pillarPage of allPillarPages) {
      const result = await getAllPillarServicePages(db, pillarPage.id);
      if (result.success && result.data) {
        const categories = result.data.map((service) => ({
          id: service.servicePageId || service.id,
          servicePageId: service.servicePageId || service.id,
          ...service,
        }));
        categoriesByPillar[pillarPage.id] = categories;

        // Track which categories belong to pillar pages
        categories.forEach((cat) => {
          const categoryId = cat.servicePageId || cat.id;
          if (categoryId) {
            pillarPageCategoryIds.add(categoryId);
          }
        });
      }
    }

    // Categories that don't belong to any pillar page go to TEAS
    const teasCats = allCategories.filter(
      (cat) => !pillarPageCategoryIds.has(cat)
    );

    // Prepare the sidebar data structure
    const sidebarData = {
      pillarPages: allPillarPages,
      teasCategories: teasCats,
      pillarCategories: categoriesByPillar,
      generatedAt: new Date().toISOString(),
    };

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), "public", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the data to a JSON file
    const outputPath = path.join(dataDir, "sidebar-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(sidebarData, null, 2));

    console.log("✅ Sidebar data generated successfully!");
    console.log(`   - ${allPillarPages.length} pillar pages`);
    console.log(`   - ${teasCats.length} TEAS categories`);
    console.log(`   - ${Object.keys(categoriesByPillar).length} pillar pages with categories`);
    console.log(`   - Output: ${outputPath}`);

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

