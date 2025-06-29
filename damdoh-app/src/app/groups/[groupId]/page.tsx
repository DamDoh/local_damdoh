
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserPlus, Users, Lock, LogOut, MessageSquare } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumGroup, UserProfile } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslation } from 'react-i18next';

export default function GroupPage() {
    const { t } = useTranslation('common');
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<ForumGroup | null>(null);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const functions = getFunctions(firebaseApp);
    const getGroupDetails = useMemo(() => httpsCallable(functions, 'getGroupDetails'), [functions]);
    const getGroupMembers = useMemo(() => httpsCallable(functions, 'getGroupMembers'), [functions]);
    const joinGroup = useMemo(() => httpsCallable(functions, 'joinGroup'), [functions]);
    const leaveGroup = useMemo(() => httpsCallable(functions, 'leaveGroup'), [functions]);


    const fetchData = useCallback(async () => {
        if (!groupId) return;
        setIsLoading(true);
        try {
            const [groupDetailsResult, groupMembersResult] = await Promise.all([
                getGroupDetails({ groupId }),
                getGroupMembers({ groupId })
            ]);

            setGroup(groupDetailsResult.data as ForumGroup);
            const fetchedMembers = groupMembersResult.data as UserProfile[]
            setMembers(fetchedMembers);

            if (user) {
                const memberIds = fetchedMembers.map(m => m.id);
                setIsMember(memberIds.includes(user.uid));
            }

        } catch (error) {
            console.error("Error fetching group data:", error);
             toast({
                title: t('groups.detail.errorLoadTitle'),
                description: t('groups.detail.errorLoadDescription'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getGroupDetails, getGroupMembers, user, toast, t]);


    useEffect(() => {
        fetchData();
    }, [groupId, fetchData]);

    const handleJoinGroup = async () => {
        if (!user) {
            toast({ title: t('groups.detail.errorAuth'), variant: "destructive" });
            router.push('/auth/signin');
            return;
        }
        setIsJoining(true);
        try {
            await joinGroup({ groupId });
            
            const userProfileData = {
              id: user.uid,
              displayName: user.displayName || 'You',
              photoURL: user.photoURL || ''
            } as UserProfile;

            // Optimistic update
            setIsMember(true);
            setMembers(prev => [...prev, userProfileData]);
            if (group) setGroup(g => g ? {...g, memberCount: g.memberCount + 1} : null);

            toast({ title: t('groups.detail.successJoin') });
        } catch (error: any) {
            console.error("Error joining group:", error);
            toast({ title: t('groups.detail.failJoinTitle'), description: error.message || t('groups.detail.failJoinDescription'), variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };
    
    const handleLeaveGroup = async () => {
        if (!user) return;
        
        setIsJoining(true); // Reuse the same loading state
        try {
            await leaveGroup({ groupId });
             // Optimistic update
            setIsMember(false);
            setMembers(prev => prev.filter(m => m.id !== user.uid));
            if (group) setGroup(g => g ? {...g, memberCount: g.memberCount - 1} : null);

            toast({ title: t('groups.detail.successLeave') });
        } catch (error: any) {
            console.error("Error leaving group:", error);
            toast({ title: t('groups.detail.failLeaveTitle'), description: error.message || t('groups.detail.failLeaveDescription'), variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };


    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="container mx-auto max-w-4xl py-8 text-center">
                <h3 className="text-lg font-semibold">{t('groups.detail.notFoundTitle')}</h3>
                <p className="text-muted-foreground">{t('groups.detail.notFoundDescription')}</p>
                <Button asChild className="mt-4">
                    <Link href="/groups">{t('groups.detail.notFoundBackButton')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('groups.detail.backButton')}
            </Link>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                {group.isPublic ? <Users className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                {group.name}
                            </CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Placeholder for group posts/feed */}
                            <div className="py-10 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto" />
                                <p className="mt-4">{t('groups.detail.feedComingSoon')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('groups.detail.actionsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {user && (
                                isMember ? (
                                    <Button onClick={handleLeaveGroup} variant="destructive" className="w-full" disabled={isJoining}>
                                        <LogOut className="mr-2 h-4 w-4" /> {isJoining ? t('groups.detail.leavingButton') : t('groups.detail.leaveButton')}
                                    </Button>
                                ) : (
                                    <Button onClick={handleJoinGroup} className="w-full" disabled={isJoining || !group.isPublic}>
                                        <UserPlus className="mr-2 h-4 w-4" /> {isJoining ? t('groups.detail.joiningButton') : (group.isPublic ? t('groups.detail.joinButton') : t('groups.detail.requestJoinButton'))}
                                    </Button>
                                )
                            )}
                            {!user && <Button asChild className="w-full"><Link href="/auth/signin">{t('groups.detail.loginToJoinButton')}</Link></Button>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('groups.detail.membersTitle', { count: group.memberCount })}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.photoURL} alt={member.displayName} data-ai-hint="profile person agriculture" />
                                        <AvatarFallback>{member.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{member.displayName}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
