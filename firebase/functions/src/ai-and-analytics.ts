
import * as functions from "firebase-functions";
import {
  _internalAssessCreditRisk,
  _internalMatchFundingOpportunities,
} from "./financial-services";

/**
 * =================================================================
 * Module 6: AI & Analytics Engine (The Brain of DamDoh)
 * =================================================================
 */

// This file will house the core AI and data analytics functions.
// For now, it will contain the placeholder functions from the original module8.ts.
// As we refactor, we will move the actual AI-related logic here.
// Note: The internal logic for financial and insurance services has been moved
// to their respective modules (financial-services.ts, insurance.ts). This file
// now primarily holds the callable wrappers that might be used by external services
// or specific client-side use cases, while keeping the core logic modular.


/**
 * Callable function wrapper for assessing credit risk.
 * Note: Exposing this directly to clients should be done with caution.
 *
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the assessment.
 */
export const assessCreditRiskWithAI = functions.https.onCall(
    async (data, context) => {
    // TODO: Add authentication and authorization checks
      return await _internalAssessCreditRisk(data);
    },
);

/**
 * Callable function wrapper for matching funding opportunities.
 *
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the matched opportunities.
 */
export const matchFundingOpportunitiesWithAI = functions.https.onCall(
    async (data, context) => {
    // TODO: Add authentication and authorization checks
      return await _internalMatchFundingOpportunities(data);
    },
);
