// src/app/api/marketplace/[id]/route.ts
import { NextResponse } from 'next/server';
import type { MarketplaceItem } from '@/lib/types';
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
} from '@/lib/api-utils';
import { isAuthenticated, getCurrentUserId } from '@/lib/auth-utils';


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
  if (!await isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Add logic to ensure only the listing owner or an admin can update
  // const currentUserId = getCurrentUserId();
  // const item = await getMarketplaceItemByIdFromDB(params.id);
  // if (item && currentUserId !== item.sellerId && !isAdmin(currentUserId)) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }
  
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
  if (!await isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Add logic to ensure only the listing owner or an admin can delete
  // const currentUserId = getCurrentUserId();
  // const item = await getMarketplaceItemByIdFromDB(params.id);
  // if (item && currentUserId !== item.sellerId && !isAdmin(currentUserId)) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

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
