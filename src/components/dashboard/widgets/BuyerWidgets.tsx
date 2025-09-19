/**
 * Buyer Widgets - Specialized widgets for buyer stakeholders
 * Handles procurement, supplier management, quality control, and logistics
 */

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Users, Truck, FileText, Shield, TrendingUp,
  CheckCircle, AlertTriangle, Package, DollarSign, BarChart3,
  Search, Star, Clock, MapPin, Scale, Wallet, Plus, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// [Search] SUPPLIER DISCOVERY - Find and connect with farmers
export const SupplierDiscoveryWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Search className="h-5 w-5 mr-2 text-blue-600" />
        Supplier Discovery
      </CardTitle>
      <p className="text-sm text-blue-600 font-normal">Find verified farmers & suppliers</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Search Filters */}
      <div className="space-y-2">
        <Link href="/network">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200">
            <Users className="h-4 w-4 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-blue-800">Browse Suppliers</div>
              <div className="text-xs text-blue-600">Find farmers in your area</div>
            </div>
          </Button>
        </Link>

        <Link href="/marketplace">
          <Button variant="outline" className="w-full justify-start bg-white hover:bg-green-50 border-green-200">
            <ShoppingCart className="h-4 w-4 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-800">Marketplace</div>
              <div className="text-xs text-green-600">View available produce</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Top Suppliers */}
      <div className="pt-3 border-t border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-2"><Star className="h-4 w-4 inline mr-1" /> Top Rated Suppliers</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Green Valley Farms</p>
                <p className="text-xs text-blue-600">Organic tomatoes • 4.9★</p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/network">Connect</Link>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Package] ORDER MANAGEMENT - Track procurement orders
export const OrderManagementWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-green-800">
        <Package className="h-5 w-5 mr-2 text-green-600" />
        Order Management
      </CardTitle>
      <p className="text-sm text-green-600 font-normal">Track your procurement orders</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Active Orders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Order #12345</p>
              <p className="text-xs text-green-600">500kg Tomatoes • In Transit</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">On Time</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Order #12346</p>
              <p className="text-xs text-green-600">200kg Carrots • Quality Check</p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t border-green-200">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="bg-white hover:bg-green-50" asChild>
            <Link href="/marketplace">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="bg-white hover:bg-green-50" asChild>
            <Link href="/marketplace/my-purchases">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Truck] LOGISTICS MANAGEMENT - Transportation and delivery
export const LogisticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-orange-800">
        <Truck className="h-5 w-5 mr-2 text-orange-600" />
        Logistics & Delivery
      </CardTitle>
      <p className="text-sm text-orange-600 font-normal">Manage transportation & delivery</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Active Shipments */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-800">Shipment #789</p>
            <Badge className="bg-green-100 text-green-800">On Track</Badge>
          </div>
          <p className="text-xs text-orange-700 mb-2">From: Kiambu Farm → To: Nairobi Warehouse</p>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-700">ETA: 2 hours</span>
          </div>
        </div>
      </div>

      {/* Logistics Partners */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-orange-800"><Truck className="h-4 w-4 inline mr-1" /> Logistics Partners</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
            <span className="text-sm text-orange-800">FastTrack Logistics</span>
            <Badge className="bg-green-100 text-green-800 text-xs">Preferred</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
            <span className="text-sm text-orange-800">AgriTrans Co.</span>
            <Badge className="bg-blue-100 text-blue-800 text-xs">Verified</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Scale] QUALITY CONTROL - Product verification and standards
export const QualityControlWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-purple-800">
        <Scale className="h-5 w-5 mr-2 text-purple-600" />
        Quality Control
      </CardTitle>
      <p className="text-sm text-purple-600 font-normal">Verify product quality & standards</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Quality Checks */}
      <div className="space-y-2">
        <div className="p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-800">Batch QC-2024-001</p>
            <Badge className="bg-green-100 text-green-800">Passed</Badge>
          </div>
          <p className="text-xs text-purple-700">Organic certification • Pesticide-free • Grade A</p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-800">Batch QC-2024-002</p>
            <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
          </div>
          <p className="text-xs text-purple-700">Minor quality issues • Needs re-inspection</p>
        </div>
      </div>

      {/* Quality Standards */}
      <div className="pt-3 border-t border-purple-200">
        <p className="text-sm font-medium text-purple-800 mb-2"><FileText className="h-4 w-4 inline mr-1" /> Quality Standards</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-purple-700">GAP Certified</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-purple-700">Organic Verified</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-purple-700">HACCP Pending</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [Wallet] PAYMENT PROCESSING - Financial transactions
export const PaymentProcessingWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-cyan-800">
        <Wallet className="h-5 w-5 mr-2 text-cyan-600" />
        Payment Processing
      </CardTitle>
      <p className="text-sm text-cyan-600 font-normal">Manage payments & transactions</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Recent Payments */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-cyan-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-800">Payment to Green Valley</p>
              <p className="text-xs text-cyan-600">KSH 45,000 • Completed</p>
            </div>
          </div>
          <span className="text-xs text-cyan-700">2h ago</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-800">Payment to Sun Farms</p>
              <p className="text-xs text-cyan-600">KSH 28,500 • Processing</p>
            </div>
          </div>
          <span className="text-xs text-cyan-700">5m ago</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="pt-3 border-t border-cyan-200">
        <p className="text-sm font-medium text-cyan-800 mb-2"><Wallet className="h-4 w-4 inline mr-1" /> Payment Methods</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-cyan-200">
            <span className="text-sm text-cyan-800">Mobile Money (M-Pesa)</span>
            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-cyan-200">
            <span className="text-sm text-cyan-800">Bank Transfer</span>
            <Badge className="bg-blue-100 text-blue-800 text-xs">Available</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// [BarChart3] BUYER ANALYTICS - Procurement insights and trends
export const BuyerAnalyticsWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-indigo-800">
        <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
        Procurement Analytics
      </CardTitle>
      <p className="text-sm text-indigo-600 font-normal">Insights into your buying patterns</p>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-green-600">KSH 2.4M</div>
          <div className="text-xs text-indigo-700">Monthly Spend</div>
          <div className="text-xs text-green-600 mt-1">↑ 12% vs last month</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-blue-600">47</div>
          <div className="text-xs text-indigo-700">Active Suppliers</div>
          <div className="text-xs text-blue-600 mt-1">+5 this month</div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-indigo-800"><TrendingUp className="h-4 w-4 inline mr-1" /> Top Procurement Categories</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Fresh Vegetables</span>
            <span className="text-sm font-semibold text-indigo-700">42%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Fruits</span>
            <span className="text-sm font-semibold text-indigo-700">28%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200">
            <span className="text-sm text-indigo-800">Grains</span>
            <span className="text-sm font-semibold text-indigo-700">18%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);