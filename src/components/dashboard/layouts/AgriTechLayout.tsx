/**
 * AgriTech Layout Component - Specialized layout for agritech innovator stakeholders
 * Composes agritech-specific widgets and services following microservice pattern
 */

import React from 'react';
import {
  ResearchDevelopmentWidget,
  SolutionManagementWidget,
  PilotProgramWidget,
  FundingGrantsWidget,
  PartnershipsWidget,
  InnovationAnalyticsWidget
} from '../widgets/AgriTechWidgets';
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

interface AgriTechLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
}

export const AgriTechLayout: React.FC<AgriTechLayoutProps> = ({ config, feedContent }) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="agritech" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Research & Innovation */}
        <div className="lg:col-span-3 space-y-6">
          <ResearchDevelopmentWidget />
          <SolutionManagementWidget />
          <PilotProgramWidget />
          <FundingGrantsWidget />
          <PartnershipsWidget />
          <InnovationAnalyticsWidget />
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-6">
          {feedContent}
        </div>

        {/* Right Sidebar - Research & Innovation */}
        <div className="lg:col-span-3 space-y-6">
          <AdvancedInsightsWidget />
          <CommunityCollaborationWidget />
          <BusinessOpportunitiesWidget />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />
          <TrendingTopics />
          <NewsEventsWidget />
          <HelpSupportWidget />
        </div>
      </div>

      {/* Bottom Row - Additional AgriTech Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SeasonalCalendarWidget />
        <MoneyPlanningWidget />
        <BusinessAnalyticsWidget />
        <WeatherWidget />
      </div>
    </div>
  );
};