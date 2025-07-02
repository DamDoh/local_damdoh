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
exports.updateKnfBatchStatus = exports.getUserKnfBatches = exports.createKnfBatch = exports.getProfitabilityInsights = exports.getFarmCrops = exports.createCrop = exports.getFarm = exports.getUserFarms = exports.createFarm = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const traceability_1 = require("./traceability");
const db = admin.firestore();
/**
 * Creates a new farm document in Firestore for an authenticated user.
 * @param {any} data The data for the new farm.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, farmId: string}>} A promise that resolves with the new farm ID.
 */
exports.createFarm = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { name, location, size, farmType, irrigationMethods, description } = data;
    if (!name || !location || !size || !farmType) {
        throw new functions.https.HttpsError("invalid-argument", "Name, location, size, and farm type are required.");
    }
    try {
        const newFarmRef = db.collection("farms").doc();
        await newFarmRef.set({
            ownerId: context.auth.uid,
            name,
            location,
            size,
            farmType: farmType,
            irrigationMethods: irrigationMethods || "",
            description: description || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, farmId: newFarmRef.id };
    }
    catch (error) {
        console.error("Error creating farm:", error);
        throw new functions.https.HttpsError("internal", "Failed to create farm in the database. Please check your project's Firestore setup.", { originalError: error.message });
    }
});
/**
 * Fetches all farms belonging to the currently authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the user's farms.
 */
exports.getUserFarms = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    try {
        const farmsSnapshot = await db
            .collection("farms")
            .where("ownerId", "==", context.auth.uid)
            .get();
        const farms = farmsSnapshot.docs.map((doc) => {
            var _a, _b;
            const docData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, docData), { createdAt: ((_a = docData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? docData.createdAt.toDate().toISOString() : null, updatedAt: ((_b = docData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? docData.updatedAt.toDate().toISOString() : null });
        });
        return farms;
    }
    catch (error) {
        console.error("Error fetching user farms:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch farms.");
    }
});
/**
 * Fetches a single farm's details.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the farm's details.
 */
exports.getFarm = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmId must be provided.");
    }
    try {
        const farmDoc = await db.collection('farms').doc(farmId).get();
        if (!farmDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Farm not found.");
        }
        const farmData = farmDoc.data();
        // Security check: ensure the authenticated user owns this farm
        if (farmData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to view this farm.");
        }
        return Object.assign(Object.assign({}, farmData), { id: farmDoc.id, createdAt: ((_a = farmData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? farmData.createdAt.toDate().toISOString() : null, updatedAt: ((_b = farmData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? farmData.updatedAt.toDate().toISOString() : null });
    }
    catch (error) {
        console.error("Error fetching farm:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch farm details.");
    }
});
/**
 * Creates a new crop document associated with a farm.
 * After creating the crop, it also logs a 'PLANTED' traceability event.
 * @param {any} data The data for the new crop.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, cropId: string}>} A promise that resolves with the new crop ID.
 */
exports.createCrop = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { farmId, cropType, plantingDate, harvestDate, expectedYield, currentStage, notes, } = data;
    if (!farmId || !cropType || !plantingDate) {
        throw new functions.https.HttpsError("invalid-argument", "Farm ID, crop type, and planting date are required.");
    }
    // Security Check: Verify owner
    const farmRef = db.collection("farms").doc(farmId);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || ((_a = farmDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to add a crop to this farm.");
    }
    try {
        const newCropRef = db.collection("crops").doc();
        const plantingDateTimestamp = admin.firestore.Timestamp.fromDate(new Date(plantingDate));
        await newCropRef.set({
            farmId,
            ownerId: context.auth.uid,
            cropType,
            plantingDate: plantingDateTimestamp,
            harvestDate: harvestDate ?
                admin.firestore.Timestamp.fromDate(new Date(harvestDate)) :
                null,
            expectedYield: expectedYield || "",
            currentStage: currentStage || null,
            notes: notes || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Synergy: Log a PLANTED traceability event for this new crop
        const eventPayload = {
            cropType: cropType,
            plantingDate: plantingDateTimestamp,
            farmFieldId: newCropRef.id,
            notes: "Initial crop creation",
        };
        await (0, traceability_1._internalLogTraceEvent)({
            vtiId: newCropRef.id,
            eventType: "PLANTED",
            actorRef: context.auth.uid,
            geoLocation: null, // Can be added later
            payload: eventPayload,
            farmFieldId: newCropRef.id,
        }, context);
        return { success: true, cropId: newCropRef.id };
    }
    catch (error) {
        console.error("Error creating crop:", error);
        throw new functions.https.HttpsError("internal", "Failed to create crop in the database. Please check your project's Firestore setup.", { originalError: error.message });
    }
});
/**
 * Fetches all crops associated with a specific farm.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the farm's crops.
 */
exports.getFarmCrops = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmId must be provided.");
    }
    // Security Check: Verify owner
    const farmRef = db.collection("farms").doc(farmId);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || ((_a = farmDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to view crops for this farm.");
    }
    try {
        const cropsSnapshot = await db.collection('crops').where('farmId', '==', farmId).get();
        const crops = cropsSnapshot.docs.map(doc => {
            var _a, _b, _c;
            const docData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, docData), { plantingDate: ((_a = docData.plantingDate) === null || _a === void 0 ? void 0 : _a.toDate) ? docData.plantingDate.toDate().toISOString() : null, harvestDate: ((_b = docData.harvestDate) === null || _b === void 0 ? void 0 : _b.toDate) ? docData.harvestDate.toDate().toISOString() : null, createdAt: ((_c = docData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate) ? docData.createdAt.toDate().toISOString() : null });
        });
        return crops;
    }
    catch (error) {
        console.error("Error fetching farm crops:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch crops.");
    }
});
/**
 * Cloud Function to analyze a farmer's data and provide profitability insights.
 * This enhanced version conceptually uses detailed financial and activity data.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, insights: any[]}>} A promise that resolves with profitability insights.
 */
