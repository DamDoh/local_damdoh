import express from 'express';
import { SearchController } from '../controllers/search.controller';
import { SearchIndex } from '../models/search.model';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const searchController = new SearchController();

/**
 * @swagger
 * /api/search:
 *   post:
 *     tags: [Search]
 *     summary: Perform search across indexed content
 *     description: Search for content across marketplace items, users, posts, events, and other indexed collections
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mainKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of keywords to search for
 *               identifiedLocation:
 *                 type: string
 *                 description: Location-based search term
 *               suggestedFilters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [category, listingType]
 *                     value:
 *                       type: string
 *               minPrice:
 *                 type: number
 *                 description: Minimum price filter
 *               maxPrice:
 *                 type: number
 *                 description: Maximum price filter
 *               perUnit:
 *                 type: string
 *                 description: Unit filter for pricing
 *               lat:
 *                 type: number
 *                 description: Latitude for geospatial search
 *               lng:
 *                 type: number
 *                 description: Longitude for geospatial search
 *               radiusInKm:
 *                 type: number
 *                 default: 50
 *                 description: Search radius in kilometers
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [marketplaceItems, forums, users, agri_events, knowledge_articles, groups, vti_registry, farms, posts]
 *                 description: Collections to search in
 *               limit:
 *                 type: integer
 *                 default: 50
 *                 description: Maximum number of results
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number
 *               sortBy:
 *                 type: string
 *                 enum: [relevance, price, distance, date]
 *                 default: relevance
 *                 description: Sort criteria
 *               sortOrder:
 *                 type: string
 *                 enum: [asc, desc]
 *                 default: desc
 *                 description: Sort order
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       itemId:
 *                         type: string
 *                       itemCollection:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       location:
 *                         type: object
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       perUnit:
 *                         type: string
 *                       listingType:
 *                         type: string
 *                       primaryRole:
 *                         type: string
 *                       category:
 *                         type: string
 *                       distance:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       score:
 *                         type: number
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 searchCriteria:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth(), searchController.performSearch);

/**
 * @swagger
 * /api/search/index:
 *   post:
 *     tags: [Search]
 *     summary: Index a document for search
 *     description: Add or update a document in the search index
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectionId
 *               - documentId
 *               - documentData
 *             properties:
 *               collectionId:
 *                 type: string
 *                 enum: [marketplaceItems, forums, users, agri_events, knowledge_articles, groups, vti_registry, farms, posts]
 *               documentId:
 *                 type: string
 *               documentData:
 *                 type: object
 *                 description: The document data to index
 *     responses:
 *       200:
 *         description: Document indexed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/index', requireAuth(), searchController.indexDocument);

/**
 * @swagger
 * /api/search/index/{collectionId}/{documentId}:
 *   delete:
 *     tags: [Search]
 *     summary: Remove document from search index
 *     description: Remove a document from the search index
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document removed from index successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found in index
 */
router.delete('/index/:collectionId/:documentId', requireAuth(), searchController.removeFromIndex);

/**
 * @swagger
 * /api/search/stats:
 *   get:
 *     tags: [Search]
 *     summary: Get search index statistics
 *     description: Get statistics about the search index
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalDocuments:
 *                       type: integer
 *                     activeDocuments:
 *                       type: integer
 *                     byCollection:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           active:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', requireAuth(), searchController.getSearchStats);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     tags: [Search]
 *     summary: Get search suggestions
 *     description: Get autocomplete suggestions based on partial search terms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial search term
 *       - in: query
 *         name: collection
 *         schema:
 *           type: string
 *           enum: [marketplaceItems, forums, users, agri_events, knowledge_articles, groups, vti_registry, farms, posts]
 *         description: Limit suggestions to specific collection
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of suggestions
 *     responses:
 *       200:
 *         description: Search suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                       type:
 *                         type: string
 *                       count:
 *                         type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/suggestions', requireAuth(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { q, collection, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query: any = {
      isActive: true,
      $text: {
        $search: q,
        $caseSensitive: false,
        $diacriticSensitive: false
      }
    };

    if (collection) {
      query.itemCollection = collection;
    }

    // Get suggestions based on tags and titles
    const suggestions = await SearchIndex.aggregate([
      { $match: query },
      {
        $project: {
          tags: 1,
          title: 1,
          itemCollection: 1,
          score: { $meta: 'textScore' }
        }
      },
      { $unwind: '$tags' },
      {
        $match: {
          tags: { $regex: q, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          type: { $first: '$itemCollection' },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $sort: { count: -1, avgScore: -1 }
      },
      {
        $limit: Number(limit)
      }
    ]);

    res.json({
      suggestions: suggestions.map((s: any) => ({
        text: s._id,
        type: s.type,
        count: s.count
      }))
    });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

export default router;