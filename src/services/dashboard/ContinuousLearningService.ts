/**
 * Continuous Learning and Adaptation Service
 * Analyzes user behavior patterns and adapts dashboard experience over time
 */

export interface UserBehaviorPattern {
  userId: string;
  patternId: string;
  type: 'usage' | 'preference' | 'performance' | 'social' | 'temporal';
  category: string;
  confidence: number;
  data: {
    frequency: number;
    duration: number;
    context: any;
    trends: Array<{
      timestamp: Date;
      value: number;
      context?: any;
    }>;
  };
  insights: string[];
  recommendations: Array<{
    type: 'layout' | 'content' | 'feature' | 'workflow';
    action: string;
    priority: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  lastUpdated: Date;
}

export interface AdaptiveLayout {
  userId: string;
  stakeholderType: string;
  layoutVersion: string;
  widgetPlacements: Array<{
    widgetId: string;
    position: { x: number; y: number; width: number; height: number };
    priority: number;
    visibility: 'always' | 'conditional' | 'hidden';
    conditions?: any;
  }>;
  contentPreferences: {
    categories: string[];
    sources: string[];
    frequency: 'low' | 'medium' | 'high';
    timeSlots: string[];
  };
  workflowOptimizations: Array<{
    workflowId: string;
    steps: string[];
    shortcuts: string[];
    automationRules: any[];
  }>;
  adaptationHistory: Array<{
    timestamp: Date;
    changeType: string;
    reason: string;
    impact: number;
  }>;
  lastAdapted: Date;
}

export interface LearningModel {
  userId: string;
  features: {
    usagePatterns: Map<string, number>;
    timePreferences: Map<string, number>;
    contentEngagement: Map<string, number>;
    socialInteractions: Map<string, number>;
    performanceMetrics: Map<string, number>;
  };
  predictions: {
    nextBestActions: string[];
    optimalTimeSlots: string[];
    preferredContent: string[];
    collaborationOpportunities: string[];
  };
  confidence: number;
  lastTrained: Date;
}

export interface AdaptationEvent {
  userId: string;
  type: 'layout_adaptation' | 'content_recommendation' | 'workflow_optimization' | 'feature_suggestion';
  data: any;
  timestamp: Date;
  impact: {
    userSatisfaction: number;
    efficiency: number;
    engagement: number;
  };
}

export class ContinuousLearningService {
  private static instance: ContinuousLearningService;
  private behaviorPatterns: Map<string, UserBehaviorPattern[]> = new Map();
  private adaptiveLayouts: Map<string, AdaptiveLayout> = new Map();
  private learningModels: Map<string, LearningModel> = new Map();
  private adaptationEvents: AdaptationEvent[] = [];
  private eventListeners: ((event: AdaptationEvent) => void)[] = [];

  private constructor() {
    this.initializeLearningSystem();
  }

  static getInstance(): ContinuousLearningService {
    if (!ContinuousLearningService.instance) {
      ContinuousLearningService.instance = new ContinuousLearningService();
    }
    return ContinuousLearningService.instance;
  }

  private initializeLearningSystem(): void {
    // Set up periodic learning and adaptation cycles
    setInterval(() => this.performLearningCycle(), 24 * 60 * 60 * 1000); // Daily
    setInterval(() => this.adaptLayouts(), 7 * 24 * 60 * 60 * 1000); // Weekly
  }

  // Track user behavior
  async trackBehavior(
    userId: string,
    behaviorType: string,
    data: any,
    context?: any
  ): Promise<void> {
    const patterns = this.behaviorPatterns.get(userId) || [];
    const existingPattern = patterns.find(p => p.patternId === behaviorType);

    if (existingPattern) {
      // Update existing pattern
      existingPattern.data.frequency += 1;
      existingPattern.data.trends.push({
        timestamp: new Date(),
        value: data.value || 1,
        context
      });

      // Keep only last 30 days of trends
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      existingPattern.data.trends = existingPattern.data.trends.filter(
        t => t.timestamp > thirtyDaysAgo
      );

      existingPattern.lastUpdated = new Date();
    } else {
      // Create new pattern
      const newPattern: UserBehaviorPattern = {
        userId,
        patternId: behaviorType,
        type: this.inferPatternType(behaviorType),
        category: this.categorizeBehavior(behaviorType),
        confidence: 0.1, // Start low
        data: {
          frequency: 1,
          duration: data.duration || 0,
          context,
          trends: [{
            timestamp: new Date(),
            value: data.value || 1,
            context
          }]
        },
        insights: [],
        recommendations: [],
        lastUpdated: new Date()
      };

      patterns.push(newPattern);
    }

    this.behaviorPatterns.set(userId, patterns);

    // Trigger real-time adaptation if needed
    await this.checkForImmediateAdaptations(userId, behaviorType, data);
  }

