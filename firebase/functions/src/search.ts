
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as geofire from "geofire-common";

const db = admin.firestore();

/**
 * Interface for the standardized search index document.
 */
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
  location?: string | null;
  geohash?: string | null;
  // Fields for Marketplace
  price?: number | null;
  currency?: string | null;
  perUnit?: string | null;
  listingType?: "service" | "product" | null;
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
    const title = documentData.name || documentData.title || documentData.displayName || "Untitled";
    const description = documentData.description || documentData.profileSummary || documentData.bio || documentData.excerpt_en || "";

    // Build a comprehensive list of tags for filtering
    const sourceTags = Array.isArray(documentData.tags) ? documentData.tags : [];
    const tags = [...new Set([
      ...sourceTags,
      documentData.category,
      documentData.listingType,
      documentData.primaryRole,
      documentData.location,
    ].filter(Boolean))] as string[];

    // Create a searchable text field by combining all relevant text fields
    const allText = [title, description, ...tags].join(" ").toLowerCase();
    const searchable_terms = [...new Set(allText.match(/(\w+)/g) || [])];

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
    if (documentData.lat && documentData.lng) {
      indexData.geohash = geofire.geohashForLocation([documentData.lat, documentData.lng]);
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
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {
    keywords,
    filters,
    center, // { lat: number, lng: number }
    radiusInM = 50000, // 50km default
    limit = 50,
  } = data;

  let query: admin.firestore.Query = db.collection("search_index");

  // --- Geospatial Filtering (if center provided) ---
  if (center && center.lat && center.lng) {
    const bounds = geofire.geohashQueryBounds([center.lat, center.lng], radiusInM);
    const promises = bounds.map((b) => {
      const q = query.orderBy("geohash").startAt(b[0]).endAt(b[1]);
      return q.get();
    });
    
    // Execute all queries and merge the results
    const snapshots = await Promise.all(promises);
    const matchingDocs = snapshots.flatMap(snap => snap.docs);
    
    // Filter out false positives that are outside the radius
    const results = matchingDocs
        .map(doc => ({ id: doc.id, ...doc.data() as SearchableItem }))
        .filter(item => {
            const lat = item.location?.lat; // Assuming location stores {lat, lng}
            const lng = item.location?.lng;
            if (lat && lng) {
                const distanceInKm = geofire.distanceBetween([lat, lng], [center.lat, center.lng]);
                return distanceInKm * 1000 <= radiusInM;
            }
            return false;
        });

    // NOTE: Further filtering (keywords, etc.) on geo results is done client-side for this example.
    // For production, you'd combine the geo results with further server-side filtering.
    return { results };
  }

  // --- Standard Filter Application ---
  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      if (filter.field && filter.value) {
        // Use 'array-contains' for the 'tags' field, '==' for others.
        const op = filter.field === 'tags' ? 'array-contains' : '==';
        query = query.where(filter.field, op, filter.value);
      }
    }
  }

  // Determine sorting order
  const hasPriceFilter = filters?.some((f:any) => f.field === 'price');
  if (hasPriceFilter) {
      query = query.orderBy('price', 'asc');
  } else {
      query = query.orderBy("updatedAt", "desc");
  }

  query = query.limit(limit);

  try {
    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // --- In-memory Keyword Filtering on the pre-filtered set ---
    if (keywords && typeof keywords === 'string' && keywords.trim() !== '') {
      const searchTerms = keywords.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter(r => {
        const item = r as SearchableItem;
        // Ensure searchable_terms exists and is an array
        if (Array.isArray(item.searchable_terms)) {
            const searchableText = item.searchable_terms.join(' ');
            return searchTerms.every(term => searchableText.includes(term));
        }
        return false;
      });
    }

    return { results };

  } catch (error: any) {
    console.error(`Error during search for query: ${JSON.stringify(data)}`, error);
    if (error.code === 'FAILED_PRECONDITION') {
      throw new functions.https.HttpsError("failed-precondition", "A specific index is required for this query. Check the Firebase console logs for an index creation link.");
    }
    throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching.");
  }
});
