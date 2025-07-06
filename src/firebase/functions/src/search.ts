

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
    const title = newData.name || newData.title || newData.displayName || "Untitled";
    const description = newData.description || newData.profileSummary || newData.bio || newData.excerpt_en || "";
    
    // Create an array of searchable terms by combining and cleaning various fields.
    const sourceTags = Array.isArray(newData.tags) ? newData.tags : [];
    const tags = [
        ...sourceTags,
        newData.category,
        newData.listingType,
        newData.primaryRole,
        newData.location
    ].filter(Boolean); // Filter out any null/undefined values

    const allText = [title, description, ...tags].join(' ').toLowerCase();
    const searchable_terms = [...new Set(allText.match(/\b(\w+)\b/g) || [])]; // Extract unique words


    const indexData: any = {
      itemId: documentId,
      itemCollection: collectionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: newData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      title: title,
      description: description,
      imageUrl: newData.imageUrl || newData.photoURL || null,
      tags: tags,
      searchable_terms: searchable_terms,
      location: newData.location || null,
    };
    
    // Add specific fields for marketplace items to allow for richer filtering
    if (collectionId === 'marketplaceItems') {
        indexData.price = newData.price ?? null;
        indexData.currency = newData.currency ?? null;
        indexData.perUnit = newData.perUnit ?? null;
        indexData.listingType = newData.listingType ?? null; 
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
    const { mainKeywords, identifiedLocation, suggestedFilters, minPrice, maxPrice, perUnit } = data;
    
    if (!Array.isArray(mainKeywords)) {
        throw new functions.https.HttpsError("invalid-argument", "mainKeywords must be an array.");
    }

    try {
        let query: admin.firestore.Query = db.collection("search_index");
        
        // --- Keyword Filtering ---
        const validKeywords = mainKeywords.filter((k): k is string => typeof k === 'string' && k.trim() !== '');
        const searchTerms = validKeywords.flatMap(k => k.toLowerCase().split(/\s+/)).slice(0, 10);
        const hasKeywords = searchTerms.length > 0;

        if (hasKeywords) {
            query = query.where("searchable_terms", "array-contains-any", searchTerms);
        }
        
        // --- Tag-based Filtering ---
        const categoryFilter = suggestedFilters?.find((f: any) => f.type === 'category');
        // Firestore limitation: Cannot have `array-contains-any` and another `array-contains` in the same query.
        // So, if keywords are present, we filter category in memory.
        if (categoryFilter?.value && !hasKeywords) {
            query = query.where('tags', 'array-contains', categoryFilter.value);
        }
        
        const listingTypeFilter = suggestedFilters?.find((f: any) => f.type === 'listingType');
         if (listingTypeFilter?.value) {
            query = query.where('listingType', '==', listingTypeFilter.value);
        }

        // --- Location Filtering ---
        if (identifiedLocation) {
            query = query.where("location", "==", identifiedLocation);
        }

        // --- Unit Filtering ---
        if (perUnit) {
            query = query.where("perUnit", "==", perUnit);
        }
        
        // --- Price Filtering Logic ---
        // Firestore limitation: Cannot have `array-contains-any` and a range filter (`<`, `>`, etc.) on different fields.
        // So, if keywords are present, we filter price in memory. Otherwise, we can do it in the query.
        if (!hasKeywords) {
            let hasInequalityFilter = false;
            if (typeof minPrice === 'number') {
                query = query.where('price', '>=', minPrice);
                hasInequalityFilter = true;
            }
            if (typeof maxPrice === 'number') {
                query = query.where('price', '<=', maxPrice);
                hasInequalityFilter = true;
            }

            if (hasInequalityFilter) {
                query = query.orderBy('price', 'asc');
            } else {
                query = query.orderBy("updatedAt", "desc");
            }
        } else {
             // If we have keywords, we can't order by price due to the Firestore limitation.
             // We will sort by relevance (default) or another field like updatedAt.
             query = query.orderBy("updatedAt", "desc");
        }


        const snapshot = await query.limit(50).get();
        
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // --- In-Memory Filtering for when keywords are present ---
        if (hasKeywords) {
            // Filter by category
            if (categoryFilter?.value) {
                results = results.filter(r => r.tags && Array.isArray(r.tags) && r.tags.includes(categoryFilter.value));
            }
            // Filter by price
            if (typeof minPrice === 'number') {
                results = results.filter(r => r.price != null && r.price >= minPrice);
            }
            if (typeof maxPrice === 'number') {
                results = results.filter(r => r.price != null && r.price <= maxPrice);
            }
        }
        
        // Limit the final results to be sent to the client
        const finalResults = results.slice(0, 20);

        return { results: finalResults };

    } catch (error) {
        console.error(`Error performing search for query "${mainKeywords.join(' ')}":`, error);
        throw new functions.https.HttpsError("internal", "Unable to perform search.", error);
    }
});
