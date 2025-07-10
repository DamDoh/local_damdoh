"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Warehouse, Layers, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { WarehouseDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

export const WarehouseDashboard = () => {
    const t = useTranslations('WarehouseDashboard');
    const [dashboardData, setDashboardData] = useState<WarehouseDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getWarehouseData = useMemo(() => httpsCallable(functions, 'getWarehouseDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getWarehouseData();
                setDashboardData(result.data as WarehouseDashboardData);
            } catch (error) {
                console.error("Error fetching warehouse dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getWarehouseData]);

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

    const { storageOptimization, inventoryLevels, predictiveAlerts } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('utilizationTitle')}</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storageOptimization.utilization}%</div>
                        <p className="text-xs text-muted-foreground">{storageOptimization.suggestion}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventoryTitle')}</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryLevels.totalItems.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{inventoryLevels.itemsNeedingAttention} {t('itemsNeedingAttention')}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            {t('alertsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(predictiveAlerts || []).length > 0 ? (
                            (predictiveAlerts || []).map((alert, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <p>{alert.alert}</p>
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={alert.actionLink}>{t('investigateButton')}</Link>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noAlerts')}</p>
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
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);