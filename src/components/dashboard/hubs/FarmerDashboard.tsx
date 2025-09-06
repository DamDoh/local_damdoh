
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { FarmerDashboardData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

// Import the new components
import { StatCard, WeatherCard } from '@/components/farm-management/DashboardCards';
import { LandOverviewChart } from '@/components/farm-management/LandOverviewChart';
import { CostEstimationChart } from '@/components/farm-management/CostEstimationChart';
import { MyCropsList } from '@/components/farm-management/MyCropsList';
import { SummaryCard } from '@/components/farm-management/SummaryCard';

import { Sprout, Warehouse, Tractor, Sheep, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-utils';
import { TrustScoreWidget } from './TrustScoreWidget';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';


function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Skeleton className="h-64 lg:col-span-3 rounded-lg" />
                <Skeleton className="h-64 lg:col-span-2 rounded-lg" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <Skeleton className="h-96 lg:col-span-3 rounded-lg" />
                 <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                 </div>
            </div>
        </div>
    );
}

// Main Dashboard Component
export function FarmerDashboard() {
    const t = useTranslations('FarmerDashboard');
    const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const functions = getFunctions(firebaseApp);
    const getFarmerData = useMemo(() => httpsCallable(functions, 'dashboardData-getFarmerDashboardData'), [functions]);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFarmerData();
                setDashboardData(result.data as FarmerDashboardData);
            } catch (error) {
                console.error("Error fetching farmer dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, getFarmerData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('noData')}</p>
            </div>
        );
    }
    
    const { farmCount, cropCount, financialSummary, alerts, recentCrops, knfBatches, certifications } = dashboardData;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
             {alerts && alerts.length > 0 && (
                <Alert variant="destructive">
                    <AlertTitle>{t('alertsTitle')}</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside">
                            {alerts.map(alert => (
                                <li key={alert.id}>
                                    {alert.message} <Button variant="link" asChild className="p-0 h-auto"><Link href={alert.link}>{t('viewButton')}</Link></Button>
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('cards.farms.title')} value={farmCount} icon={<Sprout className="h-6 w-6 text-primary" />} link="/farm-management/farms" ctaText={t('cards.farms.button')} />
                <StatCard title={t('cards.crops.title')} value={cropCount} icon={<Leaf className="h-6 w-6 text-primary" />} link="/farm-management/farms" ctaText={t('cards.crops.button')} />
                <StatCard title={t('cards.knf.title')} value={knfBatches.length} icon={<FlaskConical className="h-6 w-6 text-primary" />} link="/farm-management/knf-inputs" ctaText={t('cards.knf.button')} />
                <StatCard title={t('cards.financials.title')} value={financialSummary?.netFlow ?? 0} isCurrency icon={<CircleDollarSign className="h-6 w-6 text-primary" />} link="/farm-management/financials" ctaText={t('cards.financials.button')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                 <div className="lg:col-span-3 space-y-6">
                    <MyCropsList crops={recentCrops} />
                 </div>
                 <div className="lg:col-span-2 space-y-6">
                    <TrustScoreWidget reputationScore={850} certifications={certifications || []} />
                 </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, ctaLink, ctaText, isCurrency = false }: { title: string, value: number, icon: React.ReactNode, ctaLink: string, ctaText: string, isCurrency?: boolean }) => (
    <Card className="flex flex-col">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                {icon} {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="text-3xl font-bold">{isCurrency ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}</div>
        </CardContent>
        <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={ctaLink}>{ctaText}</Link>
            </Button>
        </CardFooter>
    </Card>
);

const MyCropsList = ({ crops }: { crops: FarmerDashboardData['recentCrops'] }) => {
    const t = useTranslations('FarmerDashboard');
    if(!crops || crops.length === 0){
        return (
            <Card>
                <CardHeader><CardTitle>{t('recentCrops.title')}</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <p>{t('recentCrops.noCrops')}</p>
                    <Button asChild className="mt-4"><Link href="/farm-management/create-farm">{t('recentCrops.button')}</Link></Button>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader><CardTitle>{t('recentCrops.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {crops.map((crop) => (
                    <div key={crop.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{crop.name}</p>
                            <p className="text-xs text-muted-foreground">{t('recentCrops.onFarm')} {crop.farmName}</p>
                            <p className="text-xs text-muted-foreground">{t('recentCrops.plantedOn')}: {crop.plantingDate ? format(new Date(crop.plantingDate), 'PPP') : 'N/A'}</p>
                        </div>
                        <Badge>{crop.stage}</Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
};

    