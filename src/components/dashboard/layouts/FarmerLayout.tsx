/**
 * Farmer Layout Component - Specialized layout for farmer stakeholders
 * Composes farmer-specific widgets and services following microservice pattern
 */

import React from 'react';
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
import { DraggableWidget } from '../DraggableWidget';

interface FarmerLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
  customWidgets?: any[]; // From customization hook
  isEditMode?: boolean;
  onToggleWidgetVisibility?: (widgetId: string) => void;
}

export const FarmerLayout: React.FC<FarmerLayoutProps> = ({
  config,
  feedContent,
  customWidgets = [],
  isEditMode = false,
  onToggleWidgetVisibility
}) => {
  // Helper function to render widgets dynamically
  const renderWidget = (widgetConfig: any) => {
    // Map widget component names to actual components
    const widgetComponents: Record<string, React.ComponentType<any>> = {
      StoriesWidget,
      WeatherWidget,
      DailyOperationsWidget,
      FarmResourcesWidget,
      EmergencyAlertsWidget,
      QuickStatsWidget,
      ConnectivityWidget,
      FarmerFeedbackWidget,
      SeasonalCalendarWidget,
      MoneyPlanningWidget,
      BusinessAnalyticsWidget,
      HelpSupportWidget,
      MarketIntelligenceWidget,
      CommunityCollaborationWidget,
      AdvancedInsightsWidget,
      SupplyChainWidget,
      TrendingFarmersWidget,
      BusinessOpportunitiesWidget,
      NewsEventsWidget,
      PersonalizedRecommendations,
      TrendingTopics,
      ConnectionSuggestions,
      AchievementBadges
    }

    const WidgetComponent = widgetComponents[widgetConfig.component]
    if (!WidgetComponent) {
      console.warn(`Widget component ${widgetConfig.component} not found`)
      return null
    }

    const widgetContent = <WidgetComponent />

    if (isEditMode) {
      return (
        <DraggableWidget
          key={widgetConfig.id}
          widget={widgetConfig}
          isEditMode={isEditMode}
          onToggleVisibility={onToggleWidgetVisibility || (() => {})}
        >
          {widgetContent}
        </DraggableWidget>
      )
    }

    return (
      <div key={widgetConfig.id} className={!widgetConfig.visible ? 'hidden' : ''}>
        {widgetContent}
      </div>
    )
  }

  // Get widgets by category for layout
  const getWidgetsByCategory = (category: string) => {
    if (customWidgets.length > 0) {
      return customWidgets.filter(w => w.category === category && w.visible)
    }
    // Fallback to default layout if no custom widgets
    return []
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="farmer" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Farm Management */}
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

        {/* Right Sidebar - Market & Community */}
        <div className="lg:col-span-3 space-y-6">
          <MarketIntelligenceWidget />
          <CommunityCollaborationWidget />
          <AdvancedInsightsWidget />
          <SupplyChainWidget />
          <BusinessOpportunitiesWidget />
          <NewsEventsWidget />
          <TrendingFarmersWidget />
          <PersonalizedRecommendations />
          <TrendingTopics />
          <ConnectionSuggestions />
        </div>
      </div>

      {/* Bottom Row - Additional Farm Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SeasonalCalendarWidget />
        <MoneyPlanningWidget />
        <BusinessAnalyticsWidget />
        <WeatherWidget />
      </div>
    </div>
  );
};