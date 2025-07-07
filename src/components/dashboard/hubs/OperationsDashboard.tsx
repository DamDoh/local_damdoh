
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Server, Zap, AlertTriangle, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { OperationsDashboardData } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

export const OperationsDashboard = () => {
    const t = useTranslations('OperationsDashboard');
    const [dashboardData, setDashboardData] = useState<OperationsDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getOperationsData = useMemo(() => httpsCallable(functions, 'getOperationsDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getOperationsData();
                setDashboardData(result.data as OperationsDashboardData);
            } catch (error) {
                console.error("Error fetching operations dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getOperationsData]);
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No dashboard data available.</p>
            </div>
        );
    }
    
    const { vtiGenerationRate, dataPipelineStatus, flaggedEvents } = dashboardData;
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return 'text-green-500';
            case 'Degraded': return 'text-yellow-500';
            case 'Offline': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('vtiRateTitle')}</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{vtiGenerationRate.rate}</div>
                        <p className="text-xs text-muted-foreground">{vtiGenerationRate.unit}</p>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('pipelineStatusTitle')}</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getStatusColor(dataPipelineStatus.status)}`}>{dataPipelineStatus.status}</div>
                        <p className="text-xs text-muted-foreground">{t('lastCheck')} {formatDistanceToNow(new Date(dataPipelineStatus.lastChecked), { addSuffix: true })}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <AlertTriangle className="h-4 w-4 text-destructive" />
                           {t('flaggedEventsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(flaggedEvents || []).length > 0 ? (
                           (flaggedEvents || []).map(event => (
                               <div key={event.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                   <div>
                                       <Badge variant="destructive">{event.type}</Badge>
                                       <p className="font-medium mt-1">{event.description}</p>
                                   </div>
                                   <Button asChild variant="secondary" size="sm">
                                       <Link href={event.vtiLink}>
                                            <GitBranch className="h-3 w-3 mr-1.5" />
                                            {t('viewVtiButton')}
                                       </Link>
                                   </Button>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">{t('noFlaggedEvents')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-48 rounded-lg md:col-span-2" />
        </div>
    </div>
);
