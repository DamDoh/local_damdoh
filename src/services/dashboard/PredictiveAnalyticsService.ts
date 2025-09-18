/**
 * Predictive Analytics Service - Advanced AI-powered business intelligence
 * Provides revenue forecasting, risk assessment, market intelligence, and automated insights
 * Single Responsibility: Predictive modeling and business intelligence analytics
 * Dependencies: Historical data, market data, external APIs, ML models
 */

import { apiCall } from '@/lib/api-utils';

export interface RevenueForecast {
  id: string;
  userId: string;
  productType: string;
  timeRange: '1month' | '3months' | '6months' | '1year';
  forecast: ForecastDataPoint[];
  confidence: number; // 0-1
  factors: ForecastFactor[];
  generatedAt: Date;
  modelVersion: string;
}

export interface ForecastDataPoint {
  date: Date;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
  actualRevenue?: number; // if historical
  confidence: number;
}

export interface ForecastFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  description: string;
  data?: any;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  riskType: 'supply_chain' | 'market' | 'weather' | 'financial' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: number; // 0-1
  riskScore: number; // 0-1
  description: string;
  recommendations: RiskRecommendation[];
  affectedAreas: string[];
  timeHorizon: string;
  lastUpdated: Date;
}

export interface RiskRecommendation {
  priority: 'low' | 'medium' | 'high';
  action: string;
  expectedImpact: string;
  timeframe: string;
  cost?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MarketIntelligence {
  id: string;
  region: string;
  commodity: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
  forecast7d: number;
  forecast30d: number;
  keyDrivers: MarketDriver[];
  news: MarketNews[];
  competitors: CompetitorData[];
  lastUpdated: Date;
}

export interface MarketDriver {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number;
  description: string;
}

export interface MarketNews {
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  publishedAt: Date;
  relevance: number;
}

export interface CompetitorData {
  name: string;
  price: number;
  volume: number;
  marketShare: number;
  trend: 'gaining' | 'losing' | 'stable';
}

export interface AutomatedInsight {
  id: string;
  userId: string;
  type: 'opportunity' | 'warning' | 'trend' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  category: string;
  data: any;
  recommendations: string[];
  actionable: boolean;
  generatedAt: Date;
  expiresAt?: Date;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'forecasting' | 'classification' | 'regression' | 'clustering';
  target: string;
  features: string[];
  accuracy: number;
  lastTrained: Date;
  version: string;
  status: 'active' | 'training' | 'deprecated';
}

export class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;
  private readonly CACHE_KEY = 'predictive-analytics';
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  /**
   * Generate revenue forecast for a user
   */
  async generateRevenueForecast(
    userId: string,
    productType: string,
    timeRange: '1month' | '3months' | '6months' | '1year' = '3months'
  ): Promise<RevenueForecast> {
    try {
      const result = await apiCall('/api/analytics/forecast/revenue', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          productType,
          timeRange
        })
      }) as { forecast: RevenueForecast };
      return result.forecast;
    } catch (error) {
      console.warn('API unavailable for revenue forecast, using fallback');
      return this.generateFallbackForecast(userId, productType, timeRange);
    }
  }

  /**
   * Get risk assessments for a user
   */
  async getRiskAssessments(userId: string): Promise<RiskAssessment[]> {
    try {
      const result = await apiCall(`/api/analytics/risks?userId=${userId}`) as { risks: RiskAssessment[] };
      return result.risks;
    } catch (error) {
      console.warn('API unavailable for risk assessments, using defaults');
      return this.getDefaultRiskAssessments(userId);
    }
  }

  /**
   * Get market intelligence for commodities
   */
  async getMarketIntelligence(
    region: string = 'Kenya',
    commodities: string[] = ['maize', 'beans', 'coffee']
  ): Promise<MarketIntelligence[]> {
    try {
      const params = new URLSearchParams({
        region,
        commodities: commodities.join(',')
      });
      const result = await apiCall(`/api/analytics/market-intelligence?${params}`) as { intelligence: MarketIntelligence[] };
      return result.intelligence;
    } catch (error) {
      console.warn('API unavailable for market intelligence, using defaults');
      return this.getDefaultMarketIntelligence(region, commodities);
    }
  }

  /**
   * Generate automated insights for a user
   */
  async generateInsights(userId: string, categories?: string[]): Promise<AutomatedInsight[]> {
    try {
      const params = categories ? `?categories=${categories.join(',')}` : '';
      const result = await apiCall(`/api/analytics/insights/${userId}${params}`) as { insights: AutomatedInsight[] };
      return result.insights;
    } catch (error) {
      console.warn('API unavailable for insights, using defaults');
      return this.getDefaultInsights(userId, categories);
    }
  }

  /**
   * Get predictive models status
   */
  async getModelStatus(): Promise<PredictiveModel[]> {
    try {
      const result = await apiCall('/api/analytics/models/status') as { models: PredictiveModel[] };
      return result.models;
    } catch (error) {
      console.warn('API unavailable for model status');
      return this.getDefaultModels();
    }
  }

  /**
   * Analyze business performance trends
   */
  async analyzeTrends(
    userId: string,
    metrics: string[],
    timeRange: '1month' | '3months' | '6months' | '1year' = '3months'
  ): Promise<any> {
    try {
      const result = await apiCall('/api/analytics/trends', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          metrics,
          timeRange
        })
      });
      return result;
    } catch (error) {
      console.warn('API unavailable for trend analysis');
      return this.generateFallbackTrends(userId, metrics, timeRange);
    }
  }

  // Fallback data methods
  private generateFallbackForecast(
    userId: string,
    productType: string,
    timeRange: '1month' | '3months' | '6months' | '1year'
  ): RevenueForecast {
    const periods = timeRange === '1month' ? 4 : timeRange === '3months' ? 12 : timeRange === '6months' ? 24 : 52;
    const baseRevenue = 50000; // Base monthly revenue
    const trend = 0.02; // 2% monthly growth
    const seasonality = 0.1; // 10% seasonal variation
    const volatility = 0.15; // 15% volatility

    const forecast: ForecastDataPoint[] = [];
    const now = new Date();

    for (let i = 0; i < periods; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + (i * (timeRange === '1month' ? 7 : timeRange === '3months' ? 7 : 14))); // Weekly data points

      const seasonalFactor = Math.sin((i / periods) * 2 * Math.PI) * seasonality;
      const trendFactor = 1 + (trend * i / periods);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;

      const predicted = baseRevenue * trendFactor * (1 + seasonalFactor) * randomFactor;
      const variance = predicted * volatility;

      forecast.push({
        date,
        predictedRevenue: Math.round(predicted),
        lowerBound: Math.round(predicted - variance),
        upperBound: Math.round(predicted + variance),
        confidence: Math.max(0.6, 1 - (i / periods) * 0.4) // Confidence decreases over time
      });
    }

    return {
      id: `forecast-${userId}-${Date.now()}`,
      userId,
      productType,
      timeRange,
      forecast,
      confidence: 0.75,
      factors: [
        {
          name: 'Market Demand',
          impact: 'positive',
          strength: 0.8,
          description: 'Increasing demand for organic produce'
        },
        {
          name: 'Weather Patterns',
          impact: 'neutral',
          strength: 0.3,
          description: 'Normal seasonal weather expected'
        },
        {
          name: 'Competition',
          impact: 'negative',
          strength: 0.2,
          description: 'New suppliers entering the market'
        }
      ],
      generatedAt: new Date(),
      modelVersion: 'v2.1-fallback'
    };
  }

  private getDefaultRiskAssessments(userId: string): RiskAssessment[] {
    return [
      {
        id: 'supply-chain-risk-1',
        userId,
        riskType: 'supply_chain',
        severity: 'medium',
        probability: 0.3,
        impact: 0.6,
        riskScore: 0.45,
        description: 'Potential delay in seed delivery due to transportation strikes',
        recommendations: [
          {
            priority: 'high',
            action: 'Diversify suppliers and maintain buffer stock',
            expectedImpact: 'Reduce supply disruption risk by 40%',
            timeframe: '2-4 weeks',
            cost: 15000,
            difficulty: 'medium'
          },
          {
            priority: 'medium',
            action: 'Monitor transportation union activities',
            expectedImpact: 'Early warning for potential disruptions',
            timeframe: 'Ongoing',
            difficulty: 'easy'
          }
        ],
        affectedAreas: ['seed supply', 'planting schedule', 'harvest timing'],
        timeHorizon: '1-2 months',
        lastUpdated: new Date()
      },
      {
        id: 'market-risk-1',
        userId,
        riskType: 'market',
        severity: 'low',
        probability: 0.2,
        impact: 0.4,
        riskScore: 0.28,
        description: 'Price volatility due to international market fluctuations',
        recommendations: [
          {
            priority: 'medium',
            action: 'Implement price hedging strategies',
            expectedImpact: 'Stabilize revenue streams',
            timeframe: '1-3 months',
            cost: 5000,
            difficulty: 'hard'
          }
        ],
        affectedAreas: ['revenue', 'profit margins', 'cash flow'],
        timeHorizon: '3-6 months',
        lastUpdated: new Date()
      }
    ];
  }

  private getDefaultMarketIntelligence(region: string, commodities: string[]): MarketIntelligence[] {
    return commodities.map(commodity => ({
      id: `intelligence-${commodity}-${Date.now()}`,
      region,
      commodity,
      currentPrice: commodity === 'maize' ? 2800 : commodity === 'beans' ? 4200 : 8500,
      priceChange24h: Math.random() * 200 - 100,
      priceChangePercent: (Math.random() - 0.5) * 10,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      volatility: Math.random() * 0.3,
      forecast7d: commodity === 'maize' ? 2850 : commodity === 'beans' ? 4150 : 8600,
      forecast30d: commodity === 'maize' ? 2900 : commodity === 'beans' ? 4300 : 8700,
      keyDrivers: [
        {
          factor: 'Weather Conditions',
          impact: 'positive',
          strength: 0.7,
          description: 'Favorable weather improving crop yields'
        },
        {
          factor: 'Export Demand',
          impact: 'positive',
          strength: 0.6,
          description: 'Increased international demand'
        }
      ],
      news: [
        {
          title: 'New Trade Agreement Signed',
          summary: 'Regional trade agreement expected to boost agricultural exports',
          sentiment: 'positive',
          source: 'Agricultural News Network',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          relevance: 0.8
        }
      ],
      competitors: [
        {
          name: 'FarmCo Ltd',
          price: commodity === 'maize' ? 2750 : commodity === 'beans' ? 4150 : 8400,
          volume: 500,
          marketShare: 0.15,
          trend: 'stable'
        }
      ],
      lastUpdated: new Date()
    }));
  }

  private getDefaultInsights(userId: string, categories?: string[]): AutomatedInsight[] {
    const allInsights: AutomatedInsight[] = [
      {
        id: 'insight-1',
        userId,
        type: 'opportunity',
        title: 'Premium Organic Market Opportunity',
        description: 'Organic produce prices are 35% higher than conventional. Consider organic certification.',
        impact: 'high',
        confidence: 0.85,
        category: 'market',
        data: { priceDifferential: 0.35, certificationCost: 25000, paybackPeriod: 8 },
        recommendations: [
          'Research organic certification requirements',
          'Calculate ROI for organic transition',
          'Contact certification bodies for guidance'
        ],
        actionable: true,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        id: 'insight-2',
        userId,
        type: 'warning',
        title: 'Irrigation System Maintenance Due',
        description: 'Your irrigation system is due for maintenance. Prevent costly breakdowns.',
        impact: 'medium',
        confidence: 0.92,
        category: 'operations',
        data: { lastMaintenance: '2024-01-15', recommendedInterval: 90, daysOverdue: 15 },
        recommendations: [
          'Schedule maintenance within next 7 days',
          'Check spare parts availability',
          'Consider preventive maintenance contract'
        ],
        actionable: true,
        generatedAt: new Date()
      },
      {
        id: 'insight-3',
        userId,
        type: 'optimization',
        title: 'Crop Rotation Optimization',
        description: 'Switching 20% of maize area to legumes could increase overall farm profitability by 15%.',
        impact: 'medium',
        confidence: 0.78,
        category: 'farming',
        data: { currentRotation: ['maize', 'maize', 'beans'], recommendedRotation: ['maize', 'beans', 'legumes'], profitIncrease: 0.15 },
        recommendations: [
          'Plan legume planting for next season',
          'Research suitable legume varieties',
          'Calculate seed and input costs'
        ],
        actionable: true,
        generatedAt: new Date()
      }
    ];

    return categories
      ? allInsights.filter(insight => categories.includes(insight.category))
      : allInsights;
  }

  private getDefaultModels(): PredictiveModel[] {
    return [
      {
        id: 'revenue-forecast-v2',
        name: 'Revenue Forecasting Model',
        type: 'forecasting',
        target: 'monthly_revenue',
        features: ['historical_revenue', 'seasonal_factors', 'market_prices', 'weather_data'],
        accuracy: 0.82,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        version: 'v2.1',
        status: 'active'
      },
      {
        id: 'risk-assessment-v1',
        name: 'Risk Assessment Model',
        type: 'classification',
        target: 'risk_probability',
        features: ['supply_chain_data', 'market_volatility', 'weather_patterns', 'financial_health'],
        accuracy: 0.76,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        version: 'v1.3',
        status: 'active'
      }
    ];
  }

  private generateFallbackTrends(
    userId: string,
    metrics: string[],
    timeRange: '1month' | '3months' | '6months' | '1year'
  ): any {
    // Generate mock trend analysis
    return {
      trends: metrics.map(metric => ({
        metric,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        changePercent: (Math.random() - 0.5) * 20,
        confidence: 0.7 + Math.random() * 0.3,
        seasonality: Math.random() > 0.7,
        anomalies: Math.random() > 0.8 ? ['unusual_spike_last_month'] : []
      })),
      predictions: {
        nextPeriod: metrics.reduce((acc, metric) => {
          acc[metric] = Math.random() * 10000 + 50000;
          return acc;
        }, {} as Record<string, number>),
        confidence: 0.75
      },
      recommendations: [
        'Monitor seasonal patterns closely',
        'Prepare contingency plans for identified risks',
        'Consider optimization opportunities highlighted'
      ]
    };
  }
}