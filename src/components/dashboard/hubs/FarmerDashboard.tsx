
"use client";

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sprout, Users, DollarSign, Clock4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FarmerDashboardData } from '@/lib/types';
import { TrustScoreWidget } from './TrustScoreWidget';

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sprout className="h-4 w-4" />
                            Yield Insights (Historical vs. Predicted)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={yieldData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="crop" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} unit={yieldData[0]?.unit.split('/')[1]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="historical" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="predicted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI Matched Buyers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{matchedBuyers.length}</div>
                            <p className="text-xs text-muted-foreground">potential buyers found</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Irrigation Run</CardTitle>
                            <Clock4 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{irrigationSchedule.next_run}</div>
                            <p className="text-xs text-muted-foreground">{irrigationSchedule.recommendation}</p>
                        </CardContent>
                    </Card>
                </div>
                
                 <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Users className="h-4 w-4" />
                           Top Matched Buyers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {matchedBuyers.map(buyer => (
                           <div key={buyer.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border mb-2">
                               <div>
                                   <p className="font-medium">{buyer.name}</p>
                                   <p className="text-xs text-muted-foreground">{buyer.request}</p>
                               </div>
                               <Button asChild size="sm">
                                   <Link href={`/profiles/${buyer.contactId}`}>Contact</Link>
                               </Button>
                           </div>
                       ))}
                    </CardContent>
                </Card>
                
                <TrustScoreWidget reputationScore={trustScore.reputation} certifications={trustScore.certifications} />
                
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Financial Health
                        </CardTitle>
                        <CardDescription>Track your farm's income and expenses to understand profitability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">Financial tracking tools are coming soon to help you manage your business.</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline">
                            <Link href="/farm-management/financials">Go to Financials Dashboard</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-lg col-span-1 lg:col-span-2" />
            <div className="space-y-6">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
            </div>
            <Skeleton className="h-48 rounded-lg col-span-1 lg:col-span-2" />
            <Skeleton className="h-48 rounded-lg" />
        </div>
    </div>
);
