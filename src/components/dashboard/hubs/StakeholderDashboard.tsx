/**
 * Stakeholder Dashboard - Main orchestrator component following microservice architecture
 * Composes services and layout components for different stakeholder types
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Globe, MapPin, Microscope, DollarSign, Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { DashboardErrorBoundary } from '../ErrorBoundary';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { FeedService } from '@/services/dashboard/FeedService';
import { NotificationService } from '@/services/dashboard/NotificationService';
import { MarketplaceService } from '@/services/dashboard/MarketplaceService';
import { FarmerLayout } from '../layouts/FarmerLayout';
import { BuyerLayout } from '../layouts/BuyerLayout';
import { AgriTechLayout } from '../layouts/AgriTechLayout';
import { FinancialInstitutionLayout } from '../layouts/FinancialInstitutionLayout';
import { CrowdfunderLayout } from '../layouts/CrowdfunderLayout';
import { GeneralLayout } from '../layouts/GeneralLayout';
import { AgronomistLayout } from '../layouts/AgronomistLayout';
import { CooperativeLayout } from '../layouts/CooperativeLayout';
import { CreditScorecardLayout } from '../layouts/CreditScorecardLayout';
import { InsuranceProviderLayout } from '../layouts/InsuranceProviderLayout';
import { ResearcherLayout } from '../layouts/ResearcherLayout';
import { AgroExportLayout } from '../layouts/AgroExportLayout';
import { AgroTourismLayout } from '../layouts/AgroTourismLayout';
import { CertificationBodyLayout } from '../layouts/CertificationBodyLayout';
import { ConsumerLayout } from '../layouts/ConsumerLayout';
import { EnergyProviderLayout } from '../layouts/EnergyProviderLayout';
import { EquipmentSupplierLayout } from '../layouts/EquipmentSupplierLayout';
import { FieldAgentLayout } from '../layouts/FieldAgentLayout';
import { LogisticsLayout } from '../layouts/LogisticsLayout';
import { OperationsLayout } from '../layouts/OperationsLayout';
import EnhancedFarmerLayout from '../layouts/EnhancedFarmerLayout';
import EnhancedBuyerLayout from '../layouts/EnhancedBuyerLayout';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { useWidgetCustomization } from '@/hooks/useWidgetCustomization';
import { useGamification } from '@/hooks/useGamification';
import { useVoiceNavigation, useVoiceFarmManagement, useVoiceProcurement } from '@/hooks/useVoice';
import { FeedItemCard } from '../FeedItemCard';
import { DashboardCustomizer } from '../DashboardCustomizer';
import CelebrationModal from '@/components/ui/CelebrationModal';
import VoiceControl from '@/components/ui/VoiceControl';
import { Button } from '@/components/ui/button';
import { Settings, Trophy, Star, Target } from 'lucide-react';

export interface StakeholderConfig {
  profile: {
    name: string;
    role: string;
    location: string;
    avatar: string;
    verified: boolean;
    stats: {[key: string]: string};
  };
  menuItems: Array<{
    id: string;
    icon: React.ElementType;
    label: string;
  }>;
  posts: Array<any>;
  recentActivity: Array<{
    action: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  searchPlaceholder: string;
  rightSidebarWidgets: React.ReactNode[];
  headerColor: string;
  brandColor: string;
}

interface StakeholderDashboardProps {
  config: StakeholderConfig;
}

const StakeholderDashboard: React.FC<StakeholderDashboardProps> = ({ config }) => {
  // Initialize services
  const feedService = FeedService.getInstance();
  const notificationService = NotificationService.getInstance();
  const marketplaceService = MarketplaceService.getInstance();

  // Apply dynamic theming
  const { applyStakeholderTheme, currentSeason } = useTheme(config.profile.role);

  // State management
  const [activeTab, setActiveTab] = useState('home');
  const [feedFilter, setFeedFilter] = useState<'all' | 'smart' | 'local' | 'experts' | 'market' | 'trending'>('smart');
  const [posts, setPosts] = useState<any[]>(config.posts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      // Implement delete logic here
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: 'Post deleted',
        description: 'The post has been removed from your feed.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post.',
        variant: 'destructive'
      });
    }
  };

  const { user } = useAuth();
  const { toast } = useToast();
  const { behaviorAnalysis } = useSmartRecommendations();
  const {
    userProgress,
    unlockedAchievements,
    trackAction,
    celebrationData,
    dismissCelebration
  } = useGamification();

  // Voice control
  const handleVoiceNavigation = (destination: string) => {
    setActiveTab(destination);
    trackAction('voice_navigation', { destination });
  };

  const handleVoiceFarmAction = (action: string, params?: any) => {
    // Handle farm-specific voice commands
    switch (action) {
      case 'check_crop_health':
        // Could trigger a crop health check or navigate to relevant widget
        trackAction('voice_farm_action', { action, params });
        break;
      case 'irrigate_field':
        // Could trigger irrigation controls
        trackAction('voice_farm_action', { action, params });
        break;
      default:
        break;
    }
  };

  const handleVoiceProcurementAction = (action: string, params?: any) => {
    // Handle procurement-specific voice commands
    switch (action) {
      case 'search_suppliers':
        // Could trigger supplier search
        trackAction('voice_procurement_action', { action, params });
        break;
      case 'show_procurement':
        // Could show procurement opportunities
        trackAction('voice_procurement_action', { action, params });
        break;
      default:
        break;
    }
  };

  // Initialize voice hooks
  useVoiceNavigation(handleVoiceNavigation);
  useVoiceFarmManagement(handleVoiceFarmAction);
  useVoiceProcurement(handleVoiceProcurementAction);

  // Widget customization
  const {
    widgets: customWidgets,
    isEditMode,
    setIsEditMode,
    updateWidget,
    toggleWidgetVisibility,
    resetToDefault,
    exportLayout,
    importLayout
  } = useWidgetCustomization(config.profile.role);

  // Load initial data and apply theme
  useEffect(() => {
    loadInitialData();
    applyStakeholderTheme(config.profile.role);
  }, [user?.id, config.profile.role]); // Remove applyStakeholderTheme from deps as it's likely stable

  const loadInitialData = async () => {
    if (!user) return;

    try {
      // Load feed posts
      setIsLoadingPosts(true);
      const feedPosts = await feedService.fetchFeed({
        type: feedFilter,
        location: config.profile.location,
        userInterests: behaviorAnalysis?.preferredCategories || [],
        stakeholderType: config.profile.role
      });
      setPosts(feedPosts);
      setIsLoadingPosts(false);

      // Load notifications
      const userNotifications = await notificationService.fetchNotifications();
      setNotifications(userNotifications);
      setUnreadCount(notificationService.getUnreadCount(userNotifications));

      // Subscribe to notification updates
      const unsubscribe = notificationService.onNotificationsUpdate((updatedNotifications) => {
        setNotifications(updatedNotifications);
        setUnreadCount(notificationService.getUnreadCount(updatedNotifications));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error loading dashboard data',
        description: 'Some features may not be available',
        variant: 'destructive'
      });
    }
  };

  // AI-powered feed filtering
  const filteredPosts = useMemo(() => {
    return feedService.applyClientSideFiltering(posts, {
      type: feedFilter,
      location: config.profile.location,
      userInterests: behaviorAnalysis?.preferredCategories || [],
      stakeholderType: config.profile.role
    });
  }, [posts, feedFilter, behaviorAnalysis, config.profile]);

  // Render feed content
  const renderFeedContent = () => {
    if (isLoadingPosts) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts to show. Try adjusting your feed filter.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPosts.map((post: any) => (
          <FeedItemCard key={post.id} item={post} onDeletePost={handleDeletePost} />
        ))}
      </div>
    );
  };

  // Render appropriate layout based on stakeholder type
  const renderLayout = () => {
    const feedContent = renderFeedContent();

    switch (config.profile.role) {
      case 'Farmer':
        return (
          <EnhancedFarmerLayout
            config={config}
            feedContent={feedContent}
            customWidgets={customWidgets}
            isEditMode={isEditMode}
            onToggleWidgetVisibility={toggleWidgetVisibility}
          />
        );
      case 'Agronomist':
        return <AgronomistLayout config={config} feedContent={feedContent} />;
      case 'Cooperative':
        return <CooperativeLayout config={config} feedContent={feedContent} />;
      case 'Field Agent':
        return <FieldAgentLayout config={config} feedContent={feedContent} />;
      case 'Buyer':
        return (
          <EnhancedBuyerLayout
            config={config}
            feedContent={feedContent}
            customWidgets={customWidgets}
            isEditMode={isEditMode}
            onToggleWidgetVisibility={toggleWidgetVisibility}
          />
        );
      case 'Agro Export':
        return <AgroExportLayout config={config} feedContent={feedContent} />;
      case 'Equipment Supplier':
        return <EquipmentSupplierLayout config={config} feedContent={feedContent} />;
      case 'Logistics':
        return <LogisticsLayout config={config} feedContent={feedContent} />;
      case 'Packaging Supplier':
      case 'Processing Unit':
      case 'Warehouse':
        return <BuyerLayout config={config} feedContent={feedContent} />;
      case 'AgriTech Innovator':
        return <AgriTechLayout config={config} feedContent={feedContent} />;
      case 'Researcher':
        return <ResearcherLayout config={config} feedContent={feedContent} />;
      case 'Financial Institution':
        return <FinancialInstitutionLayout config={config} feedContent={feedContent} />;
      case 'Credit Scorecard':
        return <CreditScorecardLayout config={config} feedContent={feedContent} />;
      case 'Insurance Provider':
        return <InsuranceProviderLayout config={config} feedContent={feedContent} />;
      case 'Crowdfunder':
        return <CrowdfunderLayout config={config} feedContent={feedContent} />;
      case 'Agro Tourism':
        return <AgroTourismLayout config={config} feedContent={feedContent} />;
      case 'Certification Body':
        return <CertificationBodyLayout config={config} feedContent={feedContent} />;
      case 'Consumer':
        return <ConsumerLayout config={config} feedContent={feedContent} />;
      case 'Energy Provider':
        return <EnergyProviderLayout config={config} feedContent={feedContent} />;
      case 'Operations':
        return <OperationsLayout config={config} feedContent={feedContent} />;
      case 'Packaging Supplier':
      case 'Processing Unit':
      case 'Warehouse':
        return <BuyerLayout config={config} feedContent={feedContent} />;
      case 'QA':
      case 'Regulator':
      case 'Trust Score':
      case 'Waste Management':
        return <GeneralLayout config={config} feedContent={feedContent} />;
      default:
        // Fallback to general layout for other stakeholders
        return <GeneralLayout config={config} feedContent={feedContent} />;
    }
  };

  return (
    <DashboardErrorBoundary>
      <div
        className="min-h-screen"
        role="main"
        aria-label={`${config.profile.role} Dashboard`}
        style={{
          backgroundColor: 'var(--color-background)',
          backgroundImage: `linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%)`
        }}
      >
        {/* Header and Navigation would go here */}
        {/* Main content area with feed and layout */}
        <div className="pt-32 max-w-7xl mx-auto px-4 py-6">
          {/* Feed Controls */}
          <div
            className="rounded-xl shadow-sm p-4 mb-6 border"
            style={{
              background: 'var(--gradient-accent)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-light)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center" style={{ color: 'var(--color-text)' }}>
                  <Bot className="h-6 w-6 mr-2" style={{ color: 'var(--color-primary)' }} />
                  Smart Community Feed
                  <span className="ml-2 text-sm px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}>
                    {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}
                  </span>
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                  AI-curated content personalized for you
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>AI Confidence</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>94%</div>
                </div>

                {/* Voice Control */}
                <div className="border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
                  <VoiceControl compact className="mb-1" />
                </div>

                {/* Gamification Status */}
                {userProgress && (
                  <div className="text-right border-l pl-4" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-textSecondary)' }}>
                        Level {userProgress.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" style={{ color: 'var(--color-warning)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        {userProgress.totalPoints} pts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feed Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Filter:</span>
                <select
                  value={feedFilter}
                  onChange={(e) => {
                    setFeedFilter(e.target.value as any);
                    // Track gamification action
                    trackAction('feed_filter_changed', { filter: e.target.value });
                  }}
                  className="text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 bg-white"
                  style={{
                    borderColor: 'var(--color-border)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as React.CSSProperties}
                >
                  <option value="smart">🤖 AI Recommended</option>
                  <option value="all">🌍 All Posts</option>
                  <option value="local">📍 Local ({config.profile.location})</option>
                  <option value="experts">🔬 Expert Insights</option>
                  <option value="market">💰 Market Updates</option>
                  <option value="trending">🔥 Trending Now</option>
                </select>
              </div>

              {/* Dashboard Customization */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <Settings className="h-4 w-4" />
                Customize Dashboard
              </Button>
            </div>
          </div>

          {/* Render stakeholder-specific layout */}
          {renderLayout()}
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Dashboard Customizer */}
        <DashboardCustomizer
          isOpen={isEditMode}
          onClose={() => setIsEditMode(false)}
          widgets={customWidgets}
          onUpdateWidget={updateWidget}
          onResetToDefault={resetToDefault}
          onExportLayout={exportLayout}
          onImportLayout={importLayout}
        />

        {/* Achievement Celebration Modal */}
        <CelebrationModal
          isOpen={celebrationData.show}
          achievement={celebrationData.achievement}
          message={celebrationData.message}
          animation={celebrationData.animation}
          duration={celebrationData.duration}
          onClose={dismissCelebration}
        />
      </div>
    </DashboardErrorBoundary>
  );
};

export { StakeholderDashboard };