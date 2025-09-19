/**
 * Continuous Learning Hook - Provides adaptive dashboard functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import {
  ContinuousLearningService,
  UserBehaviorPattern,
  AdaptiveLayout,
  LearningModel,
  AdaptationEvent
} from '@/services/dashboard/ContinuousLearningService';

export interface UseContinuousLearningReturn {
  // Behavior tracking
  trackBehavior: (behaviorType: string, data: any, context?: any) => Promise<void>;

  // Pattern analysis
  userPatterns: UserBehaviorPattern[];
  getPatternInsights: (patternId: string) => string[];
  getPatternRecommendations: (patternId: string) => UserBehaviorPattern['recommendations'];

  // Adaptive layout
  adaptiveLayout: AdaptiveLayout | null;
  applyLayoutAdaptation: (recommendation: UserBehaviorPattern['recommendations'][0]) => Promise<void>;

  // Learning model
  learningModel: LearningModel | null;
  getPredictions: () => LearningModel['predictions'] | null;

  // Adaptation events
  adaptationEvents: AdaptationEvent[];
  getRecentAdaptations: (limit?: number) => AdaptationEvent[];

  // Loading states
  loading: {
    patterns: boolean;
    layout: boolean;
    model: boolean;
    adaptations: boolean;
  };
}

export const useContinuousLearning = (): UseContinuousLearningReturn => {
  const { user } = useAuth();
  const learningService = ContinuousLearningService.getInstance();

  const [userPatterns, setUserPatterns] = useState<UserBehaviorPattern[]>([]);
  const [adaptiveLayout, setAdaptiveLayout] = useState<AdaptiveLayout | null>(null);
  const [learningModel, setLearningModel] = useState<LearningModel | null>(null);
  const [adaptationEvents, setAdaptationEvents] = useState<AdaptationEvent[]>([]);
  const [loading, setLoading] = useState({
    patterns: false,
    layout: false,
    model: false,
    adaptations: false
  });

  // Track user behavior
  const trackBehavior = useCallback(async (
    behaviorType: string,
    data: any,
    context?: any
  ) => {
    if (!user?.id) return;

    try {
      await learningService.trackBehavior(user.id, behaviorType, data, context);

      // Refresh patterns after tracking
      await loadUserPatterns();
    } catch (error) {
      console.error('Failed to track behavior:', error);
    }
  }, [user?.id]);

  // Load user patterns
  const loadUserPatterns = useCallback(async () => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, patterns: true }));
    try {
      const patterns = learningService.getUserPatterns(user.id);
      setUserPatterns(patterns);
    } catch (error) {
      console.error('Failed to load user patterns:', error);
    } finally {
      setLoading(prev => ({ ...prev, patterns: false }));
    }
  }, [user?.id]);

  // Load adaptive layout
  const loadAdaptiveLayout = useCallback(async () => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, layout: true }));
    try {
      let layout = learningService.getAdaptiveLayout(user.id);

      if (!layout && user.role) {
        // Initialize layout if it doesn't exist
        layout = learningService.initializeAdaptiveLayout(user.id, user.role);
      }

      setAdaptiveLayout(layout || null);
    } catch (error) {
      console.error('Failed to load adaptive layout:', error);
    } finally {
      setLoading(prev => ({ ...prev, layout: false }));
    }
  }, [user?.id, user?.role]);

  // Load learning model
  const loadLearningModel = useCallback(async () => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, model: true }));
    try {
      const model = learningService.getLearningModel(user.id);
      setLearningModel(model || null);
    } catch (error) {
      console.error('Failed to load learning model:', error);
    } finally {
      setLoading(prev => ({ ...prev, model: false }));
    }
  }, [user?.id]);

  // Load adaptation events
  const loadAdaptationEvents = useCallback(async () => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, adaptations: true }));
    try {
      const events = learningService.getAdaptationEvents(user.id, 20);
      setAdaptationEvents(events);
    } catch (error) {
      console.error('Failed to load adaptation events:', error);
    } finally {
      setLoading(prev => ({ ...prev, adaptations: false }));
    }
  }, [user?.id]);

  // Get pattern insights
  const getPatternInsights = useCallback((patternId: string): string[] => {
    const pattern = userPatterns.find(p => p.patternId === patternId);
    return pattern?.insights || [];
  }, [userPatterns]);

  // Get pattern recommendations
  const getPatternRecommendations = useCallback((patternId: string) => {
    const pattern = userPatterns.find(p => p.patternId === patternId);
    return pattern?.recommendations || [];
  }, [userPatterns]);

  // Apply layout adaptation
  const applyLayoutAdaptation = useCallback(async (
    recommendation: UserBehaviorPattern['recommendations'][0]
  ) => {
    if (!user?.id) return;

    try {
      // Note: This method doesn't exist in the service yet, we'll implement it
      console.log('Layout adaptation requested:', recommendation);
      await loadAdaptiveLayout(); // Refresh layout
      await loadAdaptationEvents(); // Refresh events
    } catch (error) {
      console.error('Failed to apply layout adaptation:', error);
    }
  }, [user?.id, loadAdaptiveLayout, loadAdaptationEvents]);

  // Get predictions
  const getPredictions = useCallback(() => {
    return learningModel?.predictions || null;
  }, [learningModel]);

  // Get recent adaptations
  const getRecentAdaptations = useCallback((limit: number = 5) => {
    return adaptationEvents.slice(0, limit);
  }, [adaptationEvents]);

  // Set up event listener for real-time adaptations
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = learningService.onAdaptationEvent((event) => {
      if (event.userId === user.id) {
        // Refresh relevant data based on event type
        switch (event.type) {
          case 'layout_adaptation':
            loadAdaptiveLayout();
            break;
          case 'content_recommendation':
            loadLearningModel();
            break;
          case 'workflow_optimization':
            loadAdaptiveLayout();
            break;
        }

        // Add to events list
        setAdaptationEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20
      }
    });

    return unsubscribe;
  }, [user?.id, loadAdaptiveLayout, loadLearningModel]);

  // Initialize data
  useEffect(() => {
    if (user?.id) {
      loadUserPatterns();
      loadAdaptiveLayout();
      loadLearningModel();
      loadAdaptationEvents();
    }
  }, [user?.id, loadUserPatterns, loadAdaptiveLayout, loadLearningModel, loadAdaptationEvents]);

  return {
    trackBehavior,
    userPatterns,
    getPatternInsights,
    getPatternRecommendations,
    adaptiveLayout,
    applyLayoutAdaptation,
    learningModel,
    getPredictions,
    adaptationEvents,
    getRecentAdaptations,
    loading
  };
};

// Hook for automatic behavior tracking
export const useBehaviorTracking = () => {
  const { trackBehavior } = useContinuousLearning();

  const trackWidgetInteraction = useCallback(async (
    widgetId: string,
    action: 'view' | 'interact' | 'hide' | 'resize',
    duration?: number
  ) => {
    await trackBehavior(`widget_${action}`, {
      widgetId,
      duration,
      timestamp: new Date()
    });
  }, [trackBehavior]);

  const trackContentEngagement = useCallback(async (
    contentId: string,
    contentType: string,
    action: 'view' | 'like' | 'share' | 'ignore' | 'save',
    engagement: number // 0-1 scale
  ) => {
    await trackBehavior(`content_${action}`, {
      contentId,
      contentType,
      engagement,
      timestamp: new Date()
    });
  }, [trackBehavior]);

  const trackWorkflowAction = useCallback(async (
    workflowId: string,
    step: string,
    action: 'start' | 'complete' | 'skip' | 'error',
    timeSpent?: number
  ) => {
    await trackBehavior(`workflow_${action}`, {
      workflowId,
      step,
      timeSpent,
      timestamp: new Date()
    });
  }, [trackBehavior]);

  const trackTimeBasedAction = useCallback(async (
    action: string,
    timeSlot: 'morning' | 'afternoon' | 'evening' | 'night',
    dayOfWeek: number
  ) => {
    await trackBehavior(`time_${action}`, {
      timeSlot,
      dayOfWeek,
      timestamp: new Date()
    });
  }, [trackBehavior]);

  const trackFeatureUsage = useCallback(async (
    featureId: string,
    usage: 'first_use' | 'regular_use' | 'power_user' | 'unused',
    context?: any
  ) => {
    await trackBehavior(`feature_${usage}`, {
      featureId,
      context,
      timestamp: new Date()
    });
  }, [trackBehavior]);

  return {
    trackWidgetInteraction,
    trackContentEngagement,
    trackWorkflowAction,
    trackTimeBasedAction,
    trackFeatureUsage
  };
};

// Hook for adaptive UI components
export const useAdaptiveUI = () => {
  const { adaptiveLayout, loading } = useContinuousLearning();

  const getWidgetPriority = useCallback((widgetId: string): number => {
    if (!adaptiveLayout) return 0;

    const placement = adaptiveLayout.widgetPlacements.find(w => w.widgetId === widgetId);
    return placement?.priority || 0;
  }, [adaptiveLayout]);

  const shouldShowWidget = useCallback((widgetId: string): boolean => {
    if (!adaptiveLayout) return true;

    const placement = adaptiveLayout.widgetPlacements.find(w => w.widgetId === widgetId);
    if (!placement) return true;

    return placement.visibility !== 'hidden';
  }, [adaptiveLayout]);

  const getContentPreferences = useCallback(() => {
    return adaptiveLayout?.contentPreferences || {
      categories: [],
      sources: [],
      frequency: 'medium',
      timeSlots: []
    };
  }, [adaptiveLayout]);

  const getWorkflowOptimizations = useCallback((workflowId?: string) => {
    if (!adaptiveLayout) return [];

    if (workflowId) {
      return adaptiveLayout.workflowOptimizations.filter(w => w.workflowId === workflowId);
    }

    return adaptiveLayout.workflowOptimizations;
  }, [adaptiveLayout]);

  return {
    getWidgetPriority,
    shouldShowWidget,
    getContentPreferences,
    getWorkflowOptimizations,
    layout: adaptiveLayout,
    loading: loading.layout
  };
};