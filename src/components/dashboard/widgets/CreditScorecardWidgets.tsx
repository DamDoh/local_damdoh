/**
 * Credit Scorecard-specific widgets for credit scoring and risk assessment services
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Users, AlertTriangle, CheckCircle, BarChart3, Target, Shield } from 'lucide-react';
import Link from 'next/link';

export const RiskAssessmentWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        Risk Assessment
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">1,247</div>
      <p className="text-xs text-muted-foreground">Assessments completed</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Low: 68%</Badge>
        <Badge variant="secondary" className="text-xs">Medium: 25%</Badge>
        <Badge variant="secondary" className="text-xs">High: 7%</Badge>
      </div>
    </CardContent>
  </Card>
);

export const CreditScoringWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Target className="h-4 w-4" />
        Credit Scoring
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">94.2%</div>
      <p className="text-xs text-muted-foreground">Model accuracy</p>
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href="/credit-scorecard/models">View Models</Link>
      </Button>
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
      <div className="text-2xl font-bold">892</div>
      <p className="text-xs text-muted-foreground">Active clients</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Small farmers</span>
          <span className="font-medium">645</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Cooperatives</span>
          <span className="font-medium">247</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DefaultPredictionWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Default Prediction
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">3.2%</div>
      <p className="text-xs text-muted-foreground">Predicted default rate</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">↓ 0.8% from last month</Badge>
      </div>
    </CardContent>
  </Card>
);

export const ComplianceMonitoringWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Compliance Monitoring
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">98.7%</div>
      <p className="text-xs text-muted-foreground">Compliance rate</p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">CBK Approved</Badge>
      </div>
    </CardContent>
  </Card>
);

export const PerformanceAnalyticsWidget: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Performance Analytics
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-2xl font-bold">+15.3%</div>
      <p className="text-xs text-muted-foreground">Portfolio growth</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Approval rate</span>
          <span className="font-medium text-green-600">↑ 5.2%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Recovery rate</span>
          <span className="font-medium text-green-600">↑ 8.1%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);