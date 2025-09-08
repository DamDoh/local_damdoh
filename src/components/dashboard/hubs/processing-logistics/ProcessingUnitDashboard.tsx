
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Sliders, Package, Trash2, Box, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ProcessingUnitDashboardData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from 'next-intl';

export const ProcessingUnitDashboard = () => {
    const t = useTranslations('ProcessingUnitDashboard');
    const [dashboardData, setDashboardData] = useState<ProcessingUnitDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getProcessingUnitData = useMemo(() => httpsCallable(functions, 'dashboardData-getProcessingUnitDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getProcessingUnitData();
                setDashboardData(result.data as ProcessingUnitDashboardData);
            } catch (error) {
                console.error("Error fetching processing unit dashboard data:", error);
                setError(t('errors.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getProcessingUnitData, t]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('noData')}</p>
            </div>
        );
    }

    const { yieldOptimization, inventory, wasteReduction, packagingOrders, packagingInventory } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('yieldTitle')}</CardTitle>
                        <Sliders className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yieldOptimization.currentYield}%</div>
                        <p className="text-xs text-muted-foreground">{t('potential')}: {yieldOptimization.potentialYield}%</p>
                        <p className="text-xs mt-2">{yieldOptimization.suggestion}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('wasteTitle')}</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wasteReduction.currentRate}%</div>
                        <p className="text-xs text-muted-foreground">{wasteReduction.insight}</p>
                    </CardContent>
                </Card>
                
                <Card className="lg:row-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            {t('packagingInventoryTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(packagingInventory || []).length > 0 ? (
                           (packagingInventory || []).map((item) => (
                               <div key={item.id} className="text-sm p-2 bg-background rounded-md border">
                                   <p className="font-medium">{item.packagingType}</p>
                                   <p className="text-xs">{t('inStock')}: {item.unitsInStock.toLocaleString()}</p>
                                   <p className="text-xs text-muted-foreground">{t('reorderLevel')}: {item.reorderLevel.toLocaleString()}</p>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">{t('noPackagingData')}</p>
                       )}
                    </CardContent>
                     <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/marketplace?category=packaging-solutions">{t('sourcePackagingButton')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package />
                            {t('rawMaterialTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.product')}</TableHead>
                                    <TableHead>{t('table.quality')}</TableHead>
                                    <TableHead className="text-right">{t('table.quantity')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(inventory || []).length > 0 ? (
                                    (inventory || []).map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.product}</TableCell>
                                            <TableCell><Badge variant="outline">{item.quality}</Badge></TableCell>
                                            <TableCell className="text-right font-semibold">{item.tons}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">{t('noInventoryData')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Truck />
                           {t('packagingOrdersTitle')}
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.supplier')}</TableHead>
                                    <TableHead>{t('table.deliveryDate')}</TableHead>
                                    <TableHead>{t('table.status')}</TableHead>
                                    <TableHead className="text-right">{t('table.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(packagingOrders || []).length > 0 ? (
                                    (packagingOrders || []).map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.supplierName}</TableCell>
                                            <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={order.actionLink}>{t('viewButton')}</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow><TableCell colSpan={4} className="text-center h-24">{t('noPackagingOrders')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
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
            <Skeleton className="h-40 rounded-lg lg:row-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-2" />
        </div>
    </div>
);

    