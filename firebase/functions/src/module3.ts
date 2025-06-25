import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file

// Import necessary functions from Module 8 (AI/ML)
import { generateFarmRecommendationsWithAI } from "./module8";
// Import necessary functions from Module 9 (API Gateway)
// const db = admin.firestore();

// Import necessary functions from module1
import {
 handlePlantingEvent,
 handleInputApplicationEvent,
 handleObservationEvent,
 handleHarvestEvent,
 // generateVTI // Might be needed if certain Module 3 actions create VTIs directly (less likely now with harvest VTI strategy)
} from './module1';

// Import necessary functions/interfaces from module2 (assuming getRole is in module2 now)
// import { getRole } from './module2'; // Or wherever getRole is implemented

// Initialize Firebase Admin SDK (if not already initialized elsewhere)
try {
 admin.initializeApp();
} catch (e) {
 console.error("Firebase Admin SDK already initialized!");
}
const db = admin.firestore();

// Helper function to get user role (Assuming this is implemented in module2 or shared)
async function getRole(uid: string): Promise<string | null> {
 try {
 const userDoc = await db.collection('users').doc(uid).get();
        // Check if the document exists before trying to access data
        if (!userDoc.exists) {
             console.warn(`User document not found for UID: ${uid} when getting role.`);
             return null; // Return null if user doc doesn't exist
        }

        const userData = userDoc.data();

        // Check if primaryRole exists
        if (userData && userData.primaryRole) {
            return userData.primaryRole;
        } else {
             console.warn(`User document for UID: ${uid} does not have a primaryRole field.`);
             return null; // Return null if primaryRole is missing
        }

 return userDoc.data()?.primaryRole || null;
 } catch (error) {
 console.error('Error getting user role:', error);
 return null;
 }
}

// Helper function to get user's VTI (Assuming stored in user document in module2)
async function getUserVtiId(uid: string): Promise<string | null> {
 try {
 const userDoc = await db.collection('users').doc(uid).get();
 return userDoc.data()?.userVtiId || null;
 } catch (error) {
 console.error('Error getting user VTI ID:', error);
 return null;
 }
}


// Conceptual Data Model for farm_activity_logs:
// interface FarmActivityLog {
//  farmerRef: DocumentReference; // Link to the user document in Module 2
//  fieldRef: DocumentReference | null; // Link to the farm field in Module 1 (geospatial_assets) - Optional depending on activity type
//  vtiId: string | null; // Link to input VTI (optional, for INPUT_APPLIED)
//  activityType: string; // e.g., 'PLANTED', 'INPUT_APPLIED', 'OBSERVED', 'HARVESTED'
//  timestamp: Timestamp; // Timestamp of the activity (ideally captured in the field)
//  details: { [key: string]: any }; // Arbitrary details about the activity
//  mediaUrls: string[]; // URLs to associated photos/videos
//  spokenText: string | null; // Transcribed spoken input
//  processingStatus: 'pending' | 'processed' | 'error'; // Status of processing into Module 1 traceability
//  processedTimestamp: Timestamp | null; // Timestamp when processed
//  processedEventId: string | null; // ID of the created traceability_event in Module 1 (if applicable)
//  createdAt: Timestamp; // Timestamp when the log was created in Firestore
// }

// Conceptual Security Rules for farm_activity_logs:
// match /farm_activity_logs/{documentId} {
//      allow read, create, update: if request.auth.uid != null && resource.data.farmerRef != null && resource.data.farmerRef.id == request.auth.uid;
//      allow read: if getRole(request.auth.uid) == 'admin'; // Or other oversight roles
//      allow delete: if request.auth.uid != null && resource.data.farmerRef != null && resource.data.farmerRef.id == request.auth.uid; // Farmers can delete their own logs
//      allow delete: if getRole(request.auth.uid) in ['admin', 'system']; // Admins/System can delete
//      allow write: if getRole(request.auth.uid) == 'system'; // System can write (e.g., for processing status updates)
// }

// Callable function to create a farm activity log
export const createFarmActivityLog = functions.https.onCall(async (data, context) => {
 if (!context.auth) {
 throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to log farm activity.');
 }

 const callerUid = context.auth.uid;
 const callerRole = await getRole(callerUid);

 // Basic authorization check: Only 'farmer' role can create logs via this function
 if (callerRole !== 'farmer') {
 throw new functions.https.HttpsError('permission-denied', 'Only farmers can log farm activity.');
 }

 // Input Validation
 const { farmFieldRef, activityType, timestamp, details, linked_vtis, linked_environmental_data } = data;

 if (!activityType || typeof activityType !== 'string') {
 throw new functions.https.HttpsError('invalid-argument', 'The "activityType" parameter is required and must be a string.');
 }

 if (!timestamp) {
 throw new functions.https.HttpsError('invalid-argument', 'The "timestamp" parameter is required.');
 }

 // Validate timestamp format
 let activityTimestamp: admin.firestore.Timestamp;
 if (timestamp instanceof admin.firestore.Timestamp) {
 activityTimestamp = timestamp;
 } else if (typeof timestamp === 'string') {
 try {
 activityTimestamp = admin.firestore.Timestamp.fromDate(new Date(timestamp));
 } catch (e) {
 throw new functions.https.HttpsError('invalid-argument', 'The "timestamp" parameter must be a valid timestamp or date string.');
 }
 } else {
 throw new functions.https.HttpsError('invalid-argument', 'The "timestamp" parameter must be a valid timestamp or date string.');
 }

 if (details !== undefined && typeof details !== 'object') {
 throw new functions.https.HttpsError('invalid-argument', 'The "details" parameter must be an object.');
 }

 // Validate farmFieldRef if provided
 let fieldRef: admin.firestore.DocumentReference | null = null;
 if (farmFieldRef) {
 if (typeof farmFieldRef !== 'string') {
 throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldRef" parameter must be a document path string.');
 }
 // Basic check if it looks like a valid path
 if (!farmFieldRef.startsWith('geospatial_assets/')) {
 throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldRef" parameter must be a path to a geospatial_assets document.');
 }
 fieldRef = db.doc(farmFieldRef);
 // TODO: Consider adding a check here to ensure the field belongs to the farmer
 }

 // Validate linked_vtis if provided
 if (linked_vtis !== undefined && (!Array.isArray(linked_vtis) || !linked_vtis.every(item => typeof item === 'string'))) {
 throw new functions.https.HttpsError('invalid-argument', 'The "linked_vtis" parameter must be an array of strings.');
 }

 // Validate linked_environmental_data if provided
 if (linked_environmental_data !== undefined && (!Array.isArray(linked_environmental_data) || !linked_environmental_data.every(item => typeof item === 'string'))) {
 throw new functions.https.HttpsError('invalid-argument', 'The "linked_environmental_data" parameter must be an array of document path strings.');
 }

 try {
 // Get the farmer's reference
 const farmerRef = db.collection('users').doc(callerUid);

 // Create the new farm activity log document
 const newActivityLogRef = db.collection('farm_activity_logs').doc();
 const activityLogId = newActivityLogRef.id;

 await newActivityLogRef.set({
 farmerRef: farmerRef,
 fieldRef: fieldRef, // Can be null
 vtiId: linked_vtis && linked_vtis.length > 0 ? linked_vtis[0] : null, // Assuming linked_vtis array, take first one or handle multiple? Revisit data model if multiple VTIs needed.
 activityType: activityType,
 timestamp: activityTimestamp, // Use the timestamp provided by the farmer
 details: details || {}, // Store details as a map, default to empty object
 mediaUrls: details?.mediaUrls || [], // Assuming mediaUrls is within details
 spokenText: details?.spokenText || null, // Assuming spokenText is within details
 linkedDataRefs: (linked_environmental_data || []).map((path: string) => db.doc(path)), // Store linked environmental data as DocumentReferences
 processingStatus: 'pending', // Initial status
 createdAt: admin.firestore.FieldValue.serverTimestamp(),
 });

 console.log(`Farm activity log created with ID: ${activityLogId} for user ${callerUid}`);

 // Return the ID of the newly created document
 return { id: activityLogId };

 } catch (error) {
 console.error(`Error creating farm activity log for user ${callerUid}:`, error);
 if (error instanceof functions.https.HttpsError) {
 throw error;
 }
 throw new functions.https.HttpsError('internal', 'Unable to create farm activity log.', error);
 }
});

