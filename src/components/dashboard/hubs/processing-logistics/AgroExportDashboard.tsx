
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Globe, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface AgroExportDashboardData {
    automatedDocs: {
        docId: string;
        type: string;
        status: string;
    }[];
    vtiShipments: {
        vti: string;
        status: string;
        location: string;
    }[];
    customsAlerts: {
        alert: string;
        actionLink: string;
    }[];
}

export const AgroExportDashboard = () => {
    const [dashboardData, setDashboardData] = useState<AgroExportDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const functions = getFunctions(firebaseApp);
    const getAgroExportData = useMemo(() => httpsCallable(functions, 'getAgroExportDashboardData'), [functions]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getAgroExportData();
                setDashboardData(result.data as AgroExportDashboardData);
            } catch (error) {
                console.error("Error fetching agro-export dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getAgroExportData]);

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

    const { automatedDocs, vtiShipments, customsAlerts } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Agro-Export Facilitator Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Globe />
                            Active VTI Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {vtiShipments.map((shipment) => (
                            <div key={shipment.vti} className="flex justify-between items-center text-sm p-2 border rounded-lg">
                                <div>
                                    <p className="font-mono text-xs">{shipment.vti}</p>
                                    <p className="font-medium">{shipment.location}</p>
                                </div>
                                <Badge variant="secondary">{shipment.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText />
                            Generated Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {automatedDocs.map(doc => (
                           <div key={doc.docId} className="flex items-center gap-2 text-sm">
                               <CheckCircle className="h-4 w-4 text-green-500" />
                               <span>{doc.type}</span>
                           </div>
                       ))}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Customs & Trade Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {customsAlerts.map((alert, index) => (
                            <div key={index} className="text-sm">
                                <Link href={alert.actionLink} className="hover:underline">{alert.alert}</Link>
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
            <Skeleton className="h-48 md:col-span-3" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32 md:col-span-2" />
        </div>
    </div>
);
