import { getApps, initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function getFirebaseApp() {
  if (!firebaseConfig.projectId) {
    return null;
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function requireFirebaseApp(): FirebaseApp {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("firebase-not-configured");
  }

  return app;
}
