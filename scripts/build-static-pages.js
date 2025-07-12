const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAllPages() {
  try {
    console.log("Fetching all pages from Firestore...");
    const pagesSnapshot = await getDocs(collection(db, "pages"));
    const pages = {};

    pagesSnapshot.forEach((doc) => {
      pages[doc.id] = doc.data();
    });

    return pages;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return {};
  }
}

async function fetchAllSupportPages() {
  try {
    console.log("Fetching all support pages from Firestore...");
    const supportPagesSnapshot = await getDocs(collection(db, "supportPages"));
    const pages = {};

    supportPagesSnapshot.forEach((doc) => {
      const docData = doc.data();
      const serviceId = docData.serviceId || doc.id.split("_")[0];
      const pageId = docData.pageId || doc.id.split("_")[1];

      if (!pages[serviceId]) {
        pages[serviceId] = {};
      }

      pages[serviceId][pageId] = docData;
    });

    return pages;
  } catch (error) {
    console.error("Error fetching support pages:", error);
    return {};
  }
}

async function buildStaticData() {
  try {
    console.log("Starting static data build...");

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "src", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Fetch all data
    const [pages, supportPages] = await Promise.all([
      fetchAllPages(),
      fetchAllSupportPages(),
    ]);

    // Save pages data
    const pagesPath = path.join(dataDir, "pages.json");
    fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2));
    console.log(`Saved pages data to ${pagesPath}`);

    // Save support pages data
    const supportPagesPath = path.join(dataDir, "support-pages.json");
    fs.writeFileSync(supportPagesPath, JSON.stringify(supportPages, null, 2));
    console.log(`Saved support pages data to ${supportPagesPath}`);

    console.log("Static data build completed successfully!");
  } catch (error) {
    console.error("Error building static data:", error);
    process.exit(1);
  }
}

// Run the build script
buildStaticData();
