// src/lib/server-auth-utils.ts
import { headers } from 'next/headers';
import { getAdminAuth } from './firebase/admin';

/**
 * Verifies if a request is authenticated on the server side by checking the
 * Authorization header for a valid Firebase ID token.
 * This should be used in API Routes and Server Actions.
 *
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const authHeader = headers().get('Authorization');
  if (!authHeader) {
    console.warn("isServerAuthenticated: No Authorization header found.");
    return false;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    console.warn("isServerAuthenticated: Bearer token is missing.");
    return false;
  }

  try {
    const adminAuth = getAdminAuth();
    // This will throw an error if the token is invalid or expired
    await adminAuth.verifyIdToken(token);
    return true;
  } catch (error) {
    console.error("isServerAuthenticated: Auth token verification error:", error);
    return false;
  }
}
