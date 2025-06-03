
// src/lib/auth-utils.ts
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // New
  sendPasswordResetEmail,      // New
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from './firebase'; 
import { useEffect, useState } from 'react';

// This listener will update currentFirebaseUser whenever auth state changes
// It's good for internal module state but components should prefer useAuth hook
let internalCurrentFirebaseUser: FirebaseUser | null = null;
onAuthStateChanged(auth, (user) => {
  internalCurrentFirebaseUser = user;
  if (user) {
    console.log("Auth state changed (internal): User is signed in.", user.uid);
  } else {
    console.log("Auth state changed (internal): User is signed out.");
  }
});


// Custom hook for auth state, to be used in React components
export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}


export function getCurrentUserId(): string | null {
  return auth.currentUser ? auth.currentUser.uid : null;
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
  if (request) {
    console.warn("auth-utils: isAuthenticated() with request param is a placeholder for server-side auth.");
    // Implement server-side token verification here if needed
    return false; 
  }
  return !!auth.currentUser;
}

export function isAdmin(userId: string | null): boolean {
  console.warn("auth-utils: isAdmin() is a placeholder.");
  return userId === "adminUser"; 
}

export async function logOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    console.log("User logged out successfully via auth-utils.");
  } catch (error) {
    console.error("Error logging out from auth-utils: ", error);
    throw error; 
  }
}

export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully via auth-utils:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in via auth-utils:", error);
    throw error;
  }
}

export async function registerUser(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // TODO: Create a corresponding user profile document in Firestore here.
    // For example: await createProfileInDB({ userId: userCredential.user.uid, email: userCredential.user.email, name: 'New User', ... });
    console.log("User registered successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
