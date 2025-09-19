/**
 * Enhanced Buyer Layout - Immersive procurement and market intelligence dashboard
 */

import React from 'react';

// Core widgets available to all stakeholders
import { StoriesWidget } from '../widgets/StoriesWidget';
import { AchievementBadges } from '../widgets/AchievementBadges';
import { TrendingTopics } from '../widgets/TrendingTopics';
import { ConnectionSuggestions } from '../widgets/ConnectionSuggestions';
import { PersonalizedRecommendations } from '../widgets/PersonalizedRecommendations';

// Buyer-specific widgets
import {
  LiveMarketPulseWidget,
  ProcurementIntelligenceWidget,
  SupplyChainGlobeWidget,
  ProcurementPerformanceWidget
} from '../widgets';

// Farmer-specific widgets
import { NewsEventsWidget, WeatherWidget } from '../widgets/FarmerWidgets';

// Common operational widgets
import { BusinessAnalyticsWidget } from '../widgets';

interface EnhancedBuyerLayoutProps {
  config: any;
  feedContent: React.ReactNode;
  customWidgets?: any[];
  isEditMode?: boolean;
  onToggleWidgetVisibility?: (widgetId: string) => void;
}

const EnhancedBuyerLayout: React.FC<EnhancedBuyerLayoutProps> = ({
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
          <AchievementBadges userRole="Buyer" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Market Intelligence */}
        <div className="lg:col-span-3 space-y-6">
          <LiveMarketPulseWidget />
          <ProcurementIntelligenceWidget />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* Supply Chain Globe - Hero Widget */}
          <SupplyChainGlobeWidget />

          {/* Procurement Performance */}
          <ProcurementPerformanceWidget />

          {/* Feed Content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Procurement Network
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                Connect with suppliers and industry experts
              </p>
            </div>
            <div className="p-4">
              {feedContent}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Analytics & Connections */}
        <div className="lg:col-span-3 space-y-6">
          {/* Core widgets for all stakeholders */}
          <NewsEventsWidget />
          <TrendingTopics />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />

          {/* Stakeholder-specific widgets */}
          <BusinessAnalyticsWidget />

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

export default EnhancedBuyerLayout;