
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserPlus, Users, Lock, LogOut, MessageSquare, PlusCircle, Check, Loader2, Settings } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumGroup, UserProfile, GroupPost, JoinRequest } from '@/lib/types';
import { apiCall } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

interface GroupMember {
  id: string; // User ID
  displayName: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string; // ISO string
}

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('groupsPage.detail');
    
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<ForumGroup | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [hasRequested, setHasRequested] = useState(false); // To track join request status

    const getGroupDetails = useCallback(async (data: { groupId: string }) => {
        return await apiCall<ForumGroup>(`/groups/${data.groupId}`);
    }, []);

    const getGroupMembers = useCallback(async (data: { groupId: string }) => {
        return await apiCall<{ members: GroupMember[] }>(`/groups/${data.groupId}/members`);
    }, []);

    const getGroupPosts = useCallback(async (data: { groupId: string }) => {
        return await apiCall<{ posts: GroupPost[] }>(`/groups/${data.groupId}/posts`);
    }, []);

    const joinGroup = useCallback(async (data: { groupId: string }) => {
        return await apiCall(`/groups/${data.groupId}/join`, {
            method: 'POST'
        });
    }, []);

    const leaveGroup = useCallback(async (data: { groupId: string }) => {
        return await apiCall(`/groups/${data.groupId}/leave`, {
            method: 'POST'
        });
    }, []);

    const requestToJoinGroup = useCallback(async (data: { groupId: string }) => {
        return await apiCall(`/groups/${data.groupId}/request-join`, {
            method: 'POST'
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (!groupId) return;
        setIsLoading(true);
        try {
            const [groupDetailsResult, groupMembersResult, groupPostsResult] = await Promise.all([
                getGroupDetails({ groupId }),
                getGroupMembers({ groupId }),
                getGroupPosts({ groupId })
            ]);

            const groupData = groupDetailsResult;
            const membersData = groupMembersResult.members || [];
            const postsData = groupPostsResult.posts || [];

            setGroup(groupData);
            setMembers(membersData);
            setPosts(postsData);

            if (user && Array.isArray(membersData)) {
                const memberIds = membersData.map(m => m.id);
                setIsMember(memberIds.includes(user.id));
            }

        } catch (error) {
            console.error("Error fetching group data:", error);
             toast({
                title: t('toast.loadError.title'),
                description: t('toast.loadError.description'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getGroupDetails, getGroupMembers, getGroupPosts, user, toast, t]);


    useEffect(() => {
        fetchData();
    }, [groupId, fetchData]);
    
    const handleJoinAction = async () => {
        if (!user) {
            toast({ title: t('toast.loginToJoin'), variant: "destructive" });
            router.push('/auth/signin');
            return;
        }
        setIsJoining(true);
        try {
            if (group?.isPublic) {
                await joinGroup({ groupId });
                toast({ title: t('toast.joinSuccess') });
            } else {
                await requestToJoinGroup({ groupId });
                setHasRequested(true); // Update state to show request is sent
                toast({ title: t('toast.requestSuccess') });
            }
            fetchData(); // Refetch all data to update UI
        } catch (error: any) {
            console.error("Error joining/requesting group:", error);
            // Check for specific error code from backend
            if (error.code === 'already-exists') {
                setHasRequested(true);
            }
            toast({ title: t('toast.joinError'), description: error.message || t('toast.error.description'), variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };
    
    const handleLeaveGroup = async () => {
        if (!user) return;
        
        setIsJoining(true); // Reuse the same loading state
        try {
            await leaveGroup({ groupId });
            toast({ title: t('toast.leaveSuccess') });
            fetchData(); // Refetch all data to update UI
        } catch (error: any) {
            console.error("Error leaving group:", error);
            toast({ title: t('toast.leaveError'), description: error.message || t('toast.error.description'), variant: "destructive" });
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
                <h3 className="text-lg font-semibold">{t('notFound.title')}</h3>
                <p className="text-muted-foreground">{t('notFound.description')}</p>
                <Button asChild className="mt-4">
                    <Link href="/groups">{t('notFound.backButton')}</Link>
                </Button>
            </div>
        );
    }

    const isOwner = user?.id === group.ownerId;
    const renderJoinButton = () => {
        if (!user) {
            return <Button asChild className="w-full"><Link href="/auth/signin">{t('loginToJoinButton')}</Link></Button>;
        }
        if (isMember) {
            return (
                <Button onClick={handleLeaveGroup} variant="destructive" className="w-full" disabled={isJoining}>
                    {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    {isJoining ? t('leavingButton') : t('leaveButton')}
                </Button>
            );
        }
        if (hasRequested) {
            return <Button className="w-full" disabled>{t('requestSentButton')}</Button>;
        }
        return (
             <Button onClick={handleJoinAction} className="w-full" disabled={isJoining}>
                {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isJoining ? t('joiningButton') : (group.isPublic ? t('joinButton') : t('requestJoinButton'))}
            </Button>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                {group.isPublic ? <Users className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                {group.name}
                            </CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{t('discussionsTitle')}</CardTitle>
                                {isMember && (
                                    <Button asChild>
                                        <Link href={`/groups/${groupId}/create-post`}>
                                            <PlusCircle className="mr-2 h-4 w-4"/>{t('startDiscussionButton')}
                                        </Link>
                                    </Button>
                                )}
                             </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {isLoading ? (
                                    <Skeleton className="h-40 w-full" />
                                ) : posts.length > 0 ? (
                                    posts.map(post => (
                                        <Link key={post.id} href={`/groups/${groupId}/posts/${post.id}`}>
                                            <div className="p-3 border rounded-lg hover:bg-accent flex items-start gap-3 transition-colors cursor-pointer">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                                                    <AvatarFallback>{post.authorName?.substring(0, 1) || '?'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow overflow-hidden">
                                                    <h4 className="font-semibold truncate text-sm">{post.title}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('by', { author: post.authorName })} &bull; {new Date(post.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {post.replyCount || 0}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">{t('noDiscussions')}</h3>
                                        {isMember && <p className="mt-2 text-sm text-muted-foreground">{t('beTheFirst')}</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('actionsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {renderJoinButton()}
                            {isOwner && (
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={`/groups/${groupId}/manage`}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        {t('manageButton')}
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('membersTitle', { memberCount: group.memberCount })}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Array.isArray(members) && members.filter(Boolean).map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.avatarUrl} alt={member.displayName} data-ai-hint="profile person agriculture" />
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

    
