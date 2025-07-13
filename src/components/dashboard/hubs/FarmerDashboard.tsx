
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sprout, Home, FlaskConical, CalendarDays, Clock, PlusCircle, DollarSign, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FarmerDashboardData, FarmerDashboardAlert } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

// Helper components defined as standalone functions at the top level
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
        </div>
    );
}

function AlertIcon({ icon }: { icon: FarmerDashboardAlert['icon'] }) {
    const iconMap = {
        FlaskConical: FlaskConical,
        Sprout: Sprout
    };
    const IconComponent = iconMap[icon];
    return <IconComponent className="h-5 w-5" />;
}

// Main Dashboard Component
export function FarmerDashboard() {
    const t = useTranslations('FarmerDashboard');
    const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getFarmerData = useMemo(() => httpsCallable(functions, 'getFarmerDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFarmerData();
                setDashboardData(result.data as FarmerDashboardData);
            } catch (error) {
                console.error("Error fetching farmer dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFarmerData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('noData')}</p>
            </div>
        );
    }
    
    const { farmCount, cropCount, recentCrops = [], knfBatches = [], financialSummary, alerts = [] } = dashboardData;

    return (
        <div className="space-y-6">
            {alerts.length > 0 && (
            <Card className="border-primary/50 bg-primary/10">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary"/>
                        {t('alertsTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {alerts.map(alert => (
                        <div key={alert.id} className="flex justify-between items-center text-sm p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-3">
                                <AlertIcon icon={alert.icon} />
                                <span>{alert.message}</span>
                            </div>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={alert.link}>{t('viewButton')}</Link>
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card key="farms" className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('cards.farms.title')}</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-2xl font-bold">{(farmCount || 0).toLocaleString()}</div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/farm-management/farms" className="flex items-center justify-center"><Home className="mr-2 h-4 w-4" />{t('cards.farms.button')}</Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card key="crops" className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('cards.crops.title')}</CardTitle>
                    <Sprout className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-2xl font-bold">{(cropCount || 0).toLocaleString()}</div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/farm-management/farms" className="flex items-center justify-center"><Sprout className="mr-2 h-4 w-4" />{t('cards.crops.button')}</Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card key="knf" className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('cards.knf.title')}</CardTitle>
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-2xl font-bold">{(knfBatches || []).length.toLocaleString()}</div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/farm-management/knf-inputs" className="flex items-center justify-center"><FlaskConical className="mr-2 h-4 w-4" />{t('cards.knf.button')}</Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card key="financials" className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('cards.financials.title')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-2xl font-bold">${(financialSummary?.netFlow || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/farm-management/financials" className="flex items-center justify-center"><DollarSign className="mr-2 h-4 w-4" />{t('cards.financials.button')}</Link>
                    </Button>
                </CardFooter>
            </Card>
            </div>
            {financialSummary && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        {t('financials.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1"><ArrowUp className="h-4 w-4 text-green-500" /> {t('financials.income')}:</span>
                            <span className="font-bold text-green-600">${financialSummary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1"><ArrowDown className="h-4 w-4 text-red-500" /> {t('financials.expense')}:</span>
                            <span className="font-bold text-red-600">${financialSummary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
            <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{t('recentCrops.title')}</span>
                    <Button asChild variant="secondary" size="sm"><Link href="/farm-management/create-farm"><PlusCircle className="h-4 w-4 mr-2"/>{t('recentCrops.button')}</Link></Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {(recentCrops || []).length > 0 ? (recentCrops || []).map(crop => (
                    <div key={crop.id} className="p-2 border rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium text-sm">{crop.name} <span className="text-xs text-muted-foreground">{t('recentCrops.onFarm')} {crop.farmName}</span></p>
                            {crop.plantingDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {t('recentCrops.plantedOn')} {format(new Date(crop.plantingDate), "PPP")}</p>}
                        </div>
                        <Button size="sm" variant="outline" asChild><Link href={`/farm-management/farms/${crop.farmId}`}>{t('viewButton')}</Link></Button>
                    </div>
                )) : <p className="text-sm text-center text-muted-foreground py-4">{t('recentCrops.noCrops')}</p>}
            </CardContent>
        </Card>
            <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{t('knfBatches.title')}</span>
                        <Button asChild variant="secondary" size="sm"><Link href="/farm-management/knf-inputs"><PlusCircle className="h-4 w-4 mr-2"/>{t('knfBatches.button')}</Link></Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {(knfBatches || []).length > 0 ? (knfBatches || []).map(batch => (
                        <div key={batch.id} className="p-2 border rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium text-sm">{batch.typeName}</p>
                            {batch.nextStepDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t('knfBatches.nextStep')} {formatDistanceToNow(new Date(batch.nextStepDate), { addSuffix: true })}</p>}
                        </div>
                        <Badge variant={batch.status === 'Ready' ? 'default' : 'secondary'}>{batch.status}</Badge>
                    </div>
                )) : <p className="text-sm text-center text-muted-foreground py-4">{t('knfBatches.noBatches')}</p>}
            </CardContent>
        </Card>
        </div>
    );
}
