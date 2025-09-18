/**
 * Enhanced Buyer Layout - Immersive procurement and market intelligence dashboard
 */

import React from 'react';
import {
  LiveMarketPulseWidget,
  ProcurementIntelligenceWidget,
  SupplyChainGlobeWidget,
  ProcurementPerformanceWidget
} from '../widgets';
import { BusinessAnalyticsWidget } from '../widgets';
import { TrendingTopics } from '../widgets';
import { ConnectionSuggestions } from '../widgets';

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Market Intelligence */}
      <div className="lg:col-span-4 space-y-6">
        <LiveMarketPulseWidget />
        <ProcurementIntelligenceWidget />
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-5 space-y-6">
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
        <BusinessAnalyticsWidget />
        <TrendingTopics />
        <ConnectionSuggestions />

        {/* Custom widgets */}
        {customWidgets.map((widget, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4">
            {widget}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedBuyerLayout;