/**
 * EmergencyAlertsWidget - Microservice Component
 * Displays critical alerts: weather warnings, pest outbreaks, market changes
 * Single Responsibility: Emergency notification system
 * Dependencies: weather-service, pest-monitoring, market-alerts
 */

import React from 'react';
import { Bell, CloudRain, AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EmergencyAlertsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-red-800">
        <Bell className="h-5 w-5 mr-2 text-red-600 animate-pulse" />
        Emergency Alerts
      </CardTitle>
      <p className="text-sm text-red-600 font-normal">Critical updates you need to know</p>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* Critical Weather Alert */}
      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start space-x-3">
          <CloudRain className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Heavy Rain Warning</p>
            <p className="text-xs text-red-700">Expected 100mm rainfall tonight. Secure equipment and prepare drainage.</p>
            <p className="text-xs text-red-600 mt-1"><Clock className="inline h-3 w-3 mr-1" />Action needed within 2 hours</p>
          </div>
        </div>
      </div>

      {/* Pest Alert */}
      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">Fall Armyworm Detected</p>
            <p className="text-xs text-orange-700">Outbreak reported 5km from your farm. Monitor maize crops closely.</p>
            <p className="text-xs text-orange-600 mt-1"><MapPin className="inline h-3 w-3 mr-1" />3 farms affected in your area</p>
          </div>
        </div>
      </div>

      {/* Market Alert */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Price Surge Alert</p>
            <p className="text-xs text-yellow-700">Tomato prices up 40% due to supply shortage. Consider harvesting early.</p>
            <p className="text-xs text-yellow-600 mt-1">Current market price: KSH 120/kg</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-red-200">
        <Button variant="outline" className="w-full bg-white hover:bg-red-50 border-red-200">
          <Bell className="h-4 w-4 mr-2" />
          View All Alerts
        </Button>
      </div>
    </CardContent>
  </Card>
);