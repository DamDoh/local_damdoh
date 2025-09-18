/**
 * Farm Management Widgets - Microservice-compliant React components
 * Each widget is isolated, self-contained, and follows single responsibility principle
 * Designed specifically for smallholder farmers with minimal education and busy schedules
 */

import React from 'react';
import Link from 'next/link';
import {
  Tractor, Sprout, DollarSign, Users, Package, FlaskConical,
  Calendar, BarChart3, Settings, Plus, Eye, Edit, Activity,
  CloudRain, Target, TrendingUp, AlertTriangle, CheckCircle,
  ShoppingCart, Zap, Heart, Star, Home, Wrench, Bell, Clock,
  AlertCircle, Leaf, Thermometer, Droplets, Wind, MessageSquare,
  Wifi, WifiOff, ThumbsUp, Lightbulb, Shield, FileText, BookOpen, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 🎯 DAILY FARM OPERATIONS - What farmers do every day
/**
 * DailyOperationsWidget - Microservice Component
 * Handles daily farming tasks: crop monitoring, weather, quick actions
 * Single Responsibility: Daily farm operations management
 * Dependencies: farm-management/farms, farm-management/seed-starting, farm-management/financials/log
 */
export const DailyOperationsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Activity className="h-5 w-5 mr-2 text-green-600 animate-pulse" />
        🌅 Daily Operations
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
        <p className="text-sm font-medium text-green-800 mb-3">⚡ Quick Tasks</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/farm-management/farms">
            <Button size="sm" variant="outline" className="w-full h-auto p-3 flex flex-col items-center bg-white hover:bg-green-50">
              <Plus className="h-4 w-4 mb-1 text-green-600" />
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

// 🏠 FARM RESOURCES - Everything farmers own and manage
/**
 * FarmResourcesWidget - Microservice Component
 * Manages farm assets: farms, inventory, equipment, labor
 * Single Responsibility: Resource inventory and management
 * Dependencies: farm-management/farms, farm-management/inventory, farm-management/asset-management, farm-management/labor
 */
export const FarmResourcesWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Home className="h-5 w-5 mr-2 text-blue-600" />
        🏠 My Farm & Resources
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Manage what you own</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Core Farm Management */}
      <div className="space-y-2">
        <Link href="/farm-management/farms">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Tractor className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Farm Overview</div>
              <div className="text-xs text-blue-600">All my farm operations</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/create-farm">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <Plus className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Add New Farm</div>
              <div className="text-xs text-purple-600">Register additional land</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Resources Management */}
      <div className="space-y-2">
        <Link href="/farm-management/inventory">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Package className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Inventory</div>
              <div className="text-xs text-green-600">Seeds, tools, supplies</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/asset-management">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-orange-50 border-orange-200">
            <Wrench className="h-4 w-4 mr-3 text-orange-600" />
            <div className="text-left">
              <div className="font-semibold text-orange-800">Equipment</div>
              <div className="text-xs text-orange-600">Tractors, tools, machinery</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/labor">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-pink-50 border-pink-200">
            <Users className="h-4 w-4 mr-3 text-pink-600" />
            <div className="text-left">
              <div className="font-semibold text-pink-800">Workers</div>
              <div className="text-xs text-pink-600">Manage farm labor</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Resource Status */}
      <div className="pt-3 border-t border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-2">📊 Resource Status</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Seeds</span>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Good
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Fertilizer</span>
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 🚨 EMERGENCY ALERTS - Critical notifications farmers must see
/**
 * EmergencyAlertsWidget - Microservice Component
 * Displays critical alerts: weather warnings, pest outbreaks, market changes
 * Single Responsibility: Emergency notification system
 * Dependencies: weather-service, pest-monitoring, market-alerts
 */
export const EmergencyAlertsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-red-800">
        <Bell className="h-5 w-5 mr-2 text-red-600 animate-pulse" />
        🚨 Emergency Alerts
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
            <p className="text-xs text-red-600 mt-1">⏰ Action needed within 2 hours</p>
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
            <p className="text-xs text-orange-600 mt-1">📍 3 farms affected in your area</p>
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
            <p className="text-xs text-yellow-600 mt-1">💰 Current market price: KSH 120/kg</p>
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

