
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { UserCheck, PieChart, TrendingUp, Landmark, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { FiDashboardData, FinancialApplication } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from 'next-intl';

const StatCard = ({ title, value, description, icon, ctaLink, ctaText }: { title: string, value: string | number, description: string, icon: React.ReactNode, ctaLink?: string, ctaText?: string }) => (
  <Card className="flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
    {ctaLink && ctaText && (
        <CardFooter>
            <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href={ctaLink}>{ctaText}</Link>
            </Button>
        </CardFooter>
    )}
  </Card>
);

export const FiDashboard = () => {
    const t = useTranslations('FiDashboard');
    const [dashboardData, setDashboardData] = useState<FiDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getFiData = useMemo(() => httpsCallable(functions, 'getFiDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getFiData();
                setDashboardData(result.data as FiDashboardData);
            } catch (error) {
                console.error("Error fetching FI dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getFiData]);
    
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
    
    const { pendingApplications, portfolioAtRisk, marketUpdates } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <StatCard 
                    title={t('pendingApplicationsTitle')} 
                    value={pendingApplications?.length || 0}
                    description={t('pendingApplicationsDescription')}
                    icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/fi/applications"
                    ctaText={t('manageApplicationsButton')}
                />
                <StatCard 
                    title={t('portfolioAtRiskTitle')}
                    value={`${(portfolioAtRisk?.value || 0).toLocaleString()} USD`}
                    description={t('portfolioAtRiskDescription', { count: portfolioAtRisk?.count || 0 })}
                    icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                    ctaLink={portfolioAtRisk?.actionLink || '#'}
                    ctaText={t('reviewRiskButton')}
                />
                <StatCard 
                    title={t('manageProductsTitle')}
                    value={(dashboardData as any).activeProductsCount || 0}
                    description={t('manageProductsDescription')}
                    icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/fi/products"
                    ctaText={t('manageProductsButton')}
                />
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                           <UserCheck className="h-4 w-4" />
                           {t('pendingApplicationsTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {(pendingApplications || []).length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.applicant')}</TableHead>
                                        <TableHead>{t('table.type')}</TableHead>
                                        <TableHead>{t('table.amount')}</TableHead>
                                        <TableHead>{t('table.riskScore')}</TableHead>
                                        <TableHead className="text-right">{t('table.action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApplications.map((app: FinancialApplication) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                                            <TableCell><Badge variant="outline">{app.type}</Badge></TableCell>
                                            <TableCell>${app.amount.toLocaleString()}</TableCell>
                                            <TableCell>{app.riskScore}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button asChild size="sm">
                                                    <Link href={`/fi/applications/${app.id}`}>{t('reviewButton')}</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noApplications')}</p>
                       )}
                    </CardContent>
                     <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/fi/applications">{t('viewAllButton')}</Link>
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
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-64 rounded-lg md:col-span-3" />
        </div>
    </div>
);
