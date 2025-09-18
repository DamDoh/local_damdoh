import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StakeholderDashboard } from '../StakeholderDashboard'
import { stakeholderConfigs } from '@/lib/stakeholder-configs'

// Mock services
jest.mock('@/services/dashboard/FeedService', () => ({
  FeedService: {
    getInstance: jest.fn(() => ({
      fetchFeed: jest.fn(() => Promise.resolve([])),
      applyClientSideFiltering: jest.fn(() => []),
    }))
  }
}))

jest.mock('@/services/dashboard/NotificationService', () => ({
  NotificationService: {
    getInstance: jest.fn(() => ({
      fetchNotifications: jest.fn(() => Promise.resolve([])),
      getUnreadCount: jest.fn(() => 0),
      onNotificationsUpdate: jest.fn(() => jest.fn())
    }))
  }
}))

jest.mock('@/services/dashboard/MarketplaceService', () => ({
  MarketplaceService: {
    getInstance: jest.fn(() => ({
      // Add marketplace service mocks if needed
    }))
  }
}))

// Mock hooks
jest.mock('@/hooks/useSmartRecommendations', () => ({
  useSmartRecommendations: () => ({
    behaviorAnalysis: {
      preferredCategories: ['farming', 'technology']
    }
  })
}))

jest.mock('@/lib/auth-utils', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' }
  })
}))

