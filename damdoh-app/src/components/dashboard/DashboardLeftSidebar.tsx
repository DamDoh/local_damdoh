
"use client"; 

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Users, Newspaper, CalendarDays, BarChart2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "../ui/skeleton";
import { useTranslation } from "react-i18next";

export function DashboardLeftSidebar() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const { profile, loading } = useUserProfile();

  const handleTryProClick = () => {
    toast({
      title: t('dashboard.leftSidebar.proTitle'),
      description: t('dashboard.leftSidebar.proDescription'),
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 sticky top-20">
        <Card>
          <CardContent className="pt-6 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-1" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardContent>
          <hr/>
          <CardContent className="text-xs space-y-2 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sticky top-20">
      <Card>
        <CardContent className="pt-6 text-center">
          <Link href="/profiles/me">
            <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary cursor-pointer">
              <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || ''} data-ai-hint="profile agriculture" />
              <AvatarFallback>{profile?.displayName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{profile?.displayName || t('dashboard.leftSidebar.yourName')}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{profile?.profileSummary || t('dashboard.leftSidebar.yourHeadline')}</p>
          <p className="text-xs text-muted-foreground mt-1">{profile?.location || t('dashboard.leftSidebar.yourLocation')}</p>
          <Link href="/profiles/me" className="text-xs text-primary hover:underline block mt-1">
            {t('dashboard.leftSidebar.myProfileLink')}
          </Link>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          <div className="flex justify-between items-center p-1 rounded-sm">
            <span>{t('dashboard.leftSidebar.profileViewers')}</span>
            <span className="text-primary font-semibold">48</span>
          </div>
          <div className="flex justify-between items-center p-1 rounded-sm">
            <span>{t('dashboard.leftSidebar.postImpressions')}</span>
            <span className="text-primary font-semibold">230</span>
          </div>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs">
          <p className="text-muted-foreground">{t('dashboard.leftSidebar.proUnlock')}</p>
          <Button variant="link" className="p-0 h-auto text-xs font-semibold" onClick={handleTryProClick}>
            <BarChart2 className="h-3 w-3 mr-1 text-accent" /> {t('dashboard.leftSidebar.tryPro')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-md font-semibold">{t('dashboard.leftSidebar.recentTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1 text-sm">
          <Link href="/pinboard" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Bookmark className="h-4 w-4" /> {t('dashboard.leftSidebar.pinboard')}
          </Link>
          <Link href="/forums" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" /> {t('dashboard.leftSidebar.forums')}
          </Link>
          <Link href="/industry-news" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Newspaper className="h-4 w-4" /> {t('dashboard.leftSidebar.news')}
          </Link>
          <Link href="/agri-events" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-4 w-4" /> {t('dashboard.leftSidebar.events')}
          </Link>
           <Link href="/network" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Link2 className="h-4 w-4" /> {t('dashboard.leftSidebar.network')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