exports.getProfitabilityInsights = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    try {
        // --- This function would perform more complex data aggregation and analysis ---
        // 1. Fetch all financial records for the user (`farm_financials`).
        // 2. Fetch all farm activity logs (`traceability_events`).
        // 3. Correlate income from sales with specific `HARVESTING` events to determine revenue per crop/field.
        // 4. Correlate expenses for inputs with `INPUT_APPLICATION` events to determine cost per crop/field.
        // 5. Calculate net profit per crop/field.
        // 6. Run logic/AI model to identify key insights from this data.
        // --- We will return more detailed mock data that simulates this deeper analysis ---
        const mockInsights = [
            {
                id: "insight1",
                type: "profitability",
                title: "Maize in Field A is a High Performer",
                details: "Analysis shows a 35% higher net margin for your Maize crop compared to your farm average this season. Revenue was high and input costs were moderate.",
                recommendation: "Consider allocating more of Field C to Maize next season for potentially higher returns. View full breakdown.",
            },
            {
                id: "insight2",
                type: "expense_optimization",
                title: "Opportunity to Optimize Fertilizer Costs",
                details: "Your spending on 'Organic NPK Fertilizer' accounted for 60% of input costs for your Rice crop in Field B.",
                recommendation: "A soil test for Field B could help tailor fertilizer application, potentially reducing costs without impacting yield.",
            },
            {
                id: "insight3",
                type: "technique_correlation",
                title: "Early Planting Shows Positive Results",
                details: "Your early planting date for Tomatoes in Field C correlated with a 15% higher yield compared to regional averages for later plantings.",
                recommendation: "Continue with this successful early planting strategy for tomatoes next season.",
            },
        ];
        return { success: true, insights: mockInsights };
    }
    catch (error) {
        console.error("Error generating profitability insights:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate insights.");
    }
});
/**
 * Calculates the next step date for a KNF batch.
 * @param {string} type The type of KNF batch.
 * @param {Date} startDate The start date of the batch.
 * @return {{nextStep: string, nextStepDate: Date}} The next step and date.
 */
