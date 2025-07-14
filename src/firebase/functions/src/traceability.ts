
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole } from './profiles';
import { detectTraceabilityAnomalyFlow } from '@/ai/flows/detect-traceability-anomaly-flow';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};

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
      "error.vti.typeRequired",
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
    isPublicTraceable: true, // Make traceable by default
  });

  return {vtiId, status: "success"};
}

export const generateVTI = functions.https.onCall(async (data, context) => {
  checkAuth(context);
  try {
    return await _internalGenerateVTI(data, context);
  } catch (error: any) {
    console.error("Error in generateVTI callable function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "error.vti.generationFailed",
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
      "error.traceability.idRequired",
    );
  }

  // Common validation for required fields
  if (!eventType || typeof eventType !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "error.traceability.eventTypeRequired");
  }
  if (!actorRef || typeof actorRef !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "error.traceability.actorRefRequired");
  }
  if (geoLocation && (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")) {
    throw new functions.https.HttpsError("invalid-argument", "error.traceability.invalidGeoLocation");
  }

  // If a vtiId is provided for post-harvest events, ensure it exists.
  if (vtiId) {
    const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
    if (!vtiDoc.exists) {
      throw new functions.https.HttpsError("not-found", `error.vti.notFound`);
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
  checkAuth(context);

  try {
    return await _internalLogTraceEvent(data, context);
  } catch (error: any) {
    console.error("Error in logTraceEvent callable function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "error.traceability.logFailed",
      error.message,
    );
  }
});

export const handleHarvestEvent = functions.https.onCall(
  async (data, context) => {
    const callerUid = checkAuth(context);
    const role = await getRole(callerUid);

    if (role !== "Farmer" && role !== "System") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "error.permissionDenied",
      );
    }

    const {farmFieldId, cropType, yieldKg, qualityGrade, actorVtiId, geoLocation} =
      data;

    if (!farmFieldId || typeof farmFieldId !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "error.harvest.farmFieldIdRequired");
    }
    if (!cropType || typeof cropType !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "error.harvest.cropTypeRequired");
    }
    if (yieldKg !== undefined && typeof yieldKg !== "number") {
      throw new functions.https.HttpsError("invalid-argument", "error.harvest.yieldInvalid");
    }
    if (qualityGrade !== undefined && typeof qualityGrade !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "error.harvest.qualityGradeInvalid");
    }
    if (!actorVtiId || typeof actorVtiId !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "error.harvest.actorVtiIdRequired");
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
      );

      const newVtiId = generateVTIResult.vtiId;

      // Now log the HARVESTED event itself, associated with the new VTI
      await _internalLogTraceEvent(
        {
          vtiId: newVtiId,
          eventType: "HARVESTED",
          actorRef: actorVtiId,
          geoLocation: geoLocation || null,
          payload: {yieldKg, qualityGrade},
          farmFieldId: farmFieldId, // Keep for cross-reference
        },
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
        "error.harvest.failed",
        error.message,
      );
    }
  },
);

export const handleInputApplicationEvent = functions.https.onCall(
  async (data, context) => {
    const callerUid = checkAuth(context);
    const role = await getRole(callerUid);

    if (role !== "Farmer" && role !== "System") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "error.permissionDenied",
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

    if (!farmFieldId || typeof farmFieldId !== "string" || !inputId || typeof inputId !== "string" || !applicationDate || quantity === undefined || typeof quantity !== "number" || quantity < 0 || !unit || typeof unit !== "string" || !actorVtiId || typeof actorVtiId !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "error.form.missingFields"
        );
    }

    if (method !== undefined && typeof method !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "The 'method' parameter must be a string if provided.");
    }
    
    if (geoLocation && (typeof geoLocation.lat !== "number" || typeof geoLocation.lng !== "number")) {
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

      await _internalLogTraceEvent(
        {
          eventType: "INPUT_APPLIED",
          actorRef: actorVtiId,
          geoLocation: geoLocation || null,
          payload: eventPayload,
          farmFieldId: farmFieldId,
        },
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
        "error.inputApplication.failed",
        error.message,
      );
    }
  },
);

