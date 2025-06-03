
// src/lib/auth-utils.ts
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, // Added for login
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from './firebase'; // Assuming auth is exported from firebase.ts

// Placeholder for a more robust solution, like a React context for auth state
let currentFirebaseUser: FirebaseUser | null = null;

// This listener will update currentFirebaseUser whenever auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentFirebaseUser = user;
    console.log("Auth state changed: User is signed in.", user.uid);
  } else {
    currentFirebaseUser = null;
    console.log("Auth state changed: User is signed out.");
  }
});

export function getCurrentUserId(): string | null {
  // For immediate checks, auth.currentUser can be used.
  // For reactive updates in UI, onAuthStateChanged in a context/component is better.
  return auth.currentUser ? auth.currentUser.uid : null;
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
  // In a real app with server-side rendering or API routes, you'd verify a token from the request.
  // For client-side checks, auth.currentUser is a quick way.
  // This function signature with Request might be for future server-side use.
  if (request) {
    console.warn("auth-utils: isAuthenticated() with request param is a placeholder for server-side auth.");
    return false; 
  }
  // Check if auth.currentUser is available and not null
  return !!auth.currentUser;
}

export function isAdmin(userId: string | null): boolean {
  // Placeholder for admin check
  console.warn("auth-utils: isAdmin() is a placeholder.");
  return userId === "adminUser"; 
}

export async function logOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    // currentFirebaseUser will be set to null by the onAuthStateChanged listener
    console.log("User logged out successfully via auth-utils.");
  } catch (error) {
    console.error("Error logging out from auth-utils: ", error);
    throw error; // Re-throw to be handled by caller
  }
}

export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // currentFirebaseUser will be updated by the onAuthStateChanged listener
    console.log("User logged in successfully via auth-utils:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in via auth-utils:", error);
    // Re-throw the error so the UI layer can inspect it for specific error codes
    // (e.g., auth/user-not-found, auth/wrong-password)
    throw error;
  }
}

// Placeholder for registration function - to be implemented
export async function registerUser(email: string, password: string): Promise<FirebaseUser | null> {
  console.warn("auth-utils: registerUser() is a placeholder and not implemented.");
  return null;
}
