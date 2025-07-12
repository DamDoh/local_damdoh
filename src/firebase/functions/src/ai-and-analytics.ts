
import * as functions from "firebase-functions";
import {
  _internalAssessCreditRisk,
  _internalMatchFundingOpportunities,
} from "./financial-services";

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

/**
 * =================================================================
 * Module 6: AI & Analytics Engine (The Brain of DamDoh)
 * =================================================================
 * NOTE: The assessCreditRiskWithAI function is now deprecated here and has been
 * migrated to the new Express server in `server.ts` for deployment on Cloud Run.
 * This ensures better performance by avoiding cold starts.
 * The function is kept here as a placeholder to avoid breaking potential old references
 * but should not be used for new development. New client calls should be directed
 * to the Cloud Run endpoint.
 */

export const assessCreditRiskWithAI = functions.https.onCall(
    async (data, context) => {
      console.warn("DEPRECATED: The 'assessCreditRiskWithAI' callable function is deprecated. Use the Cloud Run endpoint '/ai/assess-risk' instead.");
      checkAuth(context);
      return await _internalAssessCreditRisk(data);
    },
);

export const matchFundingOpportunitiesWithAI = functions.https.onCall(
    async (data, context) => {
      checkAuth(context);
      return await _internalMatchFundingOpportunities(data);
    },
);

/**
 * Processes raw data (like a list of traceability events) and generates
 * an AI-powered summary and key findings.
 *
 * @param {any} data The report data to be processed.
 * @return {Promise<any>} A promise that resolves with the processed content.
 */
export async function _internalProcessReportData(data: { reportType: string; data: any[] }): Promise<any> {
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
    const eventTypes = new Set(data.data.map((e: any) => e.eventType));
    
    const summary = `This report summarizes ${eventCount} traceability events. The primary activities logged include: ${[...eventTypes].join(", ")}.`;
    
    const key_findings = [
      `A total of ${eventCount} events were logged for this user within the specified period.`,
      `The most common event type was ${(data.data.reduce((acc: any, e: any) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {}) as Record<string, number>)}`,
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
