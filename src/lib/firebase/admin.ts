
// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  // This is the standard initialization method. It should automatically find credentials
  // in a managed environment (like Cloud Functions, Cloud Run) or via the
  // GOOGLE_APPLICATION_CREDENTIALS environment variable in a local setup.
  app = admin.initializeApp();
  console.log('Firebase Admin SDK initialized successfully.');
} else {
  // If the app is already initialized, use the existing instance.
  app = admin.apps[0]!;
}

export const adminDb = app.firestore();
export const adminAuth = app.auth();
export const adminStorage = app.storage();
