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
exports.getRecentVtiBatches = exports.getVtiTraceabilityHistory = exports.getTraceabilityEventsByFarmField = exports.handleObservationEvent = exports.handleInputApplicationEvent = exports.handleHarvestEvent = exports.logTraceEvent = exports.generateVTI = void 0;
exports._internalLogTraceEvent = _internalLogTraceEvent;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const profiles_1 = require("./profiles");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
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
        isPublicTraceable: true, // Make traceable by default
    });
    return { vtiId, status: "success" };
}
exports.generateVTI = functions.https.onCall(async (data, context) => {
    checkAuth(context);
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
    if (!farmFieldId && !vtiId) {
        throw new functions.https.HttpsError("invalid-argument", "Either a 'farmFieldId' (for pre-harvest) or a 'vtiId' (for post-harvest) must be provided.");
    }
    // Common validation for required fields
    if (!eventType || typeof eventType !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'eventType' parameter is required.");
    }
    if (!actorRef || typeof actorRef !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "The 'actorRef' parameter is required.");
    }
    if (geoLocation && (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")) {
        throw new functions.https.HttpsError("invalid-argument", "The 'geoLocation' parameter must be an object with lat and lng.");
    }
    // If a vtiId is provided for post-harvest events, ensure it exists.
    if (vtiId) {
        const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `VTI with ID ${vtiId} not found.`);
        }
    }
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("traceability_events").add({
        vtiId: vtiId || null,
        farmFieldId: farmFieldId || null,
        timestamp,
        eventType,
        actorRef,
        geoLocation: geoLocation || null,
        payload,
        isPublicTraceable: false,
    });
    return { status: "success", message: `Event ${eventType} logged successfully for ${farmFieldId || vtiId}` };
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
        // Create the VTI with the linked events in its metadata
        const generateVTIResult = await _internalGenerateVTI({
            type: "farm_batch",
            metadata: {
                cropType,
                initialYieldKg: yieldKg,
                initialQualityGrade: qualityGrade,
                farmFieldId: farmFieldId, // explicitly add farmFieldId to metadata
            },
        });
        const newVtiId = generateVTIResult.vtiId;
        // Now log the HARVESTED event itself, associated with the new VTI
        await _internalLogTraceEvent({
            vtiId: newVtiId,
            eventType: "HARVESTED",
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: { yieldKg, qualityGrade },
            farmFieldId: farmFieldId, // Keep for cross-reference
        });
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
            applicationDate: new Date(applicationDate).toISOString(),
            method: method || null,
        };
        await _internalLogTraceEvent({
            eventType: "INPUT_APPLIED",
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });
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
    const { farmFieldId, observationType, observationDate, details, mediaUrls, actorVtiId, geoLocation, aiAnalysis, } = data;
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
            aiAnalysis: aiAnalysis || "No AI analysis was performed for this observation.",
        };
        await _internalLogTraceEvent({
            eventType: 'OBSERVED',
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });
        return { status: 'success', message: `Observation event logged for farm field ${farmFieldId}.` };
    }
    catch (error) {
        console.error('Error handling observation event:', error);
        throw new functions.https.HttpsError('internal', 'Failed to handle observation event.', error.message);
    }
});
/**
 * Fetches all traceability events for a given farmFieldId.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{events: any[]}>} A promise that resolves with the traceability events.
 */
