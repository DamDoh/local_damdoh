
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { UserCheck, Landmark, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FiDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const FiDashboard = () => {
    const { t } = useTranslation('common');
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
                <p className="text-muted-foreground">{t('dashboard.hubs.noData')}</p>
            </div>
        );
    }

    const { pendingApplications, portfolioAtRisk, marketUpdates } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.fi.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.fi.riskTitle')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold">{t('dashboard.hubs.fi.riskValue', { count: portfolioAtRisk.count })}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.hubs.fi.riskDescription', { value: portfolioAtRisk.value.toLocaleString() })}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="destructive" size="sm" className="w-full">
                            <Link href={portfolioAtRisk.actionLink}>{t('dashboard.hubs.fi.reviewRiskButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <UserCheck className="h-4 w-4" />
                           {t('dashboard.hubs.fi.applicationsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {pendingApplications.length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>{t('dashboard.hubs.fi.tableApplicant')}</TableHead>
                                       <TableHead>{t('dashboard.hubs.fi.tableAmount')}</TableHead>
                                       <TableHead>{t('dashboard.hubs.fi.tableRiskScore')}</TableHead>
                                       <TableHead className="text-right">{t('dashboard.hubs.fi.tableAction')}</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {pendingApplications.map(app => (
                                       <TableRow key={app.id}>
                                           <TableCell className="font-medium">{app.applicantName}</TableCell>
                                           <TableCell>${app.amount.toLocaleString()}</TableCell>
                                           <TableCell>{app.riskScore}</TableCell>
                                           <TableCell className="text-right">
                                               <Button asChild size="sm">
                                                   <Link href={app.actionLink}>{t('dashboard.hubs.fi.reviewButton')}</Link>
                                               </Button>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        ) : (
                            <p className="text-sm text-center py-4 text-muted-foreground">{t('dashboard.hubs.fi.noApplications')}</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Landmark className="h-4 w-4" />
                           {t('dashboard.hubs.fi.updatesTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {marketUpdates.map(update => (
                            <div key={update.id} className="text-sm p-3 border rounded-lg">
                                <p>{update.content}</p>
                                <Link href={update.actionLink} className="text-xs text-primary hover:underline mt-1">{t('dashboard.hubs.fi.learnMore')}</Link>
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
            <Skeleton className="h-40 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);
