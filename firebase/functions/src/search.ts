import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getUserDocument } from './module2';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';

const db = admin.firestore();

// Import necessary functions/types from module2 (for user data and context)
// import { getUserDocument } from './module2';


// --- Cross-Cutting Search System ---

// This file contains backend components for indexing data and performing searches across the app.


// Conceptual Data Model for the 'search_index' Collection:
// This collection serves as a simplified index of searchable content from other modules.
// For robust full-text search, multilingual search, and advanced relevance ranking
// across a large dataset, a dedicated search service like Algolia or Elasticsearch is
// strongly recommended over a pure Firestore-based index due to Firestore's limitations
// with full-text search capabilities and performance at scale.

// interface SearchIndexItem {
//     itemId: string; // The ID of the original document (e.g., productId, courseId, forumId)
//     itemCollection: string; // The name of the original collection (e.g., 'master_data_products', 'courses', 'forums')
//     title_en: string; // Searchable title in English
//     title_local: { [key: string]: string }; // Localized searchable titles
//     description_en: string; // Searchable description or relevant text in English
//     description_local: { [key: string]: string }; // Localized searchable descriptions
//     tags: string[]; // Relevant tags for filtering/boosting
//     targetRoles: string[]; // Roles for which this item is relevant
//     regionTags: string[]; // Regions where this item is relevant
//     boostScore?: number; // Optional score to manually boost relevance
//     createdAt: admin.firestore.FieldValue; // Timestamp of creation
//     updatedAt: admin.firestore.FieldValue | null; // Timestamp of last index update
//     // Add other relevant metadata for display in search results (e.g., thumbnailUrl)
// }


// Placeholder triggered function for indexing new or updated documents in source collections.
// This function should be triggered by onCreate and onUpdate events in relevant collections
// (e.g., master_data_products, courses, knowledge_articles, forums, users - for public profile data).
// A similar onDelete trigger would be needed to remove the item from the index.
// NOTE: You will need to configure specific triggers for each relevant collection in your Firebase project.
export const onSourceDocumentWriteIndex = functions.firestore
    .document('{collectionId}/{documentId}') // Generic trigger, refine to specific collections/paths
    .onWrite(async (change, context) => {
        const collectionId = context.params.collectionId;
        const documentId = context.params.documentId;
        const newData = change.after.exists ? change.after.data() : null;
        const oldData = change.before.exists ? change.before.data() : null;

        console.log(`Search indexing trigger fired for: ${collectionId}/${documentId}`);

        // Define which collections should be indexed
        const indexableCollections = ['master_data_products', 'courses', 'knowledge_articles', 'forums', 'users'];

        if (!indexableCollections.includes(collectionId)) {
            console.log(`Collection ${collectionId} is not configured for search indexing.`);
            return null;
        }

        const indexItemRef = db.collection('search_index').doc(`${collectionId}_${documentId}`); // Use a composite ID for the index item

        // Handle deletion
        if (!newData) {
            console.log(`Document deleted in ${collectionId}/${documentId}. Removing from search index.`);
            if (oldData) {
                 await indexItemRef.delete();
                 console.log(`Removed ${collectionId}/${documentId} from search index.`);
            }
             return null;
        }

        // Extract searchable data based on collection type
        let titleEn: string = '';
        let titleLocal: { [key: string]: string } = {};
        let descriptionEn: string = '';
        let descriptionLocal: { [key: string]: string } = {};
        let tags: string[] = [];
        let targetRoles: string[] = [];
        let regionTags: string[] = [];
        let boostScore: number = 1; // Default boost score

        console.log(`Extracting data for indexing from ${collectionId}/${documentId} (placeholder)...`);

        switch (collectionId) {
            case 'master_data_products':
                titleEn = newData.name_en || '';
                titleLocal = newData.name_local || {};
                descriptionEn = newData.description_en || ''; // Assuming description field
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; // Assuming tags field
                targetRoles = []; // Products generally relevant to many roles
                regionTags = newData.regionsApplicable || []; // Assuming region tags
                boostScore = 2; // Products might have higher relevance
                break;
            case 'courses':
                titleEn = newData.title_en || '';
                titleLocal = newData.title_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; // Assuming tags field
                targetRoles = newData.targetRoles || [];
                regionTags = newData.regionsApplicable || [];
                break;
            case 'knowledge_articles':
                titleEn = newData.title_en || '';
                titleLocal = newData.title_local || {};
                descriptionEn = newData.content_markdown_en || ''; // Indexing content
                descriptionLocal = newData.content_markdown_local || {};
                tags = newData.tags || [];
                targetRoles = newData.targetRoles || [];
                regionTags = []; // Articles can be globally relevant or tagged differently
                break;
            case 'forums':
                titleEn = newData.name_en || '';
                titleLocal = newData.name_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; // Assuming tags field
                targetRoles = []; // Forums generally open
                regionTags = newData.regionTags || [];
                break;
            case 'users':
                // Indexing public user profile data
                titleEn = newData.displayName || ''; // Using display name as title
                // titleLocal might be derived from displayName if localization is available
                descriptionEn = newData.bio_en || ''; // Assuming a bio field
                descriptionLocal = newData.bio_local || {};
                tags = newData.expertise || []; // Assuming expertise as tags
                targetRoles = [newData.primaryRole].filter(role => role); // Index by primary role
                regionTags = [newData.country, newData.region].filter(tag => tag); // Index by location
                // TODO: Add logic to only index users based on privacy settings
                 boostScore = 0.5; // Users might have lower default relevance than content/products
                break;
            default:
                console.warn(`Indexing logic not implemented for collection: ${collectionId}`);
                return null; // Should not happen if check passes, but good practice
        }


        // Prepare data for the search index document
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
            // Add other relevant metadata from newData if needed
            createdAt: newData.createdAt || admin.firestore.FieldValue.serverTimestamp(), // Preserve original creation time if available
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };


        try {
            // Create or update the document in the search_index collection
            await indexItemRef.set(indexData, { merge: true }); // Use merge to preserve existing fields if necessary
            console.log(`Indexed ${collectionId}/${documentId} with ID ${indexItemRef.id}.`);

            return null; // Indicate successful completion

        } catch (error) {
            console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
            // TODO: Implement error handling: log the error, potentially retry or alert admin.
            return null;
        }
    });


