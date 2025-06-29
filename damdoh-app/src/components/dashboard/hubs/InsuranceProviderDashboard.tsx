
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import type { InsuranceProviderDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

const functions = getFunctions(firebaseApp);


export const InsuranceProviderDashboard = () => {
  const { t } = useTranslation('common');
  const [dashboardData, setDashboardData] = useState<InsuranceProviderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getInsuranceProviderDashboardDataCallable = useMemo(() => httpsCallable<void, InsuranceProviderDashboardData>(functions, 'getInsuranceProviderDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getInsuranceProviderDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Insurance Provider dashboard data:", err);
        setError(t('dashboard.hubs.insurance.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getInsuranceProviderDashboardDataCallable, t]);

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
                    <p>{t('dashboard.hubs.noData')}</p>
                </CardContent>
           </Card>
      );
  }

  const getStatusBadgeVariant = (status: string) => {
      switch (status.toLowerCase()) {
          case 'submitted': return 'outline';
          case 'under review': return 'secondary';
          case 'approved': return 'default';
          case 'rejected': return 'destructive';
          default: return 'outline';
      }
  };

   const getSeverityBadgeVariant = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            default:
                return 'outline';
        }
    };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.insurance.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/> {t('dashboard.hubs.insurance.claimsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.insurance.claimsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.pendingClaims.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.insurance.tableHolder')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tablePolicyType')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableClaimDate')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableStatus')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.pendingClaims.map((claim) => (
                     <TableRow key={claim.id}>
                       <TableCell className="font-medium">{claim.policyHolderName}</TableCell>
                       <TableCell>{claim.policyType}</TableCell>
                       <TableCell>{new Date(claim.claimDate).toLocaleDateString()}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{t(`dashboard.hubs.insurance.statuses.${claim.status.toLowerCase().replace(' ', '')}`, claim.status)}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={claim.actionLink}>{t('dashboard.hubs.insurance.reviewButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.hubs.insurance.noClaims')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/> {t('dashboard.hubs.insurance.alertsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.insurance.alertsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.riskAssessmentAlerts.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.insurance.tableHolder')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableAlert')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableSeverity')}</TableHead>
                     <TableHead>{t('dashboard.hubs.insurance.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.riskAssessmentAlerts.map((alert) => (
                     <TableRow key={alert.id}>
                       <TableCell className="font-medium">{alert.policyHolderName}</TableCell>
                       <TableCell>{alert.alert}</TableCell>
                       <TableCell><Badge variant={getSeverityBadgeVariant(alert.severity)}>{alert.severity}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={alert.actionLink}>{t('dashboard.hubs.insurance.investigateButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.hubs.insurance.noAlerts')}</p>
             )}
           </CardContent>
         </Card>

         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500"/> {t('dashboard.hubs.insurance.policiesTitle')}</CardTitle>
                <CardDescription>{t('dashboard.hubs.insurance.policiesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.activePolicies.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.activePolicies.map((policy) => (
                            <div key={policy.id} className="text-sm p-3 border rounded-lg">
                                <p className="font-medium">{policy.policyHolderName} ({policy.policyType})</p>
                                <p className="text-xs text-muted-foreground">{t('dashboard.hubs.insurance.coverageLabel')}: ${policy.coverageAmount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{t('dashboard.hubs.insurance.expiresLabel')}: {new Date(policy.expiryDate).toLocaleDateString()}</p>
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={policy.actionLink}>{t('dashboard.hubs.crowdfunder.viewButton')}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.hubs.insurance.noPolicies')}</p>
                )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
};


const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
         <Skeleton className="h-32 w-full rounded-lg md:col-span-1" />
    </div>
);
