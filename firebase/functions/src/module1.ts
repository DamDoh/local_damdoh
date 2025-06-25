import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();
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

// Callable function to generate a new VTI
export const generateVTI = functions.https.onCall(async (data, context) => {
  // Optional: Authenticate the user or check for system role if necessary
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to generate VTI.');
  // }
  // Implement role check here if needed
  // const callerUid = context.auth.uid;
  // const userDoc = await db.collection('users').doc(callerUid).get();
  // const role = userDoc.data()?.primaryRole;
  // if (role !== 'system') {
  //    throw new functions.https.HttpsError('permission-denied', 'Only system processes can generate VTIs.');
  // }


  const { type, linked_vtis = [], metadata = {} } = data;

  if (!type || typeof type !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "type" parameter is required and must be a string.');
  }

  const vtiId = uuidv4();
  const creationTime = admin.firestore.FieldValue.serverTimestamp();
  const currentLocation = null; // Initial location can be null or set later
  const status = 'active'; // Initial status

  try {
    await db.collection('vti_registry').doc(vtiId).set({
      vtiId,
      type,
      creationTime,
      currentLocation,
      status,
      linked_vtis,
      metadata: { ...metadata, carbon_footprint_kgCO2e: 0 }, // Ensure carbon footprint is initialized
      isPublicTraceable: false, // Default value, can be updated later based on data or business logic
    });

    return { vtiId, status: 'success' };
  } catch (error: any) {
    console.error('Error generating VTI:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate VTI.', error.message);
  }
});

// Callable function to log a traceability event
export const logTraceEvent = functions.https.onCall(async (data, context) => {
  // Optional: Authenticate the user and validate actorRef against context.auth.uid if necessary
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to log a trace event.');
  // }
  // const callerUid = context.auth.uid;
  // Add logic to check if callerUid matches or is authorized for actorRef

  const { vtiId, eventType, actorRef, geoLocation, payload = {} } = data;

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
    throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter is required and must be an object with lat and lng.');
  }
  

  try {
    // Validate if the VTI exists
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
      isPublicTraceable: false, // Default value, can be updated later
    });

    // Optional: Update VTI status or location based on the event
    // await vtiDoc.ref.update({
    //   currentLocation: geoLocation,
    //   status: determineStatusFromEvent(eventType) // Implement logic to determine status
    // });


    return { status: 'success', message: `Event ${eventType} logged for VTI ${vtiId}` };
  } catch (error: any) {
    console.error('Error logging trace event:', error);
    if (error.code) {
         throw error; // Re-throw HttpsErrors
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

    // Allow 'farmer' and 'system' roles to log harvest events
    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log harvest events.');
    }

    const { farmFieldId, cropType, yield_kg, quality_grade, actorVtiId, geoLocation } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    if (!cropType || typeof cropType !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "cropType" parameter is required and must be a string.');
    }
     if (yield_kg !== undefined && typeof yield_kg !== 'number') {
         throw new functions.https.HttpsError('invalid-argument', 'The "yield_kg" parameter must be a number if provided.');
     }
     if (quality_grade !== undefined && typeof quality_grade !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "quality_grade" parameter must be a string if provided.');
     }
     if (!actorVtiId || typeof actorVtiId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "actorVtiId" parameter is required and must be a string (User or Organization VTI ID).');
    }

    // TODO: Implement authorization check: Verify that the callerUserId is authorized
    // to log events on behalf of the provided actorVtiId. This might involve:
    // - Checking if the caller's userVtiId matches the actorVtiId (for individual farmers).
    // - Checking if the caller is a member or contact person of the organization represented by actorVtiId.
    // Placeholder check: Assume a helper function `isAuthorizedActor` exists
    // if (!await isAuthorizedActor(callerUid, actorVtiId)) {
    //     throw new functions.https.HttpsError('permission-denied', 'User is not authorized to act on behalf of the provided VTI ID.');
    // }
    // For now, the TODO comment remains as the full implementation depends on user and organization VTI structures.


     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
        // 1. Generate a new 'farm_batch' VTI for this harvest.
        // Link the batch to the farm field.
        const generateVTIResult = await generateVTI({
            type: 'farm_batch',
            linked_vtis: [farmFieldId], // Link the harvest batch to the farm field
            metadata: {
                cropType,
                initial_yield_kg: yield_kg,
                initial_quality_grade: quality_grade,
                linked_pre_harvest_events: [] // Initialize array to store linked event IDs
            }
        }, context); // Pass context to preserve authentication information

        const newVtiId = generateVTIResult.vtiId;

        // 2. Query for relevant pre-harvest events linked to this farm field.
        // We'll look for events like PLANTED, INPUT_APPLIED, OBSERVED associated with this farmFieldId.
        // A time frame is crucial to avoid linking unrelated past events.
        // For simplicity here, we'll query events in the last year.
        // In a real application, the time frame might be determined by the planting date
        // or the start of the growing season for this specific field.
        const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const preHarvestEventsQuery = db.collection('traceability_events')
            .where('payload.farmFieldId', '==', farmFieldId) // Assuming farmFieldId is in the payload for pre-harvest events
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(oneYearAgo)) // Events within the last year
            .where('eventType', 'in', ['PLANTED', 'INPUT_APPLIED', 'OBSERVED']); // Filter for relevant event types

        const preHarvestEventsSnapshot = await preHarvestEventsQuery.get();

        const linkedEventIds: string[] = [];
        if (!preHarvestEventsSnapshot.empty) {
             preHarvestEventsSnapshot.forEach(doc => {
                 linkedEventIds.push(doc.id); // Collect the document IDs of relevant events
             });
        }

        // 3. Link the found pre-harvest event IDs to the new harvest VTI's metadata.
        await db.collection('vti_registry').doc(newVtiId).update({
            'metadata.linked_pre_harvest_events': linkedEventIds
        });

        // 2. Log the 'HARVESTED' event for the new VTI
        await logTraceEvent({
            vtiId: newVtiId,
            eventType: 'HARVESTED',
            actorRef: actorVtiId,
            geoLocation: geoLocation || null,
            payload: { yield_kg, quality_grade, farmFieldId, cropType } // Include harvest details in payload
        }, context); // Pass context to preserve authentication information
        
        return { status: 'success', message: `Harvest event logged and VTI ${newVtiId} created.`, vtiId: newVtiId };
    } catch (error: any) {
        console.error('Error handling harvest event:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle harvest event.', error.message);
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

    // TODO: Implement authorization check: Verify that the callerUserId is authorized
    // to log events on behalf of the provided actorVtiId. This might involve:
    // - Checking if the caller's userVtiId matches the actorVtiId (for individual farmers).
    // - Checking if the caller is a member or contact person of the organization represented by actorVtiId.
    // Placeholder check: Assume a helper function `isAuthorizedActor` exists
    // if (!await isAuthorizedActor(callerUid, actorVtiId)) {
    //     throw new functions.https.HttpsError('permission-denied', 'User is not authorized to act on behalf of the provided VTI ID.');
    // }
    // For now, the TODO comment remains as the full implementation depends on user and organization VTI structures.


     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
         // No VTI is created at planting based on the chosen strategy.
        // The event will be linked to the farm field and later to the harvest batch VTI.
        // Log the 'PLANTED' event for the new VTI
        const eventPayload = {
            cropType,
            plantingDate,
            farmFieldId,
            seedInputVti: seedInputVti || null,
            method: method || null,
             // Add other relevant planting details to the payload
        };

        await logTraceEvent({
            vtiId: farmFieldId, // Link the event to the farm field ID as a temporary measure
            eventType: 'PLANTED', 
             actorRef: actorVtiId, // The user or organization VTI who logged the event
            geoLocation: geoLocation || null,
            payload: eventPayload,
        }, context); // Pass context to preserve authentication information

        return { status: 'success', message: `Planting event logged for farm field ${farmFieldId}.` };
    } catch (error: any) {
        console.error('Error handling planting event:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle planting event.', error.message);
    }
});

