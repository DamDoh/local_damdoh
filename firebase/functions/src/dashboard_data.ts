
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {FarmerDashboardData} from "./types";

const db = admin.firestore();

/**
 * Generic function to fetch dashboard data from a specified collection.
 * @param {string} collection The name of the Firestore collection to query.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{data: any[]}>} A promise that resolves with the fetched data.
 */
async function getDashboardData(
  collection: string,
  context: functions.https.CallableContext,
) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  try {
    const snapshot = await db
      .collection(collection)
      .where("userId", "==", context.auth.uid)
      .get();
    const data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return {data};
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to fetch ${collection}.`,
    );
  }
}

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
        // Fetch farms, recent crops, and KNF batches concurrently
        const farmsPromise = db.collection('farms').where('ownerId', '==', farmerId).limit(5).get();
        const recentCropsPromise = db.collection('crops').where('ownerId', '==', farmerId).orderBy('createdAt', 'desc').limit(5).get();
        const knfBatchesPromise = db.collection('knf_batches').where('userId', '==', farmerId).where('status', 'in', ['Fermenting', 'Ready']).limit(5).get();

        const [farmsSnapshot, recentCropsSnapshot, knfBatchesSnapshot] = await Promise.all([
            farmsPromise,
            recentCropsPromise,
            knfBatchesPromise,
        ]);

        const farms = farmsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const recentCrops = recentCropsSnapshot.docs.map(doc => {
            const cropData = doc.data();
            return {
                id: doc.id,
                ...cropData,
                plantingDate: cropData.plantingDate?.toDate ? cropData.plantingDate.toDate().toISOString() : null,
            };
        });
        
        const knfBatches = knfBatchesSnapshot.docs.map(doc => {
            const batchData = doc.data();
            return {
                id: doc.id,
                ...batchData,
                nextStepDate: batchData.nextStepDate?.toDate ? batchData.nextStepDate.toDate().toISOString() : null,
            };
        });

        return {
            farmCount: farms.length,
            cropCount: recentCrops.length, 
            recentCrops: recentCrops,
            knfBatches: knfBatches,
        };

    } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
  },
);


export const getBuyerDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("buyer-dashboard", context);
  },
);

export const getLogisticsDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("logistics-dashboard", context);
  },
);

export const getFiDashboardData = functions.https.onCall(async (data, context) => {
  return await getDashboardData("fi-dashboard", context);
});

export const getAgroExportDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("agro-export-dashboard", context);
  },
);

export const getInputSupplierDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("input-supplier-dashboard", context);
  },
);

export const getFieldAgentDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("field-agent-dashboard", context);
  },
);

export const getEnergyProviderDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("energy-provider-dashboard", context);
  },
);

export const getPackagingSupplierDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("packaging-supplier-dashboard", context);
  },
);

export const getRegulatorDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("regulator-dashboard", context);
  },
);

export const getQaDashboardData = functions.https.onCall(async (data, context) => {
  return await getDashboardData("qa-dashboard", context);
});

export const getCertificationBodyDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("certification-body-dashboard", context);
  },
);

export const getResearcherDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("researcher-dashboard", context);
  },
);

export const getAgronomistDashboardData = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    try {
      const agronomistId = context.auth.uid;

      const assignedFarmersPromise = db
        .collection("farmers")
        .where("assignedAgronomist", "==", agronomistId)
        .get();
      const consultationRequestsPromise = db
        .collection("consultationRequests")
        .where("agronomistId", "==", agronomistId)
        .where("status", "==", "pending")
        .get();
      const knowledgeBasePromise = db
        .collection("knowledgeBase")
        .where("authorId", "==", agronomistId)
        .get();

      const [
        assignedFarmersSnapshot,
        consultationRequestsSnapshot,
        knowledgeBaseSnapshot,
      ] = await Promise.all([
        assignedFarmersPromise,
        consultationRequestsPromise,
        knowledgeBasePromise,
      ]);

      const assignedFarmersOverview = assignedFarmersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const pendingConsultationRequests = consultationRequestsSnapshot.docs.map(
        (doc) => ({id: doc.id, ...doc.data()}),
      );
      const knowledgeBaseContributions = knowledgeBaseSnapshot.docs.map(
        (doc) => ({id: doc.id, ...doc.data()}),
      );

      return {
        assignedFarmersOverview,
        pendingConsultationRequests,
        knowledgeBaseContributions,
      };
    } catch (error) {
      console.error("Error fetching Agronomist dashboard data:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch Agronomist dashboard data.",
      );
    }
  },
);

export const getAgroTourismDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("agro-tourism-dashboard", context);
  },
);

export const getInsuranceProviderDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("insurance-provider-dashboard", context);
  },
);

export const getCrowdfunderDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("crowdfunder-dashboard", context);
  },
);

export const getProcessingUnitDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("processing-unit-dashboard", context);
  },
);

export const getWarehouseDashboardData = functions.https.onCall(
  async (data, context) => {
    return await getDashboardData("warehouse-dashboard", context);
  },
);
