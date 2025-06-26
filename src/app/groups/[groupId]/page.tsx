
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

export default function GroupPage() {
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
                title: "Failed to load group",
                description: "There was a problem fetching the group details.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getGroupDetails, getGroupMembers, user, toast]);


    useEffect(() => {
        if (!groupId) return;
        fetchData();
    }, [groupId, fetchData]);

    const handleJoinGroup = async () => {
        if (!user) {
            toast({ title: "Please log in to join a group.", variant: "destructive" });
            return;
        }
        setIsJoining(true);
        try {
            await joinGroup({ groupId });
            setIsMember(true);
            setMembers(prev => [...prev, { id: user.uid, name: user.displayName || 'You', avatarUrl: user.photoURL || '' } as UserProfile]);
            toast({ title: "Successfully joined the group!" });
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
            setIsMember(false);
            setMembers(prev => prev.filter(m => m.id !== user.uid));
            toast({ title: "You have left the group." });
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
                                <p className="mt-4">Group discussion feed coming soon!</p>
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
                            {!user && <p className="text-sm text-muted-foreground">Please log in to join.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Members ({members.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                                        <AvatarFallback>{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{member.name}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    