
'use server';

import { getCurrentUser } from './server-auth-utils';
import { suggestMarketPrice as suggestMarketPriceFlow } from "@/ai/flows/suggest-market-price-flow";
import { getMarketplaceRecommendations } from "@/ai/flows/marketplace-recommendations";
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import { suggestForumTopics as suggestForumTopicsFlow } from '@/ai/flows/forum-topic-suggestions';
import type { UserProfile, SmartSearchInterpretation, CropRotationInput, CropRotationOutput, CreateFarmValues, CreateCropValues, Farm, Crop } from '@/lib/types';
import { getFunctions } from 'firebase-admin/functions'; // Use admin SDK functions
import { getAdminApp } from './firebase/admin';
import { getLocale } from 'next-intl/server';
import { generateForumPostDraftFlow } from '@/ai/flows/generate-forum-post-draft';

/**
 * A helper function to call a Firebase Cloud Function with proper authentication context.
 * This should be used by all server actions that need to interact with the backend.
 * @param functionName The name of the callable function (e.g., 'profiles.getProfileById').
 * @param data The data payload to send to the function.
 * @returns The data returned from the cloud function.
 */
async function callFirebaseFunction(functionName: string, data: any): Promise<any> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        const adminApp = getAdminApp();
        if (!adminApp) throw new Error("Admin SDK not initialized");
        
        const callableFunction = getFunctions(adminApp).httpsCallable(functionName);
        
        // The Admin SDK's callable function requires an 'auth' object in the context.
        const context = { auth: { uid: user.uid, token: user } };

        const result = await callableFunction(data, context);
        return result.data;
    } catch (error) {
        console.error(`Error calling function '${functionName}' from server action:`, error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
}


// =================================================================
// Server Action Wrappers
// These functions are safe to call from client components.
// They ensure authentication and delegate the actual work to secure Cloud Functions.
// =================================================================

/**
 * Server Action to fetch a single user profile by ID.
 * It wraps the internal database utility function.
 * @param id The user ID to fetch.
 * @returns A promise that resolves to the user profile or null.
 */
export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
  return callFirebaseFunction('profiles-getProfileByIdFromDB', { uid: id });
}

export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
    const data = await callFirebaseFunction('profiles-getAllProfilesFromDB', {});
    return data.profiles || [];
}

/**
 * Server Action to perform a search based on an AI-interpreted query.
 * @param interpretation The structured search query.
 * @returns A promise that resolves to an array of search results.
 */
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
  return callFirebaseFunction('search-performSearch', interpretation);
}


/**
 * Server Action to suggest a market price for a product using an AI flow.
 * @param input The details of the product.
 * @returns A promise that resolves to the price suggestion.
 */
export async function suggestMarketPrice(input: { productName: string; description: string; category?: string; location?: string; language?: string; }) {
    return callFirebaseFunction('aiServices-suggestMarketPrice', input);
}


/**
 * Server Action to get AI-powered marketplace recommendations for a user.
 * @param userId The ID of the user to get recommendations for.
 * @param count The number of recommendations to return.
 * @returns A promise that resolves to an array of recommendation objects.
 */
export async function getMarketplaceRecommendationsAction(userId: string, count: number = 5) {
    const locale = await getLocale();
    const result = await callFirebaseFunction('aiServices-getMarketplaceRecommendations', { userId, count, language: locale });
    return result.recommendations || [];
}

/**
 * Server Action to get AI-powered crop rotation suggestions.
 * @param input The crop history and location details.
 * @returns A promise that resolves to the crop rotation suggestions.
 */
export async function suggestCropRotationAction(input: Omit<CropRotationInput, 'language'>): Promise<CropRotationOutput> {
    const locale = await getLocale();
    const result = await callFirebaseFunction('aiServices-suggestCropRotation', { ...input, language: locale });
    return result || { suggestions: [] };
}

// Server Action Wrappers for Farm Management
export async function getFarm(farmId: string): Promise<Farm | null> {
    return callFirebaseFunction('farmManagement-getFarm', { farmId });
}

export async function updateFarm(farmId: string, data: CreateFarmValues): Promise<{ success: boolean; farmId: string; }> {
    return callFirebaseFunction('farmManagement-updateFarm', { farmId, ...data });
}

export async function getCrop(cropId: string): Promise<Crop | null> {
    return callFirebaseFunction('farmManagement-getCrop', { cropId });
}

export async function updateCrop(cropId: string, data: CreateCropValues): Promise<{ success: boolean; message: string; }> {
    const payload = {
        ...data,
        plantingDate: data.plantingDate instanceof Date ? data.plantingDate.toISOString() : data.plantingDate,
        harvestDate: data.harvestDate instanceof Date ? data.harvestDate.toISOString() : undefined,
    };
    return callFirebaseFunction('farmManagement-updateCrop', { cropId, ...payload });
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
    const result = await callFirebaseFunction('forums-getForumTopicSuggestions', input);
    return result || { suggestions: [] };
}


export async function generateForumPostDraftCallable(input: {
  topicId: string;
  prompt: string;
  language: string;
}) {
    return callFirebaseFunction('forums-generateForumPostDraft', input);
}

export async function getFinancialInstitutions() {
    const result = await callFirebaseFunction('financials-getFinancialInstitutions', {});
    return result as UserProfile[];
}
