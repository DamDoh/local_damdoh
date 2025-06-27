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
exports.getVtiTraceabilityHistory = exports.getTraceabilityEventsByFarmField = exports.handleObservationEvent = exports.handleInputApplicationEvent = exports.handleHarvestEvent = exports.logTraceEvent = exports.generateVTI = void 0;
exports._internalLogTraceEvent = _internalLogTraceEvent;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const profiles_1 = require("./profiles");
const db = admin.firestore();
/**
 * Internal function to generate a new Verifiable Traceability Identifier (VTI).
 * @param {any} data The data for the new VTI.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{vtiId: string, status: string}>} A promise that resolves with the new VTI ID.
 */
async function _internalGenerateVTI(data, context) {
    const { type, linkedVtis = [], metadata = {} } = data;
    if (!type || typeof type !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'type' parameter is required and must be a string.");
    }
    const vtiId = (0, uuid_1.v4)();
    const creationTime = admin.firestore.FieldValue.serverTimestamp();
    const currentLocation = null;
    const status = "active";
    await db.collection("vti_registry").doc(vtiId).set({
        vtiId,
        type,
        creationTime,
        currentLocation,
        status,
        linkedVtis,
        metadata: Object.assign(Object.assign({}, metadata), { carbon_footprint_kgCO2e: 0 }),
        isPublicTraceable: false,
    });
    return { vtiId, status: "success" };
}
exports.generateVTI = functions.https.onCall(async (data, context) => {
    try {
        return await _internalGenerateVTI(data, context);
    }
    catch (error) {
        console.error("Error in generateVTI callable function:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to generate VTI.", error.message);
    }
});
/**
 * Internal function to log a new traceability event.
 * @param {any} data The data for the new event.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves when the event is logged.
 */
