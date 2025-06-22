
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Users, AlertTriangle, Camera, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface FieldAgentDashboardData {
    farmerPortfolio: {
        id: string;
        name: string;
        lastVisit: string;
        issues: number;
        actionLink: string;
    }[];
    diagnosticRequests: {
        id: string;
        farmerName: string;
        issue: string;
        imageUrl: string;
        actionLink: string;
    }[];
    scheduledVisits: {
        id: string;
        farmerName: string;
        date: string;
        purpose: string;
    }[];
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

    const { farmerPortfolio, diagnosticRequests, scheduledVisits } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Field Agent Operations Center</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <Card className="lg:col-span-1">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users />
                            Farmer Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {farmerPortfolio.map(farmer => (
                            <div key={farmer.id} className="flex items-center justify-between text-sm p-2 border rounded-lg">
                                <div>
                                    <Link href={farmer.actionLink} className="font-semibold hover:underline">{farmer.name}</Link>
                                    <p className="text-xs text-muted-foreground">Last visit: {new Date(farmer.lastVisit).toLocaleDateString()}</p>
                                </div>
                                {farmer.issues > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Camera />
                           AI Diagnostic Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {diagnosticRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Image src={req.imageUrl} alt="Issue" width={40} height={40} className="rounded-md" />
                                    <div>
                                        <p className="text-sm font-medium">{req.issue}</p>
                                        <p className="text-xs text-muted-foreground">From: {req.farmerName}</p>
                                    </div>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={req.actionLink}>Analyze</Link>
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Calendar />
                           Scheduled Visits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {scheduledVisits.map(visit => (
                            <div key={visit.id} className="text-sm p-3 border rounded-lg">
                                <p className="font-semibold">{visit.farmerName} - {new Date(visit.date).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">{visit.purpose}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg lg:col-span-2" />
            <Skeleton className="h-48 rounded-lg lg:col-span-3" />
        </div>
    </div>
);
