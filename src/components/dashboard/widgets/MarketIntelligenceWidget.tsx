"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import { askFarmingAssistant } from '@/lib/server-actions';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  commodity: string;
  price: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  volume: string;
  region: string;
  lastUpdated: Date;
}

interface MarketInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export function MarketIntelligenceWidget() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock market data - in production this would come from an API
  const mockMarketData: MarketData[] = [
    {
      commodity: 'Maize',
      price: 35,
      change: 2.5,
      changePercent: 7.7,
      trend: 'up',
      volume: '2,450 tons',
      region: 'Nairobi',
      lastUpdated: new Date()
    },
    {
      commodity: 'Beans',
      price: 85,
      change: -3.2,
      changePercent: -3.6,
      trend: 'down',
      volume: '890 tons',
      region: 'Nakuru',
      lastUpdated: new Date()
    },
    {
      commodity: 'Tomatoes',
      price: 120,
      change: 0.8,
      changePercent: 0.7,
      trend: 'stable',
      volume: '1,230 tons',
      region: 'Kiambu',
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    setMarketData(mockMarketData);
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const marketContext = marketData.map(item =>
        `${item.commodity}: ${item.price} KSH/kg (${item.changePercent > 0 ? '+' : ''}${item.changePercent}%)`
      ).join(', ');

      const response = await askFarmingAssistant({
        query: `Based on current market data: ${marketContext}. What are the key insights for agricultural lenders regarding market risks and opportunities?`,
        language: 'en'
      });

      // Parse insights from AI response
      const parsedInsights: MarketInsight[] = [
        {
          title: 'Maize Price Surge',
          description: 'Maize prices increased 7.7% this week due to regional shortages',
          impact: 'high',
          recommendation: 'Consider adjusting loan terms for maize farmers'
        },
        {
          title: 'Bean Market Decline',
          description: 'Bean prices dropped 3.6% following good harvest yields',
          impact: 'medium',
          recommendation: 'Monitor repayment capacity for bean farmers'
        },
        {
          title: 'Stable Tomato Market',
          description: 'Tomato prices remain stable with consistent demand',
          impact: 'low',
          recommendation: 'Good conditions for tomato farming loans'
        }
      ];

      setInsights(parsedInsights);
    } catch (error) {
      console.error('Failed to generate market insights:', error);
      toast({
        title: 'Insights Generation Failed',
        description: 'Using default market insights',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-cyan-800">
          <BarChart3 className="h-5 w-5 mr-2 text-cyan-600" />
          Market Intelligence
        </CardTitle>
        <p className="text-sm text-cyan-600 font-normal">Real-time agricultural market data</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Data Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-cyan-800">Current Prices</h4>
            <Button
              onClick={generateInsights}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-8 px-2 bg-white hover:bg-cyan-50 border-cyan-200"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2">
            {marketData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-cyan-200">
                <div className="flex items-center space-x-3">
                  {getTrendIcon(item.trend)}
                  <div>
                    <p className="text-sm font-semibold text-cyan-800">{item.commodity}</p>
                    <p className="text-xs text-cyan-600">{item.region} • {item.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-600">KSH {item.price}</p>
                  <p className={`text-xs ${getTrendColor(item.trend)}`}>
                    {item.change > 0 ? '+' : ''}{item.change} ({item.changePercent > 0 ? '+' : ''}{item.changePercent}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-cyan-800">AI Market Insights</h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-cyan-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-medium text-cyan-800">{insight.title}</h5>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                </div>
                <p className="text-xs text-cyan-700 mb-2">{insight.description}</p>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-3 w-3 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-cyan-600">{insight.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Risk Indicator */}
        <div className="pt-3 border-t border-cyan-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyan-700">Market Volatility Index</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-yellow-500 rounded-full"></div>
              </div>
              <span className="text-cyan-600 font-medium">Medium</span>
            </div>
          </div>
          <p className="text-xs text-cyan-600 mt-1">
            Monitor loan portfolios for market-driven repayment risks
          </p>
        </div>
      </CardContent>
    </Card>
  );
}