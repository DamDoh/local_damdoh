
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sprout, FlaskConical, Home, CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FarmerDashboardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const FarmerDashboard = () => {
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
                <p className="text-muted-foreground">Could not load dashboard data.</p>
            </div>
        );
    }

    const { farmCount, cropCount, recentCrops, knfBatches } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Farmer Mission Control</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Farms</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{farmCount}</div>
                        <p className="text-xs text-muted-foreground">registered farms</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Crops/Batches</CardTitle>
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cropCount}</div>
                        <p className="text-xs text-muted-foreground">crops & livestock currently tracked</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sprout className="h-4 w-4 text-primary" />
                            Recently Logged Crops
                        </CardTitle>
                        <CardDescription>Your most recent crop and livestock entries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentCrops.length > 0 ? recentCrops.map(crop => (
                            <div key={crop.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-semibold">{crop.cropType}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <CalendarDays className="h-3 w-3" />
                                        Planted: {format(new Date(crop.plantingDate), 'PPP')}
                                    </p>
                                </div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={`/farm-management/farms/${crop.farmId}`}>Manage</Link>
                                </Button>
                            </div>
                        )) : <p className="text-sm text-center text-muted-foreground py-4">No crops logged yet.</p>}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-primary" />
                            KNF Input Assistant Status
                        </CardTitle>
                        <CardDescription>Your active and ready Korean Natural Farming batches.</CardDescription>
                     </CardHeader>
                    <CardContent className="space-y-3">
                        {knfBatches.length > 0 ? knfBatches.map(batch => (
                            <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-semibold">{batch.typeName}</p>
                                    {batch.status === 'Ready' ? (
                                        <p className="text-xs text-green-600 font-medium flex items-center gap-1.5 mt-1">
                                            <CheckCircle className="h-3 w-3" /> Ready for Use
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                            <Clock className="h-3 w-3" /> {batch.nextStep} on {format(new Date(batch.nextStepDate), 'MMM d')}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={batch.status === 'Ready' ? 'default' : 'secondary'} className={batch.status === 'Ready' ? 'bg-green-600' : ''}>{batch.status}</Badge>
                            </div>
                        )) : <p className="text-sm text-center text-muted-foreground py-4">No active KNF batches.</p>}
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/farm-management/knf-inputs">Go to KNF Assistant</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-48 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-2" />
        </div>
    </div>
);
