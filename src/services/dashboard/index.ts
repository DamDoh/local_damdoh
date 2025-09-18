/**
 * Dashboard Services Index
 * Centralized exports for all dashboard-related microservices
 */

import { FeedService } from './FeedService';
import { NotificationService } from './NotificationService';
import { MarketplaceService } from './MarketplaceService';
import { ApiKeyService } from './ApiKeyService';
import { BuyerService } from './BuyerService';

// Core Services
export { FeedService } from './FeedService';
export type { Post, Comment, FeedFilter } from './FeedService';

export { NotificationService } from './NotificationService';
export type { Notification, NotificationPreferences } from './NotificationService';

export { MarketplaceService } from './MarketplaceService';
export type { MarketplaceListing, MarketplaceTransaction, MarketplaceStats } from './MarketplaceService';

export { ApiKeyService } from './ApiKeyService';
export type { ApiKey, ApiKeyStats } from './ApiKeyService';

export { BuyerService } from './BuyerService';
export type {
  SupplyChainRisk,
  SourcingRecommendation,
  MarketPriceIntelligence,
  BuyerDashboardData
} from './BuyerService';

// Service Factory for easy instantiation
export class DashboardServices {
  private static _feedService: FeedService;
  private static _notificationService: NotificationService;
  private static _marketplaceService: MarketplaceService;
  private static _apiKeyService: ApiKeyService;
  private static _buyerService: BuyerService;

  static get feed(): FeedService {
    if (!this._feedService) {
      this._feedService = FeedService.getInstance();
    }
    return this._feedService;
  }

  static get notifications(): NotificationService {
    if (!this._notificationService) {
      this._notificationService = NotificationService.getInstance();
    }
    return this._notificationService;
  }

  static get marketplace(): MarketplaceService {
    if (!this._marketplaceService) {
      this._marketplaceService = MarketplaceService.getInstance();
    }
    return this._marketplaceService;
  }

  static get apiKeys(): ApiKeyService {
    if (!this._apiKeyService) {
      this._apiKeyService = ApiKeyService.getInstance();
    }
    return this._apiKeyService;
  }

  static get buyer(): BuyerService {
    if (!this._buyerService) {
      this._buyerService = BuyerService.getInstance();
    }
    return this._buyerService;
  }

  // Initialize all services
  static initialize(): void {
    this.feed;
    this.notifications;
    this.marketplace;
    this.apiKeys;
    this.buyer;
  }

  // Cleanup all services
  static cleanup(): void {
    this.feed.clearCache();
    this.notifications.clearCache();
    this.marketplace.clearCache();
    this.apiKeys.clearCache();
    this.buyer.clearCache();
  }
}