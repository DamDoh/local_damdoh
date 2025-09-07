
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { AgriTechInnovatorDashboardData, ApiKey } from "@/lib/types";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const getAgriTechInnovatorDashboardData = functions.https.onCall(
  async (data, context): Promise<AgriTechInnovatorDashboardData> => {
    const innovatorId = checkAuth(context);
    
    const keysSnapshot = await db.collection('users').doc(innovatorId).collection('api_keys')
        .orderBy('createdAt', 'desc')
        .get();

    const apiKeys: ApiKey[] = keysSnapshot.docs.map(doc => {
        const keyData = doc.data();
        return {
            id: doc.id,
            description: keyData.description,
            environment: keyData.environment,
            status: keyData.status,
            keyPrefix: keyData.keyPrefix, 
            createdAt: (keyData.createdAt as admin.firestore.Timestamp).toDate().toISOString(),
            key: `${keyData.keyPrefix}...${keyData.lastFour}` 
        };
    });

    // In a real app, this data would be pulled from system monitoring tools.
    return {
      apiKeys: apiKeys,
      sandboxStatus: {
        status: 'Operational',
        lastReset: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      integrationProjects: [
        { id: 'proj1', title: 'Real-time Cold Chain Monitoring with CoolTech', status: 'Live', partner: 'CoolTech Solutions', actionLink: '#' },
        { id: 'proj2', title: 'Drone-based Crop Scouting API Integration', status: 'In Development', partner: 'SkyAgroScout', actionLink: '#' },
      ],
    };
  }
);
