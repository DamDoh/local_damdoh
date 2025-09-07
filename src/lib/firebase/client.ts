
// src/lib/firebase/client.ts
// This file is for CLIENT-SIDE Firebase initialization.
// Do not expose any sensitive credentials here.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let storage: FirebaseStorage;

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  console.warn(
    `**************************************************************************************************\n` +
    `*** WARNING: Firebase configuration is missing the following keys: ${missingConfigKeys.join(', ')}\n` +
    `*** Firebase features will be disabled. Please set up your .env file.                            ***\n` +
    `**************************************************************************************************`
  );
  // Provide dummy objects to prevent app from crashing
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  functions = {} as Functions;
  storage = {} as FirebaseStorage;

} else {
    // Initialize Firebase
    // We check if an app has already been initialized to prevent errors.
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    storage = getStorage(app);

    // Enable offline persistence for Firestore.
    // This must be done after getFirestore() is called.
    // It allows the app to work seamlessly offline.
    if (typeof window !== 'undefined') {
        try {
            enableIndexedDbPersistence(db);
        } catch (err: any) {
            if (err.code === 'failed-precondition') {
            // This can happen if multiple tabs are open, which is fine.
            console.warn('Firestore offline persistence failed (failed-precondition). This can happen with multiple tabs open.');
            } else if (err.code === 'unimplemented') {
            // Unimplemented on this browser.
            console.warn('Firestore offline persistence is not available on this browser.');
            } else {
                console.error("Firestore offline persistence error: ", err);
            }
        }
    }
}


// You can specify the region for your cloud functions if it's not us-central1
// connectFunctionsEmulator(functions, "localhost", 5001); // Uncomment for local development

export { app, auth, db, functions, storage };
