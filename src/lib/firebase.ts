// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiOzwO78kUWMbqHxaCPJXECLMt_EPOUmM",
  authDomain: "teas-gurus.firebaseapp.com",
  projectId: "teas-gurus",
  storageBucket: "teas-gurus.firebasestorage.app",
  messagingSenderId: "412483199536",
  appId: "1:412483199536:web:877940027db1dff26243f5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export default app;
export { db, storage };
