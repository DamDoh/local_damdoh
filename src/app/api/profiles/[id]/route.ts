
// src/app/api/profiles/[id]/route.ts
import { NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/types';
import { StakeholderProfileSchema } from '@/lib/schemas'; // Zod schema for validation
import { 
  getProfileByIdFromDB, 
  updateProfileInDB, 
  deleteProfileFromDB 
} from '@/lib/server-actions';
import { 
  successResponse, 
  notFoundResponse, 
  clientErrorResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';
import { isServerAuthenticated } from '@/lib/server-auth-utils';


interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const profile = await getProfileByIdFromDB(params.id);
    if (!profile) {
      return notFoundResponse('Profile');
    }
    return successResponse(profile);
  } catch (error) {
    return serverErrorResponse('Failed to fetch profile.', error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!await isServerAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add logic to ensure only the profile owner or an admin can update
  
  try {
    const body = await request.json();
    const partialProfileSchema = StakeholderProfileSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
    const validation = partialProfileSchema.safeParse(body);

    if (!validation.success) {
      return clientErrorResponse('Invalid profile update data.', validation.error.format());
    }

    const updatedProfile = await updateProfileInDB(params.id, validation.data);
    if (!updatedProfile) {
      return notFoundResponse('Profile');
    }
    return successResponse(updatedProfile);
  } catch (error: any) {
     if (error.name === 'SyntaxError') {
        return clientErrorResponse('Invalid JSON payload.');
    }
    return serverErrorResponse('Failed to update profile.', error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
   if (!await isServerAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add logic to ensure only the profile owner or an admin can delete

  try {
    const success = await deleteProfileFromDB(params.id);
    if (!success) {
      return notFoundResponse('Profile');
    }
    return successResponse({ message: 'Profile deleted successfully.' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    return serverErrorResponse('Failed to delete profile.', error);
  }
}
