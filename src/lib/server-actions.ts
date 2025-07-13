
"use server";

import {
  getProfileByIdFromDB as getProfileByIdFromDB_internal,
  getAllProfilesFromDB as getAllProfilesFromDB_internal,
  performSearch as performSearch_internal,
} from './db-utils';

import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import type { UserProfile, SmartSearchInterpretation, CropRotationInput, CropRotationOutput } from '@/lib/types';
import { functions } from './firebase/client';
import { httpsCallable } from 'firebase/functions';
import { getLocale } from 'next-intl/server';

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
 * This function now calls the secure backend cloud function.
 * @param interpretation The structured search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  try {
      const performSearchCallable = httpsCallable(functions, 'performSearch');
      const result = await performSearchCallable(interpretation);
      return result.data as any[];
  } catch (error) {
      console.error("Error performing search from server action:", error);
      // In a real app, you might want to re-throw a more user-friendly error
      // or handle it gracefully. For now, we'll return an empty array.
      return [];
  }
}


/**
 * Server Action to get AI-powered marketplace recommendations for a user.
 * @param userId The ID of the user to get recommendations for.
 * @param count The number of recommendations to return.
 * @returns A promise that resolves to an array of recommendation objects.
 */
export async function getMarketplaceRecommendationsAction(userId: string, count: number = 5) {
    try {
        const locale = await getLocale();
        const result = await getMarketplaceRecommendations({ userId, count, language: locale });
        return result.recommendations;
    } catch(error) {
        console.error("[Server Action] getMarketplaceRecommendationsAction failed:", error);
        // Return an empty array to the client on failure to prevent crashes.
        return [];
    }
}

/**
 * Server Action to get AI-powered crop rotation suggestions.
 * @param input The crop history and location details.
 * @returns A promise that resolves to the crop rotation suggestions.
 */
export async function suggestCropRotationAction(input: CropRotationInput): Promise<CropRotationOutput> {
    try {
        const locale = await getLocale();
        return await suggestCropRotation({ ...input, language: locale });
    } catch (error) {
        console.error("[Server Action] suggestCropRotationAction failed:", error);
        return { suggestions: [] };
    }
}

// --- Financials Actions ---
export async function getFinancialInstitutions(): Promise<UserProfile[]> {
  try {
    const getFiCallable = httpsCallable(functions, 'getFinancialInstitutions');
    const result = await getFiCallable();
    return (result.data as any) || [];
  } catch (error) {
    console.error("Error calling getFinancialInstitutions from server action:", error);
    throw error;
  }
}

    
