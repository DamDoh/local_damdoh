
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, Search, Frown, Leaf, ShieldAlert, Brain, TrendingUp, Award, Tractor, Package, Wheat, Truck, Pin, PinOff, Clock, Users } from "lucide-react";
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { ForumTopic } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { useHomepagePreference } from '@/hooks/useHomepagePreference';

const getIcon = (iconName?: string) => {
  const iconPropsBase = "h-6 w-6 text-primary";
  const iconPropsDesktop = "h-8 w-8 text-primary";
  switch (iconName) {
    case 'Leaf': return <Leaf className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'ShieldAlert': return <ShieldAlert className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Brain': return <Brain className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'TrendingUp': return <TrendingUp className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Award': return <Award className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Tractor': return <Tractor className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Package': return <Package className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Wheat': return <Wheat className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    case 'Truck': return <Truck className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
    default: return <MessageSquare className={`${iconPropsBase} md:${iconPropsDesktop}`} />;
  }
};

export default function ForumsPage() {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const getTopics = useMemo(() => httpsCallable(functions, 'getTopics'), [functions]);
    const pathname = usePathname();
    const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();

    useEffect(() => {
        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const result = await getTopics();
                const data = result.data as { topics: any[] };
                const formattedTopics = data.topics.map(topic => ({
                    ...topic,
                    lastActivity: topic.lastActivity ? new Date(topic.lastActivity.seconds * 1000).toISOString() : new Date().toISOString(),
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

    const isCurrentHomepage = homepagePreference === pathname;

    const handleSetHomepage = () => {
        if (isCurrentHomepage) {
        clearHomepagePreference();
        toast({
            title: "Homepage Unpinned!",
            description: "The Dashboard is now your default homepage.",
        });
        } else {
        setHomepagePreference(pathname);
        toast({
            title: "Homepage Pinned!",
            description: "Forums are now your default homepage.",
        });
        }
    };


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
            <div className="space-y-3 md:space-y-4">
                {filteredTopics.map(topic => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 bg-accent/20 rounded-md hidden sm:block shrink-0">
                       {getIcon(topic.icon)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={`/forums/${topic.id}`}>
                        <CardTitle className="text-base md:text-lg hover:text-primary transition-colors truncate">{topic.name}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">{topic.description}</CardDescription>
                      <div className="mt-2 md:mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{topic.postCount || 0} contributions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last activity: {new Date(topic.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto shrink-0 text-xs h-8 px-3">
                      <Link href={`/forums/${topic.id}`}>Join</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl">Community Forums</CardTitle>
                            <CardDescription>Connect, share, and learn with stakeholders from around the world.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {user && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/forums/create-topic">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Topic
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleSetHomepage} className="w-full sm:w-auto">
                                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                {isCurrentHomepage ? "Unpin Homepage" : "Pin as Homepage"}
                             </Button>
                        </div>
                    </div>
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

    
