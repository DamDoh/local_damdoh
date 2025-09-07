
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CooperativeDashboardData } from "@/lib/types";

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


export const getCooperativeDashboardData = functions.https.onCall(
  async (data, context): Promise<CooperativeDashboardData> => {
    const cooperativeId = checkAuth(context);
    
    try {
        const coopDoc = await db.collection('users').doc(cooperativeId).get();
        if (!coopDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Cooperative profile not found.');
        }

        const coopData = coopDoc.data();
        const groupId = coopData?.profileData?.groupId;
        let memberCount = 0;
        let memberIds: string[] = [];

        if (groupId) {
             const groupDoc = await db.collection('groups').doc(groupId).get();
             if (groupDoc.exists) {
                 memberCount = groupDoc.data()?.memberCount || 0;
                 const membersSnapshot = await db.collection(`groups/${groupId}/members`).get();
                 memberIds = membersSnapshot.docs.map(doc => doc.id);
             }
        }
        
        let totalLandArea = 0;
        let aggregatedProduce: CooperativeDashboardData['aggregatedProduce'] = [];
        
        if (memberIds.length > 0) {
            // Firestore 'in' query is limited to 30 items per query.
            // Chunk the memberIds array to handle more than 30 members.
            const memberChunks: string[][] = [];
            for (let i = 0; i < memberIds.length; i += 30) {
                memberChunks.push(memberIds.slice(i, i + 30));
            }
            
            const farmPromises = memberChunks.map(chunk => 
                db.collection('farms').where('ownerId', 'in', chunk).get()
            );

            const cropPromises = memberChunks.map(chunk =>
                db.collection('crops')
                  .where('ownerId', 'in', chunk)
                  .where('currentStage', 'in', ['Harvesting', 'Post-Harvest'])
                  .orderBy('harvestDate', 'desc')
                  .limit(10) // Limit per chunk for performance
                  .get()
            );

            const farmSnapshots = await Promise.all(farmPromises);
            farmSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const sizeString = doc.data().size || '0';
                    const sizeValue = parseFloat(sizeString.split(' ')[0]) || 0;
                    totalLandArea += sizeValue;
                });
            });

            const cropSnapshots = await Promise.all(cropPromises);
            cropSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const cropData = doc.data();
                    aggregatedProduce.push({
                        id: doc.id,
                        productName: cropData.cropType || 'Unknown Produce',
                        quantity: parseFloat(cropData.expectedYield?.split(' ')[0] || '0'), 
                        quality: 'Grade A', // Placeholder as it's not on the crop model
                        readyBy: (cropData.harvestDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
                    });
                });
            });
            // Sort and limit final aggregated produce
            aggregatedProduce.sort((a, b) => new Date(b.readyBy).getTime() - new Date(a.readyBy).getTime()).slice(0, 10);
        }


        const pendingMemberApplications = 3; // This remains mocked

        return {
            memberCount,
            totalLandArea,
            aggregatedProduce,
            pendingMemberApplications,
            groupId: groupId || null,
        };

    } catch (error) {
        console.error("Error fetching cooperative dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch dashboard data.");
    }
  }
);
