
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, PlusCircle, Search, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { dummyProfiles } from "@/lib/dummy-data"; // Import dummy data

export default function ProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  // Use imported dummyProfiles
  const profiles = dummyProfiles;

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = profile.name.toLowerCase().includes(searchLower);
      const summaryMatch = profile.profileSummary?.toLowerCase().includes(searchLower) || false;
      const roleMatch = roleFilter === 'all' || profile.role === roleFilter;
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
              <Link href="/profiles/create"> 
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your Stakeholder Profile
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
            {filteredProfiles.map(profile => (
              <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile agriculture person" />
                    <AvatarFallback>{profile.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    {/* Conceptual: Display user's name with a visual indicator for verified credentials */}
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    {/* Conceptual: Display user's role and location */}
                    <CardDescription>{profile.role} - {profile.location}</CardDescription>
                    {/* Conceptual: Display a summary of the user's reputation (e.g., average rating, score) */}
                    {/* <div className="text-sm text-yellow-500">
                      Rating: {profile.reputationScore}/5 ({profile.totalReviews} reviews) - Conceptual
                    </div> */}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/profiles/${profile.id}`}>View Profile & Connect</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredProfiles.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No stakeholder profiles found.</p>
              <p className="text-sm text-muted-foreground">Adjust your filters or broaden your search.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
