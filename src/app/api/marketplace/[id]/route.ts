
// src/app/api/marketplace/[id]/route.ts
import { NextResponse } from 'next/server';
import { MarketplaceItemSchema } from '@/lib/schemas';
import { 
  getMarketplaceItemByIdFromDB, 
  updateMarketplaceItemInDB, 
  deleteMarketplaceItemFromDB 
} from '@/lib/db-utils';
import { 
  successResponse, 
  notFoundResponse, 
  clientErrorResponse, 
  serverErrorResponse 
} from '@/app/api/api-utils';
import { isServerAuthenticated } from '@/lib/server-auth-utils';


interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const item = await getMarketplaceItemByIdFromDB(params.id);
    if (!item) {
      return notFoundResponse('Marketplace listing');
    }
    return successResponse(item);
  } catch (error) {
    return serverErrorResponse('Failed to fetch marketplace listing.', error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!await isServerAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add logic to ensure only the listing owner or an admin can update
  
  try {
    const body = await request.json();
    const partialItemSchema = MarketplaceItemSchema.partial().omit({ id: true, sellerId: true, createdAt: true, updatedAt: true });
    const validation = partialItemSchema.safeParse(body);

    if (!validation.success) {
      return clientErrorResponse('Invalid marketplace listing update data.', validation.error.format());
    }

    const updatedItem = await updateMarketplaceItemInDB(params.id, validation.data);
    if (!updatedItem) {
      return notFoundResponse('Marketplace listing');
    }
    return successResponse(updatedItem);
  } catch (error: any) {
    if (error.name === 'SyntaxError') {
        return clientErrorResponse('Invalid JSON payload.');
    }
    return serverErrorResponse('Failed to update marketplace listing.', error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!await isServerAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add logic to ensure only the listing owner or an admin can delete

  try {
    const success = await deleteMarketplaceItemFromDB(params.id);
    if (!success) {
      return notFoundResponse('Marketplace listing');
    }
    return successResponse({ message: 'Marketplace listing deleted successfully.' }, { status: 200 }); // Or 204
  } catch (error) {
    return serverErrorResponse('Failed to delete marketplace listing.', error);
  }
}