// Callable function to handle an input application event logged by a farmer
export const handleInputApplicationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Allow 'farmer' and 'system' roles to log input application events
    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log input application events.');
    }

    const { farmFieldId, inputId, applicationDate, quantity, unit, method, actorVtiId, geoLocation } = data;

    // Basic validation for required input application data
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

    // TODO: Implement authorization check: Verify that the callerUserId is authorized
    // to log events on behalf of the provided actorVtiId. This might involve:
    // - Checking if the caller's userVtiId matches the actorVtiId (for individual farmers).
    // - Checking if the caller is a member or contact person of the organization represented by actorVtiId.
    // Placeholder check: Assume a helper function `isAuthorizedActor` exists
    // if (!await isAuthorizedActor(callerUid, actorVtiId)) {
    //     throw new functions.https.HttpsError('permission-denied', 'User is not authorized to act on behalf of the provided VTI ID.');
    // }
    // For now, the TODO comment remains as the full implementation depends on user and organization VTI structures.


     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
         // Optional: Fetch geoLocation from geospatial_assets using farmFieldId
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

        // Log the 'INPUT_APPLIED' event
        const eventPayload = {
            inputId,
            quantity,
            unit,
            applicationDate,
            method: method || null,
            farmFieldId, // Link to the farm field ID
        };

        await db.collection('traceability_events').add({
             timestamp: applicationDate,
             eventType: 'INPUT_APPLIED',
             actorRef: actorVtiId,
             geoLocation: geoLocation || fieldGeoLocation || null, // Use provided location or field location
             payload: eventPayload,
             farmFieldId: farmFieldId, // Add farmFieldId for easier querying
             isPublicTraceable: false, // Default value, can be updated later
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

    // Allow 'farmer' and 'system' roles to log observation events
    if (role !== 'farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log observation events.');
    }

    const { farmFieldId, observationType, observationDate, details, mediaUrls, actorVtiId, geoLocation } = data;

    // Basic validation for required observation data
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
     // TODO: Implement authorization check: Verify that the callerUserId is authorized
     // to log events on behalf of the provided actorVtiId. This might involve:
     // - Checking if the caller's userVtiId matches the actorVtiId (for individual farmers).
     // - Checking if the caller is a member or contact person of the organization represented by actorVtiId.
    }
     if (geoLocation && (typeof geoLocation.lat !== 'number' || typeof geoLocation.lng !== 'number')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "geoLocation" parameter must be an object with lat and lng if provided.');
    }

    try {
         // Optional: Fetch geoLocation from geospatial_assets using farmFieldId
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

        // Log the 'OBSERVED' event
        const eventPayload = {
            observationType,
            details,
            mediaUrls: mediaUrls || [],
            farmFieldId, // Link to the farm field ID
        };

        await db.collection('traceability_events').add({
             timestamp: observationDate,
             eventType: 'OBSERVED',
             actorRef: actorVtiId,
             geoLocation: geoLocation || fieldGeoLocation || null, // Use provided location or field location
             payload: eventPayload,
             farmFieldId: farmFieldId, // Add farmFieldId for easier querying
             isPublicTraceable: false, // Default value, can be updated later
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

// --- Geolocation Helper Functions (Integrated from geolocation.ts) ---

// Hypothetical geohashing library interface - replace with a real library like 'geofire-common'
// This is a simplified representation to illustrate the concept.
interface GeoHashRange {
  start: string;
  end: string;
}

// Integrated from geolocation.ts
function getGeohashQueryBounds(
  latitude: number,
  longitude: number,
  radiusInKm: number
): GeoHashRange[] {
  // In a real implementation, use a library like geofire-common
  // Example using geofire-common (conceptual):
  // const center = [latitude, longitude];
  // const bounds = geofire.geohashQueryBounds(center, radiusInMeters); // radiusInMeters needed for geofire
  // return bounds.map(b => ({ start: b[0], end: b[1] }));

  // This is a simplified placeholder
  functions.logger.warn('Using hypothetical geohashing. Replace with a real library.');
  // Calculate a basic geohash for the center
  const centerGeohash = calculateBasicGeohash(latitude, longitude);
  // Determine a range based on radius (highly simplified)
  // A real library handles complex edge cases and multiple ranges
  const rangeLength = Math.ceil(radiusInKm / 100); // Very rough estimate
  const startGeohash = decrementGeohash(centerGeohash, rangeLength);
  const endGeohash = incrementGeohash(centerGeohash, rangeLength);

  return [{ start: startGeohash, end: endGeohash }];
}

// Placeholder for basic geohash calculation (replace with library) - Integrated from geolocation.ts
function calculateBasicGeohash(latitude: number, longitude: number, precision = 9): string {
    // This is a highly simplified and likely inaccurate placeholder
    // Real geohashing involves interleaving bits of lat/lon
    const latBits = Math.floor(((latitude + 90) / 180) * (1 << (precision * 2 / 2)));
    const lonBits = Math.floor(((longitude + 180) / 360) * (1 << (precision * 2 / 2)));
     // Interleave lat and lon bits (simplified)
    let geohash = '';
    for (let i = 0; i < precision; i++) {
        geohash += ((lonBits >> (precision - 1 - i)) & 1);
        geohash += ((latBits >> (precision - 1 - i)) & 1);
    }
    // Convert binary to base32 (simplified)
    return binaryToBase32(geohash);
}

// Placeholder for basic binary to base32 conversion (replace with library) - Integrated from geolocation.ts
function binaryToBase32(binary: string): string {
    const base32Chars = '0123456789bcdefghjkmnpqrstuvwxyz'; // Base32 characters
    let base32 = '';
    for (let i = 0; i < binary.length; i += 5) {
        const fiveBits = binary.substr(i, 5);
        const decimalValue = parseInt(fiveBits, 2);
        base32 += base32Chars[decimalValue];
    }
    return base32;
}


// Placeholder for basic geohash increment/decrement (replace with library) - Integrated from geolocation.ts
function incrementGeohash(geohash: string, steps: number): string {
  // This is a highly simplified placeholder
  // Real geohash neighbors are complex
  functions.logger.warn('Using hypothetical geohash increment. Replace with a real library.');
  return geohash.slice(0, -steps) + String.fromCharCode(geohash.charCodeAt(geohash.length - steps) + 1); // Very basic manipulation
}

// Placeholder for basic geohash decrement (replace with library) - Integrated from geolocation.ts
function decrementGeohash(geohash: string, steps: number): string {
    // This is a highly simplified placeholder
    functions.logger.warn('Using hypothetical geohash decrement. Replace with a real library.');
     return geohash.slice(0, -steps) + String.fromCharCode(geohash.charCodeAt(geohash.length - steps) - 1); // Very basic manipulation
}


// Helper function (example - you would need to implement this fully)
// function determineStatusFromEvent(eventType: string): string {
//   switch (eventType) {
//     case 'HARVESTED': return 'harvested';
//     case 'PROCESSED': return 'processed';
//     case 'TRANSPORTED': return 'in_transit';
//     case 'SOLD': return 'sold';
//     default: return 'active'; // Default status
//   }
// }

// Placeholder for processing new satellite imagery
// Triggered by new satellite data feeds (e.g., from an API or Cloud Storage bucket).
// Processes the image, calculates indices, links to geospatial_assets, and stores summarized data.
export const processSatelliteImagery = functions.runWith({
  timeoutSeconds: 300, // Allow longer execution time for processing
  memory: '1GB', // Increase memory for image processing
}).https.onCall(async (data, context) => {
  // This is a placeholder function.
  // Purpose: Process newly available satellite imagery and link it to the relevant geospatial assets.
  // Trigger: Could be triggered by a cron job, a new file upload to Cloud Storage, or a Pub/Sub message from an external system.
  // Inputs:
  // - `imageryReference`: Reference to the raw satellite imagery data (e.g., Cloud Storage path, external API identifier).
  // - `timestamp`: Timestamp of the satellite image.
  // - `farmFieldId`: The VTI ID for the `geospatial_asset` (type 'farm_field') this imagery is relevant to.
  // - `provider`: Optional: Name of the satellite data provider (e.g., 'Sentinel-2', 'Planet').

  // 1. **Input Validation:** Check if necessary inputs (`imageUrl`, `timestamp`, `fieldIds`) are provided and valid.
  const { imageryReference, timestamp, farmFieldId, provider } = data;

  if (!imageryReference || typeof imageryReference !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "imageryReference" parameter is required and must be a string.');
  }
  if (!timestamp || typeof timestamp !== 'string') { // Expecting a string timestamp that can be parsed
     throw new functions.https.HttpsError('invalid-argument', 'The "timestamp" parameter is required and must be a string.');
  }
  if (!farmFieldId || typeof farmFieldId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
  }
  if (provider && typeof provider !== 'string') {
     throw new functions.https.HttpsError('invalid-argument', 'The "provider" parameter must be a string if provided.');
  }

  // 2. **Image Acquisition:** Download or access the raw satellite image data. This might involve authentication with a third-party API.
  console.log(`Step 2: Acquiring imagery data from ${imageryReference}`);
  // TODO: Implement actual image data acquisition logic (e.g., call external API, read from Cloud Storage).

  // 3. **Preprocessing:** Apply atmospheric correction, cloud masking, and other preprocessing steps to the image. This can be computationally intensive.
  console.log("Step 3: Performing image preprocessing.");
  // TODO: Implement image preprocessing logic.

  // 4. **Index Calculation:** Calculate relevant vegetation indices (NDVI, EVI, NDWI, LAI, etc.) from the preprocessed image.
  console.log("Step 4: Calculating vegetation indices (NDVI, etc.).");
  // TODO: Implement index calculation logic.

  // 5. **Geospatial Alignment:** Align the calculated indices with the GeoJSON data stored in the `geospatial_assets` collection for the given `farmFieldId`.
  console.log(`Step 5: Aligning indices with geospatial data for farm field ${farmFieldId}.`);
  // TODO: Fetch the GeoJSON for farmFieldId from 'geospatial_assets' and perform spatial alignment.

  // 6. **Data Storage:**
  //    - Store the derived index data (e.g., NDVI layer) in Cloud Storage.
  //    - Update the `geospatial_assets` document for the `farmFieldId` with links to the processed image and index URLs.
  //    - Store summarized data (e.g., average NDVI for the field) in Firestore for quick access.
  //    - Push detailed derived data to BigQuery for in-depth analytics and reporting (Module 8).

  // Simulate processing
  const processedImageryUrl = `gs://your-bucket/processed/${farmFieldId}/${Date.parse(timestamp)}.tif`; // Example Cloud Storage path
  const ndviUrl = `gs://your-bucket/ndvi/${farmFieldId}/${Date.parse(timestamp)}.tif`; // Example Cloud Storage path

  console.log(`Step 6: Storing processed data and updating geospatial asset ${farmFieldId}.`);
  // TODO: Implement actual storage of processed data (e.g., to Cloud Storage).
  // TODO: Implement pushing detailed derived data to BigQuery (Module 8).

  // Update the geospatial_assets document
  const fieldRef = db.collection('geospatial_assets').doc(farmFieldId);
  try {
    await fieldRef.update({
      linkedSatelliteData: admin.firestore.FieldValue.arrayUnion({
        timestamp: new Date(timestamp), // Convert timestamp string to Date object
        image_url: processedImageryUrl,
        ndvi_url: ndviUrl,
      })
    });
  }
  catch (error: any) {
      console.error(`Error updating geospatial asset ${farmFieldId}:`, error);
      // Consider throwing an error or handling partial failure
       throw new functions.https.HttpsError('internal', `Failed to update geospatial asset ${farmFieldId}.`, error.message);
  }


  // 7. **Trigger AI Models (Optional):** Based on the new satellite data, trigger relevant AI models in Module 8 (e.g., for yield prediction, disease detection) and store the results.
  console.log("Step 7: Triggering relevant AI models (Optional).");
  // TODO: Implement triggering AI models in Module 8 (e.g., via Pub/Sub, Callable Function).

  return { status: 'success', message: 'Satellite imagery processing placeholder executed.' };
});

// Placeholder for calculating carbon footprint
// Triggered by new traceability_events (especially input application, transport).
// Updates vti_registry.metadata.carbon_footprint_kgCO2e.
export const calculateCarbonFootprint = functions.firestore
  .document('traceability_events/{eventId}')
  .onCreate(async (snap, context) => {
    // This is a placeholder function.
    // **Purpose:** Calculate the carbon footprint contribution of a newly logged traceability event and update the associated VTI.
    // **Trigger:** Triggered automatically whenever a new document is created in the `traceability_events` collection.
    // **Inputs:** The newly created traceability event document.
    // **Steps:**
    // 1. **Access Event Data:** Retrieve the `vtiId`, `eventType`, and `payload` from the newly created event.
    // 2. **Identify Relevant Events:** Check if the `eventType` is one that contributes to the carbon footprint (e.g., 'INPUT_APPLIED', 'TRANSPORTED', 'ENERGY_CONSUMED').
    // 3. **Retrieve Supporting Data:** Based on the `eventType`, fetch necessary data from other collections:
    //    - For 'INPUT_APPLIED': Get details about the input from `master_data_inputs` using `payload.inputId`.
    //    - For 'TRANSPORTED': Get details about the transport (distance, mode) from the `payload`.
    //    - For other events: Retrieve relevant data from their payloads or linked documents.
    // 4. **Fetch Emission Factors:** Obtain the relevant emission factors. These factors can vary significantly by region, input type, transport mode, etc.
    //    - Emission factors could be stored in a dedicated `master_data_emission_factors` collection or managed within Module 8's AI Hub.
    // 5. **Calculate Contribution:** Apply the emission factors to the event data (e.g., quantity of input applied, distance traveled) to calculate the carbon footprint contribution in kg CO2e.
    // 6. **Update VTI Metadata:**
    //    - Get the reference to the associated VTI document in the `vti_registry` collection.
    //    - Atomically increment the `metadata.carbon_footprint_kgCO2e` field by the calculated contribution using `admin.firestore.FieldValue.increment()`. This is crucial for preventing race conditions if multiple events for the same VTI are processed concurrently.
    // 7. **Error Handling:** Implement robust error handling for cases like missing VTI, invalid event data, or inability to fetch emission factors.
    // 8. **Logging:** Log the calculation process and any errors for monitoring and debugging.
    // 9. **Return Value:** Background triggers should return `null` or a Promise resolving to `null`.

    // --- Placeholder Logic ---

    const eventData = snap.data();
    const vtiId = eventData.vtiId;
    const eventType = eventData.eventType;
    const payload = eventData.payload;

    console.log(`Placeholder: Checking event ${eventType} for carbon footprint calculation for VTI ${vtiId}`);

    // 1. Access Event Data: Retrieve the `vtiId`, `eventType`, and `payload` from the newly created event.
    // This is already done by the trigger's `snap.data()`.

    let carbonContribution = 0; // Placeholder for calculated carbon

    // Example placeholder logic: Calculate based on input application
    if (eventType === 'INPUT_APPLIED' && payload && payload.inputId && payload.quantity) {
      // In a real scenario, fetch emission factor for inputId and calculate
      console.log(`Placeholder: Calculating carbon from INPUT_APPLIED event for input ${payload.inputId}, quantity ${payload.quantity}.`);
      // carbonContribution = fetchEmissionFactor(payload.inputId) * payload.quantity; // Example

      // 3. Retrieve Supporting Data: For 'INPUT_APPLIED', get details about the input from `master_data_inputs` using `payload.inputId`.
      // 4. Fetch Emission Factors: Obtain the relevant emission factors for this input and quantity.
      // TODO: Implement fetching input details and emission factors.
      // const inputDoc = await db.collection('master_data_inputs').doc(payload.inputId).get();
      // const emissionFactor = inputDoc.data()?.emission_factor; // Example: assuming emission factor is stored in master data
      // if (emissionFactor) {
      //   carbonContribution = emissionFactor * payload.quantity;
      // }

       carbonContribution = Math.random() * 10; // Simulate a small random contribution
    }

    // Example placeholder logic: Calculate based on transport
     if (eventType === 'TRANSPORTED' && payload && payload.distance_km && payload.transport_mode) {
       console.log(`Placeholder: Calculating carbon from TRANSPORTED event for distance ${payload.distance_km} km, mode ${payload.transport_mode}.`);

       // 3. Retrieve Supporting Data: Get details about the transport (distance, mode) from the `payload`.
       // 4. Fetch Emission Factors: Obtain the relevant emission factors for this transport mode and distance.
       // TODO: Implement fetching transport emission factors.
       // const transportEmissionFactor = await getTransportEmissionFactor(payload.transport_mode); // Example helper function
       // carbonContribution = calculateTransportEmissions(payload.distance_km, payload.transport_mode); // Example
       // if (transportEmissionFactor) {
       //   carbonContribution = transportEmissionFactor * payload.distance_km;
       // }
        carbonContribution += Math.random() * 20; // Simulate a larger random contribution
     }
    // 2. Identify Relevant Events: The if conditions above handle this.

    if (carbonContribution > 0) {
      console.log(`Placeholder: Updating carbon footprint for VTI ${vtiId} with contribution ${carbonContribution}`);
       const vtiRef = db.collection('vti_registry').doc(vtiId);
       await vtiRef.update({
         'metadata.carbon_footprint_kgCO2e': admin.firestore.FieldValue.increment(carbonContribution)
       });
    }
    // 6. Update VTI Metadata: The update call above handles this.

    console.log(`Placeholder: Carbon footprint calculation process for event ${snap.id} (Type: ${eventType}, VTI: ${vtiId}) completed.`);

     // 9. Return Value: Background triggers should return `null` or a Promise resolving to `null`.
     return null; // Background triggers should return null or a Promise resolving to null
  });

// Callable functions for managing Master Data Products
export const createMasterDataProduct = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create master data products.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can create master data products.');
    }

    const { productId, name_en, name_local, category, unit, certifications = [] } = data;

    if (!productId || typeof productId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "productId" parameter is required and must be a string.');
    }
    if (!name_en || typeof name_en !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "name_en" parameter is required and must be a string.');
    }
    if (!category || typeof category !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "category" parameter is required and must be a string.');
    }
    if (!unit || typeof unit !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "unit" parameter is required and must be a string.');
    }
    if (name_local && typeof name_local !== 'object') {
         throw new functions.https.HttpsError('invalid-argument', 'The "name_local" parameter must be an object.');
    }
    if (!Array.isArray(certifications)) {
         throw new functions.https.HttpsError('invalid-argument', 'The "certifications" parameter must be an array.');
    }

    try {
        await db.collection('master_data_products').doc(productId).set({
            productId,
            name_en,
            name_local: name_local || {},
            category,
            unit,
            certifications,
        });
        return { status: 'success', message: `Master data product ${productId} created.` };
    } catch (error: any) {
        console.error('Error creating master data product:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create master data product.', error.message);
    }
});

