

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    RegulatorDashboardData
} from "@/lib/types";

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "error.unauthenticated",
    );
  }
  return context.auth.uid;
};

// =================================================================
// DASHBOARDS WITH PARTIAL OR MOCK DATA
// =================================================================

export const getRegulatorDashboardData = functions.https.onCall(
  async (data, context): Promise<RegulatorDashboardData> => {
    checkAuth(context);

    try {
        const anomaliesPromise = db.collection('traceability_events')
            .where('payload.isAnomaly', '==', true)
            .limit(5)
            .get();

        const [anomaliesSnapshot] = await Promise.all([anomaliesPromise]);
        
        const supplyChainAnomalies = anomaliesSnapshot.docs.map(doc => {
            const event = doc.data();
            return {
                 id: doc.id, 
                 description: event.payload.anomalyDescription || 'Unusual supply chain activity detected.', 
                 level: 'Warning' as 'Critical' | 'Warning', 
                 vtiLink: `/traceability/batches/${event.vtiId}` 
            }
        });

        return {
            // These remain mocked as their data sources are complex
            complianceRiskAlerts: [
                { id: 'alert1', issue: 'Unverified organic inputs detected in VTI log', region: 'Rift Valley', severity: 'High', actionLink: '#' },
            ],
            pendingCertifications: { count: 12, actionLink: '#' },
            supplyChainAnomalies,
        };
    } catch (error) {
        console.error("Error fetching regulator dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);
