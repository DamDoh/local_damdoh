/**
 * Financial Institution Layout Component - Specialized layout for financial institution stakeholders
 * Composes financial-specific widgets and services following microservice pattern
 */

import React from 'react';

// Core widgets available to all stakeholders
import { StoriesWidget } from '../widgets/StoriesWidget';
import { AchievementBadges } from '../widgets/AchievementBadges';
import { TrendingTopics } from '../widgets/TrendingTopics';
import { ConnectionSuggestions } from '../widgets/ConnectionSuggestions';
import { PersonalizedRecommendations } from '../widgets/PersonalizedRecommendations';
import { HelpSupportWidget } from '../widgets';

// Financial institution-specific widgets
import {
  LoanPortfolioWidget,
  RiskAssessmentWidget,
  DocumentVerificationWidget,
  FieldVisitSchedulerWidget,
  FinancialAnalyticsWidget,
  ClientRelationshipWidget,
  ComplianceReportingWidget
} from '../widgets/FiWidgets';

// Farmer-specific widgets
import { WeatherWidget, NewsEventsWidget } from '../widgets/FarmerWidgets';

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

interface FinancialInstitutionLayoutProps {
  config: any; // StakeholderConfig
  feedContent?: React.ReactNode;
}

export const FinancialInstitutionLayout: React.FC<FinancialInstitutionLayoutProps> = ({ config, feedContent }) => {
  return (
    <div className="space-y-6">
      {/* Top Row - Stories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoriesWidget />
        </div>
        <div className="space-y-4">
          <AchievementBadges userRole="Financial Institution" />
          <WeatherWidget />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Portfolio & Risk Management */}
        <div className="lg:col-span-3 space-y-6">
          <LoanPortfolioWidget />
          <RiskAssessmentWidget />
          <DocumentVerificationWidget />
          <FieldVisitSchedulerWidget />
          <FinancialAnalyticsWidget />
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-6">
          {feedContent}
        </div>

        {/* Right Sidebar - Client Relations & Compliance */}
        <div className="lg:col-span-3 space-y-6">
          {/* Core widgets for all stakeholders */}
          <NewsEventsWidget />
          <TrendingTopics />
          <ConnectionSuggestions />
          <PersonalizedRecommendations />

          {/* Stakeholder-specific widgets */}
          <ClientRelationshipWidget />
          <ComplianceReportingWidget />
          <HelpSupportWidget />
        </div>
      </div>

    </div>
  );
};