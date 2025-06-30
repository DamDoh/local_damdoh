
'use server';
/**
 * =================================================================
 * Module 1: The Core Data & Traceability Engine
 * =================================================================
 * This module is the immutable backbone of the entire DamDoh ecosystem. It's
 * primarily a backend system that handles the creation, storage, and management
 * of foundational data, ensuring transparent and auditable records for every
 * product's journey.
 *
 * @purpose To establish a single source of truth for all agricultural master
 * data and to record every significant event in a product's lifecycle using a
 * robust, auditable, and hierarchical traceability system.
 *
 * @key_concepts
 * - Master Data Management: Centralized repository for products, inputs, certifications.
 * - Vibrant Traceability ID (VTI) System: Unique, immutable identifier for every batch.
 * - Immutable Traceability Event Log: An auditable chain of custody for every product.
 *
 * @future_integrations Satellite data processing, weather data integration.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole, getProfileByIdFromDB } from './profiles';

const db = admin.firestore();

/**
 * Generates a new Verifiable Traceability Identifier (VTI).
 * This is the foundational function for creating a traceable batch for any product on the platform.
 * It's called internally by other functions (e.g., when a harvest is logged).
 * @param {any} data - Contains the type of VTI, linked parent VTIs, and any initial metadata.
 * @param {functions.https.CallableContext} [context] - The context of the function call.
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

  // Creates the initial document in the vti_registry collection.
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

/**
 * Callable Cloud Function to generate a new Verifiable Traceability Identifier (VTI).
 * This function serves as a secure endpoint for creating new VTIs on demand.
 */
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
 * Logs a new traceability event against a VTI.
 * This is the core function for building the immutable chain of custody for a product.
 * It's called internally by other functions when significant actions occur (e.g., planting, transport, processing).
 * @param {any} data - Contains the VTI, event type, actor, and event-specific payload.
 * @param {functions.https.CallableContext} [context] - The context of the function call.
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

/**
 * Callable Cloud Function to log a new traceability event.
 * This is a secure endpoint for authenticated users to record actions against a VTI.
 */
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
            // Using the new getProfileByIdFromDB helper for consistency
            const profilePromises = actorIds.map(id => getProfileByIdFromDB(id));
            const userProfiles = await Promise.all(profilePromises);

            userProfiles.forEach(profile => {
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


// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 1
// These are placeholders aligned with the platform vision.
// =================================================================

/**
 * [Conceptual] Triggered by new satellite data feeds from external providers.
 * This function would process the raw imagery, calculate indices like NDVI,
 * link it to the relevant geospatial_assets, and store summarized data for
 * use in Module 3 (Farm Management) and Module 6 (AI Engine).
 */
export const processSatelliteImagery = functions.https.onCall(async (data, context) => {
    console.log("Conceptual: Processing satellite imagery for farm field:", data.farmFieldId);
    // 1. Fetch raw image from Cloud Storage or external API.
    // 2. Perform atmospheric correction and cloud masking.
    // 3. Calculate NDVI, EVI, etc.
    // 4. Store derived data in BigQuery and/or update the geospatial_assets document in Firestore.
    return { status: "success", message: "Conceptual satellite imagery processed."};
});

/**
 * [Conceptual] Triggered by new traceability events like 'INPUT_APPLIED' or 'TRANSPORTED'.
 * This function would fetch emission factors and calculate the carbon footprint,
 * updating the metadata of the corresponding VTI in the vti_registry.
 */
export const calculateCarbonFootprint = functions.firestore
    .document("traceability_events/{eventId}")
    .onCreate(async (snapshot, context) => {
        const eventData = snapshot.data();
        console.log("Conceptual: Calculating carbon footprint for event:", context.params.eventId);
        // 1. Check if eventType is relevant (e.g., fertilizer application, transport).
        // 2. Fetch the corresponding emission factor from a 'emission_factors' master data collection.
        // 3. Calculate emissions based on event payload (e.g., quantity * factor).
        // 4. Update the vti_registry document for the event's vtiId with the new carbon data.
        return null;
    });
