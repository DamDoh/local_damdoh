
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, PlusCircle, Search, Frown, Leaf, ShieldAlert, Brain, TrendingUp, Award, Tractor, Package, Wheat, Truck, Pin, PinOff, Clock, Users, Lightbulb, RefreshCcw } from "lucide-react";
import Link from 'next/link';
import { apiCall } from '@/lib/api-utils';
import type { ForumTopic } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from '@/navigation';
import { useHomepagePreference } from '@/hooks/useHomepagePreference';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { z } from 'zod';
import { getForumTopicSuggestionsAction } from '@/lib/server-actions'; // Correctly import the server action

// This schema is now only used for type safety on the client
const ForumTopicSuggestionSchema = z.object({
    title: z.string(),
    description: z.string(),
});

type SuggestedTopic = z.infer<typeof ForumTopicSuggestionSchema>;

const getIconForTopic = (topicName: string = '') => {
  const name = topicName.toLowerCase();
  const iconProps = "h-8 w-8 text-primary";
  if (name.includes('sustainab')) return <Leaf className={iconProps} />;
  if (name.includes('loss') || name.includes('risk')) return <ShieldAlert className={iconProps} />;
  if (name.includes('logistic') || name.includes('transport')) return <Truck className={iconProps} />;
  if (name.includes('tech') || name.includes('traceability')) return <Brain className={iconProps} />;
  if (name.includes('market') || name.includes('price')) return <TrendingUp className={iconProps} />;
  if (name.includes('financ') || name.includes('grant')) return <Award className={iconProps} />;
  if (name.includes('packag')) return <Package className={iconProps} />;
  if (name.includes('crop') || name.includes('grain')) return <Wheat className={iconProps} />;
  if (name.includes('machinery') || name.includes('equipment')) return <Tractor className={iconProps} />;
  return <MessageSquare className={iconProps} />;
};

function TopicCardSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-10" />
                </div>
                <Skeleton className="h-6 w-3/4 mt-2" />
                 <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-2" />
            </CardFooter>
        </Card>
    );
}

export default function ForumsPage() {
    const t = useTranslations('forumsPage');
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();
    const pathname = usePathname();
    const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();
    const locale = useLocale();

    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiCall<{ topics?: ForumTopic[] }>('/forums/topics');
            const fetchedTopics = data?.topics || [];
            setTopics(fetchedTopics);

            if (fetchedTopics.length > 0) {
                setIsLoadingSuggestions(true);
                try {
                    const suggestionsData = await apiCall<{ suggestions: SuggestedTopic[] }>('/forums/topic-suggestions', {
                        method: 'POST',
                        body: JSON.stringify({
                            existingTopics: fetchedTopics.map(t => ({ name: t.name, description: t.description })),
                            language: locale,
                        })
                    });
                    setSuggestedTopics(suggestionsData.suggestions);
                } catch (e) {
                    console.error("Failed to fetch topic suggestions:", e);
                } finally {
                    setIsLoadingSuggestions(false);
                }
            } else {
                setIsLoadingSuggestions(false);
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            toast({
                title: t('errors.loadTitle'),
                description: t('errors.loadDescription'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [locale, toast, t]);
    
    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);
    

    const filteredTopics = useMemo(() => {
        if (!Array.isArray(topics)) return [];
        return topics.filter(topic => {
            if (!topic) return false;
            const nameMatch = (topic.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const descMatch = (topic.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || descMatch;
        });
    }, [topics, searchTerm]);

    const isCurrentHomepage = homepagePreference === pathname;

    const handleSetHomepage = useCallback(() => {
        if (isCurrentHomepage) {
        clearHomepagePreference();
        toast({ title: t('pinning.unpinnedTitle'), description: t('pinning.unpinnedDescription') });
        } else {
        setHomepagePreference(pathname as string);
        toast({ title: t('pinning.pinnedTitle'), description: t('pinning.pinnedDescription') });
        }
    }, [isCurrentHomepage, clearHomepagePreference, setHomepagePreference, pathname, toast, t]);
    
    const renderTopicList = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <TopicCardSkeleton key={`skel-topic-${i}`} />)}
                </div>
            );
        }

        if (filteredTopics.length === 0) {
            return (
                <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">{t('noTopics')}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? t('noTopics') : t('noTopics')}
                    </p>
                    {user && !searchTerm && (
                         <Button asChild className="mt-4">
                            <Link href="/forums/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('createTopic')}
                            </Link>
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map(topic => (
              <Card key={topic.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        {getIconForTopic(topic.name)}
                        <Badge variant="secondary" className="flex items-center gap-1.5"><Users className="h-3 w-3" />{topic.postCount || 0}</Badge>
                    </div>
                    <CardTitle className="text-lg pt-2 h-20 line-clamp-3">{topic.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{topic.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{t('activity', { time: formatDistanceToNow(new Date(topic.lastActivityAt), { addSuffix: true }) })}</span>
                    </div>
                    <Button asChild className="w-full mt-2">
                        <Link href={`/forums/${topic.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />{t('joinDiscussion')}
                        </Link>
                    </Button>
                </CardFooter>
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
                            <CardTitle className="text-2xl">{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {user && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/forums/create">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {t('createTopic')}
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleSetHomepage} className="w-full sm:w-auto">
                                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                {isCurrentHomepage ? t('pinning.unpinButton') : t('pinning.pinButton')}
                             </Button>
                        </div>
                    </div>
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
                    
                    {user && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-400" />
                                {t('suggestedTopicsTitle')}
                            </h3>
                            {isLoadingSuggestions ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {suggestedTopics.map(suggestion => (
                                        <Button key={suggestion.title} variant="outline" asChild>
                                            <Link href={`/forums/create?title=${encodeURIComponent(suggestion.title)}&description=${encodeURIComponent(suggestion.description)}`}>
                                                {suggestion.title}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {renderTopicList()}
                </CardContent>
            </Card>
        </div>
    );
}

    