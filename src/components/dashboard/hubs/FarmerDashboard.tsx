
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
                <Skeleton className="h-64 lg:col-span-2 rounded-lg" />
                <Skeleton className="h-64 lg:col-span-3 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Skeleton className="h-96 lg:col-span-3 rounded-lg" />
                <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        </div>
    );
}

// Main Dashboard Component
export function FarmerDashboard() {
    const t = useTranslations('FarmerDashboard');
    const [dashboardData, setDashboardData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getFarmerData = useMemo(() => httpsCallable(functions, 'dashboardData-getFarmerDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getFarmerData();
                setDashboardData(result.data);
            } catch (error) {
                console.error("Error fetching farmer dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFarmerData]);

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
    
    const { landArea, estimatedProfit, estimatedCost, weather, landOverview, costEstimation, myCrops, summaries } = dashboardData;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Land Area" value={landArea.value} unit={landArea.unit} icon={<Sprout className="h-6 w-6 text-primary" />} />
                <StatCard title="Estimated Profit" value={estimatedProfit.value} unit={estimatedProfit.unit} change={estimatedProfit.change} higherIsBetter={true}/>
                <StatCard title="Estimated Cost" value={estimatedCost.value} unit={estimatedCost.unit} change={estimatedCost.change} higherIsBetter={false}/>
                <WeatherCard weather={weather} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <LandOverviewChart data={landOverview} />
                <CostEstimationChart data={costEstimation} />
            </div>
            
            {/* Lower Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                 <MyCropsList crops={myCrops} />
                 <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                    <SummaryCard title="My Warehouse" count={summaries.warehouses} icon={<Warehouse className="h-10 w-10 text-primary" />} link="#" />
                    <SummaryCard title="My Machinery" count={summaries.machinery} icon={<Tractor className="h-10 w-10 text-primary" />} link="#" />
                    <SummaryCard title="My Livestock" count={summaries.livestock} icon={<Sheep className="h-10 w-10 text-primary" />} link="#" />
                    <SummaryCard title="My Inventory" count={summaries.inventory} icon={<Archive className="h-10 w-10 text-primary" />} link="#" />
                 </div>
            </div>
        </div>
    );
}
