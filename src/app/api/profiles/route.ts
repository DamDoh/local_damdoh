// src/app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/types';
import { StakeholderProfileSchema } from '@/lib/schemas'; // Zod schema for validation
import { 
  getAllProfilesFromDB,
  createProfileInDB 
} from '@/lib/db-utils';
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

export async function POST(request: Request) {
  if (!await isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Exclude fields that are auto-generated or not part of creation
    const creationSchema = StakeholderProfileSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true,
      // Optional fields that might not be present on creation but are in the main schema:
      avatarUrl: true, 
      connections: true,
      // Other fields to potentially omit if they are not part of creation DTO
    });
    
    const validation = creationSchema.safeParse(body);

    if (!validation.success) {
      return clientErrorResponse('Invalid profile data.', validation.error.format());
    }

    // Construct the data to be passed to DB function, ensuring all required fields are present
    // and defaults are handled if necessary by the schema or DB layer.
    const profileToCreate = validation.data as Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;


    const newProfile = await createProfileInDB(profileToCreate);
    return successResponse(newProfile, { status: 201 });

  } catch (error: any) {
    if (error.name === 'SyntaxError') { // JSON parsing error
        return clientErrorResponse('Invalid JSON payload.');
    }
    return serverErrorResponse('Failed to create profile.', error);
  }
}
