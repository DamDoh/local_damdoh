
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { StakeholderIcon } from "@/components/icons/StakeholderIcon";
import { Filter, Search, UserPlus, MessageCircle, Shuffle, MapPin, LinkIcon, Frown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProfilesFromDB } from "@/lib/db-utils";
import React from "react";
import { useTranslation } from "react-i18next";

function ProfileCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center text-center">
        <Skeleton className="h-24 w-24 rounded-full mb-2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-center">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
        <Skeleton className="h-10 w-full sm:flex-1" />
        <Skeleton className="h-10 w-full sm:flex-1" />
      </CardFooter>
    </Card>
  );
}


export default function NetworkPage() {
  const { t } = useTranslation('common');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const fetchedProfiles = await getAllProfilesFromDB();
        setProfiles(fetchedProfiles);
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);


  const filteredConnections = useMemo(() => {
    return profiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = profile.displayName.toLowerCase().includes(searchLower);
      const summaryMatch = profile.profileSummary?.toLowerCase().includes(searchLower) || false;
      const roleMatch = roleFilter === 'all' || profile.primaryRole === roleFilter;
      const locationMatch = locationFilter === "" || (profile.location && profile.location.toLowerCase().includes(locationLower));

      return (nameMatch || summaryMatch) && roleMatch && locationMatch;
    });
  }, [searchTerm, roleFilter, locationFilter, profiles]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{t('profilesPage.title')}</CardTitle>
              <CardDescription>{t('profilesPage.description')}</CardDescription>
            </div>
             <Button variant="outline"><Shuffle className="mr-2 h-4 w-4" /> Refresh Suggestions</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-network" className="sr-only">Search Network</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-network"
                placeholder={t('profilesPage.searchPlaceholder')}
                className="pl-10" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
             <div className="relative">
               <Label htmlFor="location-filter-network" className="sr-only">Filter by location</Label>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location-filter-network"
                placeholder={t('profilesPage.locationPlaceholder')}
                className="pl-10"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 lg:col-span-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter-network">
                  <SelectValue placeholder={t('profilesPage.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('profilesPage.allRoles')}</SelectItem>
                  {STAKEHOLDER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            ) : (
                filteredConnections.map(profile => {
                    return (
                        <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader className="items-center text-center">
                                <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                                    <AvatarImage src={profile.photoURL} alt={profile.displayName} data-ai-hint="profile agriculture business" />
                                    <AvatarFallback className="text-3xl">{profile.displayName.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <Link href={`/profiles/${profile.id}`}>
                                    <CardTitle className="text-lg hover:text-primary transition-colors">{profile.displayName}</CardTitle>
                                </Link>
                                <CardDescription className="flex items-center gap-2">
                                    <StakeholderIcon role={profile.primaryRole} className="h-4 w-4" />
                                    <span>{profile.primaryRole} - {profile.location}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow text-center">
                            <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                            <Button className="w-full sm:flex-1"><LinkIcon className="mr-2 h-4 w-4" /> Connect</Button>
                            <Button variant="outline" className="w-full sm:flex-1"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
                            </CardFooter>
                        </Card>
                    )
                })
            )}
          </div>
          {filteredConnections.length === 0 && !isLoading && (
            <div className="text-center py-10 col-span-full">
              <Frown className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">{t('profilesPage.notFoundTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('profilesPage.notFoundDescription')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
