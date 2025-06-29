
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
import { Users, FileText, MessageSquare } from 'lucide-react';
import type { AgronomistDashboardData } from '@/lib/types';
import { useTranslation } from 'react-i18next';

const functions = getFunctions(firebaseApp);

export const AgronomistDashboard = () => {
  const { t } = useTranslation('common');
  const [dashboardData, setDashboardData] = useState<AgronomistDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAgronomistDashboardDataCallable = useMemo(() => httpsCallable<void, AgronomistDashboardData>(functions, 'getAgronomistDashboardData'), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAgronomistDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Agronomist dashboard data:", err);
        setError(t('dashboard.hubs.agronomist.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAgronomistDashboardDataCallable, t]);

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
        case 'draft': return 'secondary';
        case 'pending review': return 'secondary';
        case 'published': return 'default';
        default: return 'outline';
    }
};


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.hubs.agronomist.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4"/> {t('dashboard.hubs.agronomist.requestsTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.agronomist.requestsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.pendingConsultationRequests.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.agronomist.tableFarmer')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableIssue')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableDate')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.pendingConsultationRequests.map((request: any) => (
                     <TableRow key={request.id}>
                       <TableCell className="font-medium">{request.farmerName}</TableCell>
                       <TableCell>{request.issueSummary}</TableCell>
                       <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href="#">{t('dashboard.hubs.agronomist.viewRequestButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.agronomist.noRequests')}</p>
             )}
           </CardContent>
         </Card>

         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-green-500"/> {t('dashboard.hubs.agronomist.assignedFarmersTitle')}</CardTitle>
             <CardDescription>{t('dashboard.hubs.agronomist.assignedFarmersDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.assignedFarmersOverview.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('dashboard.hubs.agronomist.tableFarmer')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableLocation')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableLastVisit')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableAlerts')}</TableHead>
                     <TableHead>{t('dashboard.hubs.agronomist.tableAction')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.assignedFarmersOverview.map((farmer: any) => (
                     <TableRow key={farmer.id}>
                       <TableCell className="font-medium">{farmer.name}</TableCell>
                       <TableCell>{farmer.farmLocation}</TableCell>
                       <TableCell>{new Date(farmer.lastConsultation).toLocaleDateString()}</TableCell>
                       <TableCell><Badge variant={farmer.alerts > 0 ? 'destructive' : 'secondary'}>{farmer.alerts}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href="#">{t('dashboard.hubs.agronomist.viewProfileButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.hubs.agronomist.noFarmers')}</p>
             )}
           </CardContent>
         </Card>

         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500"/> {t('dashboard.hubs.agronomist.contributionsTitle')}</CardTitle>
                <CardDescription>{t('dashboard.hubs.agronomist.contributionsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.knowledgeBaseContributions.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.knowledgeBaseContributions.map((contribution: any) => (
                            <div key={contribution.id} className="text-sm p-3 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{contribution.title}</p>
                                    <p className="text-xs text-muted-foreground">{contribution.type}</p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(contribution.status)}>{contribution.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">{t('dashboard.hubs.agronomist.noContributions')}</p>
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
