
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, Search, UserPlus, MessageSquare, Shuffle, MapPin, LinkIcon, UserCog, Users, Frown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProfilesFromDB } from "@/lib/db-utils";
import { useTranslations } from "next-intl";
import { useUserProfile } from '@/hooks/useUserProfile';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';

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

  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();
  
  const interests = ['all', 'Grain Trading', 'Organic Inputs', 'Coffee Supply Chain', 'Precision Agriculture', 'Food Processing', 'Agri-Finance', 'Sustainable Sourcing', 'Cold Chain Logistics', 'Export Markets', 'Local Food Systems', 'Post-Harvest Technology', 'Water Management', 'Soil Health'];

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const fetchedProfiles = await getAllProfilesFromDB();
        setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
      } catch (error) {
        console.error("Failed to load profiles:", error);
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);


  const filteredConnections = useMemo(() => {
    if (!Array.isArray(profiles)) return [];

    return profiles.filter(profile => {
      if (!profile) return false;
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = (profile.displayName || '').toLowerCase().includes(searchLower);
      const summaryMatch = (profile.profileSummary || '').toLowerCase().includes(searchLower);
      
      const userRoles = [profile.primaryRole, ...(profile.secondaryRoles || [])].filter(Boolean);
      const roleMatch = roleFilter === 'all' || userRoles.includes(roleFilter);
      
      const interestKeywords = interestFilter.toLowerCase().replace(/-/g, ' ').split(' ');
      const areasOfInterestLower = (Array.isArray(profile.areasOfInterest) ? profile.areasOfInterest : []).join(' ').toLowerCase();
      const interestMatch = interestFilter === 'all' || interestKeywords.every(keyword => areasOfInterestLower.includes(keyword));
      
      const locationMatch = !locationFilter || (profile.location || '').toLowerCase().includes(locationLower);

      return (nameMatch || summaryMatch) && roleMatch && interestMatch && locationMatch;
    });
  }, [searchTerm, roleFilter, interestFilter, locationFilter, profiles]);

  const isAgent = currentUserProfile?.primaryRole === 'Field Agent/Agronomist (DamDoh Internal)' || currentUserProfile?.primaryRole === 'Admin';


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <div className="flex gap-2">
                {currentUserProfile && (
                     <Button asChild>
                        <Link href="/network/my-network">
                            <Users className="mr-2 h-4 w-4" /> My Network
                        </Link>
                    </Button>
                )}
                {isAgent && (
                    <Button asChild>
                        <Link href="/network/agent-tools">
                            <UserCog className="mr-2 h-4 w-4" /> Agent Tools
                        </Link>
                    </Button>
                )}
                 <Button variant="outline"><Shuffle className="mr-2 h-4 w-4" />{t('refreshSuggestions')}</Button>
            </div>
          </div>
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
              <Select value={interestFilter} onValueChange={setInterestFilter}>
                <SelectTrigger id="interest-filter-network">
                  <SelectValue placeholder={t('interestPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {interests.map(interest => (
                    <SelectItem key={interest} value={interest.toLowerCase().replace(/ /g, '-')}>{interest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            ) : (
                filteredConnections.length > 0 ? filteredConnections.map(profile => (
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
                    <Button className="w-full sm:flex-1"><LinkIcon className="mr-2 h-4 w-4" />{t('connect')}</Button>
                    <Button variant="outline" className="w-full sm:flex-1"><MessageSquare className="mr-2 h-4 w-4" />{t('message')}</Button>
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
