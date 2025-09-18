/**
 * Crowdfunder Layout Component - Specialized layout for crowdfunding stakeholders
 * Composes crowdfunding-specific widgets and services following microservice pattern
 */

import React from 'react';
import {
  PortfolioManagementWidget,
  ProjectDiscoveryWidget,
  ImpactTrackingWidget,
  ReturnsManagementWidget,
  InvestmentOpportunitiesWidget,
  SustainabilityTrackingWidget
} from '../widgets/CrowdfunderWidgets';
import {
  WeatherWidget,
  MarketIntelligenceWidget,
  NewsEventsWidget,
  CommunityCollaborationWidget,
  AdvancedInsightsWidget,
  SupplyChainWidget,
  TrendingFarmersWidget,
  BusinessOpportunitiesWidget
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

interface CrowdfunderLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
}

export const CrowdfunderLayout: React.FC<CrowdfunderLayoutProps> = ({ config, feedContent }) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="crowdfunder" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Investment Portfolio */}
        <div className="lg:col-span-3 space-y-6">
          <PortfolioManagementWidget />
          <ProjectDiscoveryWidget />
          <ImpactTrackingWidget />
          <ReturnsManagementWidget />
          <InvestmentOpportunitiesWidget />
          <SustainabilityTrackingWidget />
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-6">
          {feedContent}
        </div>

        {/* Right Sidebar - Investment Opportunities & Impact */}
        <div className="lg:col-span-3 space-y-6">
          <BusinessOpportunitiesWidget />
          <CommunityCollaborationWidget />
          <TrendingFarmersWidget />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />
          <TrendingTopics />
          <NewsEventsWidget />
          <HelpSupportWidget />
        </div>
      </div>

      {/* Bottom Row - Additional Crowdfunding Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SeasonalCalendarWidget />
        <MoneyPlanningWidget />
        <BusinessAnalyticsWidget />
        <WeatherWidget />
      </div>
    </div>
  );
};