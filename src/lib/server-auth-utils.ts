
'use server';
// src/lib/server-auth-utils.ts
import { cookies } from 'next/headers';
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
    // This can happen in environments where the admin SDK isn't initialized,
    // which is expected in some client-side build steps. Don't throw an error.
    console.log("isServerAuthenticated: Firebase Admin SDK is not available. Assuming unauthenticated.");
    return false;
  }

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    // This is a normal unauthenticated case.
    return false;
  }

  try {
    // verifySessionCookie() will throw an error if the cookie is invalid or expired.
    // The second argument `true` checks for revocation status.
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch (error) {
    // Any error during verification means the session is invalid.
    console.log("isServerAuthenticated: Session cookie verification failed:", (error as Error).message);
    return false;
  }
}
