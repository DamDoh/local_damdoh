
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Box, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackagingSupplierDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export const PackagingSupplierDashboard = () => {
    const { t } = useTranslation('common');
    const [dashboardData, setDashboardData] = useState<PackagingSupplierDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getPackagingData = useMemo(() => httpsCallable(functions, 'getPackagingSupplierDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getPackagingData();
                setDashboardData(result.data as PackagingSupplierDashboardData);
            } catch (error) {
                console.error("Error fetching packaging supplier dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getPackagingData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('dashboard.hubs.noData')}</p>
            </div>
        );
    }

    const { demandForecast, integrationRequests, sustainableShowcase } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.packaging.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.packaging.forecastTitle')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{demandForecast.unitsNeeded.toLocaleString()} {t('dashboard.hubs.packaging.unitsLabel')}</div>
                        <p className="text-xs text-muted-foreground">{demandForecast.productType} {t('for')} {demandForecast.for}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.packaging.showcaseTitle')}</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sustainableShowcase.leads} {t('dashboard.hubs.packaging.leadsLabel')}</div>
                        <p className="text-xs text-muted-foreground">{t('from')} {sustainableShowcase.views.toLocaleString()} {t('dashboard.hubs.packaging.viewsLabel')}</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package />
                            {t('dashboard.hubs.packaging.requestsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {integrationRequests.map((req, index) => (
                             <div key={index} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{t('dashboard.hubs.packaging.fromLabel')}: {req.from}</p>
                                    <p className="text-xs text-muted-foreground">{req.request}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={req.actionLink}>{t('dashboard.hubs.packaging.viewRequestButton')}</Link>
                                </Button>
                            </div>
                        ))}
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
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);
