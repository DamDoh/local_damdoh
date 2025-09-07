
// src/app/api/marketplace/route.ts
import { 
  successResponse, 
  serverErrorResponse 
} from '@/lib/api-utils';
import { performSearch } from '@/lib/server-actions';


export async function GET(request: Request) {
  try {
    // This is now just a wrapper around the server action
    const items = await performSearch({}); // Perform a blank search to get all items
    return successResponse(items);
  } catch (error) {
    return serverErrorResponse('Failed to fetch marketplace listings.', error);
  }
}
