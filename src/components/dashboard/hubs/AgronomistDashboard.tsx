
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

const functions = getFunctions(firebaseApp);
const getAgronomistDashboardDataCallable = httpsCallable<void, AgronomistDashboardData>(functions, 'getAgronomistDashboardData');


export const AgronomistDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AgronomistDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold mb-6">Agronomist & Consultant Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Consultation Requests */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4"/> Pending Consultation Requests</CardTitle>
             <CardDescription>Farmers seeking your expertise.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.pendingConsultationRequests.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Farmer Name</TableHead>
                     <TableHead>Issue Summary</TableHead>
                     <TableHead>Request Date</TableHead>
                     <TableHead>Action</TableHead>
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
                           <Link href={`/consultations/${request.id}`}>View Request</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No pending consultation requests.</p>
             )}
           </CardContent>
         </Card>

         {/* Assigned Farmers Overview */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-green-500"/> Assigned Farmers</CardTitle>
             <CardDescription>Overview of farmers in your portfolio.</CardDescription>
           </CardHeader>
           <CardContent>
             {dashboardData.assignedFarmersOverview.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Farmer Name</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Last Consultation</TableHead>
                     <TableHead>Alerts</TableHead>
                     <TableHead>Action</TableHead>
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
                           <Link href={`/profiles/${farmer.id}`}>View Profile</Link>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground">No farmers assigned yet.</p>
             )}
           </CardContent>
         </Card>

          {/* Knowledge Base Contributions */}
         <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500"/> Knowledge Base Contributions</CardTitle>
                <CardDescription>Your contributions to the DamDoh Knowledge Base.</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.knowledgeBaseContributions.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.knowledgeBaseContributions.map((contribution: any) => (
                            <div key={contribution.id} className="text-sm p-2 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{contribution.title}</p>
                                    <Badge variant={getStatusBadgeVariant(contribution.status)}>{contribution.status}</Badge>
                                </div>
                                <Button asChild variant="link" size="sm" className="px-0 pt-1">
                                    <Link href={`/knowledge/${contribution.id}`}>View Details</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                   <p className="text-sm text-muted-foreground">No contributions to the Knowledge Base yet.</p>
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
