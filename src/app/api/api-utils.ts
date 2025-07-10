
import { NextResponse } from 'next/server';

// This function checks if the code is running on the server.
// It's crucial for using the correct Firebase Admin SDK on the server
// and the Firebase Client SDK in the browser.
export const is_server = typeof window === 'undefined';

// Super App Vision Note: This file contains helpers for our API routes, but more importantly,
// it outlines the conceptual logic for backend Cloud Functions that will act as the "connective tissue"
// for the super app. Functions like `requestVerifiedData` are crucial for enabling secure,
// consent-based data sharing between modules and stakeholders, a cornerstone of a trusted ecosystem.
// The AI-related notes describe how backend triggers will proactively provide value, like matching farmers
// with financial products, which is a key "smart" feature.

interface ApiResponseOptions {
  status?: number;
  headers?: HeadersInit;
}

export function successResponse(data: any, options?: ApiResponseOptions): NextResponse {
  return NextResponse.json({ success: true, data }, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

export function errorResponse(message: string, status: number, details?: any): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        status,
        details,
      },
    },
    { status }
  );
}

export function clientErrorResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, 400, details);
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return errorResponse(message, 403);
}

export function notFoundResponse(resourceName: string = "Resource"): NextResponse {
  return errorResponse(`${resourceName} not found.`, 404);
}

export function serverErrorResponse(message: string = "Internal Server Error", details?: any): NextResponse {
  console.error("Server Error:", message, details); // Log server errors
  return errorResponse(message, 500, details);
}
