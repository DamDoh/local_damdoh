
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Award, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Chart as ChartComponent, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CertificationBodyDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

export const CertificationBodyDashboard = () => {
  const t = useTranslations('CertificationBodyDashboard');
  const [dashboardData, setDashboardData] = useState<CertificationBodyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCertificationBodyDashboardDataCallable = useMemo(() => httpsCallable<void, CertificationBodyDashboardData>(functions, 'getCertificationBodyDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCertificationBodyDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Certification Body dashboard data:", err);
        setError("Failed to load Certification Body dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getCertificationBodyDashboardDataCallable]);

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

  const { pendingAudits, certifiedEntities, standardsMonitoring } = dashboardData;

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
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Audits */}
         <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/>{t('auditsTitle')}</CardTitle>
             <CardDescription>{t('auditsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(pendingAudits || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.farmName')}</TableHead>
                     <TableHead>{t('table.standard')}</TableHead>
                     <TableHead>{t('table.dueDate')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(pendingAudits || []).map((audit) => (
                     <TableRow key={audit.id}>
                       <TableCell className="font-medium">{audit.farmName}</TableCell>
                       <TableCell>{audit.standard}</TableCell>
                       <TableCell>{new Date(audit.dueDate).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={audit.actionLink}>{t('scheduleAuditButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noPendingAudits')}</p>
             )}
           </CardContent>
         </Card>

         {/* Certified Entities */}
         <Card>
           <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <Award className="h-4 w-4 text-yellow-500" />
 {t("entitiesTitle")}
 </CardTitle>
 <CardDescription>{t("entitiesDescription")}</CardDescription>
 </CardHeader>
 <CardContent>
 {certifiedEntities && certifiedEntities.length > 0 ? (
 <ChartContainer
 config={{
 active: { color: "hsl(var(--chart-1))" },
 "pending renewal": { color: "hsl(var(--chart-2))" },
 expired: { color: "hsl(var(--chart-3))" },
 }}
 className="mx-auto aspect-square h-[200px]"
 >
 <ChartComponent
 data={Object.entries(
 certifiedEntities.reduce((acc, entity) => {
 acc[entity.certificationStatus] = (acc[entity.certificationStatus] || 0) + 1;
 return acc;
 }, {} as Record<string, number>)
 ).map(([status, count]) => ({ status, count }))}
 >
 <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
 </ChartComponent>
 </ChartContainer>
 ) : (
 <p className="text-sm text-muted-foreground text-center py-4">
 {t("noCertifiedEntities")}
 </p>
 )}
 </CardContent>
 </Card>
 {/* Certified Entities - Table View (Optional, could be a separate tab or detail view) */}
 {/* <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-yellow-500"/>{t('entitiesTitle')}</CardTitle>
             <CardDescription>{t('entitiesDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(certifiedEntities || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.name')}</TableHead>
                     <TableHead>{t('table.type')}</TableHead>
                     <TableHead>{t('table.status')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(certifiedEntities || []).map((entity) => (
                     <TableRow key={entity.id}>
                       <TableCell className="font-medium">{entity.name}</TableCell>
                       <TableCell>{entity.type}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(entity.certificationStatus)}>{entity.certificationStatus}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={entity.actionLink}>{t('viewDetailsButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noCertifiedEntities')}</p>
             )}
           </CardContent>
         </Card>

          {/* Standards Monitoring */}
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/>{t('monitoringTitle')}</CardTitle>
                <CardDescription>{t('monitoringDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {(standardsMonitoring || []).length > 0 ? (
                    <div className="space-y-3">
                        {(standardsMonitoring || []).map((monitoring, index) => (
                            <div key={index} className="text-sm">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{monitoring.standard}</p>
                                    <Badge variant="secondary">{monitoring.adherenceRate}%</Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${monitoring.adherenceRate}%` }}></div>
                                </div>
                                {monitoring.alerts > 0 && (
                                     <p className="text-xs text-destructive mt-1">{monitoring.alerts} {t('alerts')}</p>
                                )}
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={monitoring.actionLink}>{t('viewDetailsButton')}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('noMonitoringData')}</p>
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
