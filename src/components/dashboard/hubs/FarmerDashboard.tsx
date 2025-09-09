
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { FarmerDashboardData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

// Import the new components
import { StatCard } from '@/components/farm-management/DashboardCards';
import { MyCropsList } from '@/components/farm-management/MyCropsList';
import { TrustScoreWidget } from './TrustScoreWidget';

import { Sprout, Leaf, FlaskConical, CircleDollarSign } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useUserProfile } from '@/hooks/useUserProfile';


function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                 <div className="lg:col-span-3 space-y-6">
                    <Skeleton className="h-96 rounded-lg" />
                 </div>
                 <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 rounded-lg" />
                 </div>
            </div>
        </div>
    );
}

// Main Dashboard Component
export function FarmerDashboard() {
    const t = useTranslations('FarmerDashboard');
    const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(null);
    const [trustScoreData, setTrustScoreData] = useState<{ score: number, breakdown: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const functions = getFunctions(firebaseApp);
    const getFarmerData = useMemo(() => httpsCallable(functions, 'dashboardData-getFarmerDashboardData'), [functions]);
    const getTrustScoreCallable = useMemo(() => httpsCallable(functions, 'financials-getTrustScore'), [functions]);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [farmerResult, scoreResult] = await Promise.all([
                    getFarmerData(),
                    getTrustScoreCallable()
                ]);
                setDashboardData(farmerResult.data as FarmerDashboardData);
                setTrustScoreData((scoreResult.data as any) ?? { score: 500, breakdown: [] });

            } catch (error) {
                console.error("Error fetching farmer dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, getFarmerData, getTrustScoreCallable]);

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
                    <TrustScoreWidget 
                        reputationScore={trustScoreData?.score || 500} 
                        riskFactors={trustScoreData?.breakdown || []}
                        certifications={certifications || []}
                    />
                 </div>
            </div>
        </div>
    );
}
