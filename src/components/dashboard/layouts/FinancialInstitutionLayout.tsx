/**
 * Financial Institution Layout Component - Specialized layout for financial institution stakeholders
 * Composes financial-specific widgets and services following microservice pattern
 */

import React from 'react';
import {
  LoanPortfolioWidget,
  RiskAssessmentWidget,
  DocumentVerificationWidget,
  FieldVisitSchedulerWidget,
  FinancialAnalyticsWidget,
  ClientRelationshipWidget,
  ComplianceReportingWidget
} from '../widgets/FiWidgets';
import { WeatherWidget } from '../widgets/FarmerWidgets';
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
          <AchievementBadges userRole="financial" />
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
          <ClientRelationshipWidget />
          <ComplianceReportingWidget />
          <PersonalizedRecommendations />
          <TrendingTopics />
          <ConnectionSuggestions />
          <HelpSupportWidget />
        </div>
      </div>

      {/* Bottom Row - Additional Financial Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialAnalyticsWidget />
        <ComplianceReportingWidget />
        <ClientRelationshipWidget />
        <RiskAssessmentWidget />
      </div>
    </div>
  );
};