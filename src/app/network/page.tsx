
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, Search, UserPlus, MessageCircle, Shuffle, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

// Dummy data for suggested connections - replace with actual AI flow calls
const suggestedConnections: UserProfile[] = [
  { id: 'sc1', name: 'Dr. Eleanor Vance', role: 'Development Personnel', location: 'Field Research Station, IA', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Agronomist specializing in sustainable soil management and cover cropping. Offers consultancy for yield improvement.', email: 'eleanor.vance@agriresearch.org'},
  { id: 'sc2', name: 'Frank AgriCapital', role: 'Financial Institution', location: 'Metro Business District, NY', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Provides agricultural loans and financial planning for agribusinesses. Specialized in small farm funding & expansion projects.', email: 'frank@agricapital.com'},
  { id: 'sc3', name: 'Grace GlobalHarvest', role: 'Exporter', location: 'International Port, CA', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Facilitates export of specialty organic crops to Asian and European markets. Seeking reliable, quality-focused farm partners.', email: 'grace.h@globalharvest.com'},
  { id: 'sc4', name: 'Henry FarmServices', role: 'Pre-Harvest Contractor', location: 'Rural Services Hub, GA', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Offers precision planting, drone-based pest scouting, and custom harvesting services with modern equipment.', email: 'henry@farmservices.pro'},
  { id: 'sc5', name: 'Isabelle SeedSupply Co.', role: 'Input Supplier', location: 'Agri Supply Hub, Midwest', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Distributor of certified organic seeds, bio-fertilizers, and advanced irrigation systems for sustainable farming.', email: 'isabelle@seedsupplyco.com'},
];

const interests = ['All', 'Crop Farming', 'Livestock Management', 'Aquaculture', 'Agri-Tech', 'Organic Farming', 'Export Markets', 'Local Food Systems', 'Soil Health', 'Pest Control Innovation', 'Water Conservation', 'Sustainable Agriculture'];

export default function NetworkPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredConnections = useMemo(() => {
    return suggestedConnections.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      const locationLower = locationFilter.toLowerCase();

      const nameMatch = profile.name.toLowerCase().includes(searchLower);
      const roleMatch = roleFilter === 'all' || profile.role === roleFilter;
      // Enhanced interest matching: check if any part of the summary includes the interest keyword.
      // Replaces '-' with space for multi-word interests from the filter.
      const interestKeywords = interestFilter.toLowerCase().replace('-', ' ').split(' ');
      const summaryLower = profile.profileSummary?.toLowerCase() || "";
      const interestMatch = interestFilter === 'all' || interestKeywords.every(keyword => summaryLower.includes(keyword));
      
      const locationMatch = locationFilter === "" || profile.location.toLowerCase().includes(locationLower);

      return nameMatch && roleMatch && interestMatch && locationMatch;
    });
  }, [searchTerm, roleFilter, interestFilter, locationFilter, suggestedConnections]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Expand Your Network</CardTitle>
              <CardDescription>Discover AI-powered connection suggestions tailored to your profile and agricultural interests.</CardDescription>
            </div>
             <Button variant="outline"><Shuffle className="mr-2 h-4 w-4" /> Refresh Suggestions</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative lg:col-span-2">
              <Label htmlFor="search-network" className="sr-only">Search Network</Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search-network"
                placeholder="Search by name, role, or agricultural focus..." 
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
                placeholder="Filter by location (e.g., region, state)" 
                className="pl-10"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 lg:col-span-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter-network">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {STAKEHOLDER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={interestFilter} onValueChange={setInterestFilter}>
                <SelectTrigger id="interest-filter-network">
                  <SelectValue placeholder="Filter by interest" />
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
            {filteredConnections.map(profile => (
              <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="items-center text-center">
                  <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile person agriculture" />
                    <AvatarFallback className="text-3xl">{profile.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profiles/${profile.id}`}>
                    <CardTitle className="text-lg hover:text-primary transition-colors">{profile.name}</CardTitle>
                  </Link>
                  <CardDescription>{profile.role} - {profile.location}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                  <Button className="w-full sm:flex-1"><UserPlus className="mr-2 h-4 w-4" /> Connect</Button>
                  <Button variant="outline" className="w-full sm:flex-1"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredConnections.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No connection suggestions matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or complete your profile for better recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
