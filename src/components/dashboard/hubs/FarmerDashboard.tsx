"use client";

import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tractor, Sprout, DollarSign, BarChart3, AlertTriangle, TrendingUp, Calendar, Users, FlaskConical } from 'lucide-react';
import type { FarmerDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { apiCall } from '@/lib/api-utils';
import { EmergencyAlertsWidget, DailyOperationsWidget, FarmResourcesWidget, QuickStatsWidget, SeasonalCalendarWidget, MoneyPlanningWidget, HelpSupportWidget } from '../widgets/FarmManagementWidgets';
import { FarmingAssistant } from '../widgets/FarmingAssistant';
import { WeatherWidget } from '../widgets/FarmerWidgets';
import { DashboardErrorBoundary } from '../ErrorBoundary';

/**
 * FarmerDashboard - Specialized dashboard component for farmers
 *
 * Displays comprehensive farm management information including:
 * - Key metrics (farms, crops, revenue, alerts)
 * - Farm management widgets (daily operations, resources, analytics)
 * - AI-powered farming assistant
 * - Weather information
 * - Emergency alerts and support
 *
 * @component
 * @returns {JSX.Element} The farmer dashboard interface
 */
export const FarmerDashboard = () => {
    const t = useTranslations('FarmerDashboard');

    // Cache key for dashboard data
    const CACHE_KEY = 'farmer-dashboard-data';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Prevent multiple initializations
    const hasInitialized = useRef(false);

    // Load cached data on initialization
    const loadCachedData = useCallback(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data; // Return cached data for initial state
                }
            }
        } catch (error) {
            console.warn('Failed to load cached dashboard data:', error);
        }
        return null; // No valid cache
    }, []);

    // Check if cached data exists (for useEffect logic)
    const hasCachedData = useCallback(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { timestamp } = JSON.parse(cached);
                return Date.now() - timestamp < CACHE_DURATION;
            }
        } catch (error) {
            console.warn('Failed to check cached data:', error);
        }
        return false;
    }, []);

    // Initialize state with cached data
    const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(loadCachedData);
    const [isLoading, setIsLoading] = useState(!dashboardData); // Only loading if no cache
    const [error, setError] = useState<string | null>(null);

    // Save data to cache
    const saveToCache = useCallback((data: FarmerDashboardData) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to cache dashboard data:', error);
        }
    }, []);

    const fetchDashboardData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiCall('/dashboard/farmer');
            const data = result as FarmerDashboardData;
            setDashboardData(data);
            saveToCache(data); // Cache the fresh data
        } catch (err: any) {
            console.error("Error fetching farmer dashboard data:", err);
            setError(t('errors.load'));
        } finally {
            setIsLoading(false);
        }
    }, [t, saveToCache]);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchDashboardData();
        }
    }, []); // Only run once on mount

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-destructive">
                    <p>{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!dashboardData) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>{t('noData')}</p>
                </CardContent>
            </Card>
        );
    }

    const { farmCount, cropCount, recentCrops, knfBatches, financialSummary, alerts, certifications } = dashboardData;

    return (
        <DashboardErrorBoundary>
            <div
                className="space-y-6"
                role="main"
                aria-label="Farmer Dashboard"
            >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
                <Badge variant="outline" className="text-green-600 border-green-600">
                    <Sprout className="h-3 w-3 mr-1" />
                    Active Farmer
                </Badge>
            </div>

            {/* Key Metrics Row */}
            <div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                role="region"
                aria-label="Farm Performance Metrics"
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('farms')}</CardTitle>
                        <Tractor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{farmCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total farms managed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('crops')}</CardTitle>
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cropCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Active crops
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('revenue')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KSH {financialSummary?.totalIncome || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('alerts')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{alerts?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Require attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Left Column - Farm Management Widgets */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DailyOperationsWidget />
                        <FarmResourcesWidget />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {t('seasonalTasks')}
                            </CardTitle>
                            <CardDescription>{t('seasonalTasksDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeasonalCalendarWidget />
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/farm-management/calendar">{t('viewFullCalendar')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {t('performanceOverview')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <QuickStatsWidget />
                        </CardContent>
                        <CardFooter>
                            <Button asChild size="sm" className="w-full">
                                <Link href="/farm-management/analytics">{t('viewAnalytics')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column - Assistant & Support */}
                <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
                    <FarmingAssistant />
                    <WeatherWidget />
                    <HelpSupportWidget />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('communityActivity')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(recentCrops || []).slice(0, 3).map((crop, index) => (
                                    <div key={crop.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 rounded-full mt-2 bg-green-400"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{crop.name}</p>
                                            <p className="text-xs text-gray-500">{crop.stage} - {crop.farmName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/community">{t('joinCommunity')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Emergency Alerts */}
            {(alerts || []).length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {t('emergencyAlerts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {alerts?.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                                    <div className="flex items-center space-x-3">
                                        {alert.icon === 'FlaskConical' ? <FlaskConical className="h-4 w-4 text-red-500" /> : <Sprout className="h-4 w-4 text-red-500" />}
                                        <div>
                                            <p className="font-medium text-red-800">{alert.message}</p>
                                            <p className="text-sm text-red-600">{alert.type}</p>
                                        </div>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={alert.link}>View</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            </div>
        </DashboardErrorBoundary>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                </div>
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
    </div>
);