async function _internalLogTraceEvent(data, context) {
    const { vtiId, eventType, actorRef, geoLocation, payload = {}, farmFieldId } = data;
    if (!vtiId || typeof vtiId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'vtiId' parameter is required and must be a string.");
    }
    if (!eventType || typeof eventType !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'eventType' parameter is required and must be a string.");
    }
    if (!actorRef || typeof actorRef !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'actorRef' parameter is required and must be a string (user or organization VTI ID).");
    }
    if (geoLocation &&
        (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")) {
        throw new functions.https.HttpsError("invalid-argument", "The 'geoLocation' parameter must be an object with lat and lng.");
    }
    const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
    if (!vtiDoc.exists) {
        // Allow logging against farmFieldId even if no batch VTI exists yet
        if (!farmFieldId) {
            throw new functions.https.HttpsError("not-found", `VTI with ID ${vtiId} not found.`);
        }
    }
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("traceability_events").add({
        vtiId,
        timestamp,
        eventType,
        actorRef,
        geoLocation,
        payload,
        farmFieldId,
        isPublicTraceable: false,
    });
    return { status: "success", message: `Event ${eventType} logged for VTI ${vtiId}` };
}
exports.logTraceEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to log a trace event.");
    }
    try {
        return await _internalLogTraceEvent(data, context);
    }
    catch (error) {
        console.error("Error in logTraceEvent callable function:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to log trace event.", error.message);
    }
});
exports.handleHarvestEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const callerUid = context.auth.uid;
    const role = await (0, profiles_1.getRole)(callerUid);
    if (role !== "Farmer" && role !== "System") {
        throw new functions.https.HttpsError("permission-denied", "Only farmers or system processes can log harvest events.");
    }
    const { farmFieldId, cropType, yieldKg, qualityGrade, actorVtiId, geoLocation } = data;
    if (!farmFieldId || typeof farmFieldId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "'farmFieldId' is required.");
    }
    if (!cropType || typeof cropType !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "'cropType' is required.");
    }
    if (yieldKg !== undefined && typeof yieldKg !== "number") {
        throw new functions.https.HttpsError("invalid-argument", "'yieldKg' must be a number.");
    }
    if (qualityGrade !== undefined && typeof qualityGrade !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "'qualityGrade' must be a string.");
    }
    if (!actorVtiId || typeof actorVtiId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "'actorVtiId' is required.");
    }
    try {
        const generateVTIResult = await _internalGenerateVTI({
            type: "farm_batch",
            linkedVtis: [farmFieldId],
            metadata: {
                cropType,
                initialYieldKg: yieldKg,
                initialQualityGrade: qualityGrade,
                linkedPreHarvestEvents: [],
            },
        }, context);
        const newVtiId = generateVTIResult.vtiId;
        const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const preHarvestEventsQuery = db
            .collection("traceability_events")
            .where("farmFieldId", "==", farmFieldId)
            .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(oneYearAgo))
            .where("eventType", "in", ["PLANTED", "INPUT_APPLIED", "OBSERVED"]);
        const preHarvestEventsSnapshot = await preHarvestEventsQuery.get();
        const linkedEventIds = preHarvestEventsSnapshot.docs.map((doc) => doc.id);
        await db
            .collection("vti_registry")
            .doc(newVtiId)
            .update({
            "metadata.linked_pre_harvest_events": linkedEventIds,
        });
        await _internalLogTraceEvent({
            vtiId: newVtiId,
            eventType: "HARVESTED",
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: { yieldKg, qualityGrade, farmFieldId, cropType },
            farmFieldId: farmFieldId,
        }, context);
        return {
            status: "success",
            message: `Harvest event logged and VTI ${newVtiId} created.`,
            vtiId: newVtiId,
        };
    }
    catch (error) {
        console.error("Error handling harvest event:", error);
        if (error.code) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to handle harvest event.", error.message);
    }
});
exports.handleInputApplicationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const callerUid = context.auth.uid;
    const role = await (0, profiles_1.getRole)(callerUid);
    if (role !== "Farmer" && role !== "System") {
        throw new functions.https.HttpsError("permission-denied", "Only farmers or system processes can log input application events.");
    }
    const { farmFieldId, inputId, applicationDate, quantity, unit, method, actorVtiId, geoLocation, } = data;
    if (!farmFieldId || typeof farmFieldId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'farmFieldId' parameter is required and must be a string.");
    }
    if (!inputId || typeof inputId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'inputId' parameter is required and must be a string (e.g., KNF Batch Name, Fertilizer Name).");
    }
    if (!applicationDate) {
        throw new functions.https.HttpsError("invalid-argument", "The 'applicationDate' parameter is required.");
    }
    if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
        throw new functions.https.HttpsError("invalid-argument", "The 'quantity' parameter is required and must be a non-negative number.");
    }
    if (!unit || typeof unit !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'unit' parameter is required and must be a string.");
    }
    if (method !== undefined && typeof method !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'method' parameter must be a string if provided.");
    }
    if (!actorVtiId || typeof actorVtiId !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'actorVtiId' parameter is required and must be a string (User or Organization VTI ID).");
    }
    if (geoLocation &&
        (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")) {
        throw new functions.https.HttpsError("invalid-argument", "The 'geoLocation' parameter must be an object with lat and lng if provided.");
    }
    try {
        const eventPayload = {
            inputId,
            quantity,
            unit,
            applicationDate,
            method: method || null,
            farmFieldId,
        };
        // Note: For pre-harvest events, we log against the farmFieldId (which is the cropId)
        // because a batch VTI doesn't exist yet. The `vtiId` here is used to associate the event
        // with the field itself.
        await _internalLogTraceEvent({
            vtiId: farmFieldId,
            eventType: "INPUT_APPLIED",
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        }, context);
        return {
            status: "success",
            message: `Input application event logged for farm field ${farmFieldId}.`,
        };
    }
    catch (error) {
        console.error("Error handling input application event:", error);
        if (error.code) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to handle input application event.", error.message);
    }
});
exports.handleObservationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { farmFieldId, observationType, observationDate, details, mediaUrls, actorVtiId, geoLocation, } = data;
    if (!farmFieldId ||
        !observationType ||
        !observationDate ||
        !details ||
        !actorVtiId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields for observation event.");
    }
    try {
        const eventPayload = {
            observationType,
            details,
            mediaUrls: mediaUrls || [],
            farmFieldId,
        };
        if (mediaUrls && mediaUrls.length > 0) {
            eventPayload.aiAnalysis = "AI analysis not available.";
        }
        await _internalLogTraceEvent({
            vtiId: farmFieldId,
            eventType: "OBSERVED",
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });
        return {
            status: "success",
            message: `Observation event logged for farm field ${farmFieldId}.`,
        };
    }
    catch (error) {
        console.error("Error handling observation event:", error);
        throw new functions.https.HttpsError("internal", "Failed to handle observation event.", error.message);
    }
});
/**
 * Fetches all traceability events for a given farmFieldId.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{events: any[]}>} A promise that resolves with the traceability events.
 */
