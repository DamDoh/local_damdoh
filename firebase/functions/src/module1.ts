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
            payload: { yield_kg, quality_grade, farmFieldId, cropType }
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

        await db.collection('traceability_events').add({
             timestamp: observationDate,
             eventType: 'OBSERVED',
             actorRef: actorVtiId,
             geoLocation: geoLocation || fieldGeoLocation || null,
             payload: eventPayload,
             farmFieldId: farmFieldId,
             isPublicTraceable: false,
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

// Placeholder for processing new satellite imagery
export const processSatelliteImagery = functions.runWith({
  timeoutSeconds: 300, 
  memory: '1GB', 
}).https.onCall(async (data, context) => {
  const { imageryReference, timestamp, farmFieldId, provider } = data;

  if (!imageryReference || typeof imageryReference !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "imageryReference" parameter is required and must be a string.');
  }
  if (!timestamp || typeof timestamp !== 'string') {
     throw new functions.https.HttpsError('invalid-argument', 'The "timestamp" parameter is required and must be a string.');
  }
  if (!farmFieldId || typeof farmFieldId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
  }
  if (provider && typeof provider !== 'string') {
     throw new functions.https.HttpsError('invalid-argument', 'The "provider" parameter must be a string if provided.');
  }

  console.log(`Step 2: Acquiring imagery data from ${imageryReference}`);
  console.log("Step 3: Performing image preprocessing.");
  console.log("Step 4: Calculating vegetation indices (NDVI, etc.).");
  console.log(`Step 5: Aligning indices with geospatial data for farm field ${farmFieldId}.`);

  const processedImageryUrl = `gs://your-bucket/processed/${farmFieldId}/${Date.parse(timestamp)}.tif`;
  const ndviUrl = `gs://your-bucket/ndvi/${farmFieldId}/${Date.parse(timestamp)}.tif`;

  console.log(`Step 6: Storing processed data and updating geospatial asset ${farmFieldId}.`);

  const fieldRef = db.collection('geospatial_assets').doc(farmFieldId);
  try {
    await fieldRef.update({
      linkedSatelliteData: admin.firestore.FieldValue.arrayUnion({
        timestamp: new Date(timestamp),
        image_url: processedImageryUrl,
        ndvi_url: ndviUrl,
      })
    });
  }
  catch (error: any) {
      console.error(`Error updating geospatial asset ${farmFieldId}:`, error);
       throw new functions.https.HttpsError('internal', `Failed to update geospatial asset ${farmFieldId}.`, error.message);
  }

  console.log("Step 7: Triggering relevant AI models (Optional).");

  return { status: 'success', message: 'Satellite imagery processing placeholder executed.' };
});

// Placeholder for calculating carbon footprint
export const calculateCarbonFootprint = functions.firestore
  .document('traceability_events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const vtiId = eventData.vtiId;
    const eventType = eventData.eventType;
    const payload = eventData.payload;

    console.log(`Placeholder: Checking event ${eventType} for carbon footprint calculation for VTI ${vtiId}`);

    let carbonContribution = 0;

    if (eventType === 'INPUT_APPLIED' && payload && payload.inputId && payload.quantity) {
      console.log(`Placeholder: Calculating carbon from INPUT_APPLIED event for input ${payload.inputId}, quantity ${payload.quantity}.`);
       carbonContribution = Math.random() * 10;
    }

     if (eventType === 'TRANSPORTED' && payload && payload.distance_km && payload.transport_mode) {
       console.log(`Placeholder: Calculating carbon from TRANSPORTED event for distance ${payload.distance_km} km, mode ${payload.transport_mode}.`);
        carbonContribution += Math.random() * 20;
     }

    if (carbonContribution > 0) {
      console.log(`Placeholder: Updating carbon footprint for VTI ${vtiId} with contribution ${carbonContribution}`);
       const vtiRef = db.collection('vti_registry').doc(vtiId);
       await vtiRef.update({
         'metadata.carbon_footprint_kgCO2e': admin.firestore.FieldValue.increment(carbonContribution)
       });
    }

    console.log(`Placeholder: Carbon footprint calculation process for event ${snap.id} (Type: ${eventType}, VTI: ${vtiId}) completed.`);
     return null;
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
             throw error;
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
             throw error;
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

    if (!role || !['admin', 'farmer', 'system', 'marketplace', 'regulator', 'auditor', 'guest'].includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read master data products.');
    }

    const { category } = data || {}; 

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
            throw error; 
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

    if (!role || !['admin', 'farmer', 'system', 'marketplace', 'regulator', 'auditor', 'guest'].includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read master data inputs.');
    }

    const { type } = data || {};

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
            throw error; 
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

    if (!role || !['admin', 'farmer', 'system', 'auditor', 'regulator', 'guest'].includes(role)) {
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to read events for this farm field.');
    }

    const { farmFieldId, timeRange } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    
     if (timeRange && (typeof timeRange.start !== 'number' || typeof timeRange.end !== 'number')) {
         throw new functions.https.HttpsError('invalid-argument', 'The "timeRange" parameter must be an object with numeric "start" and "end" timestamps if provided.');
     }

    try {
        let query: FirebaseFirestore.Query = db.collection('traceability_events')
            .where('farmFieldId', '==', farmFieldId);

        if (timeRange) {
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
            throw error;
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
            throw error; 
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

        switch (vtiType) {
            case 'farm_batch':
            case 'processed_product':
            case 'retail_unit':
                shouldBePublic = true;
                break;
            default:
                shouldBePublic = false;
                break;
        }

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

        return null;
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

        if (['HARVESTED', 'PROCESSED', 'SOLD'].includes(eventType)) {
            shouldBePublic = true;
        }

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

        return null;
    });