// TODO: Implement updateFarmActivityLog (Callable)
// Allows farmers to update specific fields of their logs (e.g., details, mediaUrls, spokenText)
/*
export const updateFarmActivityLog = functions.https.onCall(async (data, context) => {
    // Authentication and Authorization: Ensure user is authenticated and owns the log
    // Input Validation: Validate logId and update data
    // Fetch existing log: Check existence and ownership
    // Update log document: Use .update() to modify specific fields, adhering to immutability rules
    // Return updated log ID or status
});
*/

// TODO: Implement deleteFarmActivityLog (Callable)
// Allows farmers to delete their own logs (before processing?)
/*
export const deleteFarmActivityLog = functions.https.onCall(async (data, context) => {
    // Authentication and Authorization: Ensure user is authenticated and owns the log, or is admin/system
    // Input Validation: Validate logId
    // Fetch existing log: Check existence and ownership/role
    // Consider processing status: Maybe only allow deletion if status is 'pending'?
    // Delete log document: Use .delete()
    // Return success status
});
*/

// TODO: Implement processFarmActivityLog (Triggered)
// This function would be triggered by the creation of a new farm_activity_log document
// or potentially a scheduled job to re-process pending logs.
// It reads the log data and calls the appropriate Module 1 traceability function.
/*
export const processFarmActivityLog = functions.firestore
 .document('farm_activity_logs/{logId}')
 .onCreate(async (snapshot, context) => {
        const logId = context.params.logId;
        const activityLogData = snapshot.data();

        if (activityLogData.processingStatus !== 'pending') {
            console.log(`Activity log ${logId} is not pending. Skipping processing.`);
            return null; // Only process logs that are pending
        }

        const farmerRef = activityLogData.farmerRef as FirebaseFirestore.DocumentReference;
        const farmerUid = farmerRef.id;

        console.log(`Processing farm activity log ${logId} for user ${farmerUid}`);

        try {
            // 1. Get the farmer's VTI to use as actorRef in traceability events
            const actorVtiId = await getUserVtiId(farmerUid);
            if (!actorVtiId) {
                 console.error(`User ${farmerUid} does not have an associated VTI. Cannot process log ${logId}.`);
                 // TODO: Update log status to error
                 await snapshot.ref.update({
                     processingStatus: 'error',
                     errorMessage: `User ${farmerUid} does not have an associated VTI.`,
                 });
                return null; // Cannot proceed without farmer VTI
            }

            // 2. Call the appropriate Module 1 event handling function based on activity type
            let processedEventId: string | undefined; // To store the ID of the created traceability_event

            // Prepare data to pass to Module 1 functions
            const module1Data = {
                 farmFieldId: activityLogData.fieldRef?.id, // Pass farmFieldId if exists
                 actorVtiId: actorVtiId, // Pass the user's VTI as the actor
                 activityDate: activityLogData.timestamp, // Use the activity timestamp
                 // Pass other details from the log
                 ...activityLogData.details,
                 linked_vtis: activityLogData.vtiId ? [activityLogData.vtiId] : [], // Pass linked input VTI if exists
                 linked_environmental_data: activityLogData.linkedDataRefs ? activityLogData.linkedDataRefs.map((ref: FirebaseFirestore.DocumentReference) => ref.path) : [], // Pass linked environmental data paths
            };

            switch (activityLogData.activityType) {
                case 'PLANTED':
                    // ... call handlePlantingEvent(module1Data, context); ...
                    // processedEventId = result.eventId; // If the function returns it
                    console.log(`Triggered handlePlantingEvent for log ${logId}`);
                    break;
                case 'INPUT_APPLIED':
                    // ... call handleInputApplicationEvent(module1Data, context); ...
                    // processedEventId = result.eventId; // If the function returns it
                     console.log(`Triggered handleInputApplicationEvent for log ${logId}`);
                    break;
                case 'OBSERVED':
                    // ... call handleObservationEvent(module1Data, context); ...
                    // processedEventId = result.eventId; // If the function returns it
                     console.log(`Triggered handleObservationEvent for log ${logId}`);
                    break;
                case 'HARVESTED':
                     // Note: handleHarvestEvent expects harvestDate as a number (milliseconds since epoch)
                     if (module1Data.activityDate instanceof admin.firestore.Timestamp) {
                         module1Data.harvestDate = module1Data.activityDate.toMillis();
                     } else {
                          console.error(`Harvest activity log ${logId} has invalid timestamp format.`);
                          // TODO: Update log status to error
                          await snapshot.ref.update({
                             processingStatus: 'error',
                             errorMessage: `Invalid timestamp format for harvest activity.`,
                         });
                         return null;
                     }
                    // ... call handleHarvestEvent(module1Data, context); ...
                    // processedEventId = result.eventId; // If the function returns it
                     console.log(`Triggered handleHarvestEvent for log ${logId}`);
                    break;
                // Add cases for other activity types
                default:
                    console.warn(`Unhandled activity type for processing: ${activityLogData.activityType} in log ${logId}.`);
                    // No call to Module 1 functions for unhandled types
                    break;
            }

            // 3. Update the processingStatus in the farm_activity_logs document
            await snapshot.ref.update({
                processingStatus: 'processed',
                processedTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                processedEventId: processedEventId || null, // Link to the created event in Module 1 (if available)
            });

            console.log(`Activity log ${logId} processed.`);

            return null; // Indicate successful processing

        } catch (error) {
            console.error(`Error processing farm activity log ${logId} for user ${farmerUid}:`, error);
             // Update status to error if processing fails
             try {
                 await snapshot.ref.update({
                     processingStatus: 'error',
                     errorMessage: error.message || 'Unknown error',
                 });
             } catch (updateError) {
                  console.error(`Error updating activity log ${logId} status to error:`, updateError);
             }
            return null; // Indicate failure
        }
    });
*/

// TODO: Implement processFieldSatelliteData (Triggered by Module 1 when satellite data is linked)
// TODO: Implement generateFarmRecommendations (Triggered by new field_insights or scheduled job)
// TODO: Implement predictYield (Callable)
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// const db = admin.firestore();

// Import necessary functions from module1
import {
  handlePlantingEvent,
  handleInputApplicationEvent,
  handleObservationEvent,
  handleHarvestEvent,
  generateVTI // Might be needed if certain Module 3 actions create VTIs directly (less likely now with harvest VTI strategy)
} from './module1';

// Import necessary functions/interfaces from module2 (assuming getRole is in module2 now)
// import { getRole } from './module2'; // Or wherever getRole is implemented

