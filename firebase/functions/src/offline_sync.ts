import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';

const db = admin.firestore();


// --- Cross-Cutting Data Synchronization for Offline Use ---

// This file contains backend components for handling data synchronization
// from user devices that were offline.


// Conceptual Data Model for the 'offline_changes_log' Collection:
// This collection stores records of changes made by users while offline,
// waiting to be synchronized with the main database.
// interface OfflineChange {
//     changeId: string; // Document ID
//     userId: string; // ID of the user who made the change
//     timestamp: admin.firestore.Timestamp; // Client timestamp when the change was made
//     collectionPath: string; // The Firestore collection path (e.g., 'farm_activity_logs', 'users/userId/subcollection')
//     documentId: string; // The ID of the document being changed
//     operation: 'create' | 'update' | 'delete'; // The type of operation
//     payload: { [key: string]: any } | null; // The data for create/update operations
//     status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict'; // Current status of the change log entry
//     clientDeviceId: string | null; // Optional: Identifier for the client device
//     processingAttempts: number; // Number of times processing has been attempted
//     lastAttemptTimestamp: admin.firestore.FieldValue | null; // Timestamp of the last processing attempt
//     errorMessage: string | null; // Error message if processing failed
//     conflictDetails: { [key: string]: any } | null; // Details about conflict if status is 'conflict'
//     createdAt: admin.firestore.FieldValue; // Timestamp when the log record was created in Firestore
//     processedAt: admin.firestore.FieldValue | null; // Timestamp when the log record was marked completed, failed, or conflict
// }
 

