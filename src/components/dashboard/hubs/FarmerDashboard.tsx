

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sprout, Home, FlaskConical, CalendarDays, Clock, PlusCircle, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FarmerDashboardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';


const StatCard = ({ title, value, icon, actionLink, actionLabel, unit, isCurrency = false, actionIcon }: { title: string, value: number, icon: React.ReactNode, actionLink: string, actionLabel: string, unit?: string, isCurrency?: boolean, actionIcon?: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
            {isCurrency && '$'}{value.toLocaleString(undefined, { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: isCurrency ? 2 : 0 })}
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={actionLink}>{actionIcon}{actionLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
);

const AlertIcon = ({ icon }: { icon: 'FlaskConical' | 'Sprout' }) => {
    const iconMap = {
        FlaskConical: FlaskConical,
        Sprout: Sprout
    };
    const IconComponent = iconMap[icon];
    return <IconComponent className="h-5 w-5" />;
};


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
    
    const { farmCount, cropCount, recentCrops = [], knfBatches = [], financialSummary, alerts = [] } = dashboardData;

    return (
        <div className="space-y-6">
             {alerts.length > 0 && (
                <Card className="border-primary/50 bg-primary/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <AlertCircle className="h-5 w-5 text-primary"/>
                           Farm Alerts & Next Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {alerts.map(alert => (
                           <div key={alert.id} className="flex justify-between items-center text-sm p-3 bg-background rounded-lg border">
                                <div className="flex items-center gap-3">
                                   <AlertIcon icon={alert.icon} />
                                    <span>{alert.message}</span>
                                </div>
                               <Button asChild variant="secondary" size="sm">
                                   <Link href={alert.link}>View</Link>
                               </Button>
                           </div>
                        ))}
                    </CardContent>
                </Card>
             )}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="My Farms" value={farmCount || 0} icon={<Home className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management/farms" actionLabel="Manage Farms" actionIcon={<Home className="mr-2 h-4 w-4" />} />
                <StatCard title="Active Crops" value={cropCount || 0} icon={<Sprout className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management/farms" actionLabel="Manage Crops" actionIcon={<Sprout className="mr-2 h-4 w-4" />} />
                <StatCard title="KNF Batches" value={(knfBatches || []).length} icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management/knf-inputs" actionLabel="Manage Inputs" actionIcon={<FlaskConical className="mr-2 h-4 w-4" />} />
                <StatCard title="Net Financials" value={financialSummary?.netFlow || 0} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} actionLink="/farm-management/financials" actionLabel="View Financials" isCurrency={true} actionIcon={<DollarSign className="mr-2 h-4 w-4" />}/>
             </div>
              <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>Recent Crops</span>
                        <Button asChild variant="secondary" size="sm"><Link href="/farm-management/create-farm"><PlusCircle className="h-4 w-4 mr-2"/>Add Crop</Link></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(recentCrops || []).length > 0 ? (recentCrops || []).map(crop => (
                        <div key={crop.id} className="p-2 border rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">{crop.name} <span className="text-xs text-muted-foreground">on {crop.farmName}</span></p>
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
                    {(knfBatches || []).length > 0 ? (knfBatches || []).map(batch => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
    </div>
);
