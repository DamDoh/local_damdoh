
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { AgronomistDashboardData } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getAgronomistDashboardData = functions.https.onCall(
  async (data, context): Promise<AgronomistDashboardData> => {
    const userId = checkAuth(context);
    try {
        // Fetch knowledge hub contributions made by this user
        const articlesSnapshot = await db.collection('knowledge_articles')
            .where('authorId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const knowledgeHubContributions = articlesSnapshot.docs.map(doc => {
            const article = doc.data();
            return {
                id: doc.id,
                title: article.title_en || article.title_km || "Untitled Article",
                status: 'Published' as const, // Placeholder status
            };
        });

        // Mock data for other sections
        const assignedFarmersOverview = [
            { id: 'farmer1', name: 'John Doe', farmLocation: 'Nakuru', lastConsultation: new Date(Date.now() - 86400000 * 7).toISOString(), alerts: 1 }
        ];
        const pendingConsultationRequests = [
            { id: 'req1', farmerName: 'Jane Smith', issueSummary: 'Yellowing leaves on tomato plants.', requestDate: new Date().toISOString(), farmerId: 'farmer1' }
        ];

        return {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeHubContributions,
        };
    } catch (error) {
        console.error("Error fetching agronomist dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);
