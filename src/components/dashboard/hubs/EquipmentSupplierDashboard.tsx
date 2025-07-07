
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Tractor, Wrench, BarChart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { EquipmentSupplierDashboardData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

export const EquipmentSupplierDashboard = () => {
    const t = useTranslations('EquipmentSupplierDashboard');
    const [dashboardData, setDashboardData] = useState<EquipmentSupplierDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getEquipmentData = useMemo(() => httpsCallable(functions, 'getEquipmentSupplierDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getEquipmentData();
                setDashboardData(result.data as EquipmentSupplierDashboardData);
            } catch (error) {
                console.error("Error fetching equipment supplier dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getEquipmentData]);
    
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

    const { listedEquipment, rentalActivity, pendingMaintenanceRequests } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('ordersTitle')}</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rentalActivity?.totalRentals || 0} {t('totalOrders')}</div>
                        <p className="text-xs text-muted-foreground">{t('ordersDescription')}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Tractor className="h-4 w-4" />
                           {t('listedEquipmentTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                       {(listedEquipment || []).length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>{t('table.name')}</TableHead>
                                       <TableHead>{t('table.type')}</TableHead>
                                       <TableHead>{t('table.status')}</TableHead>
                                       <TableHead className="text-right">{t('table.action')}</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {(listedEquipment || []).slice(0, 5).map(item => ( // Show first 5
                                       <TableRow key={item.id}>
                                           <TableCell className="font-medium">{item.name}</TableCell>
                                           <TableCell><Badge variant="secondary">{item.type}</Badge></TableCell>
                                           <TableCell><Badge variant={item.status === 'Available' ? 'default' : 'outline'}>{item.status}</Badge></TableCell>
                                           <TableCell className="text-right">
                                               <Button asChild variant="ghost" size="sm">
                                                   <Link href={item.actionLink}>{t('manageButton')}</Link>
                                               </Button>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noEquipment')}</p>
                       )}
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                           <Link href="/marketplace/create?category=heavy-machinery-sale">{t('listEquipmentButton')}</Link>
                         </Button>
                     </CardFooter>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Wrench className="h-4 w-4" />
                           {t('maintenanceTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(pendingMaintenanceRequests || []).length > 0 ? (
                           (pendingMaintenanceRequests || []).map(req => (
                                <div key={req.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{req.equipmentName} - <span className="text-muted-foreground">{req.farmerName}</span></p>
                                        <p className="text-xs text-destructive">{req.issue}</p>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={req.actionLink}>{t('viewRequestButton')}</Link>
                                    </Button>
                                </div>
                           ))
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noMaintenance')}</p>
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
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-56 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg md:col-span-3" />
        </div>
    </div>
);

    
