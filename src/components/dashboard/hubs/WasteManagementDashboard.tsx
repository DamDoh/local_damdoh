
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Recycle, Package, Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { WasteManagementDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

export const WasteManagementDashboard = () => {
    const t = useTranslations('WasteManagementDashboard');
    const [dashboardData, setDashboardData] = useState<WasteManagementDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getWasteData = useMemo(() => httpsCallable(functions, 'getWasteManagementDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getWasteData();
                setDashboardData(result.data as WasteManagementDashboardData);
            } catch (error) {
                console.error("Error fetching waste management dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getWasteData]);
    
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

    const { incomingWasteStreams, compostBatches, finishedProductInventory } = dashboardData;
    
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Active': return 'secondary';
            case 'Curing': return 'outline';
            case 'Ready': return 'default';
            default: return 'outline';
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Recycle className="h-4 w-4" />
                           {t('wasteStreamsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(incomingWasteStreams || []).length > 0 ? (
                            (incomingWasteStreams || []).map(stream => (
                               <div key={stream.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                   <div>
                                       <p className="font-medium">{stream.type} ({stream.quantity})</p>
                                       <p className="text-xs text-muted-foreground">{t('from')}: {stream.source}</p>
                                   </div>
                                   <Button variant="ghost" size="sm">{t('acceptButton')}</Button>
                               </div>
                           ))
                        ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noWasteStreams')}</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Clock className="h-4 w-4" />
                           {t('compostBatchesTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(compostBatches || []).length > 0 ? (
                            (compostBatches || []).map(batch => (
                                <div key={batch.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{t('batch')} #{batch.id}</p>
                                        <p className="text-xs text-muted-foreground">{t('estReady')}: {new Date(batch.estimatedCompletion).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(batch.status)}>{batch.status}</Badge>
                                </div>
                           ))
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noCompostBatches')}</p>
                       )}
                    </CardContent>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Package className="h-4 w-4" />
                           {t('inventoryTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(finishedProductInventory || []).length > 0 ? (
                           (finishedProductInventory || []).map(item => (
                               <div key={item.product} className="text-sm">
                                   <p className="font-medium">{item.product}</p>
                                   <p className="text-xs text-muted-foreground">{t('inStock')}: {item.quantity}</p>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noFinishedProducts')}</p>
                       )}
                    </CardContent>
                     <CardFooter>
                         <Button asChild className="w-full">
                           <Link href="/marketplace/create?category=fertilizers-soil"><ShoppingCart className="mr-2 h-4 w-4"/>{t('sellButton')}</Link>
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
            <Skeleton className="h-48 rounded-lg col-span-1 md:col-span-3" />
            <Skeleton className="h-56 rounded-lg col-span-1 md:col-span-2" />
            <Skeleton className="h-56 rounded-lg" />
        </div>
    </div>
);
