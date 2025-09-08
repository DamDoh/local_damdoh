
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Users, Leaf, ClipboardList, CheckSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { FieldAgentDashboardData, UserProfile } from '@/lib/types'; 
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export const FieldAgentDashboard = () => {
    const t = useTranslations('FieldAgentDashboard');
    const [dashboardData, setDashboardData] = useState<FieldAgentDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getFieldAgentData = useMemo(() => httpsCallable(functions, 'dashboardData-getFieldAgentDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getFieldAgentData();
                setDashboardData(result.data as FieldAgentDashboardData);
            } catch (error) {
                console.error("Error fetching field agent dashboard data:", error);
                setError(t('errors.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFieldAgentData, t]);
    
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

    const { assignedFarmers, portfolioHealth, pendingReports, dataVerificationTasks } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('portfolioHealthTitle')}</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{portfolioHealth?.overallScore || 0}%</div>
                        <p className="text-xs text-muted-foreground">{(portfolioHealth?.alerts || []).length || 0} {t('activeAlerts')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('pendingReportsTitle')}</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReports || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('reportsToFile')}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dataVerificationTitle')}</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dataVerificationTasks?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">{t('tasksPending')}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('assignedFarmersTitle')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(assignedFarmers || []).length}</div>
                        <p className="text-xs text-muted-foreground">{t('farmersInPortfolio')}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Users className="h-4 w-4" />
                           {t('portfolioTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(assignedFarmers || []).length > 0 ? (
                           (assignedFarmers || []).map(farmer => (
                               <div key={farmer.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={farmer.avatarUrl} alt={farmer.name} />
                                            <AvatarFallback>{farmer.name.substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{farmer.name}</p>
                                            <p className="text-xs text-muted-foreground">{t('lastVisit')}: {formatDistanceToNow(new Date(farmer.lastVisit), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {farmer.issues > 0 && <Badge variant="destructive">{farmer.issues} {t('issues', { count: farmer.issues })}</Badge>}
                                        <Button asChild size="sm">
                                            <Link href={farmer.actionLink}>{t('viewFarmerButton')}</Link>
                                        </Button>
                                    </div>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-center text-muted-foreground py-4">{t('noFarmersAssigned')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-48 rounded-lg col-span-1 md:col-span-2 lg:col-span-4" />
        </div>
    </div>
);
