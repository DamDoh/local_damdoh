
import admin from 'firebase-admin';

// This function ensures the admin app is initialized, but only once.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '**************************************************************************************************\n' +
        '*** WARNING: FIREBASE_SERVICE_ACCOUNT_KEY is not set in your environment variables. ***\n' +
        '*** Firebase Admin SDK is not initialized. Server-side functions will not be available.            ***\n' +
        '*** To fix this, create a service account in your Firebase project console,          ***\n' +
        '*** download the JSON key, and set its contents as the                               ***\n' +
        '*** FIREBASE_SERVICE_ACCOUNT_KEY in your .env.local file.                              ***\n' +
        '**************************************************************************************************'
      );
      return null;
    }
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK cannot be initialized.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error('Firebase Admin SDK initialization failed. Check if FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON.');
  }
}

// Export functions that return the initialized services.
export function getAdminApp() {
  return initializeAdminApp();
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? admin.firestore(app) : null;
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? admin.auth(app) : null;
}

export function getAdminStorage() {
  const app = getAdminApp();
  return app ? admin.storage(app) : null;
}