// Import necessary functions from Module 8 (AI/ML)
import { generateFarmRecommendationsWithAI } from "./module8";


// Initialize Firebase Admin SDK (if not already initialized elsewhere)
try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase Admin SDK already initialized!");
}
const db = admin.firestore();


// Helper function to get user role (Assuming this is implemented in module2 or shared)
// Placeholder - Replace with actual implementation
async function getRole(uid: string): Promise<string | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.data()?.primaryRole || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

// Helper function to get user's VTI (Assuming stored in user document in module2)
// Placeholder - Replace with actual implementation or link to Module 2 logic
async function getUserVtiId(uid: string): Promise<string | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
         // Check if the document exists before trying to access data
        if (!userDoc.exists) {
             console.warn(`User document not found for UID: ${uid} when getting VTI ID.`);
             return null; // Return null if user doc doesn't exist
        }

        const userData = userDoc.data();

        // Check if userVtiId exists
         if (userData && userData.userVtiId) {
            return userData.userVtiId;
        } else {
             return null; // Return null if userVtiId is missing
        }
        return userDoc.data()?.userVtiId || null;
    } catch (error) {
        console.error('Error getting user VTI ID:', error);
        return null;
    }
}


// Callable function to log farmer activity and trigger traceability events
export const logFarmActivityToTraceability = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to log farm activity.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Ensure the caller is a farmer or a system process authorized to log activity
    if (callerRole !== 'farmer' && callerRole !== 'system') { // Adjust roles as necessary
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to log farm activity.');
    }

    // Get the farmer's VTI to use as actorRef in traceability events
    const actorVtiId = await getUserVtiId(callerUid);
    if (!actorVtiId) {
         throw new functions.https.HttpsError('failed-precondition', `User ${callerUid} does not have an associated VTI.`);
    }


    // Assuming input data contains activityType and other relevant fields
    const { activityType, ...activityDetails } = data;

    // Basic validation for activityType
    if (!activityType || typeof activityType !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "activityType" parameter is required and must be a string.');
    }

    // Get farmFieldRef as DocumentReference if farmFieldId is provided
    let farmFieldRef = null;
    if (activityDetails.farmFieldId && typeof activityDetails.farmFieldId === 'string') {
         farmFieldRef = db.collection('geospatial_assets').doc(activityDetails.farmFieldId);
    } else {
         // Depending on activity type, farmFieldId might be required
         if (['PLANTED', 'INPUT_APPLIED', 'OBSERVED', 'HARVESTED'].includes(activityType)) {
              throw new functions.https.HttpsError('invalid-argument', `farmFieldId is required for activity type ${activityType}.`);
         }
    }

    // Get vtiRef for inputs if inputVti is provided
    let inputVti = null;
     if (activityDetails.inputVti && typeof activityDetails.inputVti === 'string') {
         inputVti = activityDetails.inputVti; // Pass VTI ID, not a DocumentReference
     }


    try {
        // 1. Store the raw activity data in farm_activity_logs
        const newActivityLogRef = db.collection('farm_activity_logs').doc(); // Auto-generate document ID
        const activityLogId = newActivityLogRef.id;

        await newActivityLogRef.set({
            farmerRef: db.collection('users').doc(callerUid), // Link to the user document in Module 2
            fieldRef: farmFieldRef, // Link to the farm field in Module 1 (optional)
            vtiId: inputVti, // Link to input VTI (optional)
            activityType: activityType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Timestamp when logged in Module 3
            details: activityDetails, // Store all other details in a details map
            mediaUrls: activityDetails.mediaUrls || [], // Assuming mediaUrls is part of details
            spokenText: activityDetails.spokenText || null, // Assuming spokenText is part of details
            processingStatus: 'pending', // Initial status
            // Add other fields as needed for the log
        });
        console.log(`Raw activity log created with ID: ${activityLogId} for user ${callerUid}`);


        // 2. Call the appropriate Module 1 event handling function based on activity type
        let module1CallResult: any;
        let processedEventId: string | undefined; // To store the ID of the created traceability_event

        // Prepare common data to pass to Module 1 functions
        const commonModule1Data = {
             farmFieldId: activityDetails.farmFieldId, // Pass farmFieldId
             actorVtiId: actorVtiId, // Pass the user's VTI as the actor
             activityDate: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for event time for now (can be adjusted)
             // Pass other details based on activity type
             ...activityDetails,
        };


        switch (activityType) {
            case 'PLANTED':
                 // Ensure required fields for Planting
                 if (!activityDetails.cropType) {
                      throw new functions.https.HttpsError('invalid-argument', 'cropType is required for PLANTED activity.');
                 }
                 module1CallResult = await handlePlantingEvent(commonModule1Data, context);
                 // The handlePlantingEvent function currently doesn't return the event ID directly
                 // If needed, you might need to modify handlePlantingEvent or query for the event.
                 // For now, we'll just mark as processed.
                 processedEventId = undefined; // Placeholder


                break;
            case 'INPUT_APPLIED':
                 // Ensure required fields for Input Application
                 if (!activityDetails.inputType || !activityDetails.inputVti || activityDetails.quantity === undefined || !activityDetails.unit) {
                      throw new functions.https.HttpsError('invalid-argument', 'inputType, inputVti, quantity, and unit are required for INPUT_APPLIED activity.');
                 }
                 module1CallResult = await handleInputApplicationEvent(commonModule1Data, context);
                 processedEventId = undefined; // Placeholder

                break;
            case 'OBSERVED':
                 // Ensure required fields for Observation
                  if (!activityDetails.observationType || !activityDetails.details) {
                      throw new functions.https.HttpsError('invalid-argument', 'observationType and details are required for OBSERVED activity.');
                 }
                 module1CallResult = await handleObservationEvent(commonModule1Data, context);
                 processedEventId = undefined; // Placeholder

                break;
            case 'HARVESTED':
                // Ensure required fields for Harvesting
                 if (!activityDetails.cropType || activityDetails.yield === undefined || !activityDetails.unit || !activityDetails.harvestDate) {
                      throw new functions.https.HttpsError('invalid-argument', 'cropType, yield, unit, and harvestDate are required for HARVESTED activity.');
                 }
                 // Note: handleHarvestEvent expects harvestDate as a number (milliseconds since epoch)
                 if (typeof activityDetails.harvestDate !== 'number') {
                      throw new functions.https.HttpsError('invalid-argument', 'harvestDate must be a number (milliseconds since epoch).');
                 }
                 module1CallResult = await handleHarvestEvent(commonModule1Data, context);
                 // handleHarvestEvent returns the new VTI ID, but not the event ID directly
                 processedEventId = undefined; // Placeholder


                break;
            // Add cases for other activity types
            default:
                console.warn(`Unhandled activity type: ${activityType}. Logging only to farm_activity_logs.`);
                // No call to Module 1 functions for unhandled types
                break;
        }

         // 3. Update the processingStatus in the farm_activity_logs document
        await newActivityLogRef.update({
            processingStatus: 'processed',
            processedTimestamp: admin.firestore.FieldValue.serverTimestamp(), // Optional: Timestamp when processed
            processedEventId: processedEventId || null, // Link to the created event in Module 1 (if available)
        });

        console.log(`Activity log ${activityLogId} processed into traceability event(s).`);


        return { activityLogId, status: 'processed', module1Result: module1CallResult };

    } catch (error) {
        console.error(`Error logging farm activity for user ${callerUid}:`, error);
        // Update status to error if processing fails
         if (newActivityLogRef) {
             try {
                 await newActivityLogRef.update({
                     processingStatus: 'error',
                     errorMessage: error.message || 'Unknown error',
                 });
             } catch (updateError) {
                  console.error(`Error updating activity log ${activityLogId} status to error:`, updateError);
             }
         }
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to log farm activity.', error);
    }
});


