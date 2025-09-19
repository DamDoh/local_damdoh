/**
 * ApiKeyService - Microservice for API key management
 * Handles API key generation, revocation, and management for AgriTech innovators
 * Follows singleton pattern for shared state management
 */

import { apiCall } from '@/lib/api-utils';

export interface ApiKey {
  id: string;
  description: string;
  keyPrefix: string;
  key?: string;
  status: 'Active' | 'Revoked';
  environment: 'Sandbox' | 'Production';
  createdAt?: string;
  lastUsed?: string;
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  sandboxKeys: number;
  productionKeys: number;
}

export class ApiKeyService {
  private static instance: ApiKeyService;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  /**
   * Fetch all API keys for the current user
   */
  async fetchApiKeys(): Promise<ApiKey[]> {
    const cacheKey = 'api-keys';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiCall<any>('/api-keys');
      const keys = response.keys || response.data || [];
      this.setCached(cacheKey, keys);
      return keys;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  /**
   * Generate a new API key
   */
  async generateApiKey(description: string, environment: 'Sandbox' | 'Production'): Promise<ApiKey> {
    try {
      const response = await apiCall<any>('/api-keys/generate', {
        method: 'POST',
        body: JSON.stringify({ description, environment }),
      });

      // Clear cache to force refresh
      this.clearCache();

      return response.key || response.data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    try {
      await apiCall(`/api-keys/${keyId}/revoke`, {
        method: 'POST',
      });

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  /**
   * Get API key statistics
   */
  async getApiKeyStats(): Promise<ApiKeyStats> {
    const keys = await this.fetchApiKeys();

    return {
      totalKeys: keys.length,
      activeKeys: keys.filter(key => key.status === 'Active').length,
      sandboxKeys: keys.filter(key => key.environment === 'Sandbox').length,
      productionKeys: keys.filter(key => key.environment === 'Production').length,
    };
  }

  /**
   * Validate API key format
   */
  validateApiKeyFormat(key: string): boolean {
    // Basic validation - should be improved based on actual key format
    return key.length >= 20 && /^[A-Za-z0-9_-]+$/.test(key);
  }

  /**
   * Get cached data if still valid
   */
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Clean up expired cache
    if (cached) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }

    return null;
  }

  /**
   * Set cached data with expiry
   */
  private setCached(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}