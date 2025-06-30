
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FarmerDashboardData } from "./types";

const db = admin.firestore();

export const getFarmerDashboardData = functions.https.onCall(
  async (data, context): Promise<FarmerDashboardData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    
    const farmerId = context.auth.uid;

    try {
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).get();
        const cropsPromise = db.collection('crops').where('ownerId', '==', farmerId).get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).get();

        const [farmsSnapshot, cropsSnapshot, knfBatchesSnapshot] = await Promise.all([
            farmsPromise,
            cropsPromise,
            knfBatchesPromise,
        ]);

        const recentCrops = cropsSnapshot.docs
            .map(doc => {
                const cropData = doc.data();
                return {
                    id: doc.id,
                    name: cropData.cropType || "Unknown Crop",
                    stage: cropData.currentStage || "Unknown Stage",
                    farmName: "", // This would require another fetch, so I'll mock it for now
                    createdAt: (cropData.createdAt as admin.firestore.Timestamp)?.toDate ? (cropData.createdAt as admin.firestore.Timestamp).toDate() : new Date(0),
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(({ createdAt, ...rest }) => rest);

        const activeKnfBatches = knfBatchesSnapshot.docs
            .map(doc => {
                const batchData = doc.data();
                return {
                    id: doc.id,
                    typeName: batchData.typeName,
                    status: batchData.status,
                    nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate ? (batchData.nextStepDate as admin.firestore.Timestamp).toDate().toISOString() : null,
                };
            })
            .filter(batch => batch.status === 'Fermenting' || batch.status === 'Ready')
            .slice(0, 5);


        const dashboardData: FarmerDashboardData = {
            farmCount: farmsSnapshot.size,
            cropCount: cropsSnapshot.size, 
            recentCrops: recentCrops as any, 
            knfBatches: activeKnfBatches as any,
            trustScore: {
                reputation: 85, // Mock data
                certifications: [{id: "cert1", name: "Organic", issuingBody: "EcoCert"}], // Mock data
            },
            matchedBuyers: [{id: "buyer1", name: "Fresh Foods Inc.", matchScore: 90, request: "5 tons of maize", contactId: "contact1"}], // Mock data
        };

        return dashboardData;

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);