export const updateMasterDataProduct = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update master data products.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can update master data products.');
    }

    const { productId, ...updateData } = data;

    if (!productId || typeof productId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "productId" parameter is required and must be a string.');
    }
    if (Object.keys(updateData).length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'No update data provided.');
    }

    try {
        const productRef = db.collection('master_data_products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
             throw new functions.https.HttpsError('not-found', `Master data product with ID ${productId} not found.`);
        }

        await productRef.update(updateData);
        return { status: 'success', message: `Master data product ${productId} updated.` };
    } catch (error: any) {
        console.error('Error updating master data product:', error);
        if (error.code) {
             throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to update master data product.', error.message);
    }
});

export const deleteMasterDataProduct = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete master data products.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can delete master data products.');
    }

    const { productId } = data;

    if (!productId || typeof productId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "productId" parameter is required and must be a string.');
    }

    try {
        await db.collection('master_data_products').doc(productId).delete();
        return { status: 'success', message: `Master data product ${productId} deleted.` };
    } catch (error: any) {
        console.error('Error deleting master data product:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete master data product.', error.message);
    }
});

// Callable functions for managing Master Data Inputs
export const createMasterDataInput = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create master data inputs.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can create master data inputs.');
    }

    const { inputId, name_en, name_local, type, composition, certifications = [] } = data;

    if (!inputId || typeof inputId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "inputId" parameter is required and must be a string.');
    }
    if (!name_en || typeof name_en !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "name_en" parameter is required and must be a string.');
    }
     if (!type || typeof type !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "type" parameter is required and must be a string.');
    }
     if (!composition || typeof composition !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "composition" parameter is required and must be a string.');
    }
    if (name_local && typeof name_local !== 'object') {
         throw new functions.https.HttpsError('invalid-argument', 'The "name_local" parameter must be an object.');
    }
    if (!Array.isArray(certifications)) {
         throw new functions.https.HttpsError('invalid-argument', 'The "certifications" parameter must be an array.');
    }

    try {
        await db.collection('master_data_inputs').doc(inputId).set({
            inputId,
            name_en,
            name_local: name_local || {},
            type,
            composition,
            certifications,
        });
        return { status: 'success', message: `Master data input ${inputId} created.` };
    } catch (error: any) {
        console.error('Error creating master data input:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create master data input.', error.message);
    }
});

