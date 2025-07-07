
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Users, LandPlot, Package, FileCheck, CircleDollarSign, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CooperativeDashboardData } from '@/lib/types';
import { BarChart } from "lucide-react";
import { useTranslations } from 'next-intl';

export const CooperativeDashboard = () => {
    const t = useTranslations('CooperativeDashboard');
    const [dashboardData, setDashboardData] = useState<CooperativeDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getCooperativeData = useMemo(() => httpsCallable(functions, 'getCooperativeDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getCooperativeData();
                setDashboardData(result.data as CooperativeDashboardData);
            } catch (error) {
                console.error("Error fetching cooperative dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getCooperativeData]);
    
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

    const { memberCount, totalLandArea, aggregatedProduce, pendingMemberApplications } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('membersTitle')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memberCount}</div>
                        <p className="text-xs text-muted-foreground">{t('membersDescription', { count: memberCount })}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('landAreaTitle')}</CardTitle>
                        <LandPlot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLandArea.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{t('landAreaDescription')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('pendingApplicationsTitle')}</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingMemberApplications}</div>
                        <p className="text-xs text-muted-foreground">{t('pendingApplicationsDescription')}</p>
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Package className="h-4 w-4" />
                           {t('produceTitle')}
                        </CardTitle>
                        <CardDescription>{t('produceDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>{t('table.product')}</TableHead>
                                <TableHead>{t('table.quantity')}</TableHead>
                                <TableHead>{t('table.quality')}</TableHead>
                                <TableHead>{t('table.readyBy')}</TableHead>
                                <TableHead className="text-right">{t('table.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(aggregatedProduce || []).length > 0 ? (
                                    (aggregatedProduce || []).map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell><Badge variant="outline">{item.quality}</Badge></TableCell>
                                            <TableCell>{new Date(item.readyBy).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" asChild>
                                                    <Link href={`/marketplace/create?batchId=${item.id}&productName=${item.productName}`}>
                                                        <CircleDollarSign className="mr-2 h-4 w-4" />
                                                        {t('createListingButton')}
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">{t('noProduce')}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter>
                        <Button variant="secondary" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('aggregateButton')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-64 rounded-lg md:col-span-3" />
        </div>
    </div>
);
