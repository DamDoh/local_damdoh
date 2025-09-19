/**
 * Smart Recommendations Hook - AI-powered content and connection recommendations
 * Analyzes user behavior to provide personalized suggestions
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';

interface UserBehavior {
  likedPosts: string[];
  commentedPosts: string[];
  sharedPosts: string[];
  viewedProfiles: string[];
  searchedTopics: string[];
  followedHashtags: string[];
  timeSpentOnTopics: Record<string, number>;
  interactionFrequency: Record<string, number>;
}

interface ContentRecommendation {
  id: string;
  type: 'post' | 'profile' | 'project' | 'topic' | 'hashtag';
  title: string;
  description: string;
  relevanceScore: number;
  reason: string;
  metadata: Record<string, any>;
}

interface ConnectionSuggestion {
  id: string;
  name: string;
  role: string;
  avatar: string;
  compatibilityScore: number;
  reasons: string[];
  mutualConnections: number;
}

interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  growth: number; // percentage growth in engagement
  postCount: number;
  topContributors: string[];
}

export const useSmartRecommendations = () => {
  const { profile } = useUserProfile();
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    likedPosts: [],
    commentedPosts: [],
    sharedPosts: [],
    viewedProfiles: [],
    searchedTopics: [],
    followedHashtags: [],
    timeSpentOnTopics: {},
    interactionFrequency: {}
  });

  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [connections, setConnections] = useState<ConnectionSuggestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract categories from topics
  const extractCategoriesFromTopics = (topics: string[]): string[] => {
    const categoryMap: Record<string, string[]> = {
      farming: ['maize', 'beans', 'tomatoes', 'irrigation', 'fertilizer', 'pest', 'harvest'],
      finance: ['loan', 'credit', 'investment', 'funding', 'profit', 'roi'],
      technology: ['ai', 'drone', 'sensor', 'app', 'software', 'automation'],
      market: ['price', 'buyer', 'seller', 'export', 'trade', 'commodity'],
      community: ['cooperative', 'training', 'education', 'network', 'collaboration']
    };

    const categories: string[] = [];
    topics.forEach(topic => {
      const lowerTopic = topic.toLowerCase();
      Object.entries(categoryMap).forEach(([category, keywords]) => {
        if (keywords.some(keyword => lowerTopic.includes(keyword)) && !categories.includes(category)) {
          categories.push(category);
        }
      });
    });

    return categories;
  };

  // Analyze user behavior patterns
  const behaviorAnalysis = useMemo(() => {
    const { likedPosts, commentedPosts, sharedPosts, searchedTopics, followedHashtags, timeSpentOnTopics } = userBehavior;

    // Extract preferred topics
    const topicFrequency: Record<string, number> = {};
    [...searchedTopics, ...followedHashtags].forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    // Calculate engagement level
    const totalEngagements = likedPosts.length + commentedPosts.length + sharedPosts.length;
    const engagementRate = totalEngagements / Math.max(1, Object.keys(timeSpentOnTopics).length);

    // Identify user interests
    const topTopics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      topTopics,
      engagementRate,
      preferredCategories: extractCategoriesFromTopics(topTopics),
      userType: profile?.primaryRole || 'General',
      location: profile?.location || ''
    };
  }, [userBehavior, profile]);

  // Generate content recommendations
  const generateContentRecommendations = useCallback(async (): Promise<ContentRecommendation[]> => {
    const { topTopics, preferredCategories, userType, location } = behaviorAnalysis;

    // Mock AI-powered recommendations (in real app, this would call an AI service)
    const mockRecommendations: ContentRecommendation[] = [
      {
        id: 'rec-1',
        type: 'post',
        title: 'Advanced Irrigation Techniques for Smallholder Farmers',
        description: 'Learn about drip irrigation systems that can increase yields by 40%',
        relevanceScore: 0.95,
        reason: 'Based on your interest in irrigation and farming techniques',
        metadata: { author: 'AgriTech Expert', location: 'Kenya', category: 'farming' }
      },
      {
        id: 'rec-2',
        type: 'profile',
        title: 'Sustainable Farming Cooperative',
        description: 'Connect with farmers practicing regenerative agriculture',
        relevanceScore: 0.88,
        reason: 'Matches your location and sustainable farming interests',
        metadata: { members: 150, location: location, focus: 'sustainability' }
      },
      {
        id: 'rec-3',
        type: 'project',
        title: 'Community Solar Irrigation Project',
        description: 'Seeking KSH 500,000 for solar-powered irrigation system',
        relevanceScore: 0.92,
        reason: 'Aligns with your irrigation interests and investment preferences',
        metadata: { fundingGoal: 500000, currentFunding: 150000, location: location }
      },
      {
        id: 'rec-4',
        type: 'topic',
        title: '#RegenerativeAgriculture',
        description: 'Trending discussions on soil health and carbon sequestration',
        relevanceScore: 0.85,
        reason: 'Popular among farmers in your network with similar interests',
        metadata: { postsCount: 234, growthRate: 45, topContributors: 12 }
      }
    ];

    // Filter and sort by relevance and user preferences
    return mockRecommendations
      .filter(rec => {
        if (userType === 'Farmer' && preferredCategories.includes('farming')) return true;
        if (userType === 'Financial Institution' && rec.type === 'project') return true;
        if (userType === 'Crowdfunder' && (rec.type === 'project' || rec.type === 'profile')) return true;
        return rec.relevanceScore > 0.8;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }, [behaviorAnalysis]);

  // Generate connection suggestions
  const generateConnectionSuggestions = useCallback(async (): Promise<ConnectionSuggestion[]> => {
    const { userType, location, preferredCategories } = behaviorAnalysis;

    const mockConnections: ConnectionSuggestion[] = [
      {
        id: 'conn-1',
        name: 'Dr. Sarah Green',
        role: 'Agronomist',
        avatar: '/avatars/agronomist.jpg',
        compatibilityScore: 0.94,
        reasons: ['Expert in maize farming', 'Located in your region', 'High success rate with similar crops'],
        mutualConnections: 8
      },
      {
        id: 'conn-2',
        name: 'Kenya Farmers Co-op',
        role: 'Agricultural Cooperative',
        avatar: '/avatars/coop.jpg',
        compatibilityScore: 0.89,
        reasons: ['Focus on sustainable practices', 'Similar farm size', 'Active in your area'],
        mutualConnections: 15
      },
      {
        id: 'conn-3',
        name: 'Green Finance Ltd',
        role: 'Financial Institution',
        avatar: '/avatars/finance.jpg',
        compatibilityScore: 0.91,
        reasons: ['Specializes in agricultural loans', 'Competitive interest rates', 'Local presence'],
        mutualConnections: 3
      }
    ];

    return mockConnections
      .filter(conn => {
        if (userType === 'Farmer') return conn.role !== 'Financial Institution' || preferredCategories.includes('finance');
        if (userType === 'Financial Institution') return conn.role === 'Farmer' || conn.role === 'Cooperative';
        if (userType === 'Crowdfunder') return conn.role === 'Farmer' || conn.role === 'Cooperative';
        return true;
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 5);
  }, [behaviorAnalysis]);

  // Generate trending topics
  const generateTrendingTopics = useCallback(async (): Promise<TrendingTopic[]> => {
    const { preferredCategories, location } = behaviorAnalysis;

    const mockTrending: TrendingTopic[] = [
      {
        id: 'trend-1',
        name: '#ClimateSmartAgriculture',
        category: 'farming',
        growth: 156,
        postCount: 89,
        topContributors: ['AgriTech Expert', 'Sustainable Farmer', 'Climate Scientist']
      },
      {
        id: 'trend-2',
        name: '#SolarIrrigation',
        category: 'technology',
        growth: 89,
        postCount: 67,
        topContributors: ['Tech Innovator', 'Farm Engineer', 'Solar Expert']
      },
      {
        id: 'trend-3',
        name: '#FairTradeCoffee',
        category: 'market',
        growth: 124,
        postCount: 45,
        topContributors: ['Coffee Farmer', 'Export Manager', 'Quality Inspector']
      },
      {
        id: 'trend-4',
        name: '#RegenerativeFinance',
        category: 'finance',
        growth: 78,
        postCount: 34,
        topContributors: ['Impact Investor', 'Green Banker', 'Sustainability Expert']
      }
    ];

    return mockTrending
      .filter(topic => preferredCategories.includes(topic.category) || topic.category === 'general')
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 4);
  }, [behaviorAnalysis]);

  // Load recommendations on mount and when behavior changes
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const [contentRecs, connectionRecs, trending] = await Promise.all([
          generateContentRecommendations(),
          generateConnectionSuggestions(),
          generateTrendingTopics()
        ]);

        setRecommendations(contentRecs);
        setConnections(connectionRecs);
        setTrendingTopics(trending);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (profile?.id) {
      loadRecommendations();
    }
  }, [profile, generateContentRecommendations, generateConnectionSuggestions, generateTrendingTopics]);

  // Track user interactions
  const trackInteraction = useCallback((type: keyof UserBehavior, value: string) => {
    setUserBehavior(prev => ({
      ...prev,
      [type]: Array.isArray(prev[type])
        ? [...(prev[type] as string[]), value].slice(-50) // Keep last 50 interactions
        : prev[type]
    }));
  }, []);

  const trackTopicEngagement = useCallback((topic: string, timeSpent: number) => {
    setUserBehavior(prev => ({
      ...prev,
      timeSpentOnTopics: {
        ...prev.timeSpentOnTopics,
        [topic]: (prev.timeSpentOnTopics[topic] || 0) + timeSpent
      },
      interactionFrequency: {
        ...prev.interactionFrequency,
        [topic]: (prev.interactionFrequency[topic] || 0) + 1
      }
    }));
  }, []);

  return {
    recommendations,
    connections,
    trendingTopics,
    isLoading,
    behaviorAnalysis,
    trackInteraction,
    trackTopicEngagement,
    refreshRecommendations: () => {
      // Trigger re-calculation of recommendations
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
};