// TODO: Implement processFieldSatelliteData
// This function would be triggered by Module 1 when new satellite data
// is linked to a farm field (e.g., via a document update in geospatial_assets
// or a separate trigger based on satellite data ingestion).
export const processFieldSatelliteData = functions.firestore
  .document('geospatial_assets/{fieldId}')
  .onUpdate(async (change, context) => {
    const fieldId = context.params.fieldId;
    const newFieldData = change.after.data();
    const previousFieldData = change.before.data();

    // TODO: Check if the update includes new satellite data or triggers the need for processing.
    // Example: Check for changes in a specific field like 'latestSatelliteDataTimestamp' or similar.
    // if (newFieldData.latestSatelliteDataTimestamp > previousFieldData.latestSatelliteDataTimestamp) {
        console.log(`Processing satellite data for field ${fieldId}`);

        const fieldRef = change.after.ref;
        const ownerRef = newFieldData.ownerRef as FirebaseFirestore.DocumentReference; // Assuming ownerRef is stored

        if (!ownerRef) {
            console.warn(`Field ${fieldId} does not have an ownerRef. Skipping satellite data processing.`);
            return null; // Skip if no owner is linked
        }

        const farmerRef = db.collection('users').doc(ownerRef.id); // Reference to the farmer user document

        try {
            // 1. Fetch relevant data for analysis:
            //    - Latest satellite data for this field (already available in newFieldData or linked collection).
            //    - Historical satellite data for this field (if needed for comparison).
            //    - Weather data for the field's location (from Module 1 - Environmental Data).
            //    - Recent farm activity logs for this field (from farm_activity_logs).
            //    - Master data relevant to the crop type (from Module 1 - Master Data).

            // 2. Send data to Module 8 (AI/ML Module) for analysis:
            //    - Call a callable function or send a message to a queue/pubsub topic in Module 8.
            //    - Pass the fetched data and context about the field and farmer.
            //    - Module 8 would perform calculations (e.g., NDVI, NDWI, stress indices)
            //      and potentially generate insights (e.g., nutrient deficiency indicators, disease risk).

            // 3. Receive results from Module 8 and store in field_insights:
            //    - Module 8 might call a function back in Module 3 or update a shared collection.
            //    - Store the analysis results and insights in the 'field_insights' collection,
            //      linking them to the fieldRef and farmerRef.
            //    - Example: await db.collection('field_insights').add({ fieldRef, farmerRef, timestamp, ...insights });

            // 4. Trigger recommendation generation (if needed)
            //    - After storing insights, you might trigger the generateFarmRecommendations function.
            //    - Example: await generateFarmRecommendations({ fieldId: fieldId, insightId: newInsightDoc.id });

            console.log(`Satellite data processing triggered for field ${fieldId}. Analysis pending in Module 8.`);

            return { status: 'processing_triggered' };

        } catch (error) {
            console.error(`Error processing satellite data for field ${fieldId}:`, error);
             // TODO: Log this error properly, potentially notify admin or retry.
            return null; // Indicate failure
        }
    // } else {
    //     console.log(`No new satellite data update detected for field ${fieldId}. Skipping processing.`);
    //     return null; // No relevant update
    // }
});


