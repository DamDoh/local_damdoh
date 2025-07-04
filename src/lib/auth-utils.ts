
"use client";

import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  type User as FirebaseUser
} from "firebase/auth";
import { auth, functions } from './firebase/client';
import { httpsCallable } from "firebase/functions";
import type { StakeholderRole } from './constants';
import { createContext, useContext } from 'react';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, uid: context.user?.uid };
};

let internalCurrentFirebaseUser: FirebaseUser | null = null;
onAuthStateChanged(auth, (user) => {
  internalCurrentFirebaseUser = user;
});

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
    
    // Create the initial profile using the callable function
    const upsertStakeholderProfile = httpsCallable(functions, 'upsertStakeholderProfile');

    await upsertStakeholderProfile({
        displayName: name,
        primaryRole: role,
        // The backend will set the timestamps and other defaults
    });

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
