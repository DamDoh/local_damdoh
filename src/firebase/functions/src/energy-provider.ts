
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { EnergyProviderDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getEnergyProviderDashboardData = functions.https.onCall(
  (data, context): EnergyProviderDashboardData => {
    checkAuth(context);
    // This function returns mock data. In a real-world scenario, this would query
    // collections like 'projects', 'leads', etc., filtered by the provider's ID.
    return {
        projectLeads: [
            { id: 'lead1', entityName: 'Rift Valley Growers Co-op', location: 'Naivasha', estimatedEnergyNeed: '150kW Solar for Irrigation', status: 'Proposal Sent', actionLink: '#' }
        ],
        activeProjects: [
            { id: 'proj1', projectName: 'Greenhouse Solar Installation', solutionType: 'Solar PV', status: 'In Progress', completionDate: new Date().toISOString() }
        ],
        impactMetrics: { totalInstallations: 45, totalEstimatedCarbonReduction: '1,200 tCO2e/year' }
    };
  }
);
