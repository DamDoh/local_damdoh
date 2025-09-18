/**
 * Stakeholder Dashboard - Main orchestrator component following microservice architecture
 * Composes services and layout components for different stakeholder types
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Globe, MapPin, Microscope, DollarSign, Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
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
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { useWidgetCustomization } from '@/hooks/useWidgetCustomization';
import { FeedItemCard } from '../FeedItemCard';
import { DashboardCustomizer } from '../DashboardCustomizer';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [user]);

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
          <FarmerLayout
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
        return <BuyerLayout config={config} feedContent={feedContent} />;
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
        className="min-h-screen bg-gray-50"
        role="main"
        aria-label={`${config.profile.role} Dashboard`}
        style={{ backgroundColor: config.headerColor + '05' }}
      >
        {/* Header and Navigation would go here */}
        {/* Main content area with feed and layout */}
        <div className="pt-32 max-w-7xl mx-auto px-4 py-6">
          {/* Feed Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-4 border border-blue-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-blue-600" />
                  Smart Community Feed
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  AI-curated content personalized for you
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-medium">AI Confidence</div>
                <div className="text-sm font-bold text-blue-800">94%</div>
              </div>
            </div>

            {/* Feed Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800">Filter:</span>
                <select
                  value={feedFilter}
                  onChange={(e) => setFeedFilter(e.target.value as any)}
                  className="text-sm border border-blue-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="smart"><Bot className="inline h-4 w-4 mr-1" />AI Recommended</option>
                  <option value="all"><Globe className="inline h-4 w-4 mr-1" />All Posts</option>
                  <option value="local"><MapPin className="inline h-4 w-4 mr-1" />Local ({config.profile.location})</option>
                  <option value="experts"><Microscope className="inline h-4 w-4 mr-1" />Expert Insights</option>
                  <option value="market"><DollarSign className="inline h-4 w-4 mr-1" />Market Updates</option>
                  <option value="trending"><Flame className="inline h-4 w-4 mr-1" />Trending Now</option>
                </select>
              </div>

              {/* Dashboard Customization */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
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
      </div>
    </DashboardErrorBoundary>
  );
};

export { StakeholderDashboard };