  private inferPatternType(behaviorType: string): UserBehaviorPattern['type'] {
    if (behaviorType.includes('time') || behaviorType.includes('schedule')) {
      return 'temporal';
    }
    if (behaviorType.includes('social') || behaviorType.includes('collaboration')) {
      return 'social';
    }
    if (behaviorType.includes('performance') || behaviorType.includes('efficiency')) {
      return 'performance';
    }
    if (behaviorType.includes('preference') || behaviorType.includes('favorite')) {
      return 'preference';
    }
    return 'usage';
  }

  private categorizeBehavior(behaviorType: string): string {
    if (behaviorType.includes('widget')) return 'interface';
    if (behaviorType.includes('content') || behaviorType.includes('feed')) return 'content';
    if (behaviorType.includes('task') || behaviorType.includes('workflow')) return 'productivity';
    if (behaviorType.includes('social') || behaviorType.includes('team')) return 'collaboration';
    if (behaviorType.includes('time') || behaviorType.includes('schedule')) return 'temporal';
    return 'general';
  }

  private async checkForImmediateAdaptations(
    userId: string,
    behaviorType: string,
    data: any
  ): Promise<void> {
    // Check for patterns that require immediate adaptation
    if (behaviorType === 'widget_hidden' && data.frequency > 3) {
      await this.adaptWidgetVisibility(userId, data.widgetId, false);
    }

    if (behaviorType === 'content_ignored' && data.frequency > 5) {
      await this.updateContentPreferences(userId, data.category, -1);
    }

    if (behaviorType === 'feature_unused' && data.daysSinceLastUse > 30) {
      await this.suggestFeatureRemoval(userId, data.featureId);
    }
  }

  // Learning cycle - analyze patterns and generate insights
  private async performLearningCycle(): Promise<void> {
    for (const [userId, patterns] of this.behaviorPatterns) {
      await this.analyzeUserPatterns(userId, patterns);
      await this.updateLearningModel(userId);
      await this.generateRecommendations(userId);
    }
  }

  private async analyzeUserPatterns(
    userId: string,
    patterns: UserBehaviorPattern[]
  ): Promise<void> {
    for (const pattern of patterns) {
      // Analyze trends
      const recentTrends = pattern.data.trends.filter(
        t => t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (recentTrends.length >= 3) {
        const trend = this.calculateTrend(recentTrends);
        pattern.confidence = Math.min(pattern.confidence + Math.abs(trend) * 0.1, 1.0);

        // Generate insights based on pattern analysis
        pattern.insights = this.generateInsights(pattern, trend);
      }
    }
  }

  private calculateTrend(trends: Array<{ timestamp: Date; value: number }>): number {
    if (trends.length < 2) return 0;

    const sortedTrends = trends.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstHalf = sortedTrends.slice(0, Math.floor(sortedTrends.length / 2));
    const secondHalf = sortedTrends.slice(Math.floor(sortedTrends.length / 2));

    const firstAvg = firstHalf.reduce((sum, t) => sum + t.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.value, 0) / secondHalf.length;

    return (secondAvg - firstAvg) / firstAvg; // Percentage change
  }

  private generateInsights(pattern: UserBehaviorPattern, trend: number): string[] {
    const insights: string[] = [];

    if (Math.abs(trend) > 0.2) {
      if (trend > 0) {
        insights.push(`${pattern.category} engagement is increasing by ${(trend * 100).toFixed(1)}%`);
      } else {
        insights.push(`${pattern.category} engagement is decreasing by ${Math.abs(trend * 100).toFixed(1)}%`);
      }
    }

    if (pattern.data.frequency > 10) {
      insights.push(`High frequency of ${pattern.category} interactions (${pattern.data.frequency} times)`);
    }

    if (pattern.confidence > 0.8) {
      insights.push(`Strong confidence in ${pattern.category} pattern (${(pattern.confidence * 100).toFixed(1)}%)`);
    }

    return insights;
  }

  private async updateLearningModel(userId: string): Promise<void> {
    const patterns = this.behaviorPatterns.get(userId) || [];
    const model: LearningModel = {
      userId,
      features: {
        usagePatterns: new Map(),
        timePreferences: new Map(),
        contentEngagement: new Map(),
        socialInteractions: new Map(),
        performanceMetrics: new Map()
      },
      predictions: {
        nextBestActions: [],
        optimalTimeSlots: [],
        preferredContent: [],
        collaborationOpportunities: []
      },
      confidence: 0,
      lastTrained: new Date()
    };

    // Extract features from patterns
    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'usage':
          model.features.usagePatterns.set(pattern.category, pattern.data.frequency);
          break;
        case 'temporal':
          model.features.timePreferences.set(pattern.category, pattern.data.frequency);
          break;
        case 'preference':
          model.features.contentEngagement.set(pattern.category, pattern.confidence);
          break;
        case 'social':
          model.features.socialInteractions.set(pattern.category, pattern.data.frequency);
          break;
        case 'performance':
          model.features.performanceMetrics.set(pattern.category, pattern.data.frequency);
          break;
      }
    }

