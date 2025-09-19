/**
 * DailyOperationsWidget - Microservice Component
 * Handles daily farming tasks: crop monitoring, weather, quick actions
 * Single Responsibility: Daily farm operations management
 * Dependencies: farm-management/farms, farm-management/seed-starting, farm-management/financials/log
 */

import React from 'react';
import Link from 'next/link';
import { Tractor, Sprout, DollarSign, Activity, CloudRain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DailyOperationsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Activity className="h-5 w-5 mr-2 text-green-600 animate-pulse" />
        Daily Operations
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Your most important daily tasks</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Weather & Crops - Most Important Daily Tasks */}
      <div className="space-y-2">
        <Link href="/farm-management/farms">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Sprout className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Check My Crops</div>
              <div className="text-xs text-green-600">Monitor growth & health</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/seed-starting">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <CloudRain className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Weather & Planting</div>
              <div className="text-xs text-blue-600">Best times to plant</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Quick Daily Actions */}
      <div className="pt-3 border-t border-green-200">
        <p className="text-sm font-medium text-green-800 mb-3"><Sparkles className="inline h-4 w-4 mr-1" />Quick Tasks</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/farm-management/farms">
            <Button size="sm" variant="outline" className="w-full h-auto p-3 flex flex-col items-center bg-white hover:bg-green-50">
              <Tractor className="h-4 w-4 mb-1 text-green-600" />
              <span className="text-xs font-medium">New Crop</span>
            </Button>
          </Link>
          <Link href="/farm-management/financials/log">
            <Button size="sm" variant="outline" className="w-full h-auto p-3 flex flex-col items-center bg-white hover:bg-green-50">
              <DollarSign className="h-4 w-4 mb-1 text-green-600" />
              <span className="text-xs font-medium">Log Sale</span>
            </Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
);