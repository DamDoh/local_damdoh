
'use server';
// src/lib/server-auth-utils.ts
import { headers, cookies } from 'next/headers';
import { getAdminAuth } from './firebase/admin';

/**
 * Verifies if a request is authenticated on the server side by checking for
 * a valid Firebase auth session cookie. This is the correct method for
 * server actions and components.
 *
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    console.error("isServerAuthenticated: Firebase Admin SDK is not initialized. Cannot verify token.");
    return false;
  }

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    console.log("isServerAuthenticated: No session cookie found.");
    return false;
  }

  try {
    // verifySessionCookie() will throw an error if the cookie is invalid or expired.
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch (error) {
    console.log("isServerAuthenticated: Session cookie verification failed:", (error as Error).message);
    return false;
  }
}
