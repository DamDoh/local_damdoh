
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

export const InputSupplierDashboard = () => {
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
            <h1 className="text-3xl font-bold mb-6">Input Supplier Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{activeOrders?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">${(activeOrders?.value || 0).toLocaleString()} in total value</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={activeOrders?.link || '#'}>Manage Orders</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promotions</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-xs text-muted-foreground pt-4">Create and manage discount coupons to boost your sales.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/marketplace/promotions">Manage Coupons</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           AI-Powered Demand Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(demandForecast || []).length > 0 ? (
                           (demandForecast || []).map(forecast => (
                               <div key={forecast.id} className="text-sm p-2 bg-background rounded-md border">
                                   <p className="font-medium">{forecast.product} in <span className="font-semibold">{forecast.region}</span>: <span className="text-green-600 font-bold">{forecast.trend}</span></p>
                                   <p className="text-xs text-muted-foreground">{forecast.reason}</p>
                               </div>
                           ))
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No demand forecast available.</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <PackageCheck className="h-4 w-4" />
                           Product Performance Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(productPerformance || []).length > 0 ? (
                           (productPerformance || []).map(perf => (
                                <div key={perf.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{perf.productName} <Badge variant="secondary">Rating: {perf.rating}/5</Badge></p>
                                        <p className="text-xs text-muted-foreground italic">"{perf.feedback}"</p>
                                    </div>
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={perf.link}>View All Reviews</Link>
                                    </Button>
                                </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No product feedback yet.</p>
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
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