// Callable function for authenticated users to upload a batch of offline changes
export const uploadOfflineChanges = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to upload offline changes.');
    }

    const callerUid = context.auth.uid;
    const { changes } = data; // Expecting an array of offline change records

    // Basic validation
    if (!Array.isArray(changes) || changes.length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'An array of changes is required.');
    }

    // Validate structure of each change record (basic check)
     if (changes.some(change => !change.collectionPath || !change.documentId || !change.operation || !change.timestamp)) {
          throw new functions.https.HttpsError('invalid-argument', 'Each change record must include collectionPath, documentId, operation, and timestamp.');
     }


    try {
        const batch = db.batch();
        const uploadedChangeIds: string[] = [];

        console.log(`User ${callerUid} uploading ${changes.length} offline changes.`);

        changes.forEach(change => {
             // Create a new document in the offline_changes_log collection for each change
             const newChangeRef = db.collection('offline_changes_log').doc(); // Auto-generate document ID
             const changeId = newChangeRef.id;
             uploadedChangeIds.push(changeId);

            batch.set(newChangeRef, {
                changeId: changeId,
                userId: callerUid,
                timestamp: admin.firestore.Timestamp.fromMillis(change.timestamp), // Convert client timestamp to Firestore Timestamp
                collectionPath: change.collectionPath,
                documentId: change.documentId,
                operation: change.operation,
                payload: change.payload || null,
                status: 'pending', // Mark as pending for processing
                clientDeviceId: change.clientDeviceId || null,
                processingAttempts: 0,
                lastAttemptTimestamp: null,
                errorMessage: null,
                conflictDetails: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(), // Server timestamp of upload
 processedAt: null,
            });
        });

        await batch.commit();
         console.log(`Successfully stored ${changes.length} offline changes in log for user ${callerUid}.`);


        return { status: 'success', uploadedCount: changes.length, uploadedChangeIds: uploadedChangeIds };

    } catch (error) {
        console.error(`Error uploading offline changes for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to upload offline changes.', error);
    }
});


// Triggered function for processing individual offline change log entries
// This function is triggered by new documents in the 'offline_changes_log' collection
// with status 'pending'.
export const processOfflineChange = functions.firestore
    .document('offline_changes_log/{changeId}')
    .onCreate(async (snapshot, context) => {
        const changeId = context.params.changeId;
        const changeData = snapshot.data();
 
        // Only process if the status is 'pending' (to avoid reprocessing on status updates)
 // Check if the change has already been processed (status != 'pending')
        if (changeData.status !== 'pending') {
 if (changeData.status !== 'processing') { // Avoid logging for transitions to 'processing' within the transaction
             console.log(`Offline change log ${changeId} is not pending. Skipping processing.`);
             return null;
        }

        console.log(`Processing offline change log: ${changeId} for user ${changeData.userId}. Operation: ${changeData.operation} on ${changeData.collectionPath}/${changeData.documentId}.`);

        const { userId, collectionPath, documentId, operation, payload, clientDeviceId, timestamp } = changeData;
        const targetDocRef = db.collection(collectionPath).doc(documentId);
 
        // Immediately mark the change log as 'processing' within the main function scope
 // This prevents duplicate processing if the trigger fires multiple times before the transaction completes
 try {
 await snapshot.ref.update({ status: 'processing', processingAttempts: admin.firestore.FieldValue.increment(1), lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp() });
 console.log(`Marked offline change log ${changeId} as processing.`);
 } catch (updateError) {
 console.error(`Failed to mark offline change log ${changeId} as processing:`, updateError);
 // If we can't even mark as processing, there's a significant issue. Log and return.
 return null;
 }
 
        // Start a transaction to read the current document state and apply the change atomically
        try {
 await db.runTransaction(async (transaction) => {
                const targetDoc = await transaction.get(targetDocRef);
 
                // --- 1. Process the Change (Placeholder Logic) ---

                // Handle 'create' operation
                if (operation === 'create') {
                    if (targetDoc.exists) {
                        // Conflict: Document already exists online.
                        // TODO: Implement conflict resolution for creation.
                        // - Option 1: Flag as conflict for manual review.
                        // - Option 2: Merge data (if applicable, but tricky for create).
                        // - Option 3: Client "last write wins" (overwrite online version if client timestamp is newer, risky).
                        console.warn(`Conflict: Document ${collectionPath}/${documentId} already exists online during create operation.`);
                        transaction.update(snapshot.ref, {
                            status: 'conflict',
                            conflictDetails: { reason: 'document_already_exists', onlineExists: true },
                            processingAttempts: admin.firestore.FieldValue.increment(1),
                            lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
 processedAt: admin.firestore.FieldValue.serverTimestamp(), // Mark as processed
                        });
 throw new Error('Conflict detected: Document already exists.'); // Rollback transaction

                    } else {
                        // No conflict, apply create
                         console.log(`Applying create operation for ${collectionPath}/${documentId}.`);
                         // Ensure essential fields like owner/user references are correct if coming from offline payload
                        const dataToSet = { ...payload, createdAt: timestamp, updatedAt: timestamp }; // Use client timestamp for creation time
                        transaction.set(targetDocRef, dataToSet);
                         console.log(`Create operation applied for ${collectionPath}/${documentId}.`);
                    }

                // Handle 'update' operation
                } else if (operation === 'update') {
                    if (!targetDoc.exists) {
                        // Conflict: Document doesn't exist online, but was updated offline.
                        // TODO: Implement conflict resolution for update on non-existent document.
                        // - Option 1: Flag as conflict.
                        // - Option 2: Replay as a 'create' with the update payload (potentially complex).
                        console.warn(`Conflict: Document ${collectionPath}/${documentId} not found online during update operation.`);
                        transaction.update(snapshot.ref, {
                            status: 'conflict',
                            conflictDetails: { reason: 'document_not_found', onlineExists: false },
                            processingAttempts: admin.firestore.FieldValue.increment(1),
                            lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
 processedAt: admin.firestore.FieldValue.serverTimestamp(), // Mark as processed
                        });
 throw new Error('Conflict detected: Document not found.'); // Rollback transaction

                    } else {
                        // Document exists online, check for conflicts based on timestamps or versions
 const onlineData: any = targetDoc.data();
                         // Assuming documents have an 'updatedAt' or similar timestamp field for conflict checking
                         // Or using a version counter
                         const onlineTimestamp = onlineData?.updatedAt?.toDate() || onlineData?.createdAt?.toDate() || new Date(0);
                         const clientTimestamp = timestamp.toDate();

                        // --- 2. Conflict Resolution (Placeholder Strategies) ---

                         // Simple "Client Last Write Wins" strategy based on timestamp
                         if (clientTimestamp >= onlineTimestamp) {
                            // Client change is newer or same age, apply the update
                             console.log(`Applying update operation for ${collectionPath}/${documentId}. Client timestamp >= Online timestamp.`);
                            const dataToUpdate = { ...payload, updatedAt: admin.firestore.FieldValue.serverTimestamp() }; // Use server timestamp for online update time
                            transaction.update(targetDocRef, dataToUpdate);
                             console.log(`Update operation applied for ${collectionPath}/${documentId}.`);

                         } else {
                            // Conflict: Online version is newer.
                            // TODO: Implement more sophisticated conflict resolution.
                            // - Option 1: Flag as conflict for manual review.
                            // - Option 2: Attempt to merge specific fields (requires detailed understanding of data structure).
                            // - Option 3: Discard the client change (simplest, but loses data).
                            console.warn(`Conflict: Online version of ${collectionPath}/${documentId} is newer than client change.`);
                            transaction.update(snapshot.ref, {
                                status: 'conflict',
                                conflictDetails: { reason: 'online_version_newer', clientTimestamp: clientTimestamp.toISOString(), onlineTimestamp: onlineTimestamp.toISOString(), onlineData: onlineData },
                                processingAttempts: admin.firestore.FieldValue.increment(1),
                                lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
 processedAt: admin.firestore.FieldValue.serverTimestamp(), // Mark as processed
                            });
 throw new Error('Conflict detected: Online version is newer.'); // Rollback transaction
                         }
                    }

                // Handle 'delete' operation
                } else if (operation === 'delete') {
                    if (!targetDoc.exists) {
                        // No conflict, document already doesn't exist online
                         console.log(`Document ${collectionPath}/${documentId} already deleted online. No action needed.`);
                    } else {
                        // Document exists online, apply delete
                         console.log(`Applying delete operation for ${collectionPath}/${documentId}.`);
                        transaction.delete(targetDocRef);
                         console.log(`Delete operation applied for ${collectionPath}/${documentId}.`);
                    }

                } else {
                    // Unknown operation type
                     console.error(`Unknown operation type in offline change log ${changeId}: ${operation}.`);
                    transaction.update(snapshot.ref, {
                        status: 'failed',
                        errorMessage: `Unknown operation type: ${operation}`,
                        processingAttempts: admin.firestore.FieldValue.increment(1),
                        lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
 processedAt: admin.firestore.FieldValue.serverTimestamp(), // Mark as processed
                    });
 throw new Error('Unknown operation type.'); // Rollback transaction

                }

                // If transaction reaches here without throwing, mark the log as completed
                transaction.update(snapshot.ref, {
                    status: 'completed',
                    processingAttempts: admin.firestore.FieldValue.increment(1),
                    lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
                 console.log(`Offline change log ${changeId} processed successfully.`);

             }); // End transaction

            return null; // Indicate successful completion

        } catch (error: any) {
             console.error(`Transaction failed or conflict handled for offline change log ${changeId}:`, error);
             // If the error was a conflict we explicitly threw within the transaction,
             // the status will be updated to 'conflict' by the transaction itself.
             // If it was another error during processing, we might catch it here
             // and update the status to 'failed'.
             if (snapshot.ref.firestore) { // Check if the snapshot reference is still valid
                 // This part might need careful handling if the transaction itself failed due to a Firestore issue.
                 // For simplicity here, we assume conflicts are handled within the transaction,
                 // and other errors might lead to setting status to 'failed'.
                 // A more robust approach might involve retries or specific error handling.
                 if (changeData.status === 'pending') { // Only update status if it's still pending after a non-conflict error
                      snapshot.ref.update({
                          status: 'failed',
                          errorMessage: error.message,
                          processingAttempts: admin.firestore.FieldValue.increment(1),
                          lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                      }).catch(updateErr => console.error(`Failed to update log status to failed: ${updateErr}`));
                 }
             }
            return null; // Indicate processing attempt finished
        }
    });