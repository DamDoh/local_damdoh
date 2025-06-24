
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { CheckCircle, XCircle, BarChart, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { QaDashboardData } from '@/lib/types';

export const QaDashboard = () => {
    const [dashboardData, setDashboardData] = useState<QaDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getQaData = useMemo(() => httpsCallable(functions, 'getQaDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getQaData();
                setDashboardData(result.data as QaDashboardData);
            } catch (error) {
                console.error("Error fetching QA dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getQaData]);

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

    const { pendingInspections, recentResults, qualityMetrics } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quality Assurance Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Inspections</CardTitle>
                        <Microscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInspections.length}</div>
                        <p className="text-xs text-muted-foreground">items awaiting quality check</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{qualityMetrics.passRate}%</div>
                        <p className="text-xs text-muted-foreground">based on recent inspections</p>
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Recent Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentResults.map(res => (
                            <div key={res.id} className="flex items-center justify-between text-sm">
                                <span>{res.productName}</span>
                                {res.result === 'Pass' ? 
                                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                    <XCircle className="h-4 w-4 text-red-500" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base">Inspection Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pendingInspections.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground">Seller: {item.sellerName} | Batch: {item.batchId}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={item.actionLink}>Start Inspection</Link>
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
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);
