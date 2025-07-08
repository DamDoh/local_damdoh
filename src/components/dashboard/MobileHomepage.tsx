
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { mobileHomeCategories, mobileDiscoverItems } from '@/lib/dummy-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile"; // Assuming this hook provides user profile data including displayName
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';

export function MobileHomepage() {
  const { profile, loading } = useUserProfile();
  const t = useTranslations('MobileHomepage');

  const welcomeMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t('welcome.morning', { name: profile?.displayName?.split(' ')[0] || '' });
    if (hours < 18) return t('welcome.afternoon', { name: profile?.displayName?.split(' ')[0] || '' });
    return t('welcome.evening', { name: profile?.displayName?.split(' ')[0] || '' });
  };

  return (
    <div className="space-y-6">
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
            {mobileDiscoverItems.map((item) => (
                <Card key={item.id} className="w-40 shrink-0 overflow-hidden">
                    <div className="relative h-24">
                        <Image src={item.imageUrl} alt={item.title} fill style={{objectFit: 'cover'}} data-ai-hint={item.dataAiHint} />
                    </div>
                    <CardContent className="p-2">
                        <p className="text-xs font-semibold line-clamp-2">{item.title}</p>
                        <p className="text-xs text-primary">{item.type}</p>
                    </CardContent>
                </Card>
            ))}
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
                    <Link href="/#feed">{t('goToFeedButton')}</Link>
                </Button>
            </Card>
       </div>
    </div>
  );
}
