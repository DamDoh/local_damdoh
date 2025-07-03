
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import type { UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/auth-utils";
import { getProfileByIdFromDB } from "@/lib/db-utils";
import { APP_NAME } from "@/lib/constants";
import { StakeholderIcon } from "@/components/icons/StakeholderIcon";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, MessageCircle, Link as LinkIcon, Edit, TrendingUp, Leaf, Tractor, Globe, ArrowLeft, Star, FileText } from "lucide-react";
import React from 'react';
import { useTranslation } from "react-i18next";


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

export default function ProfileDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [params.id, authUser, authLoading, router]);

  if (isLoading || authLoading) {
    return <ProfileSkeleton />;
  }
  
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>Sorry, we couldn't find a profile for the requested user.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/network"><ArrowLeft className="h-4 w-4 mr-2" />Back to Network</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCurrentUserProfile = authUser?.uid === profile.id;

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
              <AvatarImage src={profile.photoURL} alt={profile.displayName} data-ai-hint="profile business food" />
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
                <Button asChild><Link href={`/profiles/me/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link></Button>
              ) : (
                <>
                  <Button><LinkIcon className="mr-2 h-4 w-4" /> Connect</Button>
                  <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 space-y-6">
          {profile.profileSummary && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Leaf className="h-5 w-5 mr-2 text-primary" /> Summary</h3>
              <p className="text-muted-foreground">{profile.profileSummary}</p>
            </div>
          )}
          
          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" />About</h3>
              <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(profile.profileData as any)?.yearsOfExperience !== undefined && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Industry Experience</h4>
                  <p className="text-muted-foreground">{(profile.profileData as any).yearsOfExperience} years</p>
                </div>
              </div>
            )}
             {profile.contactInfo?.email && (
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Business Email</h4>
                  <a href={`mailto:${profile.contactInfo.email}`} className="text-muted-foreground hover:underline">{profile.contactInfo.email}</a>
                </div>
              </div>
            )}
            {profile.contactInfo?.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Website</h4>
                  <a href={profile.contactInfo.website.startsWith('http') ? profile.contactInfo.website : `https://${profile.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">{profile.contactInfo.website}</a>
                </div>
              </div>
            )}
          </div>

          {profile.areasOfInterest && profile.areasOfInterest.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tractor className="h-5 w-5 mr-2 text-primary" />Areas of Expertise & Interest</h3>
              <div className="flex flex-wrap gap-2">
                {profile.areasOfInterest.map((interest: string) => <Badge key={interest} variant="secondary">{interest}</Badge>)}
              </div>
            </div>
          )}

          {profile.needs && profile.needs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Actively Seeking / Offering</h3>
              <div className="flex flex-wrap gap-2">
                {profile.needs.map((need: string) => <Badge key={need}>{need}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>This user's recent contributions to the {APP_NAME} network.</CardDescription>
        </CardHeader>
        <CardContent>
             <p className="text-muted-foreground italic text-sm">Recent activity feed for this user will be displayed here. (Feature coming soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
