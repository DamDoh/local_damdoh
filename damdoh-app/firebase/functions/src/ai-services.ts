
/**
 * =================================================================
 * Module 6: The AI & Analytics Engine (The Brain of DamDoh)
 * =================================================================
 * This module is the intelligence core of the DamDoh Super App, leveraging
 * Genkit and other AI/ML tools to provide predictive insights, personalized
 * recommendations, and intelligent assistance across the entire platform.
 *
 * @purpose To transform raw agricultural data into actionable intelligence,
 * empowering farmers and stakeholders with data-driven decision-making,
 * optimizing processes, predicting market trends, and facilitating precision
 * agriculture globally.
 *
 * @key_concepts
 * - Farming Assistant: Provides personalized agronomic advice (e.g., KNF/FGW),
 *   crop diagnosis, and platform guidance. (See: farming-assistant-flow.ts)
 * - Market Insights & Price Prediction: Analyzes market data to forecast trends.
 * - Connection & Recommendation Engine: Suggests relevant connections to users.
 * - Universal Search Interpreter: Uses NLP to understand complex search queries.
 * - Yield Prediction & Crop Health Monitoring: Leverages farm and satellite data.
 * - Sustainability Optimization: Suggests practices to improve environmental impact.
 *
 * @synergy
 * - Consumes data from nearly all other modules (1, 2, 3, 4, 5, 8, 12).
 * - Provides intelligent outputs back to users via the app and other modules.
 * - Uses the Genkit framework for all AI flows and tool definitions.
 */

import * as functions from 'firebase-functions';
import '@/ai/dev';
import {askFarmingAssistant} from './ai/flows/farming-assistant-flow';

/**
 * Callable function wrapper for the AI Farming Assistant.
 * This is the primary user-facing entry point for direct AI interaction.
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