// Callable function for authenticated users to perform a search
export const performSearch = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to perform a search.');
    }

    const callerUid = context.auth.uid;
    const { query, filters = {}, pagination = { limit: 20, offset: 0 } } = data;

    // Basic validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
         throw new functions.https.HttpsError('invalid-argument', 'Search query is required.');
    }
     if (filters !== null && typeof filters !== 'object') {
          throw new functions.https.HttpsError('invalid-argument', 'Filters must be an object or null.');
     }
     if (pagination !== null && typeof pagination !== 'object' || typeof pagination.limit !== 'number' || typeof pagination.offset !== 'number' || pagination.limit <= 0 || pagination.offset < 0) {
           throw new functions.https.HttpsError('invalid-argument', 'Pagination must be an object with valid limit and offset.');
     }


    console.log(`Performing search for user ${callerUid} with query: "${query}" and filters: ${JSON.stringify(filters)}`);

    try {
        // TODO: 1. Fetch user context for personalized search results (Module 2).
        // This can be used for boosting results relevant to the user's role, location, and language.
         const userDoc = await getUserDocument(callerUid);
         const userData = userDoc?.data();
         const userRole = userData?.primaryRole;
         const userRegion = userData?.region;
         const userLanguage = userData?.preferredLanguage?.split('-')[0] || 'en'; // Get base language


        // TODO: 2. Perform Search using the search_index collection.
        // IMPORTANT: Firestore's query capabilities for full-text search are limited.
        // A simple Firestore query on title_en or description_en will only find exact matches or prefixes.
        // For true full-text search with relevance ranking, stemming, fuzzy matching, and multilingual support,
        // you would integrate with a dedicated search service like Algolia or Elasticsearch.

        console.log('Querying search index (placeholder - relies on Firestore limitations)...');

        let queryRef: FirebaseFirestore.Query = db.collection('search_index');

        // Apply filters
        if (filters.itemCollection && typeof filters.itemCollection === 'string') {
             queryRef = queryRef.where('itemCollection', '==', filters.itemCollection);
        }
         if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
              queryRef = queryRef.where('tags', 'array-contains-any', filters.tags);
         }
         // TODO: Add filters for targetRoles, regionTags based on user context or filter input.
         // Example: Filter by targetRoles including the user's role
          if (userRole) {
               queryRef = queryRef.where('targetRoles', 'array-contains', userRole);
          }
          // Example: Filter by regionTags including the user's region
           if (userRegion) {
                queryRef = queryRef.where('regionTags', 'array-contains', userRegion);
           }


        // --- Placeholder for Full-Text Search ---
        // This is where the core search matching would happen.
        // With a dedicated service:
        // - Send the query string and filters to Algolia/Elasticsearch.
        // - The service performs the search and returns ranked results.
        // With Firestore (limited):
        // - You might perform prefix matches or rely on external tools to pre-process text.
        // - For better relevance, you might need complex queries or combine results from multiple queries.
        console.log(`Performing text match for query "${query}" (placeholder for full-text search engine)...`);

        // --- Example of a very basic and limited Firestore text search (prefix match) ---
        // This will only match items where the title starts with the query string.
        // Replace with integration to a real search engine for production.
         queryRef = queryRef.where('title_en', '>=', query)
                           .where('title_en', '<=', query + '\uf8ff'); // Unicode point after all possible characters

        // TODO: Implement relevance boosting based on user context and item boostScore.
        // Sorting by a score calculated from text relevance, filters match, and boostScore.
        // This is complex with Firestore. Dedicated search services handle this naturally.


        // Apply ordering (simple example, true relevance ordering is complex with Firestore)
        queryRef = queryRef.orderBy('title_en').orderBy('createdAt', 'desc'); // Example ordering

        // Apply pagination
        queryRef = queryRef.limit(pagination.limit).offset(pagination.offset);


        const searchResultsSnapshot = await queryRef.get();


        // 3. Format and return the results.
        const searchResults = searchResultsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Select the appropriate localized title and description based on user language
            const title = data.title_local?.[userLanguage] || data.title_en || '';
            const description = data.description_local?.[userLanguage] || data.description_en || '';

            return {
                itemId: data.itemId,
                itemCollection: data.itemCollection,
                title: title,
                description: description, // Might need truncation or snippet generation
                // Add other relevant metadata for display
            };
        });

         console.log(`Found ${searchResults.length} search results for query "${query}".`);


        return { results: searchResults, totalCount: searchResultsSnapshot.size }; // Note: totalCount with offset/limit is tricky with Firestore without a separate count query

    } catch (error) {
        console.error(`Error performing search for user ${callerUid} with query "${query}":`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to perform search.', error);
    }
});
