/**
 * Researcher Layout Component - Specialized layout for research institutions
 * Composes research-specific widgets and services following microservice pattern
 */

import React from 'react';

// Core widgets available to all stakeholders
import { StoriesWidget } from '../widgets/StoriesWidget';
import { AchievementBadges } from '../widgets/AchievementBadges';
import { TrendingTopics } from '../widgets/TrendingTopics';
import { ConnectionSuggestions } from '../widgets/ConnectionSuggestions';
import { PersonalizedRecommendations } from '../widgets/PersonalizedRecommendations';
import { HelpSupportWidget } from '../widgets';

// Farmer-specific widgets
import {
  WeatherWidget,
  MarketIntelligenceWidget,
  NewsEventsWidget,
  CommunityCollaborationWidget,
  AdvancedInsightsWidget,
  SupplyChainWidget,
  TrendingFarmersWidget
} from '../widgets/FarmerWidgets';

// Common operational widgets
import {
  DailyOperationsWidget,
  FarmResourcesWidget,
  EmergencyAlertsWidget,
  QuickStatsWidget,
  ConnectivityWidget,
  FarmerFeedbackWidget,
  SeasonalCalendarWidget,
  MoneyPlanningWidget,
  BusinessAnalyticsWidget
} from '../widgets';

interface ResearcherLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
}

export const ResearcherLayout: React.FC<ResearcherLayoutProps> = ({ config, feedContent }) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="Researcher" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Research Operations */}
        <div className="lg:col-span-3 space-y-6">
          <DailyOperationsWidget />
          <FarmResourcesWidget />
          <EmergencyAlertsWidget />
          <QuickStatsWidget />
          <ConnectivityWidget />
          <FarmerFeedbackWidget />
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-6">
          {feedContent}
        </div>

        {/* Right Sidebar - Academic Network & Publications */}
        <div className="lg:col-span-3 space-y-6">
          {/* Core widgets for all stakeholders */}
          <NewsEventsWidget />
          <TrendingTopics />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />

          {/* Stakeholder-specific widgets */}
          <MarketIntelligenceWidget />
          <CommunityCollaborationWidget />
          <AdvancedInsightsWidget />
          <SupplyChainWidget />
          <TrendingFarmersWidget />
          <HelpSupportWidget />
        </div>
      </div>

    </div>
  );
};