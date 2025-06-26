import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole } from './module2';

const db = admin.firestore();

// --- Conceptual Data Models (TypeScript Interfaces) ---

// Represents an entry in the vti_registry collection
interface VtiRegistryEntry {
  vtiId: string;
  type: string; // e.g., 'product_lot', 'farm_batch', 'farm_field', 'user', 'organization'
  creationTime: admin.firestore.FieldValue; // Server timestamp of creation
  currentLocation: admin.firestore.GeoPoint | null; // Current geographical location (if applicable)
  status: string; // e.g., 'active', 'in_transit', 'processed', 'sold', 'archived'
  linked_vtis: string[]; // Array of VTI IDs linked to this VTI (e.g., batch linked to farm field)
  metadata: {
    [key: string]: any; // Flexible field for additional metadata specific to the VTI type
    carbon_footprint_kgCO2e: number; // Aggregated carbon footprint
    linkedPreHarvestEvents?: string[]; // Array of traceability event IDs linked to a farm_batch VTI
    farmFieldId?: string; // For 'farm_batch' VTIs, link back to the farm field
    plantingDate?: admin.firestore.Timestamp; // For 'farm_batch' VTIs, store planting date
 };
  // Flag to indicate if this VTI and its basic event history are publicly traceable
  isPublicTraceable: boolean; 
}

// Represents an entry in the traceability_events collection
interface TraceabilityEvent {
  vtiId: string; // The VTI ID associated with this event
  timestamp: admin.firestore.FieldValue | admin.firestore.Timestamp; // Timestamp of the event
 eventType: string; // Type of event (e.g., 'PLANTED', 'HARVESTED', 'INPUT_APPLIED', 'PROCESSED', 'TRANSPORTED', 'SOLD', 'OBSERVED')
  actorRef: string; // VTI ID of the user or organization performing the action
  geoLocation: admin.firestore.GeoPoint | null; // Geographical location where the event occurred (if applicable)
  payload: {
    [key: string]: any; // Flexible field for event-specific data
    // Examples of payload fields depending on eventType:
    // - PLANTED: { cropType: string, plantingDate: Timestamp, farmFieldId: string, seedInputVti?: string, method?: string }
    // - HARVESTED: { yield_kg: number, quality_grade?: string, farmFieldId: string, cropType: string }
    // - INPUT_APPLIED: { inputId: string, quantity: number, unit: string, applicationDate: Timestamp, method?: string, farmFieldId: string }
    // - OBSERVED: { observationType: string, details: string, mediaUrls?: string[], farmFieldId: string }
    // - PROCESSED: { processType: string, inputVtiIds: string[], outputVtiId: string, facilityRef: string }
    // - TRANSPORTED: { fromLocation: GeoPoint, toLocation: GeoPoint, transportMode: string, distance_km: number, carrierRef: string }
  };
  // Optional field to link the event directly to a farm field for easier querying of farm activities
  farmFieldId?: string;
  // Flag to indicate if this specific event is publicly visible, even if the related VTI isn't fully public
  isPublicTraceable: boolean; // Changed from isPubliclyVisible to align with VTI flag name
}

// Internal logic for generating a new VTI
async function _internalGenerateVTI(data: any, context?: functions.https.CallableContext) {
  const { type, linked_vtis = [], metadata = {} } = data;

  if (!type || typeof type !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "type" parameter is required and must be a string.');
  }

  const vtiId = uuidv4();
  const creationTime = admin.firestore.FieldValue.serverTimestamp();
  const currentLocation = null; 
  const status = 'active';

  await db.collection('vti_registry').doc(vtiId).set({
    vtiId,
    type,
    creationTime,
    currentLocation,
    status,
    linked_vtis,
    metadata: { ...metadata, carbon_footprint_kgCO2e: 0 },
    isPublicTraceable: false, 
  });

  return { vtiId, status: 'success' };
}

// Callable function wrapper for frontend or authorized services to generate a new VTI
export const generateVTI = functions.https.onCall(async (data, context) => {
  // Optional: Add authentication/authorization checks here if needed for direct client calls
  try {
    return await _internalGenerateVTI(data, context);
  } catch (error: any) {
    console.error('Error in generateVTI callable function:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to generate VTI.', error.message);
  }
});

