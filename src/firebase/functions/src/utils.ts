

import * as admin from "firebase-admin";
import type { UserRole } from "@/lib/types";

const db = admin.firestore();

/**
 * Recursively deletes a collection in batches.
 * @param {string} collectionPath The path to the collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 */
export async function deleteCollectionByPath(collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve, reject);
    });
}

/**
 * Helper function for deleteCollectionByPath to delete documents from a query in batches.
 * @param {FirebaseFirestore.Query} query The query to delete documents from.
 * @param {Function} resolve The promise resolve function.
 * @param {Function} reject The promise reject function.
 */
async function deleteQueryBatch(query: admin.firestore.Query, resolve: (value?: unknown) => void, reject: (reason?: any) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the same query to delete more documents
    process.nextTick(() => {
        deleteQueryBatch(query, resolve, reject);
    });
}

/**
 * Helper function to get a user's role from Firestore.
 * This is not a callable function, but a utility for other backend functions.
 * @param {string | undefined} uid The user's ID.
 * @return {Promise<UserRole | null>} The user's role or null if not found.
 */
export async function getRole(uid: string | undefined): Promise<UserRole | null> {
  if (!uid) {
    return null;
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.primaryRole;
    return role ? (role as UserRole) : null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Helper function to get a user's document from Firestore.
 * This is not a callable function, but a utility for other backend functions.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(
  uid: string,
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc : null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
}
