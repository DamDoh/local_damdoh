
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Search, UserPlus, Link as LinkIcon, UserCog, Users, Frown, Loader2, Send, CheckCircle, Clock, MapPin, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { performSearch } from "@/lib/server-actions";
import { useTranslations } from "next-intl";
import { StakeholderIcon } from "@/components/icons/StakeholderIcon";
import { useAuth } from "@/lib/auth-utils";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';

function ProfileCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}


export default function NetworkPage() {
  const t = useTranslations('networkPage');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'connected' | 'pending_sent' | 'pending_received' | 'none'>>({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);

  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const sendConnectionRequestCallable = useMemo(() => httpsCallable(functions, 'sendConnectionRequest'), []);
  const sendInviteCallable = useMemo(() => httpsCallable(functions, 'sendInvite'), []);
  const getProfileStatusesCallable = useMemo(() => httpsCallable(functions, 'getProfileConnectionStatuses'), []);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const filters: { type: string, value: string }[] = [];
    if (roleFilter !== 'all') {
      filters.push({ type: 'category', value: roleFilter });
    }

    const searchPayload = {
      mainKeywords: searchTerm.split(' ').filter(Boolean),
      identifiedLocation: locationFilter,
      suggestedFilters: filters,
    };
    
    try {
      const results = await performSearch(searchPayload);
      const profilesArray = results.map((p: any) => ({
        ...p,
        id: p.itemId,
      }));
      setProfiles(profilesArray);

      if (user && profilesArray.length > 0) {
        setIsLoadingStatuses(true);
        const profileIds = profilesArray.map((p: UserProfile) => p.id);
        const statusesResult = await getProfileStatusesCallable({ profileIds });
        setConnectionStatuses(statusesResult.data as any);
        setIsLoadingStatuses(false);
      } else {
        setIsLoadingStatuses(false);
      }
    } catch (error) {
      console.error("Failed to load profiles:", error);
      toast({ title: t('toast.errorTitle'), description: t('toast.loadError'), variant: "destructive" });
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchTerm, roleFilter, locationFilter, getProfileStatusesCallable, toast, t]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);


  const handleConnect = async (recipientId: string) => {
    if (!user) {
        toast({ title: t('toast.connectError'), description: t('toast.signInToConnect'), variant: "destructive" });
        return;
    }
    setIsConnecting(recipientId);
    try {
        await sendConnectionRequestCallable({ recipientId });
        toast({ title: t('toast.requestSentTitle'), description: t('toast.requestSentDescription') });
        setConnectionStatuses(prev => ({...prev, [recipientId]: 'pending_sent'}));
    } catch (error: any) {
         toast({ title: t('toast.connectError'), description: error.message, variant: "destructive" });
    } finally {
        setIsConnecting(null);
    }
  };

  const handleInvite = async () => {
    const inviteeEmail = prompt(t('invite.prompt'));
    if (inviteeEmail) {
      try {
        await sendInviteCallable({ inviteeEmail });
        toast({
          title: t('invite.successTitle'),
          description: t('invite.successDescription', { email: inviteeEmail }),
        });
      } catch (error: any) {
        toast({
          title: t('invite.errorTitle'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };
  
  const ConnectButton = ({ profileId }: { profileId: string }) => {
    const status = connectionStatuses[profileId];

    if (isLoadingStatuses) {
        return <Skeleton className="h-10 w-full" />;
    }

    switch (status) {
        case 'connected':
            return <Button className="w-full sm:flex-1" variant="outline" disabled><CheckCircle className="mr-2 h-4 w-4" />{t('actions.connected')}</Button>;
        case 'pending_sent':
            return <Button className="w-full sm:flex-1" variant="outline" disabled><Clock className="mr-2 h-4 w-4" />{t('actions.pending')}</Button>;
        case 'pending_received':
             return <Button className="w-full sm:flex-1" asChild><Link href="/network/my-network">{t('actions.respond')}</Link></Button>;
        default:
            return (
                <Button className="w-full sm:flex-1" onClick={() => handleConnect(profileId)} disabled={isConnecting === profileId}>
                    {isConnecting === profileId ? <Loader2 className="h-4 w-4 animate-spin"/> : <LinkIcon className="mr-2 h-4 w-4" />}
                    {t('actions.connect')}
                </Button>
            );
    }
};

  const isAgent = currentUserProfile?.primaryRole === 'Field Agent/Agronomist (DamDoh Internal)' || currentUserProfile?.primaryRole === 'Admin';

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
            {currentUserProfile && (
                 <Button asChild>
                    <Link href="/network/my-network">
                        <Users className="mr-2 h-4 w-4" /> {t('myNetworkButton')}
                    </Link>
                </Button>
            )}
            {isAgent && (
                <Button asChild>
                    <Link href="/network/agent-tools">
                        <UserCog className="mr-2 h-4 w-4" /> {t('agentToolsButton')}
                    </Link>
                </Button>
            )}
             <Button onClick={handleInvite} variant="outline">
                <Send className="mr-2 h-4 w-4" />{t('invite.button')}
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('browseAllTitle')}</CardTitle>
            <CardDescription>{t('browseAllDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-network" className="sr-only">{t('searchPlaceholder')}</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-network"
                placeholder={t('searchPlaceholder')}
                className="pl-10" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
             <div className="relative">
               <Label htmlFor="location-filter-network" className="sr-only">{t('locationPlaceholder')}</Label>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location-filter-network"
                placeholder={t('locationPlaceholder')}
                className="pl-10"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="lg:col-span-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter-network">
                  <SelectValue placeholder={t('rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  {STAKEHOLDER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <StakeholderIcon role={role} className="h-4 w-4 text-muted-foreground" />
                        <span>{role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && !profileLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            ) : (
                profiles.length > 0 ? profiles.map(profile => (
                <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                        <AvatarImage src={profile.avatarUrl} alt={profile.displayName} data-ai-hint="profile agriculture person" />
                        <AvatarFallback className="text-3xl">{profile.displayName?.substring(0,1) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <Link href={`/profiles/${profile.id}`}>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{profile.displayName}</CardTitle>
                    </Link>
                    <CardDescription className="flex items-center gap-2">
                      <StakeholderIcon role={profile.primaryRole} className="h-4 w-4 text-muted-foreground" />
                      {profile.primaryRole}
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                        <ConnectButton profileId={profile.id} />
                        <Button variant="outline" className="w-full sm:flex-1" asChild>
                            <Link href={`/profiles/${profile.id}`}><User className="mr-2 h-4 w-4" />{t('profile')}</Link>
                        </Button>
                    </CardFooter>
                </Card>
                )) : (
                    <div className="col-span-full text-center py-16">
                        <Frown className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg text-muted-foreground">{t('noStakeholdersFound')}</p>
                        <p className="text-sm text-muted-foreground">{t('noStakeholdersHint')}</p>
                    </div>
                )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
