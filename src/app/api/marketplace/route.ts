
// src/app/api/marketplace/route.ts
import { NextResponse } from 'next/server';
import type { MarketplaceItem } from '@/lib/types';
import { MarketplaceItemSchema } from '@/lib/schemas';
import { 
  getAllMarketplaceItemsFromDB,
} from '@/lib/server-actions';
import { 
  successResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';

export async function GET(request: Request) {
  try {
    const items = await getAllMarketplaceItemsFromDB();
    return successResponse(items);
  } catch (error) {
    return serverErrorResponse('Failed to fetch marketplace listings.', error);
  }
}
