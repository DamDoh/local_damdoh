

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Truck, Clock, Briefcase, BarChart, ExternalLink, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { LogisticsDashboardData } from '@/lib/types'; // Import the type
import { useTranslations } from 'next-intl';

export const LogisticsDashboard = () => {
    const t = useTranslations('LogisticsDashboard');
    const [dashboardData, setDashboardData] = useState<LogisticsDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getLogisticsData = useMemo(() => httpsCallable(functions, 'dashboardData-getLogisticsDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getLogisticsData();
                setDashboardData(result.data as LogisticsDashboardData);
            } catch (error) {
                console.error("Error fetching logistics dashboard data:", error);
                setError(t('errors.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getLogisticsData, t]);
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('noData')}</p>
            </div>
        );
    }

    const { activeShipments, incomingJobs, performanceMetrics } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('performanceTitle')}</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{performanceMetrics?.onTimePercentage || 0}%</div>
                        <p className="text-xs text-muted-foreground">{t('onTimeDelivery')}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            
                            <Link href={performanceMetrics?.actionLink || '#'}>{t('viewReportButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Truck className="h-4 w-4" />
                           {t('activeShipmentsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(activeShipments || []).length > 0 ? (
                           (activeShipments || []).map(shipment => (
                               <div key={shipment.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                   <div>
                                       <p className="font-medium">{t('to')}: {shipment.to}</p>
                                       <Badge variant={shipment.status === 'Delayed' ? 'destructive' : 'secondary'} className="mt-1">{shipment.status}</Badge>
                                   </div>
                                   <Button asChild variant="ghost" size="sm" disabled={shipment.vtiLink === '#'}>
                                       <Link href={shipment.vtiLink}>
                                            <GitBranch className="h-3 w-3 mr-1.5" />
                                            {t('trackButton')}
                                       </Link>
                                   </Button>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">{t('noActiveShipments')}</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Briefcase className="h-4 w-4" />
                           {t('incomingJobsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(incomingJobs || []).length > 0 ? (
                           (incomingJobs || []).map(job => (
 <div key={job.id} className="flex items-center justify-between text-sm p-2 border rounded-lg">
                                    <div className="flex items-center gap-3">
 <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{t('from')}: {job.from} → {job.to}</p>
                                        <p className="text-xs text-muted-foreground">{job.product} ({job.requirements})</p>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={job.actionLink}>{t('acceptJobButton')}</Link>
                                    </Button>
                                </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">{t('noIncomingJobs')}</p>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
