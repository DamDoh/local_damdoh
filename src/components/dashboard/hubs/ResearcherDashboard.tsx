
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Ensure Button is imported
import Link from 'next/link';
import { FlaskConical, Database, Lightbulb } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import type { ResearcherDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';

const functions = getFunctions(firebaseApp);

// Import necessary chart components (assuming they exist in your project)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const ResearcherDashboard = () => {
  const t = useTranslations('ResearcherDashboard');
  const [dashboardData, setDashboardData] = useState<ResearcherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getResearcherDashboardDataCallable = useMemo(() => httpsCallable<void, ResearcherDashboardData>(functions, 'getResearcherDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getResearcherDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Researcher dashboard data:", err);
        setError("Failed to load Researcher dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getResearcherDashboardDataCallable]);

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

  const { availableDatasets, ongoingProjects, knowledgeHubContributions } = dashboardData;

        // Prepare data for Datasets Type Chart
  const datasetDataTypeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    (availableDatasets || []).forEach(dataset => {
      counts[dataset.dataType] = (counts[dataset.dataType] || 0) + 1;
    });
          return Object.keys(counts).map(key => ({ dataType: key, count: counts[key] }));
  }, [availableDatasets]);

   const datasetChartData = [
       ...datasetDataTypeCounts,
       ...datasetAccessLevelCounts.map(item => ({ name: `${item.name} Access`, count: item.count }))
   ];

  // Prepare data for Contributions Chart
  const contributionStatusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    (knowledgeHubContributions || []).forEach(contribution => {
      counts[contribution.status] = (counts[contribution.status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [knowledgeHubContributions]);


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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Available Datasets Table */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/>{t('datasetsTitle')}</CardTitle>
             <CardDescription>{t('datasetsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(availableDatasets || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.name')}</TableHead>
                     <TableHead>{t('table.dataType')}</TableHead>
                     <TableHead>{t('table.accessLevel')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(availableDatasets || []).map((dataset) => (
                     <TableRow key={dataset.id}>
                       <TableCell className="font-medium">{dataset.name}</TableCell>
                       <TableCell>{dataset.dataType}</TableCell>
                       <TableCell><Badge variant="secondary">{dataset.accessLevel}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={dataset.actionLink}>{t('requestAccessButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noDatasets')}</p>
             )}
           </CardContent>
         </Card>

        {/* Available Datasets Chart */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/>{t('datasetsByTypeTitle')}</CardTitle>
             <CardDescription>{t('datasetsByTypeDescription')}</CardDescription>
           </CardHeader>
           <CardContent className="flex justify-center">
             {(datasetDataTypeCounts || []).length > 0 ? (
                 <ChartContainer config={{}} className="min-h-[200px] w-full">
                     <BarChart accessibilityLayer data={datasetDataTypeCounts}>
                         <CartesianGrid vertical={false} />
                         <XAxis dataKey="dataType" tickLine={false} tickMargin={10} axisLine={false} />
                         <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                         <ChartTooltip cursor={false} content={<ChartTooltip />} />
                         <ChartLegend content={<ChartLegend />} />
                         <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
                     </BarChart>
                 </ChartContainer>
             ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('noDatasetsForChart')}</p>
             )}
           </CardContent>
         </Card>
         {/* Ongoing Projects */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4 text-blue-500"/>{t('projectsTitle')}</CardTitle>
             <CardDescription>{t('projectsDescription')}</CardDescription>
           </CardHeader>
           <CardContent>
             {(ongoingProjects || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.title')}</TableHead>
                     <TableHead>{t('table.progress')}</TableHead>
                     <TableHead>{t('table.collaborators')}</TableHead>
                     <TableHead>{t('table.action')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(ongoingProjects || []).map((project) => (
                     <TableRow key={project.id}>
                       <TableCell className="font-medium">{project.title}</TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                             <Progress value={project.progress} className="w-[60%]" />
                         </div>
                        </TableCell>
                       <TableCell>{(project.collaborators || []).join(', ')}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={project.actionLink}>{t('viewProjectButton')}</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noProjects')}</p>
             )}
           </CardContent>
         </Card>

          {/* Knowledge Hub Contributions */}
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500"/>{t('contributionsTitle')}</CardTitle>
                <CardDescription>{t('contributionsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {(knowledgeHubContributions || []).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table.title')}</TableHead>
                        <TableHead>{t('table.status')}</TableHead>
                        <TableHead className="text-right">{t('table.action')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(knowledgeHubContributions || []).map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell className="font-medium">
                            <Link href={`/blog/${contribution.id}`} className="hover:underline">{contribution.title}</Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contribution.status)}>{contribution.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/blog/${contribution.id}`}>{t('viewButton')}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">{t('noContributions')}</p>
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
    </div>
);
