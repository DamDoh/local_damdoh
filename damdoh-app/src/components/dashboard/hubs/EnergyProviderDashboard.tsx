
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Zap, BarChart, CheckCircle } from 'lucide-react';
import type { EnergyProviderDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export const EnergyProviderDashboard = () => {
  const { t } = useTranslation('common');
  const [dashboardData, setDashboardData] = useState<EnergyProviderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(firebaseApp);
  const getEnergyProviderData = useMemo(() => httpsCallable(functions, 'getEnergyProviderDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getEnergyProviderData();
        setDashboardData(result.data as EnergyProviderDashboardData);
      } catch (err) {
        console.error("Error fetching Energy Provider dashboard data:", err);
        setError(t('dashboard.hubs.energyProvider.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getEnergyProviderData, t]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>{t('dashboard.hubs.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'default';
      case 'contacted':
      case 'proposal sent':
      case 'in progress':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
        case 'completed': return 'bg-green-600 hover:bg-green-700';
        default: return '';
    }
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.energyProvider.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500"/> {t('dashboard.hubs.energyProvider.leadsTitle')}</CardTitle>
            <CardDescription>{t('dashboard.hubs.energyProvider.leadsDescription', { count: dashboardData.projectLeads.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dashboardData.projectLeads.filter(p => p.status === 'New').length}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.hubs.energyProvider.newLeadsLabel')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {t('dashboard.hubs.energyProvider.projectsTitle')}</CardTitle>
            <CardDescription>{t('dashboard.hubs.energyProvider.projectsDescription', { count: dashboardData.activeProjects.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dashboardData.activeProjects.filter(p => p.status === 'Completed').length}</div>
             <p className="text-xs text-muted-foreground">{t('dashboard.hubs.energyProvider.projectsCompletedLabel')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart className="h-4 w-4 text-blue-500"/> {t('dashboard.hubs.energyProvider.impactTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.energyProvider.impactDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.impactMetrics.totalEstimatedCarbonReduction}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.hubs.energyProvider.impactSubDescription', { count: dashboardData.impactMetrics.totalInstallations })}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.hubs.energyProvider.leadsTableTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.energyProvider.leadsTableDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.projectLeads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.hubs.energyProvider.tableEntity')}</TableHead>
                    <TableHead>{t('dashboard.hubs.energyProvider.tableLocation')}</TableHead>
                    <TableHead>{t('dashboard.hubs.energyProvider.tableNeed')}</TableHead>
                    <TableHead>{t('dashboard.hubs.energyProvider.tableStatus')}</TableHead>
                    <TableHead>{t('dashboard.hubs.energyProvider.tableAction')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.projectLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.entityName}</TableCell>
                      <TableCell>{lead.location}</TableCell>
                      <TableCell>{lead.estimatedEnergyNeed}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge></TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={lead.actionLink}>{t('dashboard.hubs.energyProvider.viewLeadButton')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.hubs.energyProvider.noLeads')}</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg md:col-span-3" />
        </div>
    </div>
);
