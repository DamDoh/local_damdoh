// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // If you need Firebase Auth
// import { getStorage } from "firebase/storage"; // If you need Firebase Storage

// IMPORTANT: Replace these with your actual Firebase project configuration.
// It's highly recommended to use environment variables for these values
// instead of hardcoding them directly in your source code, especially for production.
// Example using environment variables:
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
// };

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_PLACEHOLDER",
  authDomain: "YOUR_PROJECT_ID_PLACEHOLDER.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_PLACEHOLDER",
  storageBucket: "YOUR_PROJECT_ID_PLACEHOLDER.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "YOUR_APP_ID_PLACEHOLDER",
  // measurementId: "YOUR_MEASUREMENT_ID_PLACEHOLDER" // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
// const auth = getAuth(app); // If using Firebase Auth
// const storage = getStorage(app); // If using Firebase Storage

export { app, db /*, auth, storage */ };
