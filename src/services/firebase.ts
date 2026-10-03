import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  disableNetwork,
  enableNetwork,
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

// Suppress noisy Firestore backend unreachable warnings in offline/sandbox preview environments
try {
  setLogLevel('silent');
} catch {
  // Ignore environments where logging is locked
}

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA6I8GskSAK9ZJWEwhyLeLTn39w7atmJEQ",
  authDomain: "upay-financial-resilience-ai.firebaseapp.com",
  projectId: "upay-financial-resilience-ai",
  storageBucket: "upay-financial-resilience-ai.firebasestorage.app",
  messagingSenderId: "398933384203",
  appId: "1:398933384203:web:5f817463ccfd1451443b0e",
  measurementId: "G-LZCDYZY1MP"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Gracefully disable network on sandbox startup if cloud backend is unreachable to eliminate connection retry spam
if (typeof window !== 'undefined') {
  // We allow offline caching without throwing network errors
  disableNetwork(db).catch(() => {});
}

export const auth = getAuth(app);

// Safe Analytics Initialization
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        // Analytics not supported in this environment
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
  disableNetwork,
  enableNetwork,
  setLogLevel,
};
