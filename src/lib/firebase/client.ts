// src/lib/firebase/client.ts
// This file is for CLIENT-SIDE Firebase initialization.
// Do not expose any sensitive credentials here.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required Firebase config values are present.
// This prevents the app from running with a broken configuration.
const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  throw new Error(
    `Firebase configuration is missing the following keys: ${missingConfigKeys.join(
      ', '
    )}. Please make sure you have set up your .env.local file with all the necessary NEXT_PUBLIC_FIREBASE_* variables.`
  );
}


// Initialize Firebase
// We check if an app has already been initialized to prevent errors.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore.
// This must be done after getFirestore() is called.
// It allows the app to work seamlessly offline.
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          // This can happen if multiple tabs are open, which is fine.
          console.warn('Firestore offline persistence failed (failed-precondition). This can happen with multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          // Unimplemented on this browser.
          console.warn('Firestore offline persistence is not available on this browser.');
        } else {
            console.error("Firestore offline persistence error: ", err);
        }
      });
}


// You can specify the region for your cloud functions if it's not us-central1
// connectFunctionsEmulator(functions, "localhost", 5001); // Uncomment for local development

export { app, auth, db, functions, storage };
