
import * as admin from "firebase-admin";

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