export const updateMasterDataInput = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update master data inputs.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can update master data inputs.');
    }

    const { inputId, ...updateData } = data;

    if (!inputId || typeof inputId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "inputId" parameter is required and must be a string.');
    }
    if (Object.keys(updateData).length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'No update data provided.');
    }

    try {
        const inputRef = db.collection('master_data_inputs').doc(inputId);
        const inputDoc = await inputRef.get();
        if (!inputDoc.exists) {
             throw new functions.https.HttpsError('not-found', `Master data input with ID ${inputId} not found.`);
        }

        await inputRef.update(updateData);
        return { status: 'success', message: `Master data input ${inputId} updated.` };
    } catch (error: any) {
        console.error('Error updating master data input:', error);
         if (error.code) {
             throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to update master data input.', error.message);
    }
});

export const deleteMasterDataInput = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete master data inputs.');
    }
    const role = await getRole(context.auth.uid);
    if (role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only system processes can delete master data inputs.');
    }

    const { inputId } = data;

    if (!inputId || typeof inputId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "inputId" parameter is required and must be a string.');
    }

    try {
        await db.collection('master_data_inputs').doc(inputId).delete();
        return { status: 'success', message: `Master data input ${inputId} deleted.` };
    } catch (error: any) {
        console.error('Error deleting master data input:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete master data input.', error.message);
    }
});

