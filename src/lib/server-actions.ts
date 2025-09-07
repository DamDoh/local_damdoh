
'use server';

// Note: Most data-fetching server actions have been removed.
// Client components should now use the Firebase Functions SDK (httpsCallable) to interact
// with backend functions directly, which provides a more robust authentication flow.
// This file is kept for server-side AI flows that benefit from the server action environment.

import { getCurrentUser } from './server-auth-utils';
import { suggestMarketPrice as suggestMarketPriceFlow } from "@/ai/flows/suggest-market-price-flow";
import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import { suggestForumTopics as suggestForumTopicsFlow } from '@/ai/flows/forum-topic-suggestions';
import type { CropRotationInput, CropRotationOutput, SmartSearchInterpretation } from '@/lib/types';
import { getLocale } from 'next-intl/server';
import { generateForumPostDraftFlow } from '@/ai/flows/generate-forum-post-draft';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app'; // Use getApp to get the initialized app
import { app } from './firebase/client'; // Assuming client init is sufficient


// Use the client-initialized app for functions. This is a bit of a workaround
// for Server Actions but ensures we use the same Firebase instance as the client.
const functions = getFunctions(app);

/**
 * Server Action to perform a search. It authenticates the user on the server
 * and then calls a secure Cloud Function to execute the search logic.
 * @param interpretation The AI-interpreted search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  const user = await getCurrentUser();
  if (!user) {
    console.error("performSearch: User is not authenticated.");
    throw new Error("Unauthorized");
  }

  try {
      const performSearchCallable = httpsCallable(functions, 'search-performSearch');
      const result = await performSearchCallable(interpretation);
      return result.data as any[];
  } catch (error) {
      console.error("Error calling performSearch cloud function:", error);
      throw error; // Re-throw the error to be handled by the client
  }
}

/**
 * Server Action to suggest a market price for a product using an AI flow.
 * @param input The details of the product.
 * @returns A promise that resolves to the price suggestion.
 */
export async function suggestMarketPriceAction(input: { productName: string; description: string; category?: string; location?: string; language?: string; }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return suggestMarketPriceFlow(input);
}


/**
 * Server Action to get AI-powered marketplace recommendations for a user.
 * @param userId The ID of the user to get recommendations for.
 * @param count The number of recommendations to return.
 * @returns A promise that resolves to an array of recommendation objects.
 */
export async function getMarketplaceRecommendationsAction(userId: string, count: number = 5) {
    const user = await getCurrentUser();
    if (!user || user.uid !== userId) throw new Error("Unauthorized");

    const locale = await getLocale();
    const result = await getMarketplaceRecommendations({ userId, count, language: locale });
    return result.recommendations || [];
}

/**
 * Server Action to get AI-powered crop rotation suggestions.
 * @param input The crop history and location details.
 * @returns A promise that resolves to the crop rotation suggestions.
 */
export async function suggestCropRotationAction(input: Omit<CropRotationInput, 'language'>): Promise<CropRotationOutput> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const locale = await getLocale();
    const result = await suggestCropRotation({ ...input, language: locale });
    return result || { suggestions: [] };
}


/**
 * Server Action to get forum topic suggestions.
 * @param input The existing topics and desired language.
 * @returns A promise that resolves to the suggested topics.
 */
export async function getForumTopicSuggestionsAction(input: {
  existingTopics: { name: string; description: string }[];
  language: string;
}): Promise<{ suggestions: { title: string; description: string }[] }> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const result = await suggestForumTopicsFlow(input);
    return result || { suggestions: [] };
}


export async function generateForumPostDraftCallable(input: {
  topicId: string;
  prompt: string;
  language: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    return generateForumPostDraftFlow(input);
}

export async function getProfileByIdFromDB(uid: string) {
    const getProfileCallable = httpsCallable(functions, 'user-getProfileByIdFromDB');
    const result = await getProfileCallable({ uid });
    return result.data as any;
}

export async function getFarmData(farmId: string) {
    const getFarmCallable = httpsCallable(functions, 'farmManagement-getFarm');
    const result = await getFarmCallable({ farmId });
    return result.data as any;
}

export async function updateFarmData(farmId: string, values: any) {
    const updateFarmCallable = httpsCallable(functions, 'farmManagement-updateFarm');
    const payload = { farmId, ...values };
    await updateFarmCallable(payload);
}

export async function getCropData(cropId: string) {
    const getCropCallable = httpsCallable(functions, 'farmManagement-getCrop');
    const result = await getCropCallable({ cropId });
    return result.data as any;
}

export async function updateCropData(cropId: string, values: any) {
    const updateCropCallable = httpsCallable(functions, 'farmManagement-updateCrop');
    const payload = { cropId, ...values };
    await updateCropCallable(payload);
}
