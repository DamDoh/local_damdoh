
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

async function getDashboardData(collection: string, context: functions.https.CallableContext) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const snapshot = await db.collection(collection).where("userId", "==", context.auth.uid).get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { data };
    } catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        throw new functions.https.HttpsError("internal", `Failed to fetch ${collection}.`);
    }
}

export const getFarmerDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("farmer-dashboard", context);
});

export const getBuyerDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("buyer-dashboard", context);
});

export const getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("logistics-dashboard", context);
});

export const getFiDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("fi-dashboard", context);
});

export const getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-export-dashboard", context);
});

export const getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("input-supplier-dashboard", context);
});

export const getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("field-agent-dashboard", context);
});

export const getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("energy-provider-dashboard", context);
});

export const getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("packaging-supplier-dashboard", context);
});

export const getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("regulator-dashboard", context);
});

export const getQaDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("qa-dashboard", context);
});

export const getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("certification-body-dashboard", context);
});

export const getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("researcher-dashboard", context);
});

export const getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    try {
        const agronomistId = context.auth.uid;

        const assignedFarmersPromise = db.collection('farmers').where('assignedAgronomist', '==', agronomistId).get();
        const consultationRequestsPromise = db.collection('consultationRequests').where('agronomistId', '==', agronomistId).where('status', '==', 'pending').get();
        const knowledgeBasePromise = db.collection('knowledgeBase').where('authorId', '==', agronomistId).get();

        const [assignedFarmersSnapshot, consultationRequestsSnapshot, knowledgeBaseSnapshot] = await Promise.all([
            assignedFarmersPromise,
            consultationRequestsPromise,
            knowledgeBasePromise,
        ]);

        const assignedFarmersOverview = assignedFarmersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingConsultationRequests = consultationRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const knowledgeBaseContributions = knowledgeBaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeBaseContributions,
        };

    } catch (error) {
        console.error("Error fetching Agronomist dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch Agronomist dashboard data.");
    }
});


export const getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-tourism-dashboard", context);
});

export const getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("insurance-provider-dashboard", context);
});

export const getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("crowdfunder-dashboard", context);
});

export const getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("processing-unit-dashboard", context);
});

export const getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("warehouse-dashboard", context);
});
