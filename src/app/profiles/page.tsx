
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

// Dummy data for profiles - agriculture supply chain focus
const profiles: UserProfile[] = [
  { id: 'farmerJoe', name: 'Joe\'s Family Farm', role: 'Farmer', location: 'Iowa, USA', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Fifth-generation corn and soybean farmer. Implementing precision agriculture techniques. Seeking partners for sustainable inputs and direct buyers.', email: 'joe.farm@example.com' },
  { id: 'agriLogisticsCo', name: 'AgriLogistics Co-op', role: 'Collection Agent', location: 'Rural Hub, Kenya', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Farmer cooperative providing aggregation, warehousing, and transport services for smallholders. Connecting members to larger markets.', email: 'info@agrilogcoop.ke' },
  { id: 'freshFoodsProcessor', name: 'FreshFoods Processors Ltd.', role: 'Processor', location: 'Industrial Park, Vietnam', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Specializes in IQF fruits and vegetables for export. HACCP and GlobalG.A.P. certified. Seeking reliable farm suppliers.', email: 'sourcing@freshfoods.vn' },
  { id: 'globalCommoditiesTrader', name: 'Global Commodities Trading', role: 'Trader', location: 'Geneva, Switzerland', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'International trader of coffee, cocoa, and sugar. Focus on sustainable and traceable supply chains. Offers market insights.', email: 'trade@globalcommodities.ch' },
  { id: 'ecoHarvestRetail', name: 'EcoHarvest Grocers', role: 'Retailer', location: 'Urban Center, Canada', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Retail chain focused on organic and locally sourced produce. Building direct relationships with farmers and food artisans.', email: 'buyer@ecoharvest.ca' },
  { id: 'agriTechInnovator', name: 'Dr. Lena Hanson', role: 'Development Personnel', location: 'Wageningen University, NL', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Researcher in agricultural robotics and AI for crop monitoring. Open to industry collaborations and field trials.', email: 'lena.hanson@wur.nl' },
  { id: 'inputSolutionsInc', name: 'Input Solutions Inc.', role: 'Input Supplier', location: 'Midwest, USA', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Provider of certified seeds, organic fertilizers, and integrated pest management solutions. Technical support available.', email: 'sales@inputsolutions.ag' },
];

export default function ProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

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
  }, [searchTerm, roleFilter, locationFilter]);

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
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <CardDescription>{profile.role} - {profile.location}</CardDescription>
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
