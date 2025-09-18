'use server';

// Note: Most data-fetching server actions have been removed.
// Client components should now use the API utility functions to interact
// with backend functions directly, which provides a more robust authentication flow.
// This file is kept for server-side AI flows that benefit from the server action environment.

import { getCurrentUser } from './server-auth-utils';
import { suggestCropRotation } from "@/ai/flows/crop-rotation-suggester";
import { askFarmingAssistant as askFarmingAssistantFlow, type FarmingAssistantInput as FlowFarmingAssistantInput, type FarmingAssistantOutput as FlowFarmingAssistantOutput } from '@/ai/flows/farming-assistant-flow';
import type { FarmingAssistantInput, FarmingAssistantOutput, CropRotationInput, CropRotationOutput, SmartSearchInterpretation } from '@/lib/types';
import { getLocale } from 'next-intl/server';
import { apiCall } from './api-utils';


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
        body: JSON.stringify({ ...interpretation, userId: user?.id }),
      });
      return (result as any).data as any[];
  } catch (error) {
      console.error("Error calling performSearch API endpoint:", error);
      throw error; // Re-throw the error to be handled by the client
  }
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





// Server actions to call API endpoints for farm management
export async function getFarmData(farmId: string) {
    const result = await apiCall(`/farms/${farmId}`, {
      method: 'GET',
    });
    return result;
}

export async function updateFarmData(farmId: string, data: any) {
    await apiCall(`/farms/${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
}

export async function getCropData(cropId: string) {
    const result = await apiCall(`/crops/${cropId}`, {
      method: 'GET',
    });
    return result as any;
}

export async function updateCropData(cropId: string, data: any) {
    await apiCall(`/crops/${cropId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
}

export async function getProfileByIdFromDB(uid: string) {
    const result = await apiCall(`/user/profile/${uid}`, {
      method: 'GET',
    });
    return result as any;
}

export async function askFarmingAssistant(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const locale = await getLocale();

    // Transform input to match the flow's expected format
    const transformedInput = {
      question: input.query,
      photoDataUri: input.photoDataUri,
      language: locale
    };

    const flowResult = await askFarmingAssistantFlow(transformedInput);

    // Transform the flow's output to match the schema's expected format
    const result: FarmingAssistantOutput = {
      summary: flowResult.answer,
      detailedPoints: [{
        title: 'Farming Advice',
        content: flowResult.answer
      }],
      suggestedQueries: [
        'What crops grow well in my region?',
        'How can I improve soil health?',
        'What are the best irrigation methods?'
      ]
    };

    return result;
}
