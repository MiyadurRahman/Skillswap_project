import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD05hd0FY4LluSY5LQvszlNATcyn3VnFNE",
  authDomain: "skillswap-45be2.firebaseapp.com",
  projectId: "skillswap-45be2",
  storageBucket: "skillswap-45be2.firebasestorage.app",
  messagingSenderId: "480583818917",
  appId: "1:480583818917:web:bcc9afb335c58d05ad374c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Provider and force account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;