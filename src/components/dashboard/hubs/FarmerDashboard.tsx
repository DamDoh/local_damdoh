
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Users, MessageSquare, BarChart2, Sprout, Tractor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrustScoreWidget } from './TrustScoreWidget';
import type { FarmerDashboardData } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import { Badge } from '@/components/ui/badge';


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

    const { farmCount, cropCount, recentCrops, trustScore, matchedBuyers } = dashboardData;
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Farmer Mission Control</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-primary" />
                            Farm Overview
                        </CardTitle>
                        <CardDescription>
                            A snapshot of your current farming operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                            <Tractor className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold">{farmCount}</p>
                                <p className="text-xs text-muted-foreground">Total Farms</p>
                            </div>
                       </div>
                       <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                            <Sprout className="h-8 w-8 text-green-500"/>
                             <div>
                                <p className="text-2xl font-bold">{cropCount}</p>
                                <p className="text-xs text-muted-foreground">Active Crops/Batches</p>
                            </div>
                       </div>
                       <div className="col-span-2">
                            <h4 className="text-sm font-semibold mb-2">Recently Added Crops</h4>
                            <div className="space-y-2">
                                {recentCrops && recentCrops.length > 0 ? recentCrops.map(crop => (
                                    <div key={crop.id} className="flex justify-between items-center p-2 border rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">{crop.name}</p>
                                            <p className="text-xs text-muted-foreground">{crop.farmName}</p>
                                        </div>
                                        <Badge variant="secondary">{crop.stage}</Badge>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground text-center py-4">No crops have been added yet.</p>
                                )}
                            </div>
                       </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <TrustScoreWidget reputationScore={trustScore.reputation} certifications={trustScore.certifications} />
                </div>
                
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            AI-Matched Buyer Opportunities
                        </CardTitle>
                     </CardHeader>
                    <CardContent className="space-y-3">
                        {matchedBuyers.map(buyer => (
                            <Card key={buyer.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3">
                               <div className="flex-grow">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-sm">{buyer.name}</h4>
                                        <span className="font-mono text-xs p-1 bg-accent/80 rounded-md">Match: {buyer.matchScore}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{buyer.request}</p>
                                </div>
                                <Button asChild size="sm" className="w-full sm:w-auto">
                                    <Link href={`/messages/new/${buyer.contactId}`}>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Initiate Contact
                                    </Link>
                                </Button>
                            </Card>
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
            <Skeleton className="h-80 rounded-lg lg:col-span-2" />
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
            <Skeleton className="h-48 rounded-lg lg:col-span-3" />
        </div>
    </div>
);
