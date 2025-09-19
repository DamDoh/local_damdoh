/**
 * BusinessAnalyticsWidget - Microservice Component
 * Advanced business intelligence: ROI tracking, profitability analysis, market positioning
 * Single Responsibility: Business performance analytics and optimization
 * Dependencies: analytics-service, business-intelligence-api
 */

import React from 'react';
import { Target, Lightbulb, TrendingUp, Bot, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BusinessAnalyticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Target className="h-5 w-5 mr-2 text-blue-600" />
        Business Intelligence
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Optimize your farming business</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-green-600">32.4%</div>
          <div className="text-sm text-blue-700">Gross Margin</div>
          <div className="text-xs text-green-600 mt-1">Industry leading</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-purple-600">4.2x</div>
          <div className="text-sm text-blue-700">Asset Turnover</div>
          <div className="text-xs text-purple-600 mt-1">Revenue per asset</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-orange-600">89%</div>
          <div className="text-sm text-blue-700">Market Share</div>
          <div className="text-xs text-orange-600 mt-1">Local region</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-red-600">15.7%</div>
          <div className="text-sm text-blue-700">Cost Reduction</div>
          <div className="text-xs text-red-600 mt-1">Last 6 months</div>
        </div>
      </div>

      {/* AI Business Recommendations */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-800"><Bot className="inline h-4 w-4 mr-1" />AI Business Insights</h4>
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Optimize Crop Mix</p>
              <p className="text-xs text-blue-700">Switch 20% of maize area to high-value herbs. Projected +35% profit increase.</p>
              <div className="flex items-center mt-2 space-x-2">
                <Badge className="bg-green-100 text-green-800 text-xs">High Impact</Badge>
                <Button size="sm" variant="outline" className="text-xs">View Details</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Export Opportunity</p>
              <p className="text-xs text-blue-700">European market demand for organic kale. Premium pricing available.</p>
              <div className="flex items-center mt-2 space-x-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">New Market</Badge>
                <Button size="sm" variant="outline" className="text-xs">Explore</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="pt-3 border-t border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2"><Trophy className="inline h-4 w-4 mr-1" />Market Position</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">vs Local Competitors</span>
            <Badge className="bg-green-100 text-green-800">Top 15%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">Efficiency Rating</span>
            <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">Innovation Score</span>
            <Badge className="bg-purple-100 text-purple-800">Leader</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);