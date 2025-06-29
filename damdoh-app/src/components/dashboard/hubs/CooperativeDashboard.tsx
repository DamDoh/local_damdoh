
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
import { useTranslation } from 'react-i18next';

export const CooperativeDashboard = () => {
    const { t } = useTranslation('common');
    const [dashboardData, setDashboardData] = useState<CooperativeDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getCooperativeData = useMemo(() => httpsCallable(functions, 'getCooperativeDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getCooperativeData();
                setDashboardData(result.data as CooperativeDashboardData);
            } catch (error) {
                console.error("Error fetching cooperative dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getCooperativeData]);
    
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

    const { memberCount, totalLandArea, aggregatedProduce, pendingMemberApplications } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.cooperative.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.cooperative.totalMembers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memberCount}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.hubs.cooperative.membersInCoop')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.cooperative.totalLand')}</CardTitle>
                        <LandPlot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLandArea.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.hubs.cooperative.landUnit')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.hubs.cooperative.pendingApps')}</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingMemberApplications}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.hubs.cooperative.newFarmers')}</p>
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Package className="h-4 w-4" />
                           {t('dashboard.hubs.cooperative.produceTitle')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.hubs.cooperative.produceDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>{t('dashboard.hubs.cooperative.tableProduct')}</TableHead>
                                <TableHead>{t('dashboard.hubs.cooperative.tableQuantity')}</TableHead>
                                <TableHead>{t('dashboard.hubs.cooperative.tableQuality')}</TableHead>
                                <TableHead>{t('dashboard.hubs.cooperative.tableReadyBy')}</TableHead>
                                <TableHead className="text-right">{t('dashboard.hubs.cooperative.tableAction')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aggregatedProduce.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell><Badge variant="outline">{item.quality}</Badge></TableCell>
                                        <TableCell>{new Date(item.readyBy).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" asChild>
                                                <Link href={`/marketplace/create?batchId=${item.id}&productName=${item.productName}`}>
                                                    <CircleDollarSign className="mr-2 h-4 w-4" />
                                                    {t('dashboard.hubs.cooperative.createListingButton')}
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter>
                        <Button variant="secondary" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('dashboard.hubs.cooperative.aggregateButton')}
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
