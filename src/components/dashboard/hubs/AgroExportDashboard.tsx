
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { FileText, Ship, Globe, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { AgroExportDashboardData } from '@/lib/types';

export const AgroExportDashboard = () => {
    const [dashboardData, setDashboardData] = useState<AgroExportDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getAgroExportData = useMemo(() => httpsCallable(functions, 'getAgroExportDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getAgroExportData();
                setDashboardData(result.data as AgroExportDashboardData);
            } catch (error) {
                console.error("Error fetching agro-export dashboard data:", error);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getAgroExportData]);
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <Card><CardContent className="pt-6 text-center text-destructive"><p>{error}</p></CardContent></Card>;
    }

    if (!dashboardData) {
        return (
             <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No dashboard data available.</p>
            </div>
        );
    }

    const { pendingCustomsDocs, trackedShipments, complianceAlerts } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Agro-Export Facilitator Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="col-span-1 md:col-span-2 flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <FileText className="h-4 w-4" />
                           Pending Customs Documentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(pendingCustomsDocs || []).length > 0 ? (
                           (pendingCustomsDocs || []).map(doc => (
                               <div key={doc.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md border">
                                   <div>
                                       <p className="font-medium">To: {doc.destination}</p>
                                       <p className="text-xs text-muted-foreground">{doc.status}</p>
                                   </div>
                                   <Button asChild variant="secondary" size="sm">
                                       <Link href={doc.vtiLink}>Prepare Docs</Link>
                                   </Button>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No pending documents.</p>
                       )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Globe className="h-4 w-4" />
                           Tracked Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                       {(trackedShipments || []).length > 0 ? (
                           (trackedShipments || []).map(shipment => (
                                <div key={shipment.id} className="text-sm">
                                    <p className="font-medium">{shipment.carrier}: {shipment.location}</p>
                                    <Badge>{shipment.status}</Badge>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No active shipments.</p>
                       )}
                    </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-3">
                     <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <AlertCircle className="h-4 w-4 text-yellow-500" />
                           Compliance Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {(complianceAlerts || []).length > 0 ? (
                           (complianceAlerts || []).map(alert => (
                               <div key={alert.id} className="text-sm p-3 border rounded-lg bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                                   <p>{alert.content}</p>
                                   <Link href={alert.actionLink} className="text-xs text-primary hover:underline mt-1">Learn More</Link>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No compliance alerts.</p>
                       )}
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
            <Skeleton className="h-48 rounded-lg md:col-span-2" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg md:col-span-3" />
        </div>
    </div>
);
