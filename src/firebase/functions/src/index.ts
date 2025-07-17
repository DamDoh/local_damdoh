
/**
 * @fileoverview This is the main entry point for all Firebase Cloud Functions.
 * It initializes the Firebase Admin SDK and exports all the functions from other
 * modules, making them available for deployment.
 */

import * as admin from "firebase-admin";
import { configureGenkit } from "../../src/ai/genkit";

// The 'server.ts' file handles its own initialization.
// We import it to ensure Express routes are registered with Cloud Functions.
import expressApp from "./server";
import * as functions from "firebase-functions";

// We only need to initialize the admin SDK once for all other functions.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize the Genkit AI framework
configureGenkit();

// Export all other cloud functions
export * from "./traceability";
export * from "./profiles";
export * from "./farm-management";
export * from "./marketplace";
export * from "./community";
export * from "./ai-and-analytics";
export * from "./financial-services";
export * from "./knowledge-hub";
export * from "./api-gateway";
export * from "./regulatory-and-compliance";
export * from "./insurance";
export * from "./sustainability";
export * from "./notifications";
export * from "./dashboard_data";
export * from "./search";
export * from "./offline_sync";
export * from "./forums";
export * from "./groups";
export * from "./messages";
export * from "./agri-events";
export * from "./universal-id";
export * from "./agro-tourism";
export * from "./network";
export * from "./labor";
export * from "./ai-services";
export * from "./api-keys";
export * from "./geospatial";


/**
 * Recursively deletes a collection in batches.
 * This is a helper function used by onUserDeleteCleanup.
 * @param {string} collectionPath The path of the collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 * @return {Promise<void>}
 */
async function deleteCollection(collectionPath: string, batchSize: number): Promise<void> {
  const db = admin.firestore();
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

/**
 * Recursively deletes documents from a query in batches.
 * @param {FirebaseFirestore.Query} query The query to delete documents from.
 * @param {() => void} resolve The promise resolve function.
 */
async function deleteQueryBatch(query: admin.firestore.Query, resolve: () => void): Promise<void> {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    resolve();
    return;
  }

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

/**
 * A cleanup function triggered when a user is deleted from Firebase Authentication.
 * This function performs a "cascade delete" to remove all of a user's data
 * from various collections in Firestore, ensuring data privacy compliance.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    const userId = user.uid;
    console.log(`Starting data cleanup for deleted user: ${userId}`);

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    const cleanupPromises: Promise<any>[] = [];

    // 1. Delete main user profile document
    cleanupPromises.push(userRef.delete());

    // 2. Delete all subcollections of the user
    cleanupPromises.push(deleteCollection(`users/${userId}/workers`, 100));
    cleanupPromises.push(deleteCollection(`users/${userId}/api_keys`, 50));
    cleanupPromises.push(deleteCollection(`users/${userId}/certifications`, 50));


    // 3. Delete all top-level documents directly created by the user
    const collectionsToClean: { name: string, userField: string }[] = [
        { name: 'posts', userField: 'userId' },
        { name: 'farms', userField: 'ownerId' },
        { name: 'crops', userField: 'ownerId' },
        { name: 'knf_batches', userField: 'userId' },
        { name: 'marketplaceItems', userField: 'sellerId' },
        { name: 'shops', userField: 'ownerId' },
        { name: 'agri_events', userField: 'organizerId' },
        { name: 'financial_transactions', userField: 'userRef' }, // Note: userRef is a reference, not a string
    ];

    collectionsToClean.forEach(collectionInfo => {
        const userIdentifier = collectionInfo.userField === 'userRef' ? userRef : userId;
        const query = db.collection(collectionInfo.name).where(collectionInfo.userField, '==', userIdentifier);
        cleanupPromises.push(query.get().then(snapshot => {
            if (snapshot.empty) return;
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        }));
    });
    
    // 4. Clean up connections in other users' documents
    const connectionsQuery = db.collection('users').where('connections', 'array-contains', userId);
    cleanupPromises.push(connectionsQuery.get().then(snapshot => {
        if (snapshot.empty) return;
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { connections: admin.firestore.FieldValue.arrayRemove(userId) });
        });
        return batch.commit();
    }));
    
    // 5. Clean up group memberships
    const groupMembershipQuery = db.collectionGroup('members').where(admin.firestore.FieldPath.documentId(), '==', userId);
    cleanupPromises.push(groupMembershipQuery.get().then(snapshot => {
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        const groupRef = doc.ref.parent.parent;
        if(groupRef) {
          batch.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
        batch.delete(doc.ref);
      });
      return batch.commit();
    }));


    try {
        await Promise.all(cleanupPromises);
        console.log(`Successfully completed data cleanup for user: ${userId}`);
    } catch (error) {
        console.error(`Error during data cleanup for user ${userId}:`, error);
    }
});


// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(expressApp);
