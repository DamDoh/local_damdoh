
'use server';
// src/lib/server-auth-utils.ts
import { cookies } from 'next/headers';
import { getAdminAuth } from './firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Gets the current authenticated user on the server side.
 * @returns A promise that resolves to the user's decoded token or null if not authenticated.
 */
export async function getCurrentUser(): Promise<DecodedIdToken | null> {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    console.log("getCurrentUser: Firebase Admin SDK is not available.");
    return null;
  }

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    console.log("getCurrentUser: Session cookie verification failed:", (error as Error).message);
    return null;
  }
}

/**
 * Verifies if a request is authenticated on the server side by checking for
 * a valid Firebase auth session cookie.
 *
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
