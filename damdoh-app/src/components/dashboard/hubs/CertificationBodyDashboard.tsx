
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
import { Award, FileText, CheckCircle } from 'lucide-react';
import type { CertificationBodyDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

const functions = getFunctions(firebaseApp);
const getCertificationBodyDashboardDataCallable = httpsCallable<void, CertificationBodyDashboardData>(functions, 'getCertificationBodyDashboardData');


export const CertificationBodyDashboard = () => {
  const { t } = useTranslation('common');
  const [dashboardData, setDashboardData] = useState<CertificationBodyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCertificationBodyDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Certification Body dashboard data:", err);
        setError(t('dashboard.hubs.certificationBody.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getCertificationBodyDashboardDataCallable, t]);

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
          case 'active': return 'default';
          case 'pending renewal': return 'secondary';
          case 'expired': return 'destructive';
          default: return 'outline';
      }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.certificationBody.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/> {t('dashboard.hubs.certificationBody.auditsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.certificationBody.auditsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.pendingAudits.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableFarm')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableStandard')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableDueDate')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.pendingAudits.map((audit) => (
                     <TableRow key={audit.id}>
                       <TableCell className="font-medium">{audit.farmName}</TableCell>
                       <TableCell>{audit.standard}</TableCell>
                       <TableCell>{new Date(audit.dueDate).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={audit.actionLink}>{t('dashboard.hubs.certificationBody.scheduleButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.certificationBody.noAudits')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-yellow-500"/> {t('dashboard.hubs.certificationBody.entitiesTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.certificationBody.entitiesDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.certifiedEntities.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableName')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableType')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableStatus')}</TableHead>
                     <TableHead>{t('dashboard.hubs.certificationBody.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.certifiedEntities.map((entity) => (
                     <TableRow key={entity.id}>
                       <TableCell className="font-medium">{entity.name}</TableCell>
                       <TableCell>{entity.type}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(entity.certificationStatus)}>{t(`dashboard.hubs.certificationBody.statuses.${entity.certificationStatus.toLowerCase().replace(' ', '')}`, entity.certificationStatus)}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={entity.actionLink}>{t('dashboard.hubs.crowdfunder.viewButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.certificationBody.noEntities')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {t('dashboard.hubs.certificationBody.monitoringTitle')}</CardTitle>
                <CardDescription>{t('dashboard.hubs.certificationBody.monitoringDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.standardsMonitoring.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.standardsMonitoring.map((monitoring, index) => (
                            <div key={index} className="text-sm">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{monitoring.standard}</p>
                                    <Badge variant="secondary">{monitoring.adherenceRate}%</Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${monitoring.adherenceRate}%` }}></div>
                                </div>
                                {monitoring.alerts > 0 && (
                                     <p className="text-xs text-destructive mt-1">{monitoring.alerts} {t('dashboard.hubs.certificationBody.alertsLabel')}</p>
                                )}
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={monitoring.actionLink}>{t('dashboard.hubs.fi.learnMore')}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">{t('dashboard.hubs.certificationBody.noMonitoring')}</p>
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
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
    </div>
);
