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
const module2_1 = require("./module2");
const db = admin.firestore();
/**
 * A generic Firestore trigger that listens to writes on specified collections
 * and creates/updates a corresponding document in a dedicated 'search_index' collection.
 * This pattern allows for more flexible querying than Firestore's native capabilities.
 * @param {functions.Change<functions.firestore.DocumentSnapshot>} change The change event.
 * @param {functions.EventContext} context The event context.
 * @return {Promise<null>} A promise that resolves when the function is complete.
 */
exports.onSourceDocumentWriteIndex = functions.firestore
    .document("{collectionId}/{documentId}")
    .onWrite(async (change, context) => {
    const { collectionId, documentId } = context.params;
    const newData = change.after.exists ? change.after.data() : null;
    console.log(`Search indexing trigger fired for: ${collectionId}/${documentId}`);
    const indexableCollections = [
        "master_data_products",
        "courses",
        "knowledge_articles",
        "forums",
        "users",
    ];
    if (!indexableCollections.includes(collectionId)) {
        console.log(`Collection ${collectionId} is not configured for search indexing.`);
        return null;
    }
    const indexItemRef = db
        .collection("search_index")
        .doc(`${collectionId}_${documentId}`);
    if (!newData) {
        console.log(`Document deleted in ${collectionId}/${documentId}. Removing from search index.`);
        await indexItemRef.delete();
        console.log(`Removed ${collectionId}/${documentId} from search index.`);
        return null;
    }
    let titleEn = "";
    const titleLocal = {};
    let descriptionEn = "";
    const descriptionLocal = {};
    let tags = [];
    let targetRoles = [];
    let regionTags = [];
    let boostScore = 1;
    console.log(`Extracting data for indexing from ${collectionId}/${documentId} (placeholder)...`);
    switch (collectionId) {
        case "master_data_products":
            titleEn = newData.name_en || "";
            Object.assign(titleLocal, newData.name_local || {});
            descriptionEn = newData.description_en || "";
            Object.assign(descriptionLocal, newData.description_local || {});
            tags = newData.tags || [];
            regionTags = newData.regionsApplicable || [];
            boostScore = 2;
            break;
        case "courses":
            titleEn = newData.title_en || "";
            Object.assign(titleLocal, newData.title_local || {});
            descriptionEn = newData.description_en || "";
            Object.assign(descriptionLocal, newData.description_local || {});
            tags = newData.tags || [];
            targetRoles = newData.targetRoles || [];
            regionTags = newData.regionsApplicable || [];
            break;
        case "knowledge_articles":
            titleEn = newData.title_en || "";
            Object.assign(titleLocal, newData.title_local || {});
            descriptionEn = newData.content_markdown_en || "";
            Object.assign(descriptionLocal, newData.content_markdown_local || {});
            tags = newData.tags || [];
            targetRoles = newData.targetRoles || [];
            break;
        case "forums":
            titleEn = newData.name_en || "";
            Object.assign(titleLocal, newData.name_local || {});
            descriptionEn = newData.description_en || "";
            Object.assign(descriptionLocal, newData.description_local || {});
            tags = newData.tags || [];
            regionTags = newData.regionTags || [];
            break;
        case "users":
            titleEn = newData.displayName || "";
            descriptionEn = newData.bio_en || "";
            Object.assign(descriptionLocal, newData.bio_local || {});
            tags = newData.expertise || [];
            targetRoles = [newData.primaryRole].filter((role) => role);
            regionTags = [newData.country, newData.region].filter((tag) => tag);
            boostScore = 0.5;
            break;
        default:
            console.warn(`Indexing logic not implemented for collection: ${collectionId}`);
            return null;
    }
    const indexData = {
        itemId: documentId,
        itemCollection: collectionId,
        title_en: titleEn,
        title_local: titleLocal,
        description_en: descriptionEn,
        description_local: descriptionLocal,
        tags: tags,
        targetRoles: targetRoles,
        regionTags: regionTags,
        boostScore: boostScore,
        createdAt: newData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
        await indexItemRef.set(indexData, { merge: true });
        console.log(`Indexed ${collectionId}/${documentId} with ID ${indexItemRef.id}.`);
        return null;
    }
    catch (error) {
        console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
        return null;
    }
});
/**
 * This function will be called from the frontend to perform searches.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{results: any[], totalCount: number}>} A promise that resolves with the search results.
 */
exports.performSearch = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to perform a search.");
    }
    const callerUid = context.auth.uid;
    const { query, filters = {}, pagination = { limit: 20, offset: 0 } } = data;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Search query is required.");
    }
    if (filters !== null && typeof filters !== "object") {
        throw new functions.https.HttpsError("invalid-argument", "Filters must be an object or null.");
    }
    if (pagination !== null &&
        (typeof pagination !== "object" ||
            typeof pagination.limit !== "number" ||
            typeof pagination.offset !== "number" ||
            pagination.limit <= 0 ||
            pagination.offset < 0)) {
        throw new functions.https.HttpsError("invalid-argument", "Pagination must be an object with valid limit and offset.");
    }
    console.log(`Performing search for user ${callerUid} with query: "${query}" and filters: ${JSON.stringify(filters)}`);
    try {
        const userDoc = await (0, module2_1.getUserDocument)(callerUid);
        const userData = userDoc === null || userDoc === void 0 ? void 0 : userDoc.data();
        const userRole = userData === null || userData === void 0 ? void 0 : userData.primaryRole;
        const userRegion = userData === null || userData === void 0 ? void 0 : userData.region;
        const userLanguage = ((_a = userData === null || userData === void 0 ? void 0 : userData.preferredLanguage) === null || _a === void 0 ? void 0 : _a.split("-")[0]) || "en";
        let queryRef = db.collection("search_index");
        if (filters.itemCollection && typeof filters.itemCollection === "string") {
            queryRef = queryRef.where("itemCollection", "==", filters.itemCollection);
        }
        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            queryRef = queryRef.where("tags", "array-contains-any", filters.tags);
        }
        if (userRole) {
            queryRef = queryRef.where("targetRoles", "array-contains", userRole);
        }
        if (userRegion) {
            queryRef = queryRef.where("regionTags", "array-contains", userRegion);
        }
        queryRef = queryRef
            .where("title_en", ">=", query)
            .where("title_en", "<=", query + "\uf8ff");
        queryRef = queryRef.orderBy("title_en").orderBy("createdAt", "desc");
        queryRef = queryRef.limit(pagination.limit).offset(pagination.offset);
        const searchResultsSnapshot = await queryRef.get();
        const searchResults = searchResultsSnapshot.docs.map((doc) => {
            var _a, _b;
            const docData = doc.data();
            const title = ((_a = docData.title_local) === null || _a === void 0 ? void 0 : _a[userLanguage]) || docData.title_en || "";
            const description = ((_b = docData.description_local) === null || _b === void 0 ? void 0 : _b[userLanguage]) || docData.description_en || "";
            return {
                itemId: docData.itemId,
                itemCollection: docData.itemCollection,
                title: title,
                description: description,
            };
        });
        console.log(`Found ${searchResults.length} search results for query "${query}".`);
        return { results: searchResults, totalCount: searchResultsSnapshot.size };
    }
    catch (error) {
        console.error(`Error performing search for user ${callerUid} with query "${query}":`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Unable to perform search.", error);
    }
});
//# sourceMappingURL=search.js.map