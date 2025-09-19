/**
 * Credit Scorecard Layout Component - Specialized layout for credit scoring services
 * Composes credit scoring widgets and services following microservice pattern
 */

import React from 'react';
import {
  RiskAssessmentWidget,
  CreditScoringWidget,
  ClientPortfolioWidget,
  DefaultPredictionWidget,
  ComplianceMonitoringWidget,
  PerformanceAnalyticsWidget
} from '../widgets/CreditScorecardWidgets';
import {
  WeatherWidget,
  MarketIntelligenceWidget,
  NewsEventsWidget,
  CommunityCollaborationWidget,
  AdvancedInsightsWidget,
  SupplyChainWidget,
  TrendingFarmersWidget
} from '../widgets/FarmerWidgets';
import {
  DailyOperationsWidget,
  FarmResourcesWidget,
  EmergencyAlertsWidget,
  QuickStatsWidget,
  ConnectivityWidget,
  FarmerFeedbackWidget,
  SeasonalCalendarWidget,
  MoneyPlanningWidget,
  BusinessAnalyticsWidget,
  HelpSupportWidget
} from '../widgets';
import { PersonalizedRecommendations } from '../widgets/PersonalizedRecommendations';
import { TrendingTopics } from '../widgets/TrendingTopics';
import { ConnectionSuggestions } from '../widgets/ConnectionSuggestions';
import { AchievementBadges } from '../widgets/AchievementBadges';
import { StoriesWidget } from '../widgets/StoriesWidget';

interface CreditScorecardLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
}

export const CreditScorecardLayout: React.FC<CreditScorecardLayoutProps> = ({ config, feedContent }) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="creditscorecard" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Credit Scoring Operations */}
        <div className="lg:col-span-3 space-y-6">
          <RiskAssessmentWidget />
          <CreditScoringWidget />
          <ClientPortfolioWidget />
          <DefaultPredictionWidget />
          <ComplianceMonitoringWidget />
          <PerformanceAnalyticsWidget />
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-6">
          {feedContent}
        </div>

        {/* Right Sidebar - Risk Analytics & Scoring */}
        <div className="lg:col-span-3 space-y-6">
          <PersonalizedRecommendations />
          <TrendingTopics />
          <ConnectionSuggestions />
          <HelpSupportWidget />
          <NewsEventsWidget />
          <MarketIntelligenceWidget />
          <CommunityCollaborationWidget />
          <AdvancedInsightsWidget />
          <SupplyChainWidget />
          <TrendingFarmersWidget />
        </div>
      </div>

      {/* Bottom Row - Additional Credit Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SeasonalCalendarWidget />
        <MoneyPlanningWidget />
        <BusinessAnalyticsWidget />
        <WeatherWidget />
      </div>
    </div>
  );
};