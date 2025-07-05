
"use client"; 

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Users, Newspaper, CalendarDays, BarChart2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-utils";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";


export function DashboardLeftSidebar() {
  const { toast } = useToast();
  const { profile, loading } = useUserProfile();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<{ profileViews: number, postLikes: number, postComments: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);


  useEffect(() => {
    if (user) {
        const getStatsCallable = httpsCallable(functions, 'getUserEngagementStats');
        getStatsCallable()
            .then(result => {
                setStats(result.data as any);
            })
            .catch(error => {
                console.error("Error fetching stats:", error);
                // Don't show a toast for this, just fail gracefully
                setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
            })
            .finally(() => {
                setIsLoadingStats(false);
            });
    } else {
        setIsLoadingStats(false);
        setStats({ profileViews: 0, postLikes: 0, postComments: 0 }); 
    }
  }, [user]);


  const handleTryProClick = () => {
    toast({
      title: "DamDoh Pro",
      description: "Premium features and analytics are coming soon!",
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
  
  const totalEngagements = (stats?.postLikes || 0) + (stats?.postComments || 0);

  return (
    <div className="space-y-4 sticky top-20">
      <Card>
        <CardContent className="pt-6 text-center">
          <Link href="/profiles/me">
            <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary cursor-pointer">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} data-ai-hint="profile agriculture" />
              <AvatarFallback>{profile?.displayName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{profile?.displayName || 'Your Name'}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{profile?.profileSummary || 'Your Headline'}</p>
          <p className="text-xs text-muted-foreground mt-1">{profile?.location || 'Your Location'}</p>
          <Link href="/profiles/me" className="text-xs text-primary hover:underline block mt-1">
            My DamDoh Stakeholder Profile
          </Link>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          {isLoadingStats ? (
            <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
                <div className="flex justify-between items-center p-1 rounded-sm">
                    <span>Profile viewers</span>
                    <span className="text-primary font-semibold">{stats?.profileViews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-1 rounded-sm">
                    <span>Post engagements</span>
                    <span className="text-primary font-semibold">{totalEngagements}</span>
                </div>
            </>
          )}
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs">
          <p className="text-muted-foreground">Unlock premium supply chain analytics & tools</p>
          <Button variant="link" className="p-0 h-auto text-xs font-semibold" onClick={handleTryProClick}>
            <BarChart2 className="h-3 w-3 mr-1 text-accent" /> Try DamDoh Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-md font-semibold">Recent</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1 text-sm">
          <Link href="/pinboard" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Bookmark className="h-4 w-4" /> My Pin Board
          </Link>
          <Link href="/groups" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" /> Community Groups
          </Link>
          <Link href="/industry-news" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Newspaper className="h-4 w-4" /> Industry News & Reports
          </Link>
          <Link href="/agri-events" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-4 w-4" /> Agri-Business Events
          </Link>
           <Link href="/network" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Link2 className="h-4 w-4" /> My Supply Chain Network
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
