
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

function initializeFirebase() {
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
        return null;
    }
    
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

const app = initializeFirebase();

const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;
const functions: Functions | null = app ? getFunctions(app) : null;
const storage: FirebaseStorage | null = app ? getStorage(app) : null;

if (app && db) {
  if (typeof window !== 'undefined') {
      try {
          enableIndexedDbPersistence(db);
      } catch (err: any) {
          if (err.code === 'failed-precondition') {
          console.warn('Firestore offline persistence failed (failed-precondition). This can happen with multiple tabs open.');
          } else if (err.code === 'unimplemented') {
          console.warn('Firestore offline persistence is not available on this browser.');
          } else {
              console.error("Firestore offline persistence error: ", err);
          }
      }
  }
}

export { app, auth, db, functions, storage };