// Mock the DashboardErrorBoundary
jest.mock('../../ErrorBoundary', () => ({
  DashboardErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock all widget components to avoid import issues
jest.mock('../../widgets', () => ({
  DailyOperationsWidget: () => <div data-testid="daily-operations">Daily Operations</div>,
  FarmResourcesWidget: () => <div data-testid="farm-resources">Farm Resources</div>,
  EmergencyAlertsWidget: () => <div data-testid="emergency-alerts">Emergency Alerts</div>,
  QuickStatsWidget: () => <div data-testid="quick-stats">Quick Stats</div>,
  ConnectivityWidget: () => <div data-testid="connectivity">Connectivity</div>,
  FarmerFeedbackWidget: () => <div data-testid="farmer-feedback">Farmer Feedback</div>,
  SeasonalCalendarWidget: () => <div data-testid="seasonal-calendar">Seasonal Calendar</div>,
  MoneyPlanningWidget: () => <div data-testid="money-planning">Money Planning</div>,
  BusinessAnalyticsWidget: () => <div data-testid="business-analytics">Business Analytics</div>,
  HelpSupportWidget: () => <div data-testid="help-support">Help & Support</div>,
}))

jest.mock('../../widgets/FarmerWidgets', () => ({
  WeatherWidget: () => <div data-testid="weather-widget">Weather Widget</div>,
  MarketIntelligenceWidget: () => <div data-testid="market-intelligence">Market Intelligence</div>,
  NewsEventsWidget: () => <div data-testid="news-events">News Events</div>,
  CommunityCollaborationWidget: () => <div data-testid="community-collaboration">Community Collaboration</div>,
  AdvancedInsightsWidget: () => <div data-testid="advanced-insights">Advanced Insights</div>,
  SupplyChainWidget: () => <div data-testid="supply-chain">Supply Chain</div>,
  TrendingFarmersWidget: () => <div data-testid="trending-farmers">Trending Farmers</div>,
  BusinessOpportunitiesWidget: () => <div data-testid="business-opportunities">Business Opportunities</div>,
}))

jest.mock('../../widgets/BuyerWidgets', () => ({
  SupplierDiscoveryWidget: () => <div data-testid="supplier-discovery">Supplier Discovery</div>,
  OrderManagementWidget: () => <div data-testid="order-management">Order Management</div>,
  LogisticsWidget: () => <div data-testid="logistics">Logistics</div>,
  QualityControlWidget: () => <div data-testid="quality-control">Quality Control</div>,
  PaymentProcessingWidget: () => <div data-testid="payment-processing">Payment Processing</div>,
  BuyerAnalyticsWidget: () => <div data-testid="buyer-analytics">Buyer Analytics</div>,
}))

jest.mock('../../widgets/FiWidgets', () => ({
  LoanPortfolioWidget: () => <div data-testid="loan-portfolio">Loan Portfolio</div>,
  RiskAssessmentWidget: () => <div data-testid="risk-assessment">Risk Assessment</div>,
  DocumentVerificationWidget: () => <div data-testid="document-verification">Document Verification</div>,
  FieldVisitSchedulerWidget: () => <div data-testid="field-visit-scheduler">Field Visit Scheduler</div>,
  FinancialAnalyticsWidget: () => <div data-testid="financial-analytics">Financial Analytics</div>,
  ClientRelationshipWidget: () => <div data-testid="client-relationship">Client Relationship</div>,
  ComplianceReportingWidget: () => <div data-testid="compliance-reporting">Compliance Reporting</div>,
}))

jest.mock('../../widgets/AgriTechWidgets', () => ({
  SolutionShowcaseWidget: () => <div data-testid="solution-showcase">Solution Showcase</div>,
  PilotProgramWidget: () => <div data-testid="pilot-program">Pilot Program</div>,
  ResearchCollaborationWidget: () => <div data-testid="research-collaboration">Research Collaboration</div>,
  FundingOpportunitiesWidget: () => <div data-testid="funding-opportunities">Funding Opportunities</div>,
  InnovationMetricsWidget: () => <div data-testid="innovation-metrics">Innovation Metrics</div>,
}))

jest.mock('../../widgets/CrowdfunderWidgets', () => ({
  PortfolioOverviewWidget: () => <div data-testid="portfolio-overview">Portfolio Overview</div>,
  ProjectDiscoveryWidget: () => <div data-testid="project-discovery">Project Discovery</div>,
  ImpactTrackingWidget: () => <div data-testid="impact-tracking">Impact Tracking</div>,
  CampaignManagementWidget: () => <div data-testid="campaign-management">Campaign Management</div>,
  InvestorNetworkWidget: () => <div data-testid="investor-network">Investor Network</div>,
}))

jest.mock('../../widgets/GeneralWidgets', () => ({
  CommunityFeedWidget: () => <div data-testid="community-feed">Community Feed</div>,
  MarketplaceOverviewWidget: () => <div data-testid="marketplace-overview">Marketplace Overview</div>,
  LearningResourcesWidget: () => <div data-testid="learning-resources">Learning Resources</div>,
  SupportServicesWidget: () => <div data-testid="support-services">Support Services</div>,
}))

jest.mock('../../widgets/PersonalizedRecommendations', () => ({
  PersonalizedRecommendations: () => <div data-testid="personalized-recommendations">Personalized Recommendations</div>,
}))

jest.mock('../../widgets/TrendingTopics', () => ({
  TrendingTopics: () => <div data-testid="trending-topics">Trending Topics</div>,
}))

jest.mock('../../widgets/ConnectionSuggestions', () => ({
  ConnectionSuggestions: () => <div data-testid="connection-suggestions">Connection Suggestions</div>,
}))

jest.mock('../../widgets/AchievementBadges', () => ({
  AchievementBadges: () => <div data-testid="achievement-badges">Achievement Badges</div>,
}))

jest.mock('../../widgets/StoriesWidget', () => ({
  StoriesWidget: () => <div data-testid="stories-widget">Stories Widget</div>,
}))

// Test data for different stakeholder types
const mockFeedPosts = [
  {
    id: '1',
    author: 'John Farmer',
    avatar: '/avatars/farmer.jpg',
    verified: true,
    time: '2 hours ago',
    content: 'Just harvested my first maize crop this season!',
    type: 'general',
    likes: 24,
    comments: [],
    commentCount: 5,
    shares: 3,
    engagement: '89%',
    tags: ['maize', 'harvest'],
    reactions: { like: 20, love: 4 },
    aiGenerated: false,
    expertVerified: true
  }
]

describe('StakeholderDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Farmer Dashboard', () => {
    const farmerConfig = stakeholderConfigs['Farmer']

    it('renders farmer dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={farmerConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
        expect(screen.getByTestId('daily-operations')).toBeInTheDocument()
        expect(screen.getByTestId('farm-resources')).toBeInTheDocument()
      })
    })

    it('displays farmer-specific widgets', async () => {
      render(<StakeholderDashboard config={farmerConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('market-intelligence')).toBeInTheDocument()
        expect(screen.getByTestId('community-collaboration')).toBeInTheDocument()
        expect(screen.getByTestId('supply-chain')).toBeInTheDocument()
      })
    })

    it('has proper accessibility attributes for farmer dashboard', async () => {
      render(<StakeholderDashboard config={farmerConfig} />)

      await waitFor(() => {
        const mainElement = screen.getByRole('main')
        expect(mainElement).toBeInTheDocument()
        expect(mainElement).toHaveAttribute('aria-label', 'Farmer Dashboard')
      })
    })
  })

  describe('Buyer Dashboard', () => {
    const buyerConfig = stakeholderConfigs['Buyer']

    it('renders buyer dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={buyerConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('supplier-discovery')).toBeInTheDocument()
        expect(screen.getByTestId('order-management')).toBeInTheDocument()
      })
    })

    it('displays buyer-specific widgets', async () => {
      render(<StakeholderDashboard config={buyerConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('logistics')).toBeInTheDocument()
        expect(screen.getByTestId('quality-control')).toBeInTheDocument()
        expect(screen.getByTestId('payment-processing')).toBeInTheDocument()
      })
    })
  })

  describe('Financial Institution Dashboard', () => {
    const fiConfig = stakeholderConfigs['Financial Institution']

    it('renders FI dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={fiConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('loan-portfolio')).toBeInTheDocument()
        expect(screen.getByTestId('risk-assessment')).toBeInTheDocument()
      })
    })

    it('displays FI-specific widgets', async () => {
      render(<StakeholderDashboard config={fiConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('document-verification')).toBeInTheDocument()
        expect(screen.getByTestId('financial-analytics')).toBeInTheDocument()
        expect(screen.getByTestId('client-relationship')).toBeInTheDocument()
      })
    })
  })

  describe('AgriTech Innovator Dashboard', () => {
    const agritechConfig = stakeholderConfigs['AgriTech Innovator']

    it('renders AgriTech dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={agritechConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('solution-showcase')).toBeInTheDocument()
        expect(screen.getByTestId('pilot-program')).toBeInTheDocument()
      })
    })

    it('displays AgriTech-specific widgets', async () => {
      render(<StakeholderDashboard config={agritechConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('research-collaboration')).toBeInTheDocument()
        expect(screen.getByTestId('funding-opportunities')).toBeInTheDocument()
        expect(screen.getByTestId('innovation-metrics')).toBeInTheDocument()
      })
    })
  })

  describe('Crowdfunder Dashboard', () => {
    const crowdfunderConfig = stakeholderConfigs['Crowdfunder']

    it('renders Crowdfunder dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={crowdfunderConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('portfolio-overview')).toBeInTheDocument()
        expect(screen.getByTestId('project-discovery')).toBeInTheDocument()
      })
    })

    it('displays Crowdfunder-specific widgets', async () => {
      render(<StakeholderDashboard config={crowdfunderConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('impact-tracking')).toBeInTheDocument()
        expect(screen.getByTestId('campaign-management')).toBeInTheDocument()
        expect(screen.getByTestId('investor-network')).toBeInTheDocument()
      })
    })
  })

  describe('General Stakeholder Dashboard', () => {
    const generalConfig = stakeholderConfigs['General']

    it('renders general dashboard with correct layout', async () => {
      render(<StakeholderDashboard config={generalConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
        expect(screen.getByTestId('community-feed')).toBeInTheDocument()
        expect(screen.getByTestId('marketplace-overview')).toBeInTheDocument()
      })
    })

    it('displays general-purpose widgets', async () => {
      render(<StakeholderDashboard config={generalConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('learning-resources')).toBeInTheDocument()
        expect(screen.getByTestId('support-services')).toBeInTheDocument()
      })
    })
  })

  describe('Feed Integration', () => {
    it('renders feed content in all layouts', async () => {
      render(<StakeholderDashboard config={stakeholderConfigs['Farmer']} />)

      await waitFor(() => {
        // Feed content should be rendered within the layout
        expect(screen.getByTestId('stories-widget')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles service errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Mock service to throw error
      const mockFeedService = require('@/services/dashboard/FeedService').FeedService
      mockFeedService.getInstance().fetchFeed.mockRejectedValue(new Error('Service Error'))

      render(<StakeholderDashboard config={stakeholderConfigs['Farmer']} />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })
})