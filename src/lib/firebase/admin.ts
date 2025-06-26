
// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    // This is the standard initialization method. It should automatically find credentials
    // in a managed environment (like Cloud Functions, Cloud Run) or via the
    // GOOGLE_APPLICATION_CREDENTIALS environment variable in a local setup.
    app = admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // This error will be caught by the calling function and should be surfaced
    // to the developer, indicating a problem with the environment configuration.
    // We throw the error to halt execution, as no admin-level operations can proceed.
    throw new Error('Failed to initialize Firebase Admin SDK. Please check your server environment credentials.');
  }
} else {
  // If the app is already initialized, use the existing instance.
  app = admin.apps[0]!;
}

export const adminDb = app.firestore();
export const adminAuth = app.auth();
export const adminStorage = app.storage();
