
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { TrendingUp, Droplets, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrustScoreWidget } from './TrustScoreWidget';
import type { FarmerDashboardData } from '@/lib/types'; // Import the FarmerDashboardData type

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

    const { predictedYield, irrigationSchedule, matchedBuyers, trustScore } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Farmer Mission Control</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                <TrustScoreWidget reputationScore={trustScore.reputation} certifications={trustScore.certifications} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI-Predicted Yield</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{predictedYield.crop}: {predictedYield.variance}</div>
                        <p className="text-xs text-muted-foreground">Confidence: {predictedYield.confidence}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Irrigation</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{irrigationSchedule.next_run}</div>
                        <p className="text-xs text-muted-foreground">{irrigationSchedule.recommendation}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 xl:col-span-1">
                     <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Buyer Opportunities
                        </CardTitle>
                     </CardHeader>
                    <CardContent className="space-y-2">
                        {matchedBuyers.map(buyer => (
                            <Card key={buyer.id} className="flex flex-col p-3">
                               <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm">{buyer.name}</h4>
                                    <span className="font-mono text-xs p-1 bg-accent rounded-md">{buyer.matchScore}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3 flex-grow">{buyer.request}</p>
                                <Button asChild size="sm" className="w-full">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
        </div>
    </div>
);