// Callable function to retrieve all master data products, optionally filtered by category
export const getMasterDataProducts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Allow specific roles (e.g., admin, farmer, system, marketplace) to read master data
    if (!role || !['admin', 'farmer', 'system', 'marketplace', 'regulator', 'auditor', 'guest'].includes(role)) { // Added 'guest' for public access to master data
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read master data products.');
    }

    const { category } = data || {}; // Optional category filter

    try {
        let query: FirebaseFirestore.Query = db.collection('master_data_products');

        if (category && typeof category === 'string') {
            query = query.where('category', '==', category);
        } else if (category !== undefined) {
             throw new functions.https.HttpsError('invalid-argument', 'The "category" parameter must be a string if provided.');
        }

        const snapshot = await query.get();

        const products: any[] = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        return { products };

    } catch (error: any) {
        console.error('Error retrieving master data products:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to retrieve master data products.', error.message);
    }
});

// Callable function to retrieve all master data inputs, optionally filtered by type
export const getMasterDataInputs = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Allow specific roles (e.g., admin, farmer, system, marketplace) to read master data
    if (!role || !['admin', 'farmer', 'system', 'marketplace', 'regulator', 'auditor', 'guest'].includes(role)) { // Added 'guest' for public access to master data
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read master data inputs.');
    }

    const { type } = data || {}; // Optional type filter

    try {
        let query: FirebaseFirestore.Query = db.collection('master_data_inputs');

        if (type && typeof type === 'string') {
            query = query.where('type', '==', type);
        } else if (type !== undefined) {
             throw new functions.https.HttpsError('invalid-argument', 'The "type" parameter must be a string if provided.');
        }

        const snapshot = await query.get();

        const inputs: any[] = [];
        snapshot.forEach(doc => {
            inputs.push({ id: doc.id, ...doc.data() });
        });

        return { inputs };

    } catch (error: any) {
        console.error('Error retrieving master data inputs:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to retrieve master data inputs.', error.message);
    }
});

