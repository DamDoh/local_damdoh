/**
 * Dashboard Services Index
 * Centralized exports for all dashboard-related microservices
 */

import { FeedService } from './FeedService';
import { NotificationService } from './NotificationService';
import { MarketplaceService } from './MarketplaceService';
import { ApiKeyService } from './ApiKeyService';
import { BuyerService } from './BuyerService';
import { MeetingService } from './MeetingService';
import { DashboardConfigService } from './DashboardConfigService';
import { GamificationService } from './GamificationService';
import { CommunicationTemplatesService } from './CommunicationTemplatesService';
import { PredictiveAnalyticsService } from './PredictiveAnalyticsService';
import { CollaborationService } from './CollaborationService';
import { MobileExperienceService } from './MobileExperienceService';
import { SustainabilityService } from './SustainabilityService';

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

export { MeetingService } from './MeetingService';
export type { MeetingDetails, MeetingLink } from './MeetingService';

export { DashboardConfigService } from './DashboardConfigService';
export type { WidgetConfig, DashboardLayout, WidgetDefinition } from './DashboardConfigService';

export { GamificationService } from './GamificationService';
export type {
  Achievement, AchievementRequirement, AchievementReward,
  Challenge, ChallengeRequirement, ChallengeReward,
  UserGamificationProfile, UserTitle, GamificationStats,
  LeaderboardEntry
} from './GamificationService';

export { CommunicationTemplatesService } from './CommunicationTemplatesService';
export type {
  CommunicationTemplate, TemplateVariable, TemplateAttachment,
  CommunicationInstance, NegotiationFlow, NegotiationStep,
  ContractTemplate, ContractSection, QualityInspectionWorkflow, InspectionCheckpoint
} from './CommunicationTemplatesService';

export { PredictiveAnalyticsService } from './PredictiveAnalyticsService';
export type {
  RevenueForecast, ForecastDataPoint, ForecastFactor,
  RiskAssessment, RiskRecommendation, MarketIntelligence,
  MarketDriver, MarketNews, CompetitorData,
  AutomatedInsight, PredictiveModel
} from './PredictiveAnalyticsService';

export { CollaborationService } from './CollaborationService';
export type {
  Project, ProjectMember, ProjectPermission,
  Task, TaskAttachment, TaskComment,
  Workflow, WorkflowStage, WorkflowTransition, WorkflowCondition, WorkflowAction,
  Document, DocumentVersion, DocumentPermission,
  TimeEntry, ProjectReport
} from './CollaborationService';

export { MobileExperienceService } from './MobileExperienceService';
export type {
  OfflineData, FieldOperation, FieldOperationData,
  QualityMetrics, InputApplication, FieldObservation, FieldIssue,
  WeatherData, WeatherForecast, VoiceCommand,
  MobileWorkflow, MobileWorkflowStep, PushNotification, OfflineQueue
} from './MobileExperienceService';

export { SustainabilityService } from './SustainabilityService';
export type {
  CarbonFootprint, EmissionBreakdown, CarbonBenchmark, EmissionReduction,
  SustainabilityInitiative, ESGMetrics, EnvironmentalMetrics, SocialMetrics,
  GovernanceMetrics, OverallESGScore, SustainabilityGoal, SustainabilityTarget,
  GoalProgress, GoalMilestone, ImpactReport, ImpactReportData,
  ImpactBenchmark, ImpactRecommendation
} from './SustainabilityService';

// Service Factory for easy instantiation
export class DashboardServices {
  private static _feedService: FeedService;
  private static _notificationService: NotificationService;
  private static _marketplaceService: MarketplaceService;
  private static _apiKeyService: ApiKeyService;
  private static _buyerService: BuyerService;
  private static _meetingService: MeetingService;
  private static _dashboardConfigService: DashboardConfigService;
  private static _gamificationService: GamificationService;
  private static _communicationTemplatesService: CommunicationTemplatesService;
  private static _predictiveAnalyticsService: PredictiveAnalyticsService;
  private static _collaborationService: CollaborationService;
  private static _mobileExperienceService: MobileExperienceService;
  private static _sustainabilityService: SustainabilityService;

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

  static get meetings(): MeetingService {
    if (!this._meetingService) {
      this._meetingService = MeetingService.getInstance();
    }
    return this._meetingService;
  }

  static get dashboardConfig(): DashboardConfigService {
    if (!this._dashboardConfigService) {
      this._dashboardConfigService = DashboardConfigService.getInstance();
    }
    return this._dashboardConfigService;
  }

  static get gamification(): GamificationService {
    if (!this._gamificationService) {
      this._gamificationService = GamificationService.getInstance();
    }
    return this._gamificationService;
  }

  static get communicationTemplates(): CommunicationTemplatesService {
    if (!this._communicationTemplatesService) {
      this._communicationTemplatesService = CommunicationTemplatesService.getInstance();
    }
    return this._communicationTemplatesService;
  }

  static get predictiveAnalytics(): PredictiveAnalyticsService {
    if (!this._predictiveAnalyticsService) {
      this._predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();
    }
    return this._predictiveAnalyticsService;
  }

  static get collaboration(): CollaborationService {
    if (!this._collaborationService) {
      this._collaborationService = CollaborationService.getInstance();
    }
    return this._collaborationService;
  }

  static get mobileExperience(): MobileExperienceService {
    if (!this._mobileExperienceService) {
      this._mobileExperienceService = MobileExperienceService.getInstance();
    }
    return this._mobileExperienceService;
  }

  static get sustainability(): SustainabilityService {
    if (!this._sustainabilityService) {
      this._sustainabilityService = SustainabilityService.getInstance();
    }
    return this._sustainabilityService;
  }

  // Initialize all services
  static initialize(): void {
    this.feed;
    this.notifications;
    this.marketplace;
    this.apiKeys;
    this.buyer;
    this.meetings;
    this.dashboardConfig;
    this.gamification;
    this.communicationTemplates;
    this.predictiveAnalytics;
    this.collaboration;
    this.mobileExperience;
    this.sustainability;
  }

  // Cleanup all services
  static cleanup(): void {
    this.feed.clearCache();
    this.notifications.clearCache();
    this.marketplace.clearCache();
    this.apiKeys.clearCache();
    this.buyer.clearCache();
    // Meeting, dashboard config, gamification, communication, predictive, collaboration, mobile, and sustainability services don't have cache to clear
  }
}