import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
      "agri_events",
      "knowledge_articles",
    ];

    if (!indexableCollections.includes(collectionId)) {
      return null;
    }

    const indexItemRef = db
      .collection("search_index")
      .doc(`${collectionId}_${documentId}`);

    if (!newData) {
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
      title: newData.name || newData.title || newData.displayName || "Untitled",
      description: newData.description || newData.profileSummary || newData.bio || newData.excerpt_en || "",
      imageUrl: newData.imageUrl || newData.photoURL || null,
    };

    switch (collectionId) {
    case "marketplaceItems":
      indexData.tags = [newData.category, newData.listingType, ...(newData.skillsRequired || [])];
      indexData.location = newData.location;
      break;
    case "forums":
      indexData.tags = newData.regionTags || [];
      break;
    case "users":
       indexData.tags = [newData.primaryRole, ...(newData.areasOfInterest || [])];
       indexData.location = newData.location;
      break;
    case "agri_events":
       indexData.tags = [newData.eventType, ...(newData.tags || [])];
       indexData.location = newData.location;
       break;
    case "knowledge_articles":
        indexData.tags = [newData.category, ...(newData.tags || [])];
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
 * This version is enhanced to use the output of the query-interpreter AI flow.
 * @param {any} data The data for the function call, containing the AI's interpretation.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{results: any[]}>} A promise that resolves with search results.
 */
export const performSearch = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to perform a search.");
    }
    const { mainKeywords, identifiedLocation } = data;
    
    if (!mainKeywords || mainKeywords.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "At least one keyword is required.");
    }

    try {
        let query: admin.firestore.Query = db.collection("search_index");

        // Simple text search: For now, we search for the first keyword in title or description.
        // A more advanced implementation would use a dedicated search service like Algolia or Typesense
        // that allows for full-text search across multiple fields.
        const firstKeyword = mainKeywords[0].toLowerCase();
        
        // Firestore doesn't support case-insensitive searches or full-text search on its own.
        // This is a limitation. A real-world, scalable solution would use a third-party search service.
        // The query below is a placeholder for what would be a more complex search.
        // For demonstration, we'll just return items where the 'title' starts with the keyword.
        query = query.where("title", ">=", firstKeyword).where("title", "<=", firstKeyword + '\uf8ff');
        
        if (identifiedLocation) {
            // This is also a simplification. A real app would use geospatial queries or better location indexing.
            // query = query.where("location", "==", identifiedLocation);
        }

        const snapshot = await query.limit(20).get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { results };

    } catch (error) {
        console.error(`Error performing search for query "${mainKeywords.join(' ')}":`, error);
        throw new functions.https.HttpsError("internal", "Unable to perform search.", error);
    }
});
