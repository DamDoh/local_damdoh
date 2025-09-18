/**
 * SeasonalCalendarWidget - Microservice Component
 * Shows upcoming farming tasks: planting, harvesting, maintenance
 * Single Responsibility: Seasonal planning and task scheduling
 * Dependencies: calendar-service, crop-calendar-api
 */

import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SeasonalCalendarWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-teal-800">
        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
        This Week's Tasks
      </CardTitle>
      <p className="text-sm text-teal-600 font-normal">Plan your farming activities</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Today's Tasks */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Today
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-white rounded border border-teal-200">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-800">Irrigate tomato beds</p>
              <p className="text-xs text-teal-600">Block A & B - 30 minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-800">Apply organic fertilizer</p>
              <p className="text-xs text-teal-600">Maize field - Due today</p>
            </div>
          </div>
        </div>
      </div>

      {/* This Week's Schedule */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-teal-800">This Week</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm p-2 bg-white rounded border border-teal-200">
            <span className="text-teal-800">Wednesday: Pest monitoring</span>
            <Badge className="bg-blue-100 text-blue-800 text-xs">Scheduled</Badge>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-white rounded border border-teal-200">
            <span className="text-teal-800">Friday: Harvest planning</span>
            <Badge className="bg-green-100 text-green-800 text-xs">Review</Badge>
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-white rounded border border-teal-200">
            <span className="text-teal-800">Saturday: Market preparation</span>
            <Badge className="bg-purple-100 text-purple-800 text-xs">Prepare</Badge>
          </div>
        </div>
      </div>

      {/* Seasonal Reminder */}
      <div className="pt-3 border-t border-teal-200">
        <div className="p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg border border-teal-300">
          <div className="flex items-start space-x-2">
            <Leaf className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-teal-800">Seasonal Tip</p>
              <p className="text-xs text-teal-700">Perfect time for maize planting. Soil temperature optimal at 22°C.</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);