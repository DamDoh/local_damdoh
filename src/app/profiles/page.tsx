
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, PlusCircle, Search, MapPin, Frown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProfilesFromDB } from "@/lib/db-utils";

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

export default function ProfilesPage() {
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

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();
      
      const nameMatch = profile.name.toLowerCase().includes(searchLower);
      const summaryMatch = profile.profileSummary?.toLowerCase().includes(searchLower) || false;
      // Ensure roles is an array before checking
      const roles = Array.isArray(profile.roles) ? profile.roles : (profile.role ? [profile.role] : []);
      const roleMatch = roleFilter === 'all' || roles.includes(roleFilter);
      const locationMatch = locationFilter === "" || profile.location.toLowerCase().includes(locationLower);
      
      return (nameMatch || summaryMatch) && roleMatch && locationMatch;
    });
  }, [searchTerm, roleFilter, locationFilter, profiles]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agricultural Stakeholder Directory</CardTitle>
              <CardDescription>Find and connect with participants across the entire agricultural value chain.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/profiles/me/edit"> 
                <PlusCircle className="mr-2 h-4 w-4" /> Create/Edit Your Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-profiles" className="sr-only">Search Profiles</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-profiles"
                placeholder="Search by name, specialty, or supply chain role..." 
                className="pl-10" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Label htmlFor="location-filter-profiles" className="sr-only">Filter by location</Label>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location-filter-profiles"
                placeholder="Filter by country, region, or city" 
                className="pl-10"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter-profiles">
                <SelectValue placeholder="Filter by stakeholder role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {STAKEHOLDER_ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            ) : filteredProfiles.length > 0 ? (
              filteredProfiles.map(profile => (
                <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile agriculture person" />
                      <AvatarFallback>{profile.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription>{Array.isArray(profile.roles) ? profile.roles.join(', ') : profile.role} - {profile.location}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{profile.profileSummary}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/profiles/${profile.id}`}>View Profile & Connect</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
                <div className="col-span-full text-center py-16">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">No stakeholder profiles found.</p>
                    <p className="text-sm text-muted-foreground">Adjust your filters or broaden your search.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
