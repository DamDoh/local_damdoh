
// src/app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/types';
import { StakeholderProfileSchema } from '@/lib/schemas'; // Zod schema for validation
import { 
  getAllProfilesFromDB,
} from '@/lib/server-actions';
import { 
  successResponse, 
  clientErrorResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';
import { isAuthenticated } from '@/lib/auth-utils';


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
// This ensures that a user profile document is only created upon successful
// Firebase Authentication user creation. This POST endpoint is no longer needed.
