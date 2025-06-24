
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Sliders, Package, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProcessingUnitDashboardData } from '@/lib/types';

export const ProcessingUnitDashboard = () => {
    const [dashboardData, setDashboardData] = useState<ProcessingUnitDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getProcessingUnitData = useMemo(() => httpsCallable(functions, 'getProcessingUnitDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getProcessingUnitData();
                setDashboardData(result.data as ProcessingUnitDashboardData);
            } catch (error) {
                console.error("Error fetching processing unit dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getProcessingUnitData]);

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

    const { yieldOptimization, inventory, wasteReduction } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Processing Unit Operations</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Yield Optimization</CardTitle>
                        <Sliders className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yieldOptimization.currentYield}%</div>
                        <p className="text-xs text-muted-foreground">Potential: {yieldOptimization.potentialYield}%</p>
                        <p className="text-xs mt-2">{yieldOptimization.suggestion}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waste Reduction Insight</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wasteReduction.currentRate}%</div>
                        <p className="text-xs text-muted-foreground">{wasteReduction.insight}</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package />
                            Raw Material Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {inventory.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{item.product}</p>
                                    <p className="text-xs text-muted-foreground">Quality: {item.quality}</p>
                                </div>
                                <div className="font-bold">{item.tons} tons</div>
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
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
