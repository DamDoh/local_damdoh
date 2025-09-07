
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { InsuranceProviderDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getInsuranceProviderDashboardData = functions.https.onCall(
  async (data, context): Promise<InsuranceProviderDashboardData> => {
    checkAuth(context);

    try {
        const claimsSnapshot = await db.collection('insurance_applications')
            .where('status', 'in', ['Submitted', 'Under Review'])
            // Ideally, we'd also filter by providerId if that field existed
            .limit(10)
            .get();
        
        const pendingClaims = claimsSnapshot.docs.map(doc => {
            const claim = doc.data();
            return {
                id: doc.id,
                policyHolderName: claim.applicantName || 'Unknown Farmer', // Placeholder
                policyType: 'Crop', // Placeholder
                claimDate: (claim.submittedAt as admin.firestore.Timestamp).toDate().toISOString(),
                status: claim.status,
                actionLink: '#'
            }
        });

        return {
            pendingClaims,
            // These remain mocked as their data sources are complex
            riskAssessmentAlerts: [
                { id: 'risk1', policyHolderName: 'Sunset Farms', alert: 'High flood risk predicted for next month.', severity: 'High', actionLink: '#' }
            ],
            activePolicies: [
                { id: 'pol1', policyHolderName: 'Green Valley Farms', policyType: 'Multi-peril Crop', coverageAmount: 50000, expiryDate: new Date().toISOString() }
            ]
        };
    } catch (error) {
        console.error("Error fetching insurance provider dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);
