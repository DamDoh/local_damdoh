"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiGetVtiDetails = exports.sendSmsNotification = exports.fetchExternalMarketData = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
exports.fetchExternalMarketData = functions.https.onCall(async (data, context) => {
    const { commodity, region } = data;
    if (!commodity || !region) {
        throw new functions.https.HttpsError("invalid-argument", "Commodity and region are required.");
    }
    try {
        console.log(`Fetching external market data for ${commodity} in ${region}...`);
        // Placeholder for actual external API call using fetch() and the apiKey.
        const marketData = {
            price: Math.random() * 100,
            source: "External Data Provider",
        };
        console.log("Successfully fetched external market data.");
        return { status: "success", data: marketData };
    }
    catch (error) {
        console.error("Error fetching external market data:", error);
        throw new functions.https.HttpsError("internal", "Unable to fetch external market data.", error.message);
    }
});
/**
 * Sends an SMS notification via an external gateway.
 * Conceptually called by the Notification System.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, messageId: string}>} A promise that resolves with the message ID.
 */
exports.sendSmsNotification = functions.https.onCall(async (data, context) => {
    const { toPhoneNumber, messageBody } = data;
    if (!toPhoneNumber || !messageBody) {
        throw new functions.https.HttpsError("invalid-argument", "toPhoneNumber and messageBody are required.");
    }
    try {
        console.log(`Sending SMS to ${toPhoneNumber}...`);
        // Placeholder for actual external API call to Twilio, etc.
        console.log("SMS sent successfully (simulated).");
        return { status: "success", messageId: `sms_${Date.now()}` };
    }
    catch (error) {
        console.error("Error sending SMS:", error);
        throw new functions.https.HttpsError("internal", "Unable to send SMS notification.", error.message);
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
async function authorizeApiRequest(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication via API Key required.");
    }
    console.log(`Authorizing API request for partner ${context.auth.uid}...`);
    const partnerId = context.auth.uid; // Placeholder
    const permissions = [
        "read:vti_details_public",
        "read:marketplace_listings_public",
    ]; // Placeholder permissions
    return { partnerId, permissions };
}
/**
 * API Endpoint for partners to get public details of a VTI batch.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, data: any}>} A promise that resolves with the VTI details.
 */
exports.apiGetVtiDetails = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const { permissions } = await authorizeApiRequest(context);
    if (!permissions.includes("read:vti_details_public")) {
        throw new functions.https.HttpsError("permission-denied", "Partner does not have permission to read VTI details.");
    }
    const { vtiId } = data;
    if (!vtiId) {
        throw new functions.https.HttpsError("invalid-argument", "vtiId is required.");
    }
    try {
        const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
        if (!vtiDoc.exists || !((_a = vtiDoc.data()) === null || _a === void 0 ? void 0 : _a.isPublicTraceable)) {
            throw new functions.https.HttpsError("not-found", `Public VTI with ID ${vtiId} not found.`);
        }
        const vtiData = vtiDoc.data();
        // Transform data for public consumption, removing sensitive fields
        const apiResponseData = {
            id: vtiData === null || vtiData === void 0 ? void 0 : vtiData.vtiId,
            type: vtiData === null || vtiData === void 0 ? void 0 : vtiData.type,
            creationTime: (_b = vtiData === null || vtiData === void 0 ? void 0 : vtiData.creationTime) === null || _b === void 0 ? void 0 : _b.toDate().toISOString(),
            metadata: vtiData === null || vtiData === void 0 ? void 0 : vtiData.metadata, // Expose only public metadata
        };
        return { status: "success", data: apiResponseData };
    }
    catch (error) {
        console.error(`API Error getting VTI details for ${vtiId}:`, error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "An internal error occurred.");
    }
});
//# sourceMappingURL=module9.js.map