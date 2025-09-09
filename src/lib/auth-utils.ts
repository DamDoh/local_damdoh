
"use client";

import {
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  type User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { auth, functions } from './firebase/client';
import { httpsCallable } from "firebase/functions";
import type { StakeholderRole } from './constants';
import { useContext } from 'react';
import { AuthContext } from "@/components/Providers";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, uid: context.user?.uid };
};

export function getCurrentUserId(): string | null {
  return auth?.currentUser ? auth.currentUser.uid : null;
}

export function isAdmin(userId: string | null): boolean {
  console.warn("auth-utils: isAdmin() is a placeholder.");
  return userId === "adminUser"; 
}

export async function logOut(): Promise<void> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    await firebaseSignOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    console.log("User logged out successfully via auth-utils.");
  } catch (error) {
    console.error("Error logging out from auth-utils: ", error);
    throw error; 
  }
}

export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const idToken = await user.getIdToken();

    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    console.log("User logged in and session cookie set via auth-utils:", user.uid);
    return user;
  } catch (error) {
    console.error("Error logging in via auth-utils:", error);
    throw error;
  }
}

/**
 * Registers a new user with Firebase Authentication.
 * The corresponding Firestore user profile is created by the `onUserCreate` Cloud Function trigger.
 * This client-side function also updates the user's initial stakeholder role.
 *
 * @param name The user's display name.
 * @param email The user's email.
 * @param password The user's password.
 * @param role The user's selected primary role.
 * @returns The created Firebase user object.
 */
export async function registerUser(
  name: string, 
  email: string, 
  password: string, 
  role: StakeholderRole,
): Promise<FirebaseUser> {
  if (!auth || !functions) throw new Error("Firebase is not initialized.");
  try {
    // 1. Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase Auth user registered successfully:", user.uid);
    
    // 2. Update the Auth user's profile with their display name
    await updateProfile(user, { displayName: name });
    console.log("Firebase Auth profile updated with display name.");

    // 3. The `onUserCreate` trigger on the backend now handles creating the Firestore document.
    //    We just need to call a function to set the user's chosen role, as this can't be
    //    passed to the auth trigger directly.
    const upsertStakeholderProfile = httpsCallable(functions, 'user-upsertStakeholderProfile');
    
    // After signing up, the user is automatically signed in, so this callable function
    // will be authenticated.
    await upsertStakeholderProfile({
        primaryRole: role,
        displayName: name // It's good to pass the name again to ensure consistency
    });

    console.log("Profile role update request sent for user:", user.uid);
    
    return user;
  } catch (error) {
    console.error("Error registering user in auth-utils:", error);
    throw error;
  }
}


export async function sendPasswordReset(email: string): Promise<void> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    console.log(`Attempting to send password reset email to: ${email}`);
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function resetPassword(oobCode: string, newPassword: string): Promise<void> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    console.log("Attempting to reset password with oobCode:", oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
    console.log("Password reset successful for oobCode:", oobCode);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
