
"use server";

import { httpsCallable } from "firebase/functions";
import { functions } from './firebase/client';
import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";

/**
 * This file is intended to be the primary boundary between client components
 * and server-side logic. It should not contain direct database access code.
 * Instead, it should import and call functions from other server-side modules,
 * like `db-utils.ts` or AI flows.
 */

// We re-export this function here to designate it as a primary, callable "Server Action"
// from the client, even though the logic lives elsewhere. This maintains a clean
// separation of concerns.
export { getProfileByIdFromDB, getAllProfilesFromDB, performSearch } from './db-utils';


// This is a new server action specifically for the AI recommendations.
// It acts as the bridge between the client-side Marketplace page and the server-side AI flow.
export async function getMarketplaceRecommendationsAction(userId: string, count: number = 5) {
    try {
        const result = await getMarketplaceRecommendations({ userId, count });
        return result.recommendations;
    } catch(error) {
        console.error("[Server Action] getMarketplaceRecommendationsAction failed:", error);
        // Return an empty array to the client on failure to prevent crashes.
        return [];
    }
}
