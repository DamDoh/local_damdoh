
"use client";

import {
  onAuthStateChanged,
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
import { createContext, useContext } from 'react';
import type { UserProfile } from './types';

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, uid: context.user?.uid };
};

export function getCurrentUserId(): string | null {
  return auth.currentUser ? auth.currentUser.uid : null;
}

export function isAdmin(userId: string | null): boolean {
  console.warn("auth-utils: isAdmin() is a placeholder.");
  return userId === "adminUser"; 
}

export async function logOut(): Promise<void> {
  try {
    // 1. Sign out from Firebase client-side auth
    await firebaseSignOut(auth);
    
    // 2. Clear the server-side session cookie by calling our new API route
    await fetch('/api/auth/session', { method: 'DELETE' });

    console.log("User logged out successfully via auth-utils.");
  } catch (error) {
    console.error("Error logging out from auth-utils: ", error);
    throw error; 
  }
}

export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 1. Get the ID token from the signed-in user
    const idToken = await user.getIdToken();

    // 2. Call our new API route to create a server-side session cookie
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
 * Registers a user with Firebase Auth and calls a secure Cloud Function to create their profile.
 * @param name The user's display name.
 * @param email The user's email.
 * @param password The user's password.
 * @param role The user's selected stakeholder role.
 * @param profileData Optional object with initial role-specific data.
 * @returns The created Firebase User object.
 */
export async function registerUser(
  name: string, 
  email: string, 
  password: string, 
  role: StakeholderRole,
  profileData?: any 
): Promise<FirebaseUser> {
  try {
    // Step 1: Create the user in Firebase Authentication.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Firebase Auth user registered successfully:", userCredential.user.uid);
    
    // Step 1.5: Update the Firebase Auth profile with the display name.
    await updateProfile(userCredential.user, { displayName: name });
    console.log("Firebase Auth profile updated with display name.");

    // Step 2: Call a secure Cloud Function to create the initial profile.
    const upsertStakeholderProfile = httpsCallable(functions, 'profiles.upsertStakeholderProfile');
    await upsertStakeholderProfile({
        displayName: name,
        primaryRole: role,
        email: email, 
        profileData: profileData || {}, // Pass along profile data if it exists
    });

    console.log("Profile creation request sent for user:", userCredential.user.uid);
    
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
    throw error;
  }
}

export async function resetPassword(oobCode: string, newPassword: string): Promise<void> {
  try {
    console.log("Attempting to reset password with oobCode:", oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
    console.log("Password reset successful for oobCode:", oobCode);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
