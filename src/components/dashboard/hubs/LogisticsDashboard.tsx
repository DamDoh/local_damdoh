
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Map, Truck, Flame, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LogisticsDashboardData {
    optimizedRoutes: {
        id: string;
        from: string;
        to: string;
        savings: string;
        actionLink: string;
    }[];
    shipmentStatus: {
        total: number;
        inTransit: number;
        delayed: number;
        actionLink: string;
    };
    demandHotspots: {
        id: string;
        location: string;
        product: string;
        demand: string;
        actionLink: string;
    }[];
}

export const LogisticsDashboard = () => {
    const [dashboardData, setDashboardData] = useState<LogisticsDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getLogisticsData = useMemo(() => httpsCallable(functions, 'getLogisticsDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getLogisticsData();
                setDashboardData(result.data as LogisticsDashboardData);
            } catch (error) {
                console.error("Error fetching logistics dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getLogisticsData]);
    
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

    const { shipmentStatus, demandHotspots, optimizedRoutes } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Logistics Coordination Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shipment Status</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{shipmentStatus.inTransit} / {shipmentStatus.total}</div>
                        <p className="text-xs text-muted-foreground">{shipmentStatus.delayed} delayed</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={shipmentStatus.actionLink}>Manage Shipments</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500"/>
                            Demand Hotspots
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {demandHotspots.map(hotspot => (
                           <div key={hotspot.id} className="flex justify-between items-center text-sm">
                               <div>
                                   <span className="font-bold">{hotspot.location}: </span>
                                   High demand for {hotspot.product}
                               </div>
                               <Button asChild variant="ghost" size="sm">
                                   <Link href={hotspot.actionLink}>View on Map</Link>
                               </Button>
                           </div>
                       ))}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <LineChart className="h-4 w-4" />
                           Optimized Route Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {optimizedRoutes.map(route => (
                            <div key={route.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{route.from} → {route.to}</p>
                                    <p className="text-xs text-green-600">Savings: {route.savings}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={route.actionLink}>View Plan</Link>
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
            <Skeleton className="h-40 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