    // Generate predictions
    model.predictions = this.generatePredictions(model);
    model.confidence = this.calculateModelConfidence(model);

    this.learningModels.set(userId, model);
  }

  private generatePredictions(model: LearningModel): LearningModel['predictions'] {
    const predictions: LearningModel['predictions'] = {
      nextBestActions: [],
      optimalTimeSlots: [],
      preferredContent: [],
      collaborationOpportunities: []
    };

    // Predict next best actions based on usage patterns
    const topUsageCategories = Array.from(model.features.usagePatterns.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    predictions.nextBestActions = topUsageCategories.map(([category]) => {
      switch (category) {
        case 'interface': return 'optimize_dashboard_layout';
        case 'content': return 'personalize_feed_content';
        case 'productivity': return 'suggest_workflow_automation';
        case 'collaboration': return 'recommend_team_connections';
        default: return 'explore_new_features';
      }
    });

    // Predict optimal time slots
    const timePatterns = Array.from(model.features.timePreferences.entries());
    if (timePatterns.length > 0) {
      predictions.optimalTimeSlots = ['morning', 'afternoon', 'evening']; // Simplified
    }

    // Predict preferred content
    const contentPreferences = Array.from(model.features.contentEngagement.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    predictions.preferredContent = contentPreferences.map(([category]) => category);

    // Predict collaboration opportunities
    const socialPatterns = Array.from(model.features.socialInteractions.entries());
    if (socialPatterns.length > 0) {
      predictions.collaborationOpportunities = ['join_similar_projects', 'connect_with_experts', 'participate_in_challenges'];
    }

    return predictions;
  }

  private calculateModelConfidence(model: LearningModel): number {
    const totalFeatures = Object.values(model.features).reduce(
      (sum, featureMap) => sum + featureMap.size,
      0
    );

    if (totalFeatures === 0) return 0;

    const averageConfidence = Object.values(model.features).reduce(
      (sum, featureMap) => {
        const values = Array.from(featureMap.values());
        return sum + (values.reduce((a, b) => a + b, 0) / values.length || 0);
      },
      0
    ) / Object.keys(model.features).length;

    return Math.min(averageConfidence / 10, 1); // Normalize to 0-1
  }

  private async generateRecommendations(userId: string): Promise<void> {
    const patterns = this.behaviorPatterns.get(userId) || [];
    const model = this.learningModels.get(userId);

    for (const pattern of patterns) {
      pattern.recommendations = [];

      // Generate recommendations based on pattern analysis
      if (pattern.confidence > 0.7) {
        switch (pattern.category) {
          case 'interface':
            if (pattern.data.frequency > 20) {
              pattern.recommendations.push({
                type: 'layout',
                action: 'prioritize_frequently_used_widgets',
                priority: 'high',
                reason: 'High usage indicates importance'
              });
            }
            break;

          case 'content':
            if (pattern.data.trends.length > 10) {
              pattern.recommendations.push({
                type: 'content',
                action: 'increase_similar_content_recommendations',
                priority: 'medium',
                reason: 'Consistent engagement with content type'
              });
            }
            break;

          case 'productivity':
            if (pattern.type === 'performance' && pattern.data.frequency > 15) {
              pattern.recommendations.push({
                type: 'workflow',
                action: 'suggest_automation_rules',
                priority: 'high',
                reason: 'Repetitive high-performance actions detected'
              });
            }
            break;
        }
      }

      // Add model-based recommendations
      if (model && model.confidence > 0.6) {
        pattern.recommendations.push(...model.predictions.nextBestActions.map(action => ({
          type: 'feature' as const,
          action,
          priority: 'medium' as const,
          reason: 'AI-powered prediction based on usage patterns'
        })));
      }
    }
  }

  // Layout adaptation
  private async adaptLayouts(): Promise<void> {
    for (const [userId, patterns] of this.behaviorPatterns) {
      const layout = this.adaptiveLayouts.get(userId);
      if (!layout) continue;

      const recommendations = patterns.flatMap(p => p.recommendations);
      const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high');

      if (highPriorityRecommendations.length > 0) {
        await this.applyLayoutAdaptations(userId, highPriorityRecommendations);
      }
    }
  }

  private async applyLayoutAdaptations(
    userId: string,
    recommendations: UserBehaviorPattern['recommendations']
  ): Promise<void> {
    const layout = this.adaptiveLayouts.get(userId);
    if (!layout) return;

    for (const recommendation of recommendations) {
      const adaptation: AdaptationEvent = {
        userId,
        type: 'layout_adaptation',
        data: { recommendation },
        timestamp: new Date(),
        impact: { userSatisfaction: 0, efficiency: 0, engagement: 0 }
      };

      switch (recommendation.type) {
        case 'layout':
          if (recommendation.action === 'prioritize_frequently_used_widgets') {
            // Reorder widgets based on usage frequency
            layout.widgetPlacements.sort((a, b) => b.priority - a.priority);
          }
          break;

        case 'content':
          if (recommendation.action === 'increase_similar_content_recommendations') {
            layout.contentPreferences.frequency = 'high';
          }
          break;

        case 'workflow':
          if (recommendation.action === 'suggest_automation_rules') {
            // Add automation suggestions to workflow optimizations
            layout.workflowOptimizations.push({
              workflowId: `auto_${Date.now()}`,
              steps: ['analyze', 'optimize', 'automate'],
              shortcuts: [],
              automationRules: []
            });
          }
          break;
      }

      layout.adaptationHistory.push({
        timestamp: new Date(),
        changeType: recommendation.type,
        reason: recommendation.reason,
        impact: 0 // To be measured post-adaptation
      });

      layout.lastAdapted = new Date();

      // Emit adaptation event
      this.emitEvent(adaptation);
    }

    this.adaptiveLayouts.set(userId, layout);
  }

  // Utility methods
  private async adaptWidgetVisibility(userId: string, widgetId: string, visible: boolean): Promise<void> {
    const layout = this.adaptiveLayouts.get(userId);
    if (layout) {
      const widget = layout.widgetPlacements.find(w => w.widgetId === widgetId);
      if (widget) {
        widget.visibility = visible ? 'always' : 'hidden';
      }
    }
  }

  private async updateContentPreferences(userId: string, category: string, adjustment: number): Promise<void> {
    const layout = this.adaptiveLayouts.get(userId);
    if (layout) {
      const index = layout.contentPreferences.categories.indexOf(category);
      if (adjustment > 0 && index === -1) {
        layout.contentPreferences.categories.push(category);
      } else if (adjustment < 0 && index !== -1) {
        layout.contentPreferences.categories.splice(index, 1);
      }
    }
  }

  private async suggestFeatureRemoval(userId: string, featureId: string): Promise<void> {
    // Emit event to suggest feature removal
    this.emitEvent({
      userId,
      type: 'feature_suggestion',
      data: { featureId, action: 'remove', reason: 'low_usage' },
      timestamp: new Date(),
      impact: { userSatisfaction: 0, efficiency: 0, engagement: 0 }
    });
  }

  // Event system
  onAdaptationEvent(callback: (event: AdaptationEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(event: AdaptationEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Getters
  getUserPatterns(userId: string): UserBehaviorPattern[] {
    return this.behaviorPatterns.get(userId) || [];
  }

  getAdaptiveLayout(userId: string): AdaptiveLayout | undefined {
    return this.adaptiveLayouts.get(userId);
  }

  getLearningModel(userId: string): LearningModel | undefined {
    return this.learningModels.get(userId);
  }

  getAdaptationEvents(userId: string, limit: number = 10): AdaptationEvent[] {
    return this.adaptationEvents
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Initialize adaptive layout for user
  initializeAdaptiveLayout(userId: string, stakeholderType: string): AdaptiveLayout {
    const layout: AdaptiveLayout = {
      userId,
      stakeholderType,
      layoutVersion: '1.0',
      widgetPlacements: [],
      contentPreferences: {
        categories: [],
        sources: [],
        frequency: 'medium',
        timeSlots: []
      },
      workflowOptimizations: [],
      adaptationHistory: [],
      lastAdapted: new Date()
    };

    this.adaptiveLayouts.set(userId, layout);
    return layout;
  }
}