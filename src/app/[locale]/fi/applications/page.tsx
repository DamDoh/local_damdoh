
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { FinancialApplication } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

function ApplicationListPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ApplicationListPage() {
    const t = useTranslations('FiApplicationListPage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [applications, setApplications] = useState<FinancialApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const functions = getFunctions(firebaseApp);
    const getFiApplicationsCallable = useMemo(() => httpsCallable(functions, 'financials-getFiApplications'), [functions]);

    const fetchApplications = useCallback(async (status: string) => {
        setIsLoading(true);
        try {
            const result = await getFiApplicationsCallable({ status });
            setApplications((result.data as any).applications || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "Could not fetch applications." });
        } finally {
            setIsLoading(false);
        }
    }, [getFiApplicationsCallable, toast]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchApplications(activeTab);
        } else if (!authLoading && !user) {
            router.push('/auth/signin');
        }
    }, [user, authLoading, router, activeTab, fetchApplications]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            case 'Under Review':
            case 'More Info Required':
            case 'Pending':
                return 'secondary';
            default: return 'outline';
        }
    };

    if (authLoading) {
        return <ApplicationListPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
            </Link>
            
            <h1 className="text-3xl font-bold">{t('title')}</h1>

            <Card>
                <CardHeader>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="All">{t('tabs.all')}</TabsTrigger>
                            <TabsTrigger value="Pending">{t('tabs.pending')}</TabsTrigger>
                            <TabsTrigger value="Approved">{t('tabs.approved')}</TabsTrigger>
                            <TabsTrigger value="Rejected">{t('tabs.rejected')}</TabsTrigger>
                        </TabsList>
                        <div className="mt-4">
                            {isLoading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : applications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('table.applicant')}</TableHead>
                                            <TableHead>{t('table.type')}</TableHead>
                                            <TableHead>{t('table.amount')}</TableHead>
                                            <TableHead>{t('table.date')}</TableHead>
                                            <TableHead>{t('table.status')}</TableHead>
                                            <TableHead className="text-right">{t('table.action')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.map(app => (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-medium">{app.applicantName}</TableCell>
                                                <TableCell><Badge variant="outline">{app.type}</Badge></TableCell>
                                                <TableCell>${app.amount.toLocaleString()}</TableCell>
                                                <TableCell>{app.submittedAt ? format(new Date(app.submittedAt), 'PPP') : 'N/A'}</TableCell>
                                                <TableCell><Badge variant={getStatusBadgeVariant(app.status)}>{t(`status.${app.status.toLowerCase().replace(/\s/g, '_')}` as any, app.status)}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild size="sm" variant="secondary">
                                                        <Link href={`/fi/applications/${app.id}`}>{t('reviewButton')}</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted-foreground py-10">{t('noApplications')}</p>
                            )}
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
