
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { mobileHomeCategories } from '@/lib/dummy-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getMarketplaceRecommendationsAction } from "@/lib/server-actions";
import { MarketplaceItem } from "@/lib/types";

interface RecommendedItem {
  item: MarketplaceItem;
  reason: string;
}

export function MobileHomepage() {
  const { profile, loading } = useUserProfile();
  const t = useTranslations('MobileHomepage');
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      setIsLoadingRecs(true);
      getMarketplaceRecommendationsAction(user.uid, 6)
        .then(data => {
          setRecommendations(data || []);
        })
        .catch(console.error)
        .finally(() => setIsLoadingRecs(false));
    } else {
        setIsLoadingRecs(false);
    }
  }, [user]);

  const welcomeMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t('welcome.morning', { name: profile?.displayName?.split(' ')[0] || '' });
    if (hours < 18) return t('welcome.afternoon', { name: profile?.displayName?.split(' ')[0] || '' });
    return t('welcome.evening', { name: profile?.displayName?.split(' ')[0] || '' });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <div className="px-4">
        {loading ? (
            <Skeleton className="h-7 w-48"/>
        ) : (
             <h1 className="text-2xl font-bold">{welcomeMessage()}</h1>
        )}
      </div>
      
      {/* Quick Actions/Categories */}
      <div>
        <ScrollArea>
          <div className="flex space-x-4 p-4">
            {mobileHomeCategories.map((category) => (
              <Link href={category.href} key={category.id} className="flex flex-col items-center gap-2 w-20 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <category.icon className="h-7 w-7" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{category.name}</span>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Discover Section */}
      <div className="px-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('discoverTitle')}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">{t('seeAllButton')} <ArrowRight className="h-4 w-4 ml-1"/></Link>
          </Button>
        </div>
        <ScrollArea>
            <div className="flex space-x-4 pb-4">
            {isLoadingRecs ? (
                Array.from({length: 4}).map((_, i) => (
                    <Card key={i} className="w-40 shrink-0 overflow-hidden">
                        <Skeleton className="h-24 w-full"/>
                        <CardContent className="p-2 space-y-1">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-3 w-1/2"/>
                        </CardContent>
                    </Card>
                ))
            ) : recommendations.length > 0 ? (
                recommendations.map(({ item }) => (
                <Card key={item.id} className="w-40 shrink-0 overflow-hidden">
                    <Link href={`/marketplace/${item.id}`} className="block">
                        <div className="relative h-24">
                            <Image src={item.imageUrl || 'https://placehold.co/200x250.png'} alt={item.name} fill style={{objectFit: 'cover'}} data-ai-hint={item.dataAiHint || "marketplace item"} />
                        </div>
                        <CardContent className="p-2">
                            <p className="text-xs font-semibold line-clamp-2">{item.name}</p>
                            <p className="text-xs text-primary">{item.category}</p>
                        </CardContent>
                    </Link>
                </Card>
            ))
            ) : (
                <p className="text-sm text-muted-foreground pl-2">{t('noRecommendations')}</p>
            )}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

       {/* Feed Placeholder - links to the full feed */}
       <div className="px-4 space-y-3">
            <h2 className="text-xl font-semibold">{t('communityFeedTitle')}</h2>
            <Card className="p-4 text-center">
                <CardDescription>
                    {t('communityFeedDescription')}
                </CardDescription>
                <Button asChild className="mt-2">
                    <Link href="/">{t('goToFeedButton')}</Link>
                </Button>
            </Card>
       </div>
    </div>
  );
}