// 📊 QUICK STATS - Key performance metrics at a glance
/**
 * QuickStatsWidget - Microservice Component
 * Shows key farm performance indicators: yields, profits, health scores
 * Single Responsibility: Performance dashboard metrics
 * Dependencies: analytics-service, farm-performance-api
 */
export const QuickStatsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-indigo-800">
        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
        📊 Farm Performance
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
        <p className="text-sm font-medium text-indigo-800 mb-2">💡 Performance Insights</p>
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

// 💬 FARMER FEEDBACK - Quick feedback system for continuous improvement
/**
 * FarmerFeedbackWidget - Microservice Component
 * Allows farmers to provide quick feedback and suggestions
 * Single Responsibility: User feedback collection and improvement
 * Dependencies: feedback-service, user-engagement-api
 */
export const FarmerFeedbackWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-pink-800">
        <MessageSquare className="h-5 w-5 mr-2 text-pink-600" />
        💬 Your Voice Matters
      </CardTitle>
      <p className="text-sm text-pink-600 font-normal">Help us improve DamDoh</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Quick Feedback Options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-pink-800">How is your experience today?</p>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-green-50 border-green-200">
            <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
            Great!
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
            Okay
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            Needs Help
          </Button>
        </div>
      </div>

      {/* Feature Requests */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-pink-800">What feature would you like to see?</p>
        <div className="space-y-1">
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
            Better weather alerts
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <ShoppingCart className="h-4 w-4 mr-2 text-purple-600" />
            More buyer connections
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Zap className="h-4 w-4 mr-2 text-green-600" />
            Faster AI responses
          </Button>
        </div>
      </div>

      {/* Feedback Stats */}
      <div className="pt-3 border-t border-pink-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-pink-700">Your feedback helps</span>
          <Badge className="bg-pink-100 text-pink-800">247 farmers improved</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 📶 CONNECTIVITY STATUS - Offline capability indicators
/**
 * ConnectivityWidget - Microservice Component
 * Shows online/offline status and sync capabilities
 * Single Responsibility: Connectivity status and offline management
 * Dependencies: offline-sync-service, connectivity-api
 */
export const ConnectivityWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-gray-800">
        <Wifi className="h-5 w-5 mr-2 text-green-600" />
        📶 Connection Status
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
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Log financial transactions</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Access saved data</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
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

// 📅 SEASONAL CALENDAR - Upcoming tasks and planning
/**
 * SeasonalCalendarWidget - Microservice Component
 * Shows upcoming farming tasks: planting, harvesting, maintenance
 * Single Responsibility: Seasonal planning and task scheduling
 * Dependencies: calendar-service, crop-calendar-api
 */
export const SeasonalCalendarWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-teal-800">
        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
        📅 This Week's Tasks
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

// 💰 MONEY & PLANNING - Financial management and growth
/**
 * MoneyPlanningWidget - Microservice Component
 * Handles financial planning: loans, transactions, inputs, family planning
 * Single Responsibility: Financial management and growth planning
 * Dependencies: farm-management/financials, farm-management/knf-inputs, farm-management/family-farm
 */
export const MoneyPlanningWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-yellow-50 to-green-50 border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-yellow-800">
        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
        💰 Money & Growth
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
        <p className="text-sm font-medium text-yellow-800 mb-3">📊 Business Performance</p>
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

// 🎯 BUSINESS ANALYTICS - Advanced ROI tracking and insights
/**
 * BusinessAnalyticsWidget - Microservice Component
 * Advanced business intelligence: ROI tracking, profitability analysis, market positioning
 * Single Responsibility: Business performance analytics and optimization
 * Dependencies: analytics-service, business-intelligence-api
 */
export const BusinessAnalyticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Target className="h-5 w-5 mr-2 text-blue-600" />
        🎯 Business Intelligence
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
        <h4 className="text-sm font-semibold text-blue-800">🤖 AI Business Insights</h4>
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
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🏆 Market Position</h4>
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

// 🤖 HELP & SUPPORT - Comprehensive support hub with feedback and connectivity
/**
 * HelpSupportWidget - Microservice Component
 * Provides expert help, user feedback, and connectivity status
 * Single Responsibility: Complete support ecosystem
 * Dependencies: ai-assistant, farm-management/fgw-guide, marketplace, feedback-service, connectivity-api
 */
export const HelpSupportWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Star className="h-5 w-5 mr-2 text-purple-600 animate-pulse" />
        🤖 Help & Support Hub
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Expert help, feedback & connectivity</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Expert Help */}
      <div className="space-y-2">
        <Link href="/ai-assistant">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <Zap className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">AI Farm Assistant</div>
              <div className="text-xs text-purple-600">Get expert farming advice</div>
            </div>
          </Button>
        </Link>

        <Link href="/farm-management/fgw-guide">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Target className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Crop Guides</div>
              <div className="text-xs text-blue-600">FGW crop recommendations</div>
            </div>
          </Button>
        </Link>

        <Link href="/knowledge-hub">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-orange-50 border-orange-200">
            <BookOpen className="h-4 w-4 mr-3 text-orange-600" />
            <div className="text-left">
              <div className="font-semibold text-orange-800">Knowledge Hub</div>
              <div className="text-xs text-orange-600">Research & learning</div>
            </div>
          </Button>
        </Link>

        <Link href="/wallet">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <Wallet className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Wallet</div>
              <div className="text-xs text-green-600">Payments & transactions</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Marketplace & Community */}
      <div className="space-y-2">
        <Link href="/marketplace">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <ShoppingCart className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Sell My Produce</div>
              <div className="text-xs text-green-600">Access buyers & markets</div>
            </div>
          </Button>
        </Link>

        <Link href="/traceability">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <FileText className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Traceability</div>
              <div className="text-xs text-blue-600">Track & verify produce</div>
            </div>
          </Button>
        </Link>

        <Link href="/wallet">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
            <Wallet className="h-4 w-4 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-purple-800">Payments</div>
              <div className="text-xs text-purple-600">Manage transactions</div>
            </div>
          </Button>
        </Link>

         <Link href="/insurance">
           <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
             <Shield className="h-4 w-4 mr-3 text-blue-600" />
             <div className="text-left">
               <div className="font-semibold text-blue-800">Crop Insurance</div>
               <div className="text-xs text-blue-600">Protect your investment</div>
             </div>
           </Button>
         </Link>

         <Link href="/traceability">
           <Button variant="outline" className="w-full justify-start bg-white hover:bg-purple-50 border-purple-200">
             <FileText className="h-4 w-4 mr-3 text-purple-600" />
             <div className="text-left">
               <div className="font-semibold text-purple-800">Traceability</div>
               <div className="text-xs text-purple-600">Track & certify produce</div>
             </div>
           </Button>
         </Link>

         <Link href="/knowledge-hub">
           <Button variant="outline" className="w-full justify-start bg-white hover:bg-orange-50 border-orange-200">
             <BookOpen className="h-4 w-4 mr-3 text-orange-600" />
             <div className="text-left">
               <div className="font-semibold text-orange-800">Learning Hub</div>
               <div className="text-xs text-orange-600">Courses & best practices</div>
             </div>
           </Button>
         </Link>
      </div>

      {/* Connectivity Status */}
      <div className="pt-3 border-t border-purple-200">
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
      </div>

      {/* Farmer Feedback */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-purple-800">How is your experience today?</p>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-green-50 border-green-200">
            <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
            Great!
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
            Okay
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            Needs Help
          </Button>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="pt-3 border-t border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-3">💡 Today's Tips</p>
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <CloudRain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Perfect planting weather today!</p>
                <p className="text-xs text-blue-600">Soil moisture optimal for maize</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Market prices rising</p>
                <p className="text-xs text-green-600">Tomatoes up 15% this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);