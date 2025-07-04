
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserPlus, Users, Lock, LogOut, MessageSquare, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ForumGroup, UserProfile } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';

interface GroupMember {
  id: string; // User ID
  displayName: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string; // ISO string
}

interface GroupPost {
  id: string;
  title: string;
  authorRef: string;
  authorName: string;
  authorAvatarUrl: string;
  replyCount: number;
  createdAt: string; // ISO
}


export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<ForumGroup | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const functions = getFunctions(firebaseApp);
    const getGroupDetails = useMemo(() => httpsCallable(functions, 'getGroupDetails'), [functions]);
    const getGroupMembers = useMemo(() => httpsCallable(functions, 'getGroupMembers'), [functions]);
    const getGroupPosts = useMemo(() => httpsCallable(functions, 'getGroupPosts'), [functions]);
    const joinGroup = useMemo(() => httpsCallable(functions, 'joinGroup'), [functions]);
    const leaveGroup = useMemo(() => httpsCallable(functions, 'leaveGroup'), [functions]);

    const fetchData = useCallback(async () => {
        if (!groupId) return;
        setIsLoading(true);
        try {
            const [groupDetailsResult, groupMembersResult, groupPostsResult] = await Promise.all([
                getGroupDetails({ groupId }),
                getGroupMembers({ groupId }),
                getGroupPosts({ groupId })
            ]);
            
            const groupData = groupDetailsResult.data as ForumGroup | null;
            const membersData = (groupMembersResult.data as { members: GroupMember[] })?.members || [];
            const postsData = (groupPostsResult.data as { posts: GroupPost[] })?.posts || [];


            setGroup(groupData);
            setMembers(membersData);
            setPosts(postsData);

            if (user && Array.isArray(membersData)) {
                const memberIds = membersData.map(m => m.id);
                setIsMember(memberIds.includes(user.uid));
            }

        } catch (error) {
            console.error("Error fetching group data:", error);
             toast({
                title: "Failed to load group",
                description: "There was a problem fetching the group details.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getGroupDetails, getGroupMembers, getGroupPosts, user, toast]);


    useEffect(() => {
        fetchData();
    }, [groupId, fetchData]);
    
    const handleJoinGroup = async () => {
        if (!user) {
            toast({ title: "Please log in to join a group.", variant: "destructive" });
            router.push('/auth/signin');
            return;
        }
        setIsJoining(true);
        try {
            await joinGroup({ groupId });
            toast({ title: "Successfully joined the group!" });
            fetchData(); // Refetch all data to update UI
        } catch (error: any) {
            console.error("Error joining group:", error);
            toast({ title: "Failed to join group", description: error.message || "An error occurred. Please try again.", variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };
    
    const handleLeaveGroup = async () => {
        if (!user) return;
        
        setIsJoining(true); // Reuse the same loading state
        try {
            await leaveGroup({ groupId });
            toast({ title: "You have left the group." });
            fetchData(); // Refetch all data to update UI
        } catch (error: any) {
            console.error("Error leaving group:", error);
            toast({ title: "Failed to leave group", description: error.message || "An error occurred. Please try again.", variant: "destructive" });
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
                <h3 className="text-lg font-semibold">Group not found.</h3>
                <p className="text-muted-foreground">This group may have been deleted or the link is incorrect.</p>
                <Button asChild className="mt-4">
                    <Link href="/groups">Back to Groups</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to all groups
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
                                <CardTitle className="text-lg">Discussions</CardTitle>
                                {isMember && (
                                    <Button asChild>
                                        <Link href={`/groups/${groupId}/create-post`}>
                                            <PlusCircle className="mr-2 h-4 w-4"/>Start a Discussion
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
                                                        By {post.authorName} &bull; {new Date(post.createdAt).toLocaleDateString()}
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
                                        <h3 className="mt-4 text-lg font-semibold">No discussions yet</h3>
                                        {isMember && <p className="mt-2 text-sm text-muted-foreground">Be the first to start a conversation in this group!</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Group Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {user && (
                                isMember ? (
                                    <Button onClick={handleLeaveGroup} variant="destructive" className="w-full" disabled={isJoining}>
                                        <LogOut className="mr-2 h-4 w-4" /> {isJoining ? 'Leaving...' : 'Leave Group'}
                                    </Button>
                                ) : (
                                    <Button onClick={handleJoinGroup} className="w-full" disabled={isJoining || !group.isPublic}>
                                        <UserPlus className="mr-2 h-4 w-4" /> {isJoining ? 'Joining...' : (group.isPublic ? 'Join Group' : 'Request to Join')}
                                    </Button>
                                )
                            )}
                            {!user && <Button asChild className="w-full"><Link href="/auth/signin">Log in to Join</Link></Button>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Members ({group.memberCount})</CardTitle>
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