export const handleObservationEvent = functions.https.onCall(async (data, context) => {
  const callerUid = checkAuth(context);

  const {
    farmFieldId,
    observationType,
    observationDate,
    details,
    mediaUrls,
    geoLocation,
    aiAnalysis,
  } = data;

  if (
    !farmFieldId ||
    !observationType ||
    !observationDate ||
    !details
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.form.missingFields",
    );
  }

    try {
        const eventPayload: any = { 
            observationType, 
            details, 
            mediaUrls: mediaUrls || [], 
            aiAnalysis: aiAnalysis || null,
        };

        await _internalLogTraceEvent({
            eventType: 'OBSERVED',
            actorRef: callerUid,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });

        return { status: 'success', message: `Observation event logged for farm field ${farmFieldId}.` };

    } catch (error: any) {
        console.error('Error handling observation event:', error);
        throw new functions.https.HttpsError('internal', 'error.observation.failed', error.message);
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
    checkAuth(context);

    const {farmFieldId} = data;
    if (!farmFieldId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "error.farmFieldId.required"
      );
    }

    try {
      const eventsSnapshot = await db
        .collection("traceability_events")
        .where("farmFieldId", "==", farmFieldId)
        .orderBy("timestamp", "asc")
        .get();

      const actorIds = [...new Set(eventsSnapshot.docs.map(doc => doc.data().actorRef).filter(Boolean))];
      const actorProfiles: Record<string, any> = {};
      
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
        const eventData = doc.data();
        if (!eventData) return null; // Defensive check
        return {
          id: doc.id,
          ...eventData,
          actor: actorProfiles[eventData.actorRef] || { name: 'System', role: 'Platform' },
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
        "error.traceability.fetchFailed",
      );
    }
  },
);

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
        throw new functions.https.HttpsError("invalid-argument", "error.vti.idRequired");
    }

    try {
        const vtiDoc = await db.collection("vti_registry").doc(vtiId).get();
        if (!vtiDoc.exists) {
            throw new functions.https.HttpsError("not-found", `error.vti.notFound`);
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
        throw new functions.https.HttpsError("internal", "error.traceability.fetchHistoryFailed");
    }
});


export const getRecentVtiBatches = functions.https.onCall(async (data, context) => {
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
            const vtiData = doc.data();
            let producerName = 'Unknown';
            let harvestDate = (vtiData.creationTime as admin.firestore.Timestamp)?.toDate?.().toISOString() || null;
            
            if (harvestDate === null) return null; // Skip if creationTime is invalid

            const harvestEventSnapshot = await db.collection('traceability_events')
                .where('vtiId', '==', vtiData.vtiId)
                .where('eventType', '==', 'HARVESTED')
                .limit(1)
                .get();

            if (!harvestEventSnapshot.empty) {
                const harvestEvent = harvestEventSnapshot.docs[0].data();
                harvestDate = (harvestEvent.timestamp as admin.firestore.Timestamp)?.toDate?.().toISOString() || harvestDate;
                if (harvestEvent.actorRef) {
                    try {
                        const userDoc = await db.collection('users').doc(harvestEvent.actorRef).get();
                        if (userDoc.exists) {
                            producerName = userDoc.data()?.displayName || 'Unknown';
                        }
                    } catch (e) {
                        // User might not exist if it's an org, or other issue.
                        console.log(`Could not fetch user profile for actorRef: ${harvestEvent.actorRef}`);
                    }
                }
            }
            
            return {
                id: doc.id,
                productName: vtiData.metadata?.cropType || 'Unknown Product',
                producerName: producerName,
                harvestDate: harvestDate,
            };
        }));
        
        return { batches: batches.filter(Boolean) }; // Filter out nulls
    } catch (error) {
        console.error("Error fetching recent VTI batches:", error);
        throw new functions.https.HttpsError("internal", "error.vti.fetchRecentFailed");
    }
});

// New trigger function for AI anomaly detection
export const onTraceabilityEventCreated = functions.firestore
  .document("traceability_events/{eventId}")
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const vtiId = eventData?.vtiId;

    // Only run for events that have a VTI ID (i.e., post-harvest)
    if (!vtiId) {
      console.log(`Event ${context.params.eventId} has no vtiId. Skipping anomaly detection.`);
      return null;
    }

    try {
      console.log(`Running anomaly detection for VTI: ${vtiId}`);
      // It's often better to wait a moment before running analysis in case other related events are logged in quick succession.
      // For this example, we'll run it immediately. A production system might use a Cloud Task to delay this.
      const result = await detectTraceabilityAnomalyFlow({ vtiId });
      
      if (result.isAnomaly) {
        console.warn(`Anomaly detected for VTI ${vtiId}: ${result.reason}`);
        // Update the event that triggered this check with the anomaly info.
        await snap.ref.update({
          payload: {
            ...eventData.payload,
            isAnomaly: true,
            anomalyDescription: result.reason,
          }
        });
      } else {
        console.log(`No anomalies found for VTI: ${vtiId}`);
      }
    } catch (error) {
      console.error(`Error running anomaly detection for VTI ${vtiId}:`, error);
    }
    
    return null;
  });
