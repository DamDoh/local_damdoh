import admin from 'firebase-admin';

// This function ensures the admin app is initialized, but only once.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    // If not in production, log a clear warning instead of crashing.
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
      return; // Return early, preventing the app from crashing on startup.
    }
    // In production, it's critical to fail hard.
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK cannot be initialized.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error('Firebase Admin SDK initialization failed. Check if FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON.');
  }
}

// Export functions that return the initialized services.
// This "lazy-loads" the services and ensures initialization happens first.
export function getAdminDb() {
  initializeAdminApp();
  // Return null if the admin app is not initialized to avoid crashing serverless functions
  // that might not have the env var (like client-side bundle analysis).
  return admin.apps.length > 0 ? admin.firestore() : null;
}

export function getAdminAuth() {
  initializeAdminApp();
  return admin.apps.length > 0 ? admin.auth() : null;
}

export function getAdminStorage() {
  initializeAdminApp();
  return admin.apps.length > 0 ? admin.storage() : null;
}
