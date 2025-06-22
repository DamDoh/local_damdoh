
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { UserCheck, PieChart, TrendingUp, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FiDashboardData {
    creditRiskAssessments: {
        id: string;
        name: string;
        score: number;
        recommendation: string;
        actionLink: string;
    }[];
    portfolioPerformance: {
        totalValue: number;
        nonPerforming: number;
        actionLink: string;
    };
    emergingOpportunities: {
        id: string;
        sector: string;
        region: string;
        potential: string;
        actionLink: string;
    }[];
}

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

    const { portfolioPerformance, emergingOpportunities, creditRiskAssessments } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Financial Institution Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Performance</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">${portfolioPerformance.totalValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{portfolioPerformance.nonPerforming * 100}% non-performing</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={portfolioPerformance.actionLink}>View Detailed Report</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <UserCheck className="h-4 w-4" />
                           Credit Risk Assessments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {creditRiskAssessments.map(assessment => (
                           <div key={assessment.id} className="flex justify-between items-center text-sm">
                               <div>
                                   <p className="font-medium">{assessment.name}</p>
                                   <p className="text-xs text-muted-foreground">Score: {assessment.score}</p>
                               </div>
                               <Button asChild variant="secondary" size="sm">
                                   <Link href={assessment.actionLink}>{assessment.recommendation}</Link>
                               </Button>
                           </div>
                       ))}
                    </CardContent>
                </Card>
                
                <Card className="flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           Emerging Opportunities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {emergingOpportunities.map(opp => (
                           <div key={opp.id} className="text-sm">
                               <Link href={opp.actionLink} className="font-medium hover:underline">{opp.sector}</Link>
                               <p className="text-xs text-muted-foreground">{opp.region} ({opp.potential})</p>
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
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
        </div>
    </div>
);
