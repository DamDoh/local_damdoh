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
exports.updateKnfBatchStatus = exports.getUserKnfBatches = exports.createKnfBatch = exports.getProfitabilityInsights = exports.getCrop = exports.getFarmCrops = exports.updateCrop = exports.createCrop = exports.updateFarm = exports.getFarm = exports.getUserFarms = exports.createFarm = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const traceability_1 = require("./traceability");
const schemas_1 = require("@/lib/schemas");
const db = admin.firestore();
/**
 * Creates a new farm document in Firestore for an authenticated user.
 * @param {any} data The data for the new farm.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, farmId: string}>} A promise that resolves with the new farm ID.
 */
exports.createFarm = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    // Validate incoming data using the Zod schema
    const validation = schemas_1.createFarmSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "error.farm.invalidData", validation.error.format());
    }
    const { name, location, size, farmType, irrigationMethods, description } = validation.data;
    try {
        const newFarmRef = db.collection("farms").doc();
        await newFarmRef.set({
            ownerId: context.auth.uid,
            name,
            location,
            size,
            farmType,
            irrigationMethods: irrigationMethods || "",
            description: description || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, farmId: newFarmRef.id };
    }
    catch (error) {
        console.error("Error creating farm:", error);
        throw new functions.https.HttpsError("internal", "error.farm.creationFailed", { originalError: error.message });
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    try {
        const farmsSnapshot = await db
            .collection("farms")
            .where("ownerId", "==", context.auth.uid)
            .get();
        const farms = farmsSnapshot.docs.map((doc) => {
            var _a, _b, _c, _d;
            const docData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, docData), { createdAt: (_b = (_a = docData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), updatedAt: (_d = (_c = docData.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() });
        });
        return farms;
    }
    catch (error) {
        console.error("Error fetching user farms:", error);
        throw new functions.https.HttpsError("internal", "error.farm.fetchFailed");
    }
});
/**
 * Fetches a single farm's details.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<any>} A promise that resolves with the farm's details.
 */
exports.getFarm = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "error.farm.idRequired");
    }
    try {
        const farmDoc = await db.collection('farms').doc(farmId).get();
        if (!farmDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.farm.notFound");
        }
        const farmData = farmDoc.data();
        // Security check: ensure the authenticated user owns this farm
        if (farmData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        return Object.assign(Object.assign({ id: farmDoc.id }, farmData), { createdAt: (_b = (_a = farmData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), updatedAt: (_d = (_c = farmData.updatedAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString() });
    }
    catch (error) {
        console.error("Error fetching farm:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.farm.fetchFailed");
    }
});
/**
 * Updates an existing farm document in Firestore for an authenticated user.
 * @param {any} data The data for updating the farm. Must include farmId.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, farmId: string}>} A promise that resolves with the updated farm ID.
 */
exports.updateFarm = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { farmId } = data, updatePayload = __rest(data, ["farmId"]);
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "farmId is required for updates.");
    }
    const validation = schemas_1.createFarmSchema.partial().safeParse(updatePayload);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "error.farm.invalidData", validation.error.format());
    }
    const farmRef = db.collection("farms").doc(farmId);
    try {
        // Security Check: Verify owner
        const farmDoc = await farmRef.get();
        if (!farmDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.farm.notFound");
        }
        if (((_a = farmDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        await farmRef.update(Object.assign(Object.assign({}, validation.data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        return { success: true, farmId: farmRef.id };
    }
    catch (error) {
        console.error(`Error updating farm ${farmId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.farm.updateFailed", { originalError: error.message });
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    // Validate incoming data
    const validation = schemas_1.createCropSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.invalidData", validation.error.format());
    }
    const { farmId, cropType, plantingDate, harvestDate, expectedYield, currentStage, notes, } = validation.data;
    // Security Check: Verify owner
    const farmRef = db.collection("farms").doc(farmId);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || ((_a = farmDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
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
            plantingDate: plantingDateTimestamp.toDate().toISOString(),
            notes: "Initial crop creation",
        };
        // Log a pre-harvest event against the field/crop plot ID.
        // A VTI is not created at this stage.
        await (0, traceability_1._internalLogTraceEvent)({
            eventType: "PLANTED",
            actorRef: context.auth.uid,
            geoLocation: null, // Can be added later
            payload: eventPayload,
            farmFieldId: newCropRef.id,
        });
        return { success: true, cropId: newCropRef.id };
    }
    catch (error) {
        console.error("Error creating crop:", error);
        throw new functions.https.HttpsError("internal", "error.crop.creationFailed", { originalError: error.message });
    }
});
exports.updateCrop = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { cropId } = data, updateData = __rest(data, ["cropId"]);
    if (!cropId) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.idRequired");
    }
    // Use a partial schema for validation, as not all fields are required for an update
    const validation = schemas_1.createCropSchema.partial().safeParse(updateData);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.invalidData", validation.error.format());
    }
    const cropRef = db.collection('crops').doc(cropId);
    try {
        const cropDoc = await cropRef.get();
        if (!cropDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.crop.notFound");
        }
        if (((_a = cropDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        // Prepare the payload, converting date strings back to Timestamps
        const payload = Object.assign(Object.assign({}, validation.data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        if (validation.data.plantingDate)
            payload.plantingDate = admin.firestore.Timestamp.fromDate(new Date(validation.data.plantingDate));
        if (validation.data.harvestDate)
            payload.harvestDate = admin.firestore.Timestamp.fromDate(new Date(validation.data.harvestDate));
        await cropRef.update(payload);
        return { success: true, message: "Crop updated successfully." };
    }
    catch (error) {
        console.error(`Error updating crop ${cropId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.crop.updateFailed");
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { farmId } = data;
    if (!farmId) {
        throw new functions.https.HttpsError("invalid-argument", "error.farm.idRequired");
    }
    // Security Check: Verify owner
    const farmRef = db.collection("farms").doc(farmId);
    const farmDoc = await farmRef.get();
    if (!farmDoc.exists || ((_a = farmDoc.data()) === null || _a === void 0 ? void 0 : _a.ownerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
    }
    try {
        const cropsSnapshot = await db.collection('crops').where('farmId', '==', farmId).get();
        const crops = cropsSnapshot.docs.map(doc => {
            var _a, _b, _c, _d, _e, _f;
            const docData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, docData), { plantingDate: (_b = (_a = docData.plantingDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), harvestDate: (_d = (_c = docData.harvestDate) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString(), createdAt: (_f = (_e = docData.createdAt) === null || _e === void 0 ? void 0 : _e.toDate) === null || _f === void 0 ? void 0 : _f.call(_e).toISOString() });
        });
        return crops;
    }
    catch (error) {
        console.error("Error fetching farm crops:", error);
        throw new functions.https.HttpsError("internal", "error.crop.fetchFailed");
    }
});
exports.getCrop = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    const { cropId } = data;
    if (!cropId) {
        throw new functions.https.HttpsError("invalid-argument", "error.crop.idRequired");
    }
    try {
        const cropDoc = await db.collection('crops').doc(cropId).get();
        if (!cropDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.crop.notFound");
        }
        const cropData = cropDoc.data();
        if (cropData.ownerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        }
        return Object.assign(Object.assign({ id: cropDoc.id }, cropData), { plantingDate: (_b = (_a = cropData.plantingDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), harvestDate: (_d = (_c = cropData.harvestDate) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString(), createdAt: (_f = (_e = cropData.createdAt) === null || _e === void 0 ? void 0 : _e.toDate) === null || _f === void 0 ? void 0 : _f.call(_e).toISOString() });
    }
    catch (error) {
        console.error("Error fetching crop:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "error.crop.fetchFailed");
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
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    }
    try {
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
        ];
        return { success: true, insights: mockInsights };
    }
    catch (error) {
        console.error("Error generating profitability insights:", error);
        throw new functions.https.HttpsError("internal", "error.insights.failed");
    }
});
const getNextStepDate = (type, startDate) => {
    let daysToAdd = 7;
    let stepDescription = "Ready for Straining";
    switch (type) {
        case "fpj":
            daysToAdd = 7;
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
exports.createKnfBatch = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    const { type, typeName, ingredients, startDate, quantityProduced, unit } = data;
    if (!type || !typeName || !ingredients || !startDate || !quantityProduced || !unit) {
        throw new functions.https.HttpsError("invalid-argument", "error.knf.missingFields");
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
            nextStepDate: admin.firestore.Timestamp.fromDate(nextStepDate),
            status: "Fermenting",
            nextStep: nextStep,
            quantityProduced,
            unit,
        };
        await newBatchRef.set(Object.assign(Object.assign({}, batchData), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        return { success: true, batchId: newBatchRef.id };
    }
    catch (error) {
        console.error("Error creating KNF batch:", error);
        throw new functions.https.HttpsError("internal", "error.knf.creationFailed", { originalError: error.message });
    }
});
exports.getUserKnfBatches = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    try {
        const batchesSnapshot = await db.collection("knf_batches")
            .where("userId", "==", context.auth.uid)
            .orderBy("createdAt", "desc")
            .get();
        const batches = batchesSnapshot.docs.map((doc) => {
            var _a, _b, _c, _d, _e, _f;
            const docData = doc.data();
            return Object.assign(Object.assign({}, docData), { id: doc.id, startDate: (_b = (_a = docData.startDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a).toISOString(), nextStepDate: (_d = (_c = docData.nextStepDate) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c).toISOString(), createdAt: (_f = (_e = docData.createdAt) === null || _e === void 0 ? void 0 : _e.toDate) === null || _f === void 0 ? void 0 : _f.call(_e).toISOString() });
        });
        return batches;
    }
    catch (error) {
        console.error("Error fetching user KNF batches:", error);
        throw new functions.https.HttpsError("internal", "error.knf.fetchFailed");
    }
});
exports.updateKnfBatchStatus = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
    const { batchId, status } = data;
    if (!batchId || !status)
        throw new functions.https.HttpsError("invalid-argument", "error.form.missingFields");
    const validStatuses = ["Fermenting", "Ready", "Used", "Archived"];
    if (!validStatuses.includes(status))
        throw new functions.https.HttpsError("invalid-argument", `Invalid status provided.`);
    const userId = context.auth.uid;
    const batchRef = db.collection("knf_batches").doc(batchId);
    try {
        const batchDoc = await batchRef.get();
        if (!batchDoc.exists)
            throw new functions.https.HttpsError("not-found", "error.knf.notFound");
        if (((_a = batchDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== userId)
            throw new functions.https.HttpsError("permission-denied", "error.permissionDenied");
        await batchRef.update({ status: status });
        return { success: true, message: `Batch ${batchId} status updated to ${status}.` };
    }
    catch (error) {
        console.error(`Error updating KNF batch ${batchId}:`, error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "error.knf.updateFailed", { originalError: error.message });
    }
});
//# sourceMappingURL=farm-management.js.map