// Internal logic for logging a traceability event
async function _internalLogTraceEvent(data: any, context?: functions.https.CallableContext) {
    const { vtiId, eventType, actorRef, geoLocation, payload = {}, farmFieldId } = data;

    if (!vtiId || typeof vtiId !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'The "vtiId" parameter is required and must be a string.');
    }
    if (!eventType || typeof eventType !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'The "eventType" parameter is required and must be a string.');
    }
    if (!actorRef || typeof actorRef !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'The "actorRef" parameter is required and must be a string (user or organization VTI ID).');
    }
    if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
      throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng.');
    }

    const vtiDoc = await db.collection('vti_registry').doc(vtiId).get();
    if (!vtiDoc.exists) {
      throw new functions.https.HttpsError('not-found', `VTI with ID ${vtiId} not found.`);
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('traceability_events').add({
      vtiId,
      timestamp,
      eventType,
      actorRef,
      geoLocation,
      payload,
      farmFieldId, // Add farmFieldId to the event
      isPublicTraceable: false,
    });
    
    return { status: 'success', message: `Event ${eventType} logged for VTI ${vtiId}` };
}

// Callable function to log a traceability event
export const logTraceEvent = functions.https.onCall(async (data, context) => {
  // Optional: Authenticate the user and validate actorRef against context.auth.uid if necessary
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to log a trace event.');
  }
  
  try {
    return await _internalLogTraceEvent(data, context);
  } catch (error: any) {
    console.error('Error in logTraceEvent callable function:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to log trace event.', error.message);
  }
});

// Callable function to handle a harvest event logged by a farmer
export const handleHarvestEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log harvest events.');
    }

    const { farmFieldId, cropType, yield_kg, quality_grade, actorVtiId, geoLocation } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') throw new functions.https.HttpsError('invalid-argument', '"farmFieldId" is required.');
    if (!cropType || typeof cropType !== 'string') throw new functions.https.HttpsError('invalid-argument', '"cropType" is required.');
    if (yield_kg !== undefined && typeof yield_kg !== 'number') throw new functions.https.HttpsError('invalid-argument', '"yield_kg" must be a number.');
    if (quality_grade !== undefined && typeof quality_grade !== 'string') throw new functions.https.HttpsError('invalid-argument', '"quality_grade" must be a string.');
    if (!actorVtiId || typeof actorVtiId !== 'string') throw new functions.https.HttpsError('invalid-argument', '"actorVtiId" is required.');

    try {
        const generateVTIResult = await _internalGenerateVTI({
            type: 'farm_batch',
            linked_vtis: [farmFieldId],
            metadata: {
                cropType,
                initial_yield_kg: yield_kg,
                initial_quality_grade: quality_grade,
                linked_pre_harvest_events: []
            }
        }, context);

        const newVtiId = generateVTIResult.vtiId;

        const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const preHarvestEventsQuery = db.collection('traceability_events')
            .where('payload.farmFieldId', '==', farmFieldId)
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(oneYearAgo))
            .where('eventType', 'in', ['PLANTED', 'INPUT_APPLIED', 'OBSERVED']);

        const preHarvestEventsSnapshot = await preHarvestEventsQuery.get();
        const linkedEventIds: string[] = preHarvestEventsSnapshot.docs.map(doc => doc.id);

        await db.collection('vti_registry').doc(newVtiId).update({
            'metadata.linked_pre_harvest_events': linkedEventIds
        });

        await _internalLogTraceEvent({
            vtiId: newVtiId,
            eventType: 'HARVESTED',
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: { yield_kg, quality_grade, farmFieldId, cropType },
            farmFieldId: farmFieldId,
        }, context);
        
        return { status: 'success', message: `Harvest event logged and VTI ${newVtiId} created.`, vtiId: newVtiId };
    } catch (error: any) {
        console.error('Error handling harvest event:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle harvest event.', error.message);
    }
});

// Callable function to handle an input application event logged by a farmer
export const handleInputApplicationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log input application events.');
    }

    const { farmFieldId, inputId, applicationDate, quantity, unit, method, actorVtiId, geoLocation } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    if (!inputId || typeof inputId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "inputId" parameter is required and must be a string (Master Data Input ID).');
    }
    if (!applicationDate) {
        throw new functions.https.HttpsError('invalid-argument', 'The "applicationDate" parameter is required.');
    }
     if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "quantity" parameter is required and must be a non-negative number.');
    }
     if (!unit || typeof unit !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "unit" parameter is required and must be a string.');
    }
     if (method !== undefined && typeof method !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "method" parameter must be a string if provided.');
     }
    if (!actorVtiId || typeof actorVtiId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "actorVtiId" parameter is required and must be a string (User or Organization VTI ID).');
    }

     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
        let fieldGeoLocation = null;
        try {
            const farmFieldDoc = await db.collection('geospatial_assets').doc(farmFieldId).get();
            if (farmFieldDoc.exists) {
                 fieldGeoLocation = farmFieldDoc.data()?.geoJson?.features?.[0]?.geometry?.coordinates;
                 if (fieldGeoLocation && Array.isArray(fieldGeoLocation) && fieldGeoLocation.length >= 2) {
                      fieldGeoLocation = new admin.firestore.GeoPoint(fieldGeoLocation[1], fieldGeoLocation[0]);
                 } else {
                     fieldGeoLocation = null;
                 }
            }
        } catch (geoError) {
             console.error('Error fetching farm field location:', geoError);
        }

        const eventPayload = {
            inputId,
            quantity,
            unit,
            applicationDate,
            method: method || null,
            farmFieldId,
        };

        await db.collection('traceability_events').add({
             timestamp: applicationDate,
             eventType: 'INPUT_APPLIED',
             actorRef: actorVtiId,
             geoLocation: geoLocation || fieldGeoLocation || null,
             payload: eventPayload,
             farmFieldId: farmFieldId,
             isPublicTraceable: false,
        });

        return { status: 'success', message: `Input application event logged for farm field ${farmFieldId}.` };

    } catch (error: any) {
        console.error('Error handling input application event:', error);
         if (error.code) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle input application event.', error.message);
    }
});

