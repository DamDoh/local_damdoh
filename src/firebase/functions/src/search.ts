

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { geohashForLocation, geohashQueryBounds, distanceBetween } from "geofire-common";

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};


interface SearchableItem {
  itemId: string;
  itemCollection: string;
  createdAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
  updatedAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
  title: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  searchable_terms: string[];
  // Location and Geohash for geospatial queries
  location?: { address?: string, lat?: number, lng?: number } | null;
  geohash?: string | null;
  // Fields for Marketplace
  price?: number | null;
  currency?: string | null;
  perUnit?: string | null;
  listingType?: "Service" | "Product" | null;
  // Fields for User Profiles
  primaryRole?: string | null;
}

/**
 * A generic Firestore trigger that listens to writes on specified collections
 * and creates/updates a corresponding document in a dedicated 'search_index' collection.
 * This pattern allows for flexible and scalable querying.
 */
export const onSourceDocumentWriteIndex = functions.firestore
  .document("{collectionId}/{documentId}")
  .onWrite(async (change, context) => {
    const { collectionId, documentId } = context.params;
    const documentData = change.after.exists ? change.after.data() : null;

    const INDEXABLE_COLLECTIONS = [
      "marketplaceItems",
      "forums",
      "users",
      "agri_events",
      "knowledge_articles",
      "groups",
      "vti_registry",
    ];

    if (!INDEXABLE_COLLECTIONS.includes(collectionId)) {
      return;
    }

    const indexRef = db.collection("search_index").doc(`${collectionId}_${documentId}`);

    // If the document is deleted, remove it from the search index.
    if (!documentData) {
      await indexRef.delete();
      console.log(`Removed ${collectionId}/${documentId} from search index.`);
      return;
    }

    // Standardize common fields
    const title = documentData.name || documentData.title || documentData.displayName || documentData.metadata?.cropType || "Untitled";
    const description = documentData.description || documentData.profileSummary || documentData.bio || documentData.excerpt_en || `Traceability report for batch ID ${documentId}`;

    // Build a comprehensive list of tags for filtering
    const sourceTags = Array.isArray(documentData.tags) ? documentData.tags : [];
    const tags = [...new Set([
      ...sourceTags,
      documentData.category,
      documentData.listingType,
      documentData.primaryRole,
      documentData.location?.address, // Use address for tags if available
    ].filter(Boolean))] as string[];

    // Create a searchable text field by combining all relevant text fields
    const allText = [title, description, ...tags].join(" ").toLowerCase();
    const searchable_terms = [...new Set(allText.match(/\b(\w+)\b/g) || [])];

    // --- Prepare the base index data ---
    const indexData: SearchableItem = {
      itemId: documentId,
      itemCollection: collectionId,
      createdAt: documentData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      title,
      description,
      imageUrl: documentData.imageUrl || documentData.avatarUrl || null,
      tags,
      searchable_terms,
      location: documentData.location || null,
      primaryRole: documentData.primaryRole || null,
    };
    
    // --- Add Geohash for items with lat/lng ---
    if (documentData.location && typeof documentData.location.lat === 'number' && typeof documentData.location.lng === 'number') {
      indexData.geohash = geohashForLocation([documentData.location.lat, documentData.location.lng]);
    }


    // --- Add collection-specific fields ---
    if (collectionId === "marketplaceItems") {
      indexData.price = documentData.price ?? null;
      indexData.currency = documentData.currency ?? null;
      indexData.perUnit = documentData.perUnit ?? null;
      indexData.listingType = documentData.listingType ?? null;
    }

    try {
      await indexRef.set(indexData, { merge: true });
      console.log(`Indexed ${collectionId}/${documentId} successfully.`);
    } catch (error) {
      console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
    }
  });


/**
 * Performs a search against the denormalized search_index collection.
 * Supports keyword, filter, and geospatial searching.
 */
