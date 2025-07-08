
// src/app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import { 
  getAllProfilesFromDB,
} from '@/lib/db-utils';
import { 
  successResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';


export async function GET(request: Request) {
  try {
    const profiles = await getAllProfilesFromDB();
    return successResponse(profiles);
  } catch (error) {
    return serverErrorResponse('Failed to fetch profiles.', error);
  }
}

// NOTE: The POST functionality for creating a profile is now handled by the
// `registerUser` function in `auth-utils.ts`, which calls a secure Cloud Function.
// This POST endpoint is no longer needed.
