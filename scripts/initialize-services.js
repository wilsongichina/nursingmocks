const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Your Firebase configuration
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

async function initializeDefaultServices() {
  try {
    const defaultServices = [
      { name: "HESI", slug: "hesi" },
      { name: "TEAS", slug: "teas" },
    ];

    for (const service of defaultServices) {
      const docRef = doc(db, "services", service.slug);
      await setDoc(docRef, {
        name: service.name,
        slug: service.slug,
        createdAt: new Date().toISOString(),
      });
      console.log(`Service "${service.name}" initialized successfully!`);
    }

    console.log("All default services initialized successfully!");
  } catch (error) {
    console.error("Error initializing default services:", error);
  }
}

// Run the initialization
initializeDefaultServices();
