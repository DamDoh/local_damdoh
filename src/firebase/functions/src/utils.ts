

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";

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
 * Triggered on new Firebase Authentication user creation.
 * Creates a corresponding user document in Firestore with default values.
 * This is the secure, server-side way to create user profiles.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    console.log(`New user signed up: ${user.uid}, email: ${user.email}`);

    const userRef = db.collection("users").doc(user.uid);
    const universalId = uuidv4();

    try {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || "New User",
            avatarUrl: user.photoURL || null,
            primaryRole: 'Consumer', // Default role
            profileSummary: "Just joined the DamDoh community!",
            universalId: universalId,
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created Firestore profile for user ${user.uid}.`);
        return null;
    } catch (error) {
        console.error(`Error creating Firestore profile for user ${user.uid}:`, error);
        return null;
    }
});


/**
 * Triggered when a user deletes their Firebase Authentication account.
 * This function performs a "cascade delete" to remove all of the user's
 * data from the Firestore database, ensuring GDPR/CCPA compliance.
 */
export const onUserDeleteCleanup = functions.auth.user().onDelete(async (user) => {
    console.log(`User account deleted: ${user.uid}. Starting data cleanup.`);
    const uid = user.uid;
    const batchSize = 200; // Define a batch size for deletions

    const collectionsToDelete = [
        { name: 'posts', userIdField: 'userId' },
        { name: 'marketplaceItems', userIdField: 'sellerId' },
        { name: 'farms', userIdField: 'ownerId' },
        { name: 'crops', userIdField: 'ownerId' },
        { name: 'knf_batches', userIdField: 'userId' },
        { name: 'financial_transactions', userIdField: 'userRef' }, // Note: userRef is a reference, not a string
        { name: 'shops', userIdField: 'ownerId' },
        // ... add more collections as needed
    ];

    try {
        const promises: Promise<any>[] = [];

        // Delete top-level collections created by the user
        for (const collection of collectionsToDelete) {
            let query;
            if (collection.userIdField === 'userRef') {
                const userRef = db.collection('users').doc(uid);
                query = db.collection(collection.name).where(collection.userIdField, '==', userRef);
            } else {
                query = db.collection(collection.name).where(collection.userIdField, '==', uid);
            }
            
            const snapshot = await query.get();
            if (!snapshot.empty) {
                console.log(`Deleting ${snapshot.size} documents from '${collection.name}' for user ${uid}.`);
                const deletePromise = Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
                promises.push(deletePromise);
            }
        }
        
        // Delete user's own profile document
        promises.push(db.collection('users').doc(uid).delete());
        
        // Delete any collections nested under the user document
        const subCollections = ['workers', 'inventory', 'api_keys', 'certifications'];
        for (const subCollection of subCollections) {
            const path = `users/${uid}/${subCollection}`;
            promises.push(deleteCollectionByPath(path, batchSize));
        }

        // Delete other user-specific documents
        promises.push(db.collection('credit_scores').doc(uid).delete());
        promises.push(db.collection('user_funding_recommendations').doc(uid).delete());


        await Promise.all(promises);
        console.log(`Successfully completed data cleanup for user ${uid}.`);
        return null;

    } catch (error) {
        console.error(`Error cleaning up data for user ${uid}:`, error);
        return null;
    }
});
