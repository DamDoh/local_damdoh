

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole } from './profiles';

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
  const {vtiId, eventType, actorRef, geoLocation, payload = {}, farmFieldId} = data;

  if (!farmFieldId && !vtiId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Either a 'farmFieldId' (for pre-harvest) or a 'vtiId' (for post-harvest) must be provided.",
    );
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

  return {status: "success", message: `Event ${eventType} logged successfully for ${farmFieldId || vtiId}`};
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

export const handleHarvestEvent = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== "Farmer" && role !== "System") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only farmers or system processes can log harvest events.",
      );
    }

    const {farmFieldId, cropType, yieldKg, qualityGrade, actorVtiId, geoLocation} =
      data;

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
      const generateVTIResult = await _internalGenerateVTI(
        {
          type: "farm_batch",
          metadata: {
            cropType,
            initialYieldKg: yieldKg,
            initialQualityGrade: qualityGrade,
            farmFieldId: farmFieldId, // explicitly add farmFieldId to metadata
          },
        },
        context,
      );

      const newVtiId = generateVTIResult.vtiId;

      // Now log the HARVESTED event itself, associated with the new VTI
      await _internalLogTraceEvent(
        {
          vtiId: newVtiId,
          eventType: "HARVESTED",
          actorRef: actorVtiId,
          geoLocation: geoLocation || null,
          payload: {yieldKg, qualityGrade, farmFieldId, cropType},
          farmFieldId: farmFieldId, // Keep for cross-reference
        },
        context,
      );

      return {
        status: "success",
        message: `Harvest event logged and VTI ${newVtiId} created.`,
        vtiId: newVtiId,
      };
    } catch (error: any) {
      console.error("Error handling harvest event:", error);
      if (error.code) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to handle harvest event.",
        error.message,
      );
    }
  },
);

export const handleInputApplicationEvent = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== "Farmer" && role !== "System") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only farmers or system processes can log input application events.",
      );
    }

    const {
      farmFieldId,
      inputId,
      applicationDate,
      quantity,
      unit,
      method,
      actorVtiId,
      geoLocation,
    } = data;

    if (!farmFieldId || typeof farmFieldId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'farmFieldId' parameter is required and must be a string.",
      );
    }
    if (!inputId || typeof inputId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'inputId' parameter is required and must be a string (e.g., KNF Batch Name, Fertilizer Name).",
      );
    }
    if (!applicationDate) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'applicationDate' parameter is required.",
      );
    }
    if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'quantity' parameter is required and must be a non-negative number.",
      );
    }
    if (!unit || typeof unit !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'unit' parameter is required and must be a string.",
      );
    }
    if (method !== undefined && typeof method !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'method' parameter must be a string if provided.",
      );
    }
    if (!actorVtiId || typeof actorVtiId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'actorVtiId' parameter is required and must be a string (User or Organization VTI ID).",
      );
    }

    if (
      geoLocation &&
      (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'geoLocation' parameter must be an object with lat and lng if provided.",
      );
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

      await _internalLogTraceEvent(
        {
          eventType: "INPUT_APPLIED",
          actorRef: actorVtiId,
          geoLocation: geoLocation || null,
          payload: eventPayload,
          farmFieldId: farmFieldId,
        },
        context,
      );

      return {
        status: "success",
        message: `Input application event logged for farm field ${farmFieldId}.`,
      };
    } catch (error: any) {
      console.error("Error handling input application event:", error);
      if (error.code) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to handle input application event.",
        error.message,
      );
    }
  },
);

export const handleObservationEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {
    farmFieldId,
    observationType,
    observationDate,
    details,
    mediaUrls,
    actorVtiId,
    geoLocation,
    aiAnalysis,
  } = data;

  if (
    !farmFieldId ||
    !observationType ||
    !observationDate ||
    !details ||
    !actorVtiId
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields for observation event.",
    );
  }

    try {
        const eventPayload: any = { 
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

    } catch (error: any) {
        console.error('Error handling observation event:', error);
        throw new functions.https.HttpsError('internal', 'Failed to handle observation event.', error.message);
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
export const getVtiTraceabilityHistory = functions.https.onCall(async (data, context) => {
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
        const vtiData = vtiDoc.data()!;

        // --- NEW LOGIC TO FETCH PRE-HARVEST EVENTS ---
        const farmFieldId = vtiData.metadata?.farmFieldId;
        let allEventsData: any[] = [];

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

            const preHarvestEvents = preHarvestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const postHarvestEvents = postHarvestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            allEventsData = [...preHarvestEvents, ...postHarvestEvents];
        } else {
            // Fallback for older data or different VTI types
            const postHarvestSnapshot = await postHarvestQuery.get();
            allEventsData = postHarvestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // Sort all events chronologically
        allEventsData.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
        
        // Get unique actor IDs to fetch profiles efficiently
        const actorIds = [...new Set(allEventsData.map(event => event.actorRef).filter(Boolean))];
        
        const actorProfiles: Record<string, any> = {};

        if (actorIds.length > 0) {
            const profilePromises = actorIds.map(id => db.collection("users").doc(id).get());
            const profileSnapshots = await Promise.all(profilePromises);

            profileSnapshots.forEach(snap => {
                if (snap.exists) {
                    const profileData = snap.data();
                    actorProfiles[snap.id] = {
                        name: profileData?.displayName || "Unknown Actor",
                        role: profileData?.primaryRole || "Unknown Role",
                        avatarUrl: profileData?.avatarUrl || null
                    };
                } else {
                     actorProfiles[snap.id] = {
                        name: "Unknown Actor",
                        role: "Unknown Role",
                        avatarUrl: null
                    };
                }
            });
        }
        
        const enrichedEvents = allEventsData.map(event => ({
            ...event,
            timestamp: (event.timestamp as admin.firestore.Timestamp)?.toDate ? (event.timestamp as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
            actor: actorProfiles[event.actorRef] || { name: "System", role: "Platform" }
        }));

        const finalVtiData = {
            id: vtiDoc.id,
            ...vtiData,
            creationTime: (vtiData.creationTime as admin.firestore.Timestamp)?.toDate ? (vtiData.creationTime as admin.firestore.Timestamp).toDate().toISOString() : new Date().toISOString(),
        }

        return {
            vti: finalVtiData,
            events: enrichedEvents
        };

    } catch (error) {
        console.error(`Error fetching traceability history for VTI ${vtiId}:`, error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Failed to fetch traceability history.");
    }
});
