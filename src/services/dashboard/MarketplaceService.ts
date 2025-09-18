/**
 * Marketplace Service - Microservice for managing marketplace data and operations
 * Handles product listings, transactions, and marketplace analytics
 */

import { apiCall } from '@/lib/api-utils';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  location: string;
  quantity: number;
  unit: string;
  quality: 'premium' | 'standard' | 'basic';
  organic: boolean;
  available: boolean;
  createdAt: Date;
  expiresAt?: Date;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalTransactions: number;
  totalVolume: number;
  averagePrice: number;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: Array<{
    type: 'listing' | 'sale' | 'inquiry';
    title: string;
    timestamp: Date;
  }>;
}

export class MarketplaceService {
  private static instance: MarketplaceService;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  static getInstance(): MarketplaceService {
    if (!MarketplaceService.instance) {
      MarketplaceService.instance = new MarketplaceService();
    }
    return MarketplaceService.instance;
  }

  /**
   * Fetch marketplace listings
   */
  async fetchListings(filters?: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    organic?: boolean;
    quality?: string;
    limit?: number;
  }): Promise<MarketplaceListing[]> {
    const cacheKey = this.generateListingsCacheKey(filters);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await apiCall<{ listings: any[] }>(`/marketplace/listings?${queryParams}`);
      const listings: MarketplaceListing[] = response.listings.map(this.transformListing);

      // Cache the data
      this.cache.set(cacheKey, { data: listings, timestamp: Date.now() });

      return listings;
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      // Return cached data if available
      return cached?.data || [];
    }
  }

  /**
   * Get marketplace statistics
   */
  async getStats(): Promise<MarketplaceStats> {
    const cacheKey = 'marketplace_stats';

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await apiCall<MarketplaceStats>('/marketplace/stats');
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      // Return cached data or default stats
      return cached?.data || {
        totalListings: 0,
        activeListings: 0,
        totalTransactions: 0,
        totalVolume: 0,
        averagePrice: 0,
        topCategories: [],
        recentActivity: []
      };
    }
  }

  /**
   * Create a new marketplace listing
   */
  async createListing(listingData: {
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: File[];
    location: string;
    quantity: number;
    unit: string;
    quality: 'premium' | 'standard' | 'basic';
    organic: boolean;
    tags: string[];
  }): Promise<MarketplaceListing> {
    try {
      const formData = new FormData();

      // Add text fields
      Object.entries(listingData).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, String(value));
        }
      });

      // Add images
      listingData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await apiCall<{ listing: any }>('/marketplace/listings', {
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type for FormData
        }
      });

      // Invalidate cache
      this.invalidateListingsCache();

      return this.transformListing(response.listing);
    } catch (error) {
      console.error('Error creating marketplace listing:', error);
      throw error;
    }
  }

  /**
   * Update a marketplace listing
   */
  async updateListing(listingId: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    try {
      const response = await apiCall<{ listing: any }>(`/marketplace/listings/${listingId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Update cache optimistically
      this.updateListingInCache(listingId, () => this.transformListing(response.listing));

      return this.transformListing(response.listing);
    } catch (error) {
      console.error('Error updating marketplace listing:', error);
      throw error;
    }
  }

  /**
   * Delete a marketplace listing
   */
  async deleteListing(listingId: string): Promise<void> {
    try {
      await apiCall(`/marketplace/listings/${listingId}`, {
        method: 'DELETE'
      });

      // Remove from cache
      this.removeListingFromCache(listingId);
    } catch (error) {
      console.error('Error deleting marketplace listing:', error);
      throw error;
    }
  }

  /**
   * Get user's marketplace listings
   */
  async getUserListings(userId?: string): Promise<MarketplaceListing[]> {
    try {
      const endpoint = userId ? `/marketplace/user/${userId}/listings` : '/marketplace/my-listings';
      const response = await apiCall<{ listings: any[] }>(endpoint);
      return response.listings.map(this.transformListing);
    } catch (error) {
      console.error('Error fetching user marketplace listings:', error);
      return [];
    }
  }

  /**
   * Search marketplace listings
   */
  async searchListings(query: string, filters?: Partial<{
    category: string;
    location: string;
    minPrice: number;
    maxPrice: number;
  }>): Promise<MarketplaceListing[]> {
    try {
      const searchParams = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const response = await apiCall<{ listings: any[] }>(`/marketplace/search?${searchParams}`);
      return response.listings.map(this.transformListing);
    } catch (error) {
      console.error('Error searching marketplace listings:', error);
      return [];
    }
  }

  /**
   * Get marketplace categories
   */
  async getCategories(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const response = await apiCall<{ categories: Array<{ id: string; name: string; count: number }> }>('/marketplace/categories');
      return response.categories;
    } catch (error) {
      console.error('Error fetching marketplace categories:', error);
      // Return default categories
      return [
        { id: 'crops', name: 'Crops', count: 0 },
        { id: 'livestock', name: 'Livestock', count: 0 },
        { id: 'equipment', name: 'Equipment', count: 0 },
        { id: 'inputs', name: 'Inputs', count: 0 },
        { id: 'services', name: 'Services', count: 0 }
      ];
    }
  }

  /**
   * Transform raw listing data
   */
  private transformListing(raw: any): MarketplaceListing {
    return {
      id: raw.id || raw._id,
      title: raw.title,
      description: raw.description,
      price: Number(raw.price),
      currency: raw.currency || 'KES',
      category: raw.category,
      images: Array.isArray(raw.images) ? raw.images : [],
      seller: {
        id: raw.seller?.id || raw.sellerId,
        name: raw.seller?.name || 'Unknown Seller',
        avatar: raw.seller?.avatar || '/avatars/default.jpg',
        rating: Number(raw.seller?.rating || 0),
        verified: Boolean(raw.seller?.verified)
      },
      location: raw.location,
      quantity: Number(raw.quantity),
      unit: raw.unit,
      quality: raw.quality || 'standard',
      organic: Boolean(raw.organic),
      available: Boolean(raw.available !== false),
      createdAt: new Date(raw.createdAt || raw.created_at),
      expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      metadata: raw.metadata || {}
    };
  }

  /**
   * Generate cache key for listings
   */
  private generateListingsCacheKey(filters?: any): string {
    if (!filters) return 'listings_all';

    const keyParts = ['listings'];
    if (filters.category) keyParts.push(`cat_${filters.category}`);
    if (filters.location) keyParts.push(`loc_${filters.location}`);
    if (filters.minPrice) keyParts.push(`min_${filters.minPrice}`);
    if (filters.maxPrice) keyParts.push(`max_${filters.maxPrice}`);
    if (filters.organic !== undefined) keyParts.push(`org_${filters.organic}`);
    if (filters.quality) keyParts.push(`qual_${filters.quality}`);
    if (filters.limit) keyParts.push(`limit_${filters.limit}`);

    return keyParts.join('_');
  }

  /**
   * Update listing in cache
   */
  private updateListingInCache(listingId: string, updater: (listing: MarketplaceListing) => MarketplaceListing): void {
    for (const [key, cached] of this.cache.entries()) {
      if (key.startsWith('listings_')) {
        const updatedData = cached.data.map((listing: MarketplaceListing) =>
          listing.id === listingId ? updater(listing) : listing
        );
        this.cache.set(key, { ...cached, data: updatedData });
      }
    }
  }

  /**
   * Remove listing from cache
   */
  private removeListingFromCache(listingId: string): void {
    for (const [key, cached] of this.cache.entries()) {
      if (key.startsWith('listings_')) {
        const filteredData = cached.data.filter((listing: MarketplaceListing) => listing.id !== listingId);
        this.cache.set(key, { ...cached, data: filteredData });
      }
    }
  }

  /**
   * Invalidate listings cache
   */
  private invalidateListingsCache(): void {
    for (const [key] of this.cache.entries()) {
      if (key.startsWith('listings_')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}