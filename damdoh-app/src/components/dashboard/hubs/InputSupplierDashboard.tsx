
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Lightbulb, TrendingUp, PackageCheck, ShoppingCart, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { InputSupplierDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export const InputSupplierDashboard = () => {
    const { t } = useTranslation('common');
    const [dashboardData, setDashboardData] = useState<InputSupplierDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getInputSupplierData = useMemo(() => httpsCallable(functions, 'getInputSupplierDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getInputSupplierData();
                setDashboardData(result.data as InputSupplierDashboardData);
            } catch (error) {
                console.error("Error fetching input supplier dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getInputSupplierData]);
    
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

    const { demandForecast, productPerformance, activeOrders } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.inputSupplier.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.inputSupplier.ordersTitle')}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{activeOrders.count}</div>
                        <p className="text-xs text-muted-foreground">${activeOrders.value.toLocaleString()} {t('dashboard.hubs.inputSupplier.ordersValue')}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={activeOrders.link}>{t('dashboard.hubs.inputSupplier.manageOrdersButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.inputSupplier.promotionsTitle')}</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-xs text-muted-foreground pt-4">{t('dashboard.hubs.inputSupplier.promotionsDescription')}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/marketplace/promotions">{t('dashboard.hubs.inputSupplier.manageCouponsButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           {t('dashboard.hubs.inputSupplier.forecastTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {demandForecast.map(forecast => (
                           <div key={forecast.id} className="text-sm p-2 bg-background rounded-md border">
                               <p className="font-medium">{forecast.product} in <span className="font-semibold">{forecast.region}</span>: <span className="text-green-600 font-bold">{forecast.trend}</span></p>
                               <p className="text-xs text-muted-foreground">{forecast.reason}</p>
                           </div>
                       ))}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <PackageCheck className="h-4 w-4" />
                           {t('dashboard.hubs.inputSupplier.performanceTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {productPerformance.map(perf => (
                            <div key={perf.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{perf.productName} <Badge variant="secondary">{t('dashboard.hubs.inputSupplier.ratingLabel')}: {perf.rating}/5</Badge></p>
                                    <p className="text-xs text-muted-foreground italic">"{perf.feedback}"</p>
                                </div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={perf.link}>{t('dashboard.hubs.inputSupplier.reviewsButton')}</Link>
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
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
