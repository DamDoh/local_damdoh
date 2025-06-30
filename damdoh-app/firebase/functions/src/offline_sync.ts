
/**
 * =================================================================
 * Module 14: Offline Synchronization (The Resilient Backbone)
 * =================================================================
 * This module is a critical background service that ensures the DamDoh Super App
 * remains fully functional and reliable in environments with limited,
 * intermittent, or no internet connectivity, which is common in many rural
 * agricultural areas worldwide.
 *
 * @purpose To provide a seamless user experience by allowing farmers and
 * stakeholders to continue using core app functionalities, inputting data, and
 * accessing cached information even when offline, with all changes automatically
 * synchronizing with the central system once connectivity is restored.
 *
 * @key_concepts
 * - Offline Data Caching: Uses local device storage (e.g., SQLite, IndexedDB)
 *   to store frequently accessed data.
 * - Queued Operations: Any data changes made offline are stored in a local
 *   queue for later synchronization.
 * - Conflict Resolution: Implements robust strategies (e.g., last-write-wins,
 *   timestamp-based merges) to handle data conflicts.
 * - Background Syncing: Utilizes operating system capabilities to perform
 *   synchronization in the background.
 * - User Feedback: Provides clear visual cues to the user about their
 *   online/offline status and sync progress.
 *
 * @firebase_data_model
 * - offline_changes_log: A collection to log incoming changes from clients
 *   before they are processed and applied to the main database collections.
 *   This ensures durability and allows for retries and conflict analysis.
 *
 * @synergy
 * - This is a cross-cutting module that interacts with nearly all other
 *   modules by queuing and applying changes to their respective collections.
 * - Relies on Module 2 (Profiles) for user authentication during sync.
 * - Triggers Module 13 (Notifications) to inform users of sync status.
 *
 * @third_party_integrations
 * - Local Databases/Storage Solutions: (e.g., Realm, SQLite, Dexie.js).
 * - Platform-specific background execution APIs (e.g., Android WorkManager).
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// --- Cross-Cutting Data Synchronization for Offline Use ---

/**
 * Callable function for authenticated users to upload a batch of offline changes.
 * This is the primary entry point for a client that has come back online.
 * @param {any} data The data for the function call, containing an array of changes.
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
    const { changes } = data; // Expecting an array of offline change records

    if (!Array.isArray(changes) || changes.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "An array of changes is required.",
      );
    }

    // Validate that each change has the required properties
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
          payload: change.payload || null,
          status: "pending", // To be processed by the trigger
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
      console.log(`Successfully stored ${changes.length} offline changes in log for user ${callerUid}.`);

      return {
        status: "success",
        uploadedCount: changes.length,
        uploadedChangeIds: uploadedChangeIds,
      };
    } catch (error: any) {
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
 * Triggered function for processing individual offline change log entries.
 * This is the core of the server-side sync logic.
 * @param {functions.firestore.DocumentSnapshot} snapshot The document snapshot.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const processOfflineChange = functions.firestore
  .document("offline_changes_log/{changeId}")
  .onCreate(async (snapshot, context) => {
    const changeId = context.params.changeId;
    const changeData = snapshot.data();

    if (!changeData || changeData.status !== "pending") {
      console.log(
        `Offline change log ${changeId} is not pending or data is missing. Skipping processing.`,
      );
      return null;
    }

    console.log(
      `Processing offline change log: ${changeId} for user ${changeData.userId}. Operation: ${changeData.operation} on ${changeData.collectionPath}/${changeData.documentId}.`,
    );

    await snapshot.ref.update({
      status: "processing",
      processingAttempts: admin.firestore.FieldValue.increment(1),
      lastAttemptTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    const { collectionPath, documentId, operation, payload, timestamp } = changeData;
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
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        } else if (operation === "update") {
          if (!targetDoc.exists) {
            throw new Error("Conflict: Document not found for update");
          }
          // Conflict Resolution: Last-write-wins based on client timestamp
          const onlineTimestamp =
            targetDoc.data()?.updatedAt?.toDate() || new Date(0);
          if (timestamp.toDate() < onlineTimestamp) {
            throw new Error("Conflict: Online version is newer");
          }
          transaction.update(targetDocRef, {
            ...payload,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else if (operation === "delete") {
          if (targetDoc.exists) {
            transaction.delete(targetDocRef);
          }
        } else {
          throw new Error(`Unknown operation type: ${operation}`);
        }
      });

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

// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 14
// =================================================================

/**
 * [Conceptual] Can be used to send push notifications (via Module 13)
 * back to the client upon completion or failure of a complex sync operation.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean}>} A promise that resolves when the function completes.
 */
export const notifyClientSyncStatus = functions.https.onCall(async (data, context) => {
    console.log("[Conceptual] Notifying client of sync status with data:", data);
    // 1. Authenticate that this is called by a trusted internal service.
    // 2. Call Module 13's central notification function with the user ID and status message.
    return { success: true };
});
