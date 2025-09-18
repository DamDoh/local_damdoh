/**
 * Enhanced Farmer Layout - Immersive and gamified farmer dashboard layout
 */

import React from 'react';
import {
  FarmCommandCenterWidget,
  CropGrowthMonitorWidget,
  WeatherIntelligenceWidget,
  FarmerProgressWidget
} from '../widgets';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Farm Command Center */}
      <div className="lg:col-span-4 space-y-6">
        <FarmCommandCenterWidget />
        <WeatherIntelligenceWidget />
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-5 space-y-6">
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

      {/* Right Sidebar - Operations & Progress */}
      <div className="lg:col-span-3 space-y-6">
        <FarmerProgressWidget />
        <DailyOperationsWidget />
        <EmergencyAlertsWidget />
        <ConnectivityWidget />

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

export default EnhancedFarmerLayout;