// Callable function to handle an observation event logged by a farmer
export const handleObservationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log observation events.');
    }

    const { farmFieldId, observationType, observationDate, details, mediaUrls, actorVtiId, geoLocation } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    if (!observationType || typeof observationType !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "observationType" parameter is required and must be a string.');
    }
    if (!observationDate) {
        throw new functions.https.HttpsError('invalid-argument', 'The "observationDate" parameter is required.');
    }
     if (!details || typeof details !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "details" parameter is required and must be a string.');
     }
     if (mediaUrls !== undefined && !Array.isArray(mediaUrls)) {
         throw new functions.https.HttpsError('invalid-argument', 'The "mediaUrls" parameter must be an array if provided.');
     }
    if (!actorVtiId || typeof actorVtiId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "actorVtiId" parameter is required and must be a string (User or Organization VTI ID).');
    }
    
     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
        let fieldGeoLocation = null;
        try {
            const farmFieldDoc = await db.collection('geospatial_assets').doc(farmFieldId).get();
            if (farmFieldDoc.exists) {
                 fieldGeoLocation = farmFieldDoc.data()?.geoJson?.features?.[0]?.geometry?.coordinates;
                 if (fieldGeoLocation && Array.isArray(fieldGeoLocation) && fieldGeoLocation.length >= 2) {
                      fieldGeoLocation = new admin.firestore.GeoPoint(fieldGeoLocation[1], fieldGeoLocation[0]);
                 } else {
                     fieldGeoLocation = null;
                 }
            }
        } catch (geoError) {
             console.error('Error fetching farm field location:', geoError);
        }

        const eventPayload = {
            observationType,
            details,
            mediaUrls: mediaUrls || [],
            farmFieldId, 
        };

        await _internalLogTraceEvent({
            vtiId: farmFieldId, // Log event against the farm field itself
            eventType: 'OBSERVED',
            actorRef: actorVtiId,
            geoLocation: geoLocation || fieldGeoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        });

        return { status: 'success', message: `Observation event logged for farm field ${farmFieldId}.` };

    } catch (error: any) {
        console.error('Error handling observation event:', error);
         if (error.code) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle observation event.', error.message);
    }
});

// Callable function to handle a planting event logged by a farmer
export const handlePlantingEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Allow 'farmer' and 'system' roles to log planting events
    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log planting events.');
    }

    const { farmFieldId, cropType, plantingDate, seedInputVti, method, actorVtiId, geoLocation } = data;
    
    // Basic validation for required planting data
    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    if (!cropType || typeof cropType !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "cropType" parameter is required and must be a string.');
    }
    if (!plantingDate) {
        throw new functions.https.HttpsError('invalid-argument', 'The "plantingDate" parameter is required.');
    } 
    if (seedInputVti !== undefined && typeof seedInputVti !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "seedInputVti" parameter must be a string if provided.');
     }
     if (method !== undefined && typeof method !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "method" parameter must be a string if provided.');
     }
    if (!actorVtiId || typeof actorVtiId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "actorVtiId" parameter is required and must be a string (User or Organization VTI ID).');
    }

     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
        const eventPayload = {
            cropType,
            plantingDate,
            farmFieldId,
            seedInputVti: seedInputVti || null,
            method: method || null,
        };

        await _internalLogTraceEvent({
            vtiId: farmFieldId, 
            eventType: 'PLANTED', 
             actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: eventPayload,
            farmFieldId: farmFieldId,
        }, context);

        return { status: 'success', message: `Planting event logged for farm field ${farmFieldId}.` };
    } catch (error: any) {
        console.error('Error handling planting event:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle planting event.', error.message);
    }
});
// Other functions from module1.ts... (omitted for brevity)
