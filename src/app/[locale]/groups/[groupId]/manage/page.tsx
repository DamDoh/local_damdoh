
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Loader2, Users, Mail, Clock } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { JoinRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';

const functions = getFunctions(firebaseApp);

export default function ManageGroupPage() {
    const t = useTranslations('GroupsPage.manage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;

    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResponding, setIsResponding] = useState<string | null>(null);

    const getRequestsCallable = useMemo(() => httpsCallable(functions, 'getGroupJoinRequests'), []);
    const respondCallable = useMemo(() => httpsCallable(functions, 'respondToJoinRequest'), []);
    
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getRequestsCallable({ groupId });
            setRequests((result.data as any).requests || []);
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.loadError') });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getRequestsCallable, toast, t]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchRequests();
        }
    }, [user, authLoading, fetchRequests]);

    const handleResponse = async (requestId: string, requesterId: string, action: 'accept' | 'decline') => {
        setIsResponding(requestId);
        try {
            await respondCallable({ groupId, requestId, requesterId, action });
            toast({ title: t('toast.success'), description: t(`toast.${action}Success`) });
            fetchRequests(); // Refresh the list
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsResponding(null);
        }
    };
    
    if (isLoading || authLoading) {
        return <Skeleton className="h-64 max-w-2xl mx-auto" />;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Link href={`/groups/${groupId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        {t('title')}
                    </CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <div key={req.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={req.requesterAvatarUrl} />
                                            <AvatarFallback>{req.requesterName.substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{req.requesterName}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3"/>
                                                {t('requestedTimeAgo', { timeAgo: formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleResponse(req.id, req.requesterId, 'decline')}
                                            disabled={!!isResponding}
                                        >
                                            <X className="h-4 w-4"/>
                                        </Button>
                                         <Button 
                                            size="sm" 
                                            onClick={() => handleResponse(req.id, req.requesterId, 'accept')}
                                            disabled={isResponding === req.id}
                                        >
                                            {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">{t('noRequests')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