exports.getTraceabilityEventsByFarmField = functions.https.onCall(async (data, context) => {
    checkAuth(context);
    const { farmFieldId } = data;
    if (!farmFieldId) {
        throw new functions.https.HttpsError("invalid-argument", "A farmFieldId must be provided.");
    }
    try {
        const eventsSnapshot = await db
            .collection("traceability_events")
            .where("farmFieldId", "==", farmFieldId)
            .orderBy("timestamp", "asc")
            .get();
        const actorIds = [...new Set(eventsSnapshot.docs.map(doc => doc.data().actorRef).filter(Boolean))];
        const actorProfiles = {};
        if (actorIds.length > 0) {
            const profileChunks = [];
            for (let i = 0; i < actorIds.length; i += 30) {
                profileChunks.push(actorIds.slice(i, i + 30));
            }
            for (const chunk of profileChunks) {
                const usersSnapshot = await db.collection("users").where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
                usersSnapshot.forEach(doc => {
                    const data = doc.data();
                    actorProfiles[doc.id] = {
                        name: data.displayName || 'Unknown Actor',
                        role: data.primaryRole || 'System',
                        avatarUrl: data.avatarUrl || null,
                    };
                });
            }
        }
        const events = eventsSnapshot.docs.map((doc) => {
            var _a;
            const eventData = doc.data();
            if (!eventData)
                return null; // Defensive check
            return Object.assign(Object.assign({ id: doc.id }, eventData), { actor: actorProfiles[eventData.actorRef] || { name: 'System', role: 'Platform' }, timestamp: ((_a = eventData.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? eventData.timestamp.toDate().toISOString() : null });
        }).filter(Boolean); // Filter out any null results
        return { events };
    }
    catch (error) {
        console.error(`Error fetching events for farmFieldId ${farmFieldId}:`, error);
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability events.");
    }
});
/**
 * Fetches the complete traceability history for a given VTI.
 * This includes pre-harvest and post-harvest events.
 *
 * @param {any} data The data for the function call, containing the vtiId.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{vti: any, events: any[]}>} A promise that resolves with the full history.
 */
exports.getVtiTraceabilityHistory = functions.https.onCall(async (data, context) => {
    var _a, _b;
    // No auth check here to allow public traceability lookup
    const { vtiId } = data;
    if (!vtiId) {
        throw new functions.https.HttpsError("invalid-argument", "A vtiId must be provided.");
    }
    try {
        const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `VTI batch with ID ${vtiId} not found.`);
        }
        const vtiData = vtiDoc.data();
        // --- NEW LOGIC TO FETCH PRE-HARVEST EVENTS ---
        const farmFieldId = (_a = vtiData.metadata) === null || _a === void 0 ? void 0 : _a.farmFieldId;
        let allEventsData = [];
        // Fetch post-harvest events (linked by vtiId)
        const postHarvestQuery = db.collection("traceability_events")
            .where("vtiId", "==", vtiId);
        // Fetch pre-harvest events if farmFieldId exists
        if (farmFieldId) {
            const preHarvestQuery = db.collection("traceability_events")
                .where("farmFieldId", "==", farmFieldId)
                .where("vtiId", "==", null); // Only get events before a VTI was assigned
            const [preHarvestSnapshot, postHarvestSnapshot] = await Promise.all([
                preHarvestQuery.get(),
                postHarvestQuery.get()
            ]);
            const preHarvestEvents = preHarvestSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            const postHarvestEvents = postHarvestSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            allEventsData = [...preHarvestEvents, ...postHarvestEvents];
        }
        else {
            // Fallback for older data or different VTI types
            const postHarvestSnapshot = await postHarvestQuery.get();
            allEventsData = postHarvestSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        // Sort all events chronologically
        allEventsData.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
        // Get unique actor IDs to fetch profiles efficiently
        const actorIds = [...new Set(allEventsData.map(event => event.actorRef).filter(Boolean))];
        const actorProfiles = {};
        if (actorIds.length > 0) {
            const profilePromises = actorIds.map(id => db.collection("users").doc(id).get());
            const profileSnapshots = await Promise.all(profilePromises);
            profileSnapshots.forEach(snap => {
                if (snap.exists) {
                    const profileData = snap.data();
                    actorProfiles[snap.id] = {
                        name: (profileData === null || profileData === void 0 ? void 0 : profileData.displayName) || "Unknown Actor",
                        role: (profileData === null || profileData === void 0 ? void 0 : profileData.primaryRole) || "Unknown Role",
                        avatarUrl: (profileData === null || profileData === void 0 ? void 0 : profileData.avatarUrl) || null
                    };
                }
                else {
                    actorProfiles[snap.id] = {
                        name: "Unknown Actor",
                        role: "Unknown Role",
                        avatarUrl: null
                    };
                }
            });
        }
        const enrichedEvents = allEventsData.map(event => {
            var _a;
            return (Object.assign(Object.assign({}, event), { timestamp: ((_a = event.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) ? event.timestamp.toDate().toISOString() : new Date().toISOString(), actor: actorProfiles[event.actorRef] || { name: "System", role: "Platform" } }));
        });
        const finalVtiData = Object.assign(Object.assign({ id: vtiDoc.id }, vtiData), { creationTime: ((_b = vtiData.creationTime) === null || _b === void 0 ? void 0 : _b.toDate) ? vtiData.creationTime.toDate().toISOString() : new Date().toISOString() });
        return {
            vti: finalVtiData,
            events: enrichedEvents
        };
    }
    catch (error) {
        console.error(`Error fetching traceability history for VTI ${vtiId}:`, error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability history.");
    }
});
exports.getRecentVtiBatches = functions.https.onCall(async (data, context) => {
    try {
        const vtiSnapshot = await db.collection('vti_registry')
            .where('isPublicTraceable', '==', true)
            .orderBy('creationTime', 'desc')
            .limit(10)
            .get();
        if (vtiSnapshot.empty) {
            return { batches: [] };
        }
        const batches = await Promise.all(vtiSnapshot.docs.map(async (doc) => {
            var _a, _b;
            const vtiData = doc.data();
            const harvestEventSnapshot = await db.collection('traceability_events')
                .where('vtiId', '==', vtiData.vtiId)
                .where('eventType', '==', 'HARVESTED')
                .limit(1)
                .get();
            let producerName = 'Unknown';
            let harvestDate = vtiData.creationTime.toDate().toISOString();
            if (!harvestEventSnapshot.empty) {
                const harvestEvent = harvestEventSnapshot.docs[0].data();
                harvestDate = harvestEvent.timestamp.toDate().toISOString();
                if (harvestEvent.actorRef) {
                    try {
                        const userDoc = await db.collection('users').doc(harvestEvent.actorRef).get();
                        if (userDoc.exists && userDoc.data()) {
                            producerName = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Unknown';
                        }
                    }
                    catch (e) {
                        // User might not exist if it's an org, or other issue.
                        console.log(`Could not fetch user profile for actorRef: ${harvestEvent.actorRef}`);
                    }
                }
            }
            return {
                id: doc.id,
                productName: ((_b = vtiData.metadata) === null || _b === void 0 ? void 0 : _b.cropType) || 'Unknown Product',
                producerName: producerName,
                harvestDate: harvestDate,
            };
        }));
        return { batches };
    }
    catch (error) {
        console.error("Error fetching recent VTI batches:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch recent batches.");
    }
});
//# sourceMappingURL=traceability.js.map