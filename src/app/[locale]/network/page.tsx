
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Search, UserPlus, Link as LinkIcon, UserCog, Users, Frown, Loader2, Brain } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProfilesFromDB } from "@/lib/server-actions";
import { useTranslations } from "next-intl";
import { useUserProfile } from '@/hooks/useUserProfile';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase/client";
import type { SuggestedConnectionsOutput } from "@/ai/flows/suggested-connections";

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
  const [interestFilter, setInterestFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // New state for AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const functions = getFunctions(firebaseApp);
  const sendConnectionRequestCallable = useMemo(() => httpsCallable(functions, 'sendConnectionRequest'), []);
  const suggestConnectionsCallable = useMemo(() => httpsCallable(functions, 'suggestConnections'), []);
  
  const interests = ['all', 'Grain Trading', 'Organic Inputs', 'Coffee Supply Chain', 'Precision Agriculture', 'Food Processing', 'Agri-Finance', 'Sustainable Sourcing', 'Cold Chain Logistics', 'Export Markets', 'Local Food Systems', 'Post-Harvest Technology', 'Water Management', 'Soil Health'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProfiles, suggestionsResult] = await Promise.all([
          getAllProfilesFromDB(),
          user ? suggestConnectionsCallable({ userId: user.uid, count: 3 }) : Promise.resolve(null)
        ]);

        setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
        
        if (suggestionsResult) {
            const data = suggestionsResult.data as SuggestedConnectionsOutput;
            setAiSuggestions(data.suggestions || []);
        }

      } catch (error) {
        console.error("Failed to load network data:", error);
        toast({ title: t('toast.errorTitle'), description: t('toast.loadError'), variant: "destructive" });
        setProfiles([]);
        setAiSuggestions([]);
      } finally {
        setIsLoading(false);
        setIsLoadingSuggestions(false);
      }
    };
    fetchData();
  }, [user, suggestConnectionsCallable, toast, t]);

  const handleConnect = async (recipientId: string) => {
    if (!user) {
        toast({ title: "Please sign in to connect.", variant: "destructive" });
        return;
    }
    setIsConnecting(recipientId);
    try {
        await sendConnectionRequestCallable({ recipientId });
        toast({ title: "Connection Request Sent!", description: "Your request has been sent to the user."});
        setAiSuggestions(prev => prev.filter(s => s.id !== recipientId)); // Optimistically remove from suggestions
    } catch (error: any) {
         toast({ title: "Could Not Send Request", description: error.message, variant: "destructive" });
    } finally {
        setIsConnecting(null);
    }
  };

  const filteredProfiles = useMemo(() => {
    if (!Array.isArray(profiles)) return [];

    return profiles.filter(profile => {
      if (!profile || profile.id === user?.uid) return false;
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = (profile.displayName || '').toLowerCase().includes(searchLower);
      const summaryMatch = (profile.profileSummary || '').toLowerCase().includes(searchLower);
      
      const userRoles = [profile.primaryRole, ...(profile.secondaryRoles || [])].filter(Boolean);
      const roleMatch = roleFilter === 'all' || userRoles.includes(roleFilter);
      
      const interestKeywords = interestFilter.toLowerCase().replace(/-/g, ' ').split(' ');
      const areasOfInterestLower = (Array.isArray(profile.areasOfInterest) ? profile.areasOfInterest.join(' ') : '').toLowerCase();
      const interestMatch = interestFilter === 'all' || interestKeywords.every(keyword => areasOfInterestLower.includes(keyword));
      
      const locationMatch = !locationFilter || (profile.location || '').toLowerCase().includes(locationLower);

      return (nameMatch || summaryMatch) && roleMatch && interestMatch && locationMatch;
    });
  }, [searchTerm, roleFilter, interestFilter, locationFilter, profiles, user]);

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
        </div>
      </div>

      {user && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/>{t('aiSuggestionsTitle')}</CardTitle>
                <CardDescription>{t('aiSuggestionsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingSuggestions ? (
                    Array.from({ length: 3 }).map((_, i) => <ProfileCardSkeleton key={`sugg-skel-${i}`} />)
                ) : aiSuggestions.length > 0 ? (
                    aiSuggestions.map(profile => (
                        <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow bg-primary/5">
                             <CardHeader className="items-center text-center">
                                <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile agriculture business" />
                                    <AvatarFallback className="text-3xl">{profile.name?.substring(0,1) ?? '?'}</AvatarFallback>
                                </Avatar>
                                <Link href={`/profiles/${profile.id}`}>
                                    <CardTitle className="text-lg hover:text-primary transition-colors">{profile.name}</CardTitle>
                                </Link>
                                <CardDescription className="flex items-center gap-2">
                                <StakeholderIcon role={profile.role} className="h-4 w-4 text-muted-foreground" />
                                {profile.role}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow text-center">
                                <p className="text-xs text-muted-foreground italic">"{profile.reason}"</p>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                                <Button className="w-full sm:flex-1" onClick={() => handleConnect(profile.id)} disabled={isConnecting === profile.id}>
                                    {isConnecting === profile.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <LinkIcon className="mr-2 h-4 w-4" />}
                                    {t('connect')}
                                </Button>
                                <Button variant="outline" className="w-full sm:flex-1" asChild>
                                    <Link href={`/profiles/${profile.id}`}><User className="mr-2 h-4 w-4" />{t('profile')}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8">
                        <p className="text-sm text-muted-foreground">{t('noSuggestions')}</p>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
      )}

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
            <div className="grid grid-cols-2 gap-2 lg:col-span-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter-network">
                  <SelectValue placeholder={t('rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  {STAKEHOLDER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && !profileLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            ) : (
                filteredProfiles.length > 0 ? filteredProfiles.map(profile => (
                <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                        <AvatarImage src={profile.avatarUrl} alt={profile.displayName} data-ai-hint="profile agriculture business" />
                        <AvatarFallback className="text-3xl">{profile.displayName?.substring(0,1) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <Link href={`/profiles/${profile.id}`}>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{profile.displayName}</CardTitle>
                    </Link>
                    <CardDescription className="flex items-center gap-2">
                      <StakeholderIcon role={profile.primaryRole} className="h-4 w-4 text-muted-foreground" />
                      {profile.primaryRole} - {profile.location}
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                        <Button className="w-full sm:flex-1" onClick={() => handleConnect(profile.id)} disabled={isConnecting === profile.id}>
                            {isConnecting === profile.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <LinkIcon className="mr-2 h-4 w-4" />}
                            {t('connect')}
                        </Button>
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
