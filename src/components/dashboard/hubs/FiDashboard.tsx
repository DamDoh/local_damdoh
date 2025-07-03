
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { UserCheck, PieChart, TrendingUp, Landmark, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

import type { FiDashboardData } from '@/lib/types'; // Import the FiDashboardData type

export const FiDashboard = () => {
    const [dashboardData, setDashboardData] = useState<FiDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getFiData = useMemo(() => httpsCallable(functions, 'getFiDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFiData();
                setDashboardData(result.data as FiDashboardData);
            } catch (error) {
                console.error("Error fetching FI dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFiData]);
    
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

    const { pendingApplications, portfolioAtRisk, marketUpdates } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Financial Institution Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio At Risk</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{portfolioAtRisk.count} Accounts</div>
                        <p className="text-xs text-muted-foreground">${portfolioAtRisk.value.toLocaleString()} value</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="destructive" size="sm" className="w-full">
                            <Link href={portfolioAtRisk.actionLink}>Review Risk</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <UserCheck className="h-4 w-4" />
                           Pending Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {pendingApplications?.length > 0 ? (
                           pendingApplications.map(app => (
                               <div key={app.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                   <div>
                                       <p className="font-medium">{app.applicantName} - ${app.amount.toLocaleString()}</p>
                                       <p className="text-xs text-muted-foreground">{app.type}</p>
                                   </div>
                                   <Button asChild size="sm">
                                       <Link href={app.actionLink}>Review</Link>
                                   </Button>
                               </div>
                           ))
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending applications.</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Landmark className="h-4 w-4" />
                           Market & Policy Updates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {marketUpdates?.length > 0 ? (
                            marketUpdates.map(update => (
                                <div key={update.id} className="text-sm p-3 border rounded-lg">
                                    <p>{update.content}</p>
                                    <Link href={update.actionLink} className="text-xs text-primary hover:underline mt-1">Read More</Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No new updates.</p>
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
            <Skeleton className="h-40 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
