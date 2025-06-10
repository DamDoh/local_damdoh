
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // If you need Firebase Auth
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
  apiKey: "AIzaSyDYrR4zOIgOynruKybSkc6Ys4vgYc9gPLM",
  authDomain: "damdoh.firebaseapp.com",
  projectId: "damdoh",
  storageBucket: "damdoh.firebasestorage.app",
  messagingSenderId: "1015729590190",
  appId: "1:1015729590190:web:e144ce027045694b56023f"
  // measurementId: "YOUR_MEASUREMENT_ID_PLACEHOLDER" // Optional
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app); // Initialize and export auth
// const storage = getStorage(app); // If using Firebase Storage

export { app, db, auth /*, storage */ };

export async function getShopById(shopId: string) {
  try {
    const shopDocRef = doc(db, 'shops', shopId);
    const shopDocSnap = await getDoc(shopDocRef);

    if (shopDocSnap.exists()) {
      return { id: shopDocSnap.id, ...shopDocSnap.data() };
    } else {
      console.log('No such shop document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching shop by ID:', error);
    throw error; // Re-throw the error for handling in the component
  }
}

export async function getProductsByShopId(shopId: string) {
  try {
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products by shop ID:', error);
    throw error;
  }
}

export async function getProductsByCategory(category?: string) {
  try {
    const productsCollectionRef = collection(db, 'products');
    let q;
    if (category) {
      q = query(productsCollectionRef, where('category', '==', category));
    } else {
      q = query(productsCollectionRef);
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}