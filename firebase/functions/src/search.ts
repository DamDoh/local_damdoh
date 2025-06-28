
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getUserDocument} from "./profiles";

const db = admin.firestore();

/**
 * A generic Firestore trigger that listens to writes on specified collections
 * and creates/updates a corresponding document in a dedicated 'search_index' collection.
 * This pattern allows for more flexible querying than Firestore's native capabilities.
 * @param {functions.Change<functions.firestore.DocumentSnapshot>} change The change event.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
export const onSourceDocumentWriteIndex = functions.firestore
  .document("{collectionId}/{documentId}")
  .onWrite(async (change, context) => {
    const {collectionId, documentId} = context.params;
    const newData = change.after.exists ? change.after.data() : null;

    console.log(`Search indexing trigger fired for: ${collectionId}/${documentId}`);

    const indexableCollections = [
      "marketplaceItems",
      "forums",
      "users",
    ];

    if (!indexableCollections.includes(collectionId)) {
      // Not a collection we want to index, so we exit.
      return null;
    }

    const indexItemRef = db
      .collection("search_index")
      .doc(`${collectionId}_${documentId}`);

    if (!newData) {
      // Document was deleted, remove it from the search index.
      console.log(`Document deleted in ${collectionId}/${documentId}. Removing from search index.`);
      await indexItemRef.delete();
      return null;
    }

    // Prepare a standardized object for our search index.
    const indexData: any = {
      itemId: documentId,
      itemCollection: collectionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: newData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    };

    switch (collectionId) {
    case "marketplaceItems":
      indexData.title = newData.name;
      indexData.description = newData.description;
      indexData.tags = [newData.category, newData.listingType, ...(newData.skillsRequired || [])];
      indexData.location = newData.location;
      break;
    case "forums":
      indexData.title = newData.name;
      indexData.description = newData.description;
      indexData.tags = newData.regionTags || [];
      break;
    case "users":
      indexData.title = newData.name;
      indexData.description = newData.profileSummary || newData.bio || "";
      indexData.tags = [newData.primaryRole, ...(newData.areasOfInterest || [])];
      indexData.location = newData.location;
      break;
    default:
      console.warn(`Indexing logic not implemented for collection: ${collectionId}`);
      return null;
    }

    try {
      await indexItemRef.set(indexData, {merge: true});
      console.log(`Indexed ${collectionId}/${documentId} with ID ${indexItemRef.id}.`);
      return null;
    } catch (error) {
      console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
      return null;
    }
  });


/**
 * Performs a search against the denormalized search_index collection.
 * @param {any} data The data for the function call, containing the query string.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{results: any[]}>} A promise that resolves with search results.
 */
export const performSearch = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to perform a search.");
    }
    const { query } = data;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "A non-empty search query is required.");
    }

    const searchKeywords = query.toLowerCase().split(' ').filter(k => k);

    try {
        const indexRef = db.collection("search_index");

        // We will perform a simple "OR"-like search by running queries for each keyword
        // and merging the results client-side. This is a limitation of Firestore's querying.
        // For a single keyword, it's more direct.
        const firstKeyword = searchKeywords[0];
        
        // This is a simplified search for demonstration.
        // A real-world app would use a dedicated search service like Algolia or Typesense
        // which would be populated by this same indexing function.
        const titleQuery = indexRef.where("title", ">=", firstKeyword).where("title", "<=", firstKeyword + '\uf8ff').limit(10).get();
        const descriptionQuery = indexRef.where("description", ">=", firstKeyword).where("description", "<=", firstKeyword + '\uf8ff').limit(10).get();
        const tagsQuery = indexRef.where("tags", "array-contains", firstKeyword).limit(10).get();

        const [titleSnapshot, descriptionSnapshot, tagsSnapshot] = await Promise.all([
            titleQuery,
            descriptionQuery,
            tagsQuery
        ]);

        const resultsMap = new Map();
        
        const processSnapshot = (snapshot: FirebaseFirestore.QuerySnapshot) => {
            snapshot.docs.forEach(doc => {
                if (!resultsMap.has(doc.id)) {
                    resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
        };

        processSnapshot(titleSnapshot);
        processSnapshot(descriptionSnapshot);
        processSnapshot(tagsSnapshot);
        
        const results = Array.from(resultsMap.values());
        
        return { results };

    } catch (error) {
        console.error(`Error performing search for query "${query}":`, error);
        throw new functions.https.HttpsError("internal", "Unable to perform search.", error);
    }
});