// Callable function to retrieve traceability events for a specific farm field, optionally within a time range
export const getTraceabilityEventsByFarmField = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Allow roles that need to see farm field activities (e.g., farmer, admin, system, auditor, regulator)
    if (!role || !['admin', 'farmer', 'system', 'auditor', 'regulator', 'guest'].includes(role)) { // Added 'guest' for public access to farm field events linked to public VTIs/fields
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read events for this farm field.');
    }

    const { farmFieldId, timeRange } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
     // TODO: Add logic to check if the caller is the owner of the farm field (by querying geospatial_assets)
     // and grant access if they are, regardless of role.
     // This would require fetching the farm field doc and comparing ownerRef with callerUid.

     if (timeRange && (typeof timeRange.start !== 'number' || typeof timeRange.end !== 'number')) {
         throw new functions.https.HttpsError('invalid-argument', 'The "timeRange" parameter must be an object with numeric "start" and "end" timestamps if provided.');
     }

    try {
        let query: FirebaseFirestore.Query = db.collection('traceability_events')
            .where('farmFieldId', '==', farmFieldId); // Assuming farmFieldId is a top-level field for easier querying

        if (timeRange) {
             // Ensure we can query by timestamp range with farmFieldId. Compound index might be needed.
             // Firestore query limitations: Cannot use range filters on different fields unless one is equality.
             // The farmFieldId equality filter allows timestamp range.
             // Index: traceability_events_farmFieldId_timestamp (ASC)

            query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromMillis(timeRange.start))
                         .where('timestamp', '<=', admin.firestore.Timestamp.fromMillis(timeRange.end));
        }

        const eventsSnapshot = await query.orderBy('timestamp', 'asc').get();

        const events: any[] = [];
        eventsSnapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        return { farmFieldId, events };

    } catch (error: any) {
        console.error('Error retrieving traceability events by farm field:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to retrieve traceability events by farm field.', error.message);
    }
});

