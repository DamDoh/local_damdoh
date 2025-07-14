
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { AlertTriangle, BadgeCheck, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RegulatorDashboardData } from "@/lib/types";
import { useTranslations } from 'next-intl';

export const RegulatorDashboard = () => {
    const t = useTranslations('RegulatorDashboard');
    const [dashboardData, setDashboardData] = useState<RegulatorDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getRegulatorData = useMemo(() => httpsCallable(functions, 'getRegulatorDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getRegulatorData();
                setDashboardData(result.data as RegulatorDashboardData);
            } catch (error) {
                console.error("Error fetching regulator dashboard data:", error);
                setError(t('errors.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getRegulatorData, t]);
    
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

    const { complianceRiskAlerts, pendingCertifications, supplyChainAnomalies } = dashboardData;

    const getSeverityBadge = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'destructive';
            case 'medium':
            case 'warning':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {t('pendingCertificationsTitle')}
                        </CardTitle>
                        <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{pendingCertifications?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('reviewsOutstanding')}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="secondary" size="sm" className="w-full">
                            <Link href={pendingCertifications?.actionLink || '#'}>{t('reviewAllButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <AlertTriangle className="h-4 w-4 text-red-500" />
                           {t('riskAlertsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(complianceRiskAlerts || []).length > 0 ? (
                           (complianceRiskAlerts || []).map(alert => (
                           <div key={alert.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                               <div>
                                   <Badge variant={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                                   <p className="font-medium mt-1">{alert.issue}</p>
                                   <p className="text-xs text-muted-foreground">{alert.region}</p>
                               </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={alert.actionLink}>{t('investigateButton')}</Link>
                                </Button>
                           </div>
                       ))
                       ) : (
                       <p className="text-sm text-muted-foreground text-center py-4">{t('noComplianceAlerts')}</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            {t('anomaliesTitle')}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">
                       {(supplyChainAnomalies || []).length > 0 ? (
                           (supplyChainAnomalies || []).map(anomaly => (
                                <div key={anomaly.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <Badge variant={getSeverityBadge(anomaly.level)}>{anomaly.level}</Badge>
                                    <p className="mt-1">{anomaly.description}</p>
                                </div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={anomaly.vtiLink}>
                                        <ExternalLink className="h-3 w-3 mr-1.5" />
                                        {t('trackVtiButton')}
                                        </Link>
                                </Button>
                            </div>
                           ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noAnomalies')}</p>
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
