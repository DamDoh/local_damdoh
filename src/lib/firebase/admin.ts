
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // This check is crucial to prevent crashes during builds where env vars might not be present.
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK cannot be initialized.");
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
    // In a real app, you might want to handle this more gracefully,
    // but for now, logging the error is sufficient.
  }
}

// These exports will now only be accessed after the initialization logic has run.
// However, if initialization fails, calling these will throw an error.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