// Callable function to set the isPublicTraceable flag on a VTI or Traceability Event
export const setIsPublicTraceable = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Only allow 'admin' or 'system' roles to set public traceability flags
    if (role !== 'admin' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to set public traceability flags.');
    }

    const { collection, documentId, isPublicTraceable } = data;

    if (!collection || (collection !== 'vti_registry' && collection !== 'traceability_events')) {
        throw new functions.https.HttpsError('invalid-argument', 'The "collection" parameter must be either "vti_registry" or "traceability_events".');
    }
    if (!documentId || typeof documentId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "documentId" parameter is required and must be a string.');
    }
    if (typeof isPublicTraceable !== 'boolean') {
        throw new functions.https.HttpsError('invalid-argument', 'The "isPublicTraceable" parameter is required and must be a boolean.');
    }

    try {
        const docRef = db.collection(collection).doc(documentId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', `Document with ID ${documentId} not found in collection ${collection}.`);
        }

        await docRef.update({
            isPublicTraceable: isPublicTraceable
        });

        return { status: 'success', message: `isPublicTraceable flag set to ${isPublicTraceable} for document ${documentId} in collection ${collection}.` };

    } catch (error: any) {
        console.error('Error setting isPublicTraceable flag:', error);
         if (error.code) {
            throw error; // Re-throw HttpsErrors
        }
        throw new functions.https.HttpsError('internal', 'Failed to set isPublicTraceable flag.', error.message);
    }
});

