import { getApps, initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_SITE_KEY;
let appCheckInitializedForApp: string | null = null;

function initializeAppCheckIfConfigured(app: FirebaseApp) {
  if (typeof window === "undefined" || !appCheckSiteKey || appCheckInitializedForApp === app.name) {
    return;
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    if ((error as { code?: string }).code !== "appCheck/already-initialized") {
      throw error;
    }
  }
  appCheckInitializedForApp = app.name;
}

export function getFirebaseApp() {
  if (!firebaseConfig.projectId) {
    return null;
  }

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  initializeAppCheckIfConfigured(app);
  return app;
}

export function requireFirebaseApp(): FirebaseApp {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("firebase-not-configured");
  }

  return app;
}
