/**
 * Enhanced Buyer Widgets - Immersive procurement and market intelligence components
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Target, Zap, Globe } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useGamification } from '@/hooks/useGamification';

interface MarketData {
  commodity: string;
  currentPrice: number;
  priceChange: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  volume: number;
  forecast: {
    shortTerm: number;
    longTerm: number;
    confidence: number;
  };
}

interface ProcurementOpportunity {
  id: string;
  title: string;
  supplier: string;
  commodity: string;
  quantity: number;
  unit: string;
  price: number;
  quality: 'premium' | 'standard' | 'basic';
  location: string;
  distance: number;
  expiresIn: number; // hours
  matchScore: number;
}

// Live Market Pulse Widget
export const LiveMarketPulseWidget: React.FC = () => {
  const { theme } = useTheme();
  const { trackAction } = useGamification();
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      commodity: 'Corn',
      currentPrice: 185.50,
      priceChange: 2.30,
      changePercent: 1.25,
      trend: 'up',
      volume: 125000,
      forecast: { shortTerm: 188.00, longTerm: 192.00, confidence: 78 }
    },
    {
      commodity: 'Soybeans',
      currentPrice: 445.75,
      priceChange: -1.25,
      changePercent: -0.28,
      trend: 'down',
      volume: 89000,
      forecast: { shortTerm: 442.00, longTerm: 448.00, confidence: 82 }
    },
    {
      commodity: 'Wheat',
      currentPrice: 212.30,
      priceChange: 0.80,
      changePercent: 0.38,
      trend: 'up',
      volume: 67500,
      forecast: { shortTerm: 215.00, longTerm: 218.00, confidence: 71 }
    }
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        currentPrice: item.currentPrice + (Math.random() - 0.5) * 2,
        priceChange: item.priceChange + (Math.random() - 0.5) * 0.5,
        changePercent: ((item.priceChange + (Math.random() - 0.5) * 0.5) / item.currentPrice) * 100
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <BarChart3 className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Live Market Pulse
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Real-time commodity prices and market intelligence
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {marketData.map((item, index) => (
            <div key={index} className="p-3 rounded-lg border transition-all hover:shadow-md" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {item.commodity}
                </span>
                <div className="flex items-center">
                  {item.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  ) : item.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                  ) : (
                    <div className="h-4 w-4 mr-1 rounded-full bg-gray-400"></div>
                  )}
                  <span className={`text-sm font-medium ${
                    item.changePercent > 0 ? 'text-green-600' :
                    item.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                    ${item.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    Volume: {item.volume.toLocaleString()} tons
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    Forecast (7d)
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    ${item.forecast.shortTerm.toFixed(2)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    {item.forecast.confidence}% confidence
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-textSecondary)' }}>Market Sentiment:</span>
            <span className="font-medium text-green-600">Bullish 📈</span>
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--color-textSecondary)' }}>
            Based on recent trading volume and price movements
          </div>
        </div>
      </div>
    </div>
  );
};

// Procurement Intelligence Hub Widget
export const ProcurementIntelligenceWidget: React.FC = () => {
  const { theme } = useTheme();
  const { trackAction } = useGamification();
  const [opportunities, setOpportunities] = useState<ProcurementOpportunity[]>([
    {
      id: 'opp-1',
      title: 'Premium Organic Corn',
      supplier: 'Green Valley Farms',
      commodity: 'Corn',
      quantity: 500,
      unit: 'tons',
      price: 195.00,
      quality: 'premium',
      location: 'Iowa, USA',
      distance: 1250,
      expiresIn: 24,
      matchScore: 95
    },
    {
      id: 'opp-2',
      title: 'Grade A Soybeans',
      supplier: 'Midwest AgriCorp',
      commodity: 'Soybeans',
      quantity: 750,
      unit: 'tons',
      price: 455.00,
      quality: 'standard',
      location: 'Illinois, USA',
      distance: 980,
      expiresIn: 48,
      matchScore: 87
    },
    {
      id: 'opp-3',
      title: 'Non-GMO Wheat',
      supplier: 'Prairie Gold Mills',
      commodity: 'Wheat',
      quantity: 300,
      unit: 'tons',
      price: 225.00,
      quality: 'premium',
      location: 'Kansas, USA',
      distance: 1450,
      expiresIn: 12,
      matchScore: 92
    }
  ]);

  const handleOpportunityClick = (opportunity: ProcurementOpportunity) => {
    trackAction('procurement_opportunity_viewed', {
      opportunityId: opportunity.id,
      commodity: opportunity.commodity
    });
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'var(--color-success)';
      case 'standard': return 'var(--color-primary)';
      case 'basic': return 'var(--color-textSecondary)';
      default: return 'var(--color-textSecondary)';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <Target className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Procurement Intelligence
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          AI-matched procurement opportunities
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              onClick={() => handleOpportunityClick(opp)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {opp.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {opp.supplier} • {opp.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    ${opp.price}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    per {opp.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span style={{ color: 'var(--color-textSecondary)' }}>
                    {opp.quantity} {opp.unit}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: getQualityColor(opp.quality),
                      color: 'white'
                    }}
                  >
                    {opp.quality}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    {opp.distance}km away
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      opp.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                      opp.matchScore >= 80 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {opp.matchScore}% match
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span style={{ color: 'var(--color-textSecondary)' }}>
                  Expires in {opp.expiresIn} hours
                </span>
                <button
                  className="px-3 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    trackAction('procurement_inquiry_sent', { opportunityId: opp.id });
                  }}
                >
                  Inquire Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Smart Procurement AI
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                Matching you with optimal suppliers
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                94%
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                Match accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Supply Chain Globe Widget
export const SupplyChainGlobeWidget: React.FC = () => {
  const { theme } = useTheme();

  // Mock global supply chain data
  const supplyChainData = {
    regions: [
      { name: 'North America', suppliers: 245, risk: 'low', color: 'var(--color-success)' },
      { name: 'South America', suppliers: 189, risk: 'medium', color: 'var(--color-warning)' },
      { name: 'Europe', suppliers: 156, risk: 'low', color: 'var(--color-success)' },
      { name: 'Asia', suppliers: 298, risk: 'high', color: 'var(--color-error)' },
      { name: 'Africa', suppliers: 134, risk: 'medium', color: 'var(--color-warning)' }
    ],
    activeShipments: 47,
    delayedShipments: 3,
    totalValue: 2850000
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <Globe className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Supply Chain Globe
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Global supplier network and risk monitoring
        </p>
      </div>

      <div className="p-4">
        {/* Globe visualization placeholder */}
        <div className="mb-4 h-48 rounded-lg flex items-center justify-center" style={{
          backgroundColor: 'var(--color-background)',
          border: `2px dashed var(--color-border)`
        }}>
          <div className="text-center">
            <Globe className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--color-textSecondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Interactive 3D Globe View
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              (Coming in Phase 3)
            </div>
          </div>
        </div>

        {/* Regional breakdown */}
        <div className="mb-4">
          <h4 className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>Regional Overview</h4>
          <div className="space-y-2">
            {supplyChainData.regions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded" style={{
                backgroundColor: 'var(--color-surface)'
              }}>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {region.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {region.suppliers}
                  </div>
                  <div className="text-xs capitalize" style={{
                    color: region.risk === 'low' ? 'var(--color-success)' :
                           region.risk === 'medium' ? 'var(--color-warning)' :
                           'var(--color-error)'
                  }}>
                    {region.risk} risk
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
              {supplyChainData.activeShipments}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Active Shipments
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--color-warning)' }}>
              {supplyChainData.delayedShipments}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Delayed
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
              ${(supplyChainData.totalValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Total Value
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Procurement Performance Widget
export const ProcurementPerformanceWidget: React.FC = () => {
  const { theme } = useTheme();
  const { trackAction } = useGamification();

  const performanceData = {
    thisMonth: {
      purchases: 1250, // tons
      value: 485000, // USD
      suppliers: 23,
      avgQuality: 8.7,
      onTimeDelivery: 94
    },
    targets: {
      purchases: 1500,
      value: 500000,
      suppliers: 25,
      avgQuality: 9.0,
      onTimeDelivery: 95
    },
    trends: {
      purchases: 12, // % increase
      value: 8, // % increase
      suppliers: -5, // % decrease
      avgQuality: 3, // % increase
      onTimeDelivery: 2 // % increase
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'var(--color-success)';
    if (percentage >= 75) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <Zap className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Procurement Performance
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Track your procurement goals and achievements
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {performanceData.thisMonth.purchases.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Tons Purchased
            </div>
            <div className="text-xs mt-1" style={{
              color: performanceData.trends.purchases > 0 ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {performanceData.trends.purchases > 0 ? '+' : ''}{performanceData.trends.purchases}% vs last month
            </div>
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              ${performanceData.thisMonth.value.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
              Total Value
            </div>
            <div className="text-xs mt-1" style={{
              color: performanceData.trends.value > 0 ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {performanceData.trends.value > 0 ? '+' : ''}{performanceData.trends.value}% vs last month
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--color-text)' }}>Purchase Target</span>
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {performanceData.thisMonth.purchases}/{performanceData.targets.purchases}t
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((performanceData.thisMonth.purchases / performanceData.targets.purchases) * 100, 100)}%`,
                  backgroundColor: getProgressColor(performanceData.thisMonth.purchases, performanceData.targets.purchases)
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--color-text)' }}>Quality Score</span>
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {performanceData.thisMonth.avgQuality}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(performanceData.thisMonth.avgQuality / 10) * 100}%`,
                  backgroundColor: getProgressColor(performanceData.thisMonth.avgQuality, performanceData.targets.avgQuality)
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--color-text)' }}>On-Time Delivery</span>
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {performanceData.thisMonth.onTimeDelivery}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${performanceData.thisMonth.onTimeDelivery}%`,
                  backgroundColor: getProgressColor(performanceData.thisMonth.onTimeDelivery, performanceData.targets.onTimeDelivery)
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="text-sm">
            <span style={{ color: 'var(--color-textSecondary)' }}>AI Insight: </span>
            <span style={{ color: 'var(--color-text)' }}>
              Consider expanding supplier network to meet purchase targets. Quality metrics are trending positively.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};