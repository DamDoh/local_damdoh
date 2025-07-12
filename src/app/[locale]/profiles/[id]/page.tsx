

"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QRCode from 'qrcode.react';

import type { UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/auth-utils";
import { getProfileByIdFromDB } from "@/lib/server-actions";
import { APP_NAME } from "@/lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, MapPin, MessageSquare, Link as LinkIcon, Edit, TrendingUp, Leaf, Tractor, Globe, ArrowLeft, FileText, QrCode, Activity, GitBranch, ShoppingCart, CircleDollarSign, Eye, ThumbsUp, MessagesSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { StakeholderIcon } from "@/components/icons/StakeholderIcon";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="relative p-6">
            <div className="absolute top-[-50px]">
                <Skeleton className="h-32 w-32 rounded-full border-4 border-background"/>
            </div>
            <div className="pt-[72px]">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
        <CardContent className="px-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const activityIconMap: Record<string, React.ElementType> = {
    MessageSquare,
    ShoppingCart,
    CircleDollarSign,
    GitBranch,
};

interface EngagementStats {
    profileViews: number;
    postLikes: number;
    postComments: number;
}

export default function ProfileDetailPage() {
  const t = useTranslations('ProfilePage');
  const params = useParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  const functions = getFunctions(firebaseApp);
  const getUserActivity = useMemo(() => httpsCallable(functions, 'getUserActivity'), [functions]);
  const logProfileViewCallable = useMemo(() => httpsCallable(functions, 'logProfileView'), [functions]);
  const getEngagementStatsCallable = useMemo(() => httpsCallable(functions, 'getUserEngagementStats'), []);
  const sendInviteCallable = useMemo(() => httpsCallable(functions, 'sendInvite'), [functions]);
  
  useEffect(() => {
    const profileIdParam = params.id as string;
    let idToFetch: string | null = null;

    if (authLoading) {
      return; 
    }

    if (profileIdParam === 'me') {
      if (authUser) {
        idToFetch = authUser.uid;
      } else {
        router.push('/auth/signin');
        return;
      }
    } else {
      idToFetch = profileIdParam;
    }

    if (idToFetch) {
      setIsLoading(true);
      getProfileByIdFromDB(idToFetch)
        .then(fetchedProfile => {
          setProfile(fetchedProfile);
          if (fetchedProfile) {
            // Log the profile view if applicable
            if (authUser && fetchedProfile.id !== authUser.uid) {
                logProfileViewCallable({ viewedId: fetchedProfile.id }).catch(err => console.error("Failed to log profile view:", err));
            }
            
            // Fetch activity
            setIsActivityLoading(true);
            getUserActivity({ userId: fetchedProfile.id })
              .then(result => {
                  setActivity((result.data as any).activities || []);
              })
              .catch(err => console.error("Failed to fetch activity:", err));
              
            // Fetch stats
            getEngagementStatsCallable({ userId: fetchedProfile.id })
              .then(result => {
                  setStats(result.data as EngagementStats);
              })
              .catch(err => console.error("Failed to fetch stats:", err))
              .finally(() => setIsActivityLoading(false));

          }
        })
        .catch(error => {
          console.error("Error fetching profile:", error);
          setProfile(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [params.id, authUser, authLoading, router, getUserActivity, logProfileViewCallable, getEngagementStatsCallable]);
  
  const handleInvite = async () => {
    const inviteeEmail = prompt(t('invitePrompt'));
    if (inviteeEmail) {
      try {
        await sendInviteCallable({ inviteeEmail });
        toast({
          title: t('inviteSuccessTitle'),
          description: t('inviteSuccessDescription', { email: inviteeEmail }),
        });
      } catch (error: any) {
        toast({
          title: t('inviteErrorTitle'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };


  if (isLoading || authLoading) {
    return <ProfileSkeleton />;
  }
  
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notFoundTitle')}</CardTitle>
          <CardDescription>{t('notFoundDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/network"><ArrowLeft className="h-4 w-4 mr-2" />{t('backToNetwork')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCurrentUserProfile = authUser?.uid === profile.id;
  const qrCodeValue = profile.universalId ? `${window.location.origin}/profiles/${profile.id}` : 'error';
  
  const areasOfInterest = (profile as any)?.areasOfInterest;
  const needs = (profile as any)?.needs;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
           <Image 
            src={profile.bannerUrl || `https://placehold.co/1200x300.png?text=${encodeURIComponent(profile.displayName)}`} 
            alt={`${profile.displayName} banner`} 
            fill={true}
            style={{objectFit:"cover"}}
            priority
            data-ai-hint={profile.primaryRole ? `${profile.primaryRole.toLowerCase()} agriculture background` : "agriculture background"} />
          <div className="absolute bottom-[-50px] left-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} data-ai-hint="profile business food" />
              <AvatarFallback className="text-4xl">{profile.displayName.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardHeader className="pt-[60px] px-6"> 
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{profile.displayName}</CardTitle>
              <CardDescription className="text-lg flex items-center gap-2">
                <StakeholderIcon role={profile.primaryRole} className="h-5 w-5 text-muted-foreground" />
                {profile.primaryRole}
              </CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isCurrentUserProfile ? (
                <>
                  <Button asChild><Link href={`/profiles/me/edit`}><Edit className="mr-2 h-4 w-4" /> {t('editProfile')}</Link></Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> {t('showUniversalIdButton')}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                            <DialogTitle className="text-center">{t('universalIdModalTitle')}</DialogTitle>
                            <DialogDescription className="text-center">
                                {t('universalIdModalDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-white rounded-lg border shadow-md">
                                <QRCode value={qrCodeValue} size={200} />
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{profile.universalId}</p>
                        </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <>
                  <Button><LinkIcon className="mr-2 h-4 w-4" /> {t('connect')}</Button>
                  <Button asChild variant="outline"><Link href={`/messages?with=${profile.id}`}><MessageSquare className="mr-2 h-4 w-4" />{t('message')}</Link></Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          {profile.profileSummary && (
            <p className="text-muted-foreground max-w-2xl">{profile.profileSummary}</p>
          )}
        </CardContent>
      </Card>
      
      {isCurrentUserProfile && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />{t('invite.title')}</CardTitle>
                <CardDescription>{t('invite.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('invite.explanation')}</p>
                <Button onClick={handleInvite}>{t('invite.button')}</Button>
            </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                 {profile.bio && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" />{t('aboutTitle', {displayName: profile.displayName})}</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p></CardContent>
                    </Card>
                 )}
                 {Array.isArray(areasOfInterest) && areasOfInterest.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center"><Tractor className="h-5 w-5 mr-2 text-primary" />{t('interestsTitle')}</CardTitle></CardHeader>
                        <CardContent><div className="flex flex-wrap gap-2">{areasOfInterest.map((interest: string) => <Badge key={interest} variant="secondary">{interest}</Badge>)}</div></CardContent>
                    </Card>
                  )}
            </div>
             <div className="space-y-6">
                 {stats && (
                     <Card>
                        <CardHeader><CardTitle className="text-lg">{t('engagementStats')}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm flex items-center justify-between"><span className="flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground"/>{t('profileViews')}</span> <strong>{stats.profileViews}</strong></div>
                            <div className="text-sm flex items-center justify-between"><span className="flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-muted-foreground"/>{t('postLikes')}</span> <strong>{stats.postLikes}</strong></div>
                            <div className="text-sm flex items-center justify-between"><span className="flex items-center gap-2"><MessagesSquare className="h-4 w-4 text-muted-foreground"/>{t('postComments')}</span> <strong>{stats.postComments}</strong></div>
                        </CardContent>
                     </Card>
                 )}
                 {profile.contactInfo && (Object.values(profile.contactInfo).some(val => val)) && (
                     <Card>
                        <CardHeader><CardTitle className="text-lg">{t('contactTitle')}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {profile.contactInfo.phone && <div className="text-sm flex items-start gap-3"><MessageSquare className="h-4 w-4 mt-1 text-primary" /><span>{profile.contactInfo.phone}</span></div>}
                             {profile.contactInfo.website && <div className="text-sm flex items-start gap-3"><Globe className="h-4 w-4 mt-1 text-primary" /><a href={profile.contactInfo.website.startsWith('http') ? profile.contactInfo.website : `https://${profile.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline break-all">{profile.contactInfo.website}</a></div>}
                        </CardContent>
                     </Card>
                 )}
                 {Array.isArray(needs) && needs.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />{t('needsTitle')}</CardTitle></CardHeader>
                        <CardContent><div className="flex flex-wrap gap-2">{needs.map((need: string) => <Badge key={need}>{need}</Badge>)}</div></CardContent>
                    </Card>
                  )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/>{t('recentActivityTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                {isActivityLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : activity.length > 0 ? (
                    <div className="space-y-3">
                        {activity.map(act => {
                            const Icon = activityIconMap[act.icon] || GitBranch;
                            return (
                                <div key={act.id} className="flex items-start gap-3 p-3 border rounded-md bg-muted/40">
                                    <div className="p-2 bg-background rounded-full border">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{act.title}</p>
                                        <p className="text-xs text-muted-foreground">{act.type} &bull; {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noRecentActivity')}</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
