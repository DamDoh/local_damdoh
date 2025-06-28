
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, data: any}>} A promise that resolves with the market data.
 */
export const fetchExternalMarketData = functions.https.onCall(async (data, context) => {
    const {commodity, region} = data;
    if (!commodity || !region) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Commodity and region are required.",
      );
    }

    try {
      console.log(`Fetching external market data for ${commodity} in ${region}...`);
      // Placeholder for actual external API call using fetch() and the apiKey.
      const marketData = {
        price: Math.random() * 100,
        source: "External Data Provider",
      };
      console.log("Successfully fetched external market data.");
      return {status: "success", data: marketData};
    } catch (error: any) {
      console.error("Error fetching external market data:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to fetch external market data.",
        error.message,
      );
    }
  });

/**
 * Sends an SMS notification via an external gateway.
 * Conceptually called by the Notification System.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, messageId: string}>} A promise that resolves with the message ID.
 */
export const sendSmsNotification = functions.https.onCall(async (data, context) => {
    const {toPhoneNumber, messageBody} = data;
    if (!toPhoneNumber || !messageBody) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "toPhoneNumber and messageBody are required.",
      );
    }

    try {
      console.log(`Sending SMS to ${toPhoneNumber}...`);
      // Placeholder for actual external API call to Twilio, etc.
      console.log("SMS sent successfully (simulated).");
      return {status: "success", messageId: `sms_${Date.now()}`};
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to send SMS notification.",
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
      "Authentication via API Key required.",
    );
  }
  console.log(`Authorizing API request for partner ${context.auth.uid}...`);
  const partnerId = context.auth.uid; // Placeholder
  const permissions = [
    "read:vti_details_public",
    "read:marketplace_listings_public",
  ]; // Placeholder permissions
  return {partnerId, permissions};
}

/**
 * API Endpoint for partners to get public details of a VTI batch.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, data: any}>} A promise that resolves with the VTI details.
 */
export const apiGetVtiDetails = functions.https.onCall(async (data, context) => {
  const {permissions} = await authorizeApiRequest(context);
  if (!permissions.includes("read:vti_details_public")) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Partner does not have permission to read VTI details.",
    );
  }

  const {vtiId} = data;
  if (!vtiId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "vtiId is required.",
    );
  }

  try {
    const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
    if (!vtiDoc.exists || !vtiDoc.data()?.isPublicTraceable) {
      throw new functions.https.HttpsError(
        "not-found",
        `Public VTI with ID ${vtiId} not found.`,
      );
    }

    const vtiData = vtiDoc.data();
    // Transform data for public consumption, removing sensitive fields
    const apiResponseData = {
      id: vtiData?.vtiId,
      type: vtiData?.type,
      creationTime: vtiData?.creationTime?.toDate().toISOString(),
      metadata: vtiData?.metadata, // Expose only public metadata
    };
    return {status: "success", data: apiResponseData};
  } catch (error: any) {
    console.error(`API Error getting VTI details for ${vtiId}:`, error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "An internal error occurred.");
  }
});
