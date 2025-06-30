
import * as functions from 'firebase-functions';
import '@/ai/dev';
import {askFarmingAssistant} from './ai/flows/farming-assistant-flow';

// --- Module 6: The AI & Analytics Engine ---
// This file is the primary, user-facing entry point for the AI Assistant.
// Internal AI/ML functions for other modules have been moved to their respective files
// (e.g., credit scoring in financials.ts, claim verification in insurance.ts).

/**
 * Callable function wrapper for the AI Farming Assistant.
 *
 * @param {any} data The data for the function call, matching FarmingAssistantInput type.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the AI's response.
 */
export const callFarmingAssistant = functions.https.onCall(
  async (data, context) => {
    // Optional: Add authentication checks if only logged-in users can use it.
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     'unauthenticated',
    //     'The function must be called while authenticated.'
    //   );
    // }
    try {
      // The `askFarmingAssistant` function is imported from the Genkit flow
      // and directly called with the data from the client.
      const result = await askFarmingAssistant(data);
      return result;
    } catch (error: any) {
      console.error("Error calling farming assistant flow:", error);
      // It's good practice to throw a specific error that the client can handle.
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while communicating with the AI Assistant.',
        error.message
      );
    }
  }
);
