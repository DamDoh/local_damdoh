
"use server";

import {
  getProfileByIdFromDB as getProfileByIdFromDB_internal,
} from './db-utils';
import { isServerAuthenticated } from './server-auth-utils';
import { suggestMarketPrice as suggestMarketPriceFlow } from "@/ai/flows/suggest-market-price-flow";
import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import { suggestForumTopics as suggestForumTopicsFlow } from '@/ai/flows/forum-topic-suggestions';
import type { UserProfile, SmartSearchInterpretation, CropRotationInput, CropRotationOutput, CreateFarmValues, CreateCropValues, Farm, Crop } from '@/lib/types';
import { functions } from './firebase/client-server';
import { httpsCallable } from 'firebase/functions';
import { getLocale } from 'next-intl/server';
import { generateForumPostDraftFlow } from '@/ai/flows/generate-forum-post-draft';

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
 * Server Action to perform a search based on an AI-interpreted query.
 * This function now calls the secure backend cloud function.
 * @param interpretation The structured search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  const isAuthenticated = await isServerAuthenticated();
  if (!isAuthenticated) { throw new Error("Unauthorized"); }
  
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
 * Server Action to suggest a market price for a product using an AI flow.
 * @param input The details of the product.
 * @returns A promise that resolves to the price suggestion.
 */
export async function suggestMarketPrice(input: { productName: string; description: string; category?: string; location?: string; language?: string; }) {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }

    try {
        return await suggestMarketPriceFlow(input);
    } catch (error) {
        console.error("[Server Action] suggestMarketPrice failed:", error);
        throw new Error("Failed to get price suggestion from AI.");
    }
}


/**
 * Server Action to get AI-powered marketplace recommendations for a user.
 * @param userId The ID of the user to get recommendations for.
 * @param count The number of recommendations to return.
 * @returns A promise that resolves to an array of recommendation objects.
 */
export async function getMarketplaceRecommendationsAction(userId: string, count: number = 5) {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
  
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
export async function suggestCropRotationAction(input: Omit<CropRotationInput, 'language'>): Promise<CropRotationOutput> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
  
    try {
        const locale = await getLocale();
        return await suggestCropRotation({ ...input, language: locale });
    } catch (error) {
        console.error("[Server Action] suggestCropRotationAction failed:", error);
        return { suggestions: [] };
    }
}

// Server Action Wrappers for Farm Management
export async function getFarm(farmId: string): Promise<Farm | null> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
    const getFarmCallable = httpsCallable(functions, 'getFarm');
    const result = await getFarmCallable({ farmId });
    return result.data as Farm | null;
}

export async function updateFarm(farmId: string, data: CreateFarmValues): Promise<{ success: boolean; farmId: string; }> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
    const updateFarmCallable = httpsCallable(functions, 'updateFarm');
    const result = await updateFarmCallable({ farmId, ...data });
    return result.data as { success: boolean; farmId: string; };
}

export async function getCrop(cropId: string): Promise<Crop | null> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
    const getCropCallable = httpsCallable(functions, 'getCrop');
    const result = await getCropCallable({ cropId });
    return result.data as Crop | null;
}

export async function updateCrop(cropId: string, data: CreateCropValues): Promise<{ success: boolean; message: string; }> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
    const updateCropCallable = httpsCallable(functions, 'updateCrop');
    // Ensure all data is serializable (e.g., Dates to ISO strings)
    const payload = {
        ...data,
        plantingDate: data.plantingDate instanceof Date ? data.plantingDate.toISOString() : data.plantingDate,
        harvestDate: data.harvestDate instanceof Date ? data.harvestDate.toISOString() : undefined,
    };
    const result = await updateCropCallable({ cropId, ...payload });
    return result.data as { success: boolean; message: string; };
}

/**
 * Server Action to get forum topic suggestions.
 * This is a client-safe wrapper around the Genkit flow.
 * @param input The existing topics and desired language.
 * @returns A promise that resolves to the suggested topics.
 */
export async function getForumTopicSuggestionsAction(input: {
  existingTopics: { name: string; description: string }[];
  language: string;
}): Promise<{ suggestions: { title: string; description: string }[] }> {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
  try {
    return await suggestForumTopicsFlow(input);
  } catch (error) {
    console.error("[Server Action] getForumTopicSuggestions failed:", error);
    return { suggestions: [] };
  }
}


export async function generateForumPostDraftCallable(input: {
  topicId: string;
  prompt: string;
  language: string;
}) {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
  try {
    return await generateForumPostDraftFlow(input);
  } catch (error) {
    console.error("[Server Action] generateForumPostDraft failed:", error);
    // You might want to throw a more specific error or handle it as needed
    throw new Error('Failed to generate draft from AI.');
  }
}

export async function getFinancialInstitutions() {
    const isAuthenticated = await isServerAuthenticated();
    if (!isAuthenticated) { throw new Error("Unauthorized"); }
    const getFisCallable = httpsCallable(functions, 'getFinancialInstitutions');
    const result = await getFisCallable();
    return result.data as UserProfile[];
}
