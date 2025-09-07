
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
import { useTranslations } from 'next-intl';

export const QaDashboard = () => {
  const t = useTranslations('QaDashboard');
  const [dashboardData, setDashboardData] = useState<QaDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const functions = useMemo(() => getFunctions(firebaseApp), []);
  const getQaDashboardDataCallable = useMemo(() => httpsCallable<void, QaDashboardData>(functions, 'dashboardData-getQaDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getQaDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching QA dashboard data:", err);
        setError(t('errors.load'));
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
                    <p>{t('noData')}</p>
                </CardContent>
           </Card>
      );
  }
  
  const { pendingInspections, recentResults, qualityMetrics } = dashboardData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Inspections */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/> {t('inspectionsTitle')}</CardTitle>
             <CardDescription>{t('inspectionsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(pendingInspections || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.batchId')}</TableHead>
                     <TableHead>{t('table.product')}</TableHead>
                     <TableHead>{t('table.seller')}</TableHead>
                     <TableHead>{t('table.dueDate')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(pendingInspections || []).map((inspection) => (
                     <TableRow key={inspection.id}>
                       <TableCell className="font-mono text-xs">{inspection.batchId}</TableCell>
                       <TableCell>{inspection.productName}</TableCell>
                       <TableCell>{inspection.sellerName}</TableCell>
                       <TableCell>{new Date(inspection.dueDate).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={inspection.actionLink}>{t('performInspectionButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noPendingInspections')}</p>
             )}
           </CardContent>
         </Card>

         {/* Recent Results */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/> {t('resultsTitle')}</CardTitle>
             <CardDescription>{t('resultsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(recentResults || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.product')}</TableHead>
                     <TableHead>{t('table.result')}</TableHead>
                     <TableHead>{t('table.reason')}</TableHead>
                     <TableHead>{t('table.inspectedAt')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(recentResults || []).map((issue) => (
                     <TableRow key={issue.id}>
                       <TableCell>{issue.productName}</TableCell>
                       <TableCell><Badge variant={issue.result === 'Pass' ? 'default' : 'destructive'}>{issue.result}</Badge></TableCell>
                       <TableCell>{issue.reason || 'N/A'}</TableCell>
                       <TableCell>{new Date(issue.inspectedAt).toLocaleDateString()}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noRecentIssues')}</p>
             )}
           </CardContent>
         </Card>

          {/* Quality Metrics */}
         <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/>{t('metricsTitle')}</CardTitle>
                <CardDescription>{t('metricsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {qualityMetrics ? (
                    <div className="space-y-3">
                        <div className="text-sm">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{t('passRate')}</p>
                                <Badge variant="secondary">{qualityMetrics.passRate}%</Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${qualityMetrics.passRate}%` }}></div>
                            </div>
                        </div>
                        <div className="text-sm">
                           <p>{t('averageScore')}: {qualityMetrics.averageScore}</p>
                        </div>
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('noMetrics')}</p>
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
