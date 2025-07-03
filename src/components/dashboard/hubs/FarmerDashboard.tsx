
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sprout, Home, FlaskConical, CalendarDays, Clock, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FarmerDashboardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon, actionLink, actionLabel }: { title: string, value: number, icon: React.ReactNode, actionLink: string, actionLabel: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={actionLink}>{actionLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
);

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
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="My Farms" value={farmCount || 0} icon={<Home className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management" actionLabel="Manage Farms"/>
                <StatCard title="Active Crops" value={cropCount || 0} icon={<Sprout className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management" actionLabel="Manage Crops"/>
                <StatCard title="KNF Batches" value={knfBatches?.length || 0} icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management/knf-inputs" actionLabel="Manage Inputs" />
             </div>
              <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>Recent Crops</span>
                        <Button asChild variant="secondary" size="sm"><Link href="/farm-management/create-farm"><PlusCircle className="h-4 w-4 mr-2"/>Add Crop</Link></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recentCrops && recentCrops.length > 0 ? recentCrops.map(crop => (
                        <div key={crop.id} className="p-2 border rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">{crop.cropType}</p>
                                {crop.plantingDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Planted on {format(new Date(crop.plantingDate), "PPP")}</p>}
                            </div>
                            <Button size="sm" variant="outline" asChild><Link href={`/farm-management/farms/${crop.farmId}`}>View</Link></Button>
                        </div>
                    )) : <p className="text-sm text-center text-muted-foreground py-4">No crops added yet.</p>}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>Active KNF Batches</span>
                         <Button asChild variant="secondary" size="sm"><Link href="/farm-management/knf-inputs"><PlusCircle className="h-4 w-4 mr-2"/>Add Batch</Link></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {knfBatches && knfBatches.length > 0 ? knfBatches.map(batch => (
                         <div key={batch.id} className="p-2 border rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">{batch.typeName}</p>
                                {batch.nextStepDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Next step {formatDistanceToNow(new Date(batch.nextStepDate), { addSuffix: true })}</p>}
                            </div>
                            <Badge variant={batch.status === 'Ready' ? 'default' : 'secondary'}>{batch.status}</Badge>
                        </div>
                    )) : <p className="text-sm text-center text-muted-foreground py-4">No KNF batches started.</p>}
                </CardContent>
            </Card>

        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
    </div>
);

    