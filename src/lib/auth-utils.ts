
// src/lib/auth-utils.ts
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,      
  confirmPasswordReset,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from './firebase'; 
import { useEffect, useState } from 'react';
import { createProfileInDB } from './db-utils';
import type { UserProfile } from './types';
import type { StakeholderRole } from './constants';

// This listener will update currentFirebaseUser whenever auth state changes
// It's good for internal module state but components should prefer useAuth hook
let internalCurrentFirebaseUser: FirebaseUser | null = null;
onAuthStateChanged(auth, (user) => {
  internalCurrentFirebaseUser = user;
});


/**
 * Custom hook to get the current authenticated user and loading state.
 * This is the recommended way to access auth state in React components.
 * @returns An object with the Firebase user, loading state, and the user's UID.
 */
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

  return { user, uid: user?.uid, loading };
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

export async function registerUser(name: string, email: string, password: string, role: StakeholderRole): Promise<FirebaseUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Firebase Auth user registered successfully:", userCredential.user.uid);

    // Create a basic profile document in Firestore, linked to the auth user's UID
    const newProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name,
      email: email,
      role: role,
      location: 'Not specified', // Default location
      avatarUrl: `https://placehold.co/150x150.png?text=${name.substring(0,1)}`, // Placeholder avatar
      profileSummary: `A new ${role} in the DamDoh community.`,
      bio: '',
      areasOfInterest: [],
      needs: [],
      connections: [],
      contactInfo: { email }, // Pre-populate contact email
    };

    // The document ID in 'profiles' collection will be the Firebase Auth UID
    await createProfileInDB(userCredential.user.uid, newProfileData);
    console.log("Basic Firestore profile created for user:", userCredential.user.uid);
    
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user in auth-utils:", error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    console.log(`Attempting to send password reset email to: ${email}`);
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    console.error(`Failed to send password reset email for: ${email}. Error:`, error);
 throw error;
  }
}

export async function resetPassword(oobCode: string, newPassword: string): Promise<void> {
  try {
    console.log("Attempting to reset password with oobCode:", oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
    console.log("Password reset successful for oobCode:", oobCode);
    throw error;
  }
}
