
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { ShieldAlert, TrendingUp, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BuyerDashboardData } from '@/lib/types';

export const BuyerDashboard = () => {
    const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getBuyerData = useMemo(() => httpsCallable(functions, 'getBuyerDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getBuyerData();
                setDashboardData(result.data as BuyerDashboardData);
            } catch (error) {
                console.error("Error fetching buyer dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getBuyerData]);

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

    const { supplyChainRisk, sourcingRecommendations, marketPriceIntelligence } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Buyer Command Center</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Supply Chain Risk</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold text-orange-600">{supplyChainRisk.level}</div>
                        <p className="text-xs text-muted-foreground">{supplyChainRisk.factor}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={supplyChainRisk.action.link}>{supplyChainRisk.action.label}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Price Intelligence</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{marketPriceIntelligence.product}</div>
                        <p className="text-xs text-muted-foreground">{marketPriceIntelligence.forecast}</p>
                    </CardContent>
                     <CardFooter>
                        <Button asChild size="sm" className="w-full">
                           <Link href={marketPriceIntelligence.action.link}>{marketPriceIntelligence.action.label}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-2 lg:col-span-1">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Sourcing Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sourcingRecommendations.map(rec => (
                            <div key={rec.id} className="p-3 rounded-md border text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{rec.name}</p>
                                        <p className="text-xs text-muted-foreground">{rec.product}</p>
                                    </div>
                                    <Badge variant={rec.vtiVerified ? 'default' : 'secondary'}>
                                        {rec.vtiVerified ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                        VTI Verified
                                    </Badge>
                                </div>
                                <div className="text-xs mt-2">
                                    Reliability Score: <span className="font-bold">{rec.reliability}%</span>
                                </div>
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
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
        </div>
    </div>
);
