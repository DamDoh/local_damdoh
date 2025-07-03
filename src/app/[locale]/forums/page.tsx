
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
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

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

export default function ForumsPage() {
    const t = useTranslations('Forums');
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();
    const functions = getFunctions(firebaseApp);
    const getTopicsCallable = useMemo(() => httpsCallable(functions, 'getTopics'), [functions]);
    const pathname = usePathname();
    const { setHomepagePreference, homepagePreference, clearHomepagePreference } = useHomepagePreference();

    useEffect(() => {
        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const result = await getTopicsCallable();
                const data = result.data as { topics?: ForumTopic[] };
                setTopics(data?.topics || []);
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
        };

        fetchTopics();
    }, [getTopicsCallable, toast, t]);

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

    const handleSetHomepage = () => {
        if (isCurrentHomepage) {
        clearHomepagePreference();
        toast({
            title: t('pinning.unpinnedTitle'),
            description: t('pinning.unpinnedDescription'),
        });
        } else {
        setHomepagePreference(pathname);
        toast({
            title: t('pinning.pinnedTitle'),
            description: t('pinning.pinnedDescription'),
        });
        }
    };

    const renderTopicList = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            );
        }

        if (filteredTopics.length === 0) {
            return (
                <div className="text-center py-16 col-span-full border-2 border-dashed rounded-lg">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">{t('notFound.title')}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? t('notFound.tryDifferentSearch') : t('notFound.beTheFirst')}
                    </p>
                    {user && !searchTerm && (
                         <Button asChild className="mt-4">
                            <Link href="/forums/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('buttons.createTopic')}
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
                <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{t('lastActivity', { time: formatDistanceToNow(new Date(topic.lastActivityAt), { addSuffix: true }) })}</span>
                    </div>
                    <Button asChild className="w-full mt-2">
                        <Link href={`/forums/${topic.id}`}>{t('buttons.joinDiscussion')}</Link>
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
                                        {t('buttons.createTopic')}
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleSetHomepage} className="w-full sm:w-auto">
                                {isCurrentHomepage ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                {isCurrentHomepage ? t('buttons.unpinHomepage') : t('buttons.pinHomepage')}
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
                    {renderTopicList()}
                </CardContent>
            </Card>
        </div>
    );
}
