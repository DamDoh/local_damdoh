"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase'; // Assuming firebaseApp is exported from here
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Zap, TrendingUp, BarChart, CheckCircle } from 'lucide-react';

// Define the data type for the Energy Solutions Provider Dashboard
interface EnergyProviderDashboardData {
    projectLeads: {
        id: string;
        entityName: string; // Farm, Processor, etc.
        location: string;
        estimatedEnergyNeed: string; // e.g., 'High', 'Medium', 'Low', or specific kWh/year
        status: 'New' | 'Contacted' | 'Proposal Sent' | 'Closed';
        actionLink: string;
    }[];
    activeProjects: {
        id: string;
        entityName: string;
        location: string;
        solutionType: string; // e.g., 'Solar Panels', 'Biogas Digester'
        installationDate: string;
        status: 'In Progress' | 'Completed';
        actionLink: string;
    }[];
    impactMetrics: {
        totalInstallations: number;
        totalEstimatedCarbonReduction: string; // e.g., '5000 tons CO2e/year'
        actionLink: string;
    };
}

// Assume mock getEnergyProviderDashboardData is available via firebase functions
const functions = getFunctions(firebaseApp);
const getEnergyProviderDashboardDataCallable = httpsCallable<void, EnergyProviderDashboardData>(functions, 'getEnergyProviderDashboardData');


export const EnergyProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState<EnergyProviderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the mock Firebase function
        const result = await getEnergyProviderDashboardDataCallable();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching Energy Provider dashboard data:", err);
        setError("Failed to load Energy Provider dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
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
            case 'new': return 'default';
            case 'contacted': return 'secondary';
            case 'proposal sent': return 'secondary';
            case 'closed': return 'outline'; // Or 'default'/'secondary' based on outcome
            case 'in progress': return 'secondary';
            case 'completed': return 'default';
            default: return 'outline';
        }
    };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Energy Solutions Provider Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Project Leads */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500"/> Project Leads</CardTitle>
             <CardDescription>Potential opportunities for energy solution installations.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.projectLeads.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Entity</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Energy Need</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.projectLeads.map((lead) => (
                     <TableRow key={lead.id}>
                       <TableCell className="font-medium">{lead.entityName}</TableCell>
                       <TableCell>{lead.location}</TableCell>
                       <TableCell>{lead.estimatedEnergyNeed}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge></TableCell>
                       <TableCell>
                         <Button asChild variant="outline" size="sm">
                           <Link href={lead.actionLink}>View Lead</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No new project leads.</p>
             )}
           </CardContent>
         </Card>

         {/* Active Projects */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Active Projects</CardTitle>
             <CardDescription>Ongoing energy solution installations.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.activeProjects.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Entity</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Solution Type</TableHead>
                     <TableHead>Installation Date</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {dashboardData.activeProjects.map((project) => (
                     <TableRow key={project.id}>
                       <TableCell className="font-medium">{project.entityName}</TableCell>
                       <TableCell>{project.location}</TableCell>
                       <TableCell>{project.solutionType}</TableCell>
                       <TableCell>{project.installationDate}</TableCell>
                       <TableCell><Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge></TableCell>
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
               <p className="text-sm text-muted-foreground">No active projects.</p>
             )}
           </CardContent>
         </Card>

          {/* Impact Metrics */}
         <Card>
             <CardHeader>
                 <CardTitle className="text-base flex items-center gap-2"><BarChart className="h-4 w-4 text-blue-500"/> Impact Metrics</CardTitle>
                 <CardDescription>Aggregate impact of your energy solutions.</CardDescription>
             </CardHeader>
             <CardContent>
                 {dashboardData.impactMetrics ? (
                    <div className="space-y-3">
                         <p className="text-sm font-medium">Total Installations: {dashboardData.impactMetrics.totalInstallations}</p>
                         <p className="text-sm font-medium">Estimated Carbon Reduction: {dashboardData.impactMetrics.totalEstimatedCarbonReduction}</p>
                        <Button asChild variant="link" size="sm" className="px-0 pt-1">
                            <Link href={dashboardData.impactMetrics.actionLink}>View Full Impact Report</Link>
                        </Button>
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">Impact data not yet available.</p>
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

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Zap, Target, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { EnergyProviderDashboardData } from '@/lib/types';

export const EnergyProviderDashboard = () => {
    const [dashboardData, setDashboardData] = useState<EnergyProviderDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getEnergyProviderData = useMemo(() => httpsCallable(functions, 'getEnergyProviderDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getEnergyProviderData();
                setDashboardData(result.data as EnergyProviderDashboardData);
            } catch (error) {
                console.error("Error fetching energy provider dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getEnergyProviderData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Could not load dashboard data.</p>
            </div>
        );
    }

    const { highPotentialLeads, carbonImpact, pendingProposals } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Energy Solutions Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingProposals}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CO₂ Saved This Year</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{carbonImpact.savedThisYear} tons</div>
                        <p className="text-xs text-muted-foreground">from {carbonImpact.totalProjects} projects</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target />
                            High-Potential Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {highPotentialLeads.map(lead => (
                            <div key={lead.id} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-medium">{lead.name}</p>
                                    <p className="text-xs text-muted-foreground">Potential Savings: {lead.potentialSaving}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={lead.actionLink}>View Profile</Link>
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-48 md:col-span-3" />
        </div>
    </div>
);
