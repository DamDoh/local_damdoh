/**
 * BuyerService - Microservice for buyer operations
 * Handles supply chain risk assessment, sourcing recommendations, and market intelligence
 * Follows singleton pattern for shared state management
 */

import { apiCall } from '@/lib/api-utils';

export interface SupplyChainRisk {
  level: string;
  factor: string;
  region: string;
  action: {
    link: string;
    text: string;
  };
}

export interface SourcingRecommendation {
  id: string;
  name: string;
  product: string;
  reliability: number;
  vtiVerified: boolean;
}

export interface MarketPriceIntelligence {
  product: string;
  trend: 'up' | 'down' | 'stable';
  forecast: string;
  action: {
    link: string;
    text: string;
  };
}

export interface BuyerDashboardData {
  supplyChainRisk: SupplyChainRisk;
  sourcingRecommendations: SourcingRecommendation[];
  marketPriceIntelligence: MarketPriceIntelligence;
}

export class BuyerService {
  private static instance: BuyerService;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes (market data changes frequently)

  private constructor() {}

  static getInstance(): BuyerService {
    if (!BuyerService.instance) {
      BuyerService.instance = new BuyerService();
    }
    return BuyerService.instance;
  }

  /**
   * Fetch buyer dashboard data
   */
  async fetchBuyerDashboard(): Promise<BuyerDashboardData> {
    const cacheKey = 'buyer-dashboard';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiCall<any>('/dashboard/buyer');
      const data = response.data || response;
      this.setCached(cacheKey, data);
      return data as BuyerDashboardData;
    } catch (error) {
      console.error('Error fetching buyer dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get supply chain risk assessment
   */
  async getSupplyChainRisk(): Promise<SupplyChainRisk> {
    const dashboard = await this.fetchBuyerDashboard();
    return dashboard.supplyChainRisk;
  }

  /**
   * Get sourcing recommendations
   */
  async getSourcingRecommendations(): Promise<SourcingRecommendation[]> {
    const dashboard = await this.fetchBuyerDashboard();
    return dashboard.sourcingRecommendations || [];
  }

  /**
   * Get market price intelligence
   */
  async getMarketPriceIntelligence(): Promise<MarketPriceIntelligence> {
    const dashboard = await this.fetchBuyerDashboard();
    return dashboard.marketPriceIntelligence;
  }

  /**
   * Search for suppliers
   */
  async searchSuppliers(query: string, filters?: {
    product?: string;
    region?: string;
    minReliability?: number;
    vtiVerified?: boolean;
  }): Promise<SourcingRecommendation[]> {
    try {
      const response = await apiCall<any>('/suppliers/search', {
        method: 'POST',
        body: JSON.stringify({ query, filters }),
      });

      return response.suppliers || response.data || [];
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get market price trends for specific products
   */
  async getMarketTrends(products: string[]): Promise<MarketPriceIntelligence[]> {
    try {
      const response = await apiCall<any>('/market/trends', {
        method: 'POST',
        body: JSON.stringify({ products }),
      });

      return response.trends || response.data || [];
    } catch (error) {
      console.error('Error fetching market trends:', error);
      throw error;
    }
  }

  /**
   * Assess supplier reliability
   */
  async assessSupplierReliability(supplierId: string): Promise<{
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    try {
      const response = await apiCall<any>(`/suppliers/${supplierId}/assess`);
      return response.assessment || response.data;
    } catch (error) {
      console.error('Error assessing supplier reliability:', error);
      throw error;
    }
  }

  /**
   * Get risk mitigation strategies
   */
  async getRiskMitigationStrategies(riskLevel: string): Promise<{
    strategies: Array<{
      id: string;
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
    }>;
  }> {
    try {
      const response = await apiCall<any>('/risk-mitigation/strategies', {
        method: 'POST',
        body: JSON.stringify({ riskLevel }),
      });

      return response.strategies || response.data;
    } catch (error) {
      console.error('Error fetching risk mitigation strategies:', error);
      throw error;
    }
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