export const performSearch = functions.https.onCall(async (data, context) => {
  checkAuth(context);

  const {
    mainKeywords = [],
    identifiedLocation,
    suggestedFilters,
    minPrice,
    maxPrice,
    perUnit,
    lat,
    lng,
    radiusInKm = 50, // Default to 50km radius
    limit: queryLimit = 50,
  } = data;

  if (!Array.isArray(mainKeywords)) {
      throw new functions.https.HttpsError("invalid-argument", "mainKeywords must be an array.");
  }
  
  let query: admin.firestore.Query | null = db.collection("search_index");
  let isGeoQuery = false;

  // --- Geospatial Querying ---
  if (typeof lat === 'number' && typeof lng === 'number') {
    isGeoQuery = true;
    const center: [number, number] = [lat, lng];
    const radiusInM = radiusInKm * 1000;
    const bounds = geohashQueryBounds(center, radiusInM);
    
    const geohashPromises = bounds.map(b => {
      const q = db.collection("search_index").orderBy('geohash').startAt(b[0]).endAt(b[1]);
      return q.get();
    });

    try {
      const snapshots = await Promise.all(geohashPromises);
      const matchingDocs: admin.firestore.QueryDocumentSnapshot[] = [];
      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const docLocation = doc.data().location;
          if (docLocation?.lat && docLocation?.lng) {
            const distanceInKm = distanceBetween([docLocation.lat, docLocation.lng], center);
            if (distanceInKm * 1000 <= radiusInM) { // Convert km to m for comparison
              matchingDocs.push(doc);
            }
          }
        }
      }
      
      const ids = matchingDocs.map(d => d.id);
      if (ids.length === 0) {
        query = null; // Set query to null to indicate no results, skipping further queries
      } else {
        // Firestore 'in' query is limited to 30 items. We must handle this.
        if (ids.length > 30) {
          // For simplicity, we'll just take the first 30. A more robust solution might paginate.
          query = db.collection('search_index').where(admin.firestore.FieldPath.documentId(), 'in', ids.slice(0, 30));
        } else {
          query = db.collection('search_index').where(admin.firestore.FieldPath.documentId(), 'in', ids);
        }
      }
      
    } catch(e) {
       console.error("Geospatial query failed", e);
       // Continue without geo-filtering
       isGeoQuery = false; // Revert flag
       query = db.collection("search_index"); // Reset query
    }
  }


  try {
    // If the query is null after a failed geo-search, return empty array immediately.
    if (query === null) {
      return [];
    }
    
    // --- Standard Filter Application (only if not a geo-query) ---
    if (!isGeoQuery) {
      const categoryFilter = suggestedFilters?.find((f: any) => f.type === 'category')?.value;
      const listingTypeFilter = suggestedFilters?.find((f: any) => f.type === 'listingType')?.value;
      
      if (listingTypeFilter) {
          query = query.where('listingType', '==', listingTypeFilter);
      }
      if (categoryFilter) {
          query = query.where('tags', 'array-contains', categoryFilter);
      }
      if (identifiedLocation) {
          query = query.where("location.address", ">=", identifiedLocation);
          query = query.where("location.address", "<=", identifiedLocation + '\uf8ff');
      }
      if (perUnit) {
          query = query.where("perUnit", "==", perUnit);
      }

      let hasPriceFilter = false;
      if (typeof minPrice === 'number' && minPrice > 0) {
          query = query.where('price', '>=', minPrice);
          hasPriceFilter = true;
      }
      if (typeof maxPrice === 'number' && maxPrice > 0) {
          query = query.where('price', '<=', maxPrice);
          hasPriceFilter = true;
      }

      // Determine sorting order
      if (hasPriceFilter) {
          query = query.orderBy('price', 'asc');
      } else {
          query = query.orderBy("updatedAt", "desc");
      }
    }

    query = query.limit(queryLimit);

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // --- In-memory Keyword Filtering on the pre-filtered set ---
    const searchTerms = mainKeywords.flatMap((k: any) => (k || '').toLowerCase().split(/\s+/)).filter(Boolean);

    if (searchTerms.length > 0) {
      results = results.filter(r => {
        const item = r as SearchableItem;
        if (Array.isArray(item.searchable_terms)) {
            const searchableText = item.searchable_terms.join(' ');
            return searchTerms.some(term => searchableText.includes(term));
        }
        return false;
      });
    }
    
    return results;

  } catch (error: any) {
    console.error(`Error during search for query: ${JSON.stringify(data)}`, error);
    if (error.code === 'FAILED_PRECONDITION' || (error.message && error.message.includes('inequality filter'))) {
      throw new functions.https.HttpsError("failed-precondition", "This query is too complex and requires a specific index. Try a simpler search.");
    }
    throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching.");
  }
});
