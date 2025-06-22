
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { TrendingUp, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InputSupplierDashboardData {
    demandForecast: {
        region: string;
        product: string;
        trend: string;
    }[];
    activeOrders: number;
    productFeedback: {
        productName: string;
        rating: number;
        totalReviews: number;
    }[];
}

export const InputSupplierDashboard = () => {
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
                <p className="text-muted-foreground">Could not load dashboard data.</p>
            </div>
        );
    }

    const { demandForecast, activeOrders, productFeedback } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Input Supplier Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeOrders}</div>
                        <p className="text-xs text-muted-foreground">awaiting fulfillment</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp />
                            AI-Driven Demand Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {demandForecast.map((forecast, index) => (
                            <div key={index} className="text-sm">
                                <span className="font-semibold">{forecast.region}:</span> {forecast.product} ({forecast.trend})
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Star />
                            Product Performance Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {productFeedback.map((feedback, index) => (
                             <div key={index} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{feedback.productName}</p>
                                    <p className="text-xs text-muted-foreground">{feedback.totalReviews} reviews</p>
                                </div>
                                <div className="font-bold">{feedback.rating.toFixed(1)} ★</div>
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
            <Skeleton className="h-32 md:col-span-2" />
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);
