import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getUserDocument } from './module2';

const db = admin.firestore();

export const onSourceDocumentWriteIndex = functions.firestore
    .document('{collectionId}/{documentId}') 
    .onWrite(async (change, context) => {
        const collectionId = context.params.collectionId;
        const documentId = context.params.documentId;
        const newData = change.after.exists ? change.after.data() : null;
        const oldData = change.before.exists ? change.before.data() : null;

        console.log(`Search indexing trigger fired for: ${collectionId}/${documentId}`);

        const indexableCollections = ['master_data_products', 'courses', 'knowledge_articles', 'forums', 'users'];

        if (!indexableCollections.includes(collectionId)) {
            console.log(`Collection ${collectionId} is not configured for search indexing.`);
            return null;
        }

        const indexItemRef = db.collection('search_index').doc(`${collectionId}_${documentId}`);

        if (!newData) {
            console.log(`Document deleted in ${collectionId}/${documentId}. Removing from search index.`);
            await indexItemRef.delete();
            console.log(`Removed ${collectionId}/${documentId} from search index.`);
            return null;
        }

        let titleEn: string = '';
        let titleLocal: { [key: string]: string } = {};
        let descriptionEn: string = '';
        let descriptionLocal: { [key: string]: string } = {};
        let tags: string[] = [];
        let targetRoles: string[] = [];
        let regionTags: string[] = [];
        let boostScore: number = 1;

        console.log(`Extracting data for indexing from ${collectionId}/${documentId} (placeholder)...`);

        switch (collectionId) {
            case 'master_data_products':
                titleEn = newData.name_en || '';
                titleLocal = newData.name_local || {};
                descriptionEn = newData.description_en || '';
                descriptionLocal = newData.description_local || {};
                tags = newData.tags || []; 
                targetRoles = []; 
                regionTags = newData.regionsApplicable || [];
                boostScore = 2;
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
                titleEn = newData.name_en || '';
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
                targetRoles = [newData.primaryRole].filter(role => role);
                regionTags = [newData.country, newData.region].filter(tag => tag);
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
        } catch (error) {
            console.error(`Error indexing document ${collectionId}/${documentId}:`, error);
            return null;
        }
    });

export const performSearch = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to perform a search.');
    }

    const callerUid = context.auth.uid;
    const { query, filters = {}, pagination = { limit: 20, offset: 0 } } = data;

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
         const userDoc = await getUserDocument(callerUid);
         const userData = userDoc?.data();
         const userRole = userData?.primaryRole;
         const userRegion = userData?.region;
         const userLanguage = userData?.preferredLanguage?.split('-')[0] || 'en';

        console.log('Querying search index (placeholder - relies on Firestore limitations)...');
        let queryRef: FirebaseFirestore.Query = db.collection('search_index');

        if (filters.itemCollection && typeof filters.itemCollection === 'string') {
             queryRef = queryRef.where('itemCollection', '==', filters.itemCollection);
        }
         if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
              queryRef = queryRef.where('tags', 'array-contains-any', filters.tags);
         }
          if (userRole) {
               queryRef = queryRef.where('targetRoles', 'array-contains', userRole);
          }
           if (userRegion) {
                queryRef = queryRef.where('regionTags', 'array-contains', userRegion);
           }
        
         queryRef = queryRef.where('title_en', '>=', query)
                           .where('title_en', '<=', query + '\uf8ff');

        queryRef = queryRef.orderBy('title_en').orderBy('createdAt', 'desc');
        queryRef = queryRef.limit(pagination.limit).offset(pagination.offset);

        const searchResultsSnapshot = await queryRef.get();

        const searchResults = searchResultsSnapshot.docs.map(doc => {
            const data = doc.data();
            const title = data.title_local?.[userLanguage] || data.title_en || '';
            const description = data.description_local?.[userLanguage] || data.description_en || '';

            return {
                itemId: data.itemId,
                itemCollection: data.itemCollection,
                title: title,
                description: description,
            };
        });

         console.log(`Found ${searchResults.length} search results for query "${query}".`);

        return { results: searchResults, totalCount: searchResultsSnapshot.size };

    } catch (error) {
        console.error(`Error performing search for user ${callerUid} with query "${query}":`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to perform search.', error);
    }
});
