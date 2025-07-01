
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * =================================================================
 * Module 9: API Gateway & Integrations
 * =================================================================
 */

/**
 * Fetches external market data for a commodity.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context.
 * @return {Promise<any>} A promise that resolves with the market data.
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
      const marketData = {
        price: Math.random() * 100,
        source: "External Data Provider",
      };
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
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context.
 * @return {Promise<any>} A promise that resolves with the message ID.
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
