import { Request, Response } from 'express';
import { SearchIndex, SearchableCollection } from '../models/search.model';
import { logger } from '../utils/logger';

export class SearchController {
  private generateGeohash(lat: number, lng: number): string {
    // Simple geohash implementation (in production, use a proper geohash library)
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let hash = '';
    let minLat = -90, maxLat = 90;
    let minLng = -180, maxLng = 180;
    let precision = 12;

    for (let i = 0; i < precision; i++) {
      let bit = 0;
      const midLng = (minLng + maxLng) / 2;
      if (lng > midLng) {
        bit = 1;
        minLng = midLng;
      } else {
        maxLng = midLng;
      }

      const midLat = (minLat + maxLat) / 2;
      if (lat > midLat) {
        bit |= 2;
        minLat = midLat;
      } else {
        maxLat = midLat;
      }

      hash += base32[bit];
    }

    return hash;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async performSearch(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        mainKeywords = [],
        identifiedLocation,
        suggestedFilters,
        minPrice,
        maxPrice,
        perUnit,
        lat,
        lng,
        radiusInKm = 50,
        collections = [], // Array of collection names to search in
        limit: queryLimit = 50,
        page = 1,
        sortBy = 'relevance',
        sortOrder = 'desc',
      } = req.body;

      if (!Array.isArray(mainKeywords)) {
        return res.status(400).json({ error: 'mainKeywords must be an array' });
      }

      // Build the base query
      const query: any = { isActive: true };

      // Filter by collections if specified
      if (collections.length > 0) {
        query.itemCollection = { $in: collections };
      }

      // Apply filters
      if (suggestedFilters && Array.isArray(suggestedFilters)) {
        const categoryFilter = suggestedFilters.find((f: any) => f.type === 'category')?.value;
        const listingTypeFilter = suggestedFilters.find((f: any) => f.type === 'listingType')?.value;

        if (listingTypeFilter) {
          query.listingType = listingTypeFilter;
        }

        if (categoryFilter) {
          query.$or = [
            { category: categoryFilter },
            { tags: categoryFilter }
          ];
        }
      }

      // Location-based filtering
      if (identifiedLocation) {
        query['location.address'] = new RegExp(identifiedLocation, 'i');
      }

      // Price filtering
      if (typeof minPrice === 'number' && minPrice > 0) {
        query.price = { ...query.price, $gte: minPrice };
      }

      if (typeof maxPrice === 'number' && maxPrice > 0) {
        query.price = { ...query.price, $lte: maxPrice };
      }

      if (perUnit) {
        query.perUnit = perUnit;
      }

      // Text search
      let searchQuery = query;
      if (mainKeywords.length > 0) {
        const searchTerms = mainKeywords
          .flatMap((k: any) => (k || '').toLowerCase().split(/\s+/))
          .filter(Boolean);

        if (searchTerms.length > 0) {
          searchQuery = {
            ...query,
            $text: {
              $search: searchTerms.join(' '),
              $caseSensitive: false,
              $diacriticSensitive: false
            }
          };
        }
      }

      // Geospatial query
      let geoFilteredIds: string[] = [];
      if (typeof lat === 'number' && typeof lng === 'number') {
        const center: [number, number] = [lat, lng];
        const radiusInM = radiusInKm * 1000;

        // Find documents within the radius
        const geoQuery = {
          ...query,
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radiusInM
            }
          }
        };

        const geoResults = await SearchIndex.find(geoQuery, { _id: 1 });
        geoFilteredIds = geoResults.map(doc => doc._id.toString());

        if (geoFilteredIds.length === 0) {
          return res.json({
            results: [],
            pagination: {
              page: 1,
              limit: queryLimit,
              total: 0,
              pages: 0
            }
          });
        }