const getNextStepDate = (type, startDate) => {
    let daysToAdd = 7;
    let stepDescription = "Ready for Straining";
    switch (type) {
        case "fpj":
            daysToAdd = 7;
            stepDescription = "Ready for Straining";
            break;
        case "faa":
            daysToAdd = 90;
            stepDescription = "Ready for Straining (Approx. 3 months)";
            break;
        case "wca":
            daysToAdd = 14;
            stepDescription = "Ready (bubbling should stop)";
            break;
        case "imo":
            daysToAdd = 5;
            stepDescription = "Ready for IMO2 processing";
            break;
        case "lab":
            daysToAdd = 7;
            stepDescription = "Ready for milk cultivation";
            break;
    }
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + daysToAdd);
    return { nextStep: stepDescription, nextStepDate: nextDate };
};
/**
 * Creates a new KNF batch document in Firestore for an authenticated user.
 * @param {any} data The data for the new batch.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, batchId: string}>} A promise that resolves with the new batch ID.
 */
exports.createKnfBatch = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { type, typeName, ingredients, startDate } = data;
    if (!type || !typeName || !ingredients || !startDate) {
        throw new functions.https.HttpsError("invalid-argument", "Type, typeName, ingredients, and startDate are required.");
    }
    const userId = context.auth.uid;
    const startDateObj = new Date(startDate);
    const { nextStep, nextStepDate } = getNextStepDate(type, startDateObj);
    try {
        const newBatchRef = db.collection("knf_batches").doc();
        const batchData = {
            userId: userId,
            type: type,
            typeName: typeName,
            ingredients: ingredients,
            startDate: admin.firestore.Timestamp.fromDate(startDateObj),
            status: "Fermenting",
            nextStep: nextStep,
            nextStepDate: admin.firestore.Timestamp.fromDate(nextStepDate),
        };
        await newBatchRef.set(Object.assign(Object.assign({}, batchData), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        return { success: true, batchId: newBatchRef.id };
    }
    catch (error) {
        console.error("Error creating KNF batch:", error);
        throw new functions.https.HttpsError("internal", "Failed to create KNF batch in the database.", { originalError: error.message });
    }
});
/**
 * Fetches all KNF batches belonging to the currently authenticated user.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any[]>} A promise that resolves with the user's KNF batches.
 */
exports.getUserKnfBatches = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    try {
        const batchesSnapshot = await db
            .collection("knf_batches")
            .where("userId", "==", context.auth.uid)
            .orderBy("createdAt", "desc")
            .get();
        const batches = batchesSnapshot.docs.map((doc) => {
            var _a, _b, _c;
            const docData = doc.data();
            return Object.assign(Object.assign({}, docData), { id: doc.id, startDate: ((_a = docData.startDate) === null || _a === void 0 ? void 0 : _a.toDate) ? docData.startDate.toDate().toISOString() : null, nextStepDate: ((_b = docData.nextStepDate) === null || _b === void 0 ? void 0 : _b.toDate) ? docData.nextStepDate.toDate().toISOString() : null, createdAt: ((_c = docData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate) ? docData.createdAt.toDate().toISOString() : null });
        });
        return batches;
    }
    catch (error) {
        console.error("Error fetching user KNF batches:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch KNF batches.");
    }
});
/**
 * Updates the status of a KNF batch.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves when the batch is updated.
 */
exports.updateKnfBatchStatus = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { batchId, status } = data;
    if (!batchId || !status) {
        throw new functions.https.HttpsError("invalid-argument", "batchId and status are required.");
    }
    const validStatuses = ["Fermenting", "Ready", "Used", "Archived"];
    if (!validStatuses.includes(status)) {
        throw new functions.https.HttpsError("invalid-argument", `Invalid status provided. Must be one of: ${validStatuses.join(", ")}`);
    }
    const userId = context.auth.uid;
    const batchRef = db.collection("knf_batches").doc(batchId);
    try {
        const batchDoc = await batchRef.get();
        if (!batchDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Batch not found.");
        }
        if (((_a = batchDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to update this batch.");
        }
        await batchRef.update({ status: status });
        return { success: true, message: `Batch ${batchId} status updated to ${status}.` };
    }
    catch (error) {
        console.error(`Error updating KNF batch ${batchId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to update KNF batch status.", { originalError: error.message });
    }
});
//# sourceMappingURL=farm-management.js.map