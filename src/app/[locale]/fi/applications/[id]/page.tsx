
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, FileText, User, DollarSign, Calendar, BarChart, Info, Loader2, MessageSquare, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { FinancialApplication, UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';

function ApplicationDetailSkeleton() {
    const t = useTranslations('FiApplicationPage');
    return (
        <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="md:col-span-1">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
}


export default function FinancialApplicationDetailPage() {
    const t = useTranslations('FiApplicationPage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const applicationId = params.id as string;

    const [application, setApplication] = useState<FinancialApplication | null>(null);
    const [applicant, setApplicant] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const getApplicationDetailsCallable = useMemo(() => httpsCallable(functions, 'getFinancialApplicationDetails'), []);
    const updateStatusCallable = useMemo(() => httpsCallable(functions, 'updateFinancialApplicationStatus'), []);

    const fetchDetails = useCallback(async () => {
        if (!applicationId || !user) return;
        setIsLoading(true);
        try {
            const result = await getApplicationDetailsCallable({ applicationId });
            const data = result.data as { application: FinancialApplication, applicant: UserProfile };
            setApplication(data.application);
            setApplicant(data.applicant);
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.errorTitle'), description: error.message });
             router.push('/');
        } finally {
            setIsLoading(false);
        }
    }, [applicationId, user, getApplicationDetailsCallable, toast, router, t]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchDetails();
        } else if (!authLoading && !user) {
            router.push('/auth/signin');
        }
    }, [authLoading, user, fetchDetails, router]);
    
    const handleStatusUpdate = async (status: 'Approved' | 'Rejected' | 'More Info Required') => {
        setIsUpdating(true);
        try {
            await updateStatusCallable({ applicationId, status });
            toast({ title: t('toast.updateSuccessTitle'), description: t('toast.updateSuccessDescription', { status: status }) });
            fetchDetails(); // Refetch data to show new status
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.updateFailTitle'), description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };
    
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            case 'Under Review':
            case 'More Info Required':
                return 'secondary';
            default: return 'outline';
        }
    };

    if (isLoading || authLoading) return <ApplicationDetailSkeleton />;
    
    if (!application) {
        return <p>{t('notFound')}</p>;
    }
    
    return (
        <div className="space-y-6">
            <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
            </Link>
            
             <h1 className="text-3xl font-bold">{t('title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>{application.type} {t('applicationTitle')}</span>
                                <Badge variant={getStatusBadgeVariant(application.status)}>{application.status}</Badge>
                            </CardTitle>
                             <CardDescription>{t('submittedOn')} {application.submittedAt ? format(new Date(application.submittedAt), 'PPP') : 'N/A'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-muted-foreground">{t('amountRequested')}</span>
                                <span className="text-2xl font-bold">{application.currency} {application.amount.toLocaleString()}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">{t('purpose')}</h4>
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border">{application.purpose}</p>
                            </div>
                        </CardContent>
                         <CardFooter className="flex-wrap gap-2">
                            <Button onClick={() => handleStatusUpdate('Approved')} disabled={isUpdating || application.status === 'Approved'}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<CheckCircle className="mr-2 h-4 w-4"/>{t('approveButton')}
                            </Button>
                             <Button onClick={() => handleStatusUpdate('Rejected')} disabled={isUpdating || application.status === 'Rejected'} variant="destructive">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<XCircle className="mr-2 h-4 w-4"/>{t('rejectButton')}
                            </Button>
                             <Button onClick={() => handleStatusUpdate('More Info Required')} disabled={isUpdating} variant="outline">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<MessageSquare className="mr-2 h-4 w-4"/>{t('requestInfoButton')}
                            </Button>
                         </CardFooter>
                    </Card>
                </div>
                 <div className="md:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4"/>{t('applicantDetails')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {applicant ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={applicant.avatarUrl} alt={applicant.displayName} />
                                            <AvatarFallback>{applicant.displayName.substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{applicant.displayName}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <StakeholderIcon role={applicant.primaryRole} className="h-3 w-3"/>
                                                {applicant.primaryRole}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{applicant.location}</p>
                                    <Button asChild size="sm" variant="secondary" className="w-full"><Link href={`/profiles/${applicant.id}`}>{t('viewProfileButton')}</Link></Button>
                                </>
                            ) : <p className="text-sm text-muted-foreground">{t('profileNotFound')}</p>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4"/>{t('riskAssessment')}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-xs text-muted-foreground">{t('creditScore')}</p>
                            <p className="text-4xl font-bold text-primary">{application.riskScore || 'N/A'}</p>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}

    