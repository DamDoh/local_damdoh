
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Users, Leaf, ClipboardList, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface FieldAgentDashboardData {
    assignedFarmers: {
        id: string;
        name: string;
        lastVisit: string;
        issues: number;
        actionLink: string;
    }[];
    portfolioHealth: {
        overallScore: number;
        alerts: string[];
        actionLink: string;
    };
    pendingReports: number;
    dataVerificationTasks: {
        count: number;
        description: string;
        actionLink: string;
    };
}

export const FieldAgentDashboard = () => {
    const [dashboardData, setDashboardData] = useState<FieldAgentDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getFieldAgentData = useMemo(() => httpsCallable(functions, 'getFieldAgentDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFieldAgentData();
                setDashboardData(result.data as FieldAgentDashboardData);
            } catch (error) {
                console.error("Error fetching field agent dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFieldAgentData]);
    
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

    const { assignedFarmers, portfolioHealth, pendingReports, dataVerificationTasks } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Field Agent & Agronomist Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{portfolioHealth.overallScore}%</div>
                        <p className="text-xs text-muted-foreground">{portfolioHealth.alerts.length} active alerts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReports}</div>
                        <p className="text-xs text-muted-foreground">reports to be filed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Verification</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dataVerificationTasks.count}</div>
                        <p className="text-xs text-muted-foreground">tasks pending</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Farmers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignedFarmers.length}</div>
                        <p className="text-xs text-muted-foreground">farmers in your portfolio</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Users className="h-4 w-4" />
                           Farmer Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {assignedFarmers.map(farmer => (
                            <div key={farmer.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{farmer.name}</p>
                                    <p className="text-xs text-muted-foreground">Last Visit: {farmer.lastVisit}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {farmer.issues > 0 && <Badge variant="destructive">{farmer.issues} Issues</Badge>}
                                    <Button asChild size="sm">
                                        <Link href={farmer.actionLink}>View Farmer</Link>
                                    </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-48 rounded-lg col-span-1 md:col-span-2 lg:col-span-4" />
        </div>
    </div>
);