exports.getTraceabilityEventsByFarmField = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { farmFieldId } = data;
    if (!farmFieldId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmFieldId must be provided.");
    }
    // Optional: Add a security check to ensure the user is allowed to view events for this field.
    // This might involve checking if the farmFieldId belongs to a farm owned by the user.
    try {
        const eventsSnapshot = await db
            .collection("traceability_events")
            .where("farmFieldId", "==", farmFieldId)
            .orderBy("timestamp", "asc")
            .get();
        const events = eventsSnapshot.docs.map((doc) => {
            var _a;
            const eventData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, eventData), { timestamp: ((_a = eventData.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? eventData.timestamp.toDate().toISOString() : null });
        });
        return { events };
    }
    catch (error) {
        console.error(`Error fetching events for farmFieldId ${farmFieldId}:`, error);
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability events.");
    }
});
/**
 * Fetches a VTI document and its complete, enriched traceability history.
 * @param {any} data The data for the function call, containing `vtiId`.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{vti: any, events: any[]}>} A promise resolving with the VTI and its event history.
 */
exports.getVtiTraceabilityHistory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { vtiId } = data;
    if (!vtiId) {
        throw new functions.https.HttpsError("invalid-argument", "A vtiId must be provided.");
    }
    try {
        const db = admin.firestore();
        // 1. Fetch the VTI document itself
        const vtiDocRef = db.collection("vti_registry").doc(vtiId);
        const vtiDoc = await vtiDocRef.get();
        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `VTI with ID ${vtiId} not found.`);
        }
        const vtiData = vtiDoc.data();
        // 2. Fetch all associated events
        const eventsQuery = db.collection("traceability_events")
            .where("vtiId", "==", vtiId)
            .orderBy("timestamp", "asc");
        const eventsSnapshot = await eventsQuery.get();
        const eventsData = eventsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // 3. Enrich events with actor information
        const actorIds = [...new Set(eventsData.map(event => event.actorRef).filter(Boolean))];
        const actorProfiles = {};
        if (actorIds.length > 0) {
            const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", actorIds).get();
            userDocs.forEach(doc => {
                actorProfiles[doc.id] = {
                    name: doc.data().displayName || "Unknown Actor",
                    role: doc.data().primaryRole || "Unknown Role",
                };
            });
        }
        const enrichedEvents = eventsData.map(event => (Object.assign(Object.assign({}, event), { timestamp: event.timestamp.toDate().toISOString(), actor: actorProfiles[event.actorRef] || { name: "System", role: "System" } })));
        return {
            vti: Object.assign(Object.assign({ id: vtiDoc.id }, vtiData), { creationTime: (vtiData === null || vtiData === void 0 ? void 0 : vtiData.creationTime).toDate().toISOString() }),
            events: enrichedEvents
        };
    }
    catch (error) {
        console.error(`Error fetching traceability history for VTI ${vtiId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability history.");
    }
});
//# sourceMappingURL=module1.js.map