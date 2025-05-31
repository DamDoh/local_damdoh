// src/app/api/marketplace/route.ts
import { NextResponse } from 'next/server';
import type { MarketplaceItem } from '@/lib/types';
import { MarketplaceItemSchema } from '@/lib/schemas';
import { 
  getAllMarketplaceItemsFromDB,
  createMarketplaceItemInDB
} from '@/lib/db-utils';
import { 
  successResponse, 
  clientErrorResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';
import { isAuthenticated } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const items = await getAllMarketplaceItemsFromDB();
    return successResponse(items);
  } catch (error) {
    return serverErrorResponse('Failed to fetch marketplace listings.', error);
  }
}

export async function POST(request: Request) {
  if (!await isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Use a schema that omits auto-generated fields for creation
    const creationSchema = MarketplaceItemSchema.omit({ 
        id: true, 
        createdAt: true, 
        updatedAt: true,
        // Optional fields that might not be present but are in main schema:
        imageUrl: true, 
        dataAiHint: true,
        isSustainable: true,
        sellerVerification: true,
        aiPriceSuggestion: true,
        skillsRequired: true,
        experienceLevel: true,
        compensation: true,
    });

    const validation = creationSchema.safeParse(body);

    if (!validation.success) {
      return clientErrorResponse('Invalid marketplace listing data.', validation.error.format());
    }
    
    // Construct the data type expected by createMarketplaceItemInDB
    const itemToCreate = validation.data as Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>;

    const newItem = await createMarketplaceItemInDB(itemToCreate);
    return successResponse(newItem, { status: 201 });

  } catch (error: any) {
    if (error.name === 'SyntaxError') {
        return clientErrorResponse('Invalid JSON payload.');
    }
    return serverErrorResponse('Failed to create marketplace listing.', error);
  }
}
