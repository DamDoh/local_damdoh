
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
import { useTranslation } from "react-i18next";

export default function GroupsPage() {
    const { t } = useTranslation('common');
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
                const data = result.data as { groups: any[] };
                setGroups(data.groups as ForumGroup[]);
            } catch (error) {
                console.error("Error fetching groups:", error);
                toast({
                    title: t('groups.errorLoadTitle'),
                    description: t('groups.errorLoadDescription'),
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, [getGroupsCallable, toast, t]);

    const filteredGroups = useMemo(() => {
        return groups.filter(group => 
            group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groups, searchTerm]);

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">{t('groups.title')}</CardTitle>
                        <CardDescription>{t('groups.description')}</CardDescription>
                    </div>
                    {user && (
                        <Button asChild>
                            <Link href="/groups/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('groups.createButton')}
                            </Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder={t('groups.searchPlaceholder')}
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
                            {filteredGroups.map(group => (
                                <Link key={group.id} href={`/groups/${group.id}`}>
                                    <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {group.isPublic ? <Users className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-2">{group.description}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{group.memberCount || 0} {t('groups.members')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
