
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getRole } from './module2';
import { getGenerativeModel } from 'firebase-ai-kit';

const db = admin.firestore();

// --- Conceptual Data Models (TypeScript Interfaces) ---

// Represents an entry in the vti_registry collection
interface VtiRegistryEntry {
  vtiId: string;
  type: string; 
  creationTime: admin.firestore.FieldValue; 
  currentLocation: admin.firestore.GeoPoint | null; 
  status: string; 
  linked_vtis: string[]; 
  metadata: {
    [key: string]: any; 
    carbon_footprint_kgCO2e: number; 
    linkedPreHarvestEvents?: string[]; 
    farmFieldId?: string; 
    plantingDate?: admin.firestore.Timestamp; 
 };
  isPublicTraceable: boolean; 
}

interface TraceabilityEvent {
  vtiId: string; 
  timestamp: admin.firestore.FieldValue | admin.firestore.Timestamp; 
 eventType: string; 
  actorRef: string; 
  geoLocation: admin.firestore.GeoPoint | null; 
  payload: {
    [key: string]: any; 
  };
  farmFieldId?: string;
  isPublicTraceable: boolean; 
}

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

export const generateVTI = functions.https.onCall(async (data, context) => {
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
      // Allow logging against farmFieldId even if no batch VTI exists yet
      if (!farmFieldId) {
        throw new functions.https.HttpsError('not-found', `VTI with ID ${vtiId} not found.`);
      }
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('traceability_events').add({
      vtiId,
      timestamp,
      eventType,
      actorRef,
      geoLocation,
      payload,
      farmFieldId, 
      isPublicTraceable: false,
    });
    
    return { status: 'success', message: `Event ${eventType} logged for VTI ${vtiId}` };
}

export const logTraceEvent = functions.https.onCall(async (data, context) => {
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

export const handleHarvestEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'Farmer' && role !== 'system') {
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
            .where('farmFieldId', '==', farmFieldId)
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
            throw error; 
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle harvest event.', error.message);
    }
});

export const handleInputApplicationEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'Farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log input application events.');
    }

    const { farmFieldId, inputId, applicationDate, quantity, unit, method, actorVtiId, geoLocation } = data;

    if (!farmFieldId || typeof farmFieldId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldId" parameter is required and must be a string.');
    }
    if (!inputId || typeof inputId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "inputId" parameter is required and must be a string (e.g., KNF Batch Name, Fertilizer Name).');
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
             eventType: 'INPUT_APPLIED',
             actorRef: actorVtiId,
             geoLocation: geoLocation || null,
             payload: eventPayload,
             farmFieldId: farmFieldId,
        }, context);

        return { status: 'success', message: `Input application event logged for farm field ${farmFieldId}.` };

    } catch (error: any) {
        console.error('Error handling input application event:', error);
         if (error.code) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle input application event.', error.message);
    }
});


export const handleObservationEvent = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { farmFieldId, observationType, observationDate, details, mediaUrls, actorVtiId, geoLocation } = data;

    if (!farmFieldId || !observationType || !observationDate || !details || !actorVtiId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields for observation event.');
    }

    try {
        const eventPayload: any = { observationType, details, mediaUrls: mediaUrls || [], farmFieldId };

        if (mediaUrls && mediaUrls.length > 0) {
            const model = getGenerativeModel({ model: "gemini-pro-vision" });
            const prompt = `Analyze this image of a crop observation. The farmer reported the following: "${details}". What do you see? Provide a brief analysis.`;
            const imagePart = { inlineData: { data: mediaUrls[0], mimeType: 'image/jpeg' } };

            try {
                const result = await model.generateContent([prompt, imagePart]);
                eventPayload.aiAnalysis = result.response.text();
            } catch (aiError) {
                console.error("Error with Gemini analysis:", aiError);
                eventPayload.aiAnalysis = "AI analysis failed.";
            }
        }

        await _internalLogTraceEvent({
            vtiId: farmFieldId,
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

export const handlePlantingEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    if (role !== 'Farmer' && role !== 'system') {
        throw new functions.https.HttpsError('permission-denied', 'Only farmers or system processes can log planting events.');
    }

    const { farmFieldId, cropType, plantingDate, seedInputVti, method, actorVtiId, geoLocation } = data;
    
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
            throw error; 
        }
        throw new functions.https.HttpsError('internal', 'Failed to handle planting event.', error.message);
    }
});

/**
 * Fetches all traceability events for a given farmFieldId.
 */
export const getTraceabilityEventsByFarmField = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    
    const { farmFieldId } = data;
    if (!farmFieldId) {
        throw new functions.https.HttpsError('invalid-argument', 'A farmFieldId must be provided.');
    }

    // Optional: Add a security check to ensure the user is allowed to view events for this field.
    // This might involve checking if the farmFieldId belongs to a farm owned by the user.

    try {
        const eventsSnapshot = await db.collection('traceability_events')
            .where('farmFieldId', '==', farmFieldId)
            .orderBy('timestamp', 'asc')
            .get();
        
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        return { events };
    } catch (error) {
        console.error(`Error fetching events for farmFieldId ${farmFieldId}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch traceability events.');
    }
});
