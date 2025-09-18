
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { UserCheck, Landmark, FileSpreadsheet, PlusCircle, Camera, MapPin, Download, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { FinancialApplication, FinancialProduct } from '@/lib/types';

interface FiDashboardData {
  pendingApplications: FinancialApplication[];
  portfolioOverview: {
    totalValue: number;
    loanCount: number;
  };
  financialProducts: FinancialProduct[];
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from 'next-intl';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDataExport } from '@/hooks/useDataExport';
import {
  LoanPortfolioWidget,
  RiskAssessmentWidget,
  DocumentVerificationWidget,
  FieldVisitSchedulerWidget,
  FinancialAnalyticsWidget,
  ClientRelationshipWidget,
  ComplianceReportingWidget
} from '@/components/dashboard/widgets/FiWidgets';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';

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
     const tAppPage = useTranslations('FiApplicationPage');
     const [dashboardData, setDashboardData] = useState<FiDashboardData | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     // Initialize hooks
     const { isOnline, addOfflineData, pendingCount } = useOfflineSync();
     const { startCamera, captureImage, takePhotoAndAnalyze, isAnalyzing } = useCamera();
     const { getCurrentPosition, location, isWatching, startWatching, stopWatching } = useGeolocation();
     const { exportFinancialData, isExporting } = useDataExport();

     useEffect(() => {
         const fetchData = async () => {
             setIsLoading(true);
             setError(null);
             try {
                 const result = await api.get<FiDashboardData>('/api/fi/dashboard');
                 setDashboardData(result);
             } catch (error) {
                 console.error("Error fetching FI dashboard data:", error);
                 setError(t('errors.load'));
             } finally {
                 setIsLoading(false);
             }
         };
         fetchData();
     }, [t]);
    
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
    
    const { pendingApplications, portfolioOverview, financialProducts } = dashboardData;
    
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            case 'Under Review':
            case 'More Info Required':
            case 'Pending':
                return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <div className="flex items-center space-x-4">
                    <OfflineIndicator />
                    {pendingCount > 0 && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                            <WifiOff className="h-3 w-3" />
                            <span>{pendingCount} pending</span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Button onClick={() => startCamera()} disabled={isAnalyzing} className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Scan Document</span>
                </Button>
                <Button onClick={() => getCurrentPosition()} className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Get Location</span>
                </Button>
                <Button onClick={() => exportFinancialData()} disabled={isExporting} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                </Button>
                <Button onClick={() => isWatching ? stopWatching() : startWatching()} className="flex items-center space-x-2">
                    {isWatching ? <WifiOff className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span>{isWatching ? 'Stop Tracking' : 'Track Location'}</span>
                </Button>
            </div>

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
                    title={t('activePortfolioTitle')}
                    value={`$${(portfolioOverview?.totalValue || 0).toLocaleString()}`}
                    description={t('activePortfolioDescription', { count: portfolioOverview?.loanCount || 0 })}
                    icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
                />
                 <StatCard 
                    title={t('manageProductsTitle')}
                    value={financialProducts?.length || 0}
                    description={t('manageProductsDescription')}
                    icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/fi/products"
                    ctaText={t('manageProductsButton')}
                />
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {t('pendingApplicationsTitle')}
                            </CardTitle>
                            <CardDescription>{t('pendingApplicationsTableDescription')}</CardDescription>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/fi/applications">{t('viewAllButton')}</Link>
                        </Button>
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
                                    {pendingApplications.slice(0,5).map((app: FinancialApplication) => (
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
                </Card>

                 <Card className="col-span-1 md:col-span-3">
                     <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                {t('yourProductsTitle')}
                            </CardTitle>
                            <CardDescription>{t('yourProductsDescription')}</CardDescription>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/fi/products/create"><PlusCircle className="mr-2 h-4 w-4"/>{t('createNewProductButton')}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                       {(financialProducts || []).length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('productsTable.name')}</TableHead>
                                        <TableHead>{t('productsTable.type')}</TableHead>
                                        <TableHead>{t('productsTable.interestRate')}</TableHead>
                                        <TableHead className="text-right">{t('productsTable.maxAmount')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(financialProducts || []).map((prod: FinancialProduct) => (
                                        <TableRow key={prod.id}>
                                            <TableCell className="font-medium">{prod.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{prod.type}</Badge></TableCell>
                                            <TableCell>{prod.interestRate ? `${prod.interestRate}%` : 'N/A'}</TableCell>
                                            <TableCell className="text-right">{prod.maxAmount ? `$${prod.maxAmount.toLocaleString()}` : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('noProducts')}</p>
                       )}
                    </CardContent>
                </Card>

                {/* FI-Specific Widgets */}
                <LoanPortfolioWidget />
                <RiskAssessmentWidget />
                <DocumentVerificationWidget />
                <FieldVisitSchedulerWidget />
                <FinancialAnalyticsWidget />
                <ClientRelationshipWidget />
                <ComplianceReportingWidget />
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
