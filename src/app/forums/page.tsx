
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, Search, Frown } from "lucide-react";
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ForumTopic } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

export default function ForumsPage() {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const getTopics = useMemo(() => httpsCallable(functions, 'getTopics'), [functions]);

    useEffect(() => {
        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const result = await getTopics();
                const data = result.data as { topics: any[] };
                const formattedTopics = data.topics.map(topic => ({
                    ...topic,
                    lastActivity: topic.lastActivity ? new Date(topic.lastActivity._seconds * 1000).toISOString() : new Date().toISOString(),
                }));
                setTopics(formattedTopics as ForumTopic[]);
            } catch (error) {
                console.error("Error fetching topics:", error);
                toast({
                    title: "Failed to load topics",
                    description: "There was a problem fetching the forum topics. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopics();
    }, [getTopics, toast]);

    const filteredTopics = useMemo(() => {
        return topics.filter(topic => 
            topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [topics, searchTerm]);

    const renderTopicList = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }

        if (filteredTopics.length === 0) {
            return (
                <div className="text-center py-12">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Topics Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? "Try adjusting your search terms." : "Why not be the first to create one?"}
                    </p>
                    {user && !searchTerm && (
                         <Button asChild className="mt-4">
                            <Link href="/forums/create-topic">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create a New Topic
                            </Link>
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredTopics.map(topic => (
                    <Link key={topic.id} href={`/forums/${topic.id}`} passHref>
                        <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                {topic.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-2">{topic.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{topic.postCount || 0} posts</span>
                                <div className="flex gap-1">
                                    {topic.regionTags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Community Forums</CardTitle>
                        <CardDescription>Connect, share, and learn with stakeholders from around the world.</CardDescription>
                    </div>
                    {user && (
                        <Button asChild>
                            <Link href="/forums/create-topic">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Topic
                            </Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search forums..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {renderTopicList()}
                </CardContent>
            </Card>
        </div>
    );
}
