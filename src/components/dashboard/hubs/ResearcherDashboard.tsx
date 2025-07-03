
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
import type { ResearcherDashboardData } from '@/lib/types';

const functions = getFunctions(firebaseApp);
const getResearcherDashboardDataCallable = httpsCallable<void, ResearcherDashboardData>(functions, 'getResearcherDashboardData');


export const ResearcherDashboard = () => {
  const [dashboardData, setDashboardData] = useState<ResearcherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold mb-6">Research & Analytics Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Available Datasets */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/> Available Datasets</CardTitle>
             <CardDescription>Anonymized datasets available for research and analysis.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.availableDatasets?.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Name</TableHead>
                     <TableHead>Data Type</TableHead>
                     <TableHead>Access Level</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.availableDatasets.map((dataset) => (
                     <TableRow key={dataset.id}>
                       <TableCell className="font-medium">{dataset.name}</TableCell>
                       <TableCell>{dataset.dataType}</TableCell>
                       <TableCell><Badge variant="secondary">{dataset.accessLevel}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={dataset.actionLink}>Request Access</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No datasets available yet.</p>
             )}
           </CardContent>
         </Card>

         {/* Ongoing Projects */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4 text-blue-500"/> Ongoing Research Projects</CardTitle>
             <CardDescription>Your active research projects and their progress.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.ongoingProjects?.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Title</TableHead>
                     <TableHead>Progress</TableHead>
                     <TableHead>Collaborators</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.ongoingProjects.map((project) => (
                     <TableRow key={project.id}>
                       <TableCell className="font-medium">{project.title}</TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <span className="text-xs">{project.progress}%</span>
                         </div>
                        </TableCell>
                       <TableCell>{project.collaborators.join(', ')}</TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={project.actionLink}>View Project</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No ongoing research projects.</p>
             )}
           </CardContent>
         </Card>

          {/* Knowledge Hub Contributions */}
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500"/> Knowledge Hub Contributions</CardTitle>
                <CardDescription>Your contributions to the DamDoh Knowledge Base.</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.knowledgeHubContributions?.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.knowledgeHubContributions.map((contribution) => (
                            <div key={contribution.id} className="text-sm p-3 border rounded-lg flex justify-between items-center">
                                <p className="font-medium">{contribution.title}</p>
                                <Badge variant={getStatusBadgeVariant(contribution.status)}>{contribution.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">No contributions to the Knowledge Base yet.</p>
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