// Firestore trigger to automatically set isPublicTraceable for new VTI documents
export const onCreateVtiRegistryDocument = functions.firestore
    .document('vti_registry/{vtiId}')
    .onCreate(async (snap, context) => {
        const vtiData = snap.data();
        const vtiId = context.params.vtiId;
        const vtiType = vtiData.type;

        console.log(`onCreateVtiRegistryDocument triggered for VTI ${vtiId} of type ${vtiType}`);

        let shouldBePublic = false;

        // Define rules for automatic public traceability based on VTI type
        switch (vtiType) {
            case 'farm_batch': // Automatically make farm batches publicly traceable
            case 'processed_product': // Automatically make processed products publicly traceable
            case 'retail_unit': // Automatically make retail units publicly traceable
                shouldBePublic = true;
                break;
            case 'farm_field': // Farm fields might be public depending on farmer preference, maybe not automatic
            case 'user': // User VTIs are generally not public
            case 'organization': // Organization VTIs are generally not public
            case 'input_batch': // Input batches might not be public
            default:
                shouldBePublic = false;
                break;
        }

        // Update the document if the flag needs to be set to true and it's currently false (default)
        if (shouldBePublic && vtiData.isPublicTraceable === false) {
            try {
                await snap.ref.update({
                    isPublicTraceable: true
                });
                console.log(`VTI ${vtiId} marked as public traceable based on type: ${vtiType}`);
            } catch (error) {
                console.error(`Error updating isPublicTraceable for VTI ${vtiId}:`, error);
            }
        }

        return null; // Background triggers should return null or a Promise resolving to null
    });

// Firestore trigger to automatically set isPublicTraceable for new Traceability Event documents
export const onCreateTraceabilityEventDocument = functions.firestore
    .document('traceability_events/{eventId}')
    .onCreate(async (snap, context) => {
        const eventData = snap.data();
        const eventId = context.params.eventId;
        const eventType = eventData.eventType;

        console.log(`onCreateTraceabilityEventDocument triggered for event ${eventId} of type ${eventType}`);

        let shouldBePublic = false;

        // Define rules for automatic public traceability based on event type
        // Events marking key milestones or end-points in the chain are often public
        if (['HARVESTED', 'PROCESSED', 'SOLD'].includes(eventType)) {
            shouldBePublic = true;
        }

        // Update the document if the flag needs to be set to true and it's currently false (default)
        if (shouldBePublic && eventData.isPublicTraceable === false) {
            try {
                await snap.ref.update({
                    isPublicTraceable: true
                });
                console.log(`Event ${eventId} marked as public traceable based on event type: ${eventType}`);
            } catch (error) {
                console.error(`Error updating isPublicTraceable for event ${eventId}:`, error);
            }
        }

        return null; // Background triggers should return null or a Promise resolving to null
    });