// TODO: Implement generateFarmRecommendations
// This function would be triggered by new insights being added to field_insights
// or potentially on a schedule or triggered manually.
// It utilizes AI models in Module 8 to generate actionable recommendations.
export const generateFarmRecommendations = functions.firestore
  .document('field_insights/{insightId}')
  .onCreate(async (snapshot, context) => {
    const insightId = context.params.insightId;
    const insightData = snapshot.data();

    // Ensure the insight has linked farmer and field
    if (!insightData.farmerRef || !insightData.fieldRef) {
      console.warn(`Insight ${insightId} is missing farmerRef or fieldRef. Skipping recommendation generation.`);
      return null;
    }

    const fieldRef = insightData.fieldRef as FirebaseFirestore.DocumentReference;
    const farmerRef = insightData.farmerRef as FirebaseFirestore.DocumentReference;
    const farmerUid = farmerRef.id;
    const fieldId = fieldRef.id;

    console.log(`Generating recommendations for insight ${insightId}`);

    try {
      // 1. Fetch relevant data:
      //    - The insight data itself (already available).
      //    - More detailed farm field data (from geospatial_assets).
      //    - Relevant recent farm activity logs for this field.
      //    - Farmer profile data (from users collection, potentially includes preferences, goals).
      //    - Relevant environmental data (from Module 1 or fetched via Module 9 if external).
      //    - Relevant master data (crop calendars, input guidelines).

      const fieldDoc = await fieldRef.get();
      const farmerDoc = await farmerRef.get();
      // Fetch recent activity logs for the field (e.g., last 30 days)
      const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const recentActivitySnapshot = await db.collection('farm_activity_logs')
        .where('fieldRef', '==', fieldRef)
        .where('timestamp', '>=', thirtyDaysAgo) // Assuming 'timestamp' is indexed
        .orderBy('timestamp', 'desc')
        .get();

      const recentActivities = recentActivitySnapshot.docs.map(doc => doc.data());

      // TODO: Fetch relevant environmental data for the field location (e.g., from environmental_data collection or via Module 9)
      // For now, placeholder
      const environmentalData = { weather: 'placeholder', soil: 'placeholder' };

      // TODO: Fetch relevant master data (crop specifics, best practices)
      // For now, placeholder
      const masterData = { cropInfo: 'placeholder' };

      // Prepare data to send to Module 8
      const dataForModule8 = {
        insightData: insightData,
        fieldData: fieldDoc.exists ? fieldDoc.data() : null,
        farmerData: farmerDoc.exists ? farmerDoc.data() : null,
        recentFarmActivities: recentActivities,
        environmentalData: environmentalData,
        masterData: masterData,
        // Include context like farmer's preferred language for recommendations
        language: farmerDoc.data()?.preferences?.language || 'en',
      };

      // 2. Call Module 8 (AI/ML Module) for recommendation generation:
      //    - Pass insight data and farmer context to an AI model API or function in Module 8.
      //    - Module 8 would interpret the insights and generate localized, actionable recommendations.
      console.log(`Calling generateFarmRecommendationsWithAI for field ${fieldId} and insight ${insightId}`);
      const recommendations = await generateFarmRecommendationsWithAI(dataForModule8);

      // 3. Store recommendations:
      //    Create new documents in the `farmer_alerts` collection for each recommendation.
      const alertCreationPromises = recommendations.map(async (rec: any) => { // Assuming recommendations is an array of objects
          const newAlertRef = db.collection('farmer_alerts').doc(); // Auto-generate document ID
          await newAlertRef.set({
              alertId: newAlertRef.id,
              farmerRef: farmerRef,
              alertType: rec.type || 'FARM_RECOMMENDATION', // Use type from AI or a default
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              message_en: rec.message_en, // Assuming AI provides multi-language
              message_local: rec.message_local || {},
              severity: rec.severity || 'info', // Assuming AI provides severity or use a default
              linked_data: [snapshot.ref, fieldRef], // Link to the triggering insight and field
              linked_content: rec.linked_content || [], // Links to relevant content provided by AI
              isRead: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      });
      await Promise.all(alertCreationPromises);

      console.log(`Recommendations generated and stored for insight ${insightId}.`);
      return { status: 'recommendation_triggered' };

    } catch (error) {
        console.error(`Error generating recommendations for insight ${insightId}:`, error);
         // TODO: Log this error.
        return null;
    }


// Callable function for adding farmer alerts manually (e.g., by Expert/Auditor)
export const addFarmerAlertManual = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to add a farmer alert.');
    }

    const callerUid = context.auth.uid;
    const { farmerRef, alertType, message_en, message_local, severity, linked_data = [], linked_content = [] } = data;

    // Basic validation for required fields
    if (!farmerRef || typeof farmerRef !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmerRef" parameter is required and must be a string (document path).');
    }
     if (!alertType || typeof alertType !== 'string' || alertType.trim().length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "alertType" parameter is required and cannot be empty.');
     }
     if (!message_en || typeof message_en !== 'string' || message_en.trim().length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "message_en" parameter is required and cannot be empty.');
     }
     if (message_local !== undefined && (typeof message_local !== 'object' || message_local === null)) {
          throw new functions.https.HttpsError('invalid-argument', 'The "message_local" parameter must be an object.');
     }
     if (!severity || typeof severity !== 'string' || !['info', 'warning', 'critical'].includes(severity)) {
          throw new functions.https.HttpsError('invalid-argument', 'The "severity" parameter is required and must be one of "info", "warning", or "critical".');
     }


     // Optional validation for linked data
     if (!Array.isArray(linked_data) || !linked_data.every(ref => typeof ref === 'string')) {
         throw new functions.https.HttpsError('invalid-argument', 'The "linked_data" parameter must be an array of strings (document paths).');
     }
     if (!Array.isArray(linked_content) || !linked_content.every(ref => typeof ref === 'string')) {
         throw new functions.https.HttpsError('invalid-argument', 'The "linked_content" parameter must be an array of strings (document paths).');
     }


    try {
        // Authorization Check: Ensure the caller has 'expert', 'auditor', 'admin', or 'system' role.
         const callerRole = await getRole(callerUid);
         if (!callerRole || !['expert', 'auditor', 'admin', 'system'].includes(callerRole)) {
              throw new functions.https.HttpsError('permission-denied', 'User does not have permission to add farmer alerts manually.');
         }

         const farmerDocumentRef = db.doc(farmerRef); // Convert path string to DocumentReference

        const newAlertRef = db.collection('farmer_alerts').doc(); // Auto-generate document ID
        const alertId = newAlertRef.id;

        await newAlertRef.set({
            alertId: alertId,
            farmerRef: farmerDocumentRef,
            alertType: alertType.trim(),
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Timestamp when the alert is created
            message_en: message_en.trim(),
            message_local: message_local || {},
            severity: severity,
            linked_data: linked_data.map((path: string) => db.doc(path)), // Store as DocumentReferences
            linked_content: linked_content.map((path: string) => db.doc(path)), // Store as DocumentReferences
            isRead: false, // Default to unread
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Farmer alert created with ID: ${alertId} for farmer ${farmerRef} by user ${callerUid}.`);

        return { alertId, status: 'created' };

    } catch (error) {
        console.error(`Error adding farmer alert manually for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to add farmer alert manually.', error);
    }
});


// TODO: Implement updateFarmerAlert (Callable)
// Allows farmers to mark alerts as read, and admin/system/expert/auditor to update other fields.
/*
export const updateFarmerAlert = functions.https.onCall(async (data, context) => {
    // Authentication
    // Input Validation: alertId, updates
    // Fetch existing alert: Check existence
    // Authorization Check:
    // - If caller is farmer, allow only updates to `isRead`. Check `alert.farmerRef.id === callerUid`.
    // - If caller is admin/system/expert/auditor, allow updates to other fields (message, severity, linked data). Check role.
    // Perform update
    // Return status
});
*/

// TODO: Implement deleteFarmerAlert (Callable)
// Allows admin/system to delete alerts.
/*
export const deleteFarmerAlert = functions.https.onCall(async (data, context) => {
    // Authentication
    // Input Validation: alertId
    // Fetch existing alert: Check existence
    // Authorization Check: Allow only 'admin' or 'system' roles.
    // Perform deletion
    // Return status
});
*/


// Placeholder Firebase Triggered Function for generating Farmer Alerts (System/Automated)
// This function would be triggered by changes (create, update) in relevant collections
// like field_insights, compliance_deviations, environmental_data, etc.
/*
export const generateFarmerAlert = functions.firestore
    .document('{collectionId}/{documentId}') // Trigger on relevant collections like 'field_insights', 'compliance_deviations'
    .onWrite(async (change, context) => {
        const collectionId = context.params.collectionId;
        const documentId = context.params.documentId;

        // Only trigger for relevant collections
        const relevantCollections = ['field_insights', 'compliance_deviations', 'environmental_data']; // Add other relevant collections
        if (!relevantCollections.includes(collectionId)) {
            console.log(`Ignoring trigger for collection: ${collectionId}`);
            return null;
        }

        const docData = change.after.exists ? change.after.data() : change.before.data(); // Get data from before or after change

        // TODO: 1. Identify the target farmer(s) from the triggering data.
        // - If triggered by `field_insights`, the farmer is the owner of the linked `farmFieldRef`.
        // - If triggered by `compliance_deviations`, the farmer is linked via `deviatedEntityRef` (which could be a user, farm, or field). Need to resolve to user.
        // - If triggered by `environmental_data`, the farmer is the owner of the linked assetRef (likely a farm field).
        let targetFarmerRefs: admin.firestore.DocumentReference[] = [];

        try {
            if (collectionId === 'field_insights') {
                const farmFieldRef = docData?.farmFieldRef as admin.firestore.DocumentReference | null;
                if (farmFieldRef) {
                    const fieldDoc = await farmFieldRef.get();
                    const ownerRef = fieldDoc.data()?.ownerRef as admin.firestore.DocumentReference | null;
                    if (ownerRef) {
                        targetFarmerRefs.push(ownerRef);
                    }
                }
            } else if (collectionId === 'compliance_deviations') {
                // Assuming compliance deviations link to a user, farm, or field and you can trace back to a user
                 const deviatedEntityRef = docData?.deviatedEntityRef as admin.firestore.DocumentReference | null;
                 if (deviatedEntityRef && deviatedEntityRef.collection.id === 'users') {
                      targetFarmerRefs.push(deviatedEntityRef);
                 }
                 // TODO: Handle cases where deviatedEntityRef is a farm or field and resolve to owner(s).
            } else if (collectionId === 'environmental_data') {
                 const assetRef = docData?.assetRef as admin.firestore.DocumentReference | null;
                  if (assetRef && assetRef.collection.id === 'geospatial_assets') { // Assuming linked to a farm field
                      const fieldDoc = await assetRef.get();
                      const ownerRef = fieldDoc.data()?.ownerRef as admin.firestore.DocumentReference | null;
                      if (ownerRef) {
                          targetFarmerRefs.push(ownerRef);
                      }
                  }
                 // TODO: Handle environmental data not directly linked to a farmer/field but still relevant for alerts (e.g., regional weather warning).
            }

            if (targetFarmerRefs.length === 0) {
                 console.log(`Could not identify target farmer(s) for trigger from ${collectionId}/${documentId}. Skipping alert generation.`);
                 return null;
            }

            console.log(`Triggered for farmer alert generation by change in ${collectionId}/${documentId}. Target farmers: ${targetFarmerRefs.map(ref => ref.id).join(', ')}`);

            // TODO: 2. Determine the alert type, severity, and message based on the triggering data and business rules.
            // - Logic will be specific to the collection and data change (e.g., high pest risk from field_insights, compliance rule violation, severe weather forecast).
            let alertDetails: {
                 alertType: string;
                 message_en: string;
                 message_local: { [key: string]: string };
                 severity: 'info' | 'warning' | 'critical';
                 linked_data: admin.firestore.DocumentReference[]; // Links to the triggering document and potentially others
                 linked_content: admin.firestore.DocumentReference[]; // Links to relevant knowledge base articles
            } | null = null; // Placeholder for determined alert details

            if (collectionId === 'field_insights' && change.after.exists) {
                 const insight = change.after.data();
                 // Example logic: If a 'pest_risk' insight with high severity is created or updated
                 if (insight.insightType === 'pest_risk' && insight.data?.riskLevel === 'high') {
                     alertDetails = {
                         alertType: 'PEST_WARNING',
                         message_en: `High pest risk detected for your field (${insight.farmFieldRef.id}). Check field conditions.`,
                         message_local: { 'sw': `Hatari kubwa ya wadudu imegunduliwa kwenye shamba lako (${insight.farmFieldRef.id}). Angalia hali ya shamba.` },
                         severity: 'warning',
                         linked_data: [change.after.ref], // Link to the insight document
                         linked_content: [], // TODO: Link to relevant pest management guides
                     };
                 }
                 // Add other insight-based alert logic here

            } else if (collectionId === 'compliance_deviations' && change.after.exists) {
                 const deviation = change.after.data();
                  // Example logic: If a new compliance deviation is created
                  if (deviation.status === 'detected') {
                      alertDetails = {
                           alertType: 'COMPLIANCE_DEVIATION',
                           message_en: `A potential compliance deviation has been detected: ${deviation.ruleName}. Review required.`,
                           message_local: { 'sw': `Hitilafu inayowezekana ya kufuata sheria imegunduliwa: ${deviation.ruleName}. Mapitio yanahitajika.` },
                           severity: deviation.severity || 'warning', // Assuming severity is in deviation data
                           linked_data: [change.after.ref, deviation.deviatedEntityRef].filter(ref => ref), // Link to deviation and entity
                           linked_content: [], // TODO: Link to relevant compliance documentation
                      };
                  }
                 // Add other compliance-based alert logic here
            }
            // Add logic for other collections (e.g., environmental_data for weather alerts)


            if (!alertDetails) {
                console.log(`No alert criteria met for trigger from ${collectionId}/${documentId}. Skipping alert generation.`);
                return null; // No alert needs to be generated based on this change
            }


            // TODO: 3. Create a new document in the `farmer_alerts` collection for each target farmer.
            const createAlertsPromises = targetFarmerRefs.map(async (farmerRef) => {
                 try {
                      const newAlertRef = db.collection('farmer_alerts').doc(); // Auto-generate document ID
                      await newAlertRef.set({
                           alertId: newAlertRef.id,
                           farmerRef: farmerRef,
                           ...alertDetails, // Include the determined alert details
                           isRead: false, // Default to unread
                           createdAt: admin.firestore.FieldValue.serverTimestamp(),
                      });
                      console.log(`Created farmer alert ${newAlertRef.id} for farmer ${farmerRef.id} from ${collectionId}/${documentId}`);
                 } catch (alertCreationError) {
                     console.error(`Error creating alert for farmer ${farmerRef.id} from ${collectionId}/${documentId}:`, alertCreationError);
                     // TODO: Log this error, potentially notify system admin.
                 }
            });

            // Wait for all alert creation promises to resolve
            await Promise.all(createAlertsPromises);


            console.log(`Finished processing trigger from ${collectionId}/${documentId} for farmer alerts.`);

            return null; // Indicate successful completion

        } catch (error) {
            console.error(`Overall error generating farmer alert from ${collectionId}/${documentId}:`, error);
            // TODO: Implement error handling: log, potentially create an alert for an admin/system.
            return null;
        }
    });
*/


// TODO: Implement callable/triggered functions for Module 3 frontend interactions:
// - getFarmerAlerts (Callable): Retrieve alerts for the logged-in farmer (with filtering/pagination)
// - markAlertAsRead (Callable): Allow farmer to mark an alert as read


// Placeholder Callable functions related to Field Insights (already added the delete one)

// Placeholder callable function for experts to add/update field insights
/*
export const manageFieldInsightExpert = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to manage field insights.');
    }

    const callerUid = context.auth.uid;
    const { insightId, farmFieldRef, insightType, data: insightData, validUntil = null, linked_data = [], linked_content = [] } = data;

    // Basic validation
    if (!farmFieldRef || typeof farmFieldRef !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "farmFieldRef" parameter is required and must be a string (document path).');
    }
    if (!insightType || typeof insightType !== 'string' || insightType.trim().length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'The "insightType" parameter is required and cannot be empty.');
    }
     if (!insightData || typeof insightData !== 'object') {
         throw new functions.https.HttpsError('invalid-argument', 'The "data" parameter (insight data) is required and must be an object.');
     }


    try {
        // Authorization Check: Ensure the caller is an expert or admin.
         const callerRole = await getRole(callerUid);
         if (!callerRole || !['expert', 'admin'].includes(callerRole)) {
              throw new functions.https.HttpsError('permission-denied', 'User does not have permission to manage field insights.');
         }

         const farmFieldDocumentRef = db.doc(farmFieldRef);

        let insightRef: admin.firestore.DocumentReference;
        let operation: 'created' | 'updated';

        if (insightId) {
            // Updating an existing insight
            console.log(`Updating field insight with ID: ${insightId} by expert ${callerUid}.`);
            insightRef = db.collection('field_insights').doc(insightId);
            const insightDoc = await insightRef.get();

            if (!insightDoc.exists) {
                 throw new functions.https.HttpsError('not-found', `Field insight document not found for ID: ${insightId}.`);
            }

            // Optional: Additional authorization check - ensure the expert is allowed to update this specific insight
            // (e.g., if insights are assigned to experts).

            const updates: any = {
                 data: insightData,
                 validUntil: validUntil ? (validUntil instanceof admin.firestore.Timestamp ? validUntil : admin.firestore.Timestamp.fromDate(new Date(validUntil))) : null,
                 linked_data: linked_data.map((path: string) => db.doc(path)),
                 linked_content: linked_content.map((path: string) => db.doc(path)),
                 updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                 source: 'expert', // Mark as updated by expert
            };

            await insightRef.update(updates);
            operation = 'updated';


        } else {
            // Creating a new insight
            console.log(`Creating new field insight of type ${insightType} for field ${farmFieldRef} by expert ${callerUid}.`);
             insightRef = db.collection('field_insights').doc(); // Auto-generate document ID
             const newInsightId = insightRef.id;

             const now = admin.firestore.FieldValue.serverTimestamp();


            await insightRef.set({
                 insightId: newInsightId,
                 farmFieldRef: farmFieldDocumentRef,
                 insightType: insightType.trim(),
                 data: insightData,
                 generatedAt: now, // Generated time is now for manual creation
                 validUntil: validUntil ? (validUntil instanceof admin.firestore.Timestamp ? validUntil : admin.firestore.Timestamp.fromDate(new Date(validUntil))) : null,
                 source: 'expert', // Mark as created by expert
                 linked_data: linked_data.map((path: string) => db.doc(path)),
                 linked_content: linked_content.map((path: string) => db.doc(path)),
                 createdAt: now,
                 updatedAt: now,
            });
            operation = 'created';
             insightId = newInsightId; // Set insightId for the return value

        }


        console.log(`Field insight ${operation} with ID: ${insightId} by expert ${callerUid}.`);


         // TODO: Consider triggering downstream processes based on the new/updated insight (e.g., generate alerts).


        return { insightId, status: operation };

    } catch (error) {
        console.error(`Error managing field insight for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Unable to ${insightId ? 'update' : 'create'} field insight.`, error);
    }
});
*/


// Callable function for deleting field insights (admin/system)
export const deleteFieldInsight = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete a field insight.');
    }

    const callerUid = context.auth.uid;
    const { insightId } = data;


    // Basic validation
    if (!insightId || typeof insightId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "insightId" parameter is required and must be a string.');
    }


    try {
        const insightRef = db.collection('field_insights').doc(insightId);
        const insightDoc = await insightRef.get();

        if (!insightDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Field insight document not found for ID: ${insightId}`);
        }

        const insightData = insightDoc.data();

        // Authorization Check: Ensure the caller has an admin or system role.
         const callerRole = await getRole(callerUid);
         const isAdmin = callerRole === 'admin';
         const isSystem = callerRole === 'system';


         if (!isAdmin && !isSystem) {
              throw new functions.https.HttpsError('permission-denied', 'User is not authorized to delete field insights.');
         }


        await insightRef.delete();
         console.log(`Field insight deleted for ID: ${insightId} by user ${callerUid}.`);


        return { insightId, status: 'deleted' };

    } catch (error) {
        console.error(`Error deleting field insight ${insightId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to delete field insight.', error);
    }
});

// --------------------------------------------------------------------------
// Integrated Functions from farms.ts
// These functions handle the core creation, retrieval, update, and deletion
// of Farm and Crop entities, primarily used by the Farmer's Hub (Module 3)
// and potentially other modules needing farm/crop data access.
// --------------------------------------------------------------------------

// Define interfaces for expected data structures (from original farms.ts)
interface FarmData {
  name: string;
  location: any; // Or a more specific GeoPoint type if defined
  farm_type: string;
  owner_id: string; // Should match auth.uid
  // Add other expected fields
}

interface CropData {
  farm_id: string;
  crop_type: string;
  owner_id: string; // Should match auth.uid
  // Add other expected fields
}


/**
 * Cloud Function to create a new farm and link it to the user's profile.
 * Ensures the request is authenticated and the farm owner matches the authenticated user.
 * Integrated from farms.ts.
 */
export const createFarm = functions.https.onCall(async (data: FarmData, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to create a farm.'
    );
  }

  const userId = context.auth.uid;
  const farmData = data;

  // Basic validation (expand this to match your detailed schema)
  if (!farmData.name || !farmData.location || !farmData.farm_type) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required farm data fields (name, location, farm_type).'
    );
  }

  // Ensure the owner_id in the data matches the authenticated user's UID
  if (farmData.owner_id !== userId) {
     throw new functions.https.HttpsError(
      'permission-denied',
      'You can only create farms for yourself.'
    );
  }

  // Start a batched write to ensure both operations succeed or fail together
  const batch = db.batch();

  // 1. Add the new farm document
  const newFarmRef = db.collection('farms').doc(); // Firestore auto-generates doc ID
  batch.set(newFarmRef, {
    ...farmData, // owner_id is already part of farmData and validated
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Update the user's document to add the new farm ID to their farm_ids array
  const userRef = db.collection('users').doc(userId);
  batch.update(userRef, {
    farm_ids: admin.firestore.FieldValue.arrayUnion(newFarmRef.id),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Also update user's updatedAt
  });

  try {
    // Commit the batched write
    await batch.commit();

    // Return success response with the new farm's ID
    return { id: newFarmRef.id, message: 'Farm created successfully.' };
  } catch (error: any) {
    // Handle any errors during the batched write
    console.error('Error creating farm and updating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while creating the farm.',
      error.message
    );
  }
});

