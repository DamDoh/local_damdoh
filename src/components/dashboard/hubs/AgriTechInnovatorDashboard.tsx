
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Brain, Key, Server, Rocket, Copy, EyeOff, Eye } from 'lucide-react';
import type { AgriTechInnovatorDashboardData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

const functions = getFunctions(firebaseApp);

const ApiKeyRow = ({ apiKey }: { apiKey: AgriTechInnovatorDashboardData['apiKeys'][0] }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        toast({ title: "API Key Copied" });
    };

    return (
        <TableRow>
            <TableCell className="font-mono text-xs">
                {isVisible ? apiKey.key : apiKey.key.replace(/_([^_]+)$/, '_...$1')}
            </TableCell>
            <TableCell><Badge variant={apiKey.status === 'Active' ? 'default' : 'destructive'}>{apiKey.status}</Badge></TableCell>
            <TableCell><Badge variant={apiKey.environment === 'Sandbox' ? 'secondary' : 'outline'}>{apiKey.environment}</Badge></TableCell>
            <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
};


export const AgriTechInnovatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AgriTechInnovatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAgriTechData = useMemo(() => httpsCallable(functions, 'getAgriTechInnovatorDashboardData'), [functions]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAgriTechData();
        setDashboardData(result.data as AgriTechInnovatorDashboardData);
      } catch (err) {
        console.error("Error fetching Agri-Tech dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAgriTechData]);

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

  const { apiKeys, sandboxStatus, integrationProjects } = dashboardData;

  const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return 'text-green-500';
            case 'Degraded': return 'text-yellow-500';
            case 'Offline': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Agri-Tech Innovator & Developer Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Server className="h-4 w-4"/> Sandbox Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Status: <span className={getStatusColor(sandboxStatus.status)}>{sandboxStatus.status}</span></p>
            <p className="text-xs text-muted-foreground">Last Reset: {formatDistanceToNow(new Date(sandboxStatus.lastReset), { addSuffix: true })}</p>
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm">Access Documentation</Button>
           </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4"/> Integration Projects</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-lg font-bold">{(integrationProjects || []).length} Active Projects</p>
            <p className="text-xs text-muted-foreground">Collaborating to enhance the ecosystem.</p>
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm">Propose New Integration</Button>
           </CardFooter>
        </Card>
      </div>

       <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4"/> API Key Management</CardTitle>
             <CardDescription>Manage your API keys for sandbox and production environments.</CardDescription>
           </CardHeader>
           <CardContent>
             {(apiKeys || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Key</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Environment</TableHead>
                     <TableHead>Created</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(apiKeys || []).map((key) => (
                      <ApiKeyRow key={key.id} apiKey={key} />
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No API keys generated yet.</p>
             )}
           </CardContent>
            <CardFooter>
                <Button>Generate New Key</Button>
            </CardFooter>
         </Card>

    </div>
  );
};

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-72 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
    </div>
);
