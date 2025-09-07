

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { 
    AdminDashboardData,
    AdminActivity,
    FarmerDashboardData,
    CooperativeDashboardData,
    BuyerDashboardData,
    RegulatorDashboardData,
    LogisticsDashboardData,
    FieldAgentDashboardData,
    InputSupplierDashboardData,
    AgroExportDashboardData,
    ProcessingUnitDashboardData,
    WarehouseDashboardData,
    QaDashboardData,
    CertificationBodyDashboardData,
    ResearcherDashboardData,
    AgronomistDashboardData,
    AgroTourismDashboardData,
    InsuranceProviderDashboardData,
    EnergyProviderDashboardData,
    CrowdfunderDashboardData,
    EquipmentSupplierDashboardData,
    WasteManagementDashboardData,
    PackagingSupplierDashboardData,
    FinancialApplication,
    AgriTechInnovatorDashboardData,
    FarmerDashboardAlert,
    OperationsDashboardData,
    FinancialProduct,
    KnfBatch
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
// LIVE DATA DASHBOARDS
// =================================================================

export const getFarmerDashboardData = functions.https.onCall(
  async (data, context): Promise<FarmerDashboardData> => {
    const farmerId = checkAuth(context);
    try {
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).get();
        const cropsPromise = db.collection('crops').where('ownerId', '==', farmerId).orderBy('plantingDate', 'desc').get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).orderBy('createdAt', 'desc').get();
        const financialsPromise = db.collection('financial_transactions').where('userRef', '==', db.collection('users').doc(farmerId)).get();


        const [farmsSnapshot, cropsSnapshot, knfBatchesSnapshot, financialsSnapshot] = await Promise.all([
            farmsPromise,
            cropsPromise,
            knfBatchesPromise,
            financialsPromise,
        ]);
        
        // --- Alerts Logic ---
        const alerts: FarmerDashboardAlert[] = [];
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        knfBatchesSnapshot.docs.forEach(doc => {
            const batch = doc.data();
            if (batch.status === 'Fermenting' && batch.nextStepDate && batch.nextStepDate.toDate() <= now) {
                alerts.push({
                    id: `knf-${doc.id}`,
                    icon: 'FlaskConical',
                    type: 'info',
                    message: `Your ${batch.typeName} batch is ready for its next step.`,
                    link: '/farm-management/knf-inputs'
                });
            }
        });

        cropsSnapshot.docs.forEach(doc => {
            const crop = doc.data();
            if (crop.harvestDate && crop.harvestDate.toDate() <= sevenDaysFromNow && crop.harvestDate.toDate() >= now) {
                 alerts.push({
                    id: `crop-${doc.id}`,
                    icon: 'Sprout',
                    type: 'warning',
                    message: `Your ${crop.cropType} crop is due for harvest soon.`,
                    link: `/farm-management/farms/${crop.farmId}`
                });
            }
        });


        const farmsMap = new Map(farmsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

        const recentCrops = cropsSnapshot.docs.slice(0, 5).map(doc => {
            const cropData = doc.data();
            return {
                id: doc.id,
                name: cropData.cropType || "Unknown Crop",
                stage: cropData.currentStage || 'Unknown',
                farmName: farmsMap.get(cropData.farmId) || 'Unknown Farm',
                farmId: cropData.farmId,
                plantingDate: (cropData.plantingDate as admin.firestore.Timestamp)?.toDate?.().toISOString() || null,
            };
        });

        const activeKnfBatches: KnfBatch[] = knfBatchesSnapshot.docs
            .filter(doc => ['Fermenting', 'Ready'].includes(doc.data().status))
            .slice(0, 5)
            .map(doc => {
                const batchData = doc.data();
                return {
                    id: doc.id,
                    userId: batchData.userId,
                    type: batchData.type,
                    typeName: batchData.typeName,
                    ingredients: batchData.ingredients,
                    startDate: (batchData.startDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                    nextStepDate: (batchData.nextStepDate as admin.firestore.Timestamp)?.toDate?.().toISOString(),
                    status: batchData.status,
                    nextStep: batchData.nextStep,
                    quantityProduced: batchData.quantityProduced,
                    unit: batchData.unit,
                };
            });

        let totalIncome = 0;
        let totalExpense = 0;
        financialsSnapshot.forEach(doc => {
            const tx = doc.data();
            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else if (tx.type === 'expense') {
                totalExpense += tx.amount;
            }
        });
        
        const financialSummary = {
            totalIncome,
            totalExpense,
            netFlow: totalIncome - totalExpense,
        };
        
        const certsSnapshot = await db.collection('users').doc(farmerId).collection('certifications').get();
        const certifications = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FarmerDashboardData['certifications'];


        return {
            farmCount: farmsSnapshot.size,
            cropCount: cropsSnapshot.size,
            recentCrops: recentCrops, 
            knfBatches: activeKnfBatches,
            financialSummary: financialSummary,
            alerts: alerts,
            certifications: certifications,
        };

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);

// =================================================================
// DASHBOARDS WITH PARTIAL OR MOCK DATA
// =================================================================


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
