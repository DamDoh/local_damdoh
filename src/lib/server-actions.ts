
"use server";

import {
  getProfileByIdFromDB as getProfileByIdFromDB_internal,
  getAllProfilesFromDB as getAllProfilesFromDB_internal,
  performSearch as performSearch_internal,
} from './db-utils';
import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";
import type { UserProfile, SmartSearchInterpretation } from '@/lib/types';


/**
 * Server Action to fetch a single user profile by ID.
 * It wraps the internal database utility function.
 * @param id The user ID.
 * @returns A promise that resolves to the user profile or null.
 */
export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
  return getProfileByIdFromDB_internal(id);
}

/**
 * Server Action to fetch all user profiles.
 * It wraps the internal database utility function.
 * @returns A promise that resolves to an array of user profiles.
 */
export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  return getAllProfilesFromDB_internal();
}

/**
 * Server Action to perform a search based on an AI-interpreted query.
 * It wraps the internal database utility function.
 * @param interpretation The structured search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  return performSearch_internal(interpretation);
}


/**
 * Server Action to get AI-powered marketplace recommendations for a user.
 * @param userId The ID of the user to get recommendations for.
 * @param count The number of recommendations to return.
 * @returns A promise that resolves to an array of recommendation objects.
 */
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
