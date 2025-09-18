/**
 * Predictive Analytics Widget - AI-powered business intelligence dashboard
 * Displays revenue forecasts, risk assessments, market intelligence, and automated insights
 * Single Responsibility: Predictive analytics visualization and interaction
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  DollarSign, Shield, Eye, RefreshCw, Target,
  Lightbulb, Zap, ChevronRight, Activity
} from 'lucide-react';
import { PredictiveAnalyticsService, RevenueForecast, RiskAssessment, MarketIntelligence, AutomatedInsight } from "@/services/dashboard/PredictiveAnalyticsService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface PredictiveAnalyticsWidgetProps {
  defaultTab?: 'forecast' | 'risks' | 'market' | 'insights';
  compact?: boolean;
}

export const PredictiveAnalyticsWidget: React.FC<PredictiveAnalyticsWidgetProps> = ({
  defaultTab = 'forecast',
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [marketData, setMarketData] = useState<MarketIntelligence[]>([]);
  const [insights, setInsights] = useState<AutomatedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1month' | '3months' | '6months' | '1year'>('3months');
  const [selectedCommodity, setSelectedCommodity] = useState('maize');

  const { user } = useAuth();
  const { toast } = useToast();
  const analyticsService = PredictiveAnalyticsService.getInstance();

  const loadData = async (showRefreshIndicator = false) => {
    if (!user?.id) return;

    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [
        forecastData,
        risksData,
        marketDataResult,
        insightsData
      ] = await Promise.all([
        analyticsService.generateRevenueForecast(user.id, 'all', selectedTimeRange),
        analyticsService.getRiskAssessments(user.id),
        analyticsService.getMarketIntelligence('Kenya', [selectedCommodity]),
        analyticsService.generateInsights(user.id)
      ]);

      setForecast(forecastData);
      setRisks(risksData);
      setMarketData(marketDataResult);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading predictive analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load predictive analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, selectedTimeRange, selectedCommodity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Lightbulb className="h-4 w-4 text-green-500" />;
      default: return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-blue-800">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600 animate-pulse" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
    const topInsight = insights.find(i => i.impact === 'high' || i.impact === 'critical');

    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">
            {forecast ? `${formatCurrency(forecast.forecast[0]?.predictedRevenue || 0)} forecast` : 'Analytics Ready'}
          </div>
          <div className="text-xs text-blue-700">
            {highRisks.length > 0 ? `${highRisks.length} high risks` : 'Low risk profile'}
            {topInsight && ' • New insights available'}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-blue-800">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Predictive Analytics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-blue-600">
          AI-powered insights for smarter business decisions
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forecast" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Forecast</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Risks</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            {forecast && (
              <>
                {/* Time Range Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">Time Range:</span>
                  <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Forecast Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Next Period Forecast</div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatCurrency(forecast.forecast[0]?.predictedRevenue || 0)}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      Confidence: {Math.round(forecast.confidence * 100)}%
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Trend</div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">+12.5%</span>
                    </div>
                    <div className="text-xs text-blue-500 mt-1">vs last period</div>
                  </div>
                </div>

                {/* Key Factors */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Key Influencing Factors</h4>
                  <div className="space-y-2">
                    {forecast.factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                        <span className="text-sm text-blue-900">{factor.name}</span>
                        <Badge
                          className={`text-xs ${
                            factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                            factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {factor.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {risks.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-blue-600 text-sm">No significant risks detected</p>
                <p className="text-blue-500 text-xs mt-1">Your business operations look healthy!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.slice(0, 3).map((risk) => (
                  <div key={risk.id} className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{risk.riskType.replace('_', ' ').toUpperCase()}</h4>
                          <Badge className={`text-xs ${getSeverityColor(risk.severity)}`}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Probability: {Math.round(risk.probability * 100)}%</span>
                          <span>Impact: {Math.round(risk.impact * 100)}%</span>
                          <span>Risk Score: {Math.round(risk.riskScore * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Recommendations:</div>
                      {risk.recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <span className="text-gray-900">{rec.action}</span>
                            <div className="text-gray-500 mt-1">
                              Expected impact: {rec.expectedImpact} • {rec.timeframe}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            {/* Commodity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-700">Commodity:</span>
              <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="beans">Beans</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="tea">Tea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {marketData.map((market) => (
              <div key={market.id} className="space-y-4">
                {/* Price Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Current Price</div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatCurrency(market.currentPrice)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      market.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {market.priceChangePercent >= 0 ? '+' : ''}{market.priceChangePercent.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">7-Day Forecast</div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatCurrency(market.forecast7d)}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      {market.trend === 'up' ? '↗️ Rising' : market.trend === 'down' ? '↘️ Falling' : '➡️ Stable'}
                    </div>
                  </div>
                </div>

                {/* Key Drivers */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Market Drivers</h4>
                  <div className="space-y-2">
                    {market.keyDrivers.slice(0, 2).map((driver, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                        <span className="text-sm text-blue-900">{driver.factor}</span>
                        <Badge
                          className={`text-xs ${
                            driver.impact === 'positive' ? 'bg-green-100 text-green-800' :
                            driver.impact === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {driver.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-600 text-sm">No new insights available</p>
                <p className="text-blue-500 text-xs mt-1">Check back later for AI-generated recommendations!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      {getImpactIcon(insight.impact)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getSeverityColor(insight.impact === 'critical' ? 'critical' : insight.impact === 'high' ? 'high' : 'medium')}`}>
                            {insight.impact}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-700">Recommendations:</div>
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                            <span className="text-gray-900">{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};