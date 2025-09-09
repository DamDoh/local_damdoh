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
exports._internalProcessReportData = _internalProcessReportData;
const functions = __importStar(require("firebase-functions"));
/**
 * Checks if the user is authenticated.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {string} The user's UID.
 * @throws {functions.https.HttpsError} Throws an error if the user is not authenticated.
 */
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    return context.auth.uid;
};
/**
 * =================================================================
 * Module 6: AI & Analytics Engine (The Brain of DamDoh)
 * =================================================================
 * NOTE: The assessCreditRiskWithAI and matchFundingOpportunitiesWithAI functions
 * have been officially migrated to the Express server in `server.ts` for deployment
 * on Cloud Run. This ensures better performance by avoiding cold starts.
 * New client calls must be directed to the Cloud Run endpoints.
 */
/**
 * Processes raw data (like a list of traceability events) and generates
 * an AI-powered summary and key findings.
 *
 * @param {any} data The report data to be processed.
 * @return {Promise<any>} A promise that resolves with the processed content.
 */
async function _internalProcessReportData(data) {
    console.log(`Processing report data with AI for type: ${data.reportType}`);
    if (!Array.isArray(data.data) || data.data.length === 0) {
        return {
            summary: "No data was provided for analysis.",
            key_findings: [],
        };
    }
    // Simulate AI analysis based on report type
    if (data.reportType === "VTI_EVENTS_SUMMARY") {
        const eventCount = data.data.length;
        const eventTypes = new Set(data.data.map((e) => e.eventType));
        const eventTypeCounts = data.data.reduce((acc, e) => {
            acc[e.eventType] = (acc[e.eventType] || 0) + 1;
            return acc;
        }, {});
        const mostCommonEventType = Object.keys(eventTypeCounts).reduce((a, b) => eventTypeCounts[a] > eventTypeCounts[b] ? a : b, '');
        const summary = `This report summarizes ${eventCount} traceability events. The primary activities logged include: ${[...eventTypes].join(", ")}.`;
        const key_findings = [
            `A total of ${eventCount} events were logged for this user within the specified period.`,
            `The most common event type was '${mostCommonEventType}' with ${eventTypeCounts[mostCommonEventType]} occurrences.`,
            "All logged events appear to be within normal operational parameters. (AI assessment placeholder)",
        ];
        return { summary, key_findings };
    }
    // Default fallback for other report types
    return {
        summary: `This is an AI-generated summary for report type: ${data.reportType}.`,
        key_findings: [
            "Finding 1: Placeholder from AI analysis.",
            "Finding 2: Placeholder from AI analysis.",
        ],
    };
}
//# sourceMappingURL=ai-and-analytics.js.map