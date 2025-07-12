
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Loader2, Users, Mail, Clock, Send, PlusCircle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const functions = getFunctions(firebaseApp);

function JoinRequestsTab() {
    const t = useTranslations('groupsPage.manage');
    const { toast } = useToast();
    const params = useParams();
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
        fetchRequests();
    }, [fetchRequests]);

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

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    return (
        <div className="space-y-3">
            {requests.length > 0 ? (
                requests.map(req => (
                    <div key={req.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
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
                            <Button size="sm" variant="outline" onClick={() => handleResponse(req.id, req.requesterId, 'decline')} disabled={!!isResponding}>
                                <X className="h-4 w-4"/>
                            </Button>
                                <Button size="sm" onClick={() => handleResponse(req.id, req.requesterId, 'accept')} disabled={isResponding === req.id}>
                                {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">{t('noRequests')}</p>
            )}
        </div>
    );
}

function InvitesTab() {
    const t = useTranslations('groupsPage.manage.invitesTab');
    const { toast } = useToast();
    const params = useParams();
    const groupId = params.groupId as string;

    const [inviteEmail, setInviteEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const inviteUserCallable = useMemo(() => httpsCallable(functions, 'inviteUserToGroup'), []);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) {
            toast({ variant: 'destructive', title: t('toast.emailRequired') });
            return;
        }
        setIsSending(true);
        try {
            await inviteUserCallable({ groupId, email: inviteEmail });
            toast({ title: t('toast.inviteSent'), description: t('toast.inviteSentDescription', { email: inviteEmail }) });
            setInviteEmail('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{t('description')}</p>
            <form onSubmit={handleSendInvite} className="flex gap-2 items-end">
                <div className="flex-grow space-y-1.5">
                    <Label htmlFor="invite-email">{t('emailLabel')}</Label>
                    <Input 
                        id="invite-email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={isSending}
                    />
                </div>
                <Button type="submit" disabled={isSending || !inviteEmail}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}


export default function ManageGroupPage() {
    const t = useTranslations('groupsPage.manage');
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    
    if (authLoading) {
        return <Skeleton className="h-96 max-w-2xl mx-auto" />;
    }
    
    if (!user) {
        router.push('/auth/signin');
        return null;
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
                    <Tabs defaultValue="requests">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="requests">{t('requestsTab')}</TabsTrigger>
                            <TabsTrigger value="invites">{t('invitesTab')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="requests" className="pt-4">
                           <JoinRequestsTab />
                        </TabsContent>
                        <TabsContent value="invites" className="pt-4">
                           <InvitesTab />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
