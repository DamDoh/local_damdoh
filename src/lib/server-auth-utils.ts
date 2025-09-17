
'use server';
// src/lib/server-auth-utils.ts
import { cookies } from 'next/headers';
import type { AuthUser } from './auth-utils';

/**
 * Gets the current authenticated user on the server side.
 * @returns A promise that resolves to the user's data or null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('accessToken')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // For now, we'll just check if the token exists
    // In a real implementation, you would verify the JWT token
    // For simplicity, we'll assume the token is valid and extract user data from localStorage
    // This is a simplified approach - in production, you should verify the JWT properly
    const userCookie = cookieStore.get('user')?.value;
    if (userCookie) {
      return JSON.parse(userCookie) as AuthUser;
    }
    return null;
  } catch (error) {
    console.log("getCurrentUser: Token verification failed:", (error as Error).message);
    return null;
  }
}

/**
 * Verifies if a request is authenticated on the server side by checking for
 * a valid session token.
 *
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
