
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

const functions = getFunctions(firebaseApp);

export const InsuranceProviderDashboard = () => {
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
        setError("Failed to load Insurance Provider dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getInsuranceProviderDashboardDataCallable]);

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
                    <p>No dashboard data available.</p>
                </CardContent>
           </Card>
      );
  }

  const { pendingClaims, riskAssessmentAlerts, activePolicies } = dashboardData;

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
      <h1 className="text-3xl font-bold mb-6">Insurance Provider Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Claims */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4"/> Pending Claims</CardTitle>
             <CardDescription>Claims requiring your review and processing.</CardDescription>
           </CardHeader>
           <CardContent>
             {(pendingClaims || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Policy Holder</TableHead>
                     <TableHead>Policy Type</TableHead>
                     <TableHead>Claim Date</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(pendingClaims || []).map((claim) => (
                     <TableRow key={claim.id}>
                       <TableCell className="font-medium">{claim.policyHolderName}</TableCell>
                       <TableCell>{claim.policyType}</TableCell>
                       <TableCell>{new Date(claim.claimDate).toLocaleDateString()}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={claim.actionLink}>Review Claim</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No pending claims.</p>
             )}
           </CardContent>
         </Card>

         {/* Risk Assessment Alerts */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/> Risk Assessment Alerts</CardTitle>
             <CardDescription>Alerts based on farm and supply chain data.</CardDescription>
           </CardHeader>
           <CardContent>
             {(riskAssessmentAlerts || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Policy Holder</TableHead>
                     <TableHead>Alert</TableHead>
                     <TableHead>Severity</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(riskAssessmentAlerts || []).map((alert) => (
                     <TableRow key={alert.id}>
                       <TableCell className="font-medium">{alert.policyHolderName}</TableCell>
                       <TableCell>{alert.alert}</TableCell>
                       <TableCell><Badge variant={getSeverityBadgeVariant(alert.severity)}>{alert.severity}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={alert.actionLink}>Investigate</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No new risk assessment alerts.</p>
             )}
           </CardContent>
         </Card>

          {/* Active Policies */}
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500"/> Active Policies</CardTitle>
                <CardDescription>Overview of active insurance policies.</CardDescription>
            </CardHeader>
            <CardContent>
                {(activePolicies || []).length > 0 ? (
                    <div className="space-y-3">
                        {(activePolicies || []).map((policy) => (
                            <div key={policy.id} className="text-sm p-3 border rounded-lg">
                                <p className="font-medium">{policy.policyHolderName} ({policy.policyType})</p>
                                <p className="text-xs text-muted-foreground">Coverage: ${policy.coverageAmount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Expires: {new Date(policy.expiryDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">No active policies.</p>
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

    