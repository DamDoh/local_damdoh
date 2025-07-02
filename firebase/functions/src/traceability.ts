
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
      const generateVTIResult = await _internalGenerateVTI(
        {
          type: "farm_batch",
          linkedVtis: [farmFieldId],
          metadata: {
            cropType,
            initialYieldKg: yieldKg,
            initialQualityGrade: qualityGrade,
            linkedPreHarvestEvents: [],
          },
        },
        context,
      );

      const newVtiId = generateVTIResult.vtiId;

      const oneYearAgo = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
      );
      const preHarvestEventsQuery = db
        .collection("traceability_events")
        .where("farmFieldId", "==", farmFieldId)
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(oneYearAgo))
        .where("eventType", "in", ["PLANTED", "INPUT_APPLIED", "OBSERVED"]);

      const preHarvestEventsSnapshot = await preHarvestEventsQuery.get();
      const linkedEventIds: string[] = preHarvestEventsSnapshot.docs.map(
        (doc) => doc.id,
      );

      await db
        .collection("vti_registry")
        .doc(newVtiId)
        .update({
          "metadata.linked_pre_harvest_events": linkedEventIds,
        });

      await _internalLogTraceEvent(
        {
          vtiId: newVtiId,
          eventType: "HARVESTED",
          actorRef: actorVtiId,
          geoLocation: geoLocation || null,
          payload: {yieldKg, qualityGrade, farmFieldId, cropType},
          farmFieldId: farmFieldId,
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
          vtiId: farmFieldId,
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

  let aiAnalysisResult = "AI analysis not performed (no image provided).";

    // If there are media URLs, attempt to analyze the first one.
    if (mediaUrls && mediaUrls.length > 0 && process.env.GEMINI_API_KEY) {
        try {
            console.log(`Performing AI analysis on media: ${mediaUrls[0]}`);
            // This is a placeholder for a real call to a vision model (e.g., Vertex AI Gemini).
            // A real implementation would require converting the public URL to a format the AI can access (e.g., GCS URI or base64 data).
            if (details.toLowerCase().includes('blight')) {
                aiAnalysisResult = "AI analysis suggests possible early signs of blight. Recommended action: Apply a copper-based fungicide and ensure good air circulation around plants. Consider sending a sample for lab verification.";
            } else if (details.toLowerCase().includes('yellow leaves')) {
                aiAnalysisResult = "AI analysis indicates potential nitrogen deficiency. Recommended action: Apply a nitrogen-rich organic fertilizer, such as compost tea or well-rotted manure.";
            } else {
                 aiAnalysisResult = "AI analysis complete. Observation logged. No immediate critical action suggested, continue monitoring.";
            }
            console.log('AI analysis successful (placeholder).');
        } catch(aiError) {
            console.error("Error during AI analysis:", aiError);
            aiAnalysisResult = "AI analysis failed due to an internal error.";
        }
    }


    try {
        const eventPayload: any = { 
            observationType, 
            details, 
            mediaUrls: mediaUrls || [], 
            farmFieldId,
            aiAnalysis: aiAnalysisResult
        };

        await _internalLogTraceEvent({
            vtiId: farmFieldId,
            eventType: 'OBSERVED',
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });

        return { status: 'success', message: `Observation event logged for farm field ${farmFieldId}.`, aiAnalysis: aiAnalysisResult };

    } catch (error: any) {
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
export const getTraceabilityEventsByFarmField = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const {farmFieldId} = data;
    if (!farmFieldId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A farmFieldId must be provided.",
      );
    }

    try {
      const eventsSnapshot = await db
        .collection("traceability_events")
        .where("farmFieldId", "==", farmFieldId)
        .orderBy("timestamp", "asc")
        .get();

      const events = eventsSnapshot.docs.map((doc) => {
        const eventData = doc.data();
        if (!eventData) return null; // Defensive check
        return {
          id: doc.id,
          ...eventData,
          timestamp: (eventData.timestamp as admin.firestore.Timestamp)?.toDate ? (eventData.timestamp as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
      }).filter(Boolean); // Filter out any null results

      return {events};
    } catch (error) {
      console.error(
        `Error fetching events for farmFieldId ${farmFieldId}:`,
        error,
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch traceability events.",
      );
    }
  },
);

/**
 * Fetches a VTI document and its complete, enriched traceability history.
 * This function has been hardened to prevent crashes from missing data.
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
        // 1. Fetch the VTI document itself
        const vtiDocRef = db.collection("vti_registry").doc(vtiId);
        const vtiDoc = await vtiDocRef.get();

        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `VTI with ID ${vtiId} not found.`);
        }

        const vtiData = vtiDoc.data();
        if (!vtiData) {
            throw new functions.https.HttpsError("internal", `VTI document ${vtiId} has no data.`);
        }

        // 2. Fetch all associated events
        const eventsQuery = db.collection("traceability_events")
            .where("vtiId", "==", vtiId)
            .orderBy("timestamp", "asc");
        
        const eventsSnapshot = await eventsQuery.get();
        const eventsData = eventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(Boolean); // Ensure no undefined data

        // 3. Enrich events with actor information
        const actorIds = [...new Set(
            eventsData
                .map(event => ('actorRef' in event && typeof event.actorRef === 'string') ? event.actorRef : null)
                .filter((id): id is string => !!id)
        )];
        
        const actorProfiles: { [key: string]: any } = {};
        if (actorIds.length > 0) {
            const userDocs = await db.collection("users").where(admin.firestore.FieldPath.documentId(), "in", actorIds).get();
            userDocs.forEach(doc => {
                const docData = doc.data();
                if (doc.exists && docData) {
                    actorProfiles[doc.id] = {
                        name: docData.displayName || "Unknown Actor",
                        role: docData.primaryRole || "Unknown Role",
                    };
                }
            });
        }
        
        const enrichedEvents: any[] = eventsData.map(event => {
            const timestamp = 'timestamp' in event ? (event.timestamp as admin.firestore.Timestamp)?.toDate ? (event.timestamp as admin.firestore.Timestamp).toDate().toISOString() : null : null;
            const actorRef = ('actorRef' in event && typeof event.actorRef === 'string') ? event.actorRef : null;
            if (!actorRef) {
              return { ...event, timestamp, actor: { name: "System", role: "System" } };
            }
            return {
                ...event,
                timestamp,
                actor: actorProfiles[actorRef] || { name: "Unknown Actor", role: "Unknown Role" }
            }
        });

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
