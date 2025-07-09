const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
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

async function getAllSupportPages() {
  try {
    const querySnapshot = await getDocs(collection(db, "supportPages"));
    const pages = {};

    querySnapshot.forEach((doc) => {
      pages[doc.id] = doc.data();
    });

    return {
      success: true,
      data: pages,
    };
  } catch (error) {
    console.error("Error getting all support pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pages: ${error.message}`,
    };
  }
}

async function generateStaticParams() {
  console.log("Generating static params for dynamic pages...");

  const result = await getAllSupportPages();

  if (result.success && result.data) {
    const pages = result.data;
    const params = [];

    // Extract all possible serviceId/pageId combinations
    Object.keys(pages).forEach((serviceId) => {
      const servicePages = pages[serviceId];
      if (servicePages && typeof servicePages === "object") {
        Object.keys(servicePages).forEach((pageId) => {
          params.push({ serviceId, pageId });
          console.log(`Generated static param: ${serviceId}/${pageId}`);
        });
      }
    });

    console.log(`Total static params generated: ${params.length}`);
    return params;
  }

  console.log("No pages found, using default params");
  return [
    { serviceId: "teas", pageId: "math" },
    { serviceId: "teas", pageId: "science" },
    { serviceId: "teas", pageId: "reading" },
    { serviceId: "teas", pageId: "english" },
  ];
}

// Export for use in Next.js
module.exports = { generateStaticParams };
