
// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';
import type { NextRequest } from 'next/server';
import { serverErrorResponse } from '@/app/api/api-utils';

/**
 * Handles POST requests to create a server-side session cookie from a client-side ID token.
 */
export async function POST(request: NextRequest) {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return serverErrorResponse('Firebase Admin SDK not initialized.');
  }

  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'ID token is required.' }), { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Set cookie policy for session cookie.
    cookies().set('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return serverErrorResponse('Failed to create session cookie.');
  }
}

/**
 * Handles DELETE requests to clear the server-side session cookie.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clear the session cookie by setting its maxAge to 0.
    cookies().set('session', '', { maxAge: 0 });
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing session cookie:', error);
    return serverErrorResponse('Failed to clear session cookie.');
  }
}
