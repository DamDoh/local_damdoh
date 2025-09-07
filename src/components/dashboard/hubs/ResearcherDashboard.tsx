
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
import { FlaskConical, Database, Lightbulb } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ResearcherDashboardData } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { useAuth } from '@/lib/auth-utils';


export const ResearcherDashboard = () => {
  const t = useTranslations('ResearcherDashboard');
  const [dashboardData, setDashboardData] = useState<ResearcherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const functions = useMemo(() => getFunctions(firebaseApp), []);
  const getKnowledgeArticlesCallable = useMemo(() => httpsCallable(functions, 'knowledgeHub-getKnowledgeArticles'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await getKnowledgeArticlesCallable({ authorId: user.uid });
        const articles = (result.data as any)?.articles || [];
        
        // This dashboard's data is different from the function's direct output, so we construct it.
        const constructedData: ResearcherDashboardData = {
          knowledgeHubContributions: articles.map((article: any) => ({
              id: article.id,
              title: article.title_en || article.title_km || "Untitled Article",
              status: article.status || 'Draft',
          })),
          // Mock data for other sections as they don't have backend functions yet
          availableDatasets: [
              { id: 'set1', name: 'Rift Valley Maize Yields (2020-2023)', dataType: 'CSV', accessLevel: 'Requires Request' as const, actionLink: '#' },
              { id: 'set2', name: 'Regional Soil Health Data (Anonymized)', dataType: 'JSON', accessLevel: 'Public' as const, actionLink: '#' },
          ],
          ongoingProjects: [
              { id: 'proj1', title: 'Impact of KNF on Soil Health in Smallholder Farms', progress: 65, collaborators: ['University of Nairobi'], actionLink: '#' },
              { id: 'proj2', title: 'AI-driven Pest Identification Accuracy Study', progress: 30, collaborators: ['DamDoh AI Team'], actionLink: '#' }
          ],
        };
        setDashboardData(constructedData);

      } catch (err) {
        console.error("Error fetching Researcher dashboard data:", err);
        setError(t('errors.load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getKnowledgeArticlesCallable, user, t]);

    const contributionStatusCounts = useMemo(() => {
        if (!dashboardData?.knowledgeHubContributions) return [];
        const counts: { [key: string]: number } = {};
        dashboardData.knowledgeHubContributions.forEach(contribution => {
            const status = contribution.status || 'Draft';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.keys(counts).map(name => ({ name, count: counts[name] }));
    }, [dashboardData?.knowledgeHubContributions]);
    
    const chartConfig = {
      count: { label: t('chart.count') },
      Published: { label: t('chart.published'), color: "hsl(var(--chart-1))" },
      "Pending Review": { label: t('chart.pending'), color: "hsl(var(--chart-2))" },
      Draft: { label: t('chart.draft'), color: "hsl(var(--chart-5))" },
  };

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

  const { availableDatasets, ongoingProjects, knowledgeHubContributions } = dashboardData;

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
                             <p>{project.progress}%</p>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                    {contributionStatusCounts.length > 0 ? (
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={contributionStatusCounts}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Bar dataKey="count" layout="vertical" radius={4}>
                                    {contributionStatusCounts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "hsl(var(--primary))"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                      <div/>
                    )}
                  </div>
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
