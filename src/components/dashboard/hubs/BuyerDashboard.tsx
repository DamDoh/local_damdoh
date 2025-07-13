
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { ShieldAlert, TrendingUp, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BuyerDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

export const BuyerDashboard = () => {
    const t = useTranslations('BuyerDashboard');
    const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getBuyerData = useMemo(() => httpsCallable(functions, 'getBuyerDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getBuyerData();
                setDashboardData(result.data as BuyerDashboardData);
            } catch (error) {
                console.error("Error fetching buyer dashboard data:", error);
                setError(t('errors.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getBuyerData, t]);

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

    const { supplyChainRisk, sourcingRecommendations, marketPriceIntelligence } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('riskTitle')}</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-3xl font-bold">{supplyChainRisk.level}</div>
                        <p className="text-xs text-muted-foreground">{supplyChainRisk.factor} in {supplyChainRisk.region}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={supplyChainRisk.action.link}>{t('diversifySourcing')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('priceTitle')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {marketPriceIntelligence.product}
                            <TrendingUp className={`h-5 w-5 ${marketPriceIntelligence.trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <p className="text-xs text-muted-foreground">{marketPriceIntelligence.forecast}</p>
                    </CardContent>
                     <CardFooter>
                        <Button asChild size="sm" className="w-full">
                           <Link href={marketPriceIntelligence.action.link}>{t('secureContracts')}</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            {t('sourcingTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        {(sourcingRecommendations || []).length > 0 ? (
                            (sourcingRecommendations || []).map(rec => (
                                <div key={rec.id} className="p-3 rounded-md border text-sm bg-background">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{rec.name}</p>
                                            <p className="text-xs text-muted-foreground">{rec.product}</p>
                                        </div>
                                        <Badge variant={rec.vtiVerified ? 'default' : 'secondary'}>
                                            {rec.vtiVerified ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                            VTI
                                        </Badge>
                                    </div>
                                    <div className="text-xs mt-2">
                                        {t('reliabilityScore')}: <span className="font-bold">{rec.reliability}%</span>
                                        <div className="h-1 bg-gray-200 w-full mt-1 rounded-full">
                                            <div className={`h-1 rounded-full ${rec.reliability > 80 ? 'bg-green-500' : rec.reliability > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rec.reliability}%` }}></div>
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noRecommendations')}</p>
                        )}
                    </CardContent>
                     <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/network">{t('findSuppliersButton')}</Link>
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
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg lg:row-span-2" />
        </div>
    </div>
);
