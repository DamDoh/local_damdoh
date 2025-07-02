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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFarmerDashboardData = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.getFarmerDashboardData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
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
            var _a;
            const cropData = doc.data();
            return {
                id: doc.id,
                name: cropData.cropType || "Unknown Crop",
                stage: cropData.currentStage || "Unknown Stage",
                farmName: "", // This would require another fetch, so I'll mock it for now
                createdAt: ((_a = cropData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? cropData.createdAt.toDate() : new Date(0),
            };
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map((_a) => {
            var { createdAt } = _a, rest = __rest(_a, ["createdAt"]);
            return rest;
        });
        const activeKnfBatches = knfBatchesSnapshot.docs
            .map(doc => {
            var _a;
            const batchData = doc.data();
            return {
                id: doc.id,
                typeName: batchData.typeName,
                status: batchData.status,
                nextStepDate: ((_a = batchData.nextStepDate) === null || _a === void 0 ? void 0 : _a.toDate) ? batchData.nextStepDate.toDate().toISOString() : null,
            };
        })
            .filter(batch => batch.status === 'Fermenting' || batch.status === 'Ready')
            .slice(0, 5);
        const dashboardData = {
            farmCount: farmsSnapshot.size,
            cropCount: cropsSnapshot.size,
            recentCrops: recentCrops,
            knfBatches: activeKnfBatches,
            trustScore: {
                reputation: 85, // Mock data
                certifications: [{ id: "cert1", name: "Organic", issuingBody: "EcoCert" }], // Mock data
            },
            matchedBuyers: [{ id: "buyer1", name: "Fresh Foods Inc.", matchScore: 90, request: "5 tons of maize", contactId: "contact1" }], // Mock data
        };
        return dashboardData;
    }
    catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farmer dashboard data.");
    }
});
//# sourceMappingURL=dashboard_data.js.map