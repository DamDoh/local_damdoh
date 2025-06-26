
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Droplets, Users, MessageSquare, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrustScoreWidget } from './TrustScoreWidget';
import type { FarmerDashboardData } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"


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

    const { yieldData, irrigationSchedule, matchedBuyers, trustScore } = dashboardData;
    
    const chartConfig = {
      predicted: {
        label: "AI Predicted",
        color: "hsl(var(--chart-1))",
      },
      historical: {
        label: "Historical Avg.",
        color: "hsl(var(--chart-2))",
      },
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Farmer Mission Control</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-primary" />
                            Yield Performance
                        </CardTitle>
                        <CardDescription>
                            Historical yield vs. AI-powered prediction for this season.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                         <BarChart accessibilityLayer data={yieldData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="crop"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              unit=" T"
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent 
                                    labelFormatter={(label, payload) => {
                                        const data = payload && payload.length ? payload[0].payload : null;
                                        return data ? `${data.crop} (${data.unit})` : label;
                                    }}
                                />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="historical" fill="var(--color-historical)" radius={4} />
                            <Bar dataKey="predicted" fill="var(--color-predicted)" radius={4} />
                          </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <TrustScoreWidget reputationScore={trustScore.reputation} certifications={trustScore.certifications} />

                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Irrigation</CardTitle>
                            <Droplets className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{irrigationSchedule.next_run}</div>
                            <p className="text-xs text-muted-foreground">{irrigationSchedule.recommendation}</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Buyer Opportunities
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
