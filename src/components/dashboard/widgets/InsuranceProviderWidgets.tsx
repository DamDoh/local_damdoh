/**
 * Insurance Provider-specific widgets for insurance companies and risk management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, DollarSign, Users, FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const PolicyManagementWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Policy Management
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">3,456</div>
      <p className="text-xs text-muted-foreground">Active policies</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Crop: 2,134</Badge>
        <Badge variant="secondary" className="text-xs">Livestock: 1,322</Badge>
      </div>
    </CardContent>
  </Card>
);

export const ClaimsProcessingWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Claims Processing
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">89</div>
      <p className="text-xs text-muted-foreground">Pending claims</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/insurance/claims">Process Claims</Link>
      </Button>
    </CardContent>
  </Card>
);

export const RiskAssessmentWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Risk Assessment
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">Low</div>
      <p className="text-xs text-muted-foreground">Current risk level</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Drought: High</Badge>
        <Badge variant="secondary" className="text-xs">Pests: Medium</Badge>
      </div>
    </CardContent>
  </Card>
);

export const PremiumCollectionWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Premium Collection
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">KSH 2.8M</div>
      <p className="text-xs text-muted-foreground">Collected this month</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>On-time payments</span>
          <span className="font-medium text-green-600">94.2%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ClientPortfolioWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Users className="h-4 w-4" />
        Client Portfolio
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">1,892</div>
      <p className="text-xs text-muted-foreground">Insured farmers</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Smallholders</span>
          <span className="font-medium">1,456</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Cooperatives</span>
          <span className="font-medium">436</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LossRatioWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Loss Ratio
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">68.5%</div>
      <p className="text-xs text-muted-foreground">Current ratio</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Target: Below 75%</Badge>
        <Badge variant="secondary" className="text-xs">↓ 2.1% from last year</Badge>
      </div>
    </CardContent>
  </Card>
);