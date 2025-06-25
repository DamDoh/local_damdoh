
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
export const processOfflineChange = functions.firestore
    .document('offline_changes_log/{changeId}')
    .onCreate(async (snapshot, context) => {
        const changeId = context.params.changeId;
        const changeData = snapshot.data();
 
        if (changeData.status !== 'pending') {
            console.log(`Offline change log ${changeId} is not pending. Skipping processing.`);
            return null;
        }

        console.log(`Processing offline change log: ${changeId} for user ${changeData.userId}. Operation: ${changeData.operation} on ${changeData.collectionPath}/${changeData.documentId}.`);

        // Mark as processing to prevent re-runs
        await snapshot.ref.update({
            status: 'processing',
            processingAttempts: admin.firestore.FieldValue.increment(1),
            lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        const { collectionPath, documentId, operation, payload, timestamp } = changeData;
        const targetDocRef = db.collection(collectionPath).doc(documentId);
 
        try {
            await db.runTransaction(async (transaction) => {
                const targetDoc = await transaction.get(targetDocRef);
 
                if (operation === 'create') {
                    if (targetDoc.exists) {
                        throw new Error('Conflict: Document already exists');
                    }
                    transaction.set(targetDocRef, { ...payload, createdAt: timestamp, updatedAt: timestamp });
                } else if (operation === 'update') {
                    if (!targetDoc.exists) {
                        throw new Error('Conflict: Document not found for update');
                    }
                    const onlineTimestamp = targetDoc.data()?.updatedAt?.toDate() || new Date(0);
                    if (timestamp.toDate() < onlineTimestamp) {
                        throw new Error('Conflict: Online version is newer');
                    }
                    transaction.update(targetDocRef, { ...payload, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                } else if (operation === 'delete') {
                    if (targetDoc.exists) {
                       transaction.delete(targetDocRef);
                    }
                } else {
                    throw new Error(`Unknown operation type: ${operation}`);
                }
            });

            // If transaction succeeds, mark as completed
            await snapshot.ref.update({ status: 'completed', processedAt: admin.firestore.FieldValue.serverTimestamp() });

        } catch (error: any) {
            console.error(`Transaction failed for offline change log ${changeId}:`, error.message);
            const isConflict = error.message.startsWith('Conflict:');
            await snapshot.ref.update({
                status: isConflict ? 'conflict' : 'failed',
                errorMessage: error.message,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        return null;
    });
