import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getUserDocument } from './module2';

const db = admin.firestore();

// This function is a generic Firestore trigger that will listen to writes
// on specified collections and create/update a corresponding document in a
// dedicated 'search_index' collection. This pattern allows for more flexible
// querying than Firestore's native capabilities.
// For a production app at scale, a dedicated search service like Algolia or Meilisearch is recommended.
export const onSourceDocumentWriteIndex = functions.firestore
    .document('{collectionId}/{documentId}') 
    .onWrite(async (change, context) => {
        const collectionId = context.params.collectionId;
        const documentId = context.params.documentId;
        const newData = change.after.exists ? change.after.data() : null;
        const oldData = change.before.exists ? change.before.data() : null;

        console.log(`Search indexing trigger fired for: ${collectionId}/${documentId}`);

        // Define which collections should be indexed.
        const indexableCollections = ['master_data_products', 'courses', 'knowledge_articles', 'forums', 'users'];

        if (!indexableCollections.includes(collectionId)) {
            console.log(`Collection ${collectionId} is not configured for search indexing.`);
            return null;
        }

        const indexItemRef = db.collection('search_index').doc(`${collectionId}_${documentId}`);

        // Handle document deletion
        if (!newData) {
            console.log(`Document deleted in ${collectionId}/${documentId}. Removing from search index.`);
            await indexItemRef.delete();
            console.log(`Removed ${collectionId}/${documentId} from search index.`);
            return null;
        }

        // --- Data Extraction Logic ---
        // This part is crucial and needs to be adapted for each collection's schema.
        let titleEn: string = '';
        let titleLocal: { [key: string]: string } = {};
        let descriptionEn: string = '';
        let descriptionLocal: { [key: string]: string } = {};
        let tags: string[] = [];
        let targetRoles: string[] = [];
        let regionTags: string[] = [];
        let boostScore: number = 1; // Default score

        console.log(`Extracting data for indexing from ${collectionId}/${documentId} (placeholder)...`);

        // Switch case to handle different document structures
        switch (collectionId) {
            case 'master_data_products':
                titleEn = newData.name_en || '';
                titleLocal = newData.name_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; 
                targetRoles = []; 
                regionTags = newData.regionsApplicable || [];
                boostScore = 2; // Products are important
                break;
            case 'courses':
                titleEn = newData.title_en || '';
                titleLocal = newData.title_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; 
                targetRoles = newData.targetRoles || [];
                regionTags = newData.regionsApplicable || [];
                break;
            case 'knowledge_articles':
                titleEn = newData.title_en || '';
                titleLocal = newData.title_local || {};
                descriptionEn = newData.content_markdown_en || '';
                descriptionLocal = newData.content_markdown_local || {};
                tags = newData.tags || [];
                targetRoles = newData.targetRoles || [];
                regionTags = []; 
                break;
            case 'forums':
                titleEn = newData.name_en || ''; // Assuming forum topics have name_en
                titleLocal = newData.name_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; 
                targetRoles = []; 
                regionTags = newData.regionTags || [];
                break;
            case 'users':
                titleEn = newData.displayName || '';
                descriptionEn = newData.bio_en || ''; 
                descriptionLocal = newData.bio_local || {};
                tags = newData.expertise || []; 
                targetRoles = [newData.primaryRole].filter(role => role); // Ensure role exists before adding
                regionTags = [newData.country, newData.region].filter(tag => tag);
                 boostScore = 0.5; // People are less important than products in general search
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
        } catch (error) {
            console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
            return null;
        }
    });

// This function will be called from the frontend to perform searches.
// It queries the aggregated 'search_index' collection.
export const performSearch = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to perform a search.');
    }

    const callerUid = context.auth.uid;
    const { query, filters = {}, pagination = { limit: 20, offset: 0 } } = data;

    // --- Input Validation ---
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
         // --- User-specific Context ---
         const userDoc = await getUserDocument(callerUid);
         const userData = userDoc?.data();
         const userRole = userData?.primaryRole;
         const userRegion = userData?.region;
         const userLanguage = userData?.preferredLanguage?.split('-')[0] || 'en';

        // --- Firestore Query Building ---
        // Note: Firestore's querying capabilities for text search are limited.
        // This implements a basic "prefix" search. For full-text search,
        // a dedicated service like Algolia or Meilisearch is recommended.
        console.log('Querying search index (placeholder - relies on Firestore limitations)...');
        let queryRef: FirebaseFirestore.Query = db.collection('search_index');

        // Apply filters
        if (filters.itemCollection && typeof filters.itemCollection === 'string') {
             queryRef = queryRef.where('itemCollection', '==', filters.itemCollection);
        }
         if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
              // Note: 'array-contains-any' is limited to 10 values.
              queryRef = queryRef.where('tags', 'array-contains-any', filters.tags);
         }
          // Personalize results based on user's role and region if available
          if (userRole) {
               // This query might require a composite index in Firestore
               queryRef = queryRef.where('targetRoles', 'array-contains', userRole);
          }
           if (userRegion) {
                // This query might require a composite index in Firestore
                queryRef = queryRef.where('regionTags', 'array-contains', userRegion);
           }
        
        // Basic prefix search implementation
         queryRef = queryRef.where('title_en', '>=', query)
                           .where('title_en', '<=', query + '\uf8ff');

        // Order and paginate
        queryRef = queryRef.orderBy('title_en').orderBy('createdAt', 'desc');
        queryRef = queryRef.limit(pagination.limit).offset(pagination.offset);

        const searchResultsSnapshot = await queryRef.get();

        // Format results for the frontend
        const searchResults = searchResultsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Select title based on user's preferred language, fallback to English
            const title = data.title_local?.[userLanguage] || data.title_en || '';
            const description = data.description_local?.[userLanguage] || data.description_en || '';

            return {
                itemId: data.itemId,
                itemCollection: data.itemCollection,
                title: title,
                description: description, // Sending a snippet would be better for performance
            };
        });

         console.log(`Found ${searchResults.length} search results for query "${query}".`);

        // In a real implementation, you might want to return the total count for pagination purposes,
        // which requires a separate count query.
        return { results: searchResults, totalCount: searchResultsSnapshot.size };

    } catch (error) {
        console.error(`Error performing search for user ${callerUid} with query "${query}":`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to perform search.', error);
    }
});
