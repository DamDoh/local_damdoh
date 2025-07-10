
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// --- Cross-Cutting Data Synchronization for Offline Use ---

/**
 * Callable function for authenticated users to upload a batch of offline changes.
 * This function receives an array of changes from the client's outbox.
 * Each change is written as a 'pending' document in the `offline_changes_log` collection,
 * which then triggers the `processOfflineChange` function.
 * 
 * @param {any} data The data for the function call, expecting a `changes` array.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{status: string, uploadedCount: number, uploadedChangeIds: string[]}>} A promise that resolves with the upload status.
 */
export const uploadOfflineChanges = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to upload offline changes.",
      );
    }

    const callerUid = context.auth.uid;
    const {changes} = data; // Expecting an array of offline change records

    if (!Array.isArray(changes) || changes.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "An array of changes is required.",
      );
    }

    // Basic validation for each change object
    if (
      changes.some(
        (change) =>
          !change.collectionPath ||
          !change.documentId ||
          !change.operation ||
          !change.timestamp,
      )
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Each change record must include collectionPath, documentId, operation, and timestamp.",
      );
    }


    try {
      const batch = db.batch();
      const uploadedChangeIds: string[] = [];

      console.log(`User ${callerUid} uploading ${changes.length} offline changes.`);

      changes.forEach((change) => {
        const newChangeRef = db.collection("offline_changes_log").doc();
        const changeId = newChangeRef.id;
        uploadedChangeIds.push(changeId);

        // Create a detailed log entry for each offline change
        batch.set(newChangeRef, {
          changeId: changeId,
          userId: callerUid,
          timestamp: admin.firestore.Timestamp.fromMillis(change.timestamp),
          collectionPath: change.collectionPath,
          documentId: change.documentId,
          operation: change.operation,
          payload: change.payload || null, // The actual data to create/update
          status: "pending", // Initial status
          clientDeviceId: change.clientDeviceId || null,
          processingAttempts: 0,
          lastAttemptTimestamp: null,
          errorMessage: null,
          conflictDetails: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          processedAt: null,
        });
      });

      await batch.commit();
      console.log(
        `Successfully stored ${changes.length} offline changes in log for user ${callerUid}.`,
      );


      return {
        status: "success",
        uploadedCount: changes.length,
        uploadedChangeIds: uploadedChangeIds,
      };
    } catch (error) {
      console.error(`Error uploading offline changes for user ${callerUid}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Unable to upload offline changes.",
        error,
      );
    }
  },
);


/**
 * Firestore trigger that processes an individual offline change log entry.
 * It's responsible for applying the change to the main database and handling conflicts.
 * This uses a "Last-Write-Wins based on Client Timestamp" strategy.
 *
 * @param {functions.firestore.DocumentSnapshot} snapshot The document snapshot of the new change log entry.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const processOfflineChange = functions.firestore
  .document("offline_changes_log/{changeId}")
  .onCreate(async (snapshot, context) => {
    const changeId = context.params.changeId;
    const changeData = snapshot.data();

    // Do not process if the log is not pending or has no data
    if (!changeData || changeData.status !== "pending") {
      console.log(
        `Offline change log ${changeId} is not pending or data is missing. Skipping processing.`,
      );
      return null;
    }

    console.log(
      `Processing offline change log: ${changeId} for user ${changeData.userId}. Operation: ${changeData.operation} on ${changeData.collectionPath}/${changeData.documentId}.`,
    );

    // Mark the log as 'processing' to prevent re-runs
    await snapshot.ref.update({
      status: "processing",
      processingAttempts: admin.firestore.FieldValue.increment(1),
      lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    const {collectionPath, documentId, operation, payload, timestamp} =
      changeData;
    const targetDocRef = db.collection(collectionPath).doc(documentId);

    try {
      await db.runTransaction(async (transaction) => {
        const targetDoc = await transaction.get(targetDocRef);

        if (operation === "create") {
          if (targetDoc.exists) {
            throw new Error("Conflict: Document already exists");
          }
          transaction.set(targetDocRef, {
            ...payload,
            createdAt: timestamp, // Use client's timestamp for creation
            updatedAt: timestamp,
          });
        } else if (operation === "update") {
          if (!targetDoc.exists) {
            throw new Error("Conflict: Document not found for update");
          }
          // Conflict Resolution: Last Write Wins based on client timestamp
          const onlineTimestamp =
            targetDoc.data()?.updatedAt?.toDate() || new Date(0);
          if (timestamp.toDate() < onlineTimestamp) {
            throw new Error("Conflict: Online version is newer");
          }
          transaction.update(targetDocRef, {
            ...payload,
            updatedAt: timestamp, // Use client's timestamp for the update
          });
        } else if (operation === "delete") {
          // If the document doesn't exist, it's considered a success (idempotent)
          if (targetDoc.exists) {
            transaction.delete(targetDocRef);
          }
        } else {
          throw new Error(`Unknown operation type: ${operation}`);
        }
      });

      // If transaction is successful, mark as completed
      await snapshot.ref.update({
        status: "completed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      console.error(
        `Transaction failed for offline change log ${changeId}:`,
        error.message,
      );
      const isConflict = error.message.startsWith("Conflict:");
      await snapshot.ref.update({
        status: isConflict ? "conflict" : "failed",
        errorMessage: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    return null;
  });
