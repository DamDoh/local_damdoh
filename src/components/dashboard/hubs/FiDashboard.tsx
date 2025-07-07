

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { UserCheck, PieChart, TrendingUp, Landmark, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { FiDashboardData, FinancialApplication } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from 'next-intl';

export const FiDashboard = () => {
    const t = useTranslations('FiDashboard');
    const [dashboardData, setDashboardData] = useState<FiDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getFiData = useMemo(() => httpsCallable(functions, 'getFiDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getFiData();
                setDashboardData(result.data as FiDashboardData);
            } catch (error) {
                console.error("Error fetching FI dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFiData]);
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No dashboard data available.</p>
            </div>
        );
    }
    
    const { pendingApplications, portfolioAtRisk, marketUpdates } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('riskTitle')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent className={`flex-grow ${portfolioAtRisk?.count > 0 ? 'text-destructive' : ''}`}>
                        <div className={`text-3xl font-bold ${portfolioAtRisk?.count > 0 ? 'text-destructive' : ''}`}>
                            {portfolioAtRisk?.count || 0} {t('accounts')}
                        </div>
                        <p className="text-sm text-muted-foreground">${(portfolioAtRisk?.value || 0).toLocaleString()} {t('value')}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="destructive" size="sm" className="w-full">
                            <Link href={portfolioAtRisk?.actionLink || '#'}>{t('reviewRiskButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <UserCheck className="h-4 w-4" />
                           {t('pendingApplicationsTitle')}
                           <Badge variant="secondary" className="ml-2 text-sm">
                               {pendingApplications?.length || 0} {t('total')}

                        </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(pendingApplications || []).length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.applicant')}</TableHead>
                                        <TableHead>{t('table.type')}</TableHead>
                                        <TableHead>{t('table.amount')}</TableHead>
                                        <TableHead>{t('table.riskScore')}</TableHead>
                                        <TableHead className="text-right">{t('table.action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApplications.map((app: FinancialApplication) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                                            <TableCell><Badge variant="outline">{app.type}</Badge></TableCell>
                                            <TableCell>${app.amount.toLocaleString()}</TableCell>
                                            <TableCell>{app.riskScore}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button asChild size="sm">
                                                    <Link href={`/fi/applications/${app.id}`}>{t('reviewButton')}</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noApplications')}</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Landmark className="h-4 w-4" />
                           {t('marketUpdatesTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(marketUpdates || []).length > 0 ? (
                            (marketUpdates || []).map(update => (
                                <div key={update.id} className="text-sm p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <p>{update.content}</p>
                                    <Link href={update.actionLink} className="text-xs text-primary hover:underline mt-1">{t('readMore')}</Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noUpdates')}</p>
                        )}
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
            <Skeleton className="h-40 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
