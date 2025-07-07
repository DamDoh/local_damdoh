
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowLeft, Clock, DollarSign, Phone } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Worker, WorkLog, PaymentLog } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface WorkerDetails {
    profile: Worker;
    workLogs: WorkLog[];
    payments: PaymentLog[];
}

function WorkerDetailPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}

export default function WorkerDetailPage() {
    const t = useTranslations('farmManagement.laborPage.workerDetailPage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const workerId = params.workerId as string;

    const [workerDetails, setWorkerDetails] = useState<WorkerDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const functions = getFunctions(firebaseApp);
    const getWorkerDetailsCallable = useMemo(() => httpsCallable(functions, 'getWorkerDetails'), [functions]);

    useEffect(() => {
        if (!user || !workerId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const result = await getWorkerDetailsCallable({ workerId });
                setWorkerDetails(result.data as WorkerDetails);
            } catch (error: any) {
                toast({ variant: 'destructive', title: t('toasts.errorTitle'), description: error.message });
                router.push('/farm-management/labor');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [user, workerId, getWorkerDetailsCallable, toast, router, t]);

    if (authLoading || isLoading) return <WorkerDetailPageSkeleton />;
    
    if (!workerDetails) {
        return (
             <div className="text-center py-10">
                <h2 className="text-2xl font-bold">{t('notFoundTitle')}</h2>
                <p className="text-muted-foreground">{t('notFoundDescription')}</p>
                <Button asChild className="mt-4"><Link href="/farm-management/labor">{t('goBackButton')}</Link></Button>
            </div>
        )
    }

    const { profile, workLogs, payments } = workerDetails;
    
    return (
        <div className="space-y-6">
             <Link href="/farm-management/labor" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
            </Link>

            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2">
                    <AvatarFallback className="text-3xl">{profile.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {profile.contactInfo && <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-4 w-4"/> {profile.contactInfo}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5"/> {t('workLogsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {workLogs.length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>{t('table.date')}</TableHead>
                                       <TableHead>{t('table.hours')}</TableHead>
                                       <TableHead>{t('table.task')}</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {workLogs.map(log => (
                                       <TableRow key={log.id}>
                                           <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                           <TableCell className="font-semibold">{log.hours}</TableCell>
                                           <TableCell>{log.taskDescription}</TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       ) : <p className="text-sm text-muted-foreground text-center py-4">{t('noWorkLogs')}</p>}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> {t('paymentHistoryTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {payments.length > 0 ? (
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>{t('table.date')}</TableHead>
                                       <TableHead className="text-right">{t('table.amount')}</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {payments.map(log => (
                                       <TableRow key={log.id}>
                                           <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                           <TableCell className="text-right font-semibold">${log.amount.toFixed(2)}</TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       ) : <p className="text-sm text-muted-foreground text-center py-4">{t('noPayments')}</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
