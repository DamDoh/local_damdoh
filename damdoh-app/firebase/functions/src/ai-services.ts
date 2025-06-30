
import * as functions from 'firebase-functions';
import '@/ai/dev';
import {askFarmingAssistant} from './ai/flows/farming-assistant-flow';

// --- Module 6: The AI & Analytics Engine ---
// This file contains the primary backend functions for interacting with AI models.

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


// --- Placeholder Legacy Functions (can be removed or refactored) ---

/**
 * Internal logic for assessing credit risk.
 * @param data - The data payload for assessment.
 * @returns A placeholder object with a calculated credit score.
 */
export async function _internalAssessCreditRisk(data: any) {
    console.log("Assessing credit risk with AI model (placeholder)...", data);
    // Placeholder logic: AI would analyze transaction history, farm data, etc.
    const calculatedScore = Math.floor(Math.random() * (850 - 500 + 1) + 500); // Random score between 500-850
    const riskFactors = ["Stable income from maize sales", "Slight over-leverage on equipment loans"];
    console.log(`AI-Assessed Credit Score: ${calculatedScore}`);
    return {
        score: calculatedScore,
        riskFactors: riskFactors,
        status: "assessment_complete"
    };
}

/**
 * Internal logic for matching a user with funding opportunities.
 * @param data - The data payload, containing user profile and available opportunities.
 * @returns A list of matched opportunities with scores.
 */
export async function _internalMatchFundingOpportunities(data: any) {
    console.log("Matching funding opportunities with AI model (placeholder)...", data);
    // Placeholder logic: AI would match user needs/profile with funding criteria.
    return {
        matchedOpportunities: [
            { opportunityId: 'loanProd123', matchScore: 92, reason: 'High credit score and matching crop type.' },
            { opportunityId: 'grantABC', matchScore: 85, reason: 'Focus on sustainable practices aligns with grant.' }
        ],
        status: "matching_complete"
    };
}

/**
 * Internal logic for assessing insurance risk for a policy.
 * @param data - Data payload including policy, policyholder, and asset details.
 * @returns A placeholder object with a calculated risk score.
 */
export async function _internalAssessInsuranceRisk(data: any) {
    console.log("Assessing insurance risk with AI model (placeholder)...", data);
    const riskScore = Math.random() * 10; // Random score between 0-10
    const riskFactors = ["Located in a region with high rainfall variability.", "Has implemented on-farm water storage."];
    return {
        insuranceRiskScore: riskScore.toFixed(2),
        riskFactors: riskFactors,
        status: "assessment_complete"
    };
}

/**
 * Internal logic for verifying an insurance claim's validity.
 * @param data - Data payload including claim details, policy, and other evidence.
 * @returns A proposed claim status and payout amount.
 */
export async function _internalVerifyClaim(data: any) {
    console.log("Verifying insurance claim with AI model (placeholder)...", data);
    // Placeholder logic: AI would analyze claim evidence against policy terms and external data (e.g., weather).
    const payoutAmount = Math.random() > 0.5 ? 5000 : 0;
    const status = payoutAmount > 0 ? 'approved' : 'rejected';
    return {
        status: status,
        payoutAmount: payoutAmount,
        assessmentDetails: {
            verificationLog: 'AI analysis suggests claim is valid based on satellite weather data.',
            dataPointsConsidered: ["satellite_imagery", "policy_terms", "historical_farm_data"]
        }
    };
}

/**
 * Internal logic for processing regulatory report data with AI.
 * @param data - The data payload for report processing.
 * @returns A placeholder object with AI-generated summary and detected anomalies.
 */
export async function _internalProcessReportData(data: any) {
    console.log("Processing regulatory report data with AI (placeholder)...", data);
    return {
        summary: `AI analysis of ${data.reportType} indicates compliance with key regulations, with one minor anomaly detected in transport logs.`,
        anomalies_detected: [{ eventId: 'evt_xyz', description: 'Unusually long transport time for VTI-123.' }],
        key_metrics: {
            'traceability_completeness': '98%',
            'organic_input_usage': '100%',
        },
    };
}
