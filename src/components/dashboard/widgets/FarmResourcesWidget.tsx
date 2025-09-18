/**
 * FarmResourcesWidget - Microservice Component
 * Manages farm assets: farms, inventory, equipment, labor
 * Single Responsibility: Resource inventory and management
 * Dependencies: farm-management/farms, farm-management/inventory, farm-management/asset-management, farm-management/labor
 */

import React from 'react';
import Link from 'next/link';
import { Tractor, Package, Wrench, Users, Home, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FarmResourcesWidget: React.FC = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center text-blue-800">
        <Home className="h-5 w-5 mr-2 text-blue-600" />
        My Farm & Resources
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
        <p className="text-sm font-medium text-blue-800 mb-2">Resource Status</p>
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