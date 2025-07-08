
// src/app/api/marketplace/route.ts
import { 
  getAllMarketplaceItemsFromDB,
} from '@/lib/db-utils';
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