/**
 * Cloud Function to create a new crop for a specific farm using onCall.
 * Ensures the request is authenticated and the user is the owner of the farm.
 * Integrated from farms.ts.
 */
export const createCrop = functions.https.onCall(async (data: CropData, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to create a crop.'
    );
  }

  const userId = context.auth.uid;
  const cropData = data;

  // Basic validation (expand this to match your detailed schema)
  if (!cropData.farm_id || !cropData.crop_type) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required crop data fields (farm_id, crop_type).'
    );
  }

  const farmId = cropData.farm_id;

  // 1. Verify that the authenticated user is the owner of the farm
  try {
    const farmDoc = await db.collection('farms').doc(farmId).get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmDocData = farmDoc.data() as FarmData | undefined; // Cast to FarmData

    if (farmDocData?.owner_id !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only add crops to your own farms.'
      );
    }
  } catch (error: any) {
    console.error('Error verifying farm ownership:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not verify farm ownership.', error.message);
  }

  // 2. Add the new crop document
  const newCropRef = db.collection('crops').doc();
  await newCropRef.set({
    ...cropData,
    owner_id: userId, // Set owner_id explicitly from auth context
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: newCropRef.id, message: 'Crop created successfully.' };
});

/**
 * Cloud Function to retrieve a specific farm by ID using onCall.
 * Ensures the request is authenticated and authorized (user owns the farm).
 * Integrated from farms.ts.
 */
