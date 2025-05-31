
// src/lib/auth-utils.ts
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from './firebase'; // Assuming auth is exported from firebase.ts

// Placeholder for a more robust solution, like a React context for auth state
let currentFirebaseUser: FirebaseUser | null = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentFirebaseUser = user;
  } else {
    currentFirebaseUser = null;
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
    // Placeholder: Extract token from request and verify it
    return false; // Assume not authenticated for server-side placeholder
  }
  return !!auth.currentUser;
}

export function isAdmin(userId: string | null): boolean {
  // Placeholder for admin check
  // In a real app, this might involve checking custom claims or a database role.
  console.warn("auth-utils: isAdmin() is a placeholder.");
  return userId === "adminUser"; // Example admin UID
}

export async function logOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    currentFirebaseUser = null; // Update local cache
    console.log("User logged out successfully.");
    // In a real app, you'd likely redirect the user or update global auth state here.
    // e.g., router.push('/login');
  } catch (error) {
    console.error("Error logging out: ", error);
    // Handle logout errors (e.g., show a notification to the user)
  }
}

// Placeholder for login function - to be implemented
export async function logIn(email: string, password: string): Promise<FirebaseUser | null> {
  console.warn("auth-utils: logIn() is a placeholder and not implemented.");
  // Example:
  // try {
  //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //   return userCredential.user;
  // } catch (error) {
  //   console.error("Error logging in:", error);
  //   return null;
  // }
  return null;
}

// Placeholder for registration function - to be implemented
export async function registerUser(email: string, password: string): Promise<FirebaseUser | null> {
  console.warn("auth-utils: registerUser() is a placeholder and not implemented.");
  // Example:
  // try {
  //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //   // Optionally, create a profile document in Firestore here
  //   return userCredential.user;
  // } catch (error) {
  //   console.error("Error registering user:", error);
  //   return null;
  // }
  return null;
}
