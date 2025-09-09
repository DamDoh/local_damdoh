import * as admin from "firebase-admin";
import type { UserRole } from "@/lib/types";
import * as functions from "firebase-functions";
import { logError } from "./logging";

const db = admin.firestore();

/**
 * Recursively deletes all documents in a collection.
 * @param {string} collectionPath - The path to the collection to delete.
 * @param {number} batchSize - The number of documents to delete per batch.
 */
export const deleteCollectionByPath = async (collectionPath: string, batchSize: number = 100): Promise<void> => {
  const collectionRef = db.collection(collectionPath);
  
  const query = collectionRef.limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
};

async function deleteQueryBatch(query: admin.firestore.Query, resolve: () => void) {
  const snapshot = await query.get();
  
  const batchSize = snapshot.size;
  if (batchSize === 0) {
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
  
  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

/**
 * Gets the role of a user from their profile document.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string | null>} The user's primary role or null if not found.
 */
export const getRole = async (userId: string): Promise<string | null> => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    const userData = userDoc.data();
    return userData?.primaryRole || null;
  } catch (error) {
    logError("Error getting user role", { userId, error });
    return null;
  }
};

/**
 * Helper function to get a user's document from Firestore.
 * This is not a callable function, but a utility for other backend functions.
 * @param {string} uid The user's ID.
 * @return {Promise<FirebaseFirestore.DocumentSnapshot | null>} The user's document snapshot or null if not found.
 */
export async function getUserDocument(
  uid: string,
): Promise<admin.firestore.DocumentSnapshot | null> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists ? userDoc : null;
  } catch (error) {
    logError("Error getting user document", { uid, error });
    return null;
  }
}

/**
 * Checks if the user is authenticated.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {string} The user's UID.
 * @throws {functions.https.HttpsError} Throws an error if the user is not authenticated.
 */
export const checkAuth = (context: functions.https.CallableContext): string => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "error.unauthenticated");
  }
  return context.auth.uid;
};
