/**
 * QuickStatsWidget - Microservice Component
 * Shows key farm performance indicators: yields, profits, health scores
 * Single Responsibility: Performance dashboard metrics
 * Dependencies: analytics-service, farm-performance-api
 */

import React from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuickStatsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-indigo-800">
        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
        Farm Performance
      </CardTitle>
      <p className="text-sm text-indigo-600 font-normal">Your farm at a glance</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-green-600">85%</div>
          <div className="text-xs text-indigo-700">Crop Health</div>
          <div className="text-xs text-green-600 mt-1">↑ 5% from last week</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-blue-600">12.5t</div>
          <div className="text-xs text-indigo-700">This Month Yield</div>
          <div className="text-xs text-blue-600 mt-1">↑ 15% vs last month</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-yellow-600">KSH 45k</div>
          <div className="text-xs text-indigo-700">Monthly Revenue</div>
          <div className="text-xs text-green-600 mt-1">↑ 8% vs last month</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-purple-600">92%</div>
          <div className="text-xs text-indigo-700">Quality Score</div>
          <div className="text-xs text-purple-600 mt-1">Grade A rating</div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="pt-3 border-t border-indigo-200">
        <p className="text-sm font-medium text-indigo-800 mb-2">Performance Insights</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700">Best performing crop:</span>
            <Badge className="bg-green-100 text-green-800">Tomatoes</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700">Efficiency rating:</span>
            <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);