export const getFarm = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view farm details.'
    );
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing farm ID.'
    );
  }

  try {
    const farmDoc = await db.collection('farms').doc(farmId).get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    // Ensure the authenticated user is the owner of the farm
    if (farmOwnerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view this farm.'
      );
    }

    return { id: farmDoc.id, ...farmData };
  } catch (error: any) {
    console.error('Error retrieving farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not retrieve farm details.', error.message);
  }
});

/**
 * Cloud Function to retrieve all farms owned by the authenticated user using onCall.
 * Ensures the request is authenticated.
 * Integrated from farms.ts.
 */
export const getUserFarms = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view your farms.'
    );
  }

  const userId = context.auth.uid;

  const farmDocs = await db.collection('farms').where('owner_id', '==', userId).get();

  return farmDocs.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
});

/**
 * Cloud Function to retrieve a specific crop by ID using onCall.
 * Ensures the request is authenticated and authorized (user owns the farm the crop belongs to).
 * Integrated from farms.ts.
 */
export const getCrop = functions.https.onCall(async (data: { cropId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view crop details.'
    );
  }

  const userId = context.auth.uid;
  const { cropId } = data;

  if (!cropId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing crop ID.'
    );
  }

  try {
    const cropDoc = await db.collection('crops').doc(cropId).get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const cropData = cropDoc.data() as CropData | undefined;
    const farmId = cropData?.farm_id;

    if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    // Verify that the authenticated user is the owner of the farm the crop belongs to
    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmDocData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmDocData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to view this crop.'
      );
    }

    return { id: cropDoc.id, ...cropData };
  } catch (error: any) {
    console.error('Error retrieving crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not retrieve crop details.', error.message);
  }
});

