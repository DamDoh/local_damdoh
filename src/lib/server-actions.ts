'use server';

// Note: Most data-fetching server actions have been removed.
// Client components should now use the API utility functions to interact
// with backend functions directly, which provides a more robust authentication flow.
// This file is kept for server-side AI flows that benefit from the server action environment.

import { getCurrentUser } from './server-auth-utils';
import { suggestMarketPrice as suggestMarketPriceFlow } from "@/ai/flows/suggest-market-price-flow";
import { getMarketplaceRecommendations as getMarketplaceRecommendationsFlow } from "@/ai/flows/marketplace-recommendations";
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import { suggestForumTopics as suggestForumTopicsFlow } from '@/ai/flows/forum-topic-suggestions';
import { interpretSearchQuery as interpretSearchQueryFlow } from '@/ai/flows/query-interpreter-flow';
import { askFarmingAssistant as askFarmingAssistantFlow } from '@/ai/flows/farming-assistant-flow';
import type { FarmingAssistantInput, FarmingAssistantOutput, CropRotationInput, CropRotationOutput, SmartSearchInterpretation } from '@/lib/types';
import { getLocale } from 'next-intl/server';
import { generateForumPostDraftFlow } from '@/ai/flows/generate-forum-post-draft';
import { authenticatedApiCall, apiCall } from './api-utils';

/**
 * Server Action to interpret a search query using AI.
 * @param input The raw search query.
 * @returns A promise that resolves to the structured interpretation.
 */
export async function interpretSearchQuery(input: { rawQuery: string }): Promise<SmartSearchInterpretation> {
    const user = await getCurrentUser();
    // Public search is allowed, so no need to throw an error if user is null.
    const result = await interpretSearchQueryFlow(input);
    return result;
}

/**
 * Server Action to perform a search. It authenticates the user on the server
 * and then calls a secure API endpoint to execute the search logic.
 * @param interpretation The AI-interpreted search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("performSearch: User is not authenticated. Search may be limited.");
    // For public-facing pages like the marketplace, we might allow unauthenticated searches.
    // Let the backend function decide if auth is truly needed.
  }

  try {
      // Call the new backend API endpoint instead of Firebase function
      const result = await apiCall('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...interpretation, userId: user?.uid }),
      });
      return result.data as any[];
  } catch (error) {
      console.error("Error calling performSearch API endpoint:", error);
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
    const result = await getMarketplaceRecommendationsFlow({ userId, count, language: locale });
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

// Server actions to call API endpoints for farm management
export async function getFarmData(farmId: string) {
    const result = await authenticatedApiCall(`/farms/${farmId}`, {
      method: 'GET',
    });
    return result.data;
}

export async function updateFarmData(farmId: string, data: any) {
    await authenticatedApiCall(`/farms/${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
}

export async function getCropData(cropId: string) {
    const result = await authenticatedApiCall(`/crops/${cropId}`, {
      method: 'GET',
    });
    return result.data as any;
}

export async function updateCropData(cropId: string, data: any) {
    await authenticatedApiCall(`/crops/${cropId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
}

export async function getProfileByIdFromDB(uid: string) {
    const result = await authenticatedApiCall(`/user/profile/${uid}`, {
      method: 'GET',
    });
    return result.data as any;
}

export async function askFarmingAssistant(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const locale = await getLocale();
    return askFarmingAssistantFlow({ ...input, language: locale });
}