        // Add geo filter to main query
        searchQuery = {
          ...searchQuery,
          _id: { $in: geoFilteredIds }
        };
      }

      // Build sort options
      let sortOptions: any = { updatedAt: -1 };

      if (sortBy === 'price' && (minPrice || maxPrice)) {
        sortOptions = { price: sortOrder === 'asc' ? 1 : -1 };
      } else if (sortBy === 'relevance' && mainKeywords.length > 0) {
        // MongoDB text search score
        sortOptions = { score: { $meta: 'textScore' } };
      } else if (sortBy === 'distance' && typeof lat === 'number' && typeof lng === 'number') {
        // For distance sorting, we'll handle this in memory
      }

      // Execute the search
      const skip = (Number(page) - 1) * Number(queryLimit);

      let searchResults;
      let total;

      if (mainKeywords.length > 0 && sortBy === 'relevance') {
        // Use MongoDB text search with score
        searchResults = await SearchIndex
          .find(searchQuery, { score: { $meta: 'textScore' } })
          .sort(sortOptions)
          .skip(skip)
          .limit(Number(queryLimit));

        total = await SearchIndex.countDocuments(searchQuery);
      } else {
        searchResults = await SearchIndex
          .find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(Number(queryLimit));

        total = await SearchIndex.countDocuments(searchQuery);
      }

      // Handle distance sorting in memory if needed
      let results: any[] = searchResults.map(doc => ({
        id: doc._id,
        itemId: doc.itemId,
        itemCollection: doc.itemCollection,
        title: doc.title,
        description: doc.description,
        imageUrl: doc.imageUrl,
        tags: doc.tags,
        location: doc.location,
        price: doc.price,
        currency: doc.currency,
        perUnit: doc.perUnit,
        listingType: doc.listingType,
        primaryRole: doc.primaryRole,
        category: doc.category,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        score: (doc as any).score || 0,
      }));

      // Calculate distance for each result if geo query was used
      if (typeof lat === 'number' && typeof lng === 'number') {
        results = results.map(result => {
          let distance = null;
          if (result.location?.coordinates) {
            const [resultLng, resultLat] = result.location.coordinates;
            distance = this.calculateDistance(lat, lng, resultLat, resultLng);
          }

          return {
            ...result,
            distance,
          };
        });

        // Sort by distance if requested
        if (sortBy === 'distance') {
          results.sort((a: any, b: any) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
          });
        }
      }

      res.json({
        results,
        pagination: {
          page: Number(page),
          limit: Number(queryLimit),
          total,
          pages: Math.ceil(total / Number(queryLimit))
        },
        searchCriteria: {
          keywords: mainKeywords,
          location: identifiedLocation,
          filters: suggestedFilters,
          priceRange: { min: minPrice, max: maxPrice },
          perUnit,
          geo: lat && lng ? { lat, lng, radius: radiusInKm } : null,
          collections,
        }
      });
    } catch (error) {
      logger.error('Error performing search:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }

  async indexDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { collectionId, documentId, documentData } = req.body;

      if (!collectionId || !documentId || !documentData) {
        return res.status(400).json({ error: 'Collection ID, document ID, and document data are required' });
      }

      const INDEXABLE_COLLECTIONS = [
        'marketplaceItems',
        'forums',
        'users',
        'agri_events',
        'knowledge_articles',
        'groups',
        'vti_registry',
        'farms',
        'posts',
      ];

      if (!INDEXABLE_COLLECTIONS.includes(collectionId)) {
        return res.json({ message: 'Collection not indexable' });
      }

      // Build index data
      const title = documentData.name || documentData.title || documentData.displayName || documentData.metadata?.cropType || 'Untitled';
      const description = documentData.description || documentData.profileSummary || documentData.bio || documentData.excerpt_en || `Item ${documentId}`;

      const sourceTags = Array.isArray(documentData.tags) ? documentData.tags : [];
      const tags = [...new Set([
        ...sourceTags,
        documentData.category,
        documentData.listingType,
        documentData.primaryRole,
        documentData.location?.address,
      ].filter(Boolean))];

      const allText = [title, description, ...tags].join(' ').toLowerCase();
      const searchableText = [...new Set(allText.match(/\b(\w+)\b/g) || [])].join(' ');

      const indexData: any = {
        itemId: documentId,
        itemCollection: collectionId,
        title,
        description,
        imageUrl: documentData.imageUrl || documentData.avatarUrl || null,
        tags,
        searchableText,
        location: documentData.location || null,
        primaryRole: documentData.primaryRole || null,
        category: documentData.category || null,
        isActive: true,
      };

      // Add geohash for geospatial queries
      if (documentData.location?.coordinates || (documentData.location?.lat && documentData.location?.lng)) {
        const lat = documentData.location.coordinates ? documentData.location.coordinates[1] : documentData.location.lat;
        const lng = documentData.location.coordinates ? documentData.location.coordinates[0] : documentData.location.lng;

        if (typeof lat === 'number' && typeof lng === 'number') {
          indexData.geohash = this.generateGeohash(lat, lng);
          indexData.location = {
            ...documentData.location,
            coordinates: [lng, lat],
          };
        }
      }

      // Add collection-specific fields
      if (collectionId === 'marketplaceItems') {
        indexData.price = documentData.price || null;
        indexData.currency = documentData.currency || null;
        indexData.perUnit = documentData.perUnit || null;
        indexData.listingType = documentData.listingType || null;
      }

      // Upsert the search index
      await SearchIndex.findOneAndUpdate(
        { itemCollection: collectionId, itemId: documentId },
        indexData,
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: `Document ${collectionId}/${documentId} indexed successfully`
      });
    } catch (error) {
      logger.error('Error indexing document:', error);
      res.status(500).json({ error: 'Failed to index document' });
    }
  }

  async removeFromIndex(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { collectionId, documentId } = req.params;

      if (!collectionId || !documentId) {
        return res.status(400).json({ error: 'Collection ID and document ID are required' });
      }

      await SearchIndex.findOneAndDelete({
        itemCollection: collectionId,
        itemId: documentId,
      });

      res.json({
        success: true,
        message: `Document ${collectionId}/${documentId} removed from search index`
      });
    } catch (error) {
      logger.error('Error removing document from index:', error);
      res.status(500).json({ error: 'Failed to remove document from index' });
    }
  }

  async getSearchStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await SearchIndex.aggregate([
        {
          $group: {
            _id: '$itemCollection',
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalDocuments = await SearchIndex.countDocuments();
      const activeDocuments = await SearchIndex.countDocuments({ isActive: true });

      res.json({
        stats: {
          totalDocuments,
          activeDocuments,
          byCollection: stats,
        }
      });
    } catch (error) {
      logger.error('Error fetching search stats:', error);
      res.status(500).json({ error: 'Failed to fetch search statistics' });
    }
  }
}