"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWarehouseDashboardData = exports.getProcessingUnitDashboardData = exports.getCrowdfunderDashboardData = exports.getInsuranceProviderDashboardData = exports.getAgroTourismDashboardData = exports.getAgronomistDashboardData = exports.getResearcherDashboardData = exports.getCertificationBodyDashboardData = exports.getQaDashboardData = exports.getRegulatorDashboardData = exports.getPackagingSupplierDashboardData = exports.getEnergyProviderDashboardData = exports.getFieldAgentDashboardData = exports.getInputSupplierDashboardData = exports.getAgroExportDashboardData = exports.getFiDashboardData = exports.getLogisticsDashboardData = exports.getBuyerDashboardData = exports.getFarmerDashboardData = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Generic function to fetch dashboard data from a specified collection.
 * @param {string} collection The name of the Firestore collection to query.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{data: any[]}>} A promise that resolves with the fetched data.
 */
async function getDashboardData(collection, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const snapshot = await db
            .collection(collection)
            .where("userId", "==", context.auth.uid)
            .get();
        const data = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return { data };
    }
    catch (error) {
        console.error(`Error fetching ${collection}:`, error);
        throw new functions.https.HttpsError("internal", `Failed to fetch ${collection}.`);
    }
}
exports.getFarmerDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // Returning mock data to power the new dashboard UI
    const mockData = {
        yieldData: [
            { crop: "Maize", historical: 7.5, predicted: 8.2, unit: "Tons/Ha" },
            { crop: "Soybeans", historical: 3.2, predicted: 3.5, unit: "Tons/Ha" },
            { crop: "Coffee", historical: 1.8, predicted: 2.1, unit: "Tons/Ha" },
            { crop: "Avocado", historical: 15, predicted: 17, unit: "Tons/Ha" },
        ],
        irrigationSchedule: {
            next_run: "Tomorrow, 6 AM",
            duration_minutes: 45,
            recommendation: "Soil moisture is low. Early morning is ideal to reduce evaporation.",
        },
        matchedBuyers: [
            {
                id: "buyer1",
                name: "Global Grain Traders",
                matchScore: 92,
                request: "Seeking 500 tons of non-GMO maize",
                contactId: "globalGrain",
            },
            {
                id: "buyer2",
                name: "Artisan Coffee Roasters",
                matchScore: 85,
                request: "Looking for single-origin specialty coffee beans",
                contactId: "artisanCoffee",
            },
        ],
        trustScore: {
            reputation: 88,
            certifications: [
                { id: "cert1", name: "GlobalG.A.P.", issuingBody: "SGS" },
                { id: "cert2", name: "Organic Certified", issuingBody: "EcoCert" },
            ],
        },
    };
    return mockData;
});
exports.getBuyerDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("buyer-dashboard", context);
});
exports.getLogisticsDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("logistics-dashboard", context);
});
exports.getFiDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("fi-dashboard", context);
});
exports.getAgroExportDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-export-dashboard", context);
});
exports.getInputSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("input-supplier-dashboard", context);
});
exports.getFieldAgentDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("field-agent-dashboard", context);
});
exports.getEnergyProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("energy-provider-dashboard", context);
});
exports.getPackagingSupplierDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("packaging-supplier-dashboard", context);
});
exports.getRegulatorDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("regulator-dashboard", context);
});
exports.getQaDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("qa-dashboard", context);
});
exports.getCertificationBodyDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("certification-body-dashboard", context);
});
exports.getResearcherDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("researcher-dashboard", context);
});
exports.getAgronomistDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
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
        const [assignedFarmersSnapshot, consultationRequestsSnapshot, knowledgeBaseSnapshot,] = await Promise.all([
            assignedFarmersPromise,
            consultationRequestsPromise,
            knowledgeBasePromise,
        ]);
        const assignedFarmersOverview = assignedFarmersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        const pendingConsultationRequests = consultationRequestsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        const knowledgeBaseContributions = knowledgeBaseSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            assignedFarmersOverview,
            pendingConsultationRequests,
            knowledgeBaseContributions,
        };
    }
    catch (error) {
        console.error("Error fetching Agronomist dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch Agronomist dashboard data.");
    }
});
exports.getAgroTourismDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("agro-tourism-dashboard", context);
});
exports.getInsuranceProviderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("insurance-provider-dashboard", context);
});
exports.getCrowdfunderDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("crowdfunder-dashboard", context);
});
exports.getProcessingUnitDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("processing-unit-dashboard", context);
});
exports.getWarehouseDashboardData = functions.https.onCall(async (data, context) => {
    return await getDashboardData("warehouse-dashboard", context);
});
//# sourceMappingURL=dashboard_data.js.map