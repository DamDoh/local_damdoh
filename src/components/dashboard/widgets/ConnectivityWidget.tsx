/**
 * ConnectivityWidget - Microservice Component
 * Shows online/offline status and sync capabilities
 * Single Responsibility: Connectivity status and offline management
 * Dependencies: offline-sync-service, connectivity-api
 */

import React from 'react';
import { Wifi, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ConnectivityWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-gray-800">
        <Wifi className="h-5 w-5 mr-2 text-green-600" />
        Connection Status
      </CardTitle>
      <p className="text-sm text-gray-600 font-normal">Work anywhere, anytime</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Online</p>
            <p className="text-xs text-gray-600">All features available</p>
          </div>
        </div>
        <Wifi className="h-5 w-5 text-green-600" />
      </div>

      {/* Offline Capabilities */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">Offline Ready Features:</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Record crop activities</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Log financial transactions</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Access saved data</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Last synced:</span>
          <Badge className="bg-blue-100 text-blue-800">2 minutes ago</Badge>
        </div>
        <div className="mt-2">
          <Button variant="outline" size="sm" className="w-full bg-white hover:bg-gray-50">
            <Activity className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);