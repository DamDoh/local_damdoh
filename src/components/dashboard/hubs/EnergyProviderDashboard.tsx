
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Zap, Target, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { EnergyProviderDashboardData } from '@/lib/types';

export const EnergyProviderDashboard = () => {
    const [dashboardData, setDashboardData] = useState<EnergyProviderDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getEnergyProviderData = useMemo(() => httpsCallable(functions, 'getEnergyProviderDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getEnergyProviderData();
                setDashboardData(result.data as EnergyProviderDashboardData);
            } catch (error) {
                console.error("Error fetching energy provider dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getEnergyProviderData]);

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

    const { highPotentialLeads, carbonImpact, pendingProposals } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Energy Solutions Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingProposals}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CO₂ Saved This Year</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{carbonImpact.savedThisYear} tons</div>
                        <p className="text-xs text-muted-foreground">from {carbonImpact.totalProjects} projects</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target />
                            High-Potential Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {highPotentialLeads.map(lead => (
                            <div key={lead.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{lead.name}</p>
                                    <p className="text-xs text-muted-foreground">Potential Savings: {lead.potentialSaving}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={lead.actionLink}>View Profile</Link>
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
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);
