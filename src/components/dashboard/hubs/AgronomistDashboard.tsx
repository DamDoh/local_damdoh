
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
import { Users, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import type { AgronomistDashboardData } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export const AgronomistDashboard = () => {
  const t = useTranslations('AgronomistDashboard');
  const [dashboardData, setDashboardData] = useState<AgronomistDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAgronomistDashboardDataCallable = useMemo(() => httpsCallable<void, AgronomistDashboardData>(functions, 'getAgronomistDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAgronomistDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Agronomist dashboard data:", err);
        setError("Failed to load Agronomist dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAgronomistDashboardDataCallable]);

  const {
    pendingConsultationRequests = [],
    assignedFarmersOverview = [],
    knowledgeHubContributions = [],
  } = dashboardData || {};
  
  const farmersWithAlerts = useMemo(() => 
    (assignedFarmersOverview || []).filter(f => f.alerts > 0).length,
  [assignedFarmersOverview]);
  
  const contributionStatusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    (knowledgeHubContributions || []).forEach(contribution => {
        counts[contribution.status] = (counts[contribution.status] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [knowledgeHubContributions]);

  const chartConfig = {
      count: { label: t('chart.count') },
      Published: { label: t('chart.published'), color: "hsl(var(--chart-1))" },
      "Pending Review": { label: t('chart.pending'), color: "hsl(var(--chart-2))" },
      Draft: { label: t('chart.draft'), color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;


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
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={t('stats.assignedFarmers')} value={assignedFarmersOverview.length} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title={t('stats.farmersWithAlerts')} value={farmersWithAlerts} icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title={t('stats.pendingConsultations')} value={pendingConsultationRequests.length} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title={t('stats.knowledgeContributions')} value={knowledgeHubContributions.length} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4"/> {t('consultations.title')}</CardTitle>
             <CardDescription>{t('consultations.description')}</CardDescription>
           </CardHeader>
           <CardContent>
             {pendingConsultationRequests.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('consultations.table.farmer')}</TableHead>
                     <TableHead>{t('consultations.table.issue')}</TableHead>
                     <TableHead>{t('consultations.table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {pendingConsultationRequests.map((request) => (
                     <TableRow key={request.id}>
                       <TableCell className="font-medium">{request.farmerName}</TableCell>
                       <TableCell>{request.issueSummary}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={`/profiles/${request.farmerId}`}>{t('consultations.viewButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('consultations.noRequests')}</p>
             )}
           </CardContent>
         </Card>

         <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-green-500"/> {t('portfolio.title')}</CardTitle>
             <CardDescription>{t('portfolio.description')}</CardDescription>
           </CardHeader>
           <CardContent>
             {assignedFarmersOverview.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('portfolio.table.farmer')}</TableHead>
                     <TableHead>{t('portfolio.table.location')}</TableHead>
                     <TableHead>{t('portfolio.table.alerts')}</TableHead>
                     <TableHead>{t('portfolio.table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {assignedFarmersOverview.map((farmer) => (
                     <TableRow key={farmer.id}>
                       <TableCell className="font-medium">{farmer.name}</TableCell>
                       <TableCell>{farmer.farmLocation}</TableCell>
                       <TableCell><Badge variant={farmer.alerts > 0 ? 'destructive' : 'secondary'}>{farmer.alerts} {t('portfolio.alertsLabel')}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={`/profiles/${farmer.id}`}>{t('portfolio.profileButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('portfolio.noFarmers')}</p>
             )}
           </CardContent>
         </Card>
         
         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500"/> {t('contributions.statusTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                {contributionStatusCounts.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={contributionStatusCounts} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                                className="text-xs"
                            />
                            <XAxis dataKey="count" type="number" hide />
                             <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Bar dataKey="count" layout="vertical" radius={4}>
                                {contributionStatusCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "hsl(var(--primary))"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('contributions.noData')}</p>
                )}
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500"/> {t('contributions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                {knowledgeHubContributions.length > 0 ? (
                    <div className="space-y-3">
                        {knowledgeHubContributions.map((contribution) => (
                            <div key={contribution.id} className="text-sm p-3 border rounded-lg flex justify-between items-center">
                                <Link href={`/blog/${contribution.id}`} className="font-medium hover:underline">{contribution.title}</Link>
                                <Badge variant={getStatusBadgeVariant(contribution.status)}>{contribution.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('contributions.noContributions')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    </div>
);

