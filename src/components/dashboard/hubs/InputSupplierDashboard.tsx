
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { TrendingUp, PackageCheck, ShoppingCart, Ticket, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { InputSupplierDashboardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';


export const InputSupplierDashboard = () => {
    const t = useTranslations('InputSupplierDashboard');
    const [dashboardData, setDashboardData] = useState<InputSupplierDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getInputSupplierData = useMemo(() => httpsCallable(functions, 'getInputSupplierDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getInputSupplierData();
                setDashboardData(result.data as InputSupplierDashboardData);
            } catch (error) {
                console.error("Error fetching input supplier dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getInputSupplierData]);
    
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

    const { demandForecast, productPerformance, activeOrders } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('ordersTitle')}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-3xl font-bold mb-1">{activeOrders?.count || 0}</div>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">${(activeOrders?.value || 0).toLocaleString()}</span> {t('totalValue')}
                        </p>
                         {/* Placeholder for potential future visualization like a small trend line or breakdown */}
                         <div className="h-8 w-full">{/* Chart placeholder */}</div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={activeOrders?.link || '#'}>{t('manageOrdersButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           {t('forecastTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(demandForecast || []).length > 0 ? (
                           (demandForecast || []).map(forecast => (
                               <div key={forecast.id} className="flex items-center text-sm p-2 bg-background rounded-md border">
                                    {forecast.trend === 'High' && <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />}
                                    {forecast.trend === 'Low' && <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />}
                                    {forecast.trend !== 'High' && forecast.trend !== 'Low' && <TrendingUp className="h-4 w-4 text-muted-foreground mr-2 opacity-50" />}
                                   <p className="font-medium">{forecast.product} {t('in')} <span className="font-semibold">{forecast.region}</span>: <span className="text-green-600 font-bold">{forecast.trend}</span></p>
                                   <p className="text-xs text-muted-foreground">{forecast.reason}</p>
                               </div>
                           ))
                       ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">{t('noForecast')}</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <PackageCheck className="h-4 w-4" />
                           {t('performanceTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(productPerformance || []).length > 0 ? (
                           (productPerformance || []).map(perf => (
                                <div key={perf.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                    <div>
                                        <p className="font-medium flex items-center">
                                            {perf.productName}
                                            <span className="ml-2 flex items-center text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < perf.rating ? 'fill-current' : ''}`} />
                                                ))}
                                            </span></p>
                                        <p className="text-xs text-muted-foreground italic">"{perf.feedback}"</p>
                                    </div>
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={perf.link}>{t('viewReviewsButton')}</Link>
                                    </Button>
                                </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">{t('noFeedback')}</p>
                       )}
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Ticket className="h-4 w-4" />
                           {t('promotionsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{t('promotionsDescription')}</p>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/marketplace/promotions">{t('manageCouponsButton')}</Link>
                        </Button>
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
