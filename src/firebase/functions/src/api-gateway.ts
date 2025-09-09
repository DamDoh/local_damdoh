

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { checkAuth } from "./utils";
import { logInfo, logError } from './logging';

const db = admin.firestore();

/**
 * =================================================================
 * Module 9: API Gateway & Integration Layer
 * =================================================================
 * This module serves two primary purposes:
 * 1. Integrating with EXTERNAL third-party services (e.g., weather APIs).
 * 2. Exposing INTERNAL platform data to trusted partners via a secure API.
 */

// =================================================================
// Section 1: External API Integration Functions (Platform Outbound)
// =================================================================

/**
 * Fetches external market data for a commodity.
 * Conceptually called by Module 8 (AI) for market price prediction.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, data: any}>} A promise that resolves with the market data.
 */
export const fetchExternalMarketData = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const {commodity, region} = data;
    if (!commodity || !region) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.api.missingFields",
      );
    }

    try {
      logInfo("Fetching external market data", { commodity, region });
      // Placeholder for actual external API call using fetch() and the apiKey.
      const marketData = {
        price: Math.random() * 100,
        source: "External Data Provider",
      };
      logInfo("Successfully fetched external market data.", { commodity, region });
      return {status: "success", data: marketData};
    } catch (error: any) {
      logError("Error fetching external market data", { commodity, region, error: error.message });
      throw new functions.https.HttpsError(
        "internal",
        "error.api.fetchFailed",
        error.message,
      );
    }
  });

/**
 * Sends an SMS notification via an external gateway.
 * Conceptually called by the Notification System.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, messageId: string}>} A promise that resolves with the message ID.
 */
export const sendSmsNotification = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const {toPhoneNumber, messageBody} = data;
    if (!toPhoneNumber || !messageBody) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.api.missingSmsFields",
      );
    }

    try {
      logInfo("Sending SMS", { to: toPhoneNumber });
      // Placeholder for actual external API call to Twilio, etc.
      logInfo("SMS sent successfully (simulated).", { to: toPhoneNumber });
      return {status: "success", messageId: `sms_${Date.now()}`};
    } catch (error: any) {
      logError("Error sending SMS", { to: toPhoneNumber, error: error.message });
      throw new functions.https.HttpsError(
        "internal",
        "error.api.smsFailed",
        error.message,
      );
    }
  });

// =================================================================
// Section 2: Partner API Endpoints (Platform Inbound)
// =================================================================

/**
 * Helper function for API authentication and authorization (Conceptual).
 * Verifies the caller's identity and checks permissions.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{partnerId: string, permissions: string[]}>} A promise that resolves with the partner ID and permissions.
 */
async function authorizeApiRequest(context: functions.https.CallableContext): Promise<{
  partnerId: string,
  permissions: string[]
}> {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
    );
  }
  logInfo("Authorizing API request for partner", { partnerUid: context.auth.uid });
  const partnerId = context.auth.uid; // Placeholder
  const permissions = [
    "read:vti_details_public",
    "read:marketplace_listings_public",
  ]; // Placeholder permissions
  return {partnerId, permissions};
}

/**
 * API Endpoint for partners to get public details of a VTI batch.
 * @param {object} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, data: any}>} A promise that resolves with the VTI details.
 */
export const apiGetVtiDetails = functions.https.onCall(async (data, context) => {
  const {permissions} = await authorizeApiRequest(context);
  if (!permissions.includes("read:vti_details_public")) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "error.permissionDenied",
    );
  }

  const {vtiId} = data;
  if (!vtiId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.api.vtiIdRequired",
    );
  }

  try {
    const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
    if (!vtiDoc.exists || !vtiDoc.data()?.isPublicTraceable) {
      throw new functions.https.HttpsError(
        "not-found",
        "error.api.vtiNotFound",
      );
    }

    const vtiData = vtiDoc.data();
    // Transform data for public consumption, removing sensitive fields
    const apiResponseData = {
      id: vtiData?.vtiId,
      type: vtiData?.type,
      creationTime: (vtiData?.creationTime as admin.firestore.Timestamp)?.toDate?.().toISOString(),
      metadata: vtiData?.metadata, // Expose only public metadata
    };
    return {status: "success", data: apiResponseData};
  } catch (error: any) {
    logError(`API Error getting VTI details for ${vtiId}`, { error });
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "error.internal");
  }
});
