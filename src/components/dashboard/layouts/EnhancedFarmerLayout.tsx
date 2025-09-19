/**
 * Enhanced Farmer Layout - Immersive and gamified farmer dashboard layout
 */

import React from 'react';

// Core widgets available to all stakeholders
import { StoriesWidget } from '../widgets/StoriesWidget';
import { AchievementBadges } from '../widgets/AchievementBadges';
import { TrendingTopics as TrendingTopicsWidget } from '../widgets/TrendingTopics';
import { ConnectionSuggestions } from '../widgets/ConnectionSuggestions';
import { PersonalizedRecommendations } from '../widgets/PersonalizedRecommendations';

// Farmer-specific widgets
import {
  FarmCommandCenterWidget,
  CropGrowthMonitorWidget,
  WeatherIntelligenceWidget,
  FarmerProgressWidget,
  AgriculturalWeatherWidget,
  AgriculturalNewsEventsWidget,
  WeatherWidget
} from '../widgets';

// Common operational widgets
import { DailyOperationsWidget } from '../widgets';
import { EmergencyAlertsWidget } from '../widgets';
import { FarmerFeedbackWidget } from '../widgets';
import { ConnectivityWidget } from '../widgets';
import StorytellingWidget from '../widgets/StorytellingWidget';

interface EnhancedFarmerLayoutProps {
  config: any;
  feedContent: React.ReactNode;
  customWidgets?: any[];
  isEditMode?: boolean;
  onToggleWidgetVisibility?: (widgetId: string) => void;
}

const EnhancedFarmerLayout: React.FC<EnhancedFarmerLayoutProps> = ({
  config,
  feedContent,
  customWidgets = [],
  isEditMode = false,
  onToggleWidgetVisibility
}) => {
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
        {/* Left Sidebar - Farm Command Center */}
        <div className="lg:col-span-3 space-y-6">
          <FarmCommandCenterWidget />
          <WeatherIntelligenceWidget />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* Crop Growth Monitor - Hero Widget */}
          <CropGrowthMonitorWidget />

          {/* Storytelling Widget */}
          <StorytellingWidget stakeholderType="Farmer" />

          {/* Feed Content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Community Feed
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                Connect with fellow farmers and experts
              </p>
            </div>
            <div className="p-4">
              {feedContent}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Agricultural Weather & News */}
        <div className="lg:col-span-3 space-y-6">
          <AgriculturalWeatherWidget />
          <AgriculturalNewsEventsWidget />
          <TrendingTopicsWidget />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />

          {/* Custom widgets */}
          {customWidgets.map((widget, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4">
              {widget}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFarmerLayout;