

"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserPlus, Check, X, Users, UserMinus, Loader2, Send } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { ConnectionRequest, Connection } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';

export default function MyNetworkPage() {
    const t = useTranslations('myNetworkPage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResponding, setIsResponding] = useState<string | null>(null);

    const functions = getFunctions(firebaseApp);
    const getPendingRequests = useMemo(() => httpsCallable(functions, 'getPendingRequests'), []);
    const getConnectionsCallable = useMemo(() => httpsCallable(functions, 'getConnections'), []);
    const respondToRequest = useMemo(() => httpsCallable(functions, 'respondToConnectionRequest'), []);
    const removeConnection = useMemo(() => httpsCallable(functions, 'removeConnection'), []);
    const sendInviteCallable = useMemo(() => httpsCallable(functions, 'sendInvite'), [functions]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [requestsResult, connectionsResult] = await Promise.all([
                getPendingRequests(),
                getConnectionsCallable()
            ]);
            setRequests((requestsResult.data as any)?.requests || []);
            setConnections((connectionsResult.data as any)?.connections || []);
        } catch (error: any) {
            console.error("Error fetching network data:", error);
            toast({ title: t('toast.error'), description: t('toast.loadError'), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [getPendingRequests, getConnectionsCallable, toast, t]);

    useEffect(() => {
        if (user) {
            fetchData();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, fetchData]);

    const handleRespondToRequest = async (requestId: string, response: 'accepted' | 'declined') => {
        setIsResponding(requestId);
        try {
            await respondToRequest({ requestId, response });
            toast({ title: t('toast.success'), description: response === 'accepted' ? t('toast.requestAccepted') : t('toast.requestDeclined') });
            fetchData(); // Refetch all data
        } catch (error: any) {
            toast({ title: t('toast.error'), description: error.message || t('toast.respondError'), variant: "destructive" });
        } finally {
            setIsResponding(null);
        }
    };
    
    const handleRemoveConnection = async (connectionId: string) => {
        setIsResponding(connectionId); // Reuse loading state
        try {
            await removeConnection({ connectionId });
            toast({ title: t('toast.connectionRemoved') });
            fetchData(); // Refetch
        } catch (error: any) {
             toast({ title: t('toast.error'), description: t('toast.removeError'), variant: "destructive" });
        } finally {
            setIsResponding(null);
        }
    };

    const handleInvite = async () => {
      const inviteeEmail = prompt(t('invitePrompt'));
      if (inviteeEmail) {
        try {
          await sendInviteCallable({ inviteeEmail });
          toast({
            title: t('inviteSuccessTitle'),
            description: t('inviteSuccessDescription', { email: inviteeEmail }),
          });
        } catch (error: any) {
          toast({
            title: t('inviteErrorTitle'),
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    };


    if (isLoading || authLoading) {
        return <NetworkPageSkeleton />;
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Please Sign In</CardTitle>
                    <CardDescription>You need to be logged in to manage your network.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild><Link href="/auth/signin">Sign In</Link></Button>
                </CardContent>
            </Card>
        );
    }
    

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/network" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>

            <Tabs defaultValue="connections" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="connections">{t('myConnectionsTab', { count: connections.length })}</TabsTrigger>
                    <TabsTrigger value="requests">
                        {t('pendingRequestsTab')}
                        {requests.length > 0 && <Badge className="ml-2">{requests.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="connections" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('connectionsTitle')}</CardTitle>
                            <CardDescription>{t('connectionsDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {connections.length > 0 ? connections.map(conn => (
                                    <div key={conn.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar>
                                                <AvatarImage src={conn.avatarUrl} alt={conn.displayName} />
                                                <AvatarFallback>{conn.displayName?.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <Link href={`/profiles/${conn.id}`} className="hover:underline">
                                                    <p className="font-semibold truncate">{conn.displayName}</p>
                                                </Link>
                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                    <StakeholderIcon role={conn.primaryRole} className="h-3 w-3 shrink-0"/>
                                                    {conn.primaryRole}
                                                </p>
                                            </div>
                                        </div>
                                         <Button size="sm" variant="destructive" onClick={() => handleRemoveConnection(conn.id)} disabled={isResponding === conn.id}>
                                            {isResponding === conn.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserMinus className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="md:col-span-2 text-center py-10 border-2 border-dashed rounded-lg">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="font-semibold">{t('noConnections.title')}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{t('noConnections.description')}</p>
                                        <Button onClick={handleInvite}><Send className="mr-2 h-4 w-4" />{t('noConnections.inviteButton')}</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="requests" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('requestsTitle')}</CardTitle>
                            <CardDescription>{t('requestsDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {requests.length > 0 ? requests.map(req => (
                                    <div key={req.id} className="p-3 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar>
                                                <AvatarImage src={req.requester.avatarUrl} alt={req.requester.displayName} />
                                                <AvatarFallback>{req.requester.displayName?.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <Link href={`/profiles/${req.requester.id}`} className="hover:underline">
                                                    <p className="font-semibold truncate">{req.requester.displayName}</p>
                                                </Link>
                                                <p className="text-xs text-muted-foreground truncate">{req.requester.primaryRole}</p>
                                                <p className="text-xs text-muted-foreground">{t('sentTimeAgo', { timeAgo: formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-center">
                                            <Button size="sm" variant="secondary" onClick={() => handleRespondToRequest(req.id, 'declined')} disabled={!!isResponding}><X className="h-4 w-4"/></Button>
                                            <Button size="sm" onClick={() => handleRespondToRequest(req.id, 'accepted')} disabled={isResponding === req.id}>
                                                {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                      <p className="text-muted-foreground">{t('noRequests')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const NetworkPageSkeleton = () => (
    <div className="container mx-auto max-w-4xl py-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    </div>
)