/**
 * Cloud Function to retrieve all crops for a specific farm using onCall.
 * Ensures the request is authenticated and the user owns the farm.
 * Integrated from farms.ts.
 */
export const getFarmCrops = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view farm crops.'
    );
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
     throw new functions.https.HttpsError('invalid-argument', 'Missing farm ID.');
  }

  const cropDocs = await db.collection('crops').where('farm_id', '==', farmId).where('owner_id', '==', userId).get();

  return cropDocs.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
});

/**
 * Cloud Function to update a farm document.
 * Ensures the request is authenticated and the user owns the farm.
 * Integrated from farms.ts.
 */
export const updateFarm = functions.https.onCall(async (data: { farmId: string, updatedFarmData: Partial<FarmData> }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to update a farm.'
    );
  }

  const userId = context.auth.uid;
  const { farmId, updatedFarmData } = data;

  if (!farmId || !updatedFarmData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing farm ID or updated farm data.'
    );
  }

  try {
    const farmRef = db.collection('farms').doc(farmId);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (farmOwnerId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this farm.'
      );
    }

    // Ensure owner_id is not changed and createdAt is not part of updatedFarmData
    const { owner_id, createdAt, ...validUpdateData } = updatedFarmData as any;

    await farmRef.update({
        ...validUpdateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: farmId, message: 'Farm updated successfully.' };

  } catch (error: any) {
    console.error('Error updating farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not update farm.', error.message);
  }
});

/**
 * Cloud Function to delete a farm document.
 * Ensures the request is authenticated and the user owns the farm.
 * Deletes associated crops and updates user's farm_ids array atomically.
 * Integrated from farms.ts.
 */
export const deleteFarm = functions.https.onCall(async (data: { farmId: string }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to delete a farm.');
  }

  const userId = context.auth.uid;
  const { farmId } = data;

  if (!farmId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing farm ID.');
  }

  const farmRef = db.collection('farms').doc(farmId);
  const userRef = db.collection('users').doc(userId);
  const batch = db.batch();

  try {
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Farm not found.');
    }

    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (farmOwnerId !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this farm.'
      );
    }

    // 1. Delete associated crops
    const cropsSnapshot = await db.collection('crops').where('farm_id', '==', farmId).where('owner_id', '==', userId).get();
    if (!cropsSnapshot.empty) {
      cropsSnapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
    }

    // 2. Delete the farm itself
    batch.delete(farmRef);

    // 3. Remove the farm ID from the user's farm_ids array
    batch.update(userRef, {
      farm_ids: admin.firestore.FieldValue.arrayRemove(farmId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Also update user's updatedAt
    });

    // 4. Commit the batched operations
    await batch.commit();

    return { id: farmId, message: 'Farm and associated crops deleted successfully.' };

  } catch (error: any) {
    console.error('Error deleting farm:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not delete farm.', error.message);
  }
});

/**
 * Cloud Function to update a crop document.
 * Ensures the request is authenticated and the user owns the farm the crop belongs to.
 * Integrated from farms.ts.
 */
export const updateCrop = functions.https.onCall(async (data: { cropId: string, updatedCropData: Partial<CropData> }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to update a crop.'
    );
  }

  const userId = context.auth.uid;
  const { cropId, updatedCropData } = data;

  if (!cropId || !updatedCropData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing crop ID or updated crop data.'
    );
  }

  try {
    const cropRef = db.collection('crops').doc(cropId);
    const cropDoc = await cropRef.get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const currentCropData = cropDoc.data() as CropData | undefined;
    const farmId = currentCropData?.farm_id;

    if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId || currentCropData?.owner_id !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this crop.'
      );
    }

    // Ensure farm_id and owner_id are not changed, createdAt is not part of updatedCropData
    const { farm_id, owner_id, createdAt, ...validUpdateData } = updatedCropData as any;

    await cropRef.update({
        ...validUpdateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: cropId, message: 'Crop updated successfully.' };

  } catch (error: any) {
    console.error('Error updating crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not update crop.', error.message);
  }
});

/**
 * Cloud Function to delete a crop document.
 * Ensures the request is authenticated and the user owns the farm the crop belongs to.
 * Integrated from farms.ts.
 */
export const deleteCrop = functions.https.onCall(async (data: { cropId: string }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to delete a crop.');
  }

  const userId = context.auth.uid;
  const { cropId } = data;

  if (!cropId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing crop ID.');
  }

  try {
    const cropRef = db.collection('crops').doc(cropId);
    const cropDoc = await cropRef.get();

    if (!cropDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Crop not found.');
    }

    const cropData = cropDoc.data() as CropData | undefined;
    const farmId = cropData?.farm_id;

     if (!farmId) {
       throw new functions.https.HttpsError('internal', 'Crop document is missing farm ID.');
    }

    const farmDoc = await db.collection('farms').doc(farmId).get();
    const farmData = farmDoc.data() as FarmData | undefined;
    const farmOwnerId = farmData?.owner_id;

    if (!farmDoc.exists || farmOwnerId !== userId || cropData?.owner_id !== userId) {
       throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to delete this crop.'
      );
    }

    // Consider deleting associated subcollections here if they exist.
    await cropRef.delete();

    return { id: cropId, message: 'Crop deleted successfully.' };

  } catch (error: any) {
    console.error('Error deleting crop:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Could not delete crop.', error.message);
  }
});


// TODO: Implement predictYield
// This callable function is requested by the Module 3 frontend
// to get a yield prediction for a specific field.
/*
export const predictYield = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to request yield prediction.');
    }

    const callerUid = context.auth.uid;
    const { fieldId } = data;

    // Basic validation
    if (!fieldId || typeof fieldId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "fieldId" parameter is required and must be a string.');
    }

    // TODO: Implement authorization check: Ensure the caller is authorized to request prediction for this field.
    // Check if the caller's user VTI or linked organization VTI is the owner of the geospatial_asset document.
    const fieldDoc = await db.collection('geospatial_assets').doc(fieldId).get();
    if (!fieldDoc.exists || fieldDoc.data()?.ownerRef.id !== callerUid) { // Basic ownership check
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to request yield prediction for this field.');
    }

    console.log(`Yield prediction requested for field ${fieldId} by user ${callerUid}`);

    try {
       // 1. Fetch relevant data for prediction:
       //    - Field details (geospatial_assets).
       //    - Historical yield data for this field and similar fields (if available).
       //    - Historical weather data for this field's location.
       //    - Historical and recent farm activity logs for this field.
       //    - Recent field insights (NDVI, etc.).
       //    - Master data for the crop type.

       // 2. Call Module 8 (AI/ML Module) for yield prediction:
       //    - Pass the fetched data to an AI model API or function in Module 8.
       //    - Module 8 would process the data and return a yield prediction.

       // 3. Return the prediction to the frontend:
       //    const prediction = await callModule8YieldPredictionApi(predictionData);
       //    return { fieldId: fieldId, predictedYield: prediction.yield, unit: prediction.unit }; // Structure the response
       console.log(`Yield prediction for field ${fieldId} is being processed by Module 8.`);
       return { fieldId: fieldId, status: 'prediction_processing' }; // Or return actual prediction once Module 8 is integrated

    } catch (error) {
        console.error(`Error requesting yield prediction for field ${fieldId}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to request yield prediction.', error);
    }
});
*/