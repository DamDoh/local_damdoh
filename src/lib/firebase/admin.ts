// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8')
      : undefined;

    const credential = serviceAccountJson
      ? admin.credential.cert(JSON.parse(serviceAccountJson))
      : admin.credential.applicationDefault();

    app = admin.initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // Throw a more informative error to make debugging easier.
    // This usually means the service account environment variables are not set correctly.
    throw new Error('Failed to initialize Firebase Admin SDK. Ensure environment variables (e.g., FIREBASE_SERVICE_ACCOUNT_JSON) are set.');
  }
} else {
  app = admin.apps[0]!;
}

export const adminDb = app.firestore();
export const adminAuth = app.auth();
export const adminStorage = app.storage();
