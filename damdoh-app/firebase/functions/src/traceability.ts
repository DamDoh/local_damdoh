
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole, getProfileByIdFromDB } from './profiles';

const db = admin.firestore();

/**
 * Internal function to generate a new Verifiable Traceability Identifier (VTI).
 * @param {any} data The data for the new VTI.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{vtiId: string, status: string}>} A promise that resolves with the new VTI ID.
 */
async function _internalGenerateVTI(
  data: any,
  context?: functions.https.CallableContext,
) {
  const {type, linkedVtis = [], metadata = {}} = data;

  if (!type || typeof type !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'type' parameter is required and must be a string.",
    );
  }

  const vtiId = uuidv4();
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
    metadata: {...metadata, carbon_footprint_kgCO2e: 0},
    isPublicTraceable: false,
  });

  return {vtiId, status: "success"};
}

export const generateVTI = functions.https.onCall(async (data, context) => {
  try {
    return await _internalGenerateVTI(data, context);
  } catch (error: any) {
    console.error("Error in generateVTI callable function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate VTI.",
      error.message,
    );
  }
});

/**
 * Internal function to log a new traceability event.
 * @param {any} data The data for the new event.
 * @param {functions.https.CallableContext} [context] The context of the function call.
 * @return {Promise<{status: string, message: string}>} A promise that resolves when the event is logged.
 */
export async function _internalLogTraceEvent(
  data: any,
  context?: functions.https.CallableContext,
) {
  const {vtiId, eventType, actorRef, geoLocation, payload = {}, farmFieldId} =
    data;

  if (!vtiId || typeof vtiId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'vtiId' parameter is required and must be a string.",
    );
  }
  if (!eventType || typeof eventType !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'eventType' parameter is required and must be a string.",
    );
  }
  if (!actorRef || typeof actorRef !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'actorRef' parameter is required and must be a string (user or organization VTI ID).",
    );
  }
  if (
    geoLocation &&
    (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'geoLocation' parameter must be an object with lat and lng.",
    );
  }

  const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
  if (!vtiDoc.exists) {
    // Allow logging against farmFieldId even if no batch VTI exists yet
    if (!farmFieldId) {
      throw new functions.https.HttpsError(
        "not-found",
        `VTI with ID ${vtiId} not found.`,
      );
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

  return {status: "success", message: `Event ${eventType} logged for VTI ${vtiId}`};
}

export const logTraceEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to log a trace event.",
    );
  }

  try {
    return await _internalLogTraceEvent(data, context);
  } catch (error: any) {
    console.error("Error in logTraceEvent callable function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to log trace event.",
      error.message,
    );
  }
});

/**
 * Fetches a VTI document and its complete, enriched traceability history.
 * @param {any} data The data for the function call, containing `vtiId`.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{vti: any, events: any[]}>} A promise resolving with the VTI and its event history.
 */
export const getVtiTraceabilityHistory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { vtiId } = data;
    if (!vtiId) {
        throw new functions.https.HttpsError("invalid-argument", "A vtiId must be provided.");
    }

    try {
        const vtiDocRef = db.collection("vti_registry").doc(vtiId);
        const vtiDoc = await vtiDocRef.get();

        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `VTI with ID ${vtiId} not found.`);
        }

        const vtiData = vtiDoc.data();
        if (!vtiData) {
            throw new functions.https.HttpsError("internal", `VTI document ${vtiId} has no data.`);
        }

        const eventsQuery = db.collection("traceability_events")
            .where("vtiId", "==", vtiId)
            .orderBy("timestamp", "asc");
        
        const eventsSnapshot = await eventsQuery.get();
        const eventsData = eventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(Boolean); // Ensure no undefined data

        const actorIds = [...new Set(eventsData.map(event => event.actorRef).filter(Boolean))];
        
        const actorProfiles: { [key: string]: any } = {};
        if (actorIds.length > 0) {
            const userDocs = await Promise.all(actorIds.map(id => getProfileByIdFromDB(id)));
            userDocs.forEach(profile => {
                if (profile) {
                    actorProfiles[profile.id] = {
                        name: profile.displayName || "Unknown Actor",
                        role: profile.primaryRole || "Unknown Role",
                    };
                }
            });
        }
        
        const enrichedEvents = eventsData.map(event => ({
            ...event,
            timestamp: (event.timestamp as admin.firestore.Timestamp)?.toDate ? (event.timestamp as admin.firestore.Timestamp).toDate().toISOString() : null,
            actor: actorProfiles[event.actorRef] || { name: "System", role: "System" }
        }));

        return {
            vti: {
                id: vtiDoc.id,
                ...vtiData,
                creationTime: (vtiData.creationTime as admin.firestore.Timestamp)?.toDate ? (vtiData.creationTime as admin.firestore.Timestamp).toDate().toISOString() : null,
            },
            events: enrichedEvents
        };

    } catch (error) {
        console.error(`Error fetching traceability history for VTI ${vtiId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability history.");
    }
});
