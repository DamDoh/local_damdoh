// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

if (!admin.apps.length) {
  let initialized = false;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  // 1. Try to initialize with the service account JSON from environment variable
  if (serviceAccountJson && serviceAccountJson !== 'YOUR_SERVICE_ACCOUNT_JSON_HERE' && serviceAccountJson.trim() !== '') {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully using FIREBASE_SERVICE_ACCOUNT_JSON.');
      initialized = true;
    } catch (e: any) {
      console.warn(
        'Warning: FIREBASE_SERVICE_ACCOUNT_JSON was found but failed to parse. Falling back. Error:',
        e.message
      );
    }
  }

  // 2. If not initialized yet, try to initialize with Application Default Credentials
  if (!initialized) {
    try {
      console.log('Attempting to initialize Firebase Admin SDK with Application Default Credentials...');
      app = admin.initializeApp();
      console.log('Firebase Admin SDK initialized successfully using Application Default Credentials.');
      initialized = true;
    } catch (error: any) {
      // Don't throw an error here, just log it. This allows the app to start.
       console.error(
        'Warning: Firebase Admin SDK failed to initialize with default credentials. ' +
        'This is expected in a local environment without GOOGLE_APPLICATION_CREDENTIALS set. ' +
        'Server-side Firebase features will be unavailable.',
        error.message
       );
    }
  }

} else {
  // If the app is already initialized, use the existing instance.
  app = admin.apps[0]!;
}

// Export potentially null services. Code using these must handle the null case.
export const adminDb = app ? app.firestore() : null;
export const adminAuth = app ? app.auth() : null;
export const adminStorage = app ? app.storage() : null;
