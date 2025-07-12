
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, PlusCircle, Search, Lock } from "lucide-react";
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { ForumGroup } from '@/lib/types';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export default function GroupsPage() {
    const t = useTranslations('groupsPage');
    const [groups, setGroups] = useState<ForumGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const getGroupsCallable = useMemo(() => httpsCallable(functions, 'getGroups'), [functions]);

    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoading(true);
            try {
                const result = await getGroupsCallable();
                // Use nullish coalescing operator for safety
                const data = (result.data as { groups?: ForumGroup[] })?.groups ?? [];
                setGroups(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
                toast({
                    title: "Failed to load groups",
                    description: "There was a problem fetching the community groups. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, [getGroupsCallable, toast]);

    const filteredGroups = useMemo(() => {
        if (!Array.isArray(groups)) return [];
        return groups.filter(group => {
            if (!group) return false;
            const nameMatch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const descMatch = group.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            return nameMatch || descMatch;
        });
    }, [groups, searchTerm]);

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </div>
                    {user && (
                        <Button asChild>
                            <Link href="/groups/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('createGroupButton')}
                            </Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder={t('searchPlaceholder')}
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                <Link key={group.id} href={`/groups/${group.id}`}>
                                    <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
 {group.isPublic ? <Users className="h-5 w-5 text-primary shrink-0" /> : <Lock className="h-5 w-5 text-primary shrink-0" />}
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-2">{group.description}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{t('detail.membersTitle', { memberCount: group.memberCount || 0 })}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))) : (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">{t('notFound')}</div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
