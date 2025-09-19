"use client";

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import {
  Landmark,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  FileCheck,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { api } from '@/lib/api-client';

interface FiMetrics {
  totalPortfolio: number;
  activeLoans: number;
  repaymentRate: number;
  riskScore: number;
  pendingApplications: number;
  complianceStatus: 'compliant' | 'warning' | 'critical';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  urgent?: boolean;
}

export function FiLeftSidebar() {
  const t = useTranslations('FiLeftSidebar');
  const { profile, loading: authLoading } = useUserProfile();

  const [metrics, setMetrics] = useState<FiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      setIsLoading(true);
      api.get<FiMetrics>('/api/fi/metrics')
        .then((metricsResult) => {
          setMetrics(metricsResult);
        }).catch((error: any) => {
          console.error("Error fetching FI metrics:", error);
          // Set default values
          setMetrics({
            totalPortfolio: 0,
            activeLoans: 0,
            repaymentRate: 0,
            riskScore: 0,
            pendingApplications: 0,
            complianceStatus: 'compliant'
          });
        }).finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading) {
      setIsLoading(false);
      setMetrics({
        totalPortfolio: 0,
        activeLoans: 0,
        repaymentRate: 0,
        riskScore: 0,
        pendingApplications: 0,
        complianceStatus: 'compliant'
      });
    }
  }, [profile, authLoading]);

  const quickActions: QuickAction[] = [
    {
      id: 'applications',
      label: t('reviewApplications'),
      icon: FileCheck,
      href: '/fi/applications',
      badge: metrics?.pendingApplications?.toString(),
      urgent: (metrics?.pendingApplications || 0) > 10
    },
    {
      id: 'field-visits',
      label: t('scheduleVisits'),
      icon: MapPin,
      href: '/fi/field-visits'
    },
    {
      id: 'risk-assessment',
      label: t('riskAssessment'),
      icon: Shield,
      href: '/fi/risk-assessment'
    },
    {
      id: 'compliance',
      label: t('complianceReports'),
      icon: CheckCircle,
      href: '/fi/compliance'
    }
  ];

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-1" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardContent>
          <hr/>
          <CardContent className="text-xs space-y-2 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* FI Profile Card */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Link href="/profiles/me">
            <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary cursor-pointer">
              <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.displayName} data-ai-hint="financial institution profile" />
              <AvatarFallback>
                <Landmark className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{profile?.displayName || 'Financial Institution'}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{profile?.profileSummary || 'Agricultural Finance & Credit Services'}</p>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4"/>
                  {t('totalPortfolio')}
                </span>
                <span className="text-primary font-semibold">
                  ${(metrics?.totalPortfolio || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4"/>
                  {t('activeLoans')}
                </span>
                <span className="text-primary font-semibold">{metrics?.activeLoans || 0}</span>
              </div>
              <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4"/>
                  {t('repaymentRate')}
                </span>
                <span className="text-primary font-semibold">{metrics?.repaymentRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center p-1 rounded-sm hover:bg-accent cursor-pointer">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4"/>
                  {t('riskScore')}
                </span>
                <span className="text-primary font-semibold">{metrics?.riskScore || 0}/100</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Compliance Status Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {getComplianceIcon(metrics?.complianceStatus || 'compliant')}
            {t('complianceStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge className={`w-full justify-center ${getComplianceColor(metrics?.complianceStatus || 'compliant')}`}>
            {t(metrics?.complianceStatus || 'compliant')}
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {quickActions.map((action) => (
            <Link key={action.id} href={action.href}>
              <div className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                action.urgent ? 'bg-red-50 border border-red-200' : ''
              }`}>
                <div className="flex items-center gap-2">
                  <action.icon className={`h-4 w-4 ${action.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{action.label}</span>
                </div>
                {action.badge && (
                  <Badge variant={action.urgent ? "destructive" : "secondary"} className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}