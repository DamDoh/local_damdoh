/**
 * MoneyPlanningWidget - Microservice Component
 * Handles financial planning: loans, transactions, inputs, family planning
 * Single Responsibility: Financial management and growth planning
 * Dependencies: farm-management/financials, farm-management/knf-inputs, farm-management/family-farm
 */

import React from 'react';
import Link from 'next/link';
import { DollarSign, BarChart3, TrendingUp, Activity, FlaskConical, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MoneyPlanningWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-yellow-50 to-green-50 border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-yellow-800">
        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
        Money & Growth
      </CardTitle>
      <p className="text-sm text-yellow-600 font-normal">Plan your farm's future</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Financial Management */}
      <div className="space-y-2">
        <Link href="/farm-management/financials">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-yellow-50 border-yellow-200">
            <BarChart3 className="h-4 w-4 mr-3 text-yellow-600" />
            <div className="text-left">
              <div className="font-semibold text-yellow-800">Financial Overview</div>
              <div className="text-xs text-yellow-600">Income, expenses, profits</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/financials/apply">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <TrendingUp className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Get Loan/Finance</div>
              <div className="text-xs text-green-600">Apply for farming credit</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/financials/log">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Activity className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Record Transactions</div>
              <div className="text-xs text-blue-600">Log sales & expenses</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Growth & Planning */}
      <div className="space-y-2">
        <Link href="/farm-management/knf-inputs">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <FlaskConical className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Smart Inputs</div>
              <div className="text-xs text-purple-600">Fertilizers & pesticides</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/family-farm">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-pink-50 border-pink-200">
            <Heart className="h-4 w-4 mr-3 text-pink-600" />
            <div className="text-left">
              <div className="font-semibold text-pink-800">Family Farm</div>
              <div className="text-xs text-pink-600">Plan for family involvement</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Business Analytics Dashboard */}
      <div className="pt-3 border-t border-yellow-200">
        <p className="text-sm font-medium text-yellow-800 mb-3">Business Performance</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-green-600">+24.7%</div>
            <div className="text-xs text-yellow-700">Monthly ROI</div>
            <div className="text-xs text-green-600 mt-1">↑ 8.3% vs last month</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-blue-600">KSH 89k</div>
            <div className="text-xs text-yellow-700">Profit Margin</div>
            <div className="text-xs text-blue-600 mt-1">Per hectare</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3 bg-white hover:bg-yellow-50 border-yellow-200">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full Analytics
        </Button>
      </div>
    </CardContent>
  </Card>
);