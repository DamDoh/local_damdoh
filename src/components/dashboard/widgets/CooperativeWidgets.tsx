/**
 * Cooperative-specific widgets for farmer cooperative management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, DollarSign, TrendingUp, Package, BarChart3, Heart, Target } from 'lucide-react';
import Link from 'next/link';

export const MemberManagementWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Users className="h-4 w-4" />
        Member Management
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">234</div>
      <p className="text-xs text-muted-foreground">Active members</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">+12 this month</Badge>
      </div>
    </CardContent>
  </Card>
);

export const CollectivePurchasingWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        Collective Purchasing
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">KSH 450K</div>
      <p className="text-xs text-muted-foreground">Bulk savings this quarter</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/cooperative/purchasing">View Orders</Link>
      </Button>
    </CardContent>
  </Card>
);

export const RevenueSharingWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Revenue Sharing
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">KSH 1.2M</div>
      <p className="text-xs text-muted-foreground">Distributed this year</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Average per member</span>
          <span className="font-medium">KSH 5,128</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MarketAccessWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Package className="h-4 w-4" />
        Market Access
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">15</div>
      <p className="text-xs text-muted-foreground">Active buyers</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Export</Badge>
        <Badge variant="secondary" className="text-xs">Local</Badge>
      </div>
    </CardContent>
  </Card>
);

export const CooperativeAnalyticsWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Performance Analytics
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">+24%</div>
      <p className="text-xs text-muted-foreground">Member income growth</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Productivity</span>
          <span className="font-medium text-green-600">↑ 18%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Market prices</span>
          <span className="font-medium text-green-600">↑ 12%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CommunitySupportWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Heart className="h-4 w-4" />
        Community Support
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">8</div>
      <p className="text-xs text-muted-foreground">Programs active</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Training</Badge>
        <Badge variant="secondary" className="text-xs">Insurance</Badge>
      </div>
    </CardContent>
  </Card>
);