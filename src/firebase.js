import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD05hd0FY4LluSY5LQvszlNATcyn3VnFNE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillswap-45be2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillswap-45be2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillswap-45be2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "480583818917",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:480583818917:web:bcc9afb335c58d05ad374c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (real-time database for sessions & requests)
export const db = getFirestore(app);

// Initialize Storage (for uploads/photos)
export const storage = getStorage(app);

// Initialize Google Provider and force account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;
