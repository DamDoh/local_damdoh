
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
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

export const EnergyProviderDashboard = () => {
  const t = useTranslations('EnergyProviderDashboard');
  const [dashboardData, setDashboardData] = useState<EnergyProviderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to load Energy Provider dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getEnergyProviderData]);

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
          <p>No dashboard data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { projectLeads, activeProjects, impactMetrics } = dashboardData;

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'default';
      case 'contacted':
      case 'proposal sent':
      case 'in progress':
        return 'secondary';
      case 'completed':
        return 'default'; // Success variant
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500"/>{t('leadsTitle')}</CardTitle>
            <CardDescription>{t('leadsCount', {count: projectLeads?.length || 0})}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{((projectLeads || []).filter(p => p.status === 'New')).length || 0}</div>
            <p className="text-xs text-muted-foreground">{t('newLeadsDescription')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/>{t('projectsTitle')}</CardTitle>
            <CardDescription>{t('activeProjectsCount', {count: activeProjects?.length || 0})}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{((activeProjects || []).filter(p => p.status === 'Completed')).length || 0}</div>
             <p className="text-xs text-muted-foreground">{t('projectsCompleted')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart className="h-4 w-4 text-blue-500"/>{t('impactTitle')}</CardTitle>
             <CardDescription>{t('impactDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impactMetrics?.totalEstimatedCarbonReduction || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{t('carbonReduction', {count: impactMetrics?.totalInstallations || 0})}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">{t('leadsTableTitle')}</CardTitle>
             <CardDescription>{t('leadsTableDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {(projectLeads || []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.entity')}</TableHead>
                    <TableHead>{t('table.location')}</TableHead>
                    <TableHead>{t('table.energyNeed')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(projectLeads || []).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.entityName}</TableCell>
                      <TableCell>{lead.location}</TableCell>
                      <TableCell>{lead.estimatedEnergyNeed}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge></TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={lead.actionLink}>{t('viewLeadButton')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('noLeads')}</p>
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
