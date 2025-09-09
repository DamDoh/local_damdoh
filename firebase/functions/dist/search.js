"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSearch = exports.onSourceDocumentWriteIndex = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const geofire_common_1 = require("geofire-common");
const db = admin.firestore();
const checkAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return context.auth.uid;
};
/**
 * A generic Firestore trigger that listens to writes on specified collections
 * and creates/updates a corresponding document in a dedicated 'search_index' collection.
 * This pattern allows for flexible and scalable querying.
 */
exports.onSourceDocumentWriteIndex = functions.firestore
    .document("{collectionId}/{documentId}")
    .onWrite(async (change, context) => {
    var _a, _b, _c, _d, _e, _f;
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
    const title = documentData.name || documentData.title || documentData.displayName || ((_a = documentData.metadata) === null || _a === void 0 ? void 0 : _a.cropType) || "Untitled";
    const description = documentData.description || documentData.profileSummary || documentData.bio || documentData.excerpt_en || `Traceability report for batch ID ${documentId}`;
    // Build a comprehensive list of tags for filtering
    const sourceTags = Array.isArray(documentData.tags) ? documentData.tags : [];
    const tags = [...new Set([
            ...sourceTags,
            documentData.category,
            documentData.listingType,
            documentData.primaryRole,
            (_b = documentData.location) === null || _b === void 0 ? void 0 : _b.address,
        ].filter(Boolean))];
    // Create a searchable text field by combining all relevant text fields
    const allText = [title, description, ...tags].join(" ").toLowerCase();
    const searchable_terms = [...new Set(allText.match(/\b(\w+)\b/g) || [])];
    // --- Prepare the base index data ---
    const indexData = {
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
        indexData.geohash = (0, geofire_common_1.geohashForLocation)([documentData.location.lat, documentData.location.lng]);
    }
    // --- Add collection-specific fields ---
    if (collectionId === "marketplaceItems") {
        indexData.price = (_c = documentData.price) !== null && _c !== void 0 ? _c : null;
        indexData.currency = (_d = documentData.currency) !== null && _d !== void 0 ? _d : null;
        indexData.perUnit = (_e = documentData.perUnit) !== null && _e !== void 0 ? _e : null;
        indexData.listingType = (_f = documentData.listingType) !== null && _f !== void 0 ? _f : null;
    }
    try {
        await indexRef.set(indexData, { merge: true });
        console.log(`Indexed ${collectionId}/${documentId} successfully.`);
    }
    catch (error) {
        console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
    }
});
/**
 * Performs a search against the denormalized search_index collection.
 * Supports keyword, filter, and geospatial searching.
 */
exports.performSearch = functions.https.onCall(async (data, context) => {
    var _a, _b;
    checkAuth(context);
    const { mainKeywords = [], identifiedLocation, suggestedFilters, minPrice, maxPrice, perUnit, lat, lng, radiusInKm = 50, // Default to 50km radius
    limit: queryLimit = 50, } = data;
    if (!Array.isArray(mainKeywords)) {
        throw new functions.https.HttpsError("invalid-argument", "mainKeywords must be an array.");
    }
    let query = db.collection("search_index");
    // --- Geospatial Querying ---
    if (typeof lat === 'number' && typeof lng === 'number') {
        const center = [lat, lng];
        const radiusInM = radiusInKm * 1000;
        const bounds = (0, geofire_common_1.geohashQueryBounds)(center, radiusInM);
        const geohashPromises = bounds.map(b => {
            const q = query.orderBy('geohash').startAt(b[0]).endAt(b[1]);
            return q.get();
        });
        try {
            const snapshots = await Promise.all(geohashPromises);
            const matchingDocs = [];
            for (const snap of snapshots) {
                for (const doc of snap.docs) {
                    const docLocation = doc.data().location;
                    if ((docLocation === null || docLocation === void 0 ? void 0 : docLocation.lat) && (docLocation === null || docLocation === void 0 ? void 0 : docLocation.lng)) {
                        const distanceInKm = (0, geofire_common_1.distanceBetween)([docLocation.lat, docLocation.lng], center);
                        if (distanceInKm * 1000 <= radiusInM) { // Convert km to m for comparison
                            matchingDocs.push(doc);
                        }
                    }
                }
            }
            const ids = matchingDocs.map(d => d.id);
            if (ids.length === 0)
                return []; // No results found nearby
            // Since we can't combine 'in' with other range filters, this becomes the primary filter.
            // Other filters will have to be applied in-memory if a geo-query is active.
            query = db.collection('search_index').where(admin.firestore.FieldPath.documentId(), 'in', ids);
        }
        catch (e) {
            console.error("Geospatial query failed", e);
            // Continue without geo-filtering
        }
    }
    try {
        // --- Standard Filter Application (only if not a geo-query) ---
        if (!(typeof lat === 'number' && typeof lng === 'number')) {
            const categoryFilter = (_a = suggestedFilters === null || suggestedFilters === void 0 ? void 0 : suggestedFilters.find((f) => f.type === 'category')) === null || _a === void 0 ? void 0 : _a.value;
            const listingTypeFilter = (_b = suggestedFilters === null || suggestedFilters === void 0 ? void 0 : suggestedFilters.find((f) => f.type === 'listingType')) === null || _b === void 0 ? void 0 : _b.value;
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
            }
            else {
                query = query.orderBy("updatedAt", "desc");
            }
        }
        query = query.limit(queryLimit);
        const snapshot = await query.get();
        let results = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // --- In-memory Keyword Filtering on the pre-filtered set ---
        const searchTerms = mainKeywords.flatMap((k) => (k || '').toLowerCase().split(/\s+/)).filter(Boolean);
        if (searchTerms.length > 0) {
            results = results.filter(r => {
                const item = r;
                if (Array.isArray(item.searchable_terms)) {
                    const searchableText = item.searchable_terms.join(' ');
                    return searchTerms.some(term => searchableText.includes(term));
                }
                return false;
            });
        }
        return results;
    }
    catch (error) {
        console.error(`Error during search for query: ${JSON.stringify(data)}`, error);
        if (error.code === 'FAILED_PRECONDITION') {
            throw new functions.https.HttpsError("failed-precondition", "A specific index is required for this query. Check the Firebase console logs for an index creation link.");
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while searching.");
    }
});
//# sourceMappingURL=search.js.map