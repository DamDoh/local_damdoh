
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CrowdfunderDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getCrowdfunderDashboardData = functions.https.onCall(
  (data, context): CrowdfunderDashboardData => {
    checkAuth(context);
    // This function returns mock data. In a real-world scenario, this would query
    // collections like 'investments' and 'projects', filtered by the user's ID.
    return {
        portfolioOverview: { totalInvested: 75000, numberOfInvestments: 8, estimatedReturns: 95000 },
        suggestedOpportunities: [
            { id: 'opp1', projectName: 'Women-Led Shea Butter Processing Unit', category: 'Value Addition', fundingGoal: 50000, amountRaised: 35000, actionLink: '#' }
        ],
        recentTransactions: [
            { id: 'tx1', projectName: 'Rift Valley Growers Co-op', type: 'Investment', amount: 5000, date: new Date().toISOString() }
        ]
    };
  }
);
