import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA6I8GskSAK9ZJWEwhyLeLTn39w7atmJEQ",
  authDomain: "upay-financial-resilience-ai.firebaseapp.com",
  projectId: "upay-financial-resilience-ai",
  storageBucket: "upay-financial-resilience-ai.firebasestorage.app",
  messagingSenderId: "398933384203",
  appId: "1:398933384203:web:5f817463ccfd1451443b0e",
  measurementId: "G-LZCDYZY1MP"
};

// Initialize Firebase safely (avoid re-initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Safe Analytics Initialization
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics not supported in this environment', err);
      }
    }
  });
}

export {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
};
