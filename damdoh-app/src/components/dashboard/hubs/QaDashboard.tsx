
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
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import type { QaDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

const functions = getFunctions(firebaseApp);


export const QaDashboard = () => {
  const { t } = useTranslation('common');
  const [dashboardData, setDashboardData] = useState<QaDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getQaDashboardDataCallable = useMemo(() => httpsCallable<void, QaDashboardData>(functions, 'getQaDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getQaDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching QA dashboard data:", err);
        setError(t('dashboard.hubs.qa.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getQaDashboardDataCallable, t]);

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.qa.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/> {t('dashboard.hubs.qa.inspectionsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.qa.inspectionsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.pendingInspections.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.qa.tableBatch')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableProduct')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableSeller')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableDueDate')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.pendingInspections.map((inspection) => (
                     <TableRow key={inspection.id}>
                       <TableCell className="font-mono text-xs">{inspection.batchId}</TableCell>
                       <TableCell>{inspection.productName}</TableCell>
                       <TableCell>{inspection.sellerName}</TableCell>
                       <TableCell>{new Date(inspection.dueDate).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={inspection.actionLink}>{t('dashboard.hubs.qa.performButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.qa.noInspections')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/> {t('dashboard.hubs.qa.resultsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.qa.resultsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.recentResults.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.qa.tableProduct')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableResult')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableReason')}</TableHead>
                     <TableHead>{t('dashboard.hubs.qa.tableInspectedAt')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.recentResults.map((issue) => (
                     <TableRow key={issue.id}>
                       <TableCell>{issue.productName}</TableCell>
                       <TableCell><Badge variant={issue.result === 'Pass' ? 'default' : 'destructive'}>{t(`dashboard.hubs.qa.${issue.result.toLowerCase()}`)}</Badge></TableCell>
                       <TableCell>{issue.reason || 'N/A'}</TableCell>
                       <TableCell>{new Date(issue.inspectedAt).toLocaleDateString()}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.qa.noResults')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {t('dashboard.hubs.qa.metricsTitle')}</CardTitle>
                <CardDescription>{t('dashboard.hubs.qa.metricsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.qualityMetrics ? (
                    <div className="space-y-3">
                        <div className="text-sm">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{t('dashboard.hubs.qa.passRate')}</p>
                                <Badge variant="secondary">{dashboardData.qualityMetrics.passRate}%</Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardData.qualityMetrics.passRate}%` }}></div>
                            </div>
                        </div>
                        <div className="text-sm">
                           <p>{t('dashboard.hubs.qa.averageScore')}: {dashboardData.qualityMetrics.averageScore}</p>
                        </div>
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">{t('dashboard.hubs.qa.noMetrics')}</p>
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
         <Skeleton className="h-32 w-full rounded-lg md:col-span-1" />
    </div>
);
