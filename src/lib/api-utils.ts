import { NextResponse } from 'next/server';

interface ApiResponseOptions {
  status?: number;
  headers?: HeadersInit;
}

export function successResponse(data: any, options?: ApiResponseOptions): NextResponse {
  return NextResponse.json(data, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

export function errorResponse(message: string, status: number, details?: any): NextResponse {
  return NextResponse.json